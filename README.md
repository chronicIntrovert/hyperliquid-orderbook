# Hyperliquid Orderbook Widget (POC)

Real-time L2 orderbook widget for BTC/ETH via Hyperliquid WebSocket. React + Vite + TypeScript + TanStack Query + Tailwind CSS.

## Run locally

```bash
npm install
cp .env.example .env   # optional; defaults to wss://api.hyperliquid.xyz/ws
npm run dev
```

Open http://localhost:5173. Use the Symbol and nSigFigs dropdowns; the book updates live over WebSocket.

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

- `src/components/OrderbookWidget.tsx` – main widget; symbol/precision state and layout
- `src/hooks/useOrderbookSocket.ts` – WebSocket lifecycle, writes to TanStack Query cache
- `src/hooks/useOrderbook.ts` – reads orderbook from cache
- `src/lib/orderbook.ts` – `processOrderbookData` (raw l2Book → processed bids/asks/spread)
- `src/types/index.ts` – `Coin`, `NSigFigs`, `ProcessedOrderbook`, query keys
