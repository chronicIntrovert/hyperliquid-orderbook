import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SpreadDisplay } from './SpreadDisplay'

describe('SpreadDisplay', () => {
  it('shows dash placeholder when book is null', () => {
    render(<SpreadDisplay book={null} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows dash placeholder when book has zero spread', () => {
    render(
      <SpreadDisplay
        book={{
          bids: [],
          asks: [],
          spread: 0,
          spreadPercentage: 0,
          midPrice: 100,
          bestBid: 0,
          bestAsk: 0,
          timestamp: 0,
        }}
      />,
    )
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows formatted spread when book has positive spread', () => {
    render(
      <SpreadDisplay
        book={{
          bids: [],
          asks: [],
          spread: 12.5,
          spreadPercentage: 0.018,
          midPrice: 69000,
          bestBid: 68994,
          bestAsk: 69006,
          timestamp: 0,
        }}
      />,
    )
    expect(screen.getByText(/Spread/)).toBeInTheDocument()
    expect(screen.getByText('12.50 (0.018%)')).toBeInTheDocument()
  })
})
