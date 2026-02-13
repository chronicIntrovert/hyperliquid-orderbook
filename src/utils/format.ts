const MAX_PRICE_DECIMALS = 2

/** Formats price with at most two decimal places (tier decimals are capped). */
export const formatPrice = (value: number, decimals: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: Math.min(decimals, MAX_PRICE_DECIMALS),
    maximumFractionDigits: MAX_PRICE_DECIMALS,
  })

export const formatSize = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })

export const formatSpread = (spread: number, percentage: number): string =>
  `${spread.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} (${percentage.toFixed(3)}%)`

