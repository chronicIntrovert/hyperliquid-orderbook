/**
 * Centralized app config from environment.
 * Single place for env vars and defaults; easier to test and document.
 */

/** WebSocket URL for Hyperliquid L2 orderbook. Default: production API. */
export function getWsUrl(): string {
  return import.meta.env.VITE_WS_URL ?? 'wss://api.hyperliquid.xyz/ws'
}
