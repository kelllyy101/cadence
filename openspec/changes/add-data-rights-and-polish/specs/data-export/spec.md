# Spec Delta

## Purpose

Lets users download everything Cadence holds about them in a readable, portable format (GDPR
Art. 15 and 20).

## ADDED Requirements

### Requirement: Complete export
An authenticated `GET /export` SHALL return versioned JSON
(`{ format: "cadence-export", version: 1, exportedAt, data }`) containing the account, settings,
all workouts, cycle entries, the full consent history, current insights and deletion requests,
with units named in field names.

#### Scenario: Full export
- **GIVEN** a user with workouts, cycle data and insights
- **WHEN** they download their data
- **THEN** the JSON contains every listed category

#### Scenario: Never enabled cycle tracking
- **GIVEN** a user who never enabled cycle tracking
- **WHEN** they export
- **THEN** the cycle entries and consents keys are present as empty arrays

### Requirement: Export exclusions
The export SHALL exclude credentials, session tokens and internal operational rows (outbox,
processed events).

#### Scenario: No secrets
- **WHEN** a user exports
- **THEN** the JSON contains no password hash, session token or outbox row

### Requirement: Safe delivery
The export SHALL be sent as an attachment named `cadence-export-YYYY-MM-DD.json` with
`Cache-Control: no-store`, streamed with flat memory use, rate limited to 5 per hour per user,
and never logged or stored server-side.

#### Scenario: Rate limit
- **GIVEN** a user who exported 5 times in the last hour
- **WHEN** they export again
- **THEN** the request is refused with a rate-limit response

#### Scenario: Revoked session
- **GIVEN** a user whose account deletion has just revoked their session
- **WHEN** an export is requested with the old cookie
- **THEN** the response is 401
