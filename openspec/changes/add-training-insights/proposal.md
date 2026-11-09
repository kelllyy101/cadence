# Proposal: Add training insights and the demo account

## Why

Logged data is only useful if users can see patterns in it. Users want honest summaries of their
own training, and (if they opted in) comparisons across estimated cycle phases, without causal
claims or guesses from thin data. Reviewers also need to evaluate the app in two minutes, which
needs a realistic, synthetic demo account.

## What Changes

- Domain: `weeklyVolume` and `aggregateByPhase` with low-data thresholds.
- The worker recomputes real insights, replacing the placeholder.
- An `insights` query with consent gating and a READY / UPDATING / NO_DATA status.
- Accessible charts with a table toggle, text summary and reduced motion.
- One copy module with non-causal language and a banned-phrase test.
- OpenFeature file provider, a `flags` query and the `insights.enabled` flag.
- `scripts/seed-demo.ts` (deterministic, synthetic) and a demo login path.

## Capabilities

### New Capabilities
- `training-insights`: weekly training summaries and by-phase comparisons with honest low-data
  states and accessible presentation.
- `feature-flags`: server-evaluated flags exposed to the client.
- `demo-account`: a deterministic synthetic demo account for reviewers.

### Modified Capabilities
- None.

## Out of scope

- Significance testing, predictions and recommendations.
- Population comparisons.
- Push notifications or email digests.
- Exporting charts as images.

## Impact

- `packages/domain`: aggregation functions.
- `apps/insights-worker`: full recompute.
- `apps/api`: `insights` and `flags` queries.
- `apps/web`: Insights screen, chart component, copy module.
- New dependencies (asked per task): recharts, @openfeature/server-sdk (+ file provider), a
  seeded RNG if needed.

## Depends on

- `add-cycle-tracking-and-events` (pipeline, phase estimation, consent).
