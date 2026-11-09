# Spec Delta

## Purpose

Lets users delete their account and have every copy of their data removed, including derived
data held by asynchronous consumers (GDPR Art. 17).

## ADDED Requirements

### Requirement: Confirmed deletion request
The system SHALL show what will be deleted, suggest exporting first, and require typing `DELETE`
(or re-entering the password) before deletion, in an accessible dialog whose destructive styling
is not colour-only.

#### Scenario: Wrong confirmation
- **WHEN** the user submits a confirmation other than `DELETE`
- **THEN** the API responds `BAD_USER_INPUT` and nothing is deleted

#### Scenario: Double submit
- **GIVEN** a pending deletion request
- **WHEN** the user requests deletion again
- **THEN** the existing pending request is returned

### Requirement: Primary deletion is atomic
In one transaction the API SHALL delete workouts, cycle entries, settings and auth rows, reduce
the user to a tombstone, drop the user's unpublished outbox rows, write `user.deletion_requested`,
record the request, and revoke the session.

#### Scenario: Signed out after deletion
- **WHEN** the user confirms deletion
- **THEN** they are signed out and see "Your account has been deleted"

### Requirement: Deletion reaches every consumer
Every consumer holding user data SHALL handle `user.deletion_requested` idempotently, delete its
derived data, record completion, and ignore later stale events for that user.

#### Scenario: Pipeline settles
- **GIVEN** a user with data in every store
- **WHEN** deletion completes
- **THEN** no document with their userId remains in any covered collection except the deletion marker and the audit row

#### Scenario: Stale event after deletion
- **GIVEN** a deleted user
- **WHEN** a stale `workout.logged` for them arrives
- **THEN** no insights are recreated

### Requirement: Completion and audit
When all required consumers have completed, the request SHALL become completed, the tombstone
and consent records SHALL be removed, and the audit row (ids, status, timestamps only) SHALL
expire after 30 days.

#### Scenario: Pending too long
- **GIVEN** a request pending for more than 24 hours
- **WHEN** reconciliation runs
- **THEN** it is flagged in metrics and logs by request id only

### Requirement: Coverage of new stores
Any new collection or store holding user data SHALL be added to the deletion coverage checklist
and handle `user.deletion_requested` before it ships.

#### Scenario: Collection enumeration
- **WHEN** the deletion integration test runs
- **THEN** it enumerates every collection and fails if one holding a userId is not covered
