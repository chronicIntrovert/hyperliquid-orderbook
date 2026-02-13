import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrderbookMobileRow } from './OrderbookMobileRow'

const bidLevel = {
  price: 95000,
  size: 1,
  total: 10,
  percentage: 50,
}

const askLevel = {
  price: 95100,
  size: 2,
  total: 20,
  percentage: 60,
}

describe('OrderbookMobileRow', () => {
  it('renders bid and ask price and total when both levels provided', () => {
    render(
      <OrderbookMobileRow
        bidLevel={bidLevel}
        askLevel={askLevel}
        priceDecimals={2}
      />,
    )
    expect(screen.getByText('95,000.00')).toBeInTheDocument()
    expect(screen.getByText('95,100.00')).toBeInTheDocument()
    expect(screen.getByText('10.000')).toBeInTheDocument()
    expect(screen.getByText('20.000')).toBeInTheDocument()
  })

  it('applies bid (green) flash when bid level has sizeChangeDirection', () => {
    vi.useFakeTimers()
    const { container } = render(
      <OrderbookMobileRow
        bidLevel={{ ...bidLevel, sizeChangeDirection: 'increased' }}
        askLevel={askLevel}
        priceDecimals={2}
      />,
    )
    vi.advanceTimersByTime(0)
    const leftBlock = container.querySelector('.col-span-2')
    expect(leftBlock).toHaveStyle({ backgroundColor: 'rgba(14, 203, 129, 0.22)' })
    vi.useRealTimers()
  })

  it('applies ask (red) flash when ask level has sizeChangeDirection', () => {
    vi.useFakeTimers()
    const { container } = render(
      <OrderbookMobileRow
        bidLevel={bidLevel}
        askLevel={{ ...askLevel, sizeChangeDirection: 'decreased' }}
        priceDecimals={2}
      />,
    )
    vi.advanceTimersByTime(0)
    const blocks = container.querySelectorAll('.col-span-2')
    const rightBlock = blocks[1]
    expect(rightBlock).toHaveStyle({ backgroundColor: 'rgba(246, 70, 93, 0.22)' })
    vi.useRealTimers()
  })

  it('renders empty cells when levels are null', () => {
    const { container } = render(
      <OrderbookMobileRow
        bidLevel={null}
        askLevel={null}
        priceDecimals={2}
      />,
    )
    expect(container.textContent).toContain('\u00A0')
  })
})
