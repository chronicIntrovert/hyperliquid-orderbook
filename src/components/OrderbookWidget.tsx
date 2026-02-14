import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { DEFAULTS, ORDERBOOK_MIN_HEIGHT_REM } from '../utils/constants'
import { queryKeys } from '../lib/queryKeys'
import type { Coin, PrecisionTier } from '../types'
import { useConnection } from '../hooks/useConnection'
import { useOrderbookSocket } from '../hooks/useOrderbookSocket'
import { SymbolSelector } from './Controls/SymbolSelector'
import { PrecisionSelector } from './Controls/PrecisionSelector'
import { InfoLegend } from './Controls/InfoTooltip'
import { ConnectionStatus } from './ConnectionStatus'
import { ErrorBoundary } from './ErrorBoundary'
import { Orderbook } from './Orderbook'

const ORDERBOOK_CONTAINER_CLASS =
  'relative flex flex-col overflow-hidden rounded border border-bg-tertiary bg-bg-secondary'

export const OrderbookWidget: FC = () => {
  const queryClient = useQueryClient()
  const [coin, setCoin] = useState<Coin>(DEFAULTS.coin)
  const [tier, setTier] = useState<PrecisionTier>(DEFAULTS.precisionTier)
  const [infoOpen, setInfoOpen] = useState(false)
  const [orderbookError, setOrderbookError] = useState(false)

  const { data: connectionState } = useConnection()
  const { retry } = useOrderbookSocket(coin, tier)
  const connectionStatus = connectionState?.status ?? 'connecting'

  const handleCoinChange = useCallback(
    (newCoin: Coin) => {
      queryClient.setQueryData(queryKeys.orderbook(newCoin, tier), null)
      setCoin(newCoin)
    },
    [queryClient, tier],
  )

  const handleTierChange = useCallback(
    (newTier: PrecisionTier) => {
      queryClient.setQueryData(queryKeys.orderbook(coin, newTier), null)
      setTier(newTier)
    },
    [queryClient, coin],
  )

  const handleOrderbookError = useCallback(() => {
    setOrderbookError(true)
  }, [])

  const handleOrderbookReset = useCallback(() => {
    setOrderbookError(false)
  }, [])

  /** Clear "Errored" when the orderbook connection is good again. */
  useEffect(() => {
    if (connectionStatus === 'connected') {
      setOrderbookError(false)
    }
  }, [connectionStatus])

  return (
    <div className="flex min-h-screen w-full flex-col bg-page text-primary md:items-center md:justify-center md:p-4">
      <div className="relative flex w-full min-h-screen flex-col md:min-h-0 md:max-w-md md:rounded-lg">
        <div className="flex flex-1 flex-col space-y-3 border-0 border-elevated bg-panel p-2 shadow-lg md:rounded-lg md:border md:p-3">
          <header className="flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-3">
              <InfoLegend open={infoOpen} onOpenChange={setInfoOpen} />
              <SymbolSelector value={coin} onChange={handleCoinChange} />
              <PrecisionSelector
                coin={coin}
                value={tier}
                onChange={handleTierChange}
              />
            </div>
            <ConnectionStatus
              onRetry={retry}
              orderbookErrored={orderbookError}
            />
          </header>

          <ErrorBoundary
            key={connectionStatus}
            onError={handleOrderbookError}
            onReset={handleOrderbookReset}
            wrapperClassName={`${ORDERBOOK_CONTAINER_CLASS} flex flex-col items-center justify-center`}
            wrapperStyle={{ minHeight: `${ORDERBOOK_MIN_HEIGHT_REM}rem` }}
            wrapperDataTestId="orderbook-error-fallback"
          >
            <Orderbook
              key={`${coin}-${tier}`}
              coin={coin}
              tier={tier}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}
