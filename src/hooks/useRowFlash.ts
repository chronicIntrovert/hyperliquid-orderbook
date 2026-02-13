import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { ANIMATION, ROW_FLASH_BG } from '../utils/constants'
import type { OrderbookLevel } from '../types'

/**
 * Returns inline style that briefly tints the row by side then transitions back.
 * Flash colors and timing come from constants (ANIMATION, ROW_FLASH_BG).
 */
export function useRowFlash(
  direction: OrderbookLevel['sizeChangeDirection'],
  side: 'bid' | 'ask',
): CSSProperties {
  const [flashing, setFlashing] = useState(false)

  useEffect(() => {
    if (direction !== 'increased' && direction !== 'decreased') return
    setFlashing(true)
    const t = window.setTimeout(
      () => setFlashing(false),
      ANIMATION.flashSettleDelayMs,
    )
    return () => window.clearTimeout(t)
  }, [direction])

  return {
    transition: `background-color ${ANIMATION.flashDurationMs}ms ease-out`,
    backgroundColor: flashing ? ROW_FLASH_BG[side] : 'transparent',
  }
}
