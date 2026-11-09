# Spec Delta

## Purpose

Gives each person a private Cadence account so their training data is only ever visible to
them, using self-hosted authentication with no third-party identity provider.

## ADDED Requirements

### Requirement: Email and password sign-up
The system SHALL let a visitor create an account with an email and a password, and sign them in
straight away.

#### Scenario: New visitor signs up
- **GIVEN** a visitor with no account
- **WHEN** they sign up with a valid email and password
- **THEN** they land on the Log screen, signed in

#### Scenario: Email already registered
- **GIVEN** an account exists for an email
- **WHEN** someone signs up with that email
- **THEN** they see a generic error that does not confirm whether the account exists

### Requirement: Sign-in and sign-out
The system SHALL let a user sign in with their credentials and sign out, using an HTTP-only,
Secure, SameSite=Lax session cookie.

#### Scenario: Sign out clears client data
- **GIVEN** a signed-in user
- **WHEN** they sign out
- **THEN** the session is revoked and the client's in-memory data cache is cleared

### Requirement: Authenticated API access
Every workout operation SHALL require an authenticated session and return `UNAUTHENTICATED`
otherwise.

#### Scenario: No session
- **GIVEN** no session cookie
- **WHEN** a client calls any workout query or mutation
- **THEN** the API responds with `UNAUTHENTICATED`

#### Scenario: Current user query
- **GIVEN** a signed-in user
- **WHEN** the client queries `me`
- **THEN** it returns that user's id and email
