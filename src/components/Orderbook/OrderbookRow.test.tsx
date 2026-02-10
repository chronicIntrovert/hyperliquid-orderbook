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
      <OrderbookRow
        level={baseLevel}
        side="bid"
        priceDecimals={2}
      />,
    )
    expect(screen.getByText('95,000.00')).toBeInTheDocument()
    const sizeAndTotal = screen.getAllByText('1.000')
    expect(sizeAndTotal).toHaveLength(2)
  })

  it('applies flash class when sizeChangeDirection is increased and effect runs', async () => {
    vi.useFakeTimers()
    const { container } = render(
      <OrderbookRow
        level={{ ...baseLevel, sizeChangeDirection: 'increased' }}
        side="bid"
        priceDecimals={2}
      />,
    )
    vi.advanceTimersByTime(0)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('animate-flash')
    expect(wrapper.className).toContain('flash-bid')
    vi.useRealTimers()
  })

  it('applies flash-ask when side is ask and sizeChangeDirection is set', async () => {
    vi.useFakeTimers()
    const { container } = render(
      <OrderbookRow
        level={{ ...baseLevel, sizeChangeDirection: 'decreased' }}
        side="ask"
        priceDecimals={2}
      />,
    )
    vi.advanceTimersByTime(0)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('flash-ask')
    vi.useRealTimers()
  })

  it('does not apply flash class when sizeChangeDirection is undefined', () => {
    const { container } = render(
      <OrderbookRow
        level={baseLevel}
        side="bid"
        priceDecimals={2}
      />,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).not.toContain('animate-flash')
  })
})
