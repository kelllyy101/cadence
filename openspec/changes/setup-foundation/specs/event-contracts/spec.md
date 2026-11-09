# Spec Delta

## Purpose

Defines the single source of truth for Cadence event messages (envelope, catalogue, topics and
validation) so producers and consumers agree and payloads stay free of health data.

## ADDED Requirements

### Requirement: Versioned event envelope
Every event SHALL carry `eventId` (UUID v7), `type`, `version`, `occurredAt` (ISO-8601),
`userId` and a `payload` validated against the schema for its type.

#### Scenario: Valid event parses
- **GIVEN** a well-formed `workout.logged` message
- **WHEN** it is parsed
- **THEN** the result is ok and the event type and payload are narrowed to `workout.logged`

#### Scenario: Invalid event is rejected without throwing
- **GIVEN** a message with an unknown `type`, a missing `eventId` or an extra payload key
- **WHEN** it is parsed
- **THEN** the result is a failure value describing the problem and no exception is thrown

### Requirement: Event catalogue and topics
The catalogue SHALL contain `workout.logged`, `workout.updated`, `workout.deleted`,
`cycle.logged`, `cycle.data_deleted` and `user.deletion_requested`, each mapped to exactly one
topic, plus a dead-letter topic.

#### Scenario: Every type has a topic
- **WHEN** the type-to-topic map is checked
- **THEN** every catalogue type maps to one of `cadence.workouts.v1`, `cadence.cycle.v1` or `cadence.users.v1`, and `cadence.dlq.v1` is exported

### Requirement: Thin payloads
Event payloads SHALL contain only identifiers and non-sensitive metadata, never health values
such as distances, durations, RPE, energy, notes, period dates or phases.

#### Scenario: Health field added to a payload
- **GIVEN** a developer adds an `rpe` or `distanceM` field to any payload schema
- **WHEN** the payload allow-list test runs
- **THEN** it fails

### Requirement: Contract versioning
Breaking payload changes SHALL use a new topic suffix and schema version. Additive changes MAY
stay within a version.

#### Scenario: Version is pinned
- **GIVEN** a message with `version` other than the supported version for its type
- **WHEN** it is parsed
- **THEN** it is rejected
