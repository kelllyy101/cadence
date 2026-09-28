# T-00-01 — Monorepo scaffold

- **Status:** todo
- **Epic:** [EPIC-00](../../epics/EPIC-00-foundation.md)
- **Spec:** n/a · ADR: [0001](../../adr/0001-monorepo-pnpm-turborepo.md)
- **Estimate:** 1–2 h
- **Branch:** `task/T-00-01-monorepo-scaffold`

## Context
This task creates the empty skeleton every other task builds on: pnpm workspaces, Turborepo, a
Node version pin and the root scripts. There is no app code yet. Each app and package gets just
a `package.json` with placeholder scripts, so `turbo` has a task graph to run.

## Acceptance criteria
- **Given** a fresh clone with Node 22 and pnpm (via corepack), **when** I run `pnpm install`,
  **then** it completes with no warnings about missing workspaces.
- **Given** the repo, **when** I run `pnpm turbo run build lint typecheck test`, **then** every
  workspace's placeholder script runs and exits 0.
- **Given** `.gitignore`, **when** I create `.env`, `node_modules`, `dist`, `coverage` or
  generated GraphQL files, **then** git ignores them.
- **Given** `.env.example`, **when** I read it, **then** every variable has a comment and a
  non-secret placeholder value.

## Likely files touched
- `package.json` (root: `packageManager`, scripts `dev|build|lint|typecheck|test|test:int|e2e|codegen`)
- `pnpm-workspace.yaml`, `turbo.json`, `.nvmrc`, `.npmrc`, `.gitignore`, `.env.example`, `.editorconfig`
- `apps/{web,api,insights-worker}/package.json`, `packages/{domain,events,config}/package.json`

## Required tests
- None (no logic). Verify by running the turbo pipeline.

## Definition of done
- [ ] Acceptance criteria met
- [ ] `code-reviewer` run and must-fixes resolved
- [ ] CLAUDE.md "Commands" section updated to match the real scripts
- [ ] Task status and [BOARD.md](../BOARD.md) updated
- [ ] Commit message suggested (e.g. `chore: scaffold pnpm + turborepo monorepo`)

## Dependencies
- None

## Notes
- **New dependencies (ask first):** `turbo` (dev). pnpm is enabled via corepack, not installed as a dependency.
- The local git version is old (`git init -b` isn't supported). If that matters, note it in the README prerequisites.
