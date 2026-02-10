# Update Tests After Code Changes

Use this after you (or the agent) have changed implementation code and need to keep tests in sync.

## Step 1 — What changed

- List **what** changed: behavior, function signatures, types, constants, or exports (e.g. renamed `NSigFigs` → `PrecisionLevel`, new mapping in `constants.ts`, subscription payload shape).
- Note **which files** in `src/` were modified.

## Step 2 — Find affected tests

- **Unit tests**: Same directory or `*.test.ts` next to the module (e.g. `src/lib/orderbook.test.ts` for `orderbook.ts`). Also `src/setupTests.ts` if globals or mocks changed.
- **E2E**: `tests/*.spec.ts` (Playwright) — affected if UI, selectors, or user flows changed.
- Search for imports or references to the changed module, type, or constant.

## Step 3 — Update tests

- **Assertions**: Update expected values, types, and snapshots to match new behavior.
- **Mocks/fixtures**: Update test data (e.g. messages, constants) to use new types or values.
- **Coverage**: If new branches or edge cases were added, add or extend tests for them. Remove or rewrite tests that no longer apply.

## Step 4 — Run and fix

- Run `npm run test`. Fix any failures; do not leave tests skipped or disabled.
- If E2E might be affected, run `npm run test:e2e` and fix spec or app behavior.

Invoke this prompt with the changed files or a short description (e.g. "We refactored nSigFigs to precisionLevel; update tests.").
