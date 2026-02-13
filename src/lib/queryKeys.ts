import type { Coin, PrecisionTier } from '../types'

/**
 * TanStack Query cache keys. Orderbook and connection state are push-based:
 * only useOrderbookSocket writes to the cache; useOrderbook and useConnection
 * only read. Their queryFn returns null; data is set via setQueryData in the socket hook.
 */
export const queryKeys = {
  orderbook: (coin: Coin, tier: PrecisionTier) =>
    ['orderbook', coin, tier] as const,
  connection: ['connection'] as const,
}
