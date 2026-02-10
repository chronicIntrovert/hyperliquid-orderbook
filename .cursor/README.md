# Cursor Rules & Prompts — Agentic Workflow

This folder configures how AI agents (and humans) maintain the Hyperliquid Orderbook Widget in line with the PRD and project process.

## Rules (`.cursor/rules/`)

Rules are `.mdc` files that Cursor applies automatically based on scope:

| Rule | When it applies | Purpose |
|------|-----------------|---------|
| `00-project-context.mdc` | Always | PRD as source of truth, scope, stack |
| `04-process.mdc` | Always | Problem statement → design doc → branch → PR |
| `01-architecture.mdc` | When editing `src/**/*` | Component hierarchy, data flow, file layout |
| `02-react-orderbook.mdc` | When editing `src/components/**/*` | Memo, keys, depth/flash, Tailwind |
| `03-websocket-query.mdc` | When editing `src/hooks/**/*`, `src/lib/**/*` | Two-hook pattern, query keys, WebSocket lifecycle |
| `05-keep-tests-in-sync.mdc` | When editing `src/**/*` | After code changes, identify and update affected tests |

**Usage**: No action needed; Cursor picks rules by open files and `alwaysApply`. Keep rules short and actionable.

## Prompts (`.cursor/prompts/`)

Reusable workflow prompts. Reference them in chat with `@.cursor/prompts/<name>.md` or by path when starting a task:

| Prompt | Use when |
|--------|----------|
| `new-feature.md` | Adding a feature or scope change — problem statement → design → implement → PR |
| `bugfix.md` | Fixing a bug — reproduce, root cause, fix, test, branch, PR |
| `pr-review.md` | Before opening a PR — self-check against PRD, performance, tests, process |
| `design-doc.md` | Deciding if a design doc is needed and what to include |
| `update-tests-after-change.md` | After code changes — find affected tests, update them, run suite |

**Example**: *"Follow @.cursor/prompts/new-feature.md for adding a trade-history panel"* — the agent will start with problem statement and design before coding.

## Suggested agentic workflow

1. **New work**  
   Invoke `new-feature.md` or `bugfix.md` so the agent follows the right steps (problem → design → branch → PR).

2. **Before opening a PR**  
   Invoke `pr-review.md` so the agent runs the checklist and fixes gaps.

3. **Unclear if design is needed**  
   Invoke `design-doc.md` to decide and to get a short template.

4. **Refactors or performance**  
   Ensure `01-architecture.mdc` and `02-react-orderbook.mdc` apply (open relevant files); refer to PRD Section 11 for performance.

5. **After changing implementation**  
   Invoke `update-tests-after-change.md` so the agent finds affected tests, updates them, and runs the suite.

## PRD

All product and technical scope is defined in **`docs/PRD.md`**. Rules and prompts point to it; when in doubt, resolve against the PRD and the project owner.
