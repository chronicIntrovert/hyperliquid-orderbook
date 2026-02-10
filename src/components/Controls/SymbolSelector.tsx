import type { FC } from 'react'
import type { Coin } from '../../types'

interface SymbolSelectorProps {
  value: Coin
  onChange: (value: Coin) => void
}

export const SymbolSelector: FC<SymbolSelectorProps> = ({ value, onChange }) => (
  <label className="flex items-center gap-2 text-xs text-text-secondary">
    <span>Symbol</span>
    <select
      className="rounded bg-bg-tertiary px-2 py-1 text-text-primary"
      value={value}
      onChange={(event) => onChange(event.target.value as Coin)}
    >
      <option value="BTC">BTC</option>
      <option value="ETH">ETH</option>
    </select>
  </label>
)

