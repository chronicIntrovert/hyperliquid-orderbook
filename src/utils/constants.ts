import type { Coin, PrecisionLevel } from '../types'

export const DEFAULTS = {
  coin: 'BTC' as Coin,
  precisionLevel: 1 as PrecisionLevel,
  rowsPerSide: 15,
}

/** Precision options for the dropdown (1 = finest, 1000 = coarsest). */
export const PRECISION_LEVELS: PrecisionLevel[] = [1, 2, 5, 10, 100, 1000]

/**
 * Build l2Book subscription params from precision level:
 * 1 → nSigFigs 5; 2 → nSigFigs 5, mantissa 2; 5 → nSigFigs 5, mantissa 5;
 * 10 → nSigFigs 4; 100 → nSigFigs 3; 1000 → nSigFigs 2.
 */
export const precisionLevelToSubscription = (
  level: PrecisionLevel,
): { nSigFigs: number; mantissa?: number } => {
  switch (level) {
    case 1:
      return { nSigFigs: 5 }
    case 2:
      return { nSigFigs: 5, mantissa: 2 }
    case 5:
      return { nSigFigs: 5, mantissa: 5 }
    case 10:
      return { nSigFigs: 4 }
    case 100:
      return { nSigFigs: 3 }
    case 1000:
      return { nSigFigs: 2 }
  }
}

/** Price decimal places for display (derived from precision level). */
export const precisionLevelToPriceDecimals = (level: PrecisionLevel): number => {
  const map: Record<PrecisionLevel, number> = {
    1: 4,
    2: 3,
    5: 3,
    10: 2,
    100: 1,
    1000: 0,
  }
  return map[level]
}

export const RECONNECT = {
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  maxAttempts: 10,
}

export const ANIMATION = {
  flashDurationMs: 300,
  depthTransitionMs: 150,
}

