# Proposal: Set up the foundation

## Why

Nothing exists yet but planning docs. Every later change needs a strictly typed monorepo, a
local stack (MongoDB replica set + Kafka) that starts with one command, a hello-world path from
web to API, and CI that blocks broken code. A reviewer should be able to clone the repo and see
it running in minutes.

## What Changes

- pnpm workspaces + Turborepo with `apps/web`, `apps/api`, `apps/insights-worker` (stub) and
  `packages/domain`, `packages/events`, `packages/config` ([ADR-0001](../../../docs/adr/0001-monorepo-pnpm-turborepo.md)).
- Shared strict tsconfig, ESLint flat config (with a purity rule for `packages/domain`) and
  Prettier. Vitest in packages that have tests.
- Docker Compose: MongoDB 8 single-node replica set (self-initialising), Kafka 4 in KRaft mode
  with a capped heap, a topic-init job, and the app containers.
- API: Apollo Server, schema-first with codegen, a `hello` query, `/health` and
  `/health/ready`, and pino logging with a redaction baseline.
- Web: Vite + React + TS rendering the `hello` result through Apollo Client.
- `packages/events`: the event envelope, payload schemas, topic constants and `parseEvent`
  (no producers yet).
- GitHub Actions CI skeleton. `.env.example`, `.nvmrc` (Node 22) and `.gitignore`.

## Capabilities

### New Capabilities
- `local-dev-stack`: one-command local environment where every service becomes healthy and the
  web app shows data from the API.
- `service-health`: liveness/readiness endpoints and structured, redacted logging for API
  processes.
- `event-contracts`: the versioned event envelope, event catalogue, topics and message
  validation shared by producers and consumers.

### Modified Capabilities
- None.

## Out of scope

- Auth and real features (from `add-workout-logging`).
- The outbox, Kafka producers and consumers (`add-cycle-tracking-and-events`).
- PWA configuration (`add-workout-logging` group 5).
- Hosting and deployment ([ADR-0006](../../../docs/adr/0006-local-first-hosting-docker-compose.md)).
- Testcontainers (`add-cycle-tracking-and-events`).

## Impact

- New root files: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `docker-compose.yml`,
  `.env.example`, `.github/workflows/ci.yml`.
- New dependencies (each asked for in its task): turbo, typescript, eslint + plugins, prettier,
  vitest, zod, Apollo Server/Client, GraphQL Code Generator, pino, React, Vite.
- CLAUDE.md "Commands" section becomes real.

## Depends on

- Nothing. This is the first change.
