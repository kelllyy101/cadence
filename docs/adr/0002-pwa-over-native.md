# 0002. Installable PWA over native apps

- Status: Accepted
- Date: 2026-09-28

## Context

Users log workouts on their phones, usually straight after training. The app must feel native
enough to open from the home screen and log quickly. There's one developer, and her strongest
skills are in React/TypeScript. Reviewers (hiring managers) should be able to try the app from a
link without installing anything from a store. Accessibility testing with Cypress + axe works
best on web.

## Decision

Build `apps/web` as a **mobile-first, installable Progressive Web App**:

- React + TypeScript + Vite
- `vite-plugin-pwa` (Workbox) for the manifest, icons and app-shell caching

The layout targets a 360–430 px viewport first and scales up.

The MVP does **not** include offline data writes. The service worker caches only the app
shell and static assets. An offline logging queue is a backlog item.

## Alternatives considered

- **React Native / Expo.** Truly native feel and APIs, but it needs a store or Expo Go for
  reviewers, a separate a11y test story, and more build infrastructure.
- **Native Swift/Kotlin.** Two codebases. Out of scope for one developer.
- **Plain responsive SPA (not installable).** Loses the home-screen launch, standalone display
  and the fast, cached shell that make one-thumb logging feel good.

## Consequences

- ➕ One codebase, instant access from a URL, and the same Cypress + axe tooling for every screen.
- ➕ It installs on Android and iOS (Add to Home Screen).
- ➖ iOS PWA limits (storage eviction, push notifications need an installed app). None of the
  MVP depends on these.
- ➖ Service-worker caching must never persist health data responses (see
  [ARCHITECTURE § Privacy](../architecture/ARCHITECTURE.md#privacy-design)).
- ➖ The update flow needs care: show a "new version available" prompt rather than reloading
  silently mid-log.
