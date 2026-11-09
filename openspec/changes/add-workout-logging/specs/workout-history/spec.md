# Spec Delta

## Purpose

Lets users review their own past workouts in order, see the details of each one, and reach edit
and delete from there.

## ADDED Requirements

### Requirement: Reverse-chronological history
The system SHALL list the user's workouts newest first, 20 per page, with an accessible "Load
more" button.

#### Scenario: Pagination
- **GIVEN** a user with 25 workouts
- **WHEN** they open History and press "Load more"
- **THEN** they see the newest 20 first and then the remaining 5, in order

### Requirement: History item content
Each history item SHALL show a type icon with a text label (never the icon alone), the date, the
key metric (distance and pace, or exercise count and sets) and the RPE.

#### Scenario: Run item
- **WHEN** a run appears in History
- **THEN** it shows the label "Run", its date, distance, pace and RPE

### Requirement: Workout detail
The system SHALL show every field of a workout in a detail view with Edit and Delete actions.

#### Scenario: Opening detail
- **WHEN** the user selects a history item
- **THEN** the detail view shows all fields and the Edit and Delete actions

### Requirement: History states
History SHALL have distinct empty, loading and error states, and the error state SHALL offer a
retry.

#### Scenario: Empty history
- **GIVEN** a user with no workouts
- **WHEN** they open History
- **THEN** they see an empty state that points to logging a workout

#### Scenario: Load error
- **GIVEN** the API is unreachable
- **WHEN** History loads
- **THEN** an error message with a Retry button is shown

### Requirement: Local-date grouping
History SHALL group items by the user's local date while storing `performedAt` in UTC.

#### Scenario: Late-evening run
- **GIVEN** a user in UTC+2 logs a run at 23:30 local time
- **WHEN** they view History
- **THEN** the run is grouped under that local date
