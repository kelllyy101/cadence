# Spec Delta

## Purpose

Shows users descriptive summaries of their own training (weekly load for everyone, and
by-estimated-phase comparisons for consenting users) without implying causation or guessing from
too little data.

## ADDED Requirements

### Requirement: Weekly training summary
The system SHALL show, for the last 12 ISO weeks in the user's timezone, run distance, run count,
strength sessions, strength sets and average RPE, with a chart, an equivalent table and a summary
sentence.

#### Scenario: Chart and table agree
- **GIVEN** a user with workouts over 4 or more weeks
- **WHEN** they open Insights and choose "Show as table"
- **THEN** the table shows the same values as the chart

#### Scenario: Summary sentence
- **WHEN** weekly insights render
- **THEN** a sentence like "Over the last 4 weeks you ran 62 km across 11 runs." is shown

### Requirement: By-phase comparison
For users with active, current cycle consent, the system SHALL show per estimated phase over the
last 6 cycles: session count, average RPE, average energy, average pace for runs of 3 km or more,
and average strength volume per session, plus the count of workouts that could not be matched to
a phase.

#### Scenario: No consent
- **GIVEN** a user without cycle consent
- **WHEN** they open Insights
- **THEN** only weekly insights render, `byPhase` is null from the API, and a dismissible explainer card is shown

#### Scenario: Unmatched workouts
- **GIVEN** workouts on dates with an unknown phase
- **WHEN** by-phase insights render
- **THEN** those workouts are excluded and their count is shown

### Requirement: Low-data thresholds
A phase metric SHALL only be shown when the phase has at least 3 sessions and data spans at least
2 cycles; otherwise it SHALL show "Not enough data yet" with guidance on what is needed.

#### Scenario: Too few sessions
- **GIVEN** 2 strength sessions in the estimated luteal phase
- **WHEN** insights render
- **THEN** that cell shows "Not enough data yet" and says how many more sessions are needed

### Requirement: Non-causal language
Insight copy SHALL describe the user's own data only and SHALL never use causal or prescriptive
phrases ("because", "causes", "makes you", "should", "optimal", "best time to") or population
comparisons; every phase section SHALL carry "Estimated phases · Patterns in your data, not
medical advice."

#### Scenario: Banned phrase
- **GIVEN** a copy string containing "should"
- **WHEN** the banned-phrase test runs
- **THEN** it fails

### Requirement: Insight freshness
The insights query SHALL report `NO_DATA` before any insights exist, `UPDATING` when the latest
workout is newer than the computation, and `READY` otherwise; the UI SHALL poll gently while
updating and announce when ready.

#### Scenario: Updating
- **GIVEN** a workout logged after the last computation
- **WHEN** Insights is opened
- **THEN** "Updating…" shows and readiness is announced politely when the new data arrives

### Requirement: Accessible charts
Every chart SHALL have a text summary, a table alternative, an accessible name, no colour-only
encoding, sufficient contrast and no animation under reduced-motion preferences.

#### Scenario: Axe on Insights
- **WHEN** axe runs on the Insights screen
- **THEN** there are no serious or critical violations

### Requirement: Derived data privacy
By-phase insights SHALL be treated as special-category data: removed on consent withdrawal and
account deletion, included in export, and never pushed or notified outside the app.

#### Scenario: Withdrawal hides phase insights immediately
- **GIVEN** a user with phase insights
- **WHEN** they withdraw consent
- **THEN** the next insights query returns `byPhase` as null even before the worker runs
