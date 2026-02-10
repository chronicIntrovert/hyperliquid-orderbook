import type { FC } from 'react'
import { useOrderbook } from '../../hooks/useOrderbook'
import {
  DEFAULTS,
  precisionLevelToPriceDecimals,
} from '../../utils/constants'
import type { Coin, PrecisionLevel } from '../../types'
import { OrderbookSide } from './OrderbookSide'
import { SpreadDisplay } from './SpreadDisplay'

const TABLE_HEADER_CLASS =
  'grid grid-cols-3 border-b border-bg-tertiary px-2 py-1 text-xs text-text-secondary'

interface OrderbookProps {
  coin: Coin
  precisionLevel: PrecisionLevel
}

export const Orderbook: FC<OrderbookProps> = ({ coin, precisionLevel }) => {
  const { data } = useOrderbook(coin, precisionLevel)
  const priceDecimals = precisionLevelToPriceDecimals(precisionLevel)

  return (
    <div className="flex flex-col overflow-hidden rounded border border-bg-tertiary bg-bg-secondary">
      <div className={`${TABLE_HEADER_CLASS} hidden md:grid`}>
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      <div className="flex flex-1 flex-wrap md:flex-nowrap md:flex-col">
        <div className="w-full flex-shrink-0 md:order-2">
          <SpreadDisplay book={data ?? null} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col md:order-3">
          <div className={`${TABLE_HEADER_CLASS} md:hidden`}>
            <span>Price</span>
            <span className="text-right">Size</span>
            <span className="text-right">Total</span>
          </div>
          <OrderbookSide
            levels={data?.bids ?? []}
            side="bid"
            priceDecimals={priceDecimals}
            rows={DEFAULTS.rowsPerSide}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col border-l border-bg-tertiary md:order-1 md:border-l-0">
          <div className={`${TABLE_HEADER_CLASS} md:hidden`}>
            <span>Price</span>
            <span className="text-right">Size</span>
            <span className="text-right">Total</span>
          </div>
          <OrderbookSide
            levels={data?.asks ?? []}
            side="ask"
            priceDecimals={priceDecimals}
            rows={DEFAULTS.rowsPerSide}
          />
        </div>
      </div>
    </div>
  )
}

