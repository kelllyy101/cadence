# Design: Add the AI workout builder

## Context

Decision: [ADR-0007](../../../docs/adr/0007-llm-workout-generation-claude-api.md) (Claude API
server-side, behind an interface with a fake). Requirements in `specs/`.

## Goals / Non-Goals

**Goals:** the model can't invent exercises; CI never depends on the provider; the free-text path
accepts a voice transcript later without changes.

**Non-Goals:** persistence, rest timers, cycle-aware suggestions, local LLM.

## Decisions

- **Catalogue source:** seed from [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
  (public domain/Unlicense; ~800 exercises with equipment, muscles and start/end images). A
  one-off script `scripts/import-exercises.ts` copies ~40 chosen entries and their images into
  `packages/domain/src/exercises/catalogue.ts` and `apps/web/public/exercises/`. We rewrite cues
  ourselves. Confirm the licence in group 1 and record it per exercise. Where an exercise needs a
  video, wger (CC-BY-SA, attribution) is the fallback. This replaces the earlier "link-out videos"
  idea: self-hosting keeps zero third-party requests.
- **Catalogue type:**
  ```ts
  type Equipment = 'bodyweight' | 'dumbbell' | 'kettlebell' | 'resistance_band' | 'step' | 'bench' | 'mat' | 'pull_up_bar';
  type MuscleGroup = 'legs' | 'glutes' | 'upper_body' | 'core' | 'full_body';
  interface CatalogueExercise {
    id: string; name: string; equipment: Equipment[]; muscleGroups: MuscleGroup[];
    measure: 'reps' | 'seconds'; cue: string;
    media: { images: string[]; alt: string };          // paths under /exercises/
    source: { dataset: string; licence: string; attribution?: string };
  }
  ```
- **GraphQL:**
  ```graphql
  input GenerateWorkoutInput { prompt: String, equipment: [Equipment!], focus: WorkoutFocus, exerciseCount: Int }
  type GeneratedExercise { exercise: Exercise!, sets: Int!, reps: Int, seconds: Int }
  type GeneratedWorkout { title: String!, equipmentUsed: [Equipment!]!, exercises: [GeneratedExercise!]! }
  type Mutation { generateWorkout(input: GenerateWorkoutInput!): GeneratedWorkout! }
  ```
- **Server flow:** auth → flag → zod input (prompt 1–500 or focus required; count 3–8) → rate
  limit 10/user/hour (in memory, single instance) → candidates via `filterByEquipment` (or the
  full catalogue if no equipment is given) → `WorkoutGenerator.generate()` → zod
  `GeneratedWorkoutDraft` + `isValidSelection` → one retry with the validation reason → map ids
  to catalogue entries. Nothing persisted.
- **Model draft:**
  `{ status: 'ok'|'unclear'|'off_topic', title ≤ 60, equipmentUsed[], exercises[{ id, sets, reps?, seconds? }] }`.
- **Adapter:** `@anthropic-ai/sdk`, structured output from the draft's JSON Schema, system prompt
  with the rules, user text wrapped in delimiters, 20 s timeout, one retry on 5xx/timeout.
  Model `claude-sonnet-5-5` via `ANTHROPIC_MODEL`. `WORKOUT_GENERATOR=anthropic|fake`.
- **Fake:** deterministic; returns `off_topic` for configured trigger words (e.g. "poem") and
  otherwise picks the first N candidates matching the focus.
- **Logging/metrics:** `prompt` in redact paths; logs keep operation, latency, status, count,
  provider request id. `workout_generator_requests_total{outcome}` and a latency histogram.
- **Web:** submit logic in a `use-generate-workout` hook separate from input components, so a
  voice transcript can feed it later. Nothing stored in localStorage or a persisted cache.

## Risks / Trade-offs

- [Model invents exercises or ignores equipment] → ids only from pre-filtered candidates,
  validation, one retry, typed error.
- [Prompt injection] → delimited user text, rules in system prompt, output validated regardless.
- [Users type health details] → UI hint, no storage, redaction, never echoed.
- [Cost or abuse] → rate limit, flag, 500-char cap.
- [Cycle-synced creep] → no cycle data reaches the generator; copy never mentions phases.
- [Image licensing] → per-exercise licence record and attribution check in tests.
- [Slow responses on mobile] → 20 s timeout, clear loading state, guided path suggested on error.

## Open Questions

- Should the guided path skip the LLM and select deterministically? Revisit after the first
  eval run (group 9).
- Does the free-text path need equipment chips, or can the model infer equipment reliably? Check
  in usability sessions.
