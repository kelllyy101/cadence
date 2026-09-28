# Spec: Data export + account deletion

Epic: [EPIC-04](../epics/EPIC-04-trust-polish.md) · Status: draft

## Behaviour

### Export (GDPR Art. 15 / 20)
- Settings → Your data → "Download my data" calls `GET /export`, which is authenticated by the
  session cookie. The response is:
  - `Content-Type: application/json`
  - `Content-Disposition: attachment; filename="cadence-export-YYYY-MM-DD.json"`
  - `Cache-Control: no-store`
- The export is generated synchronously, which is fine at MVP data volumes. It is streamed
  so memory use stays flat.
- It's rate limited to 5 per hour per user.
- The export contains **everything we hold about the user**:
  - the account (email, name, createdAt)
  - settings
  - all workouts
  - cycle entries
  - the full consent history
  - current insights (weekly and byPhase)
  - deletion requests
- Credentials, session tokens and internal operational rows (`outbox`, `processed_events`) are
  excluded. The README documents this and explains why.
- The format is versioned: `{ "format": "cadence-export", "version": 1, "exportedAt": ...,
  "data": {...} }`. Units are named explicitly in the field names (`distanceM`, `durationS`).

### Account deletion (GDPR Art. 17)
1. Settings → Your data → "Delete my account" opens a confirmation screen. It lists what will be
   deleted, suggests exporting first, and asks the user to type `DELETE` or re-enter the
   password to confirm. The dialog is accessible, and destructive styling is not conveyed by
   colour alone.
2. The server runs one transaction that:
   - inserts `deletion_requests { requestId, userId, status: 'pending', requiredConsumers: ['api', 'insights-worker'], completedBy: [] }`
   - deletes primary data: `workouts`, `cycle_entries`, `user_settings`, and Better Auth
     `session`/`account`/`verification` rows
   - anonymises the `user` row to a tombstone `{ id, deletedAt }`
   - deletes the user's unpublished `outbox` rows, **except** the new
     `user.deletion_requested` event it writes in the same transaction
   - adds `'api'` to `completedBy`
3. The session is revoked, and the user is signed out and sees "Your account has been deleted".
4. The insights-worker, on `user.deletion_requested`:
   - deletes `insights` and `processed_events` for the userId
   - writes a `deleted_users { userId, at }` marker, so later stale events for this user are
     ignored
   - adds `'insights-worker'` to `completedBy`
5. When `completedBy ⊇ requiredConsumers`, the status becomes `completed` and the tombstone
   `user` row is removed.
   - `consents` are deleted at this point too. Keeping consent records after erasure has no
     benefit to the user, and the deletion request itself is the compliance record.
   - The `deletion_requests` row is kept for **30 days** as an audit record holding only the
     IDs, status and timestamps, then removed by TTL.
6. **Reconciliation:** a job flags `pending` requests older than 24 h in metrics and logs
   (`requestId` only) for investigation.

### Coverage checklist (what deletion must reach)
| Store | Deleted by | Tested in |
|---|---|---|
| `workouts`, `cycle_entries`, `user_settings` | api transaction | int test |
| Better Auth collections | api transaction | int test |
| `outbox` (unpublished rows for the user) | api transaction | int test |
| `insights`, `processed_events` | insights-worker | int test |
| Kafka topics | Retention (7 days). Payloads hold IDs only | documented |
| Logs | Never contain health data. They hold userId only at debug level | redaction test |
| Browser: Apollo cache, service worker | Cleared on sign-out; SW caches only the shell | E2E |
| `deleted_users` marker | Kept (userId + date only) so stale events aren't reprocessed | documented |

Any new store of user data must add a row here and handle `user.deletion_requested`. This
is on the `privacy-reviewer` checklist.

## GraphQL schema sketch

```graphql
type DeletionRequest { requestId: ID!, status: String!, requestedAt: DateTime! }

extend type Mutation {
  requestAccountDeletion(confirmation: String!): DeletionRequest!   # confirmation must equal "DELETE"
}
```

The export is REST (`GET /export`), not GraphQL, because it's a file download ([ADR-0003](../adr/0003-schema-first-graphql-codegen.md)).

## Event contract

`user.deletion_requested`: topic `cadence.users.v1`, key `userId`, payload `{ requestId }`.
Consumers must:
- be idempotent (processing twice is harmless)
- report completion by updating `deletion_requests.completedBy`. This is a direct Mongo write,
  since the worker already shares the database; if services are split later, it becomes a
  `user.deletion_completed` event.

## Edge cases

| Case | Behaviour |
|---|---|
| Export for a user with cycle tracking never enabled | The `cycleEntries` and `consents` arrays are empty. The keys are still present so the shape stays stable |
| Export mid-deletion | A 401 is returned, because the session was revoked in the same transaction |
| Deletion requested twice (double click) | The second call returns the existing pending request (idempotent by userId) |
| Worker offline during deletion | The event waits in Kafka and the request stays `pending`. Reconciliation raises it after 24 h |
| A workout event arrives after deletion (stale, reordered) | The worker sees the `deleted_users` marker, skips the event and records it as processed |
| Same email signs up again after deletion | Allowed. It's a new userId and none of the old data is linked |

## Privacy notes

- Export responses must never be cached (`no-store`), logged or stored server-side.
- The `/export` access log records the path, status, duration and `requestId`, never the body.
- The deletion confirmation copy must be honest about timing: "Most data is deleted
  immediately; derived summaries are removed within minutes."
