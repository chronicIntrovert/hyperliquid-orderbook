# PR Self-Review Checklist

Use this before opening a PR or when reviewing your own changes.

## PRD alignment

- [ ] Change fits **scope** (Section 3): in-scope for MVP or explicitly called out as scope change.
- [ ] **Acceptance criteria** (Section 17): any touched area still meets the listed functional, technical, and performance criteria.

## Code quality

- [ ] **Types**: New or changed types live in `src/types/index.ts`; components/hooks use them.
- [ ] **Constants**: Literals (strings, numbers) that matter are in `utils/constants.ts` or similar; no magic numbers in logic.
- [ ] **Query keys**: Only `queryKeys.orderbook(coin, precisionLevel)` and `queryKeys.connection` used for orderbook/connection cache.
- [ ] **Performance**: Row components memoized; list keys are stable (e.g. price); no unnecessary re-renders.
- [ ] **WebSocket**: Subscribe/unsubscribe and cache clear on param change; reconnect behavior matches PRD (Section 12).

## Testing and behavior

- [ ] **Tests**: New logic has unit tests (e.g. `lib/orderbook`, formatters); existing tests still pass.
- [ ] **Manual check**: No console errors in normal use; symbol and precision dropdowns work; depth and flash look correct.

## Process

- [ ] **Branch**: Changes are on a feature/fix branch, not directly on main.
- [ ] **Design**: Non-trivial features had a design doc (or short design note) agreed before implementation.

Run through this list and fix or document any gaps before requesting review.
