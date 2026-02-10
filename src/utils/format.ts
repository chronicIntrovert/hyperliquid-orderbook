export const formatPrice = (value: number, decimals: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
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

