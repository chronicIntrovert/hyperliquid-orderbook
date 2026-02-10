import { describe, expect, it } from 'vitest'
import type { L2BookMessage } from '../types'
import { addSizeChangeDirection, processOrderbookData } from './orderbook'

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

  it('computes cumulative totals and percentages with totals increasing away from spread', () => {
    const message = buildMessage()

    const result = processOrderbookData(message)

    // Bids: best bid first (price desc), cumulative increases away from spread
    expect(result.bids[0]).toMatchObject({
      price: 95000,
      size: 1,
      total: 1,
    })
    expect(result.bids[1]).toMatchObject({
      price: 94900,
      size: 2,
      total: 3,
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

  it('computes asks in ascending price order with cumulative increasing away from spread', () => {
    const message = buildMessage()

    const result = processOrderbookData(message)

    expect(result.asks[0]).toMatchObject({
      price: 95100,
      size: 1.5,
      total: 1.5,
    })
    expect(result.asks[1]).toMatchObject({
      price: 95200,
      size: 0.5,
      total: 2,
    })
  })

  it('handles empty bids or asks', () => {
    const messageEmptyBids = buildMessage({
      data: {
        ...buildMessage().data,
        levels: [[], buildMessage().data.levels[1]],
      },
    })
    const resultBids = processOrderbookData(messageEmptyBids)
    expect(resultBids.bids).toEqual([])
    expect(resultBids.bestBid).toBe(0)
    expect(resultBids.asks).toHaveLength(2)

    const messageEmptyAsks = buildMessage({
      data: {
        ...buildMessage().data,
        levels: [buildMessage().data.levels[0], []],
      },
    })
    const resultAsks = processOrderbookData(messageEmptyAsks)
    expect(resultAsks.asks).toEqual([])
    expect(resultAsks.bestAsk).toBe(0)
    expect(resultAsks.bids).toHaveLength(2)
  })
})

describe('addSizeChangeDirection', () => {
  it('returns levels unchanged when lastSizes is null', () => {
    const processed = processOrderbookData(buildMessage())
    const result = addSizeChangeDirection(processed, null)
    expect(result.bids.every((l) => l.sizeChangeDirection === undefined)).toBe(true)
    expect(result.asks.every((l) => l.sizeChangeDirection === undefined)).toBe(true)
  })

  it('sets sizeChangeDirection increased when size went up', () => {
    const processed = processOrderbookData(buildMessage())
    const lastSizes = {
      bids: new Map([[95000, 0.5], [94900, 1]]),
      asks: new Map([[95100, 1], [95200, 0.5]]),
    }
    const result = addSizeChangeDirection(processed, lastSizes)
    expect(result.bids[0]).toMatchObject({ price: 95000, size: 1, sizeChangeDirection: 'increased' })
    expect(result.bids[1]).toMatchObject({ price: 94900, size: 2, sizeChangeDirection: 'increased' })
  })

  it('sets sizeChangeDirection decreased when size went down', () => {
    const processed = processOrderbookData(buildMessage())
    const lastSizes = {
      bids: new Map([[95000, 2], [94900, 3]]),
      asks: new Map([[95100, 2], [95200, 1]]),
    }
    const result = addSizeChangeDirection(processed, lastSizes)
    expect(result.bids[0]).toMatchObject({ price: 95000, size: 1, sizeChangeDirection: 'decreased' })
    expect(result.bids[1]).toMatchObject({ price: 94900, size: 2, sizeChangeDirection: 'decreased' })
  })

  it('leaves sizeChangeDirection unset when size unchanged', () => {
    const processed = processOrderbookData(buildMessage())
    const lastSizes = {
      bids: new Map([[95000, 1], [94900, 2]]),
      asks: new Map([[95100, 1.5], [95200, 0.5]]),
    }
    const result = addSizeChangeDirection(processed, lastSizes)
    expect(result.bids[0].sizeChangeDirection).toBeUndefined()
    expect(result.bids[1].sizeChangeDirection).toBeUndefined()
  })
})

