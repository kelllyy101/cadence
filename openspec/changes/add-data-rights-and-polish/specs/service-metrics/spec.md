# Spec Delta

## Purpose

Lets operators see request performance and pipeline health (outbox lag, consumer progress,
duplicates) without metrics ever identifying users.

## ADDED Requirements

### Requirement: Prometheus metrics
`GET /metrics` SHALL expose request counts and latencies by operation name, outbox lag (age of
the oldest unpublished row), consumer processed and duplicate counts, and pending-deletion
counts in Prometheus format.

#### Scenario: Outbox lag rises
- **GIVEN** Kafka is down and workouts are being logged
- **WHEN** `/metrics` is scraped
- **THEN** the outbox lag metric increases

### Requirement: No per-user labels
Metrics SHALL never carry user ids, emails or health values as labels.

#### Scenario: Label audit
- **WHEN** the metrics output is scanned in a test after user activity
- **THEN** no label contains a userId or email
