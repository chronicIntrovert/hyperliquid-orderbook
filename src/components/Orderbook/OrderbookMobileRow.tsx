import type { FC } from 'react'
import { memo } from 'react'
import type { OrderbookLevel } from '../../types'
import { useRowFlash } from '../../hooks/useRowFlash'
import { formatPrice, formatSize } from '../../utils/format'

interface OrderbookMobileRowProps {
  bidLevel: OrderbookLevel | null
  askLevel: OrderbookLevel | null
  priceDecimals: number
}

/**
 * One row of the mobile 4-column layout: Bids Total | Bids Price | Asks Price | Asks Total.
 * Depth bars span the full block (total + price) so bars appear longer; bid bar grows left,
 * ask bar grows right. Flash by side (green for bid change, red for ask change).
 */
const OrderbookMobileRowComponent: FC<OrderbookMobileRowProps> = ({
  bidLevel,
  askLevel,
  priceDecimals,
}) => {
  const bidFlashStyle = useRowFlash(bidLevel?.sizeChangeDirection ?? undefined, 'bid')
  const askFlashStyle = useRowFlash(askLevel?.sizeChangeDirection ?? undefined, 'ask')

  return (
    <div className="grid grid-cols-4 border-b border-elevated/50 text-xs font-mono">
      {/* Left block: Total | Price — depth bar spans both columns (bar grows left from price) */}
      <div
        className="col-span-2 relative flex min-w-0"
        style={bidFlashStyle}
      >
        <div className="flex flex-1 items-center px-2 py-0.5 text-primary relative z-10">
          {bidLevel != null ? formatSize(bidLevel.total) : '\u00A0'}
        </div>
        <div className="flex flex-1 min-w-0 items-center px-2 py-0.5 relative z-10">
          {bidLevel != null ? (
            <span className="text-bid">
              {formatPrice(bidLevel.price, priceDecimals)}
            </span>
          ) : (
            '\u00A0'
          )}
        </div>
        {/* Full-width bar layer behind both cells (spans total + price) */}
        {bidLevel != null && (
          <div
            className="absolute inset-y-0 right-0 bg-bid-bg pointer-events-none"
            style={{
              width: `${Math.max(0, Math.min(100, bidLevel.percentage))}%`,
              transition: 'width 150ms ease-out',
            }}
          />
        )}
      </div>

      {/* Right block: Price | Total — depth bar spans both columns (bar grows right from price) */}
      <div
        className="col-span-2 relative flex min-w-0"
        style={askFlashStyle}
      >
        <div className="flex flex-1 min-w-0 items-center px-2 py-0.5 relative z-10">
          {askLevel != null ? (
            <span className="text-ask">
              {formatPrice(askLevel.price, priceDecimals)}
            </span>
          ) : (
            '\u00A0'
          )}
        </div>
        <div className="flex flex-1 items-center justify-end px-2 py-0.5 text-primary relative z-10">
          {askLevel != null ? formatSize(askLevel.total) : '\u00A0'}
        </div>
        {askLevel != null && (
          <div
            className="absolute inset-y-0 left-0 bg-ask-bg pointer-events-none"
            style={{
              width: `${Math.max(0, Math.min(100, askLevel.percentage))}%`,
              transition: 'width 150ms ease-out',
            }}
          />
        )}
      </div>
    </div>
  )
}

export const OrderbookMobileRow = memo(OrderbookMobileRowComponent)
