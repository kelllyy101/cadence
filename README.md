# Cadence

**Train with your cycle, not against it.** Cadence is a mobile-first training log for women
who run and lift. Log runs and strength sessions in seconds. You can also choose to track your
cycle and see how your training, effort and energy line up with each cycle phase.

> Cadence shows **patterns, not prescriptions**. Cycle phases are estimates. They are not medical
> advice and must never be used as contraception.

## Why this project

This portfolio project is built to show:

- **Privacy by design** for special-category health data (GDPR Art. 9): opt-in, versioned
  consent, export, and deletion that reaches every derived copy.
- **Usability** as a first-class concern. The UI is designed for one-thumb logging and checked
  in moderated and unmoderated usability tests.
- **Accessibility**: WCAG 2.2 AA, and every chart has a table alternative.
- **Event-driven architecture** done carefully: a transactional outbox, idempotent consumers and
  per-user ordering.

## Status

🚧 Early development. See the [task board](docs/tasks/BOARD.md).

| Epic | Status |
|---|---|
| [EPIC-00 Foundation](docs/epics/EPIC-00-foundation.md) | Not started |
| [EPIC-01 Workout logging](docs/epics/EPIC-01-workout-logging.md) | Not started |
| [EPIC-02 Cycle tracking + events](docs/epics/EPIC-02-cycle-tracking-events.md) | Not started |
| [EPIC-03 Insights + demo](docs/epics/EPIC-03-insights-demo.md) | Not started |
| [EPIC-04 Trust + polish](docs/epics/EPIC-04-trust-polish.md) | Not started |
| [EPIC-05 AI workout builder](docs/epics/EPIC-05-ai-workout-builder.md) | Planned |

## Local setup

_Placeholder. It will be completed in EPIC-00._

```bash
# Requires Docker, Node 22, pnpm
cp .env.example .env
docker compose up
# web: http://localhost:5173  api: http://localhost:4000/graphql
```

## Architecture

A pnpm/Turborepo monorepo contains:

- a React PWA
- an Apollo GraphQL API
- a Kafka-driven insights worker
- shared packages: `domain` (pure logic), `events` (schemas) and `config`

Writes go through a transactional outbox, so domain changes and events are never out of sync.

See [ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) for diagrams and the data model.

## Privacy

- Cycle tracking is off by default and needs separate, versioned consent.
- Withdrawing consent deletes cycle data and its derived insights.
- You can export all of your data as JSON at any time.
- Deleting your account removes your data everywhere, including derived data held by the worker.
- There are no third-party analytics, and health data is redacted from all logs.
- The AI workout builder sends only your request text and equipment to the AI provider. It
  never sends your cycle data or history, and stores nothing.

Details: [ARCHITECTURE.md § Privacy design](docs/architecture/ARCHITECTURE.md#privacy-design).

## Testing

| Layer | Tooling | What it covers |
|---|---|---|
| Unit | Vitest | Domain logic: pace, phase estimation, aggregation |
| Integration | Testcontainers (real MongoDB + Kafka) | Outbox → relay → worker, idempotency, deletion propagation |
| E2E + a11y | Cypress + cypress-axe | Key user journeys, with axe checks on every page |

_Coverage and CI badges will be added in EPIC-00/EPIC-04._

## Usability findings

_Placeholder. It will be completed in EPIC-04._ The plan is a moderated think-aloud pilot
(5 participants) followed by an unmoderated remote round. The metrics are task success, time on
task, SEQ and SUS. Findings and the design changes they led to will be summarised here.

## Decisions

| ADR | Decision |
|---|---|
| [0001](docs/adr/0001-monorepo-pnpm-turborepo.md) | Monorepo with pnpm workspaces + Turborepo |
| [0002](docs/adr/0002-pwa-over-native.md) | Installable PWA over native apps |
| [0003](docs/adr/0003-schema-first-graphql-codegen.md) | Schema-first GraphQL with code generation |
| [0004](docs/adr/0004-kafka-kraft-transactional-outbox.md) | Kafka (KRaft) with a transactional outbox |
| [0005](docs/adr/0005-self-hosted-auth-better-auth.md) | Self-hosted auth with Better Auth |
| [0006](docs/adr/0006-local-first-hosting-docker-compose.md) | Local-first: one `docker compose up`, hosting deferred |
| [0007](docs/adr/0007-llm-workout-generation-claude-api.md) | Natural-language workout generation via the Claude API (proposed) |

## Roadmap

These stretch items are not scheduled yet ([BACKLOG](docs/epics/BACKLOG.md)):

- training plans
- Strava import
- offline logging queue
- app-level encryption of cycle fields
- a Helm chart on k3s
- voice input and rest timers for the AI workout builder

## Disclaimer

Cadence is not a medical device. Phase estimates are approximations based on the dates you
enter. They are not medical advice, diagnosis or contraception.
