import React from 'react'
import { describe, expect, it } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { queryKeys } from '../lib/queryKeys'
import { useConnection } from './useConnection'

function createWrapper(connectionState: { status: string } | null) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  queryClient.setQueryData(queryKeys.connection, connectionState)
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useConnection', () => {
  it('returns null when cache is empty', () => {
    const { result } = renderHook(() => useConnection(), {
      wrapper: createWrapper(null),
    })
    expect(result.current.data).toBeNull()
  })

  it('returns cached connection state when set', () => {
    const state = { status: 'connected' } as any
    const { result } = renderHook(() => useConnection(), {
      wrapper: createWrapper(state),
    })
    expect(result.current.data).toEqual(state)
  })
})
