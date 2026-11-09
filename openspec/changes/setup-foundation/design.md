# Design: Set up the foundation

## Context

Greenfield repo. Decisions already taken: pnpm + Turborepo ([ADR-0001](../../../docs/adr/0001-monorepo-pnpm-turborepo.md)),
schema-first GraphQL ([ADR-0003](../../../docs/adr/0003-schema-first-graphql-codegen.md)),
Kafka KRaft + outbox ([ADR-0004](../../../docs/adr/0004-kafka-kraft-transactional-outbox.md)),
local-first Compose ([ADR-0006](../../../docs/adr/0006-local-first-hosting-docker-compose.md)).
Requirements are in `specs/`.

## Goals / Non-Goals

**Goals:** a stack a reviewer can run in minutes; strictness from the first commit; one place
for event contracts.

**Non-Goals:** production hardening, hosting, Testcontainers, any feature code.

## Decisions

- **Internal package consumption:** decide in group 2 between TS source via `exports` and
  project references; record the choice in CLAUDE.md. Leaning towards source via `exports`
  (simpler with Vite and Vitest, no build step for packages).
- **Strict compiler flags:** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `noImplicitOverride`, `verbatimModuleSyntax`, `isolatedModules`. Variants `tsconfig.node.json`
  and `tsconfig.react.json`.
- **Domain purity:** ESLint `no-restricted-imports` blocks mongoose, react, kafka clients and
  `apps/*` inside `packages/domain`.
- **Clock injection:** `packages/domain` exports `Clock = () => Date` and `systemClock`.
- **Mongo replica set:** `mongod --replSet rs0 --bind_ip_all --wiredTigerCacheSizeGB 0.25`, a
  healthcheck that runs `rs.initiate()` idempotently, and
  `MONGO_URL=mongodb://localhost:27017/cadence?replicaSet=rs0&directConnection=true`. No auth
  locally: bound to localhost, and the README says so.
- **Kafka:** official `apache/kafka` 4.x, `KAFKA_HEAP_OPTS="-Xmx512m -Xms512m"`, replication
  factor 1, host listener `localhost:9092` and internal `kafka:29092`. A one-shot `kafka-init`
  runs `infra/kafka/create-topics.sh` with `--if-not-exists`.
- **Images:** Debian-slim Node images (librdkafka builds poorly on Alpine).
- **Event envelope** (`packages/events`):
  ```ts
  const EventEnvelope = z.object({
    eventId: z.string().uuid(),        // uuid v7
    type: EventType,
    version: z.literal(1),
    occurredAt: z.string().datetime(),
    userId: z.string().min(1),
    payload: z.unknown(),              // refined per type, .strict()
  });
  ```
  | Type | Topic | Payload |
  |---|---|---|
  | `workout.logged` / `workout.updated` | `cadence.workouts.v1` | `{ workoutId, kind }` |
  | `workout.deleted` | `cadence.workouts.v1` | `{ workoutId }` |
  | `cycle.logged` | `cadence.cycle.v1` | `{ change: 'created'\|'updated'\|'deleted' }` |
  | `cycle.data_deleted` | `cadence.cycle.v1` | `{}` |
  | `user.deletion_requested` | `cadence.users.v1` | `{ requestId }` |
- **Logging baseline:** pino with `redact` paths for known health fields plus a serializer that
  drops GraphQL `variables` and resolver args.

## Risks / Trade-offs

- [Replica-set init flaky in Compose (hostnames)] → idempotent healthcheck initiation and
  `directConnection=true`.
- [Kafka memory on a laptop] → capped heap, single broker, 3 partitions.
- [librdkafka native build fails] → Debian-slim images; verify when the client arrives.
- [Workspace TS resolution confusing] → settle in group 2 and document.
- [Topic list drifts from `packages/events`] → follow-up: generate the init script from the TS
  constants.

## Open Questions

- The local git version is old (`git init -b` unsupported). Note it in README prerequisites if
  it matters.
