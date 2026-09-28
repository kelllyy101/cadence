# 0004. Kafka (KRaft) with a transactional outbox

- Status: Accepted
- Date: 2026-09-28

## Context

Insights (aggregates by cycle phase and weekly volume) are derived data. Recomputing them
inside the request path would slow down logging, which must feel instant. Account deletion
must reach every store of derived data. The developer has worked with Kafka and event-driven
microservices, and target employers run event-driven systems. So the project should show
**correct** event handling: no dual writes, idempotent consumers and clear ordering.

## Decision

1. **Broker:** Apache Kafka 4.x in **KRaft mode** (no ZooKeeper), using the official
   `apache/kafka` image. Locally it's a single broker, with the JVM heap capped (e.g.
   `KAFKA_HEAP_OPTS=-Xmx512m -Xms512m`) so it runs on a laptop.
2. **Client:** `@confluentinc/kafka-javascript`, which is maintained by Confluent and built on
   librdkafka. Use its KafkaJS-compatible API where convenient. The producer runs with
   `enable.idempotence=true` and `acks=all`.
3. **Transactional outbox:**
   - The API writes the domain change and an `outbox` row in **one MongoDB transaction**. This
     is why Mongo runs as a replica set, even with a single node.
   - A separate **relay** process publishes unpublished rows in `createdAt` order, then sets
     `publishedAt`.
4. **Keys and topics:** every message is keyed by `userId`, which gives per-user ordering within
   a partition. Topics are defined in `packages/events`, and the naming is settled in the
   [event pipeline spec](../specs/event-pipeline.md).
5. **Consumers:**
   - They are idempotent. Each consumer records `eventId` in `processed_events` (unique
     index) in the same transaction as its side effects.
   - The worker **recomputes from source data** rather than applying deltas, so replays and
     reordering converge.
6. **Thin events:** payloads contain IDs and non-sensitive metadata only.

## Alternatives considered

- **Direct publish from the resolver (dual write).** If Kafka is down or the process crashes
  between the two writes, data and events diverge. Rejected.
- **MongoDB change streams → Kafka (CDC).** No outbox table is needed, but domain events then
  mirror storage shape rather than intent. It's also harder to exclude sensitive fields and to
  test.
- **No broker: in-process jobs or a Mongo-backed queue.** Simpler and probably enough at MVP
  scale. It was rejected because the event pipeline is an explicit portfolio goal. The trade-off
  is written down here honestly.
- **RabbitMQ / Redis Streams / NATS.** All valid. Kafka matches target employers and the
  developer's background, and the per-key ordering fits per-user recompute.
- **KafkaJS.** Popular, but no longer actively maintained. The Confluent client is its supported
  successor.

## Consequences

- ➕ No lost or phantom events, a clear story for idempotency and ordering, and it's testable with
  Testcontainers.
- ➕ Deletion propagation is a first-class event.
- ➖ More moving parts: a relay process, outbox cleanup (a TTL on published rows) and consumer
  lag monitoring.
- ➖ The native librdkafka dependency needs a Debian-based (glibc) Node image in Docker/CI, not
  Alpine. Confirm this in T-00-06/T-00-10.
- ➖ Insights are eventually consistent. The UI shows `computedAt` and handles
  "updating…" states.
