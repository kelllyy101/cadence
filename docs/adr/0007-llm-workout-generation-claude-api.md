# 0007. Natural-language workout generation via the Claude API

- Status: Proposed
- Date: 2026-11-09

## Context

EPIC-05 adds an AI workout builder. A user types (and later speaks) a request like *"I have
two kettlebells at home, give me five leg exercises"*, and gets a structured workout back. This
needs a language model that reliably turns free text into JSON that matches our schema.

Forces:
- **Privacy is a core product value.** The vision promises no third-party analytics or data
  sharing, and minimal processors ([VISION](../product/VISION.md)).
- **Local-first:** everything must run with `docker compose up`
  ([ADR-0006](0006-local-first-hosting-docker-compose.md)).
- **Reliability:** the output must validate against a strict schema and use catalogue IDs only.
- **Portfolio value:** a clean, testable LLM integration is worth showing. So are honest
  trade-offs.

## Decision

- Call the **Claude API** server-side from `apps/api` through the official `@anthropic-ai/sdk`.
  The browser never talks to the provider and never sees the key.
- Hide it behind a `WorkoutGenerator` interface with two implementations: `AnthropicWorkoutGenerator`
  and `FakeWorkoutGenerator` (deterministic, for tests, E2E and offline dev). Choose with the
  `WORKOUT_GENERATOR` env var.
- Use **structured output** (a JSON schema) and validate the result again with zod. The model
  chooses only from catalogue IDs we send it. Names, cues and video URLs always come from our
  catalogue.
- Default model: `claude-sonnet-5-5`, overridable with `ANTHROPIC_MODEL`.
- **Data minimisation:**
  - Send only the prompt text, the equipment/focus/count and the candidate exercises.
  - Never send identifiers, history or cycle data.
  - Don't persist prompts or results.
  - Redact prompts from logs.
- Anthropic becomes a named **processor** for this feature only. This is disclosed in the
  privacy notice and next to the input.

## Alternatives considered

- **Local model via Ollama in docker compose:** nothing leaves the machine, which fits the
  privacy story best. But it's a heavy container for a laptop dev setup, its schema-following
  is less reliable, and responses on CPU are slow. The `WorkoutGenerator` interface keeps this
  open as a later adapter.
- **Pluggable from day one (Claude + Ollama):** more flexible, but it doubles the integration
  and eval work before we know the feature is useful. The interface already allows it, so it's
  deferred.
- **No LLM: rule-based parsing plus deterministic selection:** cheap and private, but it can't
  handle real natural language ("2 kbs and a step, quick leg thing"). The guided-questions path
  may still use this later (open question in the spec).
- **Calling the provider from the browser:** it exposes the API key and bypasses our auth,
  rate limits and redaction. Rejected.

## Consequences

- ➕ Reliable natural-language → JSON with little code, and a clear, testable boundary.
- ➕ CI never depends on the provider (the fake generator), so there are no flaky or costly
  tests.
- ➖ It's the first external processor. Users may type health details anyway: we mitigate with
  UI copy, redaction and non-storage, but can't fully prevent it.
- ➖ It costs money per request and the feature needs network access. Mitigations: a per-user
  rate limit, the feature flag `workoutBuilder.enabled`, and short prompts.
- ➖ The model can misbehave (off-topic, prompt injection). Mitigations: catalogue-only IDs,
  zod validation, one retry, then a typed error.
- **Follow-up:**
  - Add `@anthropic-ai/sdk` in T-05-03, asking at that point per the project rules.
  - Add the `ANTHROPIC_*` vars to `.env.example`.
  - Update the privacy notice.
  - Add a DPIA note (backlog) if the project goes public.
