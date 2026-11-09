# Spec Delta

## Purpose

Provides the installable, mobile-first frame of the app (navigation and screen structure) that
every feature lives in, accessible by keyboard and screen reader from the start.

## ADDED Requirements

### Requirement: Bottom navigation
Signed-in users SHALL see a bottom navigation with Log, History, Insights and Settings, each
with a visible text label and a touch target of at least 44×44 px.

#### Scenario: Navigating between sections
- **GIVEN** a signed-in user on a 390×844 viewport
- **WHEN** they tap History
- **THEN** the History screen opens and the History item is marked as current for assistive technology

### Requirement: Installable PWA
The app SHALL be installable and launch standalone with the Cadence icon, and the service
worker SHALL cache only the app shell, never API responses containing health data.

#### Scenario: Install on Android Chrome
- **WHEN** the user installs the app from Android Chrome
- **THEN** it launches standalone with the Cadence icon

#### Scenario: No health data in cache storage
- **GIVEN** the user has viewed their history
- **WHEN** Cache Storage is inspected
- **THEN** it contains no GraphQL responses

### Requirement: Accessible screens
Every screen SHALL have no serious or critical axe violations and SHALL be fully operable by
keyboard with a visible focus indicator.

#### Scenario: Axe check
- **WHEN** axe runs on any logging or history screen
- **THEN** there are no serious or critical violations

#### Scenario: Keyboard-only logging
- **GIVEN** a keyboard-only user
- **WHEN** they log a run
- **THEN** they complete the flow without a mouse, with a visible focus indicator throughout
