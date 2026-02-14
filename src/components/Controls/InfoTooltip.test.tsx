import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { InfoLegend } from './InfoTooltip'

function mockMatchMedia(matches: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )
}

describe('InfoLegend', () => {
  beforeEach(() => {
    mockMatchMedia(false)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('when open, renders all legend sections so content is fully accessible', () => {
    render(
      <InfoLegend open={true} onOpenChange={() => {}} />,
    )

    const region = screen.getByRole('region', { name: /legend content/i })
    expect(region).toBeInTheDocument()
    expect(screen.getAllByText('Orderbook Legend').length).toBeGreaterThanOrEqual(1)
    expect(within(region).getByText('Price')).toBeInTheDocument()
    expect(within(region).getByText('Size')).toBeInTheDocument()
    expect(within(region).getByText('Total')).toBeInTheDocument()
    expect(within(region).getByRole('heading', { name: 'Depth Bars' })).toBeInTheDocument()
    expect(within(region).getByRole('heading', { name: 'Row Flashes' })).toBeInTheDocument()
    expect(within(region).getByRole('heading', { name: 'Spread' })).toBeInTheDocument()
  })

  it('when open, legend content is in a scrollable region so full content can be reached', () => {
    render(
      <InfoLegend open={true} onOpenChange={() => {}} />,
    )

    const region = screen.getByRole('region', { name: /legend content/i })
    expect(region).toBeInTheDocument()
    expect(region).toHaveClass('overflow-y-auto')
    expect(region).toHaveClass('min-h-0')
  })
})
