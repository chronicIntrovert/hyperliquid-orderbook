# PRD: Hyperliquid Orderbook Widget (Live WebSocket Feed)

Owner: Thinh
Copyright: © 2026
Target: AI Coding Agent (Codex, Claude Code, etc.)

## 1. Goal and Problem

We're building a real-time orderbook widget that displays live L2 orderbook data from Hyperliquid's WebSocket API:

- Focus: Live, fluid orderbook visualization for BTC and ETH trading pairs
- Output: React (Vite) web widget with professional trading UI
- No backend required, pure frontend WebSocket connection

The widget should feel "alive" with smooth updates, clear visual hierarchy, and professional trader-grade UX comparable to Hyperliquid, Binance, and Bybit.

## 2. Success Metrics

- Liveness: Real-time updates via WebSocket with no perceptible lag
- Smoothness: Fluid CSS transitions during fast and slow market conditions
- Readability: Clear price/size display with visual feedback on changes
- Performance: Minimal re-renders via React.memo and stable keys, 60fps target
- Demo: Live deployed webpage shareable via URL (Vercel, Netlify, or Cloudflare Pages)

## 3. Scope

### In Scope (MVP)
- WebSocket connection to Hyperliquid L2 orderbook
- Support for 2 symbols: BTC and ETH (dropdown selector)
- Configurable precision via nSigFigs dropdown (2-5)
- Bids/asks display with depth bar visualization
- Price/size change highlighting via CSS animations
- Spread display (absolute and percentage)
- Responsive, clean design matching Hyperliquid's dark theme
- Live deployed demo
- GitHub/GitLab repository

### Out of Scope (MVP)
- Trading functionality (no order placement)
- Authentication/login
- Multiple orderbook views (horizontal layout, etc.)
- Trade history feed
- Charts/candlesticks
- Mobile-specific layouts (responsive is sufficient)
- Backend/API server
- WebGL rendering (DOM with CSS transitions is sufficient for 15 rows)

## 4. User Stories

1) As a trader, I want to see live bid/ask prices updating in real-time so I can monitor market depth
2) As a trader, I want visual feedback when prices/sizes change so I can quickly identify market movements
3) As a trader, I want to switch between BTC and ETH orderbooks seamlessly
4) As a trader, I want to adjust price precision (nSigFigs) to control orderbook granularity
5) As a reviewer, I want to see clean, performant code without unnecessary bloat

## 5. Orderbook Fundamentals

Understanding for implementation context:

### Structure
- **Bids (buyers):** Orders to buy, sorted highest price first (best bid at top, near spread)
- **Asks (sellers):** Orders to sell, sorted lowest price first (best ask at bottom, near spread)
- **Spread:** Gap between best bid and best ask = `lowestAsk - highestBid`

### What Causes Updates
- New limit order placed → size appears/increases at price level
- Order cancelled → size decreases or level disappears
- Order filled → size decreases as liquidity is consumed

### Visual Feedback Meaning
- **Flash on row:** Size at that price level just changed
- **Depth bar width:** Relative liquidity at each level (bigger bar = more size = harder to move through)
- **Level appearing/disappearing:** New orders at empty price or all orders filled/cancelled

### What Traders Look For
- **Imbalance:** More size on bids vs asks suggests buying pressure
- **Walls:** Large size at one price level (support/resistance)
- **Spread width:** Tight = liquid market, wide = illiquid or volatile

## 6. Data Sources

### WebSocket API (Hyperliquid)
- Endpoint: `wss://api.hyperliquid.xyz/ws`
- Subscription type: `l2Book`
- Documentation: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions

### Subscription Message Format
```json
{
  "method": "subscribe",
  "subscription": {
    "type": "l2Book",
    "coin": "BTC",
    "nSigFigs": 5
  }
}
```

### Unsubscription Message Format
```json
{
  "method": "unsubscribe",
  "subscription": {
    "type": "l2Book",
    "coin": "BTC"
  }
}
```

### Response Format
```typescript
interface L2BookMessage {
  channel: "l2Book";
  data: {
    coin: string;
    time: number;
    levels: [
      Array<{ px: string; sz: string; n: number }>, // bids
      Array<{ px: string; sz: string; n: number }>  // asks
    ];
  };
}
```

### nSigFigs Parameter
Controls price aggregation granularity:
- `2`: Least precision, large price buckets (e.g., $95,000, $96,000)
- `3`: Low precision
- `4`: Medium precision  
- `5`: High precision, smallest buckets (e.g., $95,123, $95,124)

Higher values = more granular = more rows in orderbook.

## 7. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Build Tool | Vite | Fast dev server, simple config, no SSR overhead needed |
| Framework | React 18+ | Required by spec, hooks-based architecture |
| Language | TypeScript | Type safety, better DX |
| State/Cache | TanStack Query v5 | Cache management, DevTools, pattern from TkDodo article |
| Styling | Tailwind CSS | Rapid styling, matches dark theme needs |
| Deployment | Vercel / Netlify / Cloudflare Pages | Static hosting, easy deploys |

### Why TanStack Query for WebSockets?

Based on [TkDodo's WebSocket + React Query pattern](https://tkdodo.eu/blog/using-web-sockets-with-react-query):

- WebSocket pushes data → `queryClient.setQueryData()` writes to cache
- Components subscribe via `useQuery()` → automatic re-renders
- `staleTime: Infinity` disables background refetching (WebSocket is source of truth)
- Query keys organize cache: `['orderbook', 'BTC', 5]` vs `['orderbook', 'ETH', 3]`
- DevTools integration for debugging cache state

## 8. Core Architecture

### Component Hierarchy

```
App
├── QueryClientProvider
│   └── OrderbookWidget
│       ├── Header
│       │   ├── SymbolSelector (BTC/ETH dropdown)
│       │   └── PrecisionSelector (nSigFigs dropdown)
│       ├── ConnectionStatus (WebSocket state indicator)
│       └── Orderbook
│           ├── AsksTable (sells - reversed, lowest at bottom near spread)
│           ├── SpreadDisplay (mid-price, spread value & percentage)
│           └── BidsTable (buys - highest at top near spread)
```

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    TanStack Query Cache                  │
│                                                          │
│  ['orderbook', 'BTC', 5] → { bids: [...], asks: [...] } │
│  ['orderbook', 'ETH', 5] → { bids: [...], asks: [...] } │
│  ['connection']          → { status: 'connected', ... }  │
└─────────────────────────────────────────────────────────┘
           ▲                              │
           │ setQueryData                 │ useQuery
           │                              ▼
┌──────────┴──────────┐       ┌─────────────────────────┐
│                     │       │                         │
│ useOrderbookSocket  │       │  Orderbook Component    │
│ (WebSocket hook)    │       │  - subscribes to cache  │
│                     │       │  - renders with memo    │
└──────────┬──────────┘       └─────────────────────────┘
           │
           │ wss://api.hyperliquid.xyz/ws
           ▼
┌─────────────────────────────────────────────────────────┐
│                 Hyperliquid WebSocket                    │
└─────────────────────────────────────────────────────────┘
```

### Two-Hook Pattern

**Hook 1: `useOrderbookSocket` — WebSocket lifecycle manager**

Responsibilities:
- Opens WebSocket connection
- Subscribes to l2Book for given coin/nSigFigs
- Parses incoming messages
- Writes processed data to TanStack Query cache via `setQueryData`
- Handles reconnection with exponential backoff
- Unsubscribes and closes cleanly on unmount or param change

**Hook 2: `useOrderbook` — Cache consumer**

Responsibilities:
- Subscribes to cache via `useQuery`
- Returns current orderbook state
- Components re-render when cache updates

```typescript
// Hook 1: WebSocket manager
const useOrderbookSocket = (coin: Coin, nSigFigs: NSigFigs) => {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const ws = new WebSocket('wss://api.hyperliquid.xyz/ws')
    
    ws.onopen = () => {
      queryClient.setQueryData(['connection'], { status: 'connected' })
      ws.send(JSON.stringify({
        method: 'subscribe',
        subscription: { type: 'l2Book', coin, nSigFigs }
      }))
    }
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.channel === 'l2Book') {
        const processed = processOrderbookData(message.data)
        queryClient.setQueryData(['orderbook', coin, nSigFigs], processed)
      }
    }
    
    ws.onclose = () => {
      queryClient.setQueryData(['connection'], { status: 'disconnected' })
      // Reconnection logic here
    }
    
    return () => {
      ws.send(JSON.stringify({
        method: 'unsubscribe',
        subscription: { type: 'l2Book', coin }
      }))
      ws.close()
    }
  }, [coin, nSigFigs, queryClient])
}

// Hook 2: Cache consumer
const useOrderbook = (coin: Coin, nSigFigs: NSigFigs) => {
  return useQuery({
    queryKey: ['orderbook', coin, nSigFigs],
    queryFn: () => null, // WebSocket provides data, not HTTP
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
```

## 9. Data Models (TypeScript Interfaces)

Define types centrally in `src/types/index.ts`.

```typescript
// === Configuration Types ===
type Coin = 'BTC' | 'ETH'
type NSigFigs = 2 | 3 | 4 | 5

interface WebSocketConfig {
  coin: Coin
  nSigFigs: NSigFigs
}

// === Connection State ===
interface ConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastConnected: number | null
  reconnectAttempts: number
}

// === Raw API Types ===
interface RawLevel {
  px: string  // price as string
  sz: string  // size as string
  n: number   // number of orders
}

interface L2BookMessage {
  channel: 'l2Book'
  data: {
    coin: string
    time: number
    levels: [RawLevel[], RawLevel[]] // [bids, asks]
  }
}

// === Processed Types ===
interface OrderbookLevel {
  price: number
  size: number
  total: number           // cumulative size from top of book
  percentage: number      // depth bar width (0-100), relative to max size
}

interface ProcessedOrderbook {
  bids: OrderbookLevel[]
  asks: OrderbookLevel[]
  spread: number
  spreadPercentage: number
  midPrice: number
  bestBid: number
  bestAsk: number
  timestamp: number
}

// === Query Keys ===
const queryKeys = {
  orderbook: (coin: Coin, nSigFigs: NSigFigs) => 
    ['orderbook', coin, nSigFigs] as const,
  connection: ['connection'] as const,
}
```

## 10. UI/UX Specifications

### Color Scheme (Hyperliquid-inspired dark theme)

```css
:root {
  --bg-primary: #0d0d0d;
  --bg-secondary: #1a1a1a;
  --bg-tertiary: #262626;
  
  --text-primary: #ffffff;
  --text-secondary: #888888;
  --text-muted: #555555;
  
  --bid-color: #00c853;           /* green for buys */
  --bid-bg: rgba(0, 200, 83, 0.15);
  
  --ask-color: #ff1744;           /* red for sells */
  --ask-bg: rgba(255, 23, 68, 0.15);
  
  --flash-bid: rgba(0, 200, 83, 0.4);
  --flash-ask: rgba(255, 23, 68, 0.4);
}
```

### Layout Structure

```
┌────────────────────────────────────┐
│  [BTC ▼]  [nSigFigs: 5 ▼]    🟢   │  ← Header + connection status
├────────────────────────────────────┤
│  Price      Size       Total       │  ← Column headers
├────────────────────────────────────┤
│  95,160    4.0        12.5    ████ │  ← Asks (red depth bars)
│  95,155    1.2         8.5    ███  │     Sorted: lowest at bottom
│  95,150    2.5         7.3    ██   │     (near spread)
├────────────────────────────────────┤
│      Spread: $5.00 (0.005%)        │  ← Spread display
├────────────────────────────────────┤
│  95,145    3.1         3.1    ███  │  ← Bids (green depth bars)
│  95,140    0.8         3.9    █    │     Sorted: highest at top
│  95,135    5.2         9.1    ████ │     (near spread)
└────────────────────────────────────┘
```

### Visual Feedback (CSS-based)

**Depth Bars:**
- Extend from right edge behind row content
- Width = `(levelSize / maxSizeInBook) * 100%`
- Use CSS `transition: width 150ms ease-out` for smooth resizing

**Flash on Change:**
```css
@keyframes flash {
  0% { background-color: var(--flash-bid); }
  100% { background-color: transparent; }
}

.flash-bid {
  animation: flash 300ms ease-out;
}
```

**Implementation approach:**
- Track previous state to detect changes
- Add flash class when size at price level changes
- CSS animation handles the visual, remove class after animation ends

### Display Configuration

- Rows per side: 15 (configurable)
- Font: Monospace for price/size alignment (e.g., `JetBrains Mono`, `Fira Code`, or system monospace)
- Number formatting: Locale-aware with appropriate decimals

## 11. Performance Requirements

### CRITICAL: Minimize Re-renders

Orderbooks can update multiple times per second. Without optimization, this causes jank.

**Strategy 1: React.memo for rows**
```typescript
const OrderbookRow = memo(({ level, type }: OrderbookRowProps) => {
  // Only re-renders if level data actually changes
})
```

**Strategy 2: Stable keys (use price, not index)**
```typescript
// ✅ Good: React tracks by price, knows which rows changed
{bids.map((level) => (
  <OrderbookRow key={level.price} level={level} type="bid" />
))}

// ❌ Bad: Index keys cause all rows to re-render on shift
{bids.map((level, i) => (
  <OrderbookRow key={i} level={level} type="bid" />
))}
```

**Strategy 3: Memoize derived calculations**
```typescript
const processedBook = useMemo(() => {
  return processOrderbookData(rawData)
}, [rawData])
```

**Strategy 4: CSS transitions over JS animations**
- Let the browser's compositor handle depth bar width changes
- Use `transform` and `opacity` for animations (GPU accelerated)

### Throttling (if needed)

If Hyperliquid sends updates faster than 60fps:
```typescript
// Batch updates to animation frames
const pendingUpdate = useRef<ProcessedOrderbook | null>(null)

ws.onmessage = (event) => {
  pendingUpdate.current = processOrderbookData(JSON.parse(event.data))
  
  if (!frameScheduled.current) {
    frameScheduled.current = true
    requestAnimationFrame(() => {
      if (pendingUpdate.current) {
        queryClient.setQueryData(key, pendingUpdate.current)
      }
      frameScheduled.current = false
    })
  }
}
```

## 12. WebSocket Management

### Connection Lifecycle

1. Component mounts → open WebSocket
2. `onopen` → send subscribe message
3. `onmessage` → parse, process, write to cache
4. Params change (coin/nSigFigs) → unsubscribe old, subscribe new
5. `onclose` → attempt reconnect with backoff
6. Component unmounts → unsubscribe, close cleanly

### Reconnection Strategy

```typescript
const INITIAL_RETRY_DELAY = 1000
const MAX_RETRY_DELAY = 30000
const MAX_RETRIES = 10

const getRetryDelay = (attempt: number) => {
  return Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt), MAX_RETRY_DELAY)
}
```

### Subscription Change Handling

When user changes coin or nSigFigs:
1. Send unsubscribe for current subscription
2. Clear current orderbook from cache (prevent stale data flash)
3. Send subscribe for new parameters
4. Wait for first message before rendering

```typescript
useEffect(() => {
  // Clear stale data immediately on param change
  queryClient.setQueryData(['orderbook', coin, nSigFigs], null)
  
  // ... WebSocket setup
}, [coin, nSigFigs])
```

## 13. Module Structure (File Plan)

```
src/
├── main.tsx                    # Vite entry point
├── App.tsx                     # Root component with QueryClientProvider
├── index.css                   # Global styles, CSS variables, Tailwind
│
├── components/
│   ├── OrderbookWidget.tsx     # Main container, manages coin/nSigFigs state
│   ├── Orderbook/
│   │   ├── Orderbook.tsx       # Bids + Asks + Spread layout
│   │   ├── OrderbookSide.tsx   # Renders one side (bids or asks)
│   │   ├── OrderbookRow.tsx    # Single price level (memoized)
│   │   ├── DepthBar.tsx        # Background depth visualization
│   │   └── SpreadDisplay.tsx   # Spread indicator between sides
│   ├── Controls/
│   │   ├── SymbolSelector.tsx  # BTC/ETH dropdown
│   │   └── PrecisionSelector.tsx # nSigFigs dropdown
│   └── ConnectionStatus.tsx    # WebSocket status indicator
│
├── hooks/
│   ├── useOrderbookSocket.ts   # WebSocket connection + cache writing
│   ├── useOrderbook.ts         # Cache consumer (useQuery wrapper)
│   └── useConnection.ts        # Connection state consumer
│
├── lib/
│   ├── websocket.ts            # WebSocket utilities (reconnect logic)
│   ├── orderbook.ts            # processOrderbookData, calculations
│   └── queryClient.ts          # TanStack Query client setup
│
├── types/
│   └── index.ts                # All TypeScript interfaces
│
└── utils/
    ├── format.ts               # formatPrice, formatSize, formatSpread
    └── constants.ts            # Colors, defaults, config values
```

### Non-src Files

```
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
└── README.md
```

## 14. Configuration

### Environment Variables (.env)

```bash
# .env.example
VITE_WS_URL=wss://api.hyperliquid.xyz/ws
```

### Runtime Defaults (constants.ts)

```typescript
export const DEFAULTS = {
  coin: 'BTC' as const,
  nSigFigs: 5 as const,
  rowsPerSide: 15,
}

export const RECONNECT = {
  initialDelay: 1000,
  maxDelay: 30000,
  maxAttempts: 10,
}

export const ANIMATION = {
  flashDuration: 300,      // ms
  depthTransition: 150,    // ms
}
```

### TanStack Query Client Setup

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,           // WebSocket is source of truth
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,                  // WebSocket handles reconnection
    },
  },
})
```

## 15. Error Handling

| Scenario | Handling |
|----------|----------|
| WebSocket fails to connect | Show "Connecting..." state, retry with backoff |
| WebSocket disconnects | Show "Reconnecting..." state, auto-retry |
| Invalid message format | Log warning, skip message, don't crash |
| Subscription change | Clear cache, show loading, subscribe to new |
| Max retries exceeded | Show "Connection failed" with manual retry button |

## 16. Deployment

### Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

### Production Build

```bash
npm run build    # outputs to dist/
npm run preview  # preview production build locally
```

### Deploy Options

**Vercel:**
```bash
npm i -g vercel
vercel
```

**Netlify:**
- Drag and drop `dist/` folder, or
- Connect GitHub repo with build command: `npm run build`

**Cloudflare Pages:**
- Connect GitHub repo
- Build command: `npm run build`
- Output directory: `dist`

## 17. Acceptance Criteria (Definition of Done)

### Functional Requirements
- [ ] Live demo URL accessible and functional
- [ ] GitHub/GitLab repo with clean commit history
- [ ] WebSocket connects to Hyperliquid and receives live data
- [ ] Orderbook displays 15 levels of bids and asks
- [ ] Updates render smoothly in real-time
- [ ] Symbol dropdown switches between BTC and ETH
- [ ] Precision dropdown changes nSigFigs (2, 3, 4, 5)
- [ ] Spread displayed between bids and asks
- [ ] Depth bars show relative size at each level
- [ ] Visual flash/highlight on price level changes
- [ ] Connection status indicator visible

### Technical Requirements
- [ ] No console errors in normal operation
- [ ] Clean code without excessive bloat
- [ ] React.memo used on row components
- [ ] Stable keys (price-based) for row rendering
- [ ] TanStack Query DevTools accessible in development
- [ ] README with setup and deployment instructions

### Performance Requirements
- [ ] Smooth 60fps during rapid updates
- [ ] No visible jank when switching symbols
- [ ] Minimal re-renders (verify with React DevTools)

## 18. Design References

Study these for inspiration:
- https://app.hyperliquid.xyz/trade/BTC (primary reference for colors/layout)
- https://www.binance.com/en/trade/BTC_USDT?type=spot
- https://www.bybit.com/trade/usdt/BTCUSDT

Key elements to replicate:
- Dark theme with green/red color coding
- Horizontal depth bars behind price rows
- Monospace font for numerical alignment
- Minimal chrome, focus on data density
- Responsive to fast-moving markets