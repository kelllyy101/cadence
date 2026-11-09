# Cadence — project memory

Cycle-aware training PWA for women who run and lift. Portfolio piece: **code quality, UX,
accessibility and privacy beat feature count.**

[Vision](docs/product/VISION.md) · [Architecture](docs/architecture/ARCHITECTURE.md) ·
[ADRs](docs/adr/README.md) · [Roadmap](docs/ROADMAP.md) · [Plans](openspec/changes/)

## Stack

| Area | Choice |
|---|---|
| Monorepo | pnpm workspaces + Turborepo ([ADR-0001](docs/adr/0001-monorepo-pnpm-turborepo.md)) |
| Runtime | Node 22, TypeScript strict |
| Web | React + Vite PWA, Apollo Client, Recharts, react-hook-form + zod ([ADR-0002](docs/adr/0002-pwa-over-native.md)) |
| API | Apollo Server, schema-first + codegen ([ADR-0003](docs/adr/0003-schema-first-graphql-codegen.md)); REST for export/health/metrics |
| Auth | Better Auth + MongoDB adapter ([ADR-0005](docs/adr/0005-self-hosted-auth-better-auth.md)) |
| Data / events | MongoDB 8 replica set + Mongoose; Kafka 4 KRaft + outbox ([ADR-0004](docs/adr/0004-kafka-kraft-transactional-outbox.md)) |
| AI | Claude API behind `WorkoutGenerator` + fake ([ADR-0007](docs/adr/0007-llm-workout-generation-claude-api.md)) |
| Tests | Vitest, Testcontainers, Cypress + cypress-axe |
| Ops | pino (redacted), `/health`, `/metrics`, OpenFeature file provider; `docker compose up` ([ADR-0006](docs/adr/0006-local-first-hosting-docker-compose.md)) |
| Planning | OpenSpec 1.16 (`npm i -g @fission-ai/openspec`) |

## Folder map

```
apps/web | apps/api | apps/insights-worker
packages/domain   pure logic (no I/O)      packages/events   event schemas + topics
packages/config   tsconfig + ESLint        scripts/          dev utilities
docs/             vision, architecture, adr, roadmap, backlog
openspec/         config.yaml, changes/ (planned), specs/ (shipped)
.claude/          agents/, skills/, commands/opsx/
```

## Commands

```bash
openspec list | openspec validate --all --strict
pnpm dev | lint | typecheck | test | test:int | e2e | codegen | format
docker compose up
```

## Conventions

- **TypeScript:** strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`; no `any`;
  no `!` without a comment.
- **Packages:** consumed as TS source via `exports` (no build step). Configs extend
  `@cadence/config/tsconfig.{base,node,react}.json`; root `eslint.config.js`.
- **Tooling:** Node 22 (`nvm use`), pnpm via corepack.
- **Boundaries:** validate every external input with zod (GraphQL args, REST, Kafka, env, LLM
  output).
- **Domain:** `packages/domain` is pure: no I/O, frameworks, logging or `Date.now()` (inject a
  clock).
- **GraphQL:** SDL first, then codegen, then resolvers. Codes: `UNAUTHENTICATED`, `FORBIDDEN`,
  `BAD_USER_INPUT`, `NOT_FOUND`, `CONSENT_REQUIRED`. Never echo health values.
- **Events:** `packages/events` envelope, keyed by `userId`, outbox only, idempotent consumers.
- **Units:** store SI; convert at the UI edge.
- **Naming:** `kebab-case.ts`, `PascalCase.tsx`, `snake_case` collections.
- **Tests:** unit `*.test.ts` beside source; integration `*.int.test.ts` with real Mongo/Kafka
  (never mocked); E2E `apps/web/cypress/e2e/*.cy.ts` with `cy.checkA11y()` on every visit.
  Behaviour names, Given/When/Then, synthetic data only.
- **Commits:** Conventional Commits.
- **Writing:** plain words, short sentences, bullets over paragraphs, say each fact once.
  Budgets: README ≤ 400 words, ADR ≤ 250, proposal ≤ 300, design ≤ 500, agent ≤ 200, spec
  requirement 1–2 sentences. Readers are recruiters and developers who skim.

## Privacy rules (non-negotiable)

Cycle data is GDPR Art. 9 special-category data. Details: [privacy design](docs/architecture/ARCHITECTURE.md#privacy-design).

1. Cycle tracking is off by default and needs explicit, versioned consent.
2. Withdrawing consent deletes cycle data and derived insights.
3. Full JSON export; account deletion propagates via `user.deletion_requested`.
4. Collect only what's used. No third-party analytics or trackers.
5. Health data never in logs, errors, metric labels or event payloads.
6. Phase is always an estimate: not medical advice, not contraception.
7. Insights never imply causation; show "not enough data yet" instead of guessing.

## Workflow

- **Plan:** `/opsx:propose` (or `change-planner`), then `openspec validate <name> --strict`.
- **Build:** `/opsx:apply <name>` on branch `feature/<change-name>`; one commit per task group,
  with its `tasks.md` boxes ticked.
- **Before a group is done:** lint, typecheck and tests pass; run `code-reviewer`, plus
  `privacy-reviewer` (data, events, logs, consent, cycle copy) and `ux-a11y-reviewer` (UI); fix
  every must-fix.
- **Finish:** merge to `main`, `/opsx:archive <name>`, fix links into the change folder.
- Dependencies marked "(ask first)" in a task are approved when the user asks to build that
  change; ask about any others.
- Never commit secrets. Stop for review at the end of each change.

## Subagents

| Agent | Use when |
|---|---|
| `change-planner` | Turning an idea into an OpenSpec change |
| `test-writer` | Writing tests from spec scenarios |
| `code-reviewer` | Before finishing any task group |
| `privacy-reviewer` | Data, events, logging, export/deletion, consent, AI builder, cycle copy |
| `ux-a11y-reviewer` | Anything users see in `apps/web` |

Backlog: [docs/product/BACKLOG.md](docs/product/BACKLOG.md); don't build without a change.
