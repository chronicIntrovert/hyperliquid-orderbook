import { describe, expect, it } from 'vitest'
import { formatPrice, formatSize, formatSpread } from './format'

describe('formatPrice', () => {
  it('formats with two decimal places', () => {
    expect(formatPrice(95000.1234)).toBe('95,000.12')
    expect(formatPrice(95000)).toBe('95,000.00')
    expect(formatPrice(95000.5678)).toBe('95,000.57')
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
