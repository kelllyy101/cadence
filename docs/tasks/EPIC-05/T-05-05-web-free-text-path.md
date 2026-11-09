# T-05-05 — Web: Build-a-workout entry + free-text path

- **Status:** todo
- **Epic:** [EPIC-05](../../epics/EPIC-05-ai-workout-builder.md)
- **Spec:** [ai-workout-builder § Behaviour](../../specs/ai-workout-builder.md#behaviour)
- **Estimate:** 2–3 h
- **Branch:** `task/T-05-05-web-free-text-path`

## Context
This adds the user-facing entry point and the "Describe it" path. The free-text box is also
where a voice transcript will land later (backlog), so keep the submit logic separate from the
input component.

## Acceptance criteria
- **Given** the flag is on, **when** the user opens Log, **then** they see a "Build a workout"
  entry. **Given** the flag is off, **then** it isn't rendered.
- **Given** the entry screen, **when** it renders, **then** it shows two choices, **Describe
  it** and **Answer questions**, each ≥ 44×44 px.
- **Given** the Describe screen, **when** it renders, **then**:
  - the textarea has a visible label and a character counter (max 500)
  - the privacy hint is visible and linked via `aria-describedby`
  - optional equipment chips work as labelled toggle buttons or checkboxes
- **Given** a submit, **when** the request is in flight, **then** the button is disabled and
  "Building your workout…" is announced in an `aria-live="polite"` region.
- **Given** an `UNCLEAR_REQUEST`, `OFF_TOPIC`, `RATE_LIMITED` or `GENERATOR_UNAVAILABLE` error,
  **when** it's returned, **then** the spec's copy is shown in a `role="alert"` region and the
  text the user typed is kept.
- **Given** success, **when** the result arrives, **then** the app navigates to the result view
  (T-05-07).

## Likely files touched
- `apps/web/src/features/workout-builder/{BuildWorkoutEntry.tsx,DescribeWorkoutForm.tsx,EquipmentChips.tsx,use-generate-workout.ts,copy.ts}`
- `apps/web/src/graphql/generate-workout.graphql`, then `pnpm codegen`
- routing in the app shell

## Required tests
- Unit: form validation (zod schema mirrors the server limits) and mapping error reasons to
  copy.
- E2E: covered in T-05-08.

## Definition of done
- [ ] Acceptance criteria met
- [ ] `pnpm lint`, `pnpm typecheck` and `pnpm test` pass
- [ ] `code-reviewer` run and must-fixes resolved
- [ ] `ux-a11y-reviewer` run
- [ ] `privacy-reviewer` run (copy about what's sent to the AI)
- [ ] Task status and [BOARD.md](../BOARD.md) updated
- [ ] Commit message suggested (e.g. `feat(web): add build-a-workout free-text path`)

## Dependencies
- T-05-04, T-01-04 (app shell)

## Notes
- Don't persist the prompt in localStorage or the Apollo cache persistence
  ([ARCHITECTURE § client storage](../../architecture/ARCHITECTURE.md#privacy-design)).
