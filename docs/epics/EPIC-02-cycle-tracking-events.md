# EPIC-02 — Cycle tracking + events

Specs: [cycle-tracking-consent](../specs/cycle-tracking-consent.md) ·
[event-pipeline](../specs/event-pipeline.md) · ADR: [0004](../adr/0004-kafka-kraft-transactional-outbox.md)

## Goal
Users can opt in to cycle tracking through an explicit, versioned consent flow, log period
starts, and see an estimated cycle phase. Every data change flows reliably through the
transactional outbox to Kafka and into an idempotent insights-worker. Integration tests with
real Mongo and Kafka prove this.

## User stories
- As a **user**, I want cycle tracking off until I choose to turn it on, so I'm in control of my health data.
- As a **user**, I want to understand exactly what's stored and why before I agree, so my consent is informed.
- As a **user**, I want to log when my period starts, including past dates, so the app can estimate my phase.
- As a **user**, I want to see today's estimated phase, clearly labelled as an estimate, so I don't mistake it for medical fact.
- As a **user**, I want turning cycle tracking off to delete my cycle data, so withdrawal means something.
- As the **developer**, I want domain changes and events committed atomically, so derived data never silently diverges.
- As the **developer**, I want consumers to tolerate duplicates and replays, so at-least-once delivery is safe.

## Scope
- Consent model: versioned, append-only records, grant and withdraw mutations, and a consent UI
- Period-start logging (API + UI) and phase estimation in `packages/domain`
- Outbox writes retrofitted into the EPIC-01 workout mutations, plus new cycle mutations
- The relay process, the insights-worker consumer skeleton, `processed_events` idempotency and a DLQ
- A Testcontainers harness and pipeline integration tests
- `cycle.data_deleted` event (an addition to the original event list; see the spec)

## Out of scope
- Insight computations and charts (EPIC-03). In this epic the worker writes a placeholder
  `insights` doc containing counts only.
- Symptoms, flow, contraception type and other cycle fields (minimisation)
- Change-stream-based relay (polling is enough)
- App-level encryption of cycle fields (backlog)

## Acceptance criteria
- Given a new user, when she opens the app, then no cycle UI appears except a Settings entry, and no cycle data can be written (`CONSENT_REQUIRED`).
- Given the consent screen, when the checkbox is unticked, then the "Turn on" button is disabled. "Not now" returns the user with no side effects.
- Given consent granted at version V, when the consent version bumps to V+1, then new cycle writes need re-consent, and existing data stays readable.
- Given three logged period starts, when the user views today, then an estimated phase is shown with the "Estimate — not medical advice" label.
- Given cycle data exists, when the user withdraws consent, then all `cycle_entries` are deleted, a `granted:false` record is appended, and `byPhase` insights disappear.
- Given a workout mutation, when the domain write fails, then no outbox row exists. When it succeeds, exactly one exists.
- Given the same event is delivered twice, when the worker processes it, then insights are updated once and the duplicate is counted.
- Given Kafka is down, when a user logs a workout, then the mutation succeeds and the event is published after Kafka recovers.

## Risks
| Risk | Mitigation |
|---|---|
| Consent copy is unclear or reads as coercive | privacy-reviewer + ux-a11y-reviewer, then a comprehension check in usability sessions |
| Phase estimation overclaims accuracy | A simple, documented algorithm with confidence levels and `unknown` states. Copy says "estimate" everywhere |
| Testcontainers + Kafka are slow or flaky in CI | Reuse containers per test file, and use wait strategies based on healthchecks, not sleeps |
| librdkafka build issues | Debian-slim images. Pin the client version |
| Transactions + Mongoose sessions are subtle (forgetting to pass `session`) | A `withOutbox` helper that enforces the session, plus an integration test with an injected failure |

## Tasks (titles only — detail later with `task-planner`)
| ID | Title |
|---|---|
| T-02-01 | Consent model + versioned `grantCycleConsent` / `cycleConsent` API |
| T-02-02 | Consent UI with plain-language copy and re-consent screen |
| T-02-03 | Period-start logging API (create/update/delete, consent-gated) |
| T-02-04 | Period-start logging UI (log, backfill, list, edit) |
| T-02-05 | Domain: phase estimation with confidence + unknown states |
| T-02-06 | Show today's estimated phase in the UI with disclaimer explainer |
| T-02-07 | Withdraw consent: transactional deletion of cycle data |
| T-02-08 | Outbox collection + `withOutbox` helper; retrofit workout mutations |
| T-02-09 | Outbox events for cycle mutations (`cycle.logged`, `cycle.data_deleted`) |
| T-02-10 | Outbox relay process (polling, ordered publish, backoff, graceful shutdown) |
| T-02-11 | insights-worker consumer skeleton (zod parse, DLQ, manual commits) |
| T-02-12 | Idempotency via `processed_events` + placeholder insights upsert |
| T-02-13 | Testcontainers harness (Mongo replset + Kafka) |
| T-02-14 | Integration tests: atomic outbox, relay publish, duplicates, ordering, DLQ |
