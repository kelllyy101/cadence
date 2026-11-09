# Spec Delta

## Purpose

Lets features ship incrementally and be switched off safely, with flags evaluated on the server
and only the values the client needs exposed to it.

## ADDED Requirements

### Requirement: Server-evaluated flags
Flags SHALL be read from a local file on the server and exposed to clients through a `flags`
query, defaulting to off when a flag is missing.

#### Scenario: Missing flag
- **GIVEN** a flag absent from the flags file
- **WHEN** the client queries `flags`
- **THEN** that flag is false

### Requirement: Flag-gated insights
When `insights.enabled` is false, the Insights tab SHALL be hidden, the insights query SHALL not
be issued, and a direct URL SHALL show a friendly "not available" page.

#### Scenario: Insights disabled
- **GIVEN** `insights.enabled=false`
- **WHEN** the app loads
- **THEN** the Insights tab is hidden and no insights query is sent
