import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OrderbookWidget } from './OrderbookWidget'

const mockRetry = vi.fn()
vi.mock('../hooks/useOrderbookSocket', () => ({
  useOrderbookSocket: () => ({ retry: mockRetry }),
}))

function renderWidget() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <OrderbookWidget />
    </QueryClientProvider>,
  )
}

describe('OrderbookWidget', () => {
  it('renders header with Symbol, Precision, and connection status', () => {
    renderWidget()
    expect(screen.getByText('Symbol')).toBeInTheDocument()
    expect(screen.getByText('Precision')).toBeInTheDocument()
    const statusLabels = screen.getAllByText(/connecting|connected|error|reconnecting|errored/i)
    expect(statusLabels.length).toBeGreaterThanOrEqual(1)
  })

  it('shows default symbol and allows changing it', async () => {
    renderWidget()
    const symbolSelect = screen.getByRole('combobox', { name: /symbol/i })
    expect(symbolSelect).toHaveValue('BTC')
    await userEvent.selectOptions(symbolSelect, 'ETH')
    expect(symbolSelect).toHaveValue('ETH')
  })

  it('shows connecting to orderbook while loading', () => {
    renderWidget()
    expect(screen.getByText(/connecting to orderbook/i)).toBeInTheDocument()
  })
})
