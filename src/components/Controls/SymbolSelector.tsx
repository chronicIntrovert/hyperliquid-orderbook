import type { FC } from 'react'
import type { Coin } from '../../types'
import { COINS } from '../../utils/constants'

interface SymbolSelectorProps {
  value: Coin
  onChange: (value: Coin) => void
}

export const SymbolSelector: FC<SymbolSelectorProps> = ({ value, onChange }) => (
  <label className="flex items-center gap-2 text-xs text-secondary">
    <span>Symbol</span>
    <select
      className="rounded bg-elevated px-2 py-1 text-primary"
      value={value}
      onChange={(event) => onChange(event.target.value as Coin)}
    >
      {COINS.map((coin) => (
        <option key={coin.id} value={coin.id}>
          {coin.label}
        </option>
      ))}
    </select>
  </label>
)

