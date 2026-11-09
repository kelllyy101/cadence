# Spec Delta

## Purpose

Makes cycle tracking strictly opt-in through informed, explicit, versioned consent that the user
can withdraw at any time, with withdrawal deleting their cycle data.

## ADDED Requirements

### Requirement: Off by default
Cycle tracking SHALL be off for every new user, with no cycle UI except a Settings entry, and
every cycle read or write SHALL return `CONSENT_REQUIRED` until consent is granted.

#### Scenario: New user has no cycle access
- **GIVEN** a new user
- **WHEN** they open the app and a client attempts a cycle mutation
- **THEN** only the Settings entry "Cycle tracking — off" is visible and the mutation returns `CONSENT_REQUIRED`

### Requirement: Informed consent screen
The consent screen SHALL explain in plain language what is stored (period start dates only),
why, what is never done, that phases are estimates and not medical advice or contraception, and
that withdrawing deletes the data.

#### Scenario: Required content present
- **WHEN** the user opens the consent screen
- **THEN** it shows each required explanation and a link to the full privacy notice

### Requirement: Explicit unbundled consent
Consent SHALL require ticking an unticked checkbox before the "Turn on cycle tracking" button
enables, and "Not now" SHALL return the user with no side effects.

#### Scenario: Button disabled until ticked
- **GIVEN** the checkbox is unticked
- **WHEN** the user views the consent screen
- **THEN** the "Turn on cycle tracking" button is disabled

#### Scenario: Grant records consent
- **WHEN** the user ticks the box and turns tracking on
- **THEN** an append-only consent record with purpose `cycle_tracking`, the current version and `granted: true` is stored

#### Scenario: Not now
- **WHEN** the user chooses "Not now"
- **THEN** no consent record is written and cycle tracking stays off

### Requirement: Versioned consent
When the consent version changes, users with an older consent SHALL keep read access to their
data, but new cycle writes SHALL return `CONSENT_REQUIRED` until they re-consent via a screen
summarising what changed.

#### Scenario: Version bump
- **GIVEN** consent granted at version V
- **WHEN** the current version becomes V+1 and the user logs a period start
- **THEN** the write returns `CONSENT_REQUIRED` and existing entries remain readable

#### Scenario: Stale version on grant
- **WHEN** a client grants consent with an outdated version string
- **THEN** the API responds `BAD_USER_INPUT`

### Requirement: Withdrawal deletes cycle data
Withdrawing consent SHALL, in one transaction, delete all the user's cycle entries, append a
`granted: false` record, turn tracking off and emit `cycle.data_deleted`; derived phase insights
SHALL then be removed.

#### Scenario: Withdraw
- **GIVEN** a user with cycle entries and phase insights
- **WHEN** they confirm "Turn off and delete cycle data"
- **THEN** their cycle entries are deleted, a `granted: false` record is appended, and phase insights are no longer returned

#### Scenario: Re-consent starts fresh
- **GIVEN** a user who withdrew consent
- **WHEN** they grant consent again
- **THEN** no previous entries are restored
