# T-05-08 — E2E + axe for both paths

- **Status:** todo
- **Epic:** [EPIC-05](../../epics/EPIC-05-ai-workout-builder.md)
- **Spec:** [ai-workout-builder § Testing](../../specs/ai-workout-builder.md#testing)
- **Estimate:** 2 h
- **Branch:** `task/T-05-08-e2e-workout-builder`

## Context
This covers both journeys end to end, with the API running `WORKOUT_GENERATOR=fake` so CI never
calls the Claude API. Every state gets an axe check.

## Acceptance criteria
- **Given** a signed-in user and the flag on, **when** they submit "I have two kettlebells at
  home, give me five leg exercises", **then** the result shows 5 exercises, each with sets ×
  reps and a demo link.
- **Given** the guided path, **when** they choose dumbbell + step, legs and 4, **then** the
  result shows 4 exercises.
- **Given** the prompt "write me a poem", **when** it's submitted, **then** the off-topic
  message appears in an alert and the typed text is kept.
- **Given** every state (entry, describe, each guided step, loading, result, error), **when**
  `cy.checkA11y()` runs, **then** there are no serious or critical violations.
- **Given** a keyboard-only run of the guided path, **when** it completes, **then** focus lands
  on the result heading.

## Likely files touched
- `apps/web/cypress/e2e/workout-builder.cy.ts`
- `docker-compose` or Cypress env for `WORKOUT_GENERATOR=fake` and `workoutBuilder.enabled=true`

## Required tests
- E2E: the scenarios above.

## Definition of done
- [ ] Acceptance criteria met
- [ ] `pnpm e2e` passes locally and in CI
- [ ] `code-reviewer` run and must-fixes resolved
- [ ] `ux-a11y-reviewer` run
- [ ] Task status and [BOARD.md](../BOARD.md) updated
- [ ] Commit message suggested (e.g. `test(web): add workout builder e2e and a11y coverage`)

## Dependencies
- T-05-06, T-05-07, T-01-16 (Cypress + axe setup)
