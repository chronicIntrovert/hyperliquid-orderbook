# When to Write a Design Document

Use this to decide whether a design doc is needed and what it should contain.

## When a design doc is expected

- **New feature** that adds or changes user-facing behavior or scope.
- **Architectural change**: new hooks, new data flow, new modules, or significant refactors.
- **Integration**: new external API, new deployment or config approach.
- **Non-trivial bugfix** that requires new logic or touching multiple layers (e.g. WebSocket + cache + UI).

## When a short note may be enough

- **Small bugfix**: Single file, clear cause, no new patterns.
- **Copy/layout tweak**: No logic or data flow change.
- **Dependency bump or config**: One-off, low risk; document in PR description.

## Design doc contents (reminder)

- **Current context** and pain/gap.
- **Requirements** (functional and non-functional).
- **Design decisions** with rationale and trade-offs.
- **Technical design**: components, hooks, types, integration points.
- **Implementation plan**: phases and tasks.
- **Testing strategy** and **observability** (if relevant).
- **Security/rollout** only if the change affects them.

Use the full design doc template from the project’s coding standards for larger work. For small changes, a one-page design note in the PR or a short doc in `docs/` is acceptable.

**If in doubt**, write a short design (problem + approach + key decisions); it speeds up review and prevents rework.
