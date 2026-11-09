# Spec Delta

## Purpose

Guarantees, through automated tests, that health data, personal data and free-text input never
reach logs or error responses, so the rule survives future changes.

## ADDED Requirements

### Requirement: No health data in logs
Running every mutation with realistic synthetic inputs SHALL produce logs containing no health
field names with values, no free-text notes or AI prompts, and no email addresses.

#### Scenario: Log-capture suite
- **WHEN** the log-capture suite runs every mutation
- **THEN** none of the sampled health values, notes, prompts or emails appear in captured output

### Requirement: Safe error responses
GraphQL errors SHALL carry a typed code and the field path only, never the submitted value, and
unexpected errors SHALL be masked in production.

#### Scenario: Unexpected error
- **GIVEN** a resolver throws an unexpected error containing input data
- **WHEN** the response is formatted in production mode
- **THEN** the client receives a generic message and code, and the log holds code and path only
