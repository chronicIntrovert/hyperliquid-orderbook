/**
 * Single source of truth for supported coins. Adding a coin = add one entry here;
 * SymbolSelector, tier labels, and price decimals all derive from this config.
 *
 * Tier API params (nSigFigs/mantissa) are coin-agnostic and shared across coins;
 * display (label, priceDecimals) is per-coin because the same significant-figures
 * produce different dollar tick sizes at different price magnitudes.
 */
export const COINS = [
  {
    id: 'BTC',
    label: 'BTC',
    tiers: [
      { label: '1', priceDecimals: 4 },
      { label: '2', priceDecimals: 3 },
      { label: '5', priceDecimals: 3 },
      { label: '10', priceDecimals: 2 },
      { label: '100', priceDecimals: 1 },
      { label: '1000', priceDecimals: 0 },
    ],
  },
  {
    id: 'ETH',
    label: 'ETH',
    tiers: [
      { label: '0.1', priceDecimals: 4 },
      { label: '0.2', priceDecimals: 3 },
      { label: '0.5', priceDecimals: 3 },
      { label: '1', priceDecimals: 2 },
      { label: '10', priceDecimals: 1 },
      { label: '100', priceDecimals: 0 },
    ],
  },
] as const

export type Coin = (typeof COINS)[number]['id']

/** Tier indices 0–5 (finest → coarsest). Same count as TIER_API_PARAMS and each coin's tiers. */
export const TIER_INDICES = [0, 1, 2, 3, 4, 5] as const
export type PrecisionTier = (typeof TIER_INDICES)[number]

/**
 * Subscription params per tier (nSigFigs/mantissa). One entry per tier index.
 * Tier 0 → nSigFigs 5; Tier 1 → nSigFigs 5, mantissa 2; Tier 2 → nSigFigs 5, mantissa 5;
 * Tier 3 → nSigFigs 4; Tier 4 → nSigFigs 3; Tier 5 → nSigFigs 2.
 */
export const TIER_API_PARAMS: readonly {
  nSigFigs: number
  mantissa?: number
}[] = [
  { nSigFigs: 5 },
  { nSigFigs: 5, mantissa: 2 },
  { nSigFigs: 5, mantissa: 5 },
  { nSigFigs: 4 },
  { nSigFigs: 3 },
  { nSigFigs: 2 },
]

function getCoin(coin: Coin): (typeof COINS)[number] {
  const entry = COINS.find((c) => c.id === coin)
  if (!entry) throw new Error(`Unknown coin: ${coin}`)
  return entry
}

export const DEFAULTS = {
  coin: COINS[0].id,
  precisionTier: 0 as PrecisionTier,
  rowsPerSide: 15,
}

/**
 * Min height (rem) for the orderbook container so loading and error states
 * keep the same layout as the loaded orderbook (no layout shift).
 * Approximates: header + rowsPerSide*2 + spread.
 */
export const ORDERBOOK_MIN_HEIGHT_REM = 38

/** Build l2Book subscription params from a precision tier index. */
export const tierToSubscription = (
  tier: PrecisionTier,
): { nSigFigs: number; mantissa?: number } => {
  const params = TIER_API_PARAMS[tier]
  const result: { nSigFigs: number; mantissa?: number } = {
    nSigFigs: params.nSigFigs,
  }
  if (params.mantissa != null) {
    result.mantissa = params.mantissa
  }
  return result
}

/** Price decimal places for display (depends on coin and tier). */
export const tierToPriceDecimals = (
  tier: PrecisionTier,
  coin: Coin,
): number => getCoin(coin).tiers[tier].priceDecimals

/** Display label for a tier (depends on coin). */
export const tierToLabel = (tier: PrecisionTier, coin: Coin): string =>
  getCoin(coin).tiers[tier].label

export const RECONNECT = {
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  maxAttempts: 10,
  /** Abort connection attempt if open does not complete within this time (e.g. request hangs). */
  connectTimeoutMs: 15000,
  /** If no l2Book message is received within this time, close and reconnect (silent disconnect guard). */
  heartbeatTimeoutMs: 30000,
}

/** Max levels per side after ghost-row injection to prevent unbounded growth. */
export const MAX_ENRICHED_LEVELS_PER_SIDE = 40

export const ANIMATION = {
  /** How long the background-color transition takes to fade back to transparent. */
  flashDurationMs: 300,
  /** Delay before starting the fade-back (one frame, lets the tint paint first). */
  flashSettleDelayMs: 50,
  depthTransitionMs: 150,
  /** One full shimmer cycle on the loading logo (must match SVG animate dur). */
  shimmerDurationMs: 2000,
}

/** Row flash background colors by side (bid = green tint, ask = red tint). */
export const ROW_FLASH_BG: Readonly<Record<'bid' | 'ask', string>> = {
  bid: 'rgba(14, 203, 129, 0.22)',
  ask: 'rgba(246, 70, 93, 0.22)',
}

/** Throttle orderbook cache writes to limit re-renders when WS messages arrive at sub-ms rate. */
export const ORDERBOOK_THROTTLE_MS = 1000
