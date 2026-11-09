# Proposal: Add data rights and polish

## Why

Privacy promises only count if they're verifiable. Users need to take all their data with them
and delete everything, including derived copies held by the worker. Tests have to enforce that
health data never reaches logs, and operators need metrics to see when the pipeline is unhealthy.
The product also needs a full accessibility pass and real usability testing before it's
portfolio-ready.

## What Changes

- `GET /export`: streamed, versioned JSON of everything held about the user, plus the export UI.
- `requestAccountDeletion`: transactional primary deletion, `user.deletion_requested` fan-out,
  `deletion_requests` tracking and reconciliation, and an accessible deletion UI.
- Redaction audit: pino redact paths, a GraphQL error formatter and a log-capture test suite.
- `/metrics` with Prometheus metrics and no per-user labels.
- WCAG 2.2 AA pass (automated + manual screen readers) and Cypress coverage of key journeys.
- Usability test plan, a moderated pilot and an unmoderated round, with fixes.
- Final README with screenshots, demo GIF, badges and findings.

## Capabilities

### New Capabilities
- `data-export`: a complete, portable export of the user's data.
- `account-deletion`: erasure that reaches every store holding the user's data.
- `log-redaction`: guarantees that health and personal data never appear in logs or errors.
- `service-metrics`: Prometheus metrics for request, outbox and consumer health without per-user
  labels.

### Modified Capabilities
- None.

## Out of scope

- A hosting decision (future ADR).
- A formal DPIA (backlog).
- Localisation.

## Impact

- `apps/api`: export route, deletion mutation, metrics, error formatter, reconciliation job.
- `apps/insights-worker`: deletion handler, `deleted_users` marker.
- `apps/web`: Settings → Your data.
- `docs/research/`: usability plan and findings.
- New dependencies (asked per task): prom-client.

## Depends on

- `add-training-insights` (all data stores exist).
- `add-ai-workout-builder` stores nothing, but its prompt redaction is covered by the audit.
