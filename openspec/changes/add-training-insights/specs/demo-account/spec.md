# Spec Delta

## Purpose

Gives reviewers and hiring managers an instant, realistic tour of Cadence using only synthetic
data, reproducible on every run.

## ADDED Requirements

### Requirement: Deterministic synthetic seed
`pnpm seed:demo` SHALL create a demo account with about 16 weeks of workouts and 6 cycles of
synthetic data (including noise, missed sessions, an irregular cycle and a deload week) from a
seeded random generator, marked as demo in its settings.

#### Scenario: Idempotent and deterministic
- **GIVEN** a clean database
- **WHEN** `pnpm seed:demo` runs twice
- **THEN** the demo account has identical data after each run

### Requirement: Demo login
The demo account SHALL be reachable through documented credentials or a "Try the demo" button
shown only in dev and demo modes.

#### Scenario: Production build
- **GIVEN** a production build without demo mode
- **WHEN** the sign-in screen renders
- **THEN** no "Try the demo" button is shown
