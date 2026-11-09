# 0007. Workout generation via the Claude API

- Status: Proposed
- Date: 2026-11-09

## Context

The [AI workout builder](../../openspec/changes/add-ai-workout-builder/proposal.md) turns
requests like *"two kettlebells, five leg exercises"* into a structured workout. That needs a
model that reliably produces schema-valid JSON, without weakening the privacy promises
([VISION](../product/VISION.md)) or local-first setup
([ADR-0006](0006-local-first-hosting-docker-compose.md)).

## Decision

- Call the **Claude API** server-side via `@anthropic-ai/sdk`; the browser never sees the key.
- Behind a `WorkoutGenerator` interface with a deterministic fake for tests and offline dev
  (`WORKOUT_GENERATOR=anthropic|fake`).
- **Structured output**, re-validated with zod. The model only picks catalogue IDs; names, cues
  and media come from our catalogue.
- Model `claude-sonnet-5-5`, overridable via `ANTHROPIC_MODEL`.
- **Minimal data:** send request text, equipment/focus/count and candidates only. No IDs,
  history or cycle data. Nothing stored; prompts redacted from logs.
- Anthropic is disclosed as a processor for this feature.

## Alternatives

- **Local model (Ollama):** most private, but heavy on a laptop and less reliable at JSON. The
  interface leaves room for it later.
- **Both from day one:** doubles the work before the feature is proven.
- **Rules, no LLM:** can't handle real language; may still serve the guided path.
- **Browser calls the provider:** exposes the key and skips auth and redaction.

## Consequences

- ➕ Reliable text-to-JSON with little code; CI never calls the provider.
- ➖ First external processor; users may still type health details (mitigated by UI copy,
  redaction and no storage).
- ➖ Per-request cost: rate limit, feature flag, 500-character cap.
- ➖ Model misbehaviour: catalogue-only IDs, validation, one retry, typed error.
