# Spec: Insights

Epic: [EPIC-03](../epics/EPIC-03-insights-demo.md) · Status: draft

## Behaviour

Insights are **descriptive summaries of the user's own data**. The insights screen, behind the
`insights.enabled` flag, has two sections.

### 1. Weekly training (no cycle consent needed)
- The last 12 ISO weeks, in the user's timezone. For each week:
  - run distance
  - run count
  - strength sessions
  - strength sets
  - average RPE
- The chart is stacked bars (run km and strength sessions on separate small multiples, not a
  dual axis), with a **"Show as table"** toggle that reveals an equivalent `<table>`.
- A summary sentence is written for screen readers and sighted users, for example: "Over the
  last 4 weeks you ran 62 km across 11 runs."

### 2. By estimated cycle phase (consent required)
- Shown only if cycle consent is active and current. Otherwise there's an explainer card with
  "Turn on cycle tracking" (never nagging; it can be dismissed).
- For each phase (menstrual, follicular, ovulatory, luteal), computed over the last 6 cycles:
  - session count
  - average RPE
  - average energy
  - average run pace (for runs of 3 km or more, to reduce noise)
  - average strength volume per session
- Workouts are assigned to a phase with `estimatePhase(performedAt)` from `packages/domain`.
  Workouts with an `unknown` phase are excluded, and the excluded count is shown ("12 workouts
  couldn't be matched to a phase").
- **Low-data thresholds:**
  - A metric for a phase is only shown when there are **at least 3 sessions** in that phase
    **and** data spans **at least 2 cycles**.
  - Otherwise the cell shows "Not enough data yet". The empty-state card explains what's needed
    ("Log 2 more strength sessions in your luteal phase to see this").
- Every phase section carries the label "Estimated phases · Patterns in your data, not medical
  advice."

### Language rules (non-causal)
- ✅ "Your average RPE was 7.1 in estimated luteal weeks and 6.2 in estimated follicular weeks."
- ✅ "Energy ratings were lower on average during your estimated menstrual phase."
- ❌ "Your luteal phase makes runs harder." / "You should lift heavier in your follicular phase."
- We never use "because", "causes", "makes you", "should", "optimal" or "best time to".
- We don't compare against population norms or other users.
- We show a difference only when both phases meet the threshold. There are no significance
  claims or p-values.

Copy lives in one module (`apps/web/src/features/insights/copy.ts`) so it can be reviewed and
tested. A unit test fails if any banned phrase appears.

## Data shapes

```ts
interface WeeklyBucket {
  isoWeek: string; // "2026-W40"
  runDistanceM: number;
  runCount: number;
  strengthSessions: number;
  strengthSets: number;
  avgRpe: number | null;
}

type Metric = { value: number; n: number } | { insufficient: true; n: number; needed: number };

interface PhaseSummary {
  phase: Phase;
  sessions: number;
  avgRpe: Metric;
  avgEnergy: Metric;
  avgPaceSecPerKm: Metric;
  avgStrengthVolumeKg: Metric;
}

interface InsightsDoc {
  userId: string;
  weekly: WeeklyBucket[];
  byPhase?: { cyclesCovered: number; unmatchedWorkouts: number; phases: PhaseSummary[] };
  computedAt: Date;
  sourceEventId: string;
}
```

Domain functions (pure, unit-tested):
- `weeklyVolume(workouts, tz, weeks, now)`
- `aggregateByPhase(workouts, cycleStarts, now, thresholds)`

## GraphQL schema sketch

```graphql
type MetricValue {
  value: Float
  n: Int!
  insufficient: Boolean!
  needed: Int
}

type WeeklyBucket {
  isoWeek: String!
  runDistanceM: Float!
  runCount: Int!
  strengthSessions: Int!
  strengthSets: Int!
  avgRpe: Float
}

type PhaseSummary {
  phase: Phase!
  sessions: Int!
  avgRpe: MetricValue!
  avgEnergy: MetricValue!
  avgPaceSecPerKm: MetricValue!
  avgStrengthVolumeKg: MetricValue!
}

type PhaseInsights {
  isEstimate: Boolean!
  cyclesCovered: Int!
  unmatchedWorkouts: Int!
  phases: [PhaseSummary!]!
}

type Insights {
  weekly: [WeeklyBucket!]!
  byPhase: PhaseInsights            # null unless consent is active + current
  computedAt: DateTime
  status: InsightsStatus!
}

enum InsightsStatus { READY UPDATING NO_DATA }

type FeatureFlags { insightsEnabled: Boolean! }

extend type Query {
  insights: Insights!   # returns NO_DATA if the worker hasn't produced a doc yet
  flags: FeatureFlags!
}
```

- `status: UPDATING` means the latest workout's `updatedAt` is later than `computedAt`. The UI
  shows "Updating…" and polls gently (every 3 s, up to 5 times), with an `aria-live="polite"`
  announcement when it's ready.

## Accessibility requirements

- Every chart has:
  - a text summary
  - a table alternative
  - `role="img"` with an `aria-label`, or `<figure>`/`<figcaption>`
  - no information conveyed by colour alone (patterns and direct labels)
- Chart and text colours meet 3:1 (graphics) and 4.5:1 (text) contrast.
- Tooltips aren't the only way to reach values, since the table covers everything.
- Reduced motion: chart animations are disabled under `prefers-reduced-motion`.

## Edge cases

| Case | Behaviour |
|---|---|
| A new user with no workouts | `NO_DATA`, and an empty state with "Log your first workout" |
| Flag off | The Insights tab is hidden. A direct URL goes to a friendly "not available" page |
| Consent withdrawn | `byPhase` is null immediately (API check), and the worker deletes it async |
| Cycle data only, no workouts | Weekly is empty, and every phase shows "Not enough data yet" |
| Irregular cycles → most phases `unknown` | Many workouts are unmatched. We show that count and an explainer, not a broken chart |
| A run with 0 distance (shouldn't exist) | Excluded from pace averages defensively |

## Privacy notes

- `byPhase` is derived special-category data. It's deleted on consent withdrawal and on account
  deletion, and included in export.
- Insights aren't pushed or notified anywhere. They're only visible in-app.
- The demo seed script (`scripts/seed-demo.ts`) uses **synthetic** data only. It is
  deterministic (seeded RNG) and marked as demo in `user_settings`.
