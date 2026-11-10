# Tasks

## 1. Testcontainers harness

- [ ] 1.1 Add a shared integration-test harness that starts a MongoDB 8 replica set with healthcheck waits, plus `pnpm test:int` in Turbo (ask first: testcontainers). Verify a trivial transaction test passes
- [ ] 1.2 Run `test:int` in CI after unit tests (Docker is available on GitHub runners). Verify the CI job runs it

## 2. Better Auth in API (T-01-01)

- [ ] 2.1 Add Better Auth with the MongoDB adapter and email/password (ask first: better-auth). Verify sign-up and sign-in via HTTP return a session cookie with HttpOnly, Secure and SameSite=Lax
- [ ] 2.2 Log verification and reset links to the API console in development only (decided: no mail container). Verify the link appears in dev and is never logged when NODE_ENV=production
- [ ] 2.3 Verify an integration test (harness from group 1) resolves a session from a cookie

## 3. GraphQL auth context + `me` (T-01-02)

- [ ] 3.1 Resolve the session into a typed `ctx.user | null` and add an auth guard helper. Verify unit tests for the guard returning `UNAUTHENTICATED`
- [ ] 3.2 Add the `me` query (SDL first, codegen). Verify `me` returns id and email when signed in and `null` otherwise

## 4. Web auth screens (T-01-03)

- [ ] 4.1 Add sign-up, sign-in and sign-out screens with labelled fields and inline errors. Verify sign-up lands on Log, signed in
- [ ] 4.2 Clear the Apollo in-memory cache on sign-out. Verify a unit test of the sign-out handler
- [ ] 4.3 Verify duplicate-email sign-up shows a generic error

## 5. App shell + bottom nav (T-01-04)

- [ ] 5.1 Add routing and the bottom nav (Log, History, Insights placeholder, Settings) with text labels, 44×44 targets and `aria-current` (ask first: react-router). Verify keyboard navigation and current-page marking
- [ ] 5.2 Add a protected-route wrapper. Verify signed-out users are redirected to sign-in

## 6. Installable PWA (T-01-05)

- [ ] 6.1 Add vite-plugin-pwa with manifest and icons, caching the app shell only (ask first). Verify Lighthouse reports installable and Cache Storage holds no GraphQL responses
- [ ] 6.2 Verify standalone launch with the Cadence icon on Android Chrome (manual, note the result)

## 7. Domain: pace + units (T-01-06)

- [ ] 7.1 Add `paceSecondsPerKm`, `formatPace`, distance/duration parsing and unit conversion. Verify table-driven tests including 0 distance, 3.1 mi → 4989 m and `h:mm:ss`/`mm:ss` parsing
- [ ] 7.2 Add `strengthVolumeKg` and total sets. Verify tests with bodyweight sets (no weight)

## 8. Workout models (T-01-07)

- [ ] 8.1 Add the Mongoose `workouts` model with the `kind` discriminator and the pagination index (ask first: mongoose). Verify an integration test inserts both kinds and the index exists
- [ ] 8.2 Add the shared zod input schemas (run, strength) used by client and server. Verify unit tests for every validation rule in the spec

## 9. `logRun` mutation (T-01-08)

- [ ] 9.1 Add `logRun` (SDL first, codegen, zod, auth). Verify unit tests for success, each `BAD_USER_INPUT` case and `UNAUTHENTICATED`
- [ ] 9.2 Verify errors name fields without values and logs contain no RPE/energy/notes (log-capture test)

## 10. `logStrengthSession` mutation (T-01-09)

- [ ] 10.1 Add `logStrengthSession` with derived `totalSets` and `totalVolumeKg`. Verify 3×3 sets report 9 sets and the correct volume
- [ ] 10.2 Add `recentExerciseNames` from the user's own history. Verify another user's names never appear

## 11. Workout history query (T-01-10)

- [ ] 11.1 Add `workouts(first, after)` with opaque cursors and `workout(id)`. Verify an integration test pages 25 workouts as 20 + 5 in order
- [ ] 11.2 Verify another user's id returns `NOT_FOUND`

## 12. Update/delete mutations (T-01-11)

- [ ] 12.1 Add `updateRun`, `updateStrengthSession` and `deleteWorkout` with create-level validation. Verify unit tests for success and `NOT_FOUND` on deleted or foreign ids

## 13. Web: log run form (T-01-12)

- [ ] 13.1 Build the run form with live pace, segmented RPE/energy, `inputmode` fields, bottom primary action and an `aria-live` toast. Verify 5 km in 27:30 shows 5:30 /km and saves
- [ ] 13.2 Add the implausible-pace hint. Verify it shows below 2:30 /km without blocking save
- [ ] 13.3 Time the flow on a phone after one practice attempt. Verify the median is under 15 s (note the result)

## 14. Web: log strength form (T-01-13)

- [ ] 14.1 Build the strength form with `useFieldArray`, "Add set" copying the previous set, per-set labels and focus management (ask first: react-hook-form). Verify adding/removing sets keeps focus sensible
- [ ] 14.2 Add exercise-name suggestions. Verify they come from `recentExerciseNames`

## 15. Web: history view (T-01-14)

- [ ] 15.1 Build the history list (labels with icons, local-date grouping, Load more) and detail view. Verify empty, loading (skeleton) and error-with-retry states

## 16. Web: edit/delete workout (T-01-15)

- [ ] 16.1 Reuse the forms for edit, pre-filled. Verify edits save and validation matches create
- [ ] 16.2 Add the accessible delete dialog (focus trap, Esc cancels) with a 5 s undo toast. Verify Undo within 5 s prevents the mutation

## 17. Cypress + axe + log-run E2E (T-01-16)

- [ ] 17.1 Set up Cypress and cypress-axe with `cy.checkA11y()` on every visit (ask first). Verify an empty smoke test passes
- [ ] 17.2 Add the sign-up → log run → see it in History journey at 390×844. Verify it passes with no serious or critical axe violations
- [ ] 17.3 Add a keyboard-only log-run test. Verify it completes without pointer events


## 18. Privacy notice page

- [ ] 18.1 Add `/privacy` with plain-language copy (what's collected, why, no third parties except the AI provider, export and deletion rights) linked from sign-up and Settings. Verify the links work and `privacy-reviewer` approves the copy
- [ ] 18.2 Verify axe passes on `/privacy` in the E2E suite

## Workflow follow-up

- Archive this change once every group is merged and the spec scenarios pass.
