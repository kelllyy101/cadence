# Proposal: Add the AI workout builder

## Why

People training at home often know what equipment they have but not what to do with it. They
want to say *"I have two kettlebells at home, give me five leg exercises"* and get a usable
workout straight away. Natural language is the fastest way to ask, and guided questions serve
people who prefer tapping. The feature must not weaken Cadence's privacy story or drift into
cycle-synced prescriptions ([VISION](../../../docs/product/VISION.md)).

## What Changes

- A curated exercise catalogue (~40 exercises) seeded from an open-licence exercise library,
  with equipment and muscle-group tags, our own short coaching cues and **self-hosted demo
  images**.
- A `generateWorkout` mutation: free text and/or structured choices go to the Claude API
  ([ADR-0007](../../../docs/adr/0007-llm-workout-generation-claude-api.md)), which may only pick
  catalogue exercise IDs. The output is validated and mapped to catalogue entries.
- Web: a "Build a workout" entry with two paths (**Describe it** and **Answer questions**) and a
  result view with sets × reps, cues and demo images.
- A fake generator so tests never call the real API, plus a manual prompt-eval script.
- Behind the `workoutBuilder.enabled` flag.

## Capabilities

### New Capabilities
- `exercise-catalogue`: the curated set of exercises, their equipment and muscle tags, cues and
  demo media.
- `workout-builder`: turning a user's request (free text or guided answers) into a short workout
  from the catalogue.

### Modified Capabilities
- None.

## Out of scope

- Voice input (backlog; the free-text path accepts a transcript later).
- Rest breaks or timers between exercises.
- Saving a generated workout to history.
- Using cycle phase, workout history or RPE to shape suggestions.
- Embedded third-party video players.
- A local/Ollama model adapter (the interface allows it; not built).

## Impact

- `packages/domain`: catalogue data, filters, generated-workout schema and validators.
- `apps/api`: generator interface, Anthropic adapter, fake, mutation, rate limit, redaction.
- `apps/web`: builder screens; demo images in the bundle.
- `scripts/`: catalogue import script and prompt-eval script.
- New dependency: `@anthropic-ai/sdk`. New env vars: `WORKOUT_GENERATOR`, `ANTHROPIC_API_KEY`,
  `ANTHROPIC_MODEL`.
- Privacy notice names Anthropic as a processor for this feature.

## Depends on

- `setup-foundation` (all groups).
- `add-workout-logging` groups 2 (auth context), 4 (app shell) and 16 (Cypress + axe).
- `add-training-insights` group 5 (feature flags). If not done yet, group 4 here adds a minimal
  file provider and `flags` query scoped to this flag.
