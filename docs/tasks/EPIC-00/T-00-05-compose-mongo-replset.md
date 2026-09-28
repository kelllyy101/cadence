# T-00-05 — Compose: MongoDB single-node replica set

- **Status:** todo
- **Epic:** [EPIC-00](../../epics/EPIC-00-foundation.md)
- **Spec:** n/a · ADR: [0006](../../adr/0006-local-first-hosting-docker-compose.md)
- **Estimate:** 1–2 h
- **Branch:** `task/T-00-05-compose-mongo-replset`

## Context
The outbox pattern needs multi-document transactions, which need a replica set. Locally we run
MongoDB 8 as a **single-node replica set** that initialises itself, so `docker compose up` needs
no manual `rs.initiate()`.

## Acceptance criteria
- **Given** a clean Docker volume, **when** I run `docker compose up mongo`, **then** the
  container reports `healthy` within 30 s, and `rs.status().ok === 1`.
- **Given** the container restarts, **when** the healthcheck runs, **then** initiation is
  idempotent (no error because the set already exists).
- **Given** `MONGO_URL` from `.env.example`, **when** a host-side client connects and runs a
  transaction across two collections, **then** it commits.
- **Given** `docker compose down -v`, **when** I bring it back up, **then** it initialises
  again from scratch.

## Likely files touched
- `docker-compose.yml` (mongo service, named volume, healthcheck)
- `.env.example` (`MONGO_URL=mongodb://localhost:27017/cadence?replicaSet=rs0&directConnection=true`)
- `scripts/mongo-healthcheck.js` (optional; inline `mongosh --eval` is fine)

## Required tests
- Manual verification, with the commands documented in the task notes. A Testcontainers-based
  transaction test comes in EPIC-02 (T-02-13).

## Definition of done
- [ ] Acceptance criteria met
- [ ] `code-reviewer` run and must-fixes resolved
- [ ] README local setup section updated
- [ ] Task status and [BOARD.md](../BOARD.md) updated
- [ ] Commit message suggested (e.g. `chore(infra): add mongo single-node replica set to compose`)

## Dependencies
- T-00-01

## Notes
- Cap memory with `--wiredTigerCacheSizeGB 0.25`.
- There's no auth on local Mongo. It is bound to localhost only, and the README must say so.
  Production credentials are part of the hosting ADR.
- No new npm dependencies.
