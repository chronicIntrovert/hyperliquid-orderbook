# Hyperliquid Orderbook Widget (POC)

Real-time L2 orderbook widget for BTC/ETH via Hyperliquid WebSocket. React + Vite + TypeScript + TanStack Query + Tailwind CSS.

## Run locally

```bash
npm install
cp .env.example .env   # optional
npm run dev
```

Only **`VITE_WS_URL`** is used; default is production `wss://api.hyperliquid.xyz/ws`. Open http://localhost:5173. Use the Symbol and Precision (1, 2, 5, 10, 100, 1000) dropdowns; the book updates live over WebSocket.

## Build

```bash
npm run build
npm run preview   # serve dist/ at http://localhost:4173
```

## Tests

- **Unit (Vitest):** `npm run test`
- **E2E (Playwright):** `npm run test:e2e` (starts dev server, runs one browser test)

## AI / Cursor workflow

- **Rules**: `.cursor/rules/` — project context, process, architecture, React/orderbook and WebSocket/Query patterns (auto-applied by Cursor).
- **Prompts**: `.cursor/prompts/` — workflows for new features, bugfixes, PR review, and design docs. Use e.g. `@.cursor/prompts/new-feature.md` in chat.
- **Details**: See [.cursor/README.md](.cursor/README.md). Product scope and acceptance criteria: [docs/PRD.md](docs/PRD.md).

## Layout

- **`src/components/OrderbookWidget.tsx`** – main widget; symbol/precision state and layout
- **`src/hooks/useOrderbookSocket.ts`** – WebSocket lifecycle, writes to TanStack Query cache via `parseAndEnrichRawOrderbook` (in lib)
- **`src/hooks/useOrderbook.ts`** – reads orderbook from cache (push-based; data comes only from the socket)
- **`src/lib/orderbook.ts`** – `processOrderbookData`, `addSizeChangeDirection`, `parseAndEnrichRawOrderbook` (raw l2Book → processed bids/asks/spread)
- **`src/lib/queryKeys.ts`** – cache keys; see comment there for push-based contract
- **`src/config/env.ts`** – `getWsUrl()` (env and defaults)
- **`src/types/index.ts`** – `Coin`, `PrecisionTier`, `ProcessedOrderbook`, etc.

Full file tree and data flow: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Glossary

- **l2Book** – Level-2 orderbook (aggregated price levels from the exchange).
- **tier / precision** – Index 0–5 into tick sizes (e.g. 1, 2, 5, 10, 100, 1000); same as “Precision” in the UI.
- **nSigFigs** – API parameter for price significant figures; derived from tier.
- **spread** – Best ask − best bid; gap between best sell and best buy.

## Push to a new private remote

1. Create a **private** repo on GitHub (or GitLab): do not add a README or .gitignore.
2. Add the remote and push:
   ```bash
   git remote add origin https://github.com/YOUR_USER/hyperliquid-orderbook.git
   git push -u origin main
   ```
3. To open a PR from a feature branch later: create the branch, push it, then use the GitHub “Compare & pull request” flow.
