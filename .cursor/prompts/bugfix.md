# Bugfix Workflow

Use this when fixing a defect or unexpected behavior.

## Step 1 — Reproduce and root cause

- **Reproduce**: Steps or conditions that trigger the bug (browser, symbol, nSigFigs, network, etc.).
- **Root cause**: Identify where the wrong behavior comes from (e.g. hook, `processOrderbookData`, component state, cache key, WebSocket lifecycle). Do not guess; trace from symptom to source.

If reproduction is unclear, ask for steps, environment, and any error messages or console logs.

## Step 2 — Fix and test

- **Fix**: Smallest change that fixes the cause. Respect existing patterns (query keys, memo, types, constants).
- **Test**: Add or extend a test that would have caught this (e.g. in `lib/orderbook.test.ts` or component/hook tests). If E2E is more appropriate, add or update a Playwright spec.

## Step 3 — Branch and PR

- Work in a branch (e.g. `fix/brief-description`).
- PR description: what was wrong, why it happened, how the fix works, and how we verify (manual + automated).

Do not introduce scope creep; limit the PR to the bugfix and its tests.
