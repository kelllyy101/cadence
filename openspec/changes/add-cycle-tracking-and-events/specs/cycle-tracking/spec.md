# Spec Delta

## Purpose

Lets consenting users record the dates their periods started, the only cycle data Cadence
stores, so phases can be estimated.

## ADDED Requirements

### Requirement: Log a period start
A consenting user SHALL be able to log a period start date (default today, not in the future),
stored as a calendar date with no time.

#### Scenario: Log today
- **GIVEN** a user with current consent
- **WHEN** they tap "Period started" and save
- **THEN** an entry with today's date is stored

#### Scenario: Future date rejected
- **WHEN** the user picks tomorrow's date
- **THEN** the entry is rejected with a field-level message

### Requirement: Backfill and manage entries
The user SHALL be able to backfill past dates and view, edit and delete recent entries, with at
most one entry per date.

#### Scenario: Duplicate date
- **GIVEN** an entry exists for a date
- **WHEN** the user logs the same date again
- **THEN** it is rejected as a duplicate

#### Scenario: Close entries warn
- **GIVEN** an entry 3 days earlier
- **WHEN** the user logs a new start
- **THEN** they see "That's close to your last entry — save anyway?" and can save

### Requirement: Cycle data minimisation and privacy
Period start date SHALL be the only cycle field stored, and cycle values SHALL never appear in
logs, errors, metrics or event payloads.

#### Scenario: Event payload has no date
- **WHEN** a period start is created, updated or deleted
- **THEN** the emitted `cycle.logged` event payload contains only the change type

#### Scenario: Timezone change
- **GIVEN** an entry for a calendar date
- **WHEN** the user's timezone changes
- **THEN** the stored date is not shifted
