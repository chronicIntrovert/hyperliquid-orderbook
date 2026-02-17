import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SymbolSelector } from './SymbolSelector'

describe('SymbolSelector', () => {
  it('renders Symbol label and select with current value', () => {
    const onChange = vi.fn()
    render(<SymbolSelector value="BTC" onChange={onChange} />)
    expect(screen.getByText('Symbol')).toBeInTheDocument()
    const select = screen.getByRole('combobox', { name: /symbol/i })
    expect(select).toHaveValue('BTC')
  })

  it('calls onChange when user selects another coin', async () => {
    const onChange = vi.fn()
    render(<SymbolSelector value="BTC" onChange={onChange} />)
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: /symbol/i }),
      'ETH',
    )
    expect(onChange).toHaveBeenCalledWith('ETH')
  })
})
