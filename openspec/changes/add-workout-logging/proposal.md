# Proposal: Add workout logging

## Why

Logging is the core loop. The target user logs one-handed straight after training, so a run
must take under 15 seconds. She also needs a private account and a history she can fix.

## What Changes

- Email + password accounts with self-hosted Better Auth
  ([ADR-0005](../../../docs/adr/0005-self-hosted-auth-better-auth.md)); session in the GraphQL
  context.
- Installable app shell with bottom navigation (Log, History, Insights, Settings).
- Log runs (distance, duration, RPE, optional energy and notes) with live pace.
- Log strength sessions (exercises, sets, reps, optional weight) with fast set entry.
- History with detail, edit and delete.
- Domain: pace, units, strength volume.
- A plain-language privacy notice linked from sign-up and Settings.
- Cypress + axe with a sign-up → log run → history journey.

## Capabilities

### New Capabilities
- `user-accounts`: sign-up, sign-in, sign-out, authenticated API access.
- `app-shell`: installable PWA shell, navigation, baseline accessibility.
- `workout-logging`: create, edit and delete runs and strength sessions with validation.
- `workout-history`: browsing the user's own workouts.

### Modified Capabilities
- None.

## Out of scope

Outbox events (next change), cycle tracking, insights, real password-reset email, OAuth,
passkeys, offline queue, a shared exercise list built from other users.

## Impact

API auth routes, `workouts` model and resolvers; web auth, shell, forms, history, Cypress;
domain pace/units/volume. Dependencies (asked per task): testcontainers, better-auth, mongoose,
react-router, react-hook-form, react-aria-components, vite-plugin-pwa, cypress, cypress-axe.

## Depends on

`setup-foundation`.
