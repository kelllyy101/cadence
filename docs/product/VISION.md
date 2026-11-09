# Product vision

## Problem

Women who run and lift keep training in one app and their cycle in another, so they can't ask
"is this hard session a pattern?". Training apps ignore the cycle, cycle apps ignore training,
and "cycle syncing" content turns early research into rules. Many apps also share health data.

## Target user

**"Sam", 25–40, trains 4–6×/week:** runs plus 2–3 strength sessions, logs one-handed straight
after training, curious but sceptical about cycle effects, privacy-literate. May have irregular
cycles, use hormonal contraception or be perimenopausal, so no textbook 28-day assumptions.

The founder is a target user too: useful for dogfooding, so every assumption is checked with
other people.

## Principles

1. **Privacy by default.** Cycle tracking is opt-in; collect only what's used; export or delete
   everything.
2. **Estimates, not advice.** Phase is always an estimate; never medical advice or contraception.
3. **Correlation, not causation.** Insights describe the user's own data and say "not enough
   data yet" rather than guess.
4. **One-thumb logging.** A run logs in under 15 seconds.
5. **Accessible by default.** WCAG 2.2 AA; colour never carries meaning alone.
6. **The user is the authority** on her own effort and energy ratings.
7. **AI on request, never on health data.** The
   [AI workout builder](../../openspec/changes/add-ai-workout-builder/proposal.md) suggests
   exercises from our catalogue based on equipment and focus only
   ([ADR-0007](../adr/0007-llm-workout-generation-claude-api.md)).

## Non-goals

- Medical, diagnostic, fertility or contraceptive features.
- Cycle-synced training plans. (AI suggestions are allowed: on request, never cycle-based.)
- Social features, third-party analytics, ads, or data sharing. The AI provider is the only
  processor and gets request text and equipment only.
- Native apps ([ADR-0002](../adr/0002-pwa-over-native.md)), GPS or live recording, nutrition,
  sleep or wearables.

## Success signals

- **Usability:** ≥ 80% task success logging a run and a strength session; SUS ≥ 75; median run
  log < 15 s.
- **Accessibility:** no serious or critical axe violations; full keyboard and screen-reader
  flows.
- **Trust:** testers can explain what happens to their cycle data and what a phase estimate is.
- **Engineering:** green CI; integration tests prove idempotent events and complete deletion.
