import { useEffect, useState } from 'react'

/**
 * Returns false until durationMs has elapsed, then true.
 * Use to keep a loading state visible for a minimum time (e.g. shimmer animation).
 */
export function useMinimumLoadingTime(durationMs: number): boolean {
  const [elapsed, setElapsed] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setElapsed(true), durationMs)
    return () => window.clearTimeout(id)
  }, [durationMs])

  return elapsed
}
