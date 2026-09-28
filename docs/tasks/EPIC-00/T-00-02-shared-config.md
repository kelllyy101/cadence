# T-00-02 — Shared config: tsconfig, ESLint, Prettier

- **Status:** todo
- **Epic:** [EPIC-00](../../epics/EPIC-00-foundation.md)
- **Spec:** n/a · ADR: [0001](../../adr/0001-monorepo-pnpm-turborepo.md)
- **Estimate:** 2–3 h
- **Branch:** `task/T-00-02-shared-config`

## Context
`packages/config` provides the strict TS base configs and a shared ESLint flat config that every
workspace extends. This task also decides **how internal packages are consumed**: TS source via
`exports`, or project references. Record the decision in CLAUDE.md.

The domain package must be kept pure, so an import restriction rule is added here.

## Acceptance criteria
- **Given** `packages/config/tsconfig.base.json`, **when** I inspect it, **then** it enables
  `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`,
  `verbatimModuleSyntax` and `isolatedModules`.
- **Given** variants `tsconfig.node.json` and `tsconfig.react.json`, **when** apps extend them,
  **then** `pnpm typecheck` passes.
- **Given** a file containing `const x: any = 1`, **when** ESLint runs, **then** it errors
  (`@typescript-eslint/no-explicit-any`).
- **Given** `packages/domain` imports `mongoose`, `react`, `kafka` or anything from `apps/*`,
  **when** ESLint runs, **then** it errors (`no-restricted-imports`).
- **Given** a formatting difference, **when** `pnpm format:check` runs, **then** it fails. `pnpm format` fixes it.

## Likely files touched
- `packages/config/{package.json,tsconfig.base.json,tsconfig.node.json,tsconfig.react.json,eslint.config.js}`
- `eslint.config.js` (root), `.prettierrc`, `.prettierignore`
- Each workspace's `tsconfig.json` and `eslint.config.js`

## Required tests
- Commit a tiny lint fixture, or a documented manual check that the `any` rule and the
  domain import restriction fire. Remove the fixture afterwards.

## Definition of done
- [ ] Acceptance criteria met
- [ ] `pnpm lint` and `pnpm typecheck` pass
- [ ] `code-reviewer` run and must-fixes resolved
- [ ] CLAUDE.md conventions updated with the package-consumption decision
- [ ] Task status and [BOARD.md](../BOARD.md) updated
- [ ] Commit message suggested (e.g. `chore(config): add strict tsconfig, eslint and prettier`)

## Dependencies
- T-00-01

## Notes
- **New dependencies (ask first):** `typescript`, `eslint`, `typescript-eslint`, `@eslint/js`,
  `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` (a11y linting early),
  `eslint-config-prettier`, `prettier`.
