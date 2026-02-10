import { describe, expect, it } from 'vitest'
import {
  DEFAULTS,
  ORDERBOOK_THROTTLE_MS,
  PRECISION_LEVELS,
  precisionLevelToPriceDecimals,
  precisionLevelToSubscription,
  RECONNECT,
} from './constants'

describe('constants', () => {
  describe('precisionLevelToSubscription', () => {
    it('maps precision 1 to nSigFigs 5 only', () => {
      expect(precisionLevelToSubscription(1)).toEqual({ nSigFigs: 5 })
    })

    it('maps precision 2 to nSigFigs 5 and mantissa 2', () => {
      expect(precisionLevelToSubscription(2)).toEqual({
        nSigFigs: 5,
        mantissa: 2,
      })
    })

    it('maps precision 10 to nSigFigs 4', () => {
      expect(precisionLevelToSubscription(10)).toEqual({ nSigFigs: 4 })
    })

    it('maps precision 1000 to nSigFigs 2', () => {
      expect(precisionLevelToSubscription(1000)).toEqual({ nSigFigs: 2 })
    })
  })

  describe('precisionLevelToPriceDecimals', () => {
    it('returns 4 for precision 1', () => {
      expect(precisionLevelToPriceDecimals(1)).toBe(4)
    })

    it('returns 3 for precision 2 and 5', () => {
      expect(precisionLevelToPriceDecimals(2)).toBe(3)
      expect(precisionLevelToPriceDecimals(5)).toBe(3)
    })

    it('returns 0 for precision 1000', () => {
      expect(precisionLevelToPriceDecimals(1000)).toBe(0)
    })
  })

  describe('DEFAULTS', () => {
    it('has expected coin and precisionLevel', () => {
      expect(DEFAULTS.coin).toBe('BTC')
      expect(DEFAULTS.precisionLevel).toBe(1)
    })
  })

  describe('PRECISION_LEVELS', () => {
    it('includes all precision options 1, 2, 5, 10, 100, 1000', () => {
      expect(PRECISION_LEVELS).toEqual([1, 2, 5, 10, 100, 1000])
    })
  })

  describe('RECONNECT', () => {
    it('has initialDelayMs, maxDelayMs, maxAttempts', () => {
      expect(RECONNECT.initialDelayMs).toBeGreaterThan(0)
      expect(RECONNECT.maxDelayMs).toBeGreaterThanOrEqual(RECONNECT.initialDelayMs)
      expect(RECONNECT.maxAttempts).toBeGreaterThan(0)
    })
  })

  describe('ORDERBOOK_THROTTLE_MS', () => {
    it('is a positive number', () => {
      expect(ORDERBOOK_THROTTLE_MS).toBeGreaterThan(0)
    })
  })
})
