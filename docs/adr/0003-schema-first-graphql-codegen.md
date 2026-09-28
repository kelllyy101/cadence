# 0003. Schema-first GraphQL with GraphQL Code Generator

- Status: Accepted
- Date: 2026-09-28

## Context

The web client needs flexible reads (history lists, workout detail, insights) and a small set of
mutations. The developer has production GraphQL experience. We want the API contract to be
reviewable on its own, and types on both sides that can't drift.

## Decision

- **Apollo Server** in `apps/api`. The **SDL is the source of truth**: `.graphql` files live
  under `apps/api/src/schema/` and are split by feature.
- **GraphQL Code Generator** produces:
  - resolver types for the API (`typescript` + `typescript-resolvers`, with mapper types for
    Mongoose documents)
  - typed documents and hooks for the web app (`client-preset`)
- The generated output is **not committed**. It is produced by `pnpm codegen`, which runs before
  `typecheck` and `build` in Turbo.
- **REST is used only** for `GET /export` (a file download is a better fit than GraphQL), and
  for `GET /health`, `/health/ready` and `/metrics` (infrastructure conventions).
- Errors are returned as `GraphQLError` with `extensions.code` from a fixed set (see CLAUDE.md).
- The Apollo Client cache uses `typePolicies` for pagination.

## Alternatives considered

- **Code-first (Pothos, Nexus, TypeGraphQL).** Great type inference, but the schema is less
  visible in review, and the portfolio benefits from a readable contract.
- **tRPC.** Excellent DX for a TS monorepo, but it doesn't match target employers' stacks
  (many use GraphQL) or the developer's experience.
- **REST + OpenAPI everywhere.** Workable, but it means more endpoints and more over- or
  under-fetching for dashboard-style reads.

## Consequences

- ➕ Contract-first reviews: a schema diff shows the API change clearly.
- ➕ End-to-end types, from SDL to resolvers to client hooks.
- ➖ Codegen becomes a build step, and CI must run it before typecheck.
- ➖ N+1 risk in nested resolvers. Keep the schema shallow and add DataLoader only when a real
  N+1 query appears.
- ➖ Query cost: we'll add depth and complexity limits before any public deployment. This is
  tracked in the backlog.
