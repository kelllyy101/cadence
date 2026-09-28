# Spec: Event pipeline (outbox → Kafka → insights-worker)

Epic: [EPIC-02](../epics/EPIC-02-cycle-tracking-events.md) · Status: draft ·
Decision: [ADR-0004](../adr/0004-kafka-kraft-transactional-outbox.md)

## Behaviour

1. **Write side (API).**
   - Each state-changing mutation calls a helper, `withOutbox(session, fn)`. It runs
     `session.withTransaction(...)`, which performs the domain write and inserts one or more
     outbox rows.
   - Nothing is published from the resolver.
2. **Relay.** A long-running process (`apps/api/src/relay/main.ts`):
   - It polls every 250 ms for `outbox` rows where `publishedAt: null`, sorted by
     `{ createdAt: 1, _id: 1 }`, with a batch size of 100. Change streams are an optimisation
     for later.
   - It produces each row to its topic with `key = userId`, then sets `publishedAt = now`.
   - On a produce failure it increments `attempts`, backs off exponentially (capped at 30 s),
     and keeps the order: it doesn't skip ahead for the same user.
   - Published rows expire after 7 days through a TTL index on `publishedAt`.
   - It shuts down gracefully on `SIGTERM`: it finishes the in-flight batch and flushes the
     producer.
3. **Consumer (insights-worker).**
   - Consumer group `insights-worker`, with manual offset commits.
   - For each message:
     1. Parse the message with the zod envelope and event schema. On failure, log `eventId`
        and `type` only, send it to the DLQ topic, and commit.
     2. Start a Mongo transaction, then insert `{ eventId, userId }` into `processed_events`.
        A duplicate-key error means the event was already processed, so abort and commit the
        offset.
     3. Handle the event. For `workout.*` and `cycle.*`: recompute this user's insights from
        source collections with `packages/domain` and upsert `insights`. For deletion events,
        see [data-export-deletion](data-export-deletion.md).
     4. Commit the transaction, then commit the Kafka offset.
   - A crash after the Mongo commit but before the offset commit leads to redelivery. The
     duplicate is caught at step 2.
   - **Coalescing (optional optimisation):** when a batch contains several events for the same
     user, recompute once. Every eventId is still recorded.

## Event envelope (`packages/events`)

```ts
const EventEnvelope = z.object({
  eventId: z.string().uuid(),        // uuid v7 (time-ordered)
  type: EventType,                   // discriminator
  version: z.literal(1),             // schema version per type
  occurredAt: z.string().datetime(),
  userId: z.string().min(1),
  payload: z.unknown(),              // refined per type
});
```

## Event catalogue

| Type | Topic | Payload | Producer | Consumers |
|---|---|---|---|---|
| `workout.logged` | `cadence.workouts.v1` | `{ workoutId, kind: 'run'\|'strength' }` | api | insights-worker |
| `workout.updated` | `cadence.workouts.v1` | `{ workoutId, kind }` | api | insights-worker |
| `workout.deleted` | `cadence.workouts.v1` | `{ workoutId }` | api | insights-worker |
| `cycle.logged` | `cadence.cycle.v1` | `{ change: 'created'\|'updated'\|'deleted' }` | api | insights-worker |
| `cycle.data_deleted` ⁺ | `cadence.cycle.v1` | `{}` | api | insights-worker |
| `user.deletion_requested` | `cadence.users.v1` | `{ requestId }` | api | insights-worker (and any future consumer) |

⁺ This event is an addition to the original list. It's needed so that withdrawing consent removes
derived phase insights promptly (see [cycle spec](cycle-tracking-consent.md)).

Topic notes:
- Each topic has 3 partitions locally, which is enough to show key-based distribution.
- Retention is 7 days for workout and cycle topics.
- For `cadence.users.v1`, retention is also 7 days. The payload holds IDs only, so retention
  doesn't keep personal data beyond the opaque `userId`.
- The DLQ topic is `cadence.dlq.v1`.
- Versioning: breaking payload changes create a new topic suffix (`.v2`) and schema
  `version`. Additive changes are allowed within a version.

**Rule: payloads never contain health values.** That means no distances, RPE, energy, notes,
dates of periods or phases. Consumers read the source of truth from Mongo. A unit test in
`packages/events` asserts that every schema's key set is within an allow-list.

## Collections

```ts
interface OutboxRow { _id; eventId; type; topic; userId; payload; createdAt; publishedAt: Date | null; attempts: number; lastError?: string /* no payload data */ }
interface ProcessedEvent { eventId /* unique */; userId; type; processedAt /* TTL 30d */ }
```

## Ordering & idempotency

| Scenario | Outcome |
|---|---|
| The same event delivered twice | The second attempt hits the unique index, is skipped and its offset committed. Insights are unchanged. |
| `workout.updated` processed before `workout.logged` (e.g. replay) | Both trigger a full recompute from current Mongo state, so the result is the same. |
| Relay crashes after produce, before `publishedAt` | Republished on restart. The consumer dedupes. |
| Kafka is down | Outbox rows accumulate, mutations still succeed, and the "outbox lag" metric rises. |
| A worker transaction fails (Mongo down) | No offset commit. The message is redelivered after a backoff. |
| Poison message (schema-invalid) | Sent to the DLQ with its ID and type only, then the offset is committed. |
| `user.deletion_requested` is processed, then a stale `workout.logged` for that user arrives | The worker checks for the user's deletion marker first and skips it, so no insights are resurrected. |

## Integration tests (Testcontainers)

These run against real MongoDB (replica set) and Kafka containers:
1. A mutation-level write produces exactly one outbox row in the same transaction. An injected
   failure in the domain write leaves no outbox row.
2. The relay publishes with key = userId, and `publishedAt` is set.
3. The worker processes an event and upserts insights. Re-sending the same message changes
   nothing and increments the duplicate metric.
4. Events for one user are processed in partition order. Out-of-order replays converge to the
   same insights.
5. A schema-invalid message goes to the DLQ, and the consumer keeps progressing.
6. Deletion propagation (see the export/deletion spec).

## Privacy notes

- Log lines for events include `eventId`, `type`, `topic`, `partition` and `offset` only.
  `userId` appears only at debug level.
- `lastError` on outbox rows stores the error class and message only, never the payload.
- The DLQ holds the raw message. Because payloads are thin, it contains no health data, and the
  DLQ has 7-day retention.
