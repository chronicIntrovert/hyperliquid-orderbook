# Deploy to Cloudflare Pages

## Option 1: Connect to Git (recommended)

1. Go to dash.cloudflare.com, Workers & Pages, Create, Pages, Connect to Git.
2. Select your Git provider and the hyperliquid-orderbook repo.
3. Build command: `npm run build`. Build output directory: `dist`. Root: empty.
4. Optional: Environment variable NODE_VERSION = 20.
5. Save and Deploy. URL will be like https://PROJECT.pages.dev. Pushes to the branch auto-deploy.

## Option 2: Direct upload with Wrangler

1. Run: npm install -D wrangler
2. Run: npm run build
3. Run: npx wrangler pages login
4. Run: npx wrangler pages deploy dist --project-name=hyperliquid-orderbook

First run may prompt to create the Pages project. Demo URL: https://hyperliquid-orderbook.pages.dev

## Environment variables

The app uses VITE_WS_URL at build (default wss://api.hyperliquid.xyz/ws). Add in dashboard if you need a custom WebSocket URL.
