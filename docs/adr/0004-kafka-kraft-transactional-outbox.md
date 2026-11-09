# 0004. Kafka (KRaft) with a transactional outbox

- Status: Accepted
- Date: 2026-09-28

## Context

Insights are derived data; computing them in the request path would slow logging. Deletion must
reach every derived store. Showing **correct** event handling (no dual writes, idempotent
consumers, clear ordering) is a portfolio goal.

## Decision

1. **Kafka 4 in KRaft mode** (`apache/kafka`), one local broker with a capped heap.
2. **`@confluentinc/kafka-javascript`** client; idempotent producer, `acks=all`.
3. **Transactional outbox:** the API writes data and an `outbox` row in one Mongo transaction
   (hence a replica set). A separate relay publishes rows in order.
4. **Keyed by `userId`** for per-user ordering; topics live in `packages/events`.
5. **Idempotent consumers:** record `eventId` in `processed_events` in the same transaction;
   recompute from source data so replays converge.
6. **Thin events:** IDs and metadata only.

## Alternatives

- **Publish from the resolver:** data and events diverge on failure.
- **Change streams (CDC):** events mirror storage, not intent; harder to exclude sensitive fields.
- **No broker:** enough at MVP scale, but the pipeline is an explicit goal.
- **RabbitMQ / Redis Streams / NATS:** valid; Kafka fits per-key ordering and target employers.
- **KafkaJS:** no longer maintained.

## Consequences

- ➕ No lost or phantom events; testable with Testcontainers; deletion is a first-class event.
- ➖ More parts: relay, outbox TTL, lag monitoring.
- ➖ librdkafka needs Debian-based images, not Alpine.
- ➖ Insights are eventually consistent; the UI shows "updating…".
