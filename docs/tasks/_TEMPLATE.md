# T-0X-YY — Short title

- **Status:** todo <!-- todo | in-progress | review | done -->
- **Epic:** [EPIC-0X](../../epics/EPIC-0X-name.md)
- **Spec:** [spec-name](../../specs/spec-name.md) <!-- or "n/a" -->
- **Estimate:** 1–3 h
- **Branch:** `task/T-0X-YY-short-name`

## Context
Why this task exists and what it unblocks. Link to the relevant spec section and ADRs.
Mention any decisions already made so the implementer doesn't re-litigate them.

## Acceptance criteria
- **Given** …, **when** …, **then** …
- **Given** …, **when** …, **then** …

## Likely files touched
- `path/to/file.ts`

## Required tests
- Unit (`*.test.ts`): …
- Integration (`*.int.test.ts`): …
- E2E (`cypress/e2e/*.cy.ts`): …

## Definition of done
- [ ] Acceptance criteria met
- [ ] `pnpm lint`, `pnpm typecheck` and `pnpm test` pass (plus `test:int` / `e2e` if relevant)
- [ ] `code-reviewer` run and must-fixes resolved
- [ ] `privacy-reviewer` run (if the task touches data, events, logs or copy about cycles)
- [ ] `ux-a11y-reviewer` run (if the task touches UI)
- [ ] Docs updated (CLAUDE.md commands, spec, README) if behaviour or commands changed
- [ ] Task status and [BOARD.md](../BOARD.md) updated
- [ ] Conventional-commit message suggested

## Dependencies
- T-0X-YY (reason)

## Notes
Open questions, decisions made during implementation, follow-ups.
