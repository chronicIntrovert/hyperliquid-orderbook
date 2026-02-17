import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrderbookSide } from './OrderbookSide'

const bidLevels = [
  { price: 100, size: 1, total: 1, percentage: 50 },
  { price: 99, size: 2, total: 3, percentage: 100 },
]

const askLevels = [
  { price: 101, size: 1.5, total: 1.5, percentage: 50 },
  { price: 102, size: 0.5, total: 2, percentage: 100 },
]

describe('OrderbookSide', () => {
  it('renders bid levels in order up to rows', () => {
    render(
      <OrderbookSide levels={bidLevels} side="bid" rows={5} />,
    )
    expect(screen.getByText('100.00')).toBeInTheDocument()
    expect(screen.getByText('99.00')).toBeInTheDocument()
  })

  it('renders ask levels (reversed) up to rows', () => {
    render(
      <OrderbookSide levels={askLevels} side="ask" rows={5} />,
    )
    expect(screen.getByText('101.00')).toBeInTheDocument()
    expect(screen.getByText('102.00')).toBeInTheDocument()
  })

  it('renders placeholder rows when levels fewer than rows', () => {
    const { container } = render(
      <OrderbookSide levels={bidLevels} side="bid" rows={5} />,
    )
    const placeholders = container.querySelectorAll('.font-mono')
    expect(placeholders.length).toBeGreaterThanOrEqual(2)
  })
})
