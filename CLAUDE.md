# Cadence — project memory

Cycle-aware training app for women who run and lift. Log runs and strength sessions,
optionally track your cycle, and see how training, effort and energy relate to cycle
phase. Portfolio piece: **code quality, UX, accessibility and privacy beat feature count.**

Product: [docs/product/VISION.md](docs/product/VISION.md) ·
Architecture: [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) ·
Decisions: [docs/adr/](docs/adr/README.md) · Plans: [openspec/changes/](openspec/changes/) ·
Roadmap: [docs/ROADMAP.md](docs/ROADMAP.md)

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
| AI | Claude API via `@anthropic-ai/sdk` behind a `WorkoutGenerator` interface (+ fake for tests); env `WORKOUT_GENERATOR`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` ([ADR-0007](docs/adr/0007-llm-workout-generation-claude-api.md), `add-ai-workout-builder`) |
| Planning | [OpenSpec](https://github.com/Fission-AI/OpenSpec) 1.16 (`npm i -g @fission-ai/openspec`, needs Node ≥ 22.12), spec-driven schema |
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
docs/                 product (vision, backlog), architecture, adr, roadmap
openspec/             OpenSpec: config.yaml, changes/ (planned work), specs/ (archived truth)
.claude/agents/       Subagents (see below)
.claude/skills, commands/opsx/  OpenSpec skills and /opsx:* slash commands
```

## Commands

```bash
openspec list            # changes and task progress
openspec show <change>   # read a change
openspec validate --all --strict
```

App commands (available after `setup-foundation`):

```bash
docker compose up        # Mongo replset + Kafka + api + worker + web
pnpm dev                 # turbo dev across apps
pnpm lint                # ESLint
pnpm typecheck           # tsc --noEmit across workspaces
pnpm test                # Vitest unit tests
pnpm test:int            # Testcontainers integration tests (needs Docker)
pnpm e2e                 # Cypress + cypress-axe
pnpm codegen             # GraphQL Code Generator
pnpm seed:demo           # seed the demo account (add-training-insights)
pnpm eval:workout-prompts  # manual: real Claude API prompt eval, never in CI (add-ai-workout-builder)
```

Update this section as soon as real scripts exist.

## Conventions

- **TypeScript:** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`; no `any`
  (use `unknown` + narrowing); no non-null `!` without a comment explaining why.
- **Internal packages:** consumed as TypeScript source through `exports` (`"." : "./src/index.ts"`),
  with no build step. Vite, Vitest and tsx read TS directly; `tsc --noEmit` typechecks.
  Configs extend `@cadence/config/tsconfig.{base,node,react}.json`; ESLint uses the root
  `eslint.config.js` (shared rules in `packages/config`).
- **Tooling:** pnpm via corepack (`corepack enable`), Node 22 (`nvm use`).
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

Planning and implementation follow OpenSpec (spec-driven development):

- **New feature or reshape:** `/opsx:propose` (or the `change-planner` subagent) creates
  `openspec/changes/<name>/` with proposal, specs, design and tasks. Validate with
  `openspec validate <name> --strict`.
- **Build:** `/opsx:apply <name>`. Read the change's proposal, specs, design and tasks first.
- **One branch per feature (change):** `feature/<change-name>`, branched from `main`.
- **One commit per task group** (Conventional Commits), so history shows each step. Tick the
  group's checkboxes in `tasks.md` in the same commit.
- Before a task group is done:
  - lint, typecheck and tests pass
  - run `code-reviewer`
  - also run `privacy-reviewer` for anything touching data, and `ux-a11y-reviewer` for UI
  - fix every must-fix
- **When a change is complete:** merge the feature branch into `main`, then
  `/opsx:archive <name>` moves its specs into `openspec/specs/` (fix any links that pointed into
  the change folder).
- Dependencies named "(ask first)" in a task are approved once the user asks to implement that
  change; ask before adding any other dependency, and explain why.
- Never commit secrets; use `.env.example`.
- Stop for review at the end of each change, or sooner if a decision is genuinely the user's.

Progress lives in the `tasks.md` checkboxes (`openspec list` shows it).

## Subagents (`.claude/agents/`)

| Agent | Use when |
|---|---|
| `change-planner` | Turning an idea into an OpenSpec change (docs only) |
| `test-writer` | Writing tests from a change's spec scenarios, before/alongside code |
| `code-reviewer` | Before marking any task group done: reviews the diff and runs lint/typecheck/tests |
| `privacy-reviewer` | Diff touches data models, events, logging, export/deletion, consent or copy about cycles |
| `ux-a11y-reviewer` | Diff touches anything in `apps/web` users see or interact with |

## Where things live

- Planned work: [openspec/changes/](openspec/changes/) · Current truth after archive:
  [openspec/specs/](openspec/specs/) · Rules for artifacts: [openspec/config.yaml](openspec/config.yaml)
- Order of changes: [docs/ROADMAP.md](docs/ROADMAP.md)
- Stretch ideas: [docs/product/BACKLOG.md](docs/product/BACKLOG.md). Do not implement these
  without an OpenSpec change.
- Earlier epic/spec/task files (pre-OpenSpec) are in git history before the migration commit.
