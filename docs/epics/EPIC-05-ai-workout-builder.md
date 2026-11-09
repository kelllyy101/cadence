# EPIC-05 — AI workout builder

Spec: [ai-workout-builder](../specs/ai-workout-builder.md) · ADR: [0007](../adr/0007-llm-workout-generation-claude-api.md)

## Goal
A signed-in user can describe what equipment they have at home and what they want to train, in
plain language or by answering a few quick questions. They get a short workout back: exercises
from Cadence's catalogue, with sets, reps and a demo video link.

## User stories
- As someone **training at home**, I want to type "I have two kettlebells, give me five leg
  exercises", so I get a usable workout without searching.
- As someone who **prefers tapping to typing**, I want to answer "what do you have / what do you
  want to train / how many exercises", so I can build a workout one-handed.
- As a **user**, I want to see sets and reps and a demo video for each exercise, so I know what
  to do and how.
- As a **privacy-conscious user**, I want to know what's sent to the AI and that it isn't
  stored, so I can trust the feature.
- As a **screen-reader or keyboard user**, I want both paths and the result to be fully
  operable and announced, so I can use the feature independently.
- As the **developer**, I want the AI behind an interface with a fake, so tests are fast,
  free and deterministic.

## Scope
- Domain: exercise catalogue (~40 exercises), equipment/muscle-group types, filtering and
  selection validation
- API:
  - `WorkoutGenerator` interface, with an Anthropic adapter and a fake
  - `generateWorkout` mutation with zod validation, rate limit, typed errors and log redaction
- Web:
  - a Build-a-workout entry
  - a free-text path
  - a guided-questions path
  - a result view
  - all behind `workoutBuilder.enabled`
- E2E + axe for both paths, and a manual prompt-eval script

## Out of scope
- **Voice input.** It's in the [backlog](BACKLOG.md). The free-text path is built so a
  transcript can feed it later.
- Rest breaks or timers between exercises
- Saving a generated workout to history or logging it as done
- Using cycle phase, workout history or RPE to shape suggestions
- Embedded video players
- A local/Ollama model adapter (allowed by the interface, but not built)

## Acceptance criteria
- Given a signed-in user with the flag on, when they submit "I have two kettlebells at home,
  give me five leg exercises", then they see 5 leg exercises that use only a kettlebell or
  bodyweight. Each has sets × reps and a demo link.
- Given the guided path, when the user picks dumbbell + step, legs and 4 exercises, then they
  see 4 leg exercises using only those items or bodyweight.
- Given a request like "write me a poem", when it's submitted, then the user sees the
  off-topic message and no workout.
- Given the model returns an unknown exercise ID twice, when the request finishes, then the
  user sees "Couldn't build a workout right now" and nothing invented is shown.
- Given any request, when the API logs it, then the prompt text does not appear in the logs.
- Given the API runs with `WORKOUT_GENERATOR=fake`, when the E2E suite runs, then no request
  goes to the Claude API.
- Given every screen state (entry, each step, loading, result, error), when axe runs, then
  there are no serious or critical violations.
- Given a keyboard-only user, when they complete either path, then focus moves sensibly
  (to step legends, then to the result heading) with a visible focus indicator.

## Risks
| Risk | Mitigation |
|---|---|
| Model invents exercises or ignores the equipment | Model returns IDs only, from a pre-filtered candidate list. zod + `isValidSelection`, one retry, then a typed error |
| Prompt injection ("ignore your rules…") | User text is delimited, the rules are in the system prompt, and output is validated against the catalogue whatever the text says |
| Users type health details | UI hint, prompts are never stored, redacted from logs, not echoed in errors |
| Cost or abuse | Per-user rate limit, feature flag, 500-char cap |
| "Cycle-synced prescription" creep | No cycle data reaches the generator. Copy never mentions phases. VISION updated |
| Video licensing and trackers | Link-out only. The source is decided in T-05-01 (spec open question) |
| Slow responses on mobile | 20 s timeout, clear loading state, guided path suggested as a fallback in the error copy |

## Dependencies
- EPIC-00 (monorepo, domain package, API, web, compose)
- T-01-02 (GraphQL auth context) and T-01-04 (app shell + bottom nav)
- T-03-05 (OpenFeature provider). If EPIC-05 starts first, T-05-04 adds the minimal provider
  and the `flags` query instead.

## Tasks
Full task files are in [docs/tasks/EPIC-05/](../tasks/EPIC-05/).

| ID | Title |
|---|---|
| T-05-01 | [Domain: exercise catalogue + equipment types](../tasks/EPIC-05/T-05-01-domain-exercise-catalogue.md) |
| T-05-02 | [Domain: generated-workout schema + selection validator](../tasks/EPIC-05/T-05-02-domain-generated-workout-schema.md) |
| T-05-03 | [API: `WorkoutGenerator` interface, Anthropic adapter + fake](../tasks/EPIC-05/T-05-03-api-workout-generator-adapter.md) |
| T-05-04 | [API: `generateWorkout` mutation](../tasks/EPIC-05/T-05-04-api-generate-workout-mutation.md) |
| T-05-05 | [Web: Build-a-workout entry + free-text path](../tasks/EPIC-05/T-05-05-web-free-text-path.md) |
| T-05-06 | [Web: guided-questions path](../tasks/EPIC-05/T-05-06-web-guided-questions-path.md) |
| T-05-07 | [Web: result view](../tasks/EPIC-05/T-05-07-web-result-view.md) |
| T-05-08 | [E2E + axe for both paths](../tasks/EPIC-05/T-05-08-e2e-workout-builder.md) |
| T-05-09 | [Manual prompt-eval script](../tasks/EPIC-05/T-05-09-prompt-eval-script.md) |
