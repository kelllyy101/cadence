# 0005. Self-hosted authentication with Better Auth

- Status: Accepted
- Date: 2026-09-28

## Context

Users need accounts. The app stores special-category health data, so we want:

- as few processors (third parties) as possible
- identity data in the same store and region as everything else
- no vendor-hosted user profiles that would complicate export and deletion

Hosting is undecided ([ADR-0006](0006-local-first-hosting-docker-compose.md)), so auth must run
locally in Docker too.

## Decision

- Use **Better Auth**, self-hosted inside `apps/api` with its **MongoDB adapter**.
- MVP sign-in is **email + password**. Sessions use HTTP-only, `Secure`, `SameSite=Lax` cookies.
- The GraphQL context resolves the session from the cookie. Resolvers get a typed
  `ctx.user | null`.
- Better Auth's collections are included in export and deletion
  ([spec](../../openspec/changes/add-data-rights-and-polish/specs/account-deletion/spec.md)).
- Email verification and password reset need an email transport. Locally we'll use a
  dev mail catcher, or log the link in dev only (never in prod). This is decided in T-01-01.

## Alternatives considered

- **Auth0 / Clerk / Cognito / Firebase Auth.** Quick to set up, but they add a third-party
  processor holding user identities, need network access for local dev, and have pricing and
  lock-in concerns.
- **Lucia.** Deprecated as a library. It's now a learning resource.
- **Hand-rolled sessions (bcrypt/argon2 + cookies).** Full control, but security-sensitive
  code is easy to get subtly wrong. Not a good use of portfolio time.
- **Passport.js.** Mature, but low-level and callback-heavy. We'd still build session storage and
  flows ourselves.

## Consequences

- ➕ All user data stays in one database under our control, and export/deletion are straightforward.
- ➕ It works offline and locally with `docker compose up`.
- ➖ We own security-relevant config: rate limiting, secret rotation, cookie settings, CSRF
  posture. We'll review this with `code-reviewer` in T-01-01.
- ➖ Better Auth's API and adapter surface is newer than the incumbents'. Pin versions and
  verify adapter behaviour with an integration test.
- Follow-up: passkeys or OAuth sign-in can come later without changing the data model.
