# New Feature Workflow

Use this when adding a new capability or change that affects behavior or scope.

## Step 1 — Problem statement

Before any design or code:

- What is the **goal** and **value** (for whom)?
- What are the **requirements** (functional and non-functional)?
- Does this fit **PRD scope** (Section 3)? If not, note the scope change.

If the user has not provided this, ask for a short problem statement and confirm scope against `docs/PRD.md`.

## Step 2 — Design document

Produce a design doc that includes:

- **Current context**: Relevant parts of the existing system and what gap this addresses.
- **Requirements**: Functional and non-functional (performance, observability, security as needed).
- **Design decisions**: Key choices with rationale and trade-offs.
- **Technical design**: Components/hooks/data flow; types; integration with existing orderbook/WebSocket/Query.
- **Implementation plan**: Phased steps (e.g. Phase 1: core logic, Phase 2: UI, Phase 3: polish).
- **Testing strategy**: Unit and integration (e.g. `lib/orderbook`, hooks, or E2E where relevant).

Use the project’s design doc template (see user rules). Do **not** start implementation until we agree on the design.

## Step 3 — Implementation

- Work in a **new branch** (e.g. `feature/short-name`).
- Implement in **phases**; keep each PR reviewable.
- Follow `.cursor/rules/`: architecture, React/orderbook performance, WebSocket/Query patterns, types in `src/types`, constants in `utils/constants.ts`.

## Step 4 — Pull request

- Open a PR with a clear title and description (problem, approach, testing).
- Run tests and fix any failures. Ensure no new console errors in normal operation.
- Request review; do not merge without approval.

---

**Reminder**: If the user says "just add X", suggest: "I'll follow our process: can we lock a one-sentence problem statement and confirm it’s in scope? Then I’ll draft a short design for your review before coding."
