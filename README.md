# Cadence

**Train with your cycle, not against it.** A mobile-first training log for women who run and
lift, with optional cycle tracking to see how effort and energy line up with each cycle phase.

> Patterns, not prescriptions. Phases are estimates, not medical advice or contraception.

## What this project shows

- **Privacy by design** for GDPR special-category data: opt-in versioned consent, full export,
  deletion that reaches every derived copy.
- **Accessibility:** WCAG 2.2 AA; every chart has a table.
- **Usability:** one-thumb logging, tested with real users.
- **Event-driven architecture:** transactional outbox, idempotent consumers, per-user ordering.
- **Responsible AI:** a workout builder that only picks from a curated exercise list and never
  sees health data.

## Stack

React + Vite PWA · Apollo GraphQL · MongoDB · Kafka (KRaft) · Better Auth · Claude API ·
TypeScript (strict) · pnpm + Turborepo · Vitest, Testcontainers, Cypress + axe.

[Architecture](docs/architecture/ARCHITECTURE.md) · [Decisions (ADRs)](docs/adr/README.md) ·
[Roadmap](docs/ROADMAP.md)

## Run it

Requires Docker, Node 22 and pnpm.

```bash
cp .env.example .env
docker compose up   # web :5173 · api :4000/graphql
```

## Status

🚧 Early development. Each feature is planned spec-first as an
[OpenSpec](https://github.com/Fission-AI/OpenSpec) change in [`openspec/changes/`](openspec/changes/);
`openspec list` shows progress.

| # | Change | Status |
|---|---|---|
| 1 | [setup-foundation](openspec/changes/setup-foundation/proposal.md) | In progress |
| 2 | [add-workout-logging](openspec/changes/add-workout-logging/proposal.md) | Planned |
| 3 | [add-cycle-tracking-and-events](openspec/changes/add-cycle-tracking-and-events/proposal.md) | Planned |
| 4 | [add-training-insights](openspec/changes/add-training-insights/proposal.md) | Planned |
| 5 | [add-ai-workout-builder](openspec/changes/add-ai-workout-builder/proposal.md) | Planned |
| 6 | [add-data-rights-and-polish](openspec/changes/add-data-rights-and-polish/proposal.md) | Planned |

## Privacy

Cycle tracking is off by default. Withdrawing consent deletes cycle data. No third-party
analytics; health data never reaches logs. [Details](docs/architecture/ARCHITECTURE.md#privacy-design).

## Disclaimer

Cadence is not a medical device. Phase estimates are approximations, not medical advice,
diagnosis or contraception.
