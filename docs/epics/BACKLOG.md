# Backlog (stretch)

These items are **not scheduled** and have no tasks. Promote an item to an epic (with a spec
and an ADR where relevant) before any work starts.

| Item | Notes / open questions |
|---|---|
| Training plans | Must stay descriptive, not "cycle-synced" prescriptions (see [VISION non-goals](../product/VISION.md#non-goals)). |
| Strava import (OAuth + webhooks) | Needs a Strava API app, token storage (encrypted), webhook verification, and dedupe against manual logs. Strava becomes a data source, so the privacy notice needs updating. |
| Offline logging queue | Queue mutations in IndexedDB when offline, with a client-generated idempotency key and conflict handling. Must not persist health data longer than needed. |
| App-level encryption of cycle fields | Field-level encryption (e.g. Mongo CSFLE/Queryable Encryption, or envelope encryption in the app). Needs key management, which ties into the hosting decision. |
| Helm chart on k3s | Charts for api, relay, worker and web. Mongo and Kafka as operators or external services. Follows the hosting ADR. |
| GraphQL depth/complexity limits | Required before any public deployment ([ADR-0003](../adr/0003-schema-first-graphql-codegen.md)). |
| Passkeys / OAuth sign-in | Better Auth plugins. No data-model change expected. |
| DPIA document | A formal Data Protection Impact Assessment for Art. 9 processing. Should also cover the AI provider (EPIC-05). |
| Voice input for the workout builder | Speak the request instead of typing it. Prefer server-side transcription (e.g. a local Whisper container) over the browser Web Speech API, which sends audio to Google on Chrome. The transcript feeds the existing free-text path ([EPIC-05](EPIC-05-ai-workout-builder.md)). |
| Rest breaks / timers in generated workouts | Add rest periods between sets and exercises, with an accessible countdown timer (screen-reader announcements, no colour-only cues). |
| Save a generated workout to the log | Turn a generated workout into a strength session. Needs a spec update: it would then be stored, exported and deleted like other workouts. |
| Local LLM adapter (Ollama) | A second `WorkoutGenerator` implementation so no data leaves the machine ([ADR-0007](../adr/0007-llm-workout-generation-claude-api.md)). |
