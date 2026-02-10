import type { FC } from 'react'
import { memo, useEffect, useState } from 'react'
import type { OrderbookLevel } from '../../types'
import { DepthBar } from './DepthBar'
import { formatPrice, formatSize } from '../../utils/format'

interface OrderbookRowProps {
  level: OrderbookLevel
  side: 'bid' | 'ask'
  priceDecimals: number
}

const OrderbookRowComponent: FC<OrderbookRowProps> = ({
  level,
  side,
  priceDecimals,
}) => {
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    const dir = level.sizeChangeDirection
    if (dir !== 'increased' && dir !== 'decreased') {
      return
    }
    setFlash(true)
    const timeoutId = window.setTimeout(() => setFlash(false), 300)
    return () => window.clearTimeout(timeoutId)
  }, [level.sizeChangeDirection])

  const priceClass =
    side === 'bid' ? 'text-bid' : 'text-ask'
  const flashClass =
    side === 'bid' ? 'flash-bid' : 'flash-ask'

  return (
    <div
      className={
        flash ? `animate-flash ${flashClass}` : ''
      }
    >
      <DepthBar percentage={level.percentage} side={side}>
        <span className={priceClass}>
          {formatPrice(level.price, priceDecimals)}
        </span>
        <span className="text-text-secondary">
          {formatSize(level.size)}
        </span>
        <span className="text-text-muted">
          {formatSize(level.total)}
        </span>
      </DepthBar>
    </div>
  )
}

export const OrderbookRow = memo(OrderbookRowComponent)

