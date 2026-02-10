import type { FC, PropsWithChildren } from 'react'

interface DepthBarProps extends PropsWithChildren {
  percentage: number
  side: 'bid' | 'ask'
}

export const DepthBar: FC<DepthBarProps> = ({ percentage, side, children }) => {
  const clamped = Math.max(0, Math.min(100, percentage))
  const isBid = side === 'bid'
  const colorClass = isBid ? 'bg-bid-bg' : 'bg-ask-bg'

  return (
    <div className="relative overflow-hidden">
      <div
        className={`absolute inset-y-0 ${isBid ? 'right-0' : 'left-0'} ${colorClass}`}
        style={{
          width: `${clamped}%`,
          transition: 'width 150ms ease-out',
        }}
      />
      <div className="relative z-10 flex w-full items-center justify-between px-2 py-0.5 text-xs font-mono text-text-primary">
        {children}
      </div>
    </div>
  )
}

