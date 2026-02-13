import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getWsUrl } from '../config/env'
import type { LastWrittenSizes } from '../lib/orderbook'
import { parseAndEnrichRawOrderbook } from '../lib/orderbook'
import { queryKeys } from '../lib/queryKeys'
import {
  DEFAULTS,
  ORDERBOOK_THROTTLE_MS,
  RECONNECT,
  tierToSubscription,
} from '../utils/constants'
import type {
  Coin,
  L2BookSubscriptionPayload,
  PrecisionTier,
} from '../types'

const getRetryDelayMs = (attempt: number): number =>
  Math.min(
    RECONNECT.initialDelayMs * 2 ** attempt,
    RECONNECT.maxDelayMs,
  )

/** All mutable socket state kept in one ref for clear lifecycle and cleanup. */
interface SocketRefs {
  ws: WebSocket | null
  reconnectAttempts: number
  connect: () => void
  coin: Coin
  tier: PrecisionTier
  subscribed: { coin: Coin; tier: PrecisionTier } | null
  lastSubscription: L2BookSubscriptionPayload | null
  /** Raw message pending throttle flush (deferred parse). */
  pendingRaw: { raw: string; coin: Coin; tier: PrecisionTier } | null
  lastWrittenSizes: LastWrittenSizes | null
  /** Timestamp of last l2Book message (heartbeat). */
  lastMessageAt: number
}

const createInitialRefs = (
  coin: Coin,
  tier: PrecisionTier,
): SocketRefs => ({
  ws: null,
  reconnectAttempts: 0,
  connect: () => {},
  coin,
  tier,
  subscribed: null,
  lastSubscription: null,
  pendingRaw: null,
  lastWrittenSizes: null,
  lastMessageAt: Date.now(),
})

export const useOrderbookSocket = (
  coin: Coin = DEFAULTS.coin,
  tier: PrecisionTier = DEFAULTS.precisionTier,
): { retry: () => void } => {
  const queryClient = useQueryClient()
  const refs = useRef<SocketRefs>(createInitialRefs(coin, tier))
  refs.current.coin = coin
  refs.current.tier = tier

  const retry = (): void => {
    refs.current.reconnectAttempts = 0
    refs.current.connect()
  }

  /**
   * Main connection effect. Timers: throttle interval (flush), connect timeout,
   * heartbeat interval. All cleared in effect cleanup and on reconnect.
   */
  useEffect(() => {
    let cancelled = false
    let connectTimeoutId: ReturnType<typeof window.setTimeout> | null = null
    let heartbeatIntervalId: ReturnType<typeof window.setInterval> | null = null

    const flushPending = (): void => {
      if (cancelled) return
      const pending = refs.current.pendingRaw
      if (pending === null) return
      refs.current.pendingRaw = null

      const result = parseAndEnrichRawOrderbook(
        pending.raw,
        refs.current.lastWrittenSizes,
      )
      if (result === null) {
        if (import.meta.env.DEV) {
          console.warn(
            '[Orderbook] Invalid message (parse failed):',
            pending.raw?.slice(0, 200),
          )
        }
        return
      }
      queryClient.setQueryData(
        queryKeys.orderbook(pending.coin, pending.tier),
        result.data,
      )
      refs.current.lastWrittenSizes = result.nextLastSizes
    }

    const intervalId = window.setInterval(flushPending, ORDERBOOK_THROTTLE_MS)

    const connect = (): void => {
      if (cancelled) return

      if (connectTimeoutId != null) {
        window.clearTimeout(connectTimeoutId)
        connectTimeoutId = null
      }
      if (heartbeatIntervalId != null) {
        window.clearInterval(heartbeatIntervalId)
        heartbeatIntervalId = null
      }

      queryClient.setQueryData(queryKeys.connection, {
        status: 'connecting',
        lastConnected: null,
        reconnectAttempts: refs.current.reconnectAttempts,
      })

      const ws = new WebSocket(getWsUrl())
      refs.current.ws = ws

      connectTimeoutId = window.setTimeout(() => {
        connectTimeoutId = null
        if (cancelled) return
        if (ws.readyState === WebSocket.CONNECTING) ws.close()
      }, RECONNECT.connectTimeoutMs)

      ws.onopen = () => {
        if (cancelled) return
        if (connectTimeoutId != null) {
          window.clearTimeout(connectTimeoutId)
          connectTimeoutId = null
        }

        refs.current.reconnectAttempts = 0
        refs.current.lastMessageAt = Date.now()

        queryClient.setQueryData(queryKeys.connection, {
          status: 'connected',
          lastConnected: Date.now(),
          reconnectAttempts: refs.current.reconnectAttempts,
        })

        const c = refs.current.coin
        const t = refs.current.tier
        const alreadySubscribed =
          refs.current.subscribed?.coin === c && refs.current.subscribed?.tier === t
        if (alreadySubscribed) return

        const params = tierToSubscription(t)
        const subscription: L2BookSubscriptionPayload = {
          type: 'l2Book',
          coin: c,
          ...params,
        }
        ws.send(JSON.stringify({ method: 'subscribe', subscription }))
        refs.current.subscribed = { coin: c, tier: t }
        refs.current.lastSubscription = subscription

        heartbeatIntervalId = window.setInterval(() => {
          const silentMs = Date.now() - refs.current.lastMessageAt
          if (silentMs >= RECONNECT.heartbeatTimeoutMs) ws.close()
        }, RECONNECT.heartbeatTimeoutMs)
      }

      ws.onmessage = (event: MessageEvent<string>) => {
        if (cancelled) return
        refs.current.lastMessageAt = Date.now()
        const raw = event.data
        if (!raw.includes('"l2Book"')) return
        refs.current.pendingRaw = {
          raw,
          coin: refs.current.coin,
          tier: refs.current.tier,
        }
      }

      ws.onerror = () => {
        if (cancelled) return
        queryClient.setQueryData(queryKeys.connection, {
          status: 'disconnected',
          lastConnected: Date.now(),
          reconnectAttempts: refs.current.reconnectAttempts,
        })
      }

      ws.onclose = () => {
        if (cancelled) return
        refs.current.ws = null
        refs.current.subscribed = null
        refs.current.lastSubscription = null

        if (heartbeatIntervalId != null) {
          window.clearInterval(heartbeatIntervalId)
          heartbeatIntervalId = null
        }

        queryClient.setQueryData(queryKeys.connection, {
          status: 'disconnected',
          lastConnected: Date.now(),
          reconnectAttempts: refs.current.reconnectAttempts,
        })

        if (refs.current.reconnectAttempts >= RECONNECT.maxAttempts) {
          queryClient.setQueryData(queryKeys.connection, {
            status: 'error',
            lastConnected: Date.now(),
            reconnectAttempts: refs.current.reconnectAttempts,
          })
          return
        }

        const timeoutMs = getRetryDelayMs(refs.current.reconnectAttempts)
        refs.current.reconnectAttempts += 1
        window.setTimeout(connect, timeoutMs)
      }
    }

    refs.current.connect = connect
    connect()

    const handleVisibilityChange = (): void => {
      if (cancelled) return
      if (document.hidden) {
        const current = refs.current.ws
        const lastSub = refs.current.lastSubscription
        if (current?.readyState === WebSocket.OPEN) {
          try {
            if (lastSub) {
              current.send(
                JSON.stringify({ method: 'unsubscribe', subscription: lastSub }),
              )
            }
          } catch {
            // ignore
          } finally {
            current.close()
          }
        }
        refs.current.ws = null
        refs.current.subscribed = null
        refs.current.lastSubscription = null
        queryClient.setQueryData(queryKeys.connection, {
          status: 'disconnected',
          lastConnected: Date.now(),
          reconnectAttempts: 0,
        })
      } else {
        refs.current.reconnectAttempts = 0
        connect()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (connectTimeoutId != null) {
        window.clearTimeout(connectTimeoutId)
        connectTimeoutId = null
      }
      if (heartbeatIntervalId != null) {
        window.clearInterval(heartbeatIntervalId)
        heartbeatIntervalId = null
      }
      window.clearInterval(intervalId)

      const current = refs.current.ws
      const lastSub = refs.current.lastSubscription
      refs.current.ws = null
      refs.current.subscribed = null
      refs.current.lastSubscription = null

      if (current?.readyState === WebSocket.OPEN) {
        try {
          if (lastSub) {
            current.send(
              JSON.stringify({ method: 'unsubscribe', subscription: lastSub }),
            )
          }
        } catch {
          // ignore
        } finally {
          current.close()
        }
      }
    }
  }, [queryClient])

  useEffect(() => {
    const ws = refs.current.ws
    if (ws?.readyState !== WebSocket.OPEN) return

    const alreadySubscribed =
      refs.current.subscribed?.coin === coin && refs.current.subscribed?.tier === tier
    if (alreadySubscribed) return

    refs.current.pendingRaw = null
    refs.current.lastWrittenSizes = null
    queryClient.setQueryData(queryKeys.orderbook(coin, tier), null)

    const lastSub = refs.current.lastSubscription
    if (lastSub) {
      try {
        ws.send(JSON.stringify({ method: 'unsubscribe', subscription: lastSub }))
      } catch {
        // ignore
      }
    }

    const params = tierToSubscription(tier)
    const subscription: L2BookSubscriptionPayload = {
      type: 'l2Book',
      coin,
      ...params,
    }
    ws.send(JSON.stringify({ method: 'subscribe', subscription }))
    refs.current.subscribed = { coin, tier }
    refs.current.lastSubscription = subscription
  }, [coin, tier, queryClient])

  return { retry }
}
