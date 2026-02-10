import type { FC } from 'react'
import { useOrderbook } from '../../hooks/useOrderbook'
import {
  DEFAULTS,
  precisionLevelToPriceDecimals,
} from '../../utils/constants'
import type { Coin, PrecisionLevel } from '../../types'
import { OrderbookSide } from './OrderbookSide'
import { SpreadDisplay } from './SpreadDisplay'

interface OrderbookProps {
  coin: Coin
  precisionLevel: PrecisionLevel
}

export const Orderbook: FC<OrderbookProps> = ({ coin, precisionLevel }) => {
  const { data } = useOrderbook(coin, precisionLevel)
  const priceDecimals = precisionLevelToPriceDecimals(precisionLevel)

  return (
    <div className="flex flex-col overflow-hidden rounded border border-bg-tertiary bg-bg-secondary">
      <div className="grid grid-cols-3 border-b border-bg-tertiary px-2 py-1 text-xs text-text-secondary">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      <div className="flex flex-1 flex-col">
        <OrderbookSide
          levels={data?.asks ?? []}
          side="ask"
          priceDecimals={priceDecimals}
          rows={DEFAULTS.rowsPerSide}
        />

        <SpreadDisplay book={data ?? null} />

        <OrderbookSide
          levels={data?.bids ?? []}
          side="bid"
          priceDecimals={priceDecimals}
          rows={DEFAULTS.rowsPerSide}
        />
      </div>
    </div>
  )
}

