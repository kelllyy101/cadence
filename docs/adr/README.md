# Architecture Decision Records

We record significant, hard-to-reverse decisions here. ADRs are immutable once
`Accepted`. To change one, write a new ADR that supersedes it and update the old one's status.

| ADR | Title | Status |
|---|---|---|
| [0001](0001-monorepo-pnpm-turborepo.md) | Monorepo with pnpm workspaces + Turborepo | Accepted |
| [0002](0002-pwa-over-native.md) | Installable PWA over native apps | Accepted |
| [0003](0003-schema-first-graphql-codegen.md) | Schema-first GraphQL with GraphQL Code Generator | Accepted |
| [0004](0004-kafka-kraft-transactional-outbox.md) | Kafka (KRaft) with a transactional outbox | Accepted |
| [0005](0005-self-hosted-auth-better-auth.md) | Self-hosted authentication with Better Auth | Accepted |
| [0006](0006-local-first-hosting-docker-compose.md) | Local-first: one `docker compose up`, hosting deferred | Accepted |
| [0007](0007-llm-workout-generation-claude-api.md) | Natural-language workout generation via the Claude API | Proposed |

## Template

```markdown
# NNNN. Title

- Status: Proposed | Accepted | Superseded by NNNN
- Date: YYYY-MM-DD

## Context
What forces are at play? What problem are we solving?

## Decision
What we will do.

## Alternatives considered
- Option — why not.

## Consequences
Positive, negative and follow-up work.
```
