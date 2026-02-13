import type { FC, PropsWithChildren } from 'react'

/** Bar grows from this edge: 'left' = bar from left (default); 'right' = bar from right (e.g. bids on mobile). */
export type DepthBarAlign = 'left' | 'right'

interface DepthBarProps extends PropsWithChildren {
  percentage: number
  side: 'bid' | 'ask'
  /** Which edge the bar grows from. Default 'left'. Use 'right' for bid price column in mobile 4-col layout. */
  align?: DepthBarAlign
}

export const DepthBar: FC<DepthBarProps> = ({
  percentage,
  side,
  align = 'left',
  children,
}) => {
  const clamped = Math.max(0, Math.min(100, percentage))
  const isBid = side === 'bid'
  const colorClass = isBid ? 'bg-bid-bg' : 'bg-ask-bg'
  const fromRight = align === 'right'

  return (
    <div className="relative overflow-hidden">
      <div
        className={`absolute inset-y-0 ${fromRight ? 'right-0' : 'left-0'} ${colorClass}`}
        style={{
          width: `${clamped}%`,
          transition: 'width 150ms ease-out',
        }}
      />
      <div className="relative z-10 flex w-full items-center justify-between px-2 py-0.5 text-xs font-mono text-primary">
        {children}
      </div>
    </div>
  )
}

