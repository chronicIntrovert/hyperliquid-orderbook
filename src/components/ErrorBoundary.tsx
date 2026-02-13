import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Called when an error is caught (e.g. to update connection status). */
  onError?: (error: Error) => void
  /** Called when reset() is invoked (e.g. to clear error status). */
  onReset?: () => void
  /**
   * Optional wrapper for the fallback UI. When set, the fallback is rendered
   * inside this wrapper (e.g. to match a parent layout and avoid shift).
   * When unset, the fallback uses a full-page centered layout.
   */
  wrapperClassName?: string
  wrapperStyle?: React.CSSProperties
  wrapperDataTestId?: string
}

interface ErrorBoundaryState {
  error: Error | null
}

const FALLBACK_BUTTON_CLASS =
  'mt-4 rounded border border-bg-tertiary bg-bg-tertiary px-3 py-2 text-sm font-medium text-text-primary shadow-sm hover:bg-bg-primary focus:outline-none focus:ring-2 focus:ring-text-secondary focus:ring-offset-2 focus:ring-offset-bg-secondary'

/**
 * Renders the single shared fallback content (title, message, error detail, Try again).
 * Used by ErrorBoundary so there is no duplicate UI.
 */
function renderFallbackContent(
  error: Error,
  reset: () => void,
): ReactNode {
  return (
    <div className="p-6 text-center">
      <p className="font-medium text-text-primary">
        Orderbook unavailable
      </p>
      <p className="mt-2 text-sm text-text-secondary">
        The orderbook failed to load or update. This can happen due to a
        connection issue or a temporary problem. Try again to reload the
        data.
      </p>
      <p className="mt-2 break-all text-xs text-text-muted">
        {error.message}
      </p>
      <button
        type="button"
        onClick={reset}
        className={FALLBACK_BUTTON_CLASS}
      >
        Try again
      </button>
    </div>
  )
}

/**
 * Catches React errors in the tree and renders a fallback instead of unmounting.
 * Fallback content is defined here once; use wrapperClassName/wrapperStyle to
 * render it in place (e.g. orderbook container) or leave unset for full-page.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error)
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, errorInfo.componentStack)
    }
  }

  reset = (): void => {
    this.props.onReset?.()
    this.setState({ error: null })
  }

  render(): ReactNode {
    const { error } = this.state
    const { children, wrapperClassName, wrapperStyle, wrapperDataTestId } =
      this.props

    if (error == null) {
      return children
    }

    const content = renderFallbackContent(error, this.reset)

    if (wrapperClassName != null || wrapperStyle != null) {
      return (
        <div
          className={wrapperClassName}
          style={wrapperStyle}
          data-testid={wrapperDataTestId}
        >
          {content}
        </div>
      )
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-page p-4">
        <div className="rounded-lg border border-elevated bg-panel p-4 text-center text-sm text-secondary">
          {content}
        </div>
      </div>
    )
  }
}
