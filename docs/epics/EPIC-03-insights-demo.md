# EPIC-03 — Insights + demo

Spec: [insights](../specs/insights.md)

## Goal
Users see honest, accessible summaries of their own training: weekly volume for everyone, and
comparisons by estimated cycle phase for users who have opted in. Low-data states are clear, and
the wording never implies causation. A seeded demo account lets reviewers explore the app
instantly. Insights are behind a feature flag.

## User stories
- As a **user**, I want to see my weekly running distance and strength volume, so I can spot trends in my training load.
- As a **user who tracks her cycle**, I want to compare effort, energy and pace across estimated phases, so I can see whether patterns exist *for me*.
- As a **user with little data**, I want to be told what's missing rather than shown misleading numbers.
- As a **screen-reader user**, I want every chart available as a table and a text summary.
- As a **reviewer or hiring manager**, I want to log in to a demo account with realistic data, so I can evaluate the app in two minutes.
- As the **developer**, I want insights behind a flag, so I can ship incrementally and turn them off if something's wrong.

## Scope
- Domain: `weeklyVolume` and `aggregateByPhase`, with thresholds
- The worker recomputes the real insights, replacing the EPIC-02 placeholder
- The `insights` GraphQL query with consent gating, and `status` (READY/UPDATING/NO_DATA)
- Accessible chart components (Recharts) with a table toggle, a text summary and reduced motion
- Low-data states and non-causal copy in one module, with a banned-phrase test
- OpenFeature SDK with a file-based provider, and the `insights.enabled` flag
- `scripts/seed-demo.ts`: deterministic synthetic data covering about 6 cycles and 16 weeks,
  including some irregularity and some gaps
- A demo login path (documented credentials, or a "Try the demo" button in dev and demo mode only)

## Out of scope
- Statistical significance testing, predictions and recommendations
- Population comparisons
- Push notifications or email digests
- Exporting charts as images

## Acceptance criteria
- Given a user with workouts over 4+ weeks, when she opens Insights, then weekly bars and an equivalent table show the same values.
- Given a phase with fewer than 3 sessions or data spanning fewer than 2 cycles, when insights render, then that metric shows "Not enough data yet" with guidance on what's needed.
- Given any insight copy, when the banned-phrase test runs, then no causal or prescriptive phrases are present.
- Given no cycle consent, when Insights is opened, then only weekly insights render, and `byPhase` is null from the API.
- Given `insights.enabled=false`, when the app loads, then the Insights tab is hidden and the query is not issued.
- Given a clean database, when `pnpm seed:demo` runs twice, then the demo account has the same data both times (it is idempotent and deterministic).
- Given the Insights screen, when axe runs, then there are no serious or critical violations. Charts have text alternatives.

## Risks
| Risk | Mitigation |
|---|---|
| Insights read as medical claims | Copy module + banned-phrase test + privacy-reviewer + usability comprehension check |
| Recharts accessibility gaps | Treat the chart as decorative-plus-summary. The table is the accessible source of truth |
| The demo seed looks fake or too tidy | Add noise, missed sessions, an irregular cycle and a deload week, all from a seeded RNG |
| Recompute cost grows with history | Bound the window (12 weeks / 6 cycles). Measure it in an integration test |

## Tasks (titles only — detail later with `task-planner`)
| ID | Title |
|---|---|
| T-03-01 | Domain: `weeklyVolume` aggregation |
| T-03-02 | Domain: `aggregateByPhase` with thresholds + unmatched count |
| T-03-03 | Worker: full insights recompute (replace placeholder) |
| T-03-04 | `insights` GraphQL query with consent gating + status |
| T-03-05 | OpenFeature file provider + `flags` query + `insights.enabled` |
| T-03-06 | Accessible chart component: summary, table toggle, reduced motion |
| T-03-07 | Weekly insights UI |
| T-03-08 | By-phase insights UI with low-data states |
| T-03-09 | Insights copy module + banned-phrase test |
| T-03-10 | `scripts/seed-demo.ts` (deterministic synthetic data) |
| T-03-11 | Demo account login path + README instructions |
