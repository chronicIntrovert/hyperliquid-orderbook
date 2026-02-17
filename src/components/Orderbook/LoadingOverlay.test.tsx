import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingOverlay } from './LoadingOverlay'

describe('LoadingOverlay', () => {
  it('renders connecting message and logo', () => {
    render(<LoadingOverlay />)
    expect(
      screen.getByText(/connecting to orderbook/i),
    ).toBeInTheDocument()
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
