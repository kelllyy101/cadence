# Spec: Cycle tracking + consent

Epic: [EPIC-02](../epics/EPIC-02-cycle-tracking-events.md) · Status: draft

## Behaviour

### Default state
- Cycle tracking is **off** for every new user.
- The navigation shows no cycle UI except an entry point in Settings ("Cycle tracking — off").
- Workouts and weekly insights work fully without it.

### Consent flow
1. The user opens Settings → Cycle tracking → "Turn on".
2. A dedicated consent screen explains in plain language, at around reading age 12:
   - **what** we store: period start dates only
   - **why**: to estimate your cycle phase and compare it with your training
   - **what we don't do**: no sharing, no selling, no third-party analytics, no advertising
   - the fact that phases are **estimates**, **not medical advice** and **not contraception**
   - how to **withdraw** at any time, and that withdrawing **deletes** your cycle data
   - a link to the full privacy notice
3. The user gives explicit, unbundled consent:
   - an **unticked** checkbox: "I agree to Cadence storing my period dates to estimate my cycle
     phase"
   - the "Turn on cycle tracking" button, enabled only when the box is ticked
   - a visible "Not now" that returns the user with no penalty
4. On submit, the server appends a `consents` record
   `{ purpose: 'cycle_tracking', version: CURRENT, granted: true }` and sets
   `user_settings.cycleTrackingEnabled = true`.

### Consent versioning
- `CURRENT_CYCLE_CONSENT_VERSION` is a constant in `packages/domain`, for example `"2026-10-01"`.
  The consent copy sits next to it.
- When the version bumps, users with an older consent can still **read** their data, but new
  cycle writes return `CONSENT_REQUIRED`. The UI shows a re-consent screen with a
  "what changed" summary.

### Logging period starts
- The user taps "Period started" and picks a date, defaulting to today. The date must not be in
  the future.
- Past starts can be backfilled. A list shows recent entries, and each can be edited or deleted.
- Only one entry is allowed per date. A second entry within 10 days of the previous one shows a
  warning ("That's close to your last entry — save anyway?"). It is allowed because
  cycles vary.

### Phase estimation (`packages/domain`)
The input is the sorted period start dates and a "today" date (injected clock). The output for
any date `d` is:

```ts
type Phase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
type PhaseEstimate =
  | { kind: 'estimate'; phase: Phase; cycleDay: number; confidence: 'low' | 'medium'; basis: CycleBasis }
  | { kind: 'unknown'; reason: 'no_data' | 'before_first_entry' | 'cycle_overdue' | 'irregular' };
interface CycleBasis { typicalLengthDays: number; cyclesUsed: number }
```

Algorithm (deliberately simple and explainable):
1. **Typical cycle length** is the median of the gaps between up to the last 6 consecutive
   starts. Gaps outside 15–60 days are excluded as likely missed or erroneous entries.
   - With fewer than 2 valid gaps, use 28 days and set `confidence: 'low'`.
   - If the spread (max − min) of the used gaps is more than 9 days, return
     `unknown/irregular` for dates after the last start.
2. **Cycle day** for `d` is `d − latestStart ≤ d`, plus 1.
3. **Phases** (for cycle length L):
   - menstrual: days 1–5
   - ovulatory: days (L−15) to (L−13)
   - follicular: from day 6 up to the ovulatory window
   - luteal: from the ovulatory window to L

   For short L, clamp so each phase has at least 1 day.
4. If `d` is more than `L + 7` days past the last start, return `unknown/cycle_overdue`. We don't
   guess across a probably missed entry.
5. Dates between two recorded starts use the **actual** gap as L for that cycle, not the
   typical length.

All UI copy shows "Estimated phase" and has a (i) explainer. Hormonal contraception,
perimenopause and conditions like PCOS make estimates unreliable. The explainer says this
neutrally, and we do not ask users about it (data minimisation).

### Withdrawing consent
- Settings → Cycle tracking → "Turn off and delete cycle data" opens a confirmation dialog that
  states exactly what will be deleted.
- In **one transaction**, the server:
  - deletes all `cycle_entries` for the user
  - appends `{ granted: false, version: CURRENT }` to `consents`
  - sets `cycleTrackingEnabled = false`
  - writes outbox event `cycle.data_deleted`
- The worker removes `insights.byPhase`. The UI immediately stops requesting phase data.
- Consent records are **retained** as a compliance record of what the user agreed to and when.
  They contain no health values.

## Data shapes

```ts
interface CycleEntry { id: string; userId: string; periodStartDate: string /* YYYY-MM-DD */; createdAt: Date }
interface ConsentRecord { id: string; userId: string; purpose: 'cycle_tracking'; version: string; granted: boolean; at: Date }
```
Indexes:
- `cycle_entries { userId: 1, periodStartDate: -1 }`, unique on `{ userId, periodStartDate }`
- `consents { userId: 1, purpose: 1, at: -1 }`

## GraphQL schema sketch

```graphql
type CycleConsentStatus {
  granted: Boolean!
  grantedVersion: String
  currentVersion: String!
  needsReconsent: Boolean!
}

type CycleEntry { id: ID!, periodStartDate: Date! }

enum Phase { MENSTRUAL FOLLICULAR OVULATORY LUTEAL }

type PhaseEstimate {
  isEstimate: Boolean!          # always true when phase is set; explicit for clients
  phase: Phase
  cycleDay: Int
  confidence: String
  unknownReason: String
  typicalCycleLengthDays: Int
}

extend type Query {
  cycleConsent: CycleConsentStatus!
  cycleEntries(limit: Int = 12): [CycleEntry!]!          # CONSENT_REQUIRED if not granted
  phaseEstimate(date: Date!): PhaseEstimate!             # CONSENT_REQUIRED if not granted
}

extend type Mutation {
  grantCycleConsent(version: String!): CycleConsentStatus!    # version must equal current
  withdrawCycleConsent: CycleConsentStatus!                    # deletes cycle data
  logPeriodStart(date: Date!): CycleEntry!
  updatePeriodStart(id: ID!, date: Date!): CycleEntry!
  deletePeriodStart(id: ID!): ID!
}
```

## Event contracts

| Event | When | Payload (beyond envelope) |
|---|---|---|
| `cycle.logged` | Period start created, updated or deleted | `{ change: 'created' \| 'updated' \| 'deleted' }` (no date) |
| `cycle.data_deleted` | Consent withdrawn | `{}` |

`cycle.data_deleted` is **an addition** to the original five events. Without it, the worker
would keep stale `byPhase` insights until the next unrelated event. See
[event-pipeline](event-pipeline.md#event-catalogue).

## Edge cases

| Case | Behaviour |
|---|---|
| A cycle mutation without consent | `CONSENT_REQUIRED` |
| `grantCycleConsent` with an old version string | `BAD_USER_INPUT` ("consent text has changed") |
| Only one period start logged | Phase estimate for days after it: low confidence, L = 28 |
| Date before the first entry | `unknown/before_first_entry` |
| Two entries 3 days apart | Allowed with a warning. The gap is excluded from the typical length (< 15) |
| Withdrawal while the worker is down | The outbox holds the event, and the worker applies it on recovery. The API hides `byPhase` immediately because it checks consent at query time (defence in depth) |
| Re-consent after withdrawal | Starts fresh. Old entries are gone, and there is no "restore" |
| The user's timezone changes | Period dates are calendar dates (no time) and are not shifted |

## Privacy notes

- This is **special-category data**. `periodStartDate` is the only cycle field we store.
- Cycle values never appear in logs, errors, metrics or event payloads.
- `phaseEstimate` responses are not cached by the service worker. Apollo's in-memory cache is
  cleared on sign-out.
- The consent copy is reviewed by `privacy-reviewer` and `ux-a11y-reviewer`, and tested for
  comprehension in the usability sessions.
- Export includes cycle entries and the full consent history. Deleting the account removes all
  of it, **including** consent records (see [data-export-deletion](data-export-deletion.md)).
