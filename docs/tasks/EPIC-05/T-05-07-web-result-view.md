# T-05-07 — Web: result view

- **Status:** todo
- **Epic:** [EPIC-05](../../epics/EPIC-05-ai-workout-builder.md)
- **Spec:** [ai-workout-builder § Result](../../specs/ai-workout-builder.md#result)
- **Estimate:** 2 h
- **Branch:** `task/T-05-07-web-result-view`

## Context
This shows the generated workout: an ordered list of exercise cards with sets × reps (or
seconds), a coaching cue, tags and a demo link, plus the disclaimer. Rest breaks are out of
scope.

## Acceptance criteria
- **Given** a result, **when** it renders, **then**:
  - the heading reads like "5 leg exercises · kettlebell" and receives focus
  - exercises are in an `<ol>`
  - each card shows the name, equipment and muscle tags as text, sets × reps (or × N s) and the
    cue
- **Given** a demo link, **when** a screen reader reads it, **then** its accessible name is
  "Watch demo of {name} (opens in new tab)". It opens in a new tab with `rel="noopener noreferrer"`.
- **Given** the result view, **when** it renders, **then** the disclaimer "Suggestions, not
  medical advice. Stop if anything hurts." is visible.
- **Given** **Try again**, **when** it's pressed, **then** the same input is re-submitted.
  **Given** **Start over**, **when** it's pressed, **then** the user returns to the entry
  screen with no stored input.
- **Given** the user reloads the page, **when** there's no result in memory, **then** they're
  sent back to the entry screen (nothing is persisted).

## Likely files touched
- `apps/web/src/features/workout-builder/{WorkoutResult.tsx,ExerciseCard.tsx}`
- `apps/web/src/features/workout-builder/format-prescription.ts` (+ `.test.ts`)

## Required tests
- Unit: `format-prescription` ("3 × 10", "3 × 30 s") and the title builder.
- E2E: covered in T-05-08.

## Definition of done
- [ ] Acceptance criteria met
- [ ] `pnpm lint`, `pnpm typecheck` and `pnpm test` pass
- [ ] `code-reviewer` run and must-fixes resolved
- [ ] `ux-a11y-reviewer` run
- [ ] Task status and [BOARD.md](../BOARD.md) updated
- [ ] Commit message suggested (e.g. `feat(web): add workout builder result view`)

## Dependencies
- T-05-05

## Notes
- No embedded video players: link-out only (third-party embeds act as trackers).
