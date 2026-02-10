import { describe, expect, it } from 'vitest'
import { formatPrice, formatSize, formatSpread } from './format'

describe('formatPrice', () => {
  it('formats with given decimals', () => {
    expect(formatPrice(95000.1234, 2)).toBe('95,000.12')
    expect(formatPrice(95000, 4)).toBe('95,000.0000')
  })
})

describe('formatSize', () => {
  it('formats with 3 decimal places', () => {
    expect(formatSize(1.5)).toBe('1.500')
    expect(formatSize(1000)).toBe('1,000.000')
  })
})

describe('formatSpread', () => {
  it('formats spread and percentage', () => {
    expect(formatSpread(12.5, 0.018)).toBe('12.50 (0.018%)')
  })
})
