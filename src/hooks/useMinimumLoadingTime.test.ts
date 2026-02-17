import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useMinimumLoadingTime } from './useMinimumLoadingTime'

const DURATION_MS = 1000

describe('useMinimumLoadingTime', () => {
  it('returns false until durationMs has elapsed', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() =>
      useMinimumLoadingTime(DURATION_MS),
    )
    expect(result.current).toBe(false)
    act(() => {
      vi.advanceTimersByTime(DURATION_MS - 1)
    })
    expect(result.current).toBe(false)
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe(true)
    vi.useRealTimers()
  })

  it('returns true after durationMs has elapsed', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() =>
      useMinimumLoadingTime(DURATION_MS),
    )
    act(() => {
      vi.advanceTimersByTime(DURATION_MS)
    })
    expect(result.current).toBe(true)
    vi.useRealTimers()
  })
})
