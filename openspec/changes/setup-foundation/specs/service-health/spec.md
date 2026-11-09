# Spec Delta

## Purpose

Lets operators and orchestration tools tell whether each Cadence process is alive and ready,
and gives every process structured logs that never contain health data.

## ADDED Requirements

### Requirement: Liveness endpoint
The API SHALL expose `GET /health` that returns 200 while the process is running, without
checking dependencies.

#### Scenario: Process is alive
- **WHEN** a client calls `GET /health`
- **THEN** the response is 200 with a small JSON body indicating ok

### Requirement: Readiness endpoint
The API SHALL expose `GET /health/ready` that returns 200 only when MongoDB (and, once a
producer exists, Kafka) are reachable, and 503 otherwise.

#### Scenario: Dependencies reachable
- **GIVEN** MongoDB is reachable
- **WHEN** a client calls `GET /health/ready`
- **THEN** the response is 200

#### Scenario: Database down
- **GIVEN** MongoDB is stopped
- **WHEN** a client calls `GET /health/ready`
- **THEN** the response is 503 and names the failing dependency without exposing connection strings

### Requirement: Structured redacted logging
API processes SHALL log JSON lines with a request id, and SHALL never log GraphQL variables,
resolver arguments or known health fields.

#### Scenario: Request is correlated
- **WHEN** the API handles a GraphQL request
- **THEN** the log line includes a request id and the operation name

#### Scenario: Health field is redacted
- **GIVEN** a log call that includes an object with an `rpe` or `notes` field
- **WHEN** the line is written
- **THEN** the value is replaced with a redaction marker

### Requirement: Fail-fast configuration
Every process SHALL validate its environment variables at startup and exit with a clear message
naming the invalid variable, without printing secret values.

#### Scenario: Missing variable
- **GIVEN** `MONGO_URL` is unset
- **WHEN** the API starts
- **THEN** it exits non-zero with a message naming `MONGO_URL`
