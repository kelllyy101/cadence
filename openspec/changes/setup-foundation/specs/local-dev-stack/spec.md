# Spec Delta

## Purpose

Lets a developer or reviewer start the whole Cadence stack with one command and see the web app
talking to the API on top of a transactional MongoDB and a Kafka broker.

## ADDED Requirements

### Requirement: One-command start
The system SHALL start MongoDB, Kafka, the API, the insights-worker stub and the web app with
`docker compose up` after copying `.env.example` to `.env`, with no other manual steps.

#### Scenario: Fresh clone starts healthy
- **GIVEN** a fresh clone on a machine with Docker, Node 22 and pnpm
- **WHEN** the developer runs `cp .env.example .env && docker compose up`
- **THEN** every service reports healthy

#### Scenario: Restart after volume reset
- **GIVEN** the stack was stopped with `docker compose down -v`
- **WHEN** the developer runs `docker compose up` again
- **THEN** MongoDB re-initialises its replica set and every service becomes healthy again

### Requirement: Transactional database
The local MongoDB SHALL run as a single-node replica set so multi-document transactions work.

#### Scenario: Multi-document transaction commits
- **GIVEN** the MongoDB container is healthy
- **WHEN** a client runs a transaction that writes to two collections
- **THEN** both writes commit together

#### Scenario: Initialisation is idempotent
- **GIVEN** the replica set is already initialised
- **WHEN** the container restarts and its healthcheck runs
- **THEN** no error is raised and the replica set status is ok

### Requirement: Local event broker
The local stack SHALL run one Kafka broker in KRaft mode with every catalogue topic created at
3 partitions and 7-day retention, reachable from both the host and other containers.

#### Scenario: Topics exist after start
- **WHEN** the topic-init job completes
- **THEN** `cadence.workouts.v1`, `cadence.cycle.v1`, `cadence.users.v1` and `cadence.dlq.v1` exist with 3 partitions and 7-day retention

#### Scenario: Topic init is idempotent
- **GIVEN** the topics already exist
- **WHEN** the topic-init job runs again
- **THEN** it succeeds without changing them

#### Scenario: Host and container clients can both connect
- **WHEN** a host client uses the host listener and a container uses the internal listener to send a keyed message
- **THEN** both can produce and consume it

### Requirement: Hello-world end to end
The web app SHALL display the result of the API's `hello` GraphQL query.

#### Scenario: Web shows API data
- **GIVEN** the stack is running
- **WHEN** the user opens the web app
- **THEN** the page shows the text returned by the `hello` query

### Requirement: Quality gates
Every workspace SHALL pass lint, typecheck and unit tests under strict TypeScript, and CI SHALL
block a pull request when install, codegen, lint, typecheck, test or build fails.

#### Scenario: Local checks pass
- **WHEN** the developer runs `pnpm lint && pnpm typecheck && pnpm test`
- **THEN** all three pass in every workspace

#### Scenario: CI blocks a failure
- **GIVEN** a pull request that introduces a type error
- **WHEN** CI runs
- **THEN** the typecheck step fails and the check is marked failed

#### Scenario: Explicit any is rejected
- **GIVEN** a source file containing `const x: any = 1`
- **WHEN** ESLint runs
- **THEN** it reports an error

#### Scenario: Domain purity is enforced
- **GIVEN** a file in `packages/domain` that imports a database, Kafka or React module, or anything from `apps/*`
- **WHEN** ESLint runs
- **THEN** it reports an error
