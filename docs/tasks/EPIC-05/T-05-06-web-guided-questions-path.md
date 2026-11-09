# T-05-06 — Web: guided-questions path

- **Status:** todo
- **Epic:** [EPIC-05](../../epics/EPIC-05-ai-workout-builder.md)
- **Spec:** [ai-workout-builder § Path B](../../specs/ai-workout-builder.md#path-b-answer-questions)
- **Estimate:** 2–3 h
- **Branch:** `task/T-05-06-web-guided-questions-path`

## Context
This is the "Answer questions" path for people who'd rather tap than type: equipment, then
focus, then number of exercises. It calls `generateWorkout` without a prompt, so no free text
leaves the device.

## Acceptance criteria
- **Given** step 1, **when** it renders, **then** it shows a `<fieldset>` with the legend "What
  do you have at home?", one labelled checkbox per `Equipment` value, and "Nothing, bodyweight
  only". The step count reads "Step 1 of 3".
- **Given** the user moves to the next or previous step, **when** the step changes, **then**
  focus moves to the new step's legend and earlier answers are kept.
- **Given** step 2, **when** it renders, **then** focus is a required radio group (legs, glutes,
  upper body, core, full body). Next is blocked with an inline error if nothing is chosen.
- **Given** step 3, **when** it renders, **then** exercise count is a radio group from 3 to 8,
  with 5 pre-selected.
- **Given** the user submits, **when** the request runs, **then** the same loading, error and
  success behaviour as T-05-05 applies (reuse the hook and copy).

## Likely files touched
- `apps/web/src/features/workout-builder/{GuidedWorkoutForm.tsx,steps/*.tsx}`
- reuse of `use-generate-workout.ts`, `copy.ts` and `EquipmentChips.tsx` data

## Required tests
- Unit: step state machine (next, back, validation, keeping answers).
- E2E: covered in T-05-08.

## Definition of done
- [ ] Acceptance criteria met
- [ ] `pnpm lint`, `pnpm typecheck` and `pnpm test` pass
- [ ] `code-reviewer` run and must-fixes resolved
- [ ] `ux-a11y-reviewer` run
- [ ] Task status and [BOARD.md](../BOARD.md) updated
- [ ] Commit message suggested (e.g. `feat(web): add guided questions path to workout builder`)

## Dependencies
- T-05-05

## Notes
- Large tap targets, with no sliders (same principle as the RPE control in EPIC-01).
