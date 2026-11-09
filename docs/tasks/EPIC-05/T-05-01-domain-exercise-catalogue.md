# T-05-01 — Domain: exercise catalogue + equipment types

- **Status:** todo
- **Epic:** [EPIC-05](../../epics/EPIC-05-ai-workout-builder.md)
- **Spec:** [ai-workout-builder § Exercise catalogue](../../specs/ai-workout-builder.md#exercise-catalogue)
- **Estimate:** 2–3 h
- **Branch:** `task/T-05-01-domain-exercise-catalogue`

## Context
The AI may only choose exercises from Cadence's own catalogue
([ADR-0007](../../adr/0007-llm-workout-generation-claude-api.md)). This task adds the typed
catalogue data and the filtering function to `packages/domain`. The data is pure, so there's no
I/O. Names, cues and video URLs shown to users always come from here, never from the model.
This task also settles the spec's open question about the **video source**.

## Acceptance criteria
- **Given** the catalogue, **when** the invariants test runs, **then**:
  - every `id` is unique kebab-case
  - every `videoUrl` is https
  - every `cue` is ≤ 140 chars
  - every exercise has ≥ 1 muscle group
- **Given** bodyweight only, **when** `filterByEquipment(catalogue, [])` runs, **then** it
  returns only exercises with no required equipment, and every `MuscleGroup` has ≥ 5 of them.
- **Given** `['kettlebell']`, **when** filtered, **then** the result contains kettlebell and
  bodyweight exercises and nothing that needs a dumbbell, bench, band, step or bar.
- **Given** an exercise that needs `['dumbbell', 'bench']`, **when** the user has only
  `['dumbbell']`, **then** it's excluded.

## Likely files touched
- `packages/domain/src/exercises/{types.ts,catalogue.ts,filter.ts,index.ts}`
- `packages/domain/src/exercises/{catalogue.test.ts,filter.test.ts}`
- `packages/domain/src/index.ts` (re-export)
- `docs/specs/ai-workout-builder.md` (record the video-source decision)

## Required tests
- Unit: catalogue invariants (table-driven) and `filterByEquipment` cases (subset logic,
  bodyweight always allowed, multi-equipment exercises).

## Definition of done
- [ ] Acceptance criteria met
- [ ] `pnpm lint`, `pnpm typecheck` and `pnpm test` pass
- [ ] `code-reviewer` run and must-fixes resolved
- [ ] Video-source decision recorded in the spec (licensing checked, link-out only)
- [ ] Task status and [BOARD.md](../BOARD.md) updated
- [ ] Commit message suggested (e.g. `feat(domain): add exercise catalogue and equipment filter`)

## Dependencies
- T-00-03 (domain package + Vitest)

## Notes
- About 40 exercises to start. Write the cues ourselves (short, safe, neutral).
- Placeholder video URLs are fine until the source is decided, but they must be https and pass
  the invariants test.
