import type { FC } from 'react'
import { useState } from 'react'
import { DEFAULTS } from '../utils/constants'
import type { Coin, PrecisionLevel } from '../types'
import { useOrderbookSocket } from '../hooks/useOrderbookSocket'
import { SymbolSelector } from './Controls/SymbolSelector'
import { PrecisionSelector } from './Controls/PrecisionSelector'
import { ConnectionStatus } from './ConnectionStatus'
import { Orderbook } from './Orderbook/Orderbook'

export const OrderbookWidget: FC = () => {
  const [coin, setCoin] = useState<Coin>(DEFAULTS.coin)
  const [precisionLevel, setPrecisionLevel] = useState<PrecisionLevel>(
    DEFAULTS.precisionLevel,
  )

  useOrderbookSocket(coin, precisionLevel)

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg-primary text-text-primary">
      <div className="w-full max-w-md space-y-3 rounded-lg border border-bg-tertiary bg-bg-secondary p-3 shadow-lg">
        <header className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <SymbolSelector value={coin} onChange={setCoin} />
            <PrecisionSelector value={precisionLevel} onChange={setPrecisionLevel} />
          </div>
          <ConnectionStatus />
        </header>

        <Orderbook coin={coin} precisionLevel={precisionLevel} />
      </div>
    </div>
  )
}

