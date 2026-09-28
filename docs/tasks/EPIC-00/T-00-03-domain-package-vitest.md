# T-00-03 — Domain package + Vitest

- **Status:** todo
- **Epic:** [EPIC-00](../../epics/EPIC-00-foundation.md)
- **Spec:** n/a
- **Estimate:** 1–2 h
- **Branch:** `task/T-00-03-domain-package-vitest`

## Context
`packages/domain` holds all pure logic: pace, phase estimation and aggregation. This task sets
up the package, Vitest (as a workspace-aware config at the root) and a first trivial function
with a test that proves the pipeline works. Coverage reporting is enabled, but no threshold is
enforced yet.

## Acceptance criteria
- **Given** `packages/domain/src/index.ts` exports a `Clock` type (`() => Date`) and a
  `systemClock`, **when** another workspace imports `@cadence/domain`, **then** it type-checks.
- **Given** a first unit test (e.g. `clock.test.ts` using a fixed clock), **when** I run
  `pnpm test`, **then** Vitest runs it via Turbo and it passes.
- **Given** `pnpm test -- --coverage`, **when** it runs, **then** a coverage report is produced
  under `coverage/` (git-ignored).

## Likely files touched
- `packages/domain/{package.json,tsconfig.json,src/index.ts,src/clock.ts,src/clock.test.ts}`
- `vitest.workspace.ts` or `vitest.config.ts` (root), and `packages/domain/vitest.config.ts`

## Required tests
- Unit: `clock.test.ts`, the fixed clock returns the injected date.

## Definition of done
- [ ] Acceptance criteria met
- [ ] `pnpm lint`, `pnpm typecheck` and `pnpm test` pass
- [ ] `code-reviewer` run and must-fixes resolved
- [ ] Task status and [BOARD.md](../BOARD.md) updated
- [ ] Commit message suggested (e.g. `chore(domain): add domain package with vitest`)

## Dependencies
- T-00-02

## Notes
- **New dependencies (ask first):** `vitest`, `@vitest/coverage-v8`.
