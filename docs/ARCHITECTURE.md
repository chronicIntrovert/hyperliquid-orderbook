# Architecture & Reading the Codebase

## Data flow

1. **OrderbookWidget** holds `coin` and `tier` (and info panel state). It renders the header (symbol, precision, legend, connection status) and **Orderbook**.
2. **useOrderbookSocket(coin, tier)** opens the WebSocket (URL from `config/env.ts`), subscribes to l2Book, and on each throttled flush calls **parseAndEnrichRawOrderbook** (in `lib/orderbook.ts`). It writes the result to the TanStack Query cache via **queryKeys** (`lib/queryKeys.ts`).
3. **useOrderbook(coin, tier)** and **useConnection()** read from that same cache. Their `queryFn` returns `null`; they never fetch. Data is **push-based** from the socket only.
4. **Orderbook** uses `useOrderbook(coin, tier)` and renders bids/asks (desktop: OrderbookSide + SpreadDisplay; mobile: OrderbookMobileRow grid).

So: **Widget → useOrderbookSocket + useOrderbook → cache ← parseAndEnrichRawOrderbook**. Domain logic (parse, process, enrich) lives in **lib/orderbook.ts** and is transport-agnostic.

## Where to look first

| Goal | Files to open |
|------|----------------|
| How does data get into the UI? | `OrderbookWidget.tsx` → `useOrderbookSocket.ts` (first ~100 lines) → `useOrderbook.ts` → `lib/orderbook.ts` |
| How is the book processed? | `lib/orderbook.ts` (`processOrderbookData`, `addSizeChangeDirection`, `parseAndEnrichRawOrderbook`) |
| Cache keys and push-based contract | `lib/queryKeys.ts`, `lib/queryClient.ts` (comment) |
| Config (e.g. WS URL) | `config/env.ts` |
| Row flash animation | `hooks/useRowFlash.ts` (used by OrderbookRow and OrderbookMobileRow) |

## File tree (src)

```
src/
├── App.tsx                 # Root: ErrorBoundary + OrderbookWidget
├── main.tsx                # React root + QueryClientProvider
├── config/
│   └── env.ts              # getWsUrl() — env and defaults
├── lib/
│   ├── orderbook.ts        # processOrderbookData, addSizeChangeDirection, parseAndEnrichRawOrderbook
│   ├── orderbook.test.ts
│   ├── queryClient.ts      # TanStack Query client (push-based comment)
│   └── queryKeys.ts        # Cache keys; documents push-based usage
├── types/
│   └── index.ts            # Coin, PrecisionTier, L2BookMessage, OrderbookLevel, ProcessedOrderbook, etc.
├── utils/
│   ├── constants.ts        # PRECISION_TIERS, DEFAULTS, RECONNECT, ANIMATION, tierToSubscription, etc.
│   ├── constants.test.ts
│   ├── format.ts           # formatPrice, formatSize, formatSpread
│   └── format.test.ts
├── hooks/
│   ├── useOrderbookSocket.ts   # WebSocket lifecycle, subscribes, flushes via parseAndEnrichRawOrderbook, setQueryData
│   ├── useOrderbook.ts         # Reads orderbook from cache (push-based)
│   ├── useOrderbook.test.tsx
│   ├── useConnection.ts        # Reads connection state from cache (push-based)
│   ├── useRowFlash.ts          # Row flash style by side (bid/ask)
│   └── useMinimumLoadingTime.ts
├── components/
│   ├── ErrorBoundary.tsx       # Catches errors, shows fallback + Try again
│   ├── OrderbookWidget.tsx     # Main widget: coin/tier state, header, Orderbook
│   ├── ConnectionStatus.tsx    # Status dot + label + Retry
│   ├── Controls/
│   │   ├── SymbolSelector.tsx
│   │   ├── PrecisionSelector.tsx
│   │   ├── InfoTooltip.tsx     # Legend (Vaul drawer: side on desktop, bottom on mobile)
│   │   └── InfoTooltip.test.tsx
│   └── Orderbook/
│       ├── Orderbook.tsx       # useOrderbook + loading min time; desktop vs mobile layout
│       ├── OrderbookSide.tsx   # List of OrderbookRow (desktop)
│       ├── OrderbookRow.tsx    # One row (price, size, total, depth bar, flash)
│       ├── OrderbookRow.test.tsx
│       ├── OrderbookMobileRow.tsx  # Paired bid/ask row (mobile 4-col)
│       ├── OrderbookMobileRow.test.tsx
│       ├── DepthBar.tsx
│       ├── DepthBar.test.tsx
│       ├── SpreadDisplay.tsx
│       ├── SpreadDisplay.test.tsx
│       └── LoadingOverlay.tsx
├── index.css
└── setupTests.ts
```

## Tests

- **Unit:** Co-located with source (`*.test.ts` / `*.test.tsx`). Run: `npm run test`.
- **E2E:** `tests/orderbook.spec.ts` — connection, retry, visibility, symbol/precision, loading overlay, responsive. Run: `npm run test:e2e`.
