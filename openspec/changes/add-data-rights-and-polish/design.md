# Design: Add data rights and polish

## Context

All data stores exist after `add-training-insights`. Requirements in `specs/`. Export is REST
because it's a file download ([ADR-0003](../../../docs/adr/0003-schema-first-graphql-codegen.md)).

## Goals / Non-Goals

**Goals:** erasure that is provably complete; redaction enforced by tests; evidence-based UX
fixes.

**Non-Goals:** hosting, DPIA, localisation.

## Decisions

- **Deletion flow:**
  1. One transaction inserts `deletion_requests { requestId, userId, status: 'pending',
     requiredConsumers: ['api', 'insights-worker'], completedBy: [] }`, deletes `workouts`,
     `cycle_entries`, `user_settings` and Better Auth `session/account/verification`, tombstones
     `user` to `{ id, deletedAt }`, deletes the user's unpublished outbox rows except the new
     `user.deletion_requested`, and adds `'api'` to `completedBy`.
  2. The worker deletes `insights` and `processed_events`, writes `deleted_users { userId, at }`
     and adds `'insights-worker'` (a direct Mongo write today; a `user.deletion_completed` event
     if services split later).
  3. On completion the tombstone and `consents` are removed; the audit row has a 30-day TTL.
  4. A reconciliation job flags requests pending over 24 h.
- **Coverage checklist:**
  | Store | Deleted by | Tested in |
  |---|---|---|
  | `workouts`, `cycle_entries`, `user_settings`, auth collections, unpublished `outbox` | api transaction | int test |
  | `insights`, `processed_events` | insights-worker | int test |
  | Kafka topics | 7-day retention; IDs only | documented |
  | Logs | never contain health data | redaction test |
  | Browser cache / SW | cleared on sign-out; SW caches shell only | E2E |
  | AI workout builder | stores nothing | documented |
  | `deleted_users` marker | kept (userId + date) | documented |
- **GraphQL:** `requestAccountDeletion(confirmation: String!): DeletionRequest!`.
- **Export:** streamed JSON writer over Mongo cursors; `Content-Disposition` attachment;
  access log records path, status, duration and request id only.
- **Metrics:** prom-client; histogram per operation name; gauges for outbox lag and pending
  deletions; counters for processed and duplicate events.
- **Usability:** moderated think-aloud pilot (5 participants), then an unmoderated remote round
  measuring task success, time on task, SEQ and SUS. Plan in
  `docs/research/usability-test-plan.md`.

## Risks / Trade-offs

- [A new collection ships without deletion coverage] → checklist, privacy-reviewer item and a
  collection-enumerating integration test.
- [Recruiting participants] → personal running and lifting networks, 30-minute sessions, small
  thank-you.
- [A11y pass finds structural issues late] → ux-a11y-reviewer runs on every UI group from the
  start, so this pass confirms.
