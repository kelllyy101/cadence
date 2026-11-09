# T-05-03 — API: `WorkoutGenerator` interface, Anthropic adapter + fake

- **Status:** todo
- **Epic:** [EPIC-05](../../epics/EPIC-05-ai-workout-builder.md)
- **Spec:** [ai-workout-builder § Server flow](../../specs/ai-workout-builder.md#server-flow)
- **Estimate:** 2–3 h
- **Branch:** `task/T-05-03-api-workout-generator-adapter`

## Context
[ADR-0007](../../adr/0007-llm-workout-generation-claude-api.md) puts the LLM behind an
interface. This task adds:
- the interface
- the Claude implementation (structured output, timeout, retry)
- a deterministic fake for tests and offline dev
- env config

The resolver comes in T-05-04.

## Acceptance criteria
- **Given** `WORKOUT_GENERATOR=fake`, **when** the API starts without `ANTHROPIC_API_KEY`,
  **then** it starts, and the factory returns `FakeWorkoutGenerator`.
- **Given** `WORKOUT_GENERATOR=anthropic` and no key, **when** the API starts, **then** env
  validation fails fast with a clear message that doesn't include any secret.
- **Given** a request, **when** the prompt builder runs, **then**:
  - the system prompt contains the rules
  - the candidates are serialised as `{ id, name, equipment, muscleGroups, measure }`
  - the user text is wrapped in delimiters
  - no userId or other personal fields are included
- **Given** the fake receives a prompt containing a configured trigger (e.g. `poem`), **when**
  called, **then** it returns `off_topic`. Otherwise it returns a valid draft from the
  candidates.
- **Given** the provider times out (20 s) or returns 5xx, **when** called, **then** it retries
  once and then throws a typed `GeneratorUnavailableError`.

## Likely files touched
- `apps/api/src/workout-generator/{workout-generator.ts,anthropic-workout-generator.ts,fake-workout-generator.ts,build-prompt.ts,factory.ts}`
- matching `*.test.ts`
- `apps/api/src/config/env.ts` (zod env schema), `.env.example`

## Required tests
- Unit: prompt builder (snapshot plus "no personal fields" assertion), the fake's behaviour,
  the factory/env selection, and the adapter's retry/timeout using a mocked SDK client. The
  provider is an external HTTP API, not Mongo or Kafka, so mocking it in unit tests is allowed.

## Definition of done
- [ ] Acceptance criteria met
- [ ] `pnpm lint`, `pnpm typecheck` and `pnpm test` pass
- [ ] `code-reviewer` run and must-fixes resolved
- [ ] `privacy-reviewer` run (new processor, data sent outward)
- [ ] `.env.example` and CLAUDE.md updated with the `WORKOUT_GENERATOR` / `ANTHROPIC_*` vars
- [ ] Task status and [BOARD.md](../BOARD.md) updated
- [ ] Commit message suggested (e.g. `feat(api): add workout generator with anthropic and fake adapters`)

## Dependencies
- T-05-02, T-00-07 (API hello GraphQL), T-00-08 (logging/env)

## Notes
- **New dependency (ask first):** `@anthropic-ai/sdk`. Check the current SDK's
  structured-output support and the model ID before implementing.
- Never log the request body. Log only the outcome status, latency and the provider request ID.
