# Proposal: Add cycle tracking and the event pipeline

## Why

The product's core question is "does my training follow my cycle?". That needs optional cycle
tracking, gated by explicit, versioned consent because cycle data is GDPR Art. 9 special-category
data. Insights are computed asynchronously, so every data change must also reach the
insights-worker reliably, without dual writes, through the transactional outbox
([ADR-0004](../../../docs/adr/0004-kafka-kraft-transactional-outbox.md)).

## What Changes

- Versioned, append-only consent records with grant, withdraw and re-consent flows.
- Period-start logging (create, backfill, edit, delete) gated by consent.
- Phase estimation in `packages/domain` with confidence levels and `unknown` states, shown in the
  UI as an estimate.
- Withdrawal deletes cycle data in one transaction and emits `cycle.data_deleted`.
- Outbox writes retrofitted into workout mutations, plus cycle events.
- Outbox relay process, insights-worker consumer skeleton with zod parsing, DLQ and
  `processed_events` idempotency; the worker writes a placeholder insights doc (counts only).
- Testcontainers harness and pipeline integration tests.

## Capabilities

### New Capabilities
- `cycle-consent`: explicit, versioned consent for cycle tracking, re-consent and withdrawal.
- `cycle-tracking`: logging and managing period start dates.
- `phase-estimation`: estimating cycle phase for a date, labelled as an estimate.
- `event-pipeline`: atomic outbox writes, ordered relay to Kafka and idempotent consumption.

### Modified Capabilities
- None. (`event-contracts` already includes `cycle.data_deleted` from `setup-foundation`.)

## Out of scope

- Insight computations and charts (`add-training-insights`).
- Symptoms, flow, contraception type and other cycle fields (data minimisation).
- A change-stream relay (polling is enough).
- App-level encryption of cycle fields (backlog).

## Impact

- `apps/api`: consent, cycle and outbox modules; relay entry point and container.
- `apps/insights-worker`: Kafka consumer, idempotency, DLQ.
- `apps/web`: consent screens, period logging, phase display.
- New dependencies (asked per task): @confluentinc/kafka-javascript, testcontainers, uuid v7
  generator.

## Depends on

- `setup-foundation` (all groups).
- `add-workout-logging` groups 1–11 (auth and workout mutations to retrofit).
