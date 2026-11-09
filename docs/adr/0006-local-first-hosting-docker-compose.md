# 0006. Local-first: `docker compose up`, hosting deferred

- Status: Accepted
- Date: 2026-09-28

## Context

Hosting is undecided. The system needs a Mongo replica set and Kafka, whose managed versions
vary in cost. Reviewers must run everything easily, and code shouldn't bend to one provider.

## Decision

- Everything runs with **one `docker compose up`**: Mongo, Kafka, topic init, api, relay,
  worker, web.
- **12-factor config:** env vars validated with zod, documented in `.env.example`.
- No provider-specific SDKs in app code.
- Every service has health endpoints, JSON logs to stdout and graceful `SIGTERM` shutdown.
- Multi-stage Debian-slim images.
- A future ADR records the hosting choice.

## Alternatives

- **A PaaS now:** managed Kafka and Mongo add cost and lock-in early.
- **Cloud services for local dev:** reviewers need accounts and network.
- **Local Kubernetes:** too heavy; a Helm chart is a stretch goal.

## Consequences

- ➕ Runs offline; Testcontainers uses the same images; hosting stays open.
- ➖ No public demo URL yet; the README uses screenshots.
- ➖ Keep resources modest: capped Kafka heap, small Mongo cache.
