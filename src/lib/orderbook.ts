import { MAX_ENRICHED_LEVELS_PER_SIDE } from '../utils/constants'
import type { L2BookMessage, OrderbookLevel, ProcessedOrderbook } from '../types'

type PriceOrder = 'asc' | 'desc'

/**
 * Builds one side of the orderbook with cumulative totals and percentages.
 * Size and total are in base asset (coin: BTC or ETH). Total = cumulative size
 * from best price outward in display order so depth bars grow away from the spread.
 * Bids: descending price (best first); asks: ascending price (best first).
 */
const buildSide = (
  levels: L2BookMessage['data']['levels'][number],
  priceOrder: PriceOrder,
): OrderbookLevel[] => {
  const parsed = levels
    .map((level) => ({
      price: Number(level.px),
      size: Number(level.sz), // base asset (coin) from API
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
 * Determine how a level's size changed vs the previous snapshot.
 * UI flashes by side only: bids flash green, asks flash red (any change).
 *
 * Triggers:
 * - Size increased at a price level → 'increased'
 * - Size decreased at a price level → 'decreased'
 * - New price level appeared        → 'increased'
 * - Price level disappeared          → 'decreased' (ghost row, size 0)
 * - Size unchanged                   → undefined (no flash)
 */
const sizeDirection = (
  prev: number | undefined,
  next: number,
): 'increased' | 'decreased' | undefined => {
  if (prev === undefined) return next > 0 ? 'increased' : undefined
  if (next > prev) return 'increased'
  if (next < prev) return 'decreased'
  return undefined
}

/**
 * Enrich levels with sizeChangeDirection and inject ghost rows for
 * disappeared price levels so the UI can flash them before they vanish.
 *
 * Ghost rows have size 0, total 0, percentage 0, and sizeChangeDirection 'decreased'.
 * They are inserted in the correct sort position for the side (desc for bids, asc for asks).
 */
function enrichSide(
  levels: OrderbookLevel[],
  lastPrices: Map<number, number>,
  sortAsc: boolean,
): OrderbookLevel[] {
  const currentPrices = new Set(levels.map((l) => l.price))

  const enriched = levels.map((l) => ({
    ...l,
    sizeChangeDirection: sizeDirection(lastPrices.get(l.price), l.size),
  }))

  // Inject ghost rows for prices that existed before but are no longer present
  for (const [price] of lastPrices) {
    if (!currentPrices.has(price)) {
      enriched.push({
        price,
        size: 0,
        total: 0,
        percentage: 0,
        sizeChangeDirection: 'decreased',
      })
    }
  }

  // Re-sort so ghost rows sit in the right position
  enriched.sort((a, b) =>
    sortAsc ? a.price - b.price : b.price - a.price,
  )

  // Cap to prevent unbounded growth from volatile markets
  if (enriched.length > MAX_ENRICHED_LEVELS_PER_SIDE) {
    enriched.length = MAX_ENRICHED_LEVELS_PER_SIDE
  }

  return enriched
}

/**
 * Adds sizeChangeDirection to each level by comparing with the previous snapshot.
 * Also injects ghost rows for disappeared price levels so the UI can flash them.
 */
export function addSizeChangeDirection(
  processed: ProcessedOrderbook,
  lastSizes: LastWrittenSizes | null,
): ProcessedOrderbook {
  if (lastSizes === null) {
    return processed
  }
  const bids = enrichSide(processed.bids, lastSizes.bids, false)
  const asks = enrichSide(processed.asks, lastSizes.asks, true)
  return { ...processed, bids, asks }
}

export interface ParseEnrichResult {
  data: ProcessedOrderbook
  nextLastSizes: LastWrittenSizes
}

/**
 * Parse raw WebSocket message, process to orderbook, and enrich with size-change direction.
 * Transport-agnostic: no React, no QueryClient. Returns null on parse error.
 * Used by useOrderbookSocket so the sync pipeline is unit-testable.
 */
export function parseAndEnrichRawOrderbook(
  raw: string,
  lastSizes: LastWrittenSizes | null,
): ParseEnrichResult | null {
  let parsed: L2BookMessage
  try {
    parsed = JSON.parse(raw) as L2BookMessage
  } catch {
    return null
  }
  const processed = processOrderbookData(parsed)
  const data = addSizeChangeDirection(processed, lastSizes)
  const nextLastSizes: LastWrittenSizes = {
    bids: new Map(processed.bids.map((l) => [l.price, l.size])),
    asks: new Map(processed.asks.map((l) => [l.price, l.size])),
  }
  return { data, nextLastSizes }
}

