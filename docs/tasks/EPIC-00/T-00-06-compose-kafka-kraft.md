# T-00-06 — Compose: Kafka (KRaft)

- **Status:** todo
- **Epic:** [EPIC-00](../../epics/EPIC-00-foundation.md)
- **Spec:** [event-pipeline § catalogue](../../specs/event-pipeline.md#event-catalogue) · ADR: [0004](../../adr/0004-kafka-kraft-transactional-outbox.md)
- **Estimate:** 2–3 h
- **Branch:** `task/T-00-06-compose-kafka-kraft`

## Context
This task adds a single Kafka 4.x broker in KRaft mode, using the official `apache/kafka` image
with a capped heap. A one-shot `kafka-init` service creates the topics from the spec with the
right partition counts and retention.

## Acceptance criteria
- **Given** `docker compose up kafka`, **when** it starts, **then** it becomes healthy (the
  healthcheck lists topics) within 60 s, using ≤ ~700 MB RAM.
- **Given** `kafka-init` runs, **when** it completes, **then** topics `cadence.workouts.v1`,
  `cadence.cycle.v1`, `cadence.users.v1` and `cadence.dlq.v1` exist, each with 3 partitions and
  7-day retention. Rerunning it is idempotent (`--if-not-exists`).
- **Given** the listeners config, **when** a client on the host uses `localhost:9092` and a
  container uses `kafka:29092` (or similar), **then** both can produce and consume.
- **Given** a console producer/consumer, **when** I send a keyed message, **then** it is received.

## Likely files touched
- `docker-compose.yml` (kafka, kafka-init)
- `.env.example` (`KAFKA_BROKERS`)
- `infra/kafka/create-topics.sh`

## Required tests
- Manual verification with the console tools, documented in the notes. The integration
  tests come in EPIC-02.

## Definition of done
- [ ] Acceptance criteria met
- [ ] `code-reviewer` run and must-fixes resolved
- [ ] README local setup updated (ports, memory note)
- [ ] Task status and [BOARD.md](../BOARD.md) updated
- [ ] Commit message suggested (e.g. `chore(infra): add kafka kraft broker and topic init`)

## Dependencies
- T-00-01. It should stay consistent with T-00-04 topic names; ideally the script reads them
  from a single list.

## Notes
- `KAFKA_HEAP_OPTS="-Xmx512m -Xms512m"`. Set `KAFKA_NUM_PARTITIONS` and the replication factor to 1.
- Keep the topic list in sync with `packages/events/src/topics.ts`. Consider a follow-up that
  generates the script from the TS constants.
- No new npm dependencies.
