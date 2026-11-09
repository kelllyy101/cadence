# Design: Add training insights and the demo account

## Context

The pipeline and placeholder worker exist from `add-cycle-tracking-and-events`. Requirements in
`specs/`.

## Goals / Non-Goals

**Goals:** convergent recompute from source data; one reviewable copy module; the table as the
accessible source of truth.

**Non-Goals:** statistics beyond averages and counts; predictions.

## Decisions

- **Domain:** `weeklyVolume(workouts, tz, weeks, now)` and
  `aggregateByPhase(workouts, cycleStarts, now, thresholds)`, pure and table-tested.
- **Shapes:**
  ```ts
  interface WeeklyBucket { isoWeek: string; runDistanceM; runCount; strengthSessions; strengthSets; avgRpe: number | null }
  type Metric = { value: number; n: number } | { insufficient: true; n: number; needed: number };
  interface PhaseSummary { phase; sessions; avgRpe: Metric; avgEnergy: Metric; avgPaceSecPerKm: Metric; avgStrengthVolumeKg: Metric }
  interface InsightsDoc { userId; weekly: WeeklyBucket[];
    byPhase?: { cyclesCovered; unmatchedWorkouts; phases: PhaseSummary[] }; computedAt; sourceEventId }
  ```
- **GraphQL sketch:** `insights: Insights!` with `weekly`, `byPhase` (null unless consent active
  and current), `computedAt`, `status: READY | UPDATING | NO_DATA`; `flags: FeatureFlags!`.
  `MetricValue { value, n, insufficient, needed }`.
- **Status:** `UPDATING` when the latest workout `updatedAt` > `computedAt`; client polls every
  3 s, up to 5 times, with an `aria-live="polite"` announcement.
- **Recompute window:** 12 weeks and 6 cycles, to bound cost.
- **Charts:** Recharts small multiples (no dual axis), `<figure>/<figcaption>`, patterns plus
  direct labels, animations off under `prefers-reduced-motion`.
- **Copy:** `apps/web/src/features/insights/copy.ts`; a unit test scans every string for banned
  phrases.
- **Flags:** OpenFeature server SDK with a file provider reading `flags.json`.
- **Seed:** seeded RNG; the script upserts by a fixed demo email so it is idempotent.

## Risks / Trade-offs

- [Insights read as medical claims] → copy module, banned-phrase test, privacy review,
  comprehension check.
- [Recharts a11y gaps] → chart is decorative-plus-summary; the table is canonical.
- [Seed looks too tidy] → noise, gaps, irregular cycle, deload week.
- [Recompute cost grows] → bounded window, measured in an integration test.
