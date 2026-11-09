# Proposal: Add cycle tracking and the event pipeline

## Why

The core question is "does my training follow my cycle?". That needs optional cycle tracking
behind explicit, versioned consent (GDPR Art. 9), and a reliable path from every data change to
the insights-worker without dual writes
([ADR-0004](../../../docs/adr/0004-kafka-kraft-transactional-outbox.md)).

## What Changes

- Append-only versioned consent with grant, withdraw and re-consent.
- Consent-gated period-start logging (create, backfill, edit, delete).
- Phase estimation with confidence and `unknown` states, always shown as an estimate.
- Withdrawal deletes cycle data atomically and emits `cycle.data_deleted`.
- Outbox writes for workout and cycle mutations.
- Relay process; worker with zod parsing, DLQ and `processed_events` idempotency (placeholder
  insights).
- Testcontainers harness and pipeline integration tests.

## Capabilities

### New Capabilities
- `cycle-consent`: explicit versioned consent, re-consent and withdrawal.
- `cycle-tracking`: logging and managing period start dates.
- `phase-estimation`: estimating a date's cycle phase, labelled as an estimate.
- `event-pipeline`: atomic outbox writes, ordered relay, idempotent consumption.

### Modified Capabilities
- None.

## Out of scope

Real insights, other cycle fields (minimisation), change-stream relay, field encryption.

## Impact

API consent, cycle and outbox modules plus relay container; worker consumer; web consent and
period screens. Dependencies (asked per task): @confluentinc/kafka-javascript, testcontainers,
UUID v7 generator.

## Depends on

`setup-foundation`; `add-workout-logging` groups 1–11.
