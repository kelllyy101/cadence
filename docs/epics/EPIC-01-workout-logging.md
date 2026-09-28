# EPIC-01 — Workout logging

Spec: [workout-logging](../specs/workout-logging.md)

## Goal
A signed-in user can log a run or a strength session on her phone in seconds, one-handed, and
review, edit and delete her history. All of this runs inside an installable, mobile-first app
shell.

## User stories
- As a **runner**, I want to log distance, time and how hard it felt, so I can track my runs
  without a GPS app.
- As a **runner**, I want to see my pace calculated automatically, so I don't have to work it out.
- As a **lifter**, I want to log exercises, sets, reps and weight quickly, with sets pre-filled
  from my previous set, so logging between sets isn't a chore.
- As a **user**, I want to optionally rate my energy, so I can later see patterns in how I felt.
- As a **user**, I want to scroll through my past workouts and fix mistakes, so my data is accurate.
- As a **user**, I want to create an account and stay signed in, so my data is private to me.
- As a **user**, I want to install the app to my home screen, so it opens like a native app.
- As a **screen-reader or keyboard user**, I want every logging flow to be fully operable, so I
  can use the app independently.

## Scope
- Better Auth email + password sign-up, sign-in and sign-out, and a session in the GraphQL context
- The app shell: bottom navigation (Log, History, Insights placeholder, Settings), routing, installable PWA
- Domain: pace calculation, unit conversion, strength volume
- API: workout models, and the log/update/delete/history operations
- Web: log run form, log strength form, history list and detail, edit/delete
- Cypress + cypress-axe setup, and an E2E test of the "sign up → log a run → see it in history" journey

## Out of scope
- Outbox events (retrofitted in EPIC-02)
- Cycle tracking, insights
- Password reset via real email (a dev-only transport is fine), OAuth and passkeys
- Offline logging queue (backlog)
- Exercise library or a global exercise catalogue

## Acceptance criteria
- Given a new visitor, when she signs up with email and password, then she lands on the Log
  screen, signed in.
- Given a signed-in user on a 390×844 viewport, when she logs a 5 km run in 27:30 with RPE 6,
  then it is saved, the pace shows 5:30 /km, and it appears at the top of History.
- Given a signed-in user, when she logs a strength session with 3 exercises of 3 sets each, then
  the total sets (9) and volume are shown in its detail.
- Given another user's workout ID, when a user queries or mutates it, then the API responds
  `NOT_FOUND`.
- Given any logging or history screen, when axe runs, then there are no serious or critical
  violations.
- Given a keyboard-only user, when she logs a run, then she can complete the flow without a
  mouse, with a visible focus indicator throughout.
- Given the app on Android Chrome, when the user installs it, then it launches standalone with
  the Cadence icon.

## Risks
| Risk | Mitigation |
|---|---|
| Better Auth + Mongo adapter + Apollo context wiring is unfamiliar | Spike inside T-01-01 and time-box it. Write an integration test for the session lookup |
| One-thumb UX is hard to get right on the first try | Prototype the run form early (T-01-12), then dogfood it and check it in usability sessions |
| Strength form complexity (dynamic arrays) harms a11y | Use react-hook-form `useFieldArray`, label each set explicitly ("Set 2 reps"), and manage focus on add/remove |
| Unit conversion rounding bugs | Store SI only and cover the domain functions with table-driven tests |

## Tasks
Full task files are in [docs/tasks/EPIC-01/](../tasks/EPIC-01/).

| ID | Title |
|---|---|
| T-01-01 | [Better Auth in API](../tasks/EPIC-01/T-01-01-better-auth-api.md) |
| T-01-02 | [GraphQL auth context + `me`](../tasks/EPIC-01/T-01-02-graphql-auth-context.md) |
| T-01-03 | [Web auth screens](../tasks/EPIC-01/T-01-03-web-auth-screens.md) |
| T-01-04 | [App shell + bottom nav](../tasks/EPIC-01/T-01-04-app-shell-bottom-nav.md) |
| T-01-05 | [Installable PWA](../tasks/EPIC-01/T-01-05-pwa-installable.md) |
| T-01-06 | [Domain: pace + units](../tasks/EPIC-01/T-01-06-domain-pace-units.md) |
| T-01-07 | [Workout models](../tasks/EPIC-01/T-01-07-workout-models.md) |
| T-01-08 | [`logRun` mutation](../tasks/EPIC-01/T-01-08-log-run-mutation.md) |
| T-01-09 | [`logStrengthSession` mutation](../tasks/EPIC-01/T-01-09-log-strength-mutation.md) |
| T-01-10 | [Workout history query](../tasks/EPIC-01/T-01-10-workout-history-query.md) |
| T-01-11 | [Update/delete mutations](../tasks/EPIC-01/T-01-11-update-delete-workout-mutations.md) |
| T-01-12 | [Web: log run form](../tasks/EPIC-01/T-01-12-web-log-run-form.md) |
| T-01-13 | [Web: log strength form](../tasks/EPIC-01/T-01-13-web-log-strength-form.md) |
| T-01-14 | [Web: history view](../tasks/EPIC-01/T-01-14-web-history-view.md) |
| T-01-15 | [Web: edit/delete workout](../tasks/EPIC-01/T-01-15-web-edit-delete-workout.md) |
| T-01-16 | [Cypress + axe + log-run E2E](../tasks/EPIC-01/T-01-16-cypress-axe-setup-log-run-e2e.md) |
