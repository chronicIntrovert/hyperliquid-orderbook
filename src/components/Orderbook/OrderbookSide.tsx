import type { FC } from 'react'
import type { OrderbookLevel } from '../../types'
import { OrderbookRow } from './OrderbookRow'

interface OrderbookSideProps {
  levels: OrderbookLevel[]
  side: 'bid' | 'ask'
  priceDecimals: number
  rows: number
}

export const OrderbookSide: FC<OrderbookSideProps> = ({
  levels,
  side,
  priceDecimals,
  rows,
}) => {
  const truncated =
    side === 'ask'
      ? [...levels.slice(0, rows)].reverse()
      : levels.slice(0, rows)

  return (
    <div className="flex flex-col">
      {truncated.map((level: OrderbookLevel) => (
        <OrderbookRow
          key={level.price}
          level={level}
          side={side}
          priceDecimals={priceDecimals}
        />
      ))}
    </div>
  )
}

