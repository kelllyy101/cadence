# 0005. Self-hosted auth with Better Auth

- Status: Accepted
- Date: 2026-09-28

## Context

The app stores special-category health data, so identity should stay in our own database with
no extra processors, and run locally in Docker
([ADR-0006](0006-local-first-hosting-docker-compose.md)).

## Decision

- **Better Auth** inside `apps/api` with the **MongoDB adapter**; email + password for the MVP.
- HTTP-only, `Secure`, `SameSite=Lax` session cookies; the GraphQL context gets `ctx.user | null`.
- Auth collections are included in export and deletion.
- Dev email: a mail catcher, or links logged in dev only.

## Alternatives

- **Auth0 / Clerk / Cognito / Firebase:** a third party holds identities; needs network for dev.
- **Lucia:** deprecated as a library.
- **Hand-rolled sessions:** easy to get subtly wrong.
- **Passport.js:** low-level; we'd still build sessions.

## Consequences

- ➕ All user data in one database; simple export and deletion; works offline.
- ➖ We own security config (rate limits, secrets, cookies, CSRF); reviewed with `code-reviewer`.
- ➖ Newer library: pin versions and integration-test the adapter.
- Passkeys or OAuth can follow without data-model changes.
