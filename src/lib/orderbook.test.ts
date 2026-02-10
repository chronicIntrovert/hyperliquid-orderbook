import { describe, expect, it } from 'vitest'
import type { L2BookMessage } from '../types'
import { processOrderbookData } from './orderbook'

const buildMessage = (overrides?: Partial<L2BookMessage>): L2BookMessage => ({
  channel: 'l2Book',
  data: {
    coin: 'BTC',
    time: 1234567890,
    levels: [
      [
        { px: '95000', sz: '1', n: 1 },
        { px: '94900', sz: '2', n: 1 },
      ],
      [
        { px: '95100', sz: '1.5', n: 1 },
        { px: '95200', sz: '0.5', n: 1 },
      ],
    ],
  },
  ...overrides,
})

describe('processOrderbookData', () => {
  it('computes best bid, best ask, spread, and midPrice', () => {
    const message = buildMessage()

    const result = processOrderbookData(message)

    expect(result.bestBid).toBe(95000)
    expect(result.bestAsk).toBe(95100)
    expect(result.spread).toBe(100)
    expect(result.midPrice).toBe(95050)
    expect(result.spreadPercentage).toBeCloseTo(
      (100 / 95050) * 100,
      6,
    )
  })

  it('computes cumulative totals and percentages', () => {
    const message = buildMessage()

    const result = processOrderbookData(message)

    expect(result.bids[0]).toMatchObject({
      price: 95000,
      size: 1,
      total: 3,
    })
    expect(result.bids[1]).toMatchObject({
      price: 94900,
      size: 2,
      total: 2,
    })

    const maxTotal = Math.max(
      ...result.bids.map((level) => level.total),
    )
    const lastBid = result.bids[result.bids.length - 1]
    expect(lastBid.percentage).toBeCloseTo(
      (lastBid.total / maxTotal) * 100,
      6,
    )
  })
})

