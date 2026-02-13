import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys'
import type { Coin, PrecisionTier, ProcessedOrderbook } from '../types'

/** Reads orderbook from cache. Data is pushed by useOrderbookSocket; queryFn is never used for data. */
export const useOrderbook = (coin: Coin, tier: PrecisionTier) =>
  useQuery<ProcessedOrderbook | null>({
    queryKey: queryKeys.orderbook(coin, tier),
    queryFn: async () => null,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
