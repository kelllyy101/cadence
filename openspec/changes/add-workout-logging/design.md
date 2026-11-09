# Design: Add workout logging

## Context

Builds on `setup-foundation`. Auth decision: [ADR-0005](../../../docs/adr/0005-self-hosted-auth-better-auth.md).
PWA decision: [ADR-0002](../../../docs/adr/0002-pwa-over-native.md). Requirements in `specs/`.

## Goals / Non-Goals

**Goals:** one-thumb logging under 15 s for a run; a shared zod schema between client and
server; derived values computed only in `packages/domain`.

**Non-Goals:** events (next change), offline queue, server-side dedupe of double submits.

## Decisions

- **Auth:** Better Auth with the MongoDB adapter inside `apps/api`. The GraphQL context resolves
  the session cookie into a typed `ctx.user | null`. Email transport: a dev mail catcher, or log
  links in dev only (decide in group 1).
- **Storage:** one `workouts` collection with a Mongoose `kind` discriminator. Index
  `{ userId: 1, performedAt: -1, _id: -1 }` for pagination.
- **Domain:**
  ```ts
  type WorkoutKind = 'run' | 'strength';
  interface Run { kind: 'run'; distanceM: number; durationS: number; /* + base fields */ }
  interface StrengthSet { reps: number; weightKg?: number }
  interface Exercise { name: string; sets: StrengthSet[] }
  paceSecondsPerKm(distanceM, durationS): number | null   // null if distance 0
  formatPace(secondsPerUnit, units): string                // "5:32 /km"
  strengthVolumeKg(exercises): number
  ```
- **GraphQL sketch:**
  ```graphql
  interface Workout { id: ID!, performedAt: DateTime!, rpe: Int!, energy: Int, notes: String }
  type Run implements Workout { ...; distanceM: Float!, durationS: Int!, paceSecondsPerKm: Float }
  type StrengthSession implements Workout { ...; exercises: [Exercise!]!, durationS: Int,
    totalVolumeKg: Float!, totalSets: Int! }
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
  Cursor is opaque (base64 of `performedAt|_id`). `DateTime` is an ISO-8601 scalar.
- **Forms:** react-hook-form + zod; `useFieldArray` for strength, each set labelled ("Set 2
  reps"), focus managed on add/remove. RPE and energy are large segmented controls, not sliders.
  Numeric fields use `inputmode`. Primary action at the bottom. Confirmation toast in an
  `aria-live` region.
- **Delete undo:** client-side; the mutation is delayed 5 s and cancelled on Undo. Hard delete.
- **Duplicate submit:** button disabled while in flight; no server dedupe in the MVP.

## Risks / Trade-offs

- [Better Auth + Mongo adapter + Apollo context wiring is unfamiliar] → time-boxed spike in group
  1 with an integration test for session lookup.
- [One-thumb UX is hard to get right first time] → build the run form early, dogfood, then test
  in usability sessions.
- [Dynamic strength form harms a11y] → explicit labels per set, focus management.
- [Unit rounding bugs] → store SI only; table-driven domain tests.
