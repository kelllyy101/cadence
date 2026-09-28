# EPIC-00 — Foundation

## Goal
Set up a working, strictly typed monorepo that a reviewer can clone and run with one
`docker compose up`. It should serve a hello-world GraphQL query end to end (web → api) on top
of MongoDB (replica set) and Kafka (KRaft), with CI enforcing lint, typecheck, tests and build.

## User stories
- As the **developer**, I want one command to start the whole stack, so I can work on any part without manual setup.
- As the **developer**, I want strict TypeScript and linting in every package, so mistakes are caught before review.
- As a **reviewer**, I want CI to show green checks on every PR, so I can trust the main branch.
- As the **developer**, I want Mongo running as a replica set from day one, so transactions (needed for the outbox) work locally.

## Scope
- pnpm workspaces + Turborepo with `apps/web`, `apps/api`, `apps/insights-worker` (stub), and
  `packages/domain`, `events` and `config`
- Shared strict tsconfig, ESLint (flat config) and Prettier
- Vitest in the packages that have tests
- Docker Compose with:
  - MongoDB 8 as a single-node replica set, auto-initiated, with a healthcheck
  - Kafka 4 in KRaft mode with a capped heap
  - a topic-init job
  - app containers
- The API: Apollo Server, schema-first, codegen, a `hello` query, `/health`, and a pino logger
  with a redaction baseline
- The web app: Vite + React + TS rendering the `hello` result through Apollo Client
- The `packages/events` envelope schema and topic constants (no producers yet)
- A GitHub Actions CI skeleton
- `.env.example`, `.nvmrc` (Node 22) and `.gitignore`

## Out of scope
- Auth, real features, the outbox and Kafka producers/consumers (from EPIC-01 onward)
- PWA configuration (T-01-05)
- Hosting and deployment ([ADR-0006](../adr/0006-local-first-hosting-docker-compose.md))
- Testcontainers (EPIC-02, when there's something to integrate)

## Acceptance criteria
- Given a fresh clone with Docker, Node 22 and pnpm, when I run `cp .env.example .env && docker compose up`, then Mongo, Kafka, api, worker (stub) and web all become healthy.
- Given the stack is running, when I open the web app, then it displays the result of the `hello` GraphQL query.
- Given any workspace, when I run `pnpm lint && pnpm typecheck && pnpm test`, then all pass with strict TS.
- Given a PR, when CI runs, then install, codegen, lint, typecheck, test and build all run, and a failure blocks the check.
- Given the Mongo container, when a client starts a multi-document transaction, then it succeeds.

## Risks
| Risk | Mitigation |
|---|---|
| Mongo replica set init is flaky in Compose (hostname issues) | Use a healthcheck that runs `rs.initiate` idempotently, set `--replSet rs0 --bind_ip_all`, and put `directConnection=true` in the URI for single-node |
| Kafka memory use on a laptop | `KAFKA_HEAP_OPTS` capped at 512 MB, single broker, low partition counts |
| librdkafka native build fails on Alpine / in CI | Use Debian-slim Node images. Verify when the client is added (EPIC-02) |
| Workspace TS resolution between packages is confusing | Settle one approach in T-00-02 and document it in CLAUDE.md |

## Tasks
Full task files are in [docs/tasks/EPIC-00/](../tasks/EPIC-00/).

| ID | Title |
|---|---|
| T-00-01 | [Monorepo scaffold](../tasks/EPIC-00/T-00-01-monorepo-scaffold.md) |
| T-00-02 | [Shared config: tsconfig, ESLint, Prettier](../tasks/EPIC-00/T-00-02-shared-config.md) |
| T-00-03 | [Domain package + Vitest](../tasks/EPIC-00/T-00-03-domain-package-vitest.md) |
| T-00-04 | [Events package skeleton](../tasks/EPIC-00/T-00-04-events-package-skeleton.md) |
| T-00-05 | [Compose: Mongo replica set](../tasks/EPIC-00/T-00-05-compose-mongo-replset.md) |
| T-00-06 | [Compose: Kafka KRaft](../tasks/EPIC-00/T-00-06-compose-kafka-kraft.md) |
| T-00-07 | [API hello GraphQL + codegen](../tasks/EPIC-00/T-00-07-api-hello-graphql.md) |
| T-00-08 | [API health + logging](../tasks/EPIC-00/T-00-08-api-health-logging.md) |
| T-00-09 | [Web hello (Vite + Apollo)](../tasks/EPIC-00/T-00-09-web-hello-vite.md) |
| T-00-10 | [Compose full stack](../tasks/EPIC-00/T-00-10-compose-full-stack.md) |
| T-00-11 | [CI skeleton](../tasks/EPIC-00/T-00-11-ci-skeleton.md) |
