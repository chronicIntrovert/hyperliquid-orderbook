import type { L2BookMessage, OrderbookLevel, ProcessedOrderbook } from '../types'

const buildSide = (levels: L2BookMessage['data']['levels'][number]): OrderbookLevel[] => {
  const parsed = levels
    .map((level) => ({
      price: Number(level.px),
      size: Number(level.sz),
    }))
    .filter((level) => Number.isFinite(level.price) && Number.isFinite(level.size))

  let cumulative = 0
  parsed.sort((a, b) => a.price - b.price)

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

  const bids = buildSide(rawBids).sort((a, b) => b.price - a.price)
  const asks = buildSide(rawAsks).sort((a, b) => a.price - b.price)

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

