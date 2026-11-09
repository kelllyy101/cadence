# Design: Add cycle tracking and the event pipeline

## Context

Builds on workout mutations from `add-workout-logging` and contracts from `setup-foundation`.
Decision: [ADR-0004](../../../docs/adr/0004-kafka-kraft-transactional-outbox.md). Requirements in
`specs/`.

## Goals / Non-Goals

**Goals:** consent that holds up to scrutiny; an explainable phase estimate; a pipeline that is
provably atomic and idempotent with real Mongo + Kafka tests.

**Non-Goals:** real insight computation (placeholder counts only), change streams, encryption.

## Decisions

- **Consent:** `CURRENT_CYCLE_CONSENT_VERSION` (e.g. `"2026-10-01"`) lives in `packages/domain`
  next to the consent copy. Consent checks read the latest `consents` record for
  `cycle_tracking`; reads are allowed with an older granted version, writes need the current one.
- **Collections:**
  ```ts
  interface CycleEntry { id; userId; periodStartDate: string /* YYYY-MM-DD */; createdAt }
  interface ConsentRecord { id; userId; purpose: 'cycle_tracking'; version; granted; at }
  interface OutboxRow { _id; eventId; type; topic; userId; payload; createdAt;
    publishedAt: Date | null; attempts: number; lastError?: string }
  interface ProcessedEvent { eventId /* unique */; userId; type; processedAt /* TTL 30d */ }
  ```
  Indexes: `cycle_entries {userId:1, periodStartDate:-1}` unique on `{userId, periodStartDate}`;
  `consents {userId:1, purpose:1, at:-1}`; outbox `{publishedAt:1, createdAt:1, _id:1}` plus TTL 7
  days on `publishedAt`.
- **Phase estimation output:**
  ```ts
  type PhaseEstimate =
    | { kind: 'estimate'; phase: Phase; cycleDay: number; confidence: 'low' | 'medium';
        basis: { typicalLengthDays: number; cyclesUsed: number } }
    | { kind: 'unknown'; reason: 'no_data' | 'before_first_entry' | 'cycle_overdue' | 'irregular' };
  ```
- **GraphQL sketch:** `cycleConsent`, `cycleEntries(limit)`, `phaseEstimate(date)` queries;
  `grantCycleConsent(version)`, `withdrawCycleConsent`, `logPeriodStart(date)`,
  `updatePeriodStart(id, date)`, `deletePeriodStart(id)` mutations. `PhaseEstimate.isEstimate`
  is always true when a phase is set.
- **Outbox helper:** `withOutbox(session, fn)` wraps `session.withTransaction` and forces the
  session through, so forgetting it is a type error.
- **Relay:** separate entry `apps/api/src/relay/main.ts`, own container. Polls every 250 ms,
  batch 100, ordered by `{createdAt, _id}`. Backoff capped at 30 s. SIGTERM finishes the batch
  and flushes the producer. Idempotent producer enabled.
- **Worker:** group `insights-worker`, manual commits. Per message: zod parse → DLQ on failure;
  transaction inserting `processed_events` then the handler; commit transaction, then offset.
  Recompute from source data (convergent under reordering). Optional coalescing per user per batch.
- **Defence in depth:** the API checks consent at query time, so `byPhase` disappears
  immediately on withdrawal even if the worker is down.
- **Client caching:** `phaseEstimate` responses are never cached by the service worker; Apollo's
  cache is cleared on sign-out.

## Risks / Trade-offs

- [Consent copy unclear or coercive] → privacy and UX reviewers, then a comprehension check in
  usability sessions.
- [Phase estimation overclaims] → simple documented algorithm, confidence levels, `unknown`.
- [Testcontainers + Kafka slow or flaky] → reuse containers per file; healthcheck wait strategies.
- [Forgetting the Mongoose session] → `withOutbox` + an injected-failure integration test.
- [librdkafka build issues] → Debian-slim images, pinned client version.
