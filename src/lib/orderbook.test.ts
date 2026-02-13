import { describe, expect, it } from 'vitest'
import type { L2BookMessage } from '../types'
import {
  addSizeChangeDirection,
  parseAndEnrichRawOrderbook,
  processOrderbookData,
} from './orderbook'

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

  it('processes ETH orderbook message same as BTC (spread and levels)', () => {
    const message = buildMessage({
      data: {
        coin: 'ETH',
        time: 1234567891,
        levels: [
          [
            { px: '3500', sz: '2', n: 1 },
            { px: '3490', sz: '1.5', n: 1 },
          ],
          [
            { px: '3510', sz: '0.5', n: 1 },
            { px: '3520', sz: '1', n: 1 },
          ],
        ],
      },
    })

    const result = processOrderbookData(message)

    expect(result.bestBid).toBe(3500)
    expect(result.bestAsk).toBe(3510)
    expect(result.spread).toBe(10)
    expect(result.midPrice).toBe(3505)
    expect(result.spreadPercentage).toBeCloseTo(
      (10 / 3505) * 100,
      6,
    )
    expect(result.bids[0]).toMatchObject({ price: 3500, size: 2 })
    expect(result.asks[0]).toMatchObject({ price: 3510, size: 0.5 })
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

  it('marks new price level as increased', () => {
    const processed = processOrderbookData(buildMessage())
    const lastSizes = {
      bids: new Map([[95000, 1]]),
      asks: new Map([[95100, 1.5]]),
    }
    const result = addSizeChangeDirection(processed, lastSizes)
    // 94900 is new on bids, 95200 is new on asks
    expect(result.bids.find((l) => l.price === 94900)?.sizeChangeDirection).toBe('increased')
    expect(result.asks.find((l) => l.price === 95200)?.sizeChangeDirection).toBe('increased')
  })

  it('injects ghost row for disappeared bid price (size 0, decreased)', () => {
    const processed = processOrderbookData(buildMessage())
    const lastSizes = {
      bids: new Map([[95000, 1], [94900, 2], [94800, 3]]),
      asks: new Map([[95100, 1.5], [95200, 0.5]]),
    }
    const result = addSizeChangeDirection(processed, lastSizes)
    const ghost = result.bids.find((l) => l.price === 94800)
    expect(ghost).toBeDefined()
    expect(ghost).toMatchObject({
      price: 94800,
      size: 0,
      total: 0,
      percentage: 0,
      sizeChangeDirection: 'decreased',
    })
    // Ghost should be sorted correctly (bids desc: 95000, 94900, 94800)
    const prices = result.bids.map((l) => l.price)
    expect(prices).toEqual([95000, 94900, 94800])
  })

  it('injects ghost row for disappeared ask price (size 0, decreased)', () => {
    const processed = processOrderbookData(buildMessage())
    const lastSizes = {
      bids: new Map([[95000, 1], [94900, 2]]),
      asks: new Map([[95100, 1.5], [95200, 0.5], [95300, 1]]),
    }
    const result = addSizeChangeDirection(processed, lastSizes)
    const ghost = result.asks.find((l) => l.price === 95300)
    expect(ghost).toBeDefined()
    expect(ghost).toMatchObject({
      price: 95300,
      size: 0,
      total: 0,
      percentage: 0,
      sizeChangeDirection: 'decreased',
    })
    // Ghost should be sorted correctly (asks asc: 95100, 95200, 95300)
    const prices = result.asks.map((l) => l.price)
    expect(prices).toEqual([95100, 95200, 95300])
  })

  it('caps enriched levels to MAX_ENRICHED_LEVELS_PER_SIDE', () => {
    // Build a book with 2 real levels and 50 vanished prices
    const processed = processOrderbookData(buildMessage())
    const manyOldPrices = new Map<number, number>()
    for (let i = 0; i < 50; i++) {
      manyOldPrices.set(90000 + i, 1)
    }
    const lastSizes = {
      bids: manyOldPrices,
      asks: new Map([[95100, 1.5], [95200, 0.5]]),
    }
    const result = addSizeChangeDirection(processed, lastSizes)
    // 2 real + 50 ghosts = 52, should be capped to MAX_ENRICHED_LEVELS_PER_SIDE (40)
    expect(result.bids.length).toBeLessThanOrEqual(40)
  })
})

describe('parseAndEnrichRawOrderbook', () => {
  it('returns null for invalid JSON', () => {
    expect(parseAndEnrichRawOrderbook('not json', null)).toBeNull()
    expect(parseAndEnrichRawOrderbook('', null)).toBeNull()
  })

  it('returns data and nextLastSizes for valid l2Book JSON', () => {
    const message = buildMessage()
    const raw = JSON.stringify(message)
    const result = parseAndEnrichRawOrderbook(raw, null)
    expect(result).not.toBeNull()
    expect(result!.data.bids[0].price).toBe(95000)
    expect(result!.data.spread).toBe(100)
    expect(result!.nextLastSizes.bids.size).toBeGreaterThan(0)
    expect(result!.nextLastSizes.asks.size).toBeGreaterThan(0)
  })
})

