# Tasks

## 1. Domain: exercise catalogue + equipment types (T-05-01)

- [ ] 1.1 Confirm the free-exercise-db licence and record it in design.md. Verify the licence text is linked
- [ ] 1.2 Write `scripts/import-exercises.ts` to copy ~40 chosen exercises and images into the catalogue and `apps/web/public/exercises/`. Verify the script is re-runnable and output is committed
- [ ] 1.3 Add catalogue types, data (own cues, alt text, source/licence) and `filterByEquipment`. Verify invariants tests, bodyweight coverage ≥ 5 per group, and subset-filter tests

## 2. Domain: generated-workout schema + validator (T-05-02)

- [ ] 2.1 Add the `GeneratedWorkoutDraft` zod schema and its JSON Schema export. Verify table-driven tests for bounds and the unclear/off-topic shapes
- [ ] 2.2 Add `isValidSelection` with reasons `UNKNOWN_EXERCISE`, `DUPLICATE_EXERCISE`, `WRONG_COUNT`, `MEASURE_MISMATCH`. Verify a test per reason

## 3. API: generator interface, Anthropic adapter + fake (T-05-03)

- [ ] 3.1 Add the `WorkoutGenerator` interface, prompt builder and fake. Verify prompt snapshot tests prove no personal fields are included and the fake is deterministic
- [ ] 3.2 Add the Anthropic adapter with structured output, timeout and one retry (ask first: @anthropic-ai/sdk). Verify retry/timeout tests with a mocked client
- [ ] 3.3 Add env config (`WORKOUT_GENERATOR`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`) and `.env.example` entries. Verify fail-fast without a key when `anthropic` is selected

## 4. API: `generateWorkout` mutation (T-05-04)

- [ ] 4.1 Add the SDL (codegen) and resolver with auth, flag, input validation, candidates, validation + retry and mapping. Verify resolver tests with the fake for success and each error reason
- [ ] 4.2 Add the in-memory rate limiter with an injected clock. Verify the 11th call in an hour is `RATE_LIMITED`
- [ ] 4.3 Add `prompt` to redact paths and the metrics counter. Verify a log-capture test shows the prompt never appears

## 5. Web: entry + free-text path (T-05-05)

- [ ] 5.1 Add the flag-gated entry with two choices and the Describe form (label, counter, privacy hint via `aria-describedby`, equipment chips). Verify unit tests for form validation
- [ ] 5.2 Add the `use-generate-workout` hook with polite loading announcement and alert errors that keep the text. Verify error-reason → copy mapping tests

## 6. Web: guided-questions path (T-05-06)

- [ ] 6.1 Build the 3-step guided form with fieldsets, legends, focus on step change and kept answers. Verify step-machine unit tests

## 7. Web: result view (T-05-07)

- [ ] 7.1 Build the result view (focused heading, ordered list, tags, sets × reps, cue, self-hosted images with alt, attribution where required, disclaimer, Try again, Start over). Verify `format-prescription` tests and reload returns to entry

## 8. E2E + axe for both paths (T-05-08)

- [ ] 8.1 Add `workout-builder.cy.ts` for both paths, the off-topic error and keyboard-only guided flow against the fake. Verify `pnpm e2e` passes with `checkA11y` on every state and no third-party requests

## 9. Manual prompt-eval script (T-05-09)

- [ ] 9.1 Add `scripts/eval-workout-prompts.ts` with ~20 synthetic prompts (on-topic, unclear, off-topic, injection, medical) and `pnpm eval:workout-prompts`. Verify it exits non-zero without a key and prints a pass-rate table
- [ ] 9.2 Run it once and record the pass rate in design.md Open Questions. Verify the result is written down

## Workflow follow-up

- Archive this change once every group is merged and the spec scenarios pass.
