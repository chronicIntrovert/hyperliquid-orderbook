/**
 * Canonical type exports for the app. Prefer importing from here so types
 * stay consistent across components, hooks, and lib.
 *
 * Coin and PrecisionTier are derived from config (utils/constants.ts COINS and TIER_INDICES).
 */
import type { Coin, PrecisionTier } from '../utils/constants'
export type { Coin, PrecisionTier }

export interface L2BookSubscriptionPayload {
  type: 'l2Book'
  coin: Coin
  nSigFigs: number
  mantissa?: number
}

export interface ConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastConnected: number | null
  reconnectAttempts: number
}

export interface RawLevel {
  px: string
  sz: string
  n: number
}

export interface L2BookMessage {
  channel: 'l2Book'
  data: {
    coin: string
    time: number
    levels: [RawLevel[], RawLevel[]]
  }
}

export interface OrderbookLevel {
  price: number
  /** Size at this price level, in base asset (coin: BTC or ETH). */
  size: number
  /** Cumulative size from best price outward in display order, in base asset (coin). */
  total: number
  percentage: number
  /**
   * Set when size changed vs previous snapshot:
   * - 'increased': size went up or new level appeared → green flash
   * - 'decreased': size went down or level disappeared (ghost row, size 0) → red flash
   */
  sizeChangeDirection?: 'increased' | 'decreased'
}

export interface ProcessedOrderbook {
  bids: OrderbookLevel[]
  asks: OrderbookLevel[]
  spread: number
  spreadPercentage: number
  midPrice: number
  bestBid: number
  bestAsk: number
  timestamp: number
}

