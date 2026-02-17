import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { queryKeys } from '../lib/queryKeys'
import { ConnectionStatus } from './ConnectionStatus'

function renderWithClient(
  ui: React.ReactElement,
  connectionState: { status: string } | null,
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  queryClient.setQueryData(queryKeys.connection, connectionState)
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

describe('ConnectionStatus', () => {
  it('shows Connecting when status is connecting or data is null', () => {
    renderWithClient(<ConnectionStatus />, null)
    expect(screen.getByText('Connecting')).toBeInTheDocument()
  })

  it('shows Connected with emerald when status is connected', () => {
    renderWithClient(<ConnectionStatus />, { status: 'connected' } as any)
    expect(screen.getByText('Connected')).toBeInTheDocument()
    const wrapper = screen.getByText('Connected').closest('div')
    expect(wrapper?.className).toContain('text-emerald')
  })

  it('shows Error and Retry button when status is error and onRetry provided', async () => {
    const onRetry = vi.fn()
    renderWithClient(
      <ConnectionStatus onRetry={onRetry} />,
      { status: 'error' } as any,
    )
    expect(screen.getByText('Error')).toBeInTheDocument()
    const retry = screen.getByRole('button', { name: /retry/i })
    await userEvent.click(retry)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('shows Reconnecting when status is disconnected', () => {
    renderWithClient(<ConnectionStatus />, { status: 'disconnected' } as any)
    expect(screen.getByText('Reconnecting')).toBeInTheDocument()
  })

  it('shows Errored when orderbookErrored is true', () => {
    renderWithClient(
      <ConnectionStatus orderbookErrored />,
      { status: 'connected' } as any,
    )
    expect(screen.getByText('Errored')).toBeInTheDocument()
  })
})
