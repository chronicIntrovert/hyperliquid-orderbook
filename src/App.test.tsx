import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

vi.mock('./components/OrderbookWidget', () => ({
  OrderbookWidget: () => <div data-testid="orderbook-widget">OrderbookWidget</div>,
}))

describe('App', () => {
  it('renders OrderbookWidget', () => {
    render(<App />)
    expect(screen.getByTestId('orderbook-widget')).toBeInTheDocument()
    expect(screen.getByText('OrderbookWidget')).toBeInTheDocument()
  })
})
