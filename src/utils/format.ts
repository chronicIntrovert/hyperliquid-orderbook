const PRICE_DECIMALS = 2

/** Formats price with two decimal places. */
export const formatPrice = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: PRICE_DECIMALS,
    maximumFractionDigits: PRICE_DECIMALS,
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

