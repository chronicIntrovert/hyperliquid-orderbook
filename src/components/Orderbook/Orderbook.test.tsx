import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import { queryKeys } from '../../lib/queryKeys'
import type { ProcessedOrderbook } from '../../types'
import { Orderbook } from './Orderbook'

const mockBook: ProcessedOrderbook = {
  bids: [
    { price: 100, size: 1, total: 1, percentage: 100 },
  ],
  asks: [
    { price: 101, size: 1, total: 1, percentage: 100 },
  ],
  spread: 1,
  spreadPercentage: 0.01,
  midPrice: 100.5,
  bestBid: 100,
  bestAsk: 101,
  timestamp: 0,
}

function renderOrderbook(coin: 'BTC' | 'ETH' = 'BTC', tier = 0 as const) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  queryClient.setQueryData(queryKeys.orderbook(coin, tier), mockBook)
  return render(
    <QueryClientProvider client={queryClient}>
      <Orderbook coin={coin} tier={tier} />
    </QueryClientProvider>,
  )
}

describe('Orderbook', () => {
  it('shows loading overlay until minimum loading time has elapsed', () => {
    renderOrderbook()
    expect(screen.getByText(/connecting to orderbook/i)).toBeInTheDocument()
  })

  it('shows spread and levels after minimum loading time', () => {
    vi.useFakeTimers()
    renderOrderbook()
    act(() => {
      vi.advanceTimersByTime(2500)
    })
    expect(screen.getByText(/Spread/)).toBeInTheDocument()
    expect(screen.getAllByText('100.00').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('101.00').length).toBeGreaterThanOrEqual(1)
    vi.useRealTimers()
  })

  it('renders desktop header with coin in Size/Total labels', () => {
    vi.useFakeTimers()
    renderOrderbook('ETH')
    act(() => {
      vi.advanceTimersByTime(2500)
    })
    expect(screen.getByText(/Size \(ETH\)/)).toBeInTheDocument()
    const totalLabels = screen.getAllByText(/Total \(ETH\)/)
    expect(totalLabels.length).toBeGreaterThanOrEqual(1)
    vi.useRealTimers()
  })
})
