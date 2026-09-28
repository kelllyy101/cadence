# Spec: Workout logging

Epic: [EPIC-01](../epics/EPIC-01-workout-logging.md) · Status: draft

## Behaviour

### Log a run
- **Inputs:**
  - Date/time performed (default: now)
  - Distance and duration (both required)
  - RPE 1–10 (required)
  - Energy 1–5 (optional)
  - Notes (optional, ≤ 500 chars)
- **Pace:**
  - Derived from distance and duration in `packages/domain` and shown live as the user types.
  - Pace is never stored.
  - It is shown as min/km or min/mi according to `user_settings.units`.
- **Units:** distance is entered in km or mi (per settings) and stored in metres. Duration is
  entered as `h:mm:ss` or `mm:ss` and stored as seconds.
- **One-thumb design:**
  - The primary action is at the bottom of the screen.
  - RPE and energy are large segmented or tappable controls, not sliders. Every touch target
    is at least 44×44 px.
  - Numeric fields use `inputmode="decimal"` or `inputmode="numeric"`.
  - Only the date/time field is pre-filled; users type distance and duration.
- **After saving:** show a confirmation toast (an `aria-live` region). The user returns to history,
  where the new item is at the top.

### Log a strength session
- **Inputs:**
  - Date/time
  - 1–20 exercises, each with a name (free text, max 60 chars) and 1–20 sets
  - Reps per set: 1–100
  - Weight per set: optional. Bodyweight is allowed, 0–500 kg.
  - Session RPE 1–10 (required)
  - Energy 1–5 (optional)
  - Duration (optional)
  - Notes (optional)
- **Fast entry:**
  - "Add set" copies the previous set's reps and weight.
  - Recently used exercise names are suggested. The suggestions are built from the user's own
    history only.
- **Derived values:** total volume (Σ reps × weight) and total sets. These are computed in the domain package.

### History
- A reverse-chronological list of the user's workouts, 20 per page, with infinite scroll or a
  "Load more" button. The button is the accessible default.
- Each item shows: type icon + label (never the icon alone), date, key metric (distance + pace, or
  exercise count + sets) and RPE.
- A detail view shows all fields, with Edit and Delete actions.
- The page has empty, loading (skeleton) and error (retry) states.

### Edit / delete
- Editing uses the same form, pre-filled. Validation is the same as for create.
- Delete asks for confirmation in an accessible dialog (focus trapped, Esc cancels). It is a
  hard delete, and the undo toast lasts 5 s (the undo is client-side and delays the mutation).

## Data shapes

```ts
// packages/domain (conceptual)
type WorkoutKind = 'run' | 'strength';
type Rpe = 1|2|3|4|5|6|7|8|9|10;
type Energy = 1|2|3|4|5;

interface WorkoutBase {
  id: string; userId: string; kind: WorkoutKind;
  performedAt: Date; rpe: Rpe; energy?: Energy; notes?: string;
  createdAt: Date; updatedAt: Date;
}
interface Run extends WorkoutBase { kind: 'run'; distanceM: number; durationS: number }
interface StrengthSet { reps: number; weightKg?: number }
interface Exercise { name: string; sets: StrengthSet[] }
interface Strength extends WorkoutBase { kind: 'strength'; exercises: Exercise[]; durationS?: number }

// domain functions
paceSecondsPerKm(distanceM: number, durationS: number): number | null // null if distance 0
formatPace(secondsPerUnit: number, units: 'metric' | 'imperial'): string // "5:32 /km"
strengthVolumeKg(exercises: Exercise[]): number
```

Mongoose stores both kinds in `workouts` using a `kind` discriminator.
Indexes: `{ userId: 1, performedAt: -1, _id: -1 }` for history pagination.

## GraphQL schema sketch

```graphql
enum Units { METRIC IMPERIAL }

interface Workout {
  id: ID!
  performedAt: DateTime!
  rpe: Int!
  energy: Int
  notes: String
}

type Run implements Workout {
  id: ID!
  performedAt: DateTime!
  rpe: Int!
  energy: Int
  notes: String
  distanceM: Float!
  durationS: Int!
  paceSecondsPerKm: Float   # derived
}

type StrengthSet { reps: Int!, weightKg: Float }
type Exercise { name: String!, sets: [StrengthSet!]! }

type StrengthSession implements Workout {
  id: ID!
  performedAt: DateTime!
  rpe: Int!
  energy: Int
  notes: String
  exercises: [Exercise!]!
  durationS: Int
  totalVolumeKg: Float!     # derived
  totalSets: Int!           # derived
}

type WorkoutEdge { cursor: String!, node: Workout! }
type WorkoutConnection { edges: [WorkoutEdge!]!, pageInfo: PageInfo! }
type PageInfo { hasNextPage: Boolean!, endCursor: String }

input LogRunInput {
  performedAt: DateTime!
  distanceM: Float!
  durationS: Int!
  rpe: Int!
  energy: Int
  notes: String
}
input StrengthSetInput { reps: Int!, weightKg: Float }
input ExerciseInput { name: String!, sets: [StrengthSetInput!]! }
input LogStrengthInput {
  performedAt: DateTime!
  exercises: [ExerciseInput!]!
  rpe: Int!
  energy: Int
  durationS: Int
  notes: String
}

type Query {
  me: User
  workouts(first: Int = 20, after: String): WorkoutConnection!
  workout(id: ID!): Workout
  recentExerciseNames(limit: Int = 10): [String!]!
}

type Mutation {
  logRun(input: LogRunInput!): Run!
  logStrengthSession(input: LogStrengthInput!): StrengthSession!
  updateRun(id: ID!, input: LogRunInput!): Run!
  updateStrengthSession(id: ID!, input: LogStrengthInput!): StrengthSession!
  deleteWorkout(id: ID!): ID!
}
```

- The cursor is opaque (base64 of `performedAt|_id`).
- `DateTime` is an ISO-8601 scalar.
- All operations require authentication (`UNAUTHENTICATED` otherwise). Accessing another user's
  workout returns `NOT_FOUND`, not `FORBIDDEN`, so we don't leak whether it exists.

## Event contracts

From EPIC-02 onward, these mutations also write outbox events (see
[event-pipeline](event-pipeline.md)): `workout.logged`, `workout.updated` and `workout.deleted`.
In EPIC-01 they write only to `workouts`.

## Validation & edge cases

| Case | Behaviour |
|---|---|
| Distance ≤ 0 or > 1,000 km | `BAD_USER_INPUT` with a field-level message |
| Duration ≤ 0 or > 72 h | `BAD_USER_INPUT` |
| Implausible pace (< 2:30/km) | Allowed, but the UI shows a non-blocking "Double-check distance/time?" hint |
| `performedAt` in the future | Allowed up to +24 h (time zones); beyond that it's rejected |
| RPE outside 1–10, energy outside 1–5 | Rejected by the zod schema, shared between client and server |
| Strength session with 0 exercises or an exercise with 0 sets | Rejected |
| Duplicate submit (double tap) | The button is disabled while the mutation is in flight. The server doesn't dedupe in the MVP. |
| Imperial user enters 3.1 mi | Stored as 4989 m (rounded to the nearest metre). Displayed back as 3.10 mi. |
| Time zones | `performedAt` is stored in UTC. The client sends local time converted to ISO. History groups items by the user's local date. |
| Editing a workout that's already deleted | `NOT_FOUND`. The UI shows "This workout no longer exists" and returns to history. |

## Privacy notes

- RPE, energy and notes are health-adjacent. They are **never logged** and never appear in
  error messages (validation errors name the field, not its value).
- Notes are free text and could contain anything. They are included in export, excluded from
  events, and never indexed for search in the MVP.
- Exercise-name suggestions come from the user's own data only. There is no shared global list
  built from other users.
- We collect no location or GPS data.
