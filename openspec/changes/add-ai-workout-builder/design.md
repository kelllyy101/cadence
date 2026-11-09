# Design: Add the AI workout builder

## Context

[ADR-0007](../../../docs/adr/0007-llm-workout-generation-claude-api.md): Claude API server-side,
behind an interface with a fake. Requirements in `specs/`.

## Goals / Non-Goals

**Goals:** the model can't invent exercises; CI never calls the provider; the free-text path
can take a voice transcript later unchanged.

**Non-Goals:** persistence, rest timers, cycle-aware suggestions, local LLM.

## Decisions

- **Catalogue source:** [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
  (Unlicense; ~800 exercises with equipment, muscles, images). `scripts/import-exercises.ts`
  copies ~40 entries into `packages/domain/src/exercises/catalogue.ts` and their images into
  `apps/web/public/exercises/`. We write our own cues and record each licence. wger (CC-BY-SA)
  is the fallback for videos. Self-hosting means no third-party requests.
- **Catalogue type:**
  ```ts
  type Equipment = 'bodyweight' | 'dumbbell' | 'kettlebell' | 'resistance_band' | 'step' | 'bench' | 'mat' | 'pull_up_bar';
  type MuscleGroup = 'legs' | 'glutes' | 'upper_body' | 'core' | 'full_body';
  interface CatalogueExercise {
    id: string; name: string; equipment: Equipment[]; muscleGroups: MuscleGroup[];
    measure: 'reps' | 'seconds'; cue: string;
    media: { images: string[]; alt: string };
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
- **Server flow:** auth → flag → zod input (prompt 1–500 or focus; count 3–8) → rate limit
  10/user/hour (in memory) → candidates via `filterByEquipment` → `WorkoutGenerator.generate()`
  → validate the draft with zod + `isValidSelection` → one retry with the reason → map IDs to
  catalogue entries. Nothing persisted.
- **Model draft:** `{ status: 'ok'|'unclear'|'off_topic', title ≤ 60, equipmentUsed[],
  exercises[{ id, sets, reps?, seconds? }] }`.
- **Adapter:** structured output from the draft's JSON Schema; rules in the system prompt; user
  text delimited; 20 s timeout; one retry on 5xx/timeout. `ANTHROPIC_MODEL` defaults to
  `claude-sonnet-5-5`.
- **Fake:** deterministic; returns `off_topic` for trigger words (e.g. "poem"), else the first
  N matching candidates.
- **Logs/metrics:** `prompt` redacted; log operation, latency, status, count, provider request
  ID. `workout_generator_requests_total{outcome}` plus a latency histogram.
- **Web:** a `use-generate-workout` hook separate from the inputs; nothing in localStorage.

## Risks / Trade-offs

- [Invented exercises] → IDs from pre-filtered candidates, validation, retry, typed error.
- [Prompt injection] → delimited text; output validated regardless.
- [Health details typed] → UI hint, no storage, redaction.
- [Cost/abuse] → rate limit, flag, 500-char cap.
- [Cycle-synced creep] → no cycle data reaches the generator.
- [Image licensing] → per-exercise licence, checked in tests.
- [Slow on mobile] → timeout, loading state, guided path suggested on error.

## Open Questions

- Should the guided path skip the LLM? Decide after the first eval (group 9).
- Can the model infer equipment without chips? Check in usability sessions.
