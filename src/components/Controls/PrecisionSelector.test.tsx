import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PrecisionSelector } from './PrecisionSelector'

describe('PrecisionSelector', () => {
  it('renders Precision label and select with current tier value', () => {
    const onChange = vi.fn()
    render(
      <PrecisionSelector coin="BTC" value={0} onChange={onChange} />,
    )
    expect(screen.getByText('Precision')).toBeInTheDocument()
    const select = screen.getByRole('combobox', { name: /precision/i })
    expect(select).toHaveValue('0')
  })

  it('calls onChange when user selects another tier', async () => {
    const onChange = vi.fn()
    render(
      <PrecisionSelector coin="BTC" value={0} onChange={onChange} />,
    )
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: /precision/i }),
      screen.getByRole('option', { name: '2' }),
    )
    expect(onChange).toHaveBeenCalledWith(1)
  })
})
