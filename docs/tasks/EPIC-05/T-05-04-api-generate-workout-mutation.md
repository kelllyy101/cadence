# T-05-04 — API: `generateWorkout` mutation

- **Status:** todo
- **Epic:** [EPIC-05](../../epics/EPIC-05-ai-workout-builder.md)
- **Spec:** [ai-workout-builder § API](../../specs/ai-workout-builder.md#api)
- **Estimate:** 2–3 h
- **Branch:** `task/T-05-04-api-generate-workout-mutation`

## Context
This wires the generator into GraphQL, schema first ([ADR-0003](../../adr/0003-schema-first-graphql-codegen.md)).
The resolver handles auth, the flag, input validation, the rate limit, candidate filtering, the
call to the generator, output validation (with one retry) and mapping IDs to catalogue entries.
Nothing is persisted.

## Acceptance criteria
- **Given** no session, **when** `generateWorkout` is called, **then** `UNAUTHENTICATED`.
- **Given** the `workoutBuilder.enabled` flag is off, **when** it's called, **then** `FORBIDDEN`.
- **Given** an empty or 501-char prompt with no focus, or `exerciseCount` 9, **when** it's
  called, **then** `BAD_USER_INPUT` / `INVALID_INPUT`, and the prompt isn't echoed in the
  message.
- **Given** the fake returns a valid draft, **when** it's called with `equipment: [KETTLEBELL]`,
  **then** every returned exercise needs only kettlebell or bodyweight, and its name, cue and
  videoUrl come from the catalogue.
- **Given** the generator returns an unknown ID and then a valid draft, **when** it's called,
  **then** the second draft is returned (one retry with the validation reason).
- **Given** two invalid drafts in a row, **when** it's called, **then** `INTERNAL_SERVER_ERROR`
  / `GENERATOR_UNAVAILABLE`.
- **Given** `unclear` or `off_topic`, **when** it's called, **then** `BAD_USER_INPUT` with
  `UNCLEAR_REQUEST` or `OFF_TOPIC`.
- **Given** 11 calls from one user within an hour, **when** the 11th arrives, **then**
  `BAD_USER_INPUT` / `RATE_LIMITED`.
- **Given** any call, **when** logs are captured, **then** the prompt text appears nowhere in
  them.

## Likely files touched
- `apps/api/src/schema/workout-builder.graphql`, then `pnpm codegen`
- `apps/api/src/resolvers/generate-workout.ts` (+ `.test.ts`)
- `apps/api/src/workout-generator/rate-limit.ts` (+ `.test.ts`)
- `apps/api/src/logging/redact.ts` (add the `prompt` path)
- `flags.json` (`workoutBuilder.enabled`, default `false`)

## Required tests
- Unit: resolver cases above using `FakeWorkoutGenerator`, rate limiter with an injected clock,
  and a log-capture test for prompt redaction.
- Integration: not required, because nothing here touches Mongo or Kafka.

## Definition of done
- [ ] Acceptance criteria met
- [ ] `pnpm lint`, `pnpm typecheck` and `pnpm test` pass
- [ ] `code-reviewer` run and must-fixes resolved
- [ ] `privacy-reviewer` run (logging, errors, outbound data)
- [ ] Task status and [BOARD.md](../BOARD.md) updated
- [ ] Commit message suggested (e.g. `feat(api): add generateWorkout mutation`)

## Dependencies
- T-05-03, T-01-02 (auth context)
- T-03-05 (OpenFeature provider). If it isn't done yet, add the minimal file provider and the
  `flags` query here, scoped to this flag.

## Notes
- The in-memory rate limiter is fine for a single API instance. Note in the code that it needs
  a shared store if the API scales out.
