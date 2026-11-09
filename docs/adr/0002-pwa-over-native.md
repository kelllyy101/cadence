# 0002. Installable PWA over native apps

- Status: Accepted
- Date: 2026-09-28

## Context

Users log on their phones right after training, so the app must open from the home screen and
feel fast. One React/TypeScript developer; reviewers should try it from a link; Cypress + axe
works best on web.

## Decision

- A mobile-first, installable **PWA**: React + TypeScript + Vite, `vite-plugin-pwa`.
- Designed for 360–430 px first.
- The service worker caches the app shell only. No offline writes in the MVP (backlog).

## Alternatives

- **React Native / Expo:** reviewers need a store or Expo Go; separate a11y tooling.
- **Native Swift/Kotlin:** two codebases.
- **Non-installable SPA:** loses home-screen launch and the cached shell.

## Consequences

- ➕ One codebase, instant access, one test toolchain; installs on Android and iOS.
- ➖ iOS PWA limits (storage eviction, push); the MVP needs neither.
- ➖ The service worker must never cache health data
  ([privacy design](../architecture/ARCHITECTURE.md#privacy-design)).
- ➖ Updates show a "new version" prompt instead of reloading mid-log.
