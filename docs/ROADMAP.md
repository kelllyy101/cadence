# Roadmap

Cadence is planned with [OpenSpec](https://github.com/Fission-AI/OpenSpec). Each row is a change
in [`openspec/changes/`](../openspec/changes/) and is built on its own branch,
`feature/<change-name>`. Run `openspec list` for live task progress.

| # | Change | Replaces | Depends on | Branch |
|---|---|---|---|---|
| 1 | [setup-foundation](../openspec/changes/setup-foundation/proposal.md) | EPIC-00 | — | `feature/setup-foundation` |
| 2 | [add-workout-logging](../openspec/changes/add-workout-logging/proposal.md) | EPIC-01 | 1 | `feature/add-workout-logging` |
| 3 | [add-cycle-tracking-and-events](../openspec/changes/add-cycle-tracking-and-events/proposal.md) | EPIC-02 | 1, 2 | `feature/add-cycle-tracking-and-events` |
| 4 | [add-training-insights](../openspec/changes/add-training-insights/proposal.md) | EPIC-03 | 3 | `feature/add-training-insights` |
| 5 | [add-ai-workout-builder](../openspec/changes/add-ai-workout-builder/proposal.md) | EPIC-05 | 1, 2 (groups 2, 4, 16), 4 (group 5, optional) | `feature/add-ai-workout-builder` |
| 6 | [add-data-rights-and-polish](../openspec/changes/add-data-rights-and-polish/proposal.md) | EPIC-04 | 3, 4, 5 | `feature/add-data-rights-and-polish` |

The AI workout builder moved ahead of data rights and polish, so the final redaction audit,
deletion coverage and Cypress pass also cover it.

## Glossary

- **Change:** one feature, planned as a proposal (why), specs (what, as requirements with
  testable scenarios), design (how) and tasks (steps).
- **Task group:** a numbered section of `tasks.md`, one reviewable unit of 1–3 hours and one
  commit.
- **Archive:** after a change ships, its specs move into `openspec/specs/`, which describes how
  the system behaves today.
- **ADR:** Architecture Decision Record, a short note in [`docs/adr/`](adr/README.md) recording
  one significant decision, the alternatives, and why.
