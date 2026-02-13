import { describe, expect, it } from 'vitest'
import {
  COINS,
  DEFAULTS,
  MAX_ENRICHED_LEVELS_PER_SIDE,
  ORDERBOOK_MIN_HEIGHT_REM,
  ORDERBOOK_THROTTLE_MS,
  RECONNECT,
  ROW_FLASH_BG,
  TIER_API_PARAMS,
  TIER_INDICES,
  tierToLabel,
  tierToPriceDecimals,
  tierToSubscription,
} from './constants'

describe('constants', () => {
  describe('tierToSubscription', () => {
    it('maps tier 0 to nSigFigs 5 only', () => {
      expect(tierToSubscription(0)).toEqual({ nSigFigs: 5 })
    })

    it('maps tier 1 to nSigFigs 5 and mantissa 2', () => {
      expect(tierToSubscription(1)).toEqual({ nSigFigs: 5, mantissa: 2 })
    })

    it('maps tier 2 to nSigFigs 5 and mantissa 5', () => {
      expect(tierToSubscription(2)).toEqual({ nSigFigs: 5, mantissa: 5 })
    })

    it('maps tier 3 to nSigFigs 4', () => {
      expect(tierToSubscription(3)).toEqual({ nSigFigs: 4 })
    })

    it('maps tier 4 to nSigFigs 3', () => {
      expect(tierToSubscription(4)).toEqual({ nSigFigs: 3 })
    })

    it('maps tier 5 to nSigFigs 2', () => {
      expect(tierToSubscription(5)).toEqual({ nSigFigs: 2 })
    })
  })

  describe('tierToPriceDecimals', () => {
    it('returns 4 for tier 0 (BTC and ETH)', () => {
      expect(tierToPriceDecimals(0, 'BTC')).toBe(4)
      expect(tierToPriceDecimals(0, 'ETH')).toBe(4)
    })

    it('returns 0 for tier 5 (BTC and ETH)', () => {
      expect(tierToPriceDecimals(5, 'BTC')).toBe(0)
      expect(tierToPriceDecimals(5, 'ETH')).toBe(0)
    })
  })

  describe('tierToLabel', () => {
    it('returns coin-specific labels for BTC', () => {
      expect(tierToLabel(0, 'BTC')).toBe('1')
      expect(tierToLabel(1, 'BTC')).toBe('2')
      expect(tierToLabel(2, 'BTC')).toBe('5')
      expect(tierToLabel(3, 'BTC')).toBe('10')
      expect(tierToLabel(4, 'BTC')).toBe('100')
      expect(tierToLabel(5, 'BTC')).toBe('1000')
    })

    it('returns coin-specific labels for ETH', () => {
      expect(tierToLabel(0, 'ETH')).toBe('0.1')
      expect(tierToLabel(1, 'ETH')).toBe('0.2')
      expect(tierToLabel(2, 'ETH')).toBe('0.5')
      expect(tierToLabel(3, 'ETH')).toBe('1')
      expect(tierToLabel(4, 'ETH')).toBe('10')
      expect(tierToLabel(5, 'ETH')).toBe('100')
    })
  })

  describe('COINS', () => {
    it('has at least one coin with default first', () => {
      expect(COINS.length).toBeGreaterThanOrEqual(1)
      expect(DEFAULTS.coin).toBe(COINS[0].id)
    })

    it('each coin has 6 tiers matching TIER_API_PARAMS length', () => {
      expect(TIER_API_PARAMS).toHaveLength(6)
      for (const coin of COINS) {
        expect(coin.tiers).toHaveLength(6)
      }
    })
  })

  describe('TIER_INDICES', () => {
    it('includes all tier indices 0-5', () => {
      expect(TIER_INDICES).toEqual([0, 1, 2, 3, 4, 5])
    })
  })

  describe('DEFAULTS', () => {
    it('has expected coin and precisionTier', () => {
      expect(DEFAULTS.coin).toBe('BTC')
      expect(DEFAULTS.precisionTier).toBe(0)
    })
  })

  describe('RECONNECT', () => {
    it('has initialDelayMs, maxDelayMs, maxAttempts, connectTimeoutMs, heartbeatTimeoutMs', () => {
      expect(RECONNECT.initialDelayMs).toBeGreaterThan(0)
      expect(RECONNECT.maxDelayMs).toBeGreaterThanOrEqual(RECONNECT.initialDelayMs)
      expect(RECONNECT.maxAttempts).toBeGreaterThan(0)
      expect(RECONNECT.connectTimeoutMs).toBeGreaterThan(0)
      expect(RECONNECT.heartbeatTimeoutMs).toBeGreaterThan(0)
    })
  })

  describe('MAX_ENRICHED_LEVELS_PER_SIDE', () => {
    it('is a positive number', () => {
      expect(MAX_ENRICHED_LEVELS_PER_SIDE).toBeGreaterThan(0)
    })
  })

  describe('ORDERBOOK_THROTTLE_MS', () => {
    it('is a positive number', () => {
      expect(ORDERBOOK_THROTTLE_MS).toBeGreaterThan(0)
    })
  })

  describe('ROW_FLASH_BG', () => {
    it('has bid and ask colors', () => {
      expect(ROW_FLASH_BG.bid).toBe('rgba(14, 203, 129, 0.22)')
      expect(ROW_FLASH_BG.ask).toBe('rgba(246, 70, 93, 0.22)')
    })
  })

  describe('ORDERBOOK_MIN_HEIGHT_REM', () => {
    it('is a positive number for layout stability', () => {
      expect(ORDERBOOK_MIN_HEIGHT_REM).toBeGreaterThan(0)
    })
  })
})
