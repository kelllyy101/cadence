# Proposal: Add workout logging

## Why

Logging is the core loop: without fast, reliable logging there is nothing to learn from. The
target user logs on her phone straight after a session, often one-handed, so a run must take
under 15 seconds to log. She also needs a private account and a history she can correct.

## What Changes

- Email + password accounts with Better Auth, self-hosted with the MongoDB adapter
  ([ADR-0005](../../../docs/adr/0005-self-hosted-auth-better-auth.md)), and the session in the
  GraphQL context.
- An installable, mobile-first app shell with bottom navigation (Log, History, Insights
  placeholder, Settings).
- Log a run (distance, duration, RPE, optional energy and notes) with live pace.
- Log a strength session (exercises, sets, reps, optional weight) with fast set entry.
- Reverse-chronological history with detail, edit and delete.
- Domain functions for pace, unit conversion and strength volume.
- Cypress + cypress-axe setup with a sign-up → log run → history journey.

## Capabilities

### New Capabilities
- `user-accounts`: sign-up, sign-in, sign-out and authenticated access to the API.
- `app-shell`: installable PWA shell, navigation and baseline accessibility of every screen.
- `workout-logging`: creating, editing and deleting runs and strength sessions, with
  validation and derived values.
- `workout-history`: browsing the user's own workouts and their details.

### Modified Capabilities
- None.

## Out of scope

- Outbox events (retrofitted in `add-cycle-tracking-and-events`).
- Cycle tracking and insights.
- Password reset via real email (a dev-only transport is fine), OAuth and passkeys.
- Offline logging queue (backlog).
- A global exercise catalogue built from other users. (The AI builder's curated catalogue is a
  separate capability in `add-ai-workout-builder`.)

## Impact

- `apps/api`: Better Auth routes, Mongoose `workouts` model, workout resolvers.
- `apps/web`: auth screens, app shell, log forms, history, Cypress.
- `packages/domain`: pace, units, volume.
- New dependencies (asked per task): better-auth, mongoose, react-router, react-hook-form,
  vite-plugin-pwa, cypress, cypress-axe.

## Depends on

- `setup-foundation` (all groups).
