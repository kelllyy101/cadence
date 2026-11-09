# Backlog

Not scheduled. Turn an item into an OpenSpec change (`/opsx:propose`) before starting.

| Item | Notes |
|---|---|
| Training plans | Descriptive only, never cycle-synced ([non-goals](VISION.md#non-goals)). |
| Strava import | OAuth, encrypted tokens, webhooks, dedupe; privacy notice update. |
| Offline logging | IndexedDB queue with idempotency keys; keep health data briefly. |
| Encrypt cycle fields | Field-level encryption; needs key management (hosting ADR). |
| Helm chart on k3s | After the hosting ADR. |
| GraphQL depth limits | Required before public deployment ([ADR-0003](../adr/0003-schema-first-graphql-codegen.md)). |
| Passkeys / OAuth | Better Auth plugins. |
| DPIA | Formal impact assessment, including the AI provider. |
| Voice input (AI builder) | Server-side transcription (e.g. local Whisper), not the browser API that sends audio to Google. |
| Rest timers (AI builder) | Accessible countdown between sets. |
| Save generated workout | Becomes stored data: export and deletion apply. |
| Local LLM adapter | Ollama behind `WorkoutGenerator` ([ADR-0007](../adr/0007-llm-workout-generation-claude-api.md)). |
