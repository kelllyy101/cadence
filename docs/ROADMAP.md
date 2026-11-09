# Roadmap

Each change is built on its own `feature/<change-name>` branch. `openspec list` shows progress.

| # | Change | Depends on |
|---|---|---|
| 1 | [setup-foundation](../openspec/changes/setup-foundation/proposal.md) | — |
| 2 | [add-workout-logging](../openspec/changes/add-workout-logging/proposal.md) | 1 |
| 3 | [add-cycle-tracking-and-events](../openspec/changes/add-cycle-tracking-and-events/proposal.md) | 2 |
| 4 | [add-training-insights](../openspec/changes/add-training-insights/proposal.md) | 3 |
| 5 | [add-ai-workout-builder](../openspec/changes/add-ai-workout-builder/proposal.md) | 2 (flags from 4 optional) |
| 6 | [add-data-rights-and-polish](../openspec/changes/add-data-rights-and-polish/proposal.md) | 3, 4, 5 |

**Terms:** a *change* is one feature (proposal, specs, design, tasks). A *task group* is one
numbered section of `tasks.md` and one commit. *Archiving* moves shipped specs into
`openspec/specs/`. An [*ADR*](adr/README.md) records one architecture decision.
