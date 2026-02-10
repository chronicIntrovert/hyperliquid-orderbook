import type { L2BookMessage, OrderbookLevel, ProcessedOrderbook } from '../types'

type PriceOrder = 'asc' | 'desc'

/**
 * Builds one side of the orderbook with cumulative totals and percentages.
 * Cumulative increases in display order so depth bars grow away from the spread:
 * asks use ascending price; bids use descending price (best bid first).
 */
const buildSide = (
  levels: L2BookMessage['data']['levels'][number],
  priceOrder: PriceOrder,
): OrderbookLevel[] => {
  const parsed = levels
    .map((level) => ({
      price: Number(level.px),
      size: Number(level.sz),
    }))
    .filter((level) => Number.isFinite(level.price) && Number.isFinite(level.size))

  const sortAsc = priceOrder === 'asc'
  parsed.sort((a, b) => (sortAsc ? a.price - b.price : b.price - a.price))

  let cumulative = 0
  const withTotals: OrderbookLevel[] = parsed.map((level) => {
    cumulative += level.size
    return {
      price: level.price,
      size: level.size,
      total: cumulative,
      percentage: 0,
    }
  })

  const maxTotal = withTotals.reduce(
    (max, level) => (level.total > max ? level.total : max),
    0,
  )

  if (maxTotal === 0) {
    return withTotals
  }

  return withTotals.map((level) => ({
    ...level,
    percentage: (level.total / maxTotal) * 100,
  }))
}

export const processOrderbookData = (message: L2BookMessage): ProcessedOrderbook => {
  const [rawBids, rawAsks] = message.data.levels

  const bids = buildSide(rawBids, 'desc')
  const asks = buildSide(rawAsks, 'asc')

  const bestBid = bids[0]?.price ?? 0
  const bestAsk = asks[0]?.price ?? 0
  const spread = bestAsk > 0 && bestBid > 0 ? bestAsk - bestBid : 0
  const midPrice =
    bestAsk > 0 && bestBid > 0 ? (bestAsk + bestBid) / 2 : 0
  const spreadPercentage =
    midPrice > 0 ? (spread / midPrice) * 100 : 0

  return {
    bids,
    asks,
    spread,
    spreadPercentage,
    midPrice,
    bestBid,
    bestAsk,
    timestamp: message.data.time,
  }
}

export interface LastWrittenSizes {
  bids: Map<number, number>
  asks: Map<number, number>
}

/**
 * Adds sizeChangeDirection to each level by comparing with the previous snapshot.
 * Used when flushing throttled orderbook updates so the UI can flash on add/remove.
 */
export function addSizeChangeDirection(
  processed: ProcessedOrderbook,
  lastSizes: LastWrittenSizes | null,
): ProcessedOrderbook {
  if (lastSizes === null) {
    return processed
  }
  const direction = (
    prev: number | undefined,
    next: number,
  ): 'increased' | 'decreased' | undefined => {
    if (prev === undefined) return next > 0 ? 'increased' : undefined
    if (next > prev) return 'increased'
    if (next < prev) return 'decreased'
    return undefined
  }
  const bids = processed.bids.map((l) => ({
    ...l,
    sizeChangeDirection: direction(lastSizes.bids.get(l.price), l.size),
  }))
  const asks = processed.asks.map((l) => ({
    ...l,
    sizeChangeDirection: direction(lastSizes.asks.get(l.price), l.size),
  }))
  return { ...processed, bids, asks }
}

