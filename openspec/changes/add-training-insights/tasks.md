# Tasks

## 1. Domain: `weeklyVolume` (T-03-01)

- [ ] 1.1 Implement `weeklyVolume` with ISO weeks in the user's timezone. Verify table-driven tests incl. week boundaries, empty weeks and 0-distance runs excluded from pace

## 2. Domain: `aggregateByPhase` (T-03-02)

- [ ] 2.1 Implement `aggregateByPhase` with thresholds (≥ 3 sessions, ≥ 2 cycles), unmatched count and runs ≥ 3 km for pace. Verify tests for each threshold edge and the `needed` count

## 3. Worker: full insights recompute (T-03-03)

- [ ] 3.1 Replace the placeholder with a full recompute over the bounded window; include `byPhase` only with active consent. Verify an integration test for workout and cycle events and for `cycle.data_deleted` removing `byPhase`

## 4. `insights` query (T-03-04)

- [ ] 4.1 Add the `insights` query (SDL first) with consent gating at query time and `status`. Verify unit tests for READY, UPDATING, NO_DATA and `byPhase` null without consent

## 5. OpenFeature + `flags` (T-03-05)

- [ ] 5.1 Add the OpenFeature file provider, `flags.json` and the `flags` query (ask first). Verify a missing flag reads false and toggling the file changes the query result

## 6. Accessible chart component (T-03-06)

- [ ] 6.1 Build a chart wrapper with summary, "Show as table" toggle, figure/caption and reduced motion (ask first: recharts). Verify axe passes and the table values match the chart data

## 7. Weekly insights UI (T-03-07)

- [ ] 7.1 Build the weekly section with summary sentence and states (NO_DATA empty state, UPDATING polling with polite announcement). Verify the 4-week scenario

## 8. By-phase insights UI (T-03-08)

- [ ] 8.1 Build the by-phase section with "Not enough data yet" cells, guidance, unmatched count, estimate label and the dismissible consent explainer. Verify the low-data and no-consent scenarios

## 9. Copy module + banned-phrase test (T-03-09)

- [ ] 9.1 Move all insight strings into `copy.ts` and add the banned-phrase test. Verify the test fails when "should" is added

## 10. `scripts/seed-demo.ts` (T-03-10)

- [ ] 10.1 Write the deterministic synthetic seed with noise, gaps, an irregular cycle and a deload week. Verify two runs produce identical data

## 11. Demo login path (T-03-11)

- [ ] 11.1 Add the dev/demo-only "Try the demo" path and README instructions. Verify the button is absent in a production build

## Workflow follow-up

- Archive this change once every group is merged and the spec scenarios pass.
