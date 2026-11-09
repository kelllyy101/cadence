# Spec Delta

## Purpose

Lets users record runs and strength sessions quickly and accurately after training, storing SI
units and deriving pace and volume rather than storing them.

## ADDED Requirements

### Requirement: Log a run
The system SHALL let a user log a run with date/time (default now), distance and duration
(required), RPE 1–10 (required), optional energy 1–5 and optional notes up to 500 characters.

#### Scenario: Run saved with pace
- **GIVEN** a signed-in metric user
- **WHEN** they log 5 km in 27:30 with RPE 6
- **THEN** the run is saved, pace shows 5:30 /km, and it appears at the top of History

#### Scenario: Pace shown live
- **WHEN** the user types a distance and a duration
- **THEN** the derived pace updates as they type

### Requirement: Run validation
The system SHALL reject a distance ≤ 0 or > 1,000 km, a duration ≤ 0 or > 72 h, RPE outside
1–10, energy outside 1–5, and a date more than 24 h in the future, with field-level messages
that name the field but not its value.

#### Scenario: Distance out of range
- **WHEN** the user submits a distance of 0
- **THEN** the API responds `BAD_USER_INPUT` with a message on the distance field

#### Scenario: Implausible pace warning
- **WHEN** the entered values give a pace faster than 2:30 /km
- **THEN** the run can be saved, and a non-blocking "Double-check distance/time?" hint is shown

### Requirement: Log a strength session
The system SHALL let a user log 1–20 exercises, each with a name (max 60 chars) and 1–20 sets of
1–100 reps and optional weight 0–500 kg, plus required session RPE and optional energy, duration
and notes.

#### Scenario: Totals shown
- **WHEN** the user logs 3 exercises with 3 sets each
- **THEN** the detail view shows 9 total sets and the total volume (sum of reps × weight)

#### Scenario: Add set copies previous
- **GIVEN** a set with 8 reps at 20 kg
- **WHEN** the user taps "Add set"
- **THEN** the new set is pre-filled with 8 reps at 20 kg

#### Scenario: Empty session rejected
- **WHEN** the user submits a session with no exercises or an exercise with no sets
- **THEN** it is rejected with a field-level message

### Requirement: Exercise name suggestions
The system SHALL suggest recently used exercise names drawn only from the user's own history.

#### Scenario: Own history only
- **GIVEN** another user has logged "Nordic curl" and this user has not
- **WHEN** this user starts typing an exercise name
- **THEN** "Nordic curl" is not suggested

### Requirement: Units
The system SHALL store distances in metres, durations in seconds and weights in kilograms, and
display them in the user's metric or imperial preference.

#### Scenario: Imperial entry round-trips
- **GIVEN** an imperial user
- **WHEN** they enter 3.1 mi
- **THEN** 4989 m is stored and it is displayed back as 3.10 mi

### Requirement: Edit and delete workouts
The system SHALL let a user edit a workout with the same validation as create, and delete it
after confirmation in an accessible dialog, with a 5-second undo.

#### Scenario: Delete with undo
- **WHEN** the user confirms deletion and taps Undo within 5 seconds
- **THEN** the workout is not deleted

#### Scenario: Editing a deleted workout
- **GIVEN** the workout was deleted elsewhere
- **WHEN** the user saves an edit
- **THEN** they see "This workout no longer exists" and return to History

### Requirement: Ownership isolation
The system SHALL treat another user's workout as non-existent and respond `NOT_FOUND`, never
`FORBIDDEN`.

#### Scenario: Accessing another user's workout
- **GIVEN** a workout id belonging to another user
- **WHEN** a user queries, updates or deletes it
- **THEN** the API responds `NOT_FOUND`

### Requirement: Workout privacy
RPE, energy and notes SHALL never appear in logs or error messages, and no location or GPS data
SHALL be collected.

#### Scenario: Validation error hides value
- **WHEN** a notes field over 500 characters is rejected
- **THEN** the error names the notes field and does not contain the notes text
