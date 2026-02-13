import { QueryClient } from '@tanstack/react-query'

/**
 * Orderbook and connection state are push-based: useOrderbookSocket writes
 * via setQueryData; useOrderbook and useConnection only read. Their queryFn
 * return null; see lib/queryKeys.ts and the hooks for the contract.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  },
})

