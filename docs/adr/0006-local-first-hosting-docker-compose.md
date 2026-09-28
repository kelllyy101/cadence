# 0006. Local-first: one `docker compose up`, hosting deferred

- Status: Accepted
- Date: 2026-09-28

## Context

The hosting target is undecided. Options range from a PaaS to a VPS to k3s. The system needs
MongoDB running as a replica set and a Kafka broker, and managed versions of both vary a lot in
cost and setup. Reviewers and future-me need to run the whole system with minimal effort.
Committing to a host now would shape the code around one provider's quirks.

## Decision

- The entire system runs locally with **one `docker compose up`**: Mongo (single-node replica
  set, auto-initiated), Kafka (KRaft), a topic-init job, api, relay, insights-worker and web.
- It follows **12-factor** config: every setting is an env var, validated with zod at startup,
  and documented in `.env.example`.
- There are **no host-specific APIs or SDKs** in application code: no provider-specific storage,
  queues or secrets managers.
- Services expose health/readiness endpoints, log to stdout as JSON, and shut down gracefully
  on `SIGTERM`. These are portable basics for any orchestrator.
- Dockerfiles are multi-stage and produce small runtime images (Debian slim, because
  librdkafka needs glibc).
- The hosting choice will be recorded in a future ADR that supersedes the "deferred" part of
  this one.

## Alternatives considered

- **Pick a PaaS now (Render, Fly.io, Railway).** A faster public demo, but managed Kafka/Mongo
  add cost and lock-in before the product even exists.
- **Managed cloud services (Atlas, Confluent Cloud) for local dev.** They need network access
  and accounts to run the project. That's a bad experience for reviewers.
- **Kubernetes (k3s/kind) for local dev.** Heavier than needed. A Helm chart is a stretch goal
  instead.

## Consequences

- ➕ Anyone can run the full system offline. Integration tests use the same images via Testcontainers.
- ➕ Deployment stays an open, well-documented choice.
- ➖ There's no public demo URL until hosting is decided. The README will offer screenshots or
  a short video in the meantime.
- ➖ Local resource use (Kafka + Mongo) must be kept modest: cap the Kafka heap and set Mongo
  `wiredTigerCacheSizeGB`.
