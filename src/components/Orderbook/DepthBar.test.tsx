import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DepthBar } from './DepthBar'

describe('DepthBar', () => {
  it('renders children and bar with percentage width for bid', () => {
    render(
      <DepthBar percentage={50} side="bid">
        <span>content</span>
      </DepthBar>,
    )
    expect(screen.getByText('content')).toBeInTheDocument()
    const bar = document.querySelector('.bg-bid-bg')
    expect(bar).toBeInTheDocument()
    expect(bar).toHaveStyle({ width: '50%' })
  })

  it('uses ask background class when side is ask', () => {
    render(
      <DepthBar percentage={25} side="ask">
        <span>ask row</span>
      </DepthBar>,
    )
    const bar = document.querySelector('.bg-ask-bg')
    expect(bar).toBeInTheDocument()
    expect(bar).toHaveStyle({ width: '25%' })
  })

  it('clamps percentage to 0-100', () => {
    render(
      <DepthBar percentage={150} side="bid">
        <span>x</span>
      </DepthBar>,
    )
    const bar = document.querySelector('.bg-bid-bg')
    expect(bar).toHaveStyle({ width: '100%' })

    const { container } = render(
      <DepthBar percentage={-10} side="bid">
        <span>y</span>
      </DepthBar>,
    )
    const bar2 = container.querySelector('.bg-bid-bg')
    expect(bar2).toHaveStyle({ width: '0%' })
  })
})
