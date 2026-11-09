# T-05-02 — Domain: generated-workout schema + selection validator

- **Status:** todo
- **Epic:** [EPIC-05](../../epics/EPIC-05-ai-workout-builder.md)
- **Spec:** [ai-workout-builder § Server flow](../../specs/ai-workout-builder.md#server-flow)
- **Estimate:** 1–2 h
- **Branch:** `task/T-05-02-domain-generated-workout-schema`

## Context
Model output is external input, so it gets validated at the boundary with zod (CLAUDE.md
conventions). This task defines the `GeneratedWorkoutDraft` schema the model must fill. It also
adds `isValidSelection`, which checks the draft against the candidate list and the request.
Both are pure and live in `packages/domain`, so the API adapter, the fake and the eval script
can share them.

## Acceptance criteria
- **Given** a draft with `status: 'ok'` and valid IDs, sets and reps, **when** parsed, **then**
  it passes.
- **Given** sets outside 1–6, reps outside 1–30, seconds outside 10–120, or a title over 60
  chars, **when** parsed, **then** it fails with a field-level issue.
- **Given** an exercise ID not in the candidate list, **when** `isValidSelection` runs, **then**
  it returns `{ ok: false, reason: 'UNKNOWN_EXERCISE' }`.
- **Given** duplicate IDs, the wrong exercise count, or reps on a `seconds` exercise, **when**
  validated, **then** it returns the matching reason (`DUPLICATE_EXERCISE`, `WRONG_COUNT`,
  `MEASURE_MISMATCH`).
- **Given** `status: 'unclear'` or `'off_topic'`, **when** parsed, **then** `exercises` may be
  empty and the selection check is skipped.

## Likely files touched
- `packages/domain/src/exercises/{generated-workout.ts,validate-selection.ts}`
- `packages/domain/src/exercises/{generated-workout.test.ts,validate-selection.test.ts}`

## Required tests
- Unit: table-driven schema cases and selection-validator reasons.

## Definition of done
- [ ] Acceptance criteria met
- [ ] `pnpm lint`, `pnpm typecheck` and `pnpm test` pass
- [ ] `code-reviewer` run and must-fixes resolved
- [ ] Task status and [BOARD.md](../BOARD.md) updated
- [ ] Commit message suggested (e.g. `feat(domain): add generated workout schema and selection validator`)

## Dependencies
- T-05-01

## Notes
- If zod isn't yet a dependency of `packages/domain`, ask before adding it (it's already part
  of the stack).
- Export a JSON Schema version of the draft schema for the adapter's structured-output request
  (for example via zod's JSON Schema export). Check this needs no extra dependency.
