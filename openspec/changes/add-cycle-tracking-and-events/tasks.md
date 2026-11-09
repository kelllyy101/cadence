# Tasks

## 1. Consent model + versioned consent API (T-02-01)

- [ ] 1.1 Add `CURRENT_CYCLE_CONSENT_VERSION` and consent copy to `packages/domain`, and the append-only `consents` model. Verify unit tests for "latest record wins" and version comparison
- [ ] 1.2 Add `cycleConsent` and `grantCycleConsent(version)` (SDL first). Verify a stale version returns `BAD_USER_INPUT` and grant sets `cycleTrackingEnabled`
- [ ] 1.3 Add a reusable consent guard for reads (any granted version) and writes (current version). Verify unit tests for `CONSENT_REQUIRED` cases

## 2. Consent UI + re-consent screen (T-02-02)

- [ ] 2.1 Build the consent screen (required explanations, unticked checkbox, disabled button, "Not now"). Verify the button enables only when ticked and "Not now" writes nothing
- [ ] 2.2 Build the re-consent screen with a "what changed" summary. Verify it appears after a version bump
- [ ] 2.3 Verify axe passes and reading level is about age 12 (note the measurement)

## 3. Period-start logging API (T-02-03)

- [ ] 3.1 Add the `cycle_entries` model and indexes, and `logPeriodStart`, `updatePeriodStart`, `deletePeriodStart`, `cycleEntries` behind the consent guard. Verify future dates and duplicates are rejected and missing consent returns `CONSENT_REQUIRED`

## 4. Period-start logging UI (T-02-04)

- [ ] 4.1 Build "Period started", backfill, list, edit and delete. Verify the close-entry warning appears for a start within 10 days and saving is still allowed

## 5. Domain: phase estimation (T-02-05)

- [ ] 5.1 Implement typical length, cycle day and phase boundaries with clamping. Verify table-driven tests for every phase-boundary scenario
- [ ] 5.2 Implement the unknown states. Verify tests for `no_data`, `before_first_entry`, `cycle_overdue` and `irregular`

## 6. Show today's estimated phase (T-02-06)

- [ ] 6.1 Add `phaseEstimate(date)` and the UI card with "Estimate — not medical advice" and an (i) explainer. Verify three starts show a phase, and unknown states show friendly copy

## 7. Withdraw consent (T-02-07)

- [ ] 7.1 Implement `withdrawCycleConsent` in one transaction (delete entries, append `granted:false`, disable tracking, outbox `cycle.data_deleted`). Verify an integration test shows all four effects or none
- [ ] 7.2 Build the confirmation dialog stating exactly what is deleted. Verify focus trap, Esc to cancel and axe

## 8. Outbox + `withOutbox`; retrofit workout mutations (T-02-08)

- [ ] 8.1 Add the `outbox` model, indexes (incl. TTL) and `withOutbox` (ask first: uuid v7 generator). Verify an injected domain failure leaves no outbox row
- [ ] 8.2 Emit `workout.logged/updated/deleted` from the workout mutations. Verify each mutation writes exactly one row with a thin payload

## 9. Cycle outbox events (T-02-09)

- [ ] 9.1 Emit `cycle.logged` from period mutations and `cycle.data_deleted` from withdrawal. Verify payloads contain only `change` or nothing

## 10. Outbox relay process (T-02-10)

- [ ] 10.1 Implement the polling relay with ordered, keyed publish and capped backoff (ask first: @confluentinc/kafka-javascript). Verify unit tests for ordering and backoff with an injected clock
- [ ] 10.2 Add graceful SIGTERM shutdown and the relay container. Verify the in-flight batch completes on stop

## 11. insights-worker consumer skeleton (T-02-11)

- [ ] 11.1 Add the consumer with zod parsing, DLQ and manual commits. Verify an invalid message goes to the DLQ and the consumer continues

## 12. Idempotency + placeholder insights (T-02-12)

- [ ] 12.1 Add `processed_events` (unique `eventId`, TTL 30 d) in the same transaction as a placeholder `insights` upsert (counts only). Verify a duplicate is skipped and counted

## 13. Extend the Testcontainers harness with Kafka (T-02-13)

- [ ] 13.1 Add a Kafka (KRaft) container to the shared harness from `add-workout-logging` group 1, with topic creation and healthcheck waits. Verify a test produces and consumes a keyed message

## 14. Pipeline integration tests (T-02-14)

- [ ] 14.1 Add integration tests: atomic outbox, keyed relay publish, duplicates, per-user ordering and convergence, DLQ. Verify `pnpm test:int` passes locally and in CI
- [ ] 14.2 Add the Kafka-down scenario. Verify the event publishes after the broker restarts

## Workflow follow-up

- Archive this change once every group is merged and the spec scenarios pass.
