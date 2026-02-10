import type { FC } from 'react'
import type { ProcessedOrderbook } from '../../types'
import { formatSpread } from '../../utils/format'

interface SpreadDisplayProps {
  book: ProcessedOrderbook | null | undefined
}

export const SpreadDisplay: FC<SpreadDisplayProps> = ({ book }) => {
  if (!book || book.spread <= 0) {
    return (
      <div className="border-y border-bg-tertiary px-2 py-1 text-center text-xs text-text-muted">
        Waiting for book...
      </div>
    )
  }

  return (
    <div className="border-y border-bg-tertiary px-2 py-1 text-center text-xs text-text-secondary">
      <span className="mr-2 text-text-muted">Spread</span>
      <span>{formatSpread(book.spread, book.spreadPercentage)}</span>
    </div>
  )
}

