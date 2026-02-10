export type Coin = 'BTC' | 'ETH'

/** Precision options shown in the UI (dropdown). Maps to nSigFigs + optional mantissa. */
export type PrecisionLevel = 1 | 2 | 5 | 10 | 100 | 1000

export interface L2BookSubscriptionPayload {
  type: 'l2Book'
  coin: Coin
  nSigFigs: number
  mantissa?: number
}

export interface WebSocketConfig {
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
  size: number
  total: number
  percentage: number
  /** Set when size changed vs previous snapshot: 'increased' = add (green flash), 'decreased' = remove (red flash). Per In Silico: flash for adds or removes at a price row. */
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

export const queryKeys = {
  orderbook: (coin: Coin, precisionLevel: PrecisionLevel) =>
    ['orderbook', coin, precisionLevel] as const,
  connection: ['connection'] as const,
}

