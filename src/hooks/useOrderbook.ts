import { useQuery } from '@tanstack/react-query'
import {
  queryKeys,
  type Coin,
  type PrecisionLevel,
  type ProcessedOrderbook,
} from '../types'

export const useOrderbook = (coin: Coin, precisionLevel: PrecisionLevel) =>
  useQuery<ProcessedOrderbook | null>({
    queryKey: queryKeys.orderbook(coin, precisionLevel),
    queryFn: async () => null,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

