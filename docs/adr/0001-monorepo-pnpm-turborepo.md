# 0001. Monorepo with pnpm workspaces + Turborepo

- Status: Accepted
- Date: 2026-09-28

## Context

Cadence has three deployables: `web`, `api` and `insights-worker`. They share code:

- **Domain logic** (pace, phase estimation, aggregation). The API and the worker both use it,
  and the web app may use parts too.
- **Event contracts.** The API/relay and the worker must agree on these exactly.
- **Tooling config** (tsconfig, ESLint).

Contract drift between producer and consumer is a real risk in event-driven systems. Reviewers
of a portfolio project should be able to clone one repo and see the whole system.

## Decision

Use a single repository with **pnpm workspaces** for package linking and **Turborepo** for
task orchestration and caching (`build`, `lint`, `typecheck`, `test`).

- `apps/*` hold deployables and `packages/*` hold libraries.
- Internal packages are consumed as TypeScript source through `exports` plus TS project
  references (or `tsc --build`). The exact mechanism is settled in T-00-01/T-00-02.
- The package scope is `@cadence/*`.

## Alternatives considered

- **Polyrepo** (one repo per service plus a published contracts package). This is realistic for
  large orgs, but versioning and publishing overhead dominate for one developer. It also makes
  the portfolio harder to review.
- **npm/yarn workspaces without Turborepo.** Simpler, but there's no task graph or caching, so CI
  gets slower as packages grow.
- **Nx.** More powerful (generators, affected graph), but heavier and more opinionated than
  needed. Turborepo stays close to plain package scripts.

## Consequences

- ➕ Event schemas and domain logic are shared by import, so the compiler catches producer/consumer drift.
- ➕ One CI pipeline with cached, parallel tasks.
- ➖ Workspace boundaries must be enforced: `packages/domain` may not import from apps or I/O
  libraries. We will add an ESLint `no-restricted-imports` rule in T-00-02.
- ➖ The Docker build context must include the workspace, so we'll use `turbo prune` or a
  multi-stage build in T-00-10.
