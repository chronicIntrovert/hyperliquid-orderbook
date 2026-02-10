import type { FC } from 'react'
import type { PrecisionLevel } from '../../types'
import { PRECISION_LEVELS } from '../../utils/constants'

interface PrecisionSelectorProps {
  value: PrecisionLevel
  onChange: (value: PrecisionLevel) => void
}

export const PrecisionSelector: FC<PrecisionSelectorProps> = ({
  value,
  onChange,
}) => (
  <label className="flex items-center gap-2 text-xs text-text-secondary">
    <span>Precision</span>
    <select
      className="rounded bg-bg-tertiary px-2 py-1 text-text-primary"
      value={value}
      onChange={(event) =>
        onChange(Number(event.target.value) as PrecisionLevel)
      }
    >
      {PRECISION_LEVELS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
)
