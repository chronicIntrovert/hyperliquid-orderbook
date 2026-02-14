import type { FC } from 'react'
import type { OrderbookLevel } from '../../types'
import { OrderbookRow } from './OrderbookRow'

/** Placeholder row that matches the height of a real OrderbookRow to prevent layout shift. */
const PlaceholderRow: FC = () => (
  <div className="px-2 py-0.5 text-xs font-mono">&nbsp;</div>
)

interface OrderbookSideProps {
  levels: OrderbookLevel[]
  side: 'bid' | 'ask'
  rows: number
}

export const OrderbookSide: FC<OrderbookSideProps> = ({
  levels,
  side,
  rows,
}) => {
  const truncated =
    side === 'ask'
      ? [...levels.slice(0, rows)].reverse()
      : levels.slice(0, rows)

  const placeholderCount = rows - truncated.length

  return (
    <div className="flex flex-col">
      {side === 'ask' &&
        Array.from({ length: placeholderCount }, (_, i) => (
          <PlaceholderRow key={`placeholder-${i}`} />
        ))}
      {truncated.map((level: OrderbookLevel) => (
        <OrderbookRow key={level.price} level={level} side={side} />
      ))}
      {side === 'bid' &&
        Array.from({ length: placeholderCount }, (_, i) => (
          <PlaceholderRow key={`placeholder-${i}`} />
        ))}
    </div>
  )
}

