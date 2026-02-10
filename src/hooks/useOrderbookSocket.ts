import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  DEFAULTS,
  RECONNECT,
  precisionLevelToSubscription,
} from '../utils/constants'
import { processOrderbookData } from '../lib/orderbook'
import {
  queryKeys,
  type Coin,
  type PrecisionLevel,
  type L2BookMessage,
} from '../types'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'wss://api.hyperliquid.xyz/ws'

const getRetryDelayMs = (attempt: number): number =>
  Math.min(
    RECONNECT.initialDelayMs * 2 ** attempt,
    RECONNECT.maxDelayMs,
  )

export const useOrderbookSocket = (
  coin: Coin = DEFAULTS.coin,
  precisionLevel: PrecisionLevel = DEFAULTS.precisionLevel,
): void => {
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const coinRef = useRef(coin)
  const precisionLevelRef = useRef(precisionLevel)
  const subscribedRef = useRef<{ coin: Coin; precisionLevel: PrecisionLevel } | null>(null)

  coinRef.current = coin
  precisionLevelRef.current = precisionLevel

  useEffect(() => {
    let cancelled = false

    const connect = () => {
      if (cancelled) {
        return
      }

      queryClient.setQueryData(queryKeys.connection, {
        status: 'connecting',
        lastConnected: null,
        reconnectAttempts: reconnectAttemptsRef.current,
      })

      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        if (cancelled) {
          return
        }

        reconnectAttemptsRef.current = 0

        queryClient.setQueryData(queryKeys.connection, {
          status: 'connected',
          lastConnected: Date.now(),
          reconnectAttempts: reconnectAttemptsRef.current,
        })

        const c = coinRef.current
        const level = precisionLevelRef.current
        const alreadySubscribed =
          subscribedRef.current?.coin === c &&
          subscribedRef.current?.precisionLevel === level
        if (alreadySubscribed) {
          return
        }

        const params = precisionLevelToSubscription(level)
        ws.send(
          JSON.stringify({
            method: 'subscribe',
            subscription: { type: 'l2Book', coin: c, ...params },
          }),
        )
        subscribedRef.current = { coin: c, precisionLevel: level }
      }

      ws.onmessage = (event: MessageEvent<string>) => {
        if (cancelled) {
          return
        }

        try {
          const parsed = JSON.parse(event.data) as L2BookMessage
          if (parsed.channel !== 'l2Book') {
            return
          }

          const c = coinRef.current
          if (parsed.data.coin !== c) {
            return
          }

          const processed = processOrderbookData(parsed)
          const level = precisionLevelRef.current
          queryClient.setQueryData(queryKeys.orderbook(c, level), processed)
        } catch {
          // Non-fatal parse error: skip this message
        }
      }

      ws.onclose = () => {
        if (cancelled) {
          return
        }

        wsRef.current = null
        subscribedRef.current = null

        queryClient.setQueryData(queryKeys.connection, {
          status: 'disconnected',
          lastConnected: Date.now(),
          reconnectAttempts: reconnectAttemptsRef.current,
        })

        if (reconnectAttemptsRef.current >= RECONNECT.maxAttempts) {
          queryClient.setQueryData(queryKeys.connection, {
            status: 'error',
            lastConnected: Date.now(),
            reconnectAttempts: reconnectAttemptsRef.current,
          })
          return
        }

        const timeoutMs = getRetryDelayMs(reconnectAttemptsRef.current)
        reconnectAttemptsRef.current += 1

        window.setTimeout(connect, timeoutMs)
      }
    }

    connect()

    return () => {
      cancelled = true

      const current = wsRef.current
      const sub = subscribedRef.current
      wsRef.current = null
      subscribedRef.current = null

      if (current?.readyState === WebSocket.OPEN) {
        try {
          if (sub) {
            current.send(
              JSON.stringify({
                method: 'unsubscribe',
                subscription: { type: 'l2Book', coin: sub.coin },
              }),
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
    const ws = wsRef.current
    if (ws?.readyState !== WebSocket.OPEN) {
      return
    }

    const alreadySubscribed =
      subscribedRef.current?.coin === coin &&
      subscribedRef.current?.precisionLevel === precisionLevel
    if (alreadySubscribed) {
      return
    }

    queryClient.setQueryData(queryKeys.orderbook(coin, precisionLevel), null)

    const prev = subscribedRef.current
    if (prev) {
      try {
        ws.send(
          JSON.stringify({
            method: 'unsubscribe',
            subscription: { type: 'l2Book', coin: prev.coin },
          }),
        )
      } catch {
        // ignore
      }
    }

    const params = precisionLevelToSubscription(precisionLevel)
    ws.send(
      JSON.stringify({
        method: 'subscribe',
        subscription: { type: 'l2Book', coin, ...params },
      }),
    )
    subscribedRef.current = { coin, precisionLevel }
  }, [coin, precisionLevel, queryClient])
}
