# T-00-04 — Events package skeleton

- **Status:** todo
- **Epic:** [EPIC-00](../../epics/EPIC-00-foundation.md)
- **Spec:** [event-pipeline § envelope](../../specs/event-pipeline.md#event-envelope-packagesevents)
- **Estimate:** 1–2 h
- **Branch:** `task/T-00-04-events-package-skeleton`

## Context
`packages/events` is the single source of truth for event contracts. This task adds:
- the zod envelope
- the event type names and topic constants from the spec catalogue
- a `parseEvent(raw: unknown)` helper that returns a discriminated union

Per-event payload schemas are included now because they're small. No Kafka code goes here.

## Acceptance criteria
- **Given** a valid `workout.logged` message object, **when** `parseEvent` runs, **then** it
  returns `{ ok: true, event }` with `event.type` narrowed and the payload typed.
- **Given** a message with an unknown `type`, a missing `eventId` or extra payload keys,
  **when** `parseEvent` runs, **then** it returns `{ ok: false, error }` without throwing.
  Payload schemas are `.strict()`.
- **Given** the payload allow-list test, **when** someone adds a field such as `rpe` or
  `distanceM` to any payload schema, **then** the test fails.
- **Given** `TOPICS`, **when** imported, **then** it exposes `cadence.workouts.v1`,
  `cadence.cycle.v1`, `cadence.users.v1` and `cadence.dlq.v1`, plus a type→topic map.

## Likely files touched
- `packages/events/{package.json,tsconfig.json}`
- `packages/events/src/{envelope.ts,types.ts,topics.ts,parse.ts,index.ts}`
- `packages/events/src/*.test.ts`

## Required tests
- Unit: parse happy path for every event type, rejection cases, the payload allow-list
  (`Object.keys(schema.shape)` is a subset of the allowed keys), and type→topic mapping
  completeness.

## Definition of done
- [ ] Acceptance criteria met
- [ ] `pnpm lint`, `pnpm typecheck` and `pnpm test` pass
- [ ] `code-reviewer` run and must-fixes resolved
- [ ] `privacy-reviewer` run (event payloads)
- [ ] Task status and [BOARD.md](../BOARD.md) updated
- [ ] Commit message suggested (e.g. `feat(events): add event envelope, catalogue and topics`)

## Dependencies
- T-00-03 (Vitest setup)

## Notes
- **New dependencies (ask first):** `zod`. Use the current major; check whether v4's API
  differs from v3 examples.
- Includes `cycle.data_deleted`, which isn't in the original five events. See the spec for the rationale.
