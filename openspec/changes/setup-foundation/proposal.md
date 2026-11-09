# Proposal: Set up the foundation

## Why

Every later change needs a strict monorepo, a one-command local stack (MongoDB replica set +
Kafka), a web → API hello path, and CI that blocks broken code. Reviewers should clone and run
it in minutes.

## What Changes

- pnpm + Turborepo workspaces: `apps/web`, `apps/api`, `apps/insights-worker` (stub),
  `packages/domain`, `packages/events`, `packages/config`
  ([ADR-0001](../../../docs/adr/0001-monorepo-pnpm-turborepo.md)).
- Strict tsconfig, ESLint (with a `packages/domain` purity rule), Prettier, Vitest.
- Docker Compose: self-initialising Mongo 8 replica set, Kafka 4 KRaft, topic init, app
  containers.
- API: schema-first Apollo with codegen, `hello` query, `/health`, `/health/ready`, redacted
  pino logs, zod-validated env.
- Web: Vite + React rendering `hello` via Apollo Client.
- `packages/events`: envelope, catalogue, topics, `parseEvent`.
- GitHub Actions CI; `.env.example`, `.nvmrc`, `.gitignore`.

## Capabilities

### New Capabilities
- `local-dev-stack`: one-command environment where every service is healthy and the web shows
  API data.
- `service-health`: liveness/readiness endpoints and redacted structured logs.
- `event-contracts`: versioned envelope, catalogue, topics and message validation.

### Modified Capabilities
- None.

## Out of scope

Auth and features, outbox and Kafka clients, PWA config, hosting, Testcontainers.

## Impact

New root config, `docker-compose.yml` and CI workflow. Dependencies (asked per task): turbo,
typescript, eslint, prettier, vitest, zod, Apollo, GraphQL Code Generator, pino, React, Vite.

## Depends on

Nothing.
