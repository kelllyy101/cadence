# Spec Delta

## Purpose

Provides the only source of exercises Cadence can suggest, with equipment and muscle tags, safe
coaching cues and demo media that load without any third-party requests.

## ADDED Requirements

### Requirement: Curated catalogue
The catalogue SHALL hold about 40 exercises, each with a stable id, name, required equipment,
muscle groups, a measure (reps or seconds), a coaching cue of at most 140 characters, demo media
and an attribution/licence record.

#### Scenario: Catalogue invariants
- **WHEN** the catalogue invariants test runs
- **THEN** every id is unique kebab-case, every cue is at most 140 characters, every exercise has at least one muscle group and a licence record

### Requirement: Bodyweight coverage
Every muscle group (legs, glutes, upper body, core, full body) SHALL have at least 5 exercises
that need no equipment.

#### Scenario: Bodyweight only
- **GIVEN** a user with no equipment
- **WHEN** the catalogue is filtered by their equipment
- **THEN** every muscle group has at least 5 exercises

### Requirement: Equipment filtering
Filtering by available equipment SHALL return only exercises whose required equipment is a
subset of the available items plus bodyweight.

#### Scenario: Kettlebell only
- **GIVEN** available equipment of kettlebell
- **WHEN** the catalogue is filtered
- **THEN** results include kettlebell and bodyweight exercises and nothing needing a dumbbell, bench, band, step or bar

#### Scenario: Multi-equipment exercise
- **GIVEN** an exercise needing a dumbbell and a bench
- **WHEN** the user has only a dumbbell
- **THEN** it is excluded

### Requirement: Self-hosted demo media
Demo media SHALL be served from Cadence's own origin under a licence that permits it, with
attribution shown where the licence requires it, and SHALL never be embedded from a third party.

#### Scenario: No third-party requests
- **WHEN** a workout result with demo images is displayed
- **THEN** the browser makes no request to any origin other than Cadence's
