import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrderbookRow } from './OrderbookRow'

const baseLevel = {
  price: 95000,
  size: 1,
  total: 1,
  percentage: 33.33,
}

describe('OrderbookRow', () => {
  it('renders price, size, and total with correct formatting', () => {
    render(
      <OrderbookRow level={baseLevel} side="bid" />,
    )
    expect(screen.getByText('95,000.00')).toBeInTheDocument()
    const sizeAndTotal = screen.getAllByText('1.000')
    expect(sizeAndTotal).toHaveLength(2)
  })

  it('applies bid (green) flash when sizeChangeDirection is set and side is bid', () => {
    vi.useFakeTimers()
    const { container } = render(
      <OrderbookRow
        level={{ ...baseLevel, sizeChangeDirection: 'increased' }}
        side="bid"
      />,
    )
    vi.advanceTimersByTime(0)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.backgroundColor).toBe('rgba(14, 203, 129, 0.22)')
    vi.useRealTimers()
  })

  it('applies ask (red) flash when sizeChangeDirection is set and side is ask', () => {
    vi.useFakeTimers()
    const { container } = render(
      <OrderbookRow
        level={{ ...baseLevel, sizeChangeDirection: 'decreased' }}
        side="ask"
      />,
    )
    vi.advanceTimersByTime(0)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.backgroundColor).toBe('rgba(246, 70, 93, 0.22)')
    vi.useRealTimers()
  })

  it('applies same side color for both increased and decreased (bid green, ask red)', () => {
    vi.useFakeTimers()
    const { container: c1 } = render(
      <OrderbookRow
        level={{ ...baseLevel, sizeChangeDirection: 'decreased' }}
        side="bid"
      />,
    )
    vi.advanceTimersByTime(0)
    expect((c1.firstChild as HTMLElement).style.backgroundColor).toBe(
      'rgba(14, 203, 129, 0.22)',
    )
    const { container: c2 } = render(
      <OrderbookRow
        level={{ ...baseLevel, sizeChangeDirection: 'increased' }}
        side="ask"
      />,
    )
    vi.advanceTimersByTime(0)
    expect((c2.firstChild as HTMLElement).style.backgroundColor).toBe(
      'rgba(246, 70, 93, 0.22)',
    )
    vi.useRealTimers()
  })

  it('has transparent background when sizeChangeDirection is undefined', () => {
    const { container } = render(
      <OrderbookRow level={baseLevel} side="bid" />,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.backgroundColor).toBe('transparent')
  })
})
