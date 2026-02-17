import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from './ErrorBoundary'

const ThrowError: React.FC = () => {
  throw new Error('test error')
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <span>Child content</span>
      </ErrorBoundary>,
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('renders fallback when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    )
    expect(screen.getByText(/orderbook unavailable/i)).toBeInTheDocument()
    expect(screen.getByText(/test error/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('calls onError when error is caught', () => {
    const onError = vi.fn()
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>,
    )
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'test error' }),
    )
  })

  it('calls onReset when Try again is clicked', async () => {
    const onReset = vi.fn()
    render(
      <ErrorBoundary onReset={onReset}>
        <ThrowError />
      </ErrorBoundary>,
    )
    await userEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('renders fallback inside wrapper when wrapperClassName and wrapperDataTestId are set', () => {
    render(
      <ErrorBoundary
        wrapperClassName="custom-wrapper"
        wrapperDataTestId="error-wrapper"
      >
        <ThrowError />
      </ErrorBoundary>,
    )
    const wrapper = screen.getByTestId('error-wrapper')
    expect(wrapper).toHaveClass('custom-wrapper')
    expect(screen.getByText(/orderbook unavailable/i)).toBeInTheDocument()
  })
})
