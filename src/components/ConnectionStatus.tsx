import type { FC } from 'react'
import { useConnection } from '../hooks/useConnection'

export const ConnectionStatus: FC = () => {
  const { data } = useConnection()

  const status = data?.status ?? 'connecting'

  const colorClass =
    status === 'connected'
      ? 'text-emerald-400'
      : status === 'error'
        ? 'text-red-400'
        : 'text-yellow-400'

  const label =
    status === 'connected'
      ? 'Connected'
      : status === 'error'
        ? 'Error'
        : status === 'disconnected'
          ? 'Reconnecting'
          : 'Connecting'

  return (
    <div className={`flex items-center gap-1 text-xs ${colorClass}`}>
      <span className="inline-block h-2 w-2 rounded-full bg-current" />
      <span>{label}</span>
    </div>
  )
}

