import { useQuery } from '@tanstack/react-query'
import { queryKeys, type ConnectionState } from '../types'

export const useConnection = () =>
  useQuery<ConnectionState | null>({
    queryKey: queryKeys.connection,
    queryFn: async () => null,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

