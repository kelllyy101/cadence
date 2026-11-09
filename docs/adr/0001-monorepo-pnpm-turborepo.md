# 0001. Monorepo with pnpm workspaces + Turborepo

- Status: Accepted
- Date: 2026-09-28

## Context

Three deployables (`web`, `api`, `insights-worker`) share domain logic, event contracts and
tooling config. Producer/consumer contract drift is a real risk, and reviewers should see the
whole system in one repo.

## Decision

- One repo: **pnpm workspaces** for linking, **Turborepo** for cached `build`, `lint`,
  `typecheck`, `test`.
- `apps/*` are deployables, `packages/*` are libraries, scope `@cadence/*`.
- Internal packages are consumed as TypeScript source via `exports` (no build step).

## Alternatives

- **Polyrepo + published contracts:** versioning overhead for one developer; harder to review.
- **Workspaces without Turborepo:** no task graph or caching.
- **Nx:** more than needed.

## Consequences

- ➕ Shared schemas by import: the compiler catches drift. One cached CI pipeline.
- ➖ Boundaries need enforcing: ESLint blocks I/O and app imports in `packages/domain`.
- ➖ Docker builds need the whole workspace (`turbo prune` or multi-stage).
