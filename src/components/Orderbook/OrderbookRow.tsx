import type { FC } from 'react'
import { memo } from 'react'
import type { OrderbookLevel } from '../../types'
import { useRowFlash } from '../../hooks/useRowFlash'
import { formatPrice, formatSize } from '../../utils/format'
import { DepthBar } from './DepthBar'

interface OrderbookRowProps {
  level: OrderbookLevel
  side: 'bid' | 'ask'
}

const OrderbookRowComponent: FC<OrderbookRowProps> = ({ level, side }) => {
  const flashStyle = useRowFlash(level.sizeChangeDirection ?? undefined, side)

  const priceClass = side === 'bid' ? 'text-bid' : 'text-ask'

  return (
    <div style={flashStyle}>
      <DepthBar percentage={level.percentage} side={side}>
        <span className={priceClass}>
          {formatPrice(level.price)}
        </span>
        <span className="text-secondary">
          {formatSize(level.size)}
        </span>
        <span className="text-primary">
          {formatSize(level.total)}
        </span>
      </DepthBar>
    </div>
  )
}

export const OrderbookRow = memo(OrderbookRowComponent)
