# Proposal: Add data rights and polish

## Why

Privacy promises only count if they're verifiable: users must be able to export everything and
delete everything, including derived copies, and tests must prove health data never reaches
logs. The app also needs an accessibility pass and real usability testing.

## What Changes

- `GET /export`: streamed, versioned JSON, plus export UI.
- `requestAccountDeletion`: atomic primary deletion, `user.deletion_requested` fan-out,
  tracking, reconciliation and an accessible UI.
- Redaction audit with a log-capture test suite and a safe error formatter.
- Prometheus `/metrics` with no per-user labels.
- WCAG 2.2 AA pass and Cypress coverage of key journeys.
- Usability plan, moderated pilot, unmoderated round, fixes.
- Final README with screenshots and findings.

## Capabilities

### New Capabilities
- `data-export`: complete, portable export.
- `account-deletion`: erasure reaching every store.
- `log-redaction`: tests guaranteeing no health or personal data in logs or errors.
- `service-metrics`: request and pipeline metrics without per-user labels.

### Modified Capabilities
- None.

## Out of scope

Hosting decision, formal DPIA, localisation.

## Impact

API export, deletion, metrics, error formatter, reconciliation; worker deletion handler; web
Settings → Your data; `docs/research/`. Dependency (asked per task): prom-client.

## Depends on

`add-training-insights` and `add-ai-workout-builder`.
