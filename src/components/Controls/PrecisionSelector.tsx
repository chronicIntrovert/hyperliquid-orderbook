import type { FC } from 'react'
import type { Coin, PrecisionTier } from '../../types'
import { TIER_INDICES, tierToLabel } from '../../utils/constants'

interface PrecisionSelectorProps {
  coin: Coin
  value: PrecisionTier
  onChange: (value: PrecisionTier) => void
}

export const PrecisionSelector: FC<PrecisionSelectorProps> = ({
  coin,
  value,
  onChange,
}) => (
  <label className="flex items-center gap-2 text-xs text-secondary">
    <span>Precision</span>
    <select
      className="rounded bg-elevated px-2 py-1 text-primary"
      value={value}
      onChange={(event) =>
        onChange(Number(event.target.value) as PrecisionTier)
      }
    >
      {TIER_INDICES.map((tier) => (
        <option key={tier} value={tier}>
          {tierToLabel(tier, coin)}
        </option>
      ))}
    </select>
  </label>
)
