import type { FC } from 'react'
import { useConnection } from '../hooks/useConnection'

interface ConnectionStatusProps {
  onRetry?: () => void
  /** When true, show "Errored" (e.g. orderbook error boundary caught an error). */
  orderbookErrored?: boolean
}

export const ConnectionStatus: FC<ConnectionStatusProps> = ({
  onRetry,
  orderbookErrored = false,
}) => {
  const { data } = useConnection()

  const status = data?.status ?? 'connecting'

  let label: string
  let colorClass: string
  if (orderbookErrored) {
    label = 'Errored'
    colorClass = 'text-red-400'
  } else if (status === 'connected') {
    label = 'Connected'
    colorClass = 'text-emerald-400'
  } else if (status === 'error') {
    label = 'Error'
    colorClass = 'text-red-400'
  } else if (status === 'disconnected') {
    label = 'Reconnecting'
    colorClass = 'text-yellow-400'
  } else {
    label = 'Connecting'
    colorClass = 'text-yellow-400'
  }

  const showRetry =
    (status === 'error' || status === 'disconnected') && onRetry != null

  return (
    <div className={`flex items-center gap-2 text-xs ${colorClass}`}>
      <span className="inline-block h-2 w-2 rounded-full bg-current" />
      <span>{label}</span>
      {showRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded px-1.5 py-0.5 text-current underline hover:no-underline focus:outline-none focus:ring-1 focus:ring-current"
        >
          Retry
        </button>
      )}
    </div>
  )
}

