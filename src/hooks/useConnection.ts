import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys'
import type { ConnectionState } from '../types'

/** Reads connection state from cache. Data is pushed by useOrderbookSocket; queryFn is never used for data. */
export const useConnection = () =>
  useQuery<ConnectionState | null>({
    queryKey: queryKeys.connection,
    queryFn: async () => null,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

