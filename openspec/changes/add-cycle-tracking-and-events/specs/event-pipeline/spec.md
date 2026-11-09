# Spec Delta

## Purpose

Guarantees that every data change reaches downstream consumers exactly as committed, in per-user
order, at least once, and that consumers handle duplicates and replays safely.

## ADDED Requirements

### Requirement: Atomic outbox writes
Every state-changing mutation SHALL write its domain change and its outbox event in the same
database transaction, and SHALL never publish to Kafka directly.

#### Scenario: Domain write fails
- **GIVEN** a workout mutation whose domain write fails
- **WHEN** the transaction aborts
- **THEN** no outbox row exists

#### Scenario: Domain write succeeds
- **WHEN** a workout is logged
- **THEN** exactly one `workout.logged` outbox row exists

### Requirement: Ordered relay
The relay SHALL publish unpublished outbox rows to their topic keyed by `userId`, in creation
order per user, mark them published, retry failures with capped exponential backoff without
skipping ahead, and shut down gracefully.

#### Scenario: Kafka down
- **GIVEN** Kafka is unavailable
- **WHEN** a user logs a workout
- **THEN** the mutation succeeds and the event is published after Kafka recovers

#### Scenario: Keyed publish
- **WHEN** the relay publishes a row
- **THEN** the message key is the userId and the row is marked published

### Requirement: Idempotent consumption
The insights-worker SHALL record each processed `eventId` with a unique constraint in the same
transaction as its work, and skip any duplicate.

#### Scenario: Duplicate delivery
- **GIVEN** an event already processed
- **WHEN** it is delivered again
- **THEN** insights are unchanged and the duplicate counter increments

#### Scenario: Replay out of order
- **GIVEN** `workout.updated` processed before `workout.logged`
- **WHEN** both are processed
- **THEN** the resulting insights equal those from in-order processing

### Requirement: Poison messages
Schema-invalid messages SHALL go to the dead-letter topic with only their id and type logged, and
the consumer SHALL keep progressing.

#### Scenario: Invalid message
- **WHEN** the worker receives a message that fails schema validation
- **THEN** it is sent to `cadence.dlq.v1`, its offset is committed and the next message is processed

### Requirement: Pipeline privacy
Event logs SHALL include only event id, type, topic, partition and offset (userId at debug
level), and stored relay errors SHALL never contain payload data.

#### Scenario: Relay error stored
- **WHEN** a publish fails
- **THEN** the outbox row's last error holds the error class and message only
