# 0003. Schema-first GraphQL with codegen

- Status: Accepted
- Date: 2026-09-28

## Context

The client needs flexible reads (history, detail, insights) and a few mutations. The developer
knows GraphQL. The contract should be reviewable on its own, with types that can't drift.

## Decision

- **Apollo Server**; `.graphql` SDL files under `apps/api/src/schema/` are the source of truth.
- **GraphQL Code Generator** creates resolver types for the API and typed documents for the web.
  Output isn't committed; `pnpm codegen` runs before `typecheck` and `build`.
- **REST only** for `GET /export` (file download) and `/health`, `/health/ready`, `/metrics`.
- Errors use `extensions.code` from a fixed set (see CLAUDE.md).

## Alternatives

- **Code-first (Pothos, Nexus):** the schema is less visible in review.
- **tRPC:** less common in target employers' stacks.
- **REST + OpenAPI:** more endpoints and over- or under-fetching.

## Consequences

- ➕ Schema diffs show API changes; types flow from SDL to client.
- ➖ Codegen is a build step in CI.
- ➖ N+1 risk: keep the schema shallow; add DataLoader when needed.
- ➖ Depth and complexity limits are required before public deployment (backlog).
