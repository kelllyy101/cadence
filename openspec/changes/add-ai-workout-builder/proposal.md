# Proposal: Add the AI workout builder

## Why

People training at home know their equipment but not what to do with it. They want to say
*"two kettlebells, five leg exercises"* and get a usable workout, or tap through a few
questions. It must not weaken privacy or become cycle-synced advice
([VISION](../../../docs/product/VISION.md)).

## What Changes

- A curated catalogue (~40 exercises) from an open-licence library, with equipment and muscle
  tags, our own cues and self-hosted demo images.
- `generateWorkout`: text and/or choices go to the Claude API
  ([ADR-0007](../../../docs/adr/0007-llm-workout-generation-claude-api.md)), which may only pick
  catalogue IDs; output is validated and mapped to catalogue entries.
- Web: **Describe it** and **Answer questions** paths, and a result view.
- A fake generator for tests, and a manual prompt-eval script.
- Behind `workoutBuilder.enabled`.

## Capabilities

### New Capabilities
- `exercise-catalogue`: curated exercises, tags, cues and demo media.
- `workout-builder`: turning a request into a short workout from the catalogue.

### Modified Capabilities
- None.

## Out of scope

Voice input, rest timers, saving workouts, cycle- or history-based suggestions, embedded video,
local LLM.

## Impact

Domain catalogue and validators; API generator, mutation, rate limit, redaction; web builder
screens and images; import and eval scripts. New: `@anthropic-ai/sdk`, env `WORKOUT_GENERATOR`,
`ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`. Privacy notice names Anthropic.

## Depends on

`setup-foundation`; `add-workout-logging` groups 3, 5, 17; `add-training-insights` group 5 (or
group 4 here adds a minimal flag provider).
