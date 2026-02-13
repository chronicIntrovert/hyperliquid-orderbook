import React from 'react'
import { describe, expect, it } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { queryKeys } from '../lib/queryKeys'
import type { ProcessedOrderbook } from '../types'
import { useOrderbook } from './useOrderbook'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useOrderbook', () => {
  it('returns null when cache has no data', async () => {
    const { result } = renderHook(
      () => useOrderbook('BTC', 0),
      { wrapper: createWrapper() },
    )
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data).toBeNull()
  })

  it('returns cached orderbook when set for the same coin and tier', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const book: ProcessedOrderbook = {
      bids: [{ price: 100, size: 1, total: 1, percentage: 100 }],
      asks: [],
      spread: 1,
      spreadPercentage: 0.01,
      midPrice: 100,
      bestBid: 100,
      bestAsk: 101,
      timestamp: 0,
    }
    queryClient.setQueryData(queryKeys.orderbook('BTC', 0), book)

    function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    }

    const { result } = renderHook(() => useOrderbook('BTC', 0), {
      wrapper: Wrapper,
    })

    await waitFor(() => {
      expect(result.current.data).toEqual(book)
    })
  })
})
