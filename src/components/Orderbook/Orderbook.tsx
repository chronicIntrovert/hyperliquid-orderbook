import type { FC } from 'react'
import { useOrderbook } from '../../hooks/useOrderbook'
import { useMinimumLoadingTime } from '../../hooks/useMinimumLoadingTime'
import { ANIMATION, DEFAULTS } from '../../utils/constants'
import type { Coin, PrecisionTier } from '../../types'
import { OrderbookSide } from './OrderbookSide'
import { SpreadDisplay } from './SpreadDisplay'
import { LoadingOverlay } from './LoadingOverlay'
import { OrderbookMobileRow } from './OrderbookMobileRow'

const DESKTOP_HEADER_CLASS =
  'grid grid-cols-3 border-b border-elevated px-2 py-1 text-xs text-secondary'

const MOBILE_HEADER_CLASS =
  'grid grid-cols-4 border-b border-elevated px-2 py-1 text-xs text-secondary'

interface OrderbookProps {
  coin: Coin
  tier: PrecisionTier
}

export const Orderbook: FC<OrderbookProps> = ({ coin, tier }) => {
  const { data } = useOrderbook(coin, tier)

  const shimmerDone = useMinimumLoadingTime(ANIMATION.shimmerDurationMs)
  const showData = data != null && shimmerDone

  const bidLevels = showData ? data.bids.slice(0, DEFAULTS.rowsPerSide) : []
  const askLevels = showData
    ? data.asks.slice(0, DEFAULTS.rowsPerSide)
    : []

  return (
    <div className="relative flex flex-col overflow-hidden rounded border border-elevated bg-panel">
      {/* Mobile: 4-column layout (Total | Price | Price | Total), no Size, no spread row */}
      <div className="flex flex-col md:hidden">
        <div className={MOBILE_HEADER_CLASS}>
          <span>Total ({coin})</span>
          <span>Price</span>
          <span>Price</span>
          <span className="text-right">Total ({coin})</span>
        </div>
        <div className="flex flex-col">
          {Array.from({ length: DEFAULTS.rowsPerSide }, (_, i) => (
            <OrderbookMobileRow
              key={i}
              bidLevel={bidLevels[i] ?? null}
              askLevel={askLevels[i] ?? null}
            />
          ))}
        </div>
      </div>

      {/* Desktop: single-column asks → spread → bids */}
      <div className="hidden flex-col md:flex">
        <div className={DESKTOP_HEADER_CLASS}>
          <span>Price</span>
          <span className="text-right">Size ({coin})</span>
          <span className="text-right">Total ({coin})</span>
        </div>
        <div className="flex flex-col">
          <OrderbookSide
            levels={showData ? data.asks : []}
            side="ask"
            rows={DEFAULTS.rowsPerSide}
          />

          <SpreadDisplay book={showData ? data : null} />

          <OrderbookSide
            levels={showData ? data.bids : []}
            side="bid"
            rows={DEFAULTS.rowsPerSide}
          />
        </div>
      </div>

      {!showData && <LoadingOverlay />}
    </div>
  )
}
