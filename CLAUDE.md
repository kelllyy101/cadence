# Cadence — project memory

Cycle-aware training app for women who run and lift. Log runs and strength sessions,
optionally track your cycle, and see how training, effort and energy relate to cycle
phase. Portfolio piece: **code quality, UX, accessibility and privacy beat feature count.**

Product: [docs/product/VISION.md](docs/product/VISION.md) ·
Architecture: [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) ·
Decisions: [docs/adr/](docs/adr/README.md) · Board: [docs/tasks/BOARD.md](docs/tasks/BOARD.md)

## Stack

| Area | Choice |
|---|---|
| Monorepo | pnpm workspaces + Turborepo ([ADR-0001](docs/adr/0001-monorepo-pnpm-turborepo.md)) |
| Runtime | Node 22 LTS, TypeScript strict everywhere |
| Web | React + Vite PWA (vite-plugin-pwa), Apollo Client, Recharts, react-hook-form + zod ([ADR-0002](docs/adr/0002-pwa-over-native.md)) |
| API | Apollo Server, schema-first GraphQL + GraphQL Code Generator ([ADR-0003](docs/adr/0003-schema-first-graphql-codegen.md)); REST only for export + health/metrics |
| Auth | Better Auth, self-hosted, MongoDB adapter ([ADR-0005](docs/adr/0005-self-hosted-auth-better-auth.md)) |
| Data | MongoDB 8 (single-node replica set) + Mongoose |
| Events | Kafka 4 (KRaft, apache/kafka) + @confluentinc/kafka-javascript, transactional outbox ([ADR-0004](docs/adr/0004-kafka-kraft-transactional-outbox.md)) |
| Tests | Vitest (unit), Testcontainers (integration), Cypress + cypress-axe (E2E/a11y) |
| AI | Claude API via `@anthropic-ai/sdk` behind a `WorkoutGenerator` interface (+ fake for tests); env `WORKOUT_GENERATOR`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` ([ADR-0007](docs/adr/0007-llm-workout-generation-claude-api.md), EPIC-05) |
| Ops | pino (health fields redacted), `/health`, `/metrics`, OpenFeature file provider |
| Hosting | Undecided — everything runs via `docker compose up` ([ADR-0006](docs/adr/0006-local-first-hosting-docker-compose.md)) |

## Folder map

```
apps/web              React PWA (mobile-first)
apps/api              GraphQL API, auth, outbox relay, REST export/health/metrics
apps/insights-worker  Kafka consumer → per-user insights
packages/domain       Pure logic: pace, cycle-phase estimation, aggregation (no I/O, no frameworks)
packages/events       zod event schemas, topic names, shared event types
packages/config       Shared tsconfig + ESLint config
scripts/              seed-demo.ts and dev utilities
docs/                 product, architecture, adr, epics, specs, tasks
.claude/agents/       Subagents (see below)
```

## Commands (available after EPIC-00)

```bash
docker compose up        # Mongo replset + Kafka + api + worker + web
pnpm dev                 # turbo dev across apps
pnpm lint                # ESLint
pnpm typecheck           # tsc --noEmit across workspaces
pnpm test                # Vitest unit tests
pnpm test:int            # Testcontainers integration tests (needs Docker)
pnpm e2e                 # Cypress + cypress-axe
pnpm codegen             # GraphQL Code Generator
pnpm seed:demo           # seed the demo account (EPIC-03)
pnpm eval:workout-prompts  # manual: real Claude API prompt eval, never in CI (EPIC-05)
```

Update this section as soon as real scripts exist.

## Conventions

- **TypeScript:** `strict`, `noUncheckedIndexedAccess`; no `any` (use `unknown` + narrowing);
  no non-null `!` without a comment explaining why.
- **Boundaries:** validate every external input with zod (GraphQL args beyond SDL types,
  REST bodies, Kafka messages, env vars). Trust types only inside the boundary.
- **Domain:** `packages/domain` is pure: no Mongo, Kafka, React, Date.now() (inject a clock),
  or logging. It is the most heavily unit-tested package.
- **GraphQL:** edit `.graphql` SDL first, run codegen, then implement typed resolvers.
  Errors use typed codes (`UNAUTHENTICATED`, `FORBIDDEN`, `BAD_USER_INPUT`, `NOT_FOUND`,
  `CONSENT_REQUIRED`) and never echo health values.
- **Events:** every event uses the envelope in `packages/events`, keyed by `userId`,
  written via the outbox only. Consumers must be idempotent (`processed_events`).
- **Units:** store SI (metres, seconds, kilograms); convert only at the UI edge.
- **Naming:** files `kebab-case.ts`, React components `PascalCase.tsx`, collections `snake_case`.
- **Tests:**
  - Unit: `*.test.ts` next to the source (Vitest)
  - Integration: `*.int.test.ts` under `src/`, using Testcontainers with real Mongo + Kafka.
    Never mock Mongo or Kafka there.
  - E2E: `apps/web/cypress/e2e/*.cy.ts`. Every page visit runs `cy.checkA11y()`.
  - Name tests after behaviour (`it('rejects RPE above 10')`). Structure them as Given/When/Then
    that maps to the task's acceptance criteria.
  - Use synthetic data only; there must never be real health data in fixtures.
- **Commits:** Conventional Commits (`feat(api): …`, `test(domain): …`, `docs: …`).
- **Branches:** one per task: `task/T-0X-YY-short-name`.

## Privacy rules (non-negotiable — see [ARCHITECTURE.md § Privacy](docs/architecture/ARCHITECTURE.md#privacy-design))

Cycle data is GDPR Art. 9 special-category health data.
1. Cycle tracking is **off by default**. It needs separate, explicit, **versioned** consent.
2. Withdrawing consent **deletes** cycle data and its derived insights.
3. Users get a full JSON export of their data. Account deletion propagates via `user.deletion_requested`.
4. Minimise data: collect nothing we don't use. No third-party analytics or trackers.
5. Health data never appears in logs, errors, metrics labels or event payloads beyond what is needed.
6. Phase is always labelled an **estimate**: not medical advice, not contraception.
7. Insights never imply causation. They show "not enough data yet" instead of guessing.

## Workflow rules

- Work on exactly one task at a time. Read its task file and linked spec first.
- Start each task in plan mode and show the plan before editing.
- Before calling a task done:
  - lint, typecheck and tests pass
  - run `code-reviewer`
  - also run `privacy-reviewer` for anything touching data, and `ux-a11y-reviewer` for UI
  - fix every must-fix
- Update the task file status and [BOARD.md](docs/tasks/BOARD.md).
- Suggest a conventional-commit message; one branch per task.
- Ask before adding any new dependency, and explain why.
- Never commit secrets; use `.env.example`.
- **STOP after each task and wait for review.**

Task statuses: `todo` → `in-progress` → `review` → `done`.

## Subagents (`.claude/agents/`)

| Agent | Use when |
|---|---|
| `task-planner` | Breaking an epic/spec into task files (docs only) |
| `test-writer` | Writing tests from a task's acceptance criteria, before/alongside code |
| `code-reviewer` | Before marking any task done: reviews the diff and runs lint/typecheck/tests |
| `privacy-reviewer` | Diff touches data models, events, logging, export/deletion, consent or copy about cycles |
| `ux-a11y-reviewer` | Diff touches anything in `apps/web` users see or interact with |

## Where things live

- Epics: [docs/epics/](docs/epics/) · Specs: [docs/specs/](docs/specs/) · Tasks: [docs/tasks/](docs/tasks/)
- Task template: [docs/tasks/_TEMPLATE.md](docs/tasks/_TEMPLATE.md)
- Stretch ideas: [docs/epics/BACKLOG.md](docs/epics/BACKLOG.md). Do not implement these without a task.
