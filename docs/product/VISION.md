# Product vision — Cadence

## Problem

Women who both run and lift usually keep their training in one app and their cycle in another,
if they track it at all. When a session feels unexpectedly hard or easy, there is no easy way to
ask "is this a pattern?". Current options fall short in a few ways:

- **Training apps** ignore the cycle entirely, or bolt it on with generic advice.
- **Cycle apps** know nothing about training load, pace or perceived effort.
- **"Cycle syncing" content** often overclaims. It presents population averages and early research
  as rules ("never PR in your luteal phase"). This can make people distrust their own experience.
- **Privacy is a real worry.** Cycle data is sensitive. Many apps share data with third parties,
  and people are right to be careful about where it goes.

## Target user

**Primary persona: "Sam", 25–40, trains 4–6×/week.**
- Mixes running (easy runs, a weekly long run, an occasional race) with 2–3 strength sessions.
- Logs workouts on her phone, often straight after a session, sweaty, with one hand.
- Is curious whether her energy and effort follow her cycle, and sceptical of blanket rules.
- Is privacy-literate. She reads consent screens and would uninstall an app that shares health data.
- May have irregular cycles, use hormonal contraception, or be perimenopausal. The app must not
  assume a textbook 28-day cycle.

The founder is also the target user. That's useful for dogfooding, but it's a bias, so every
assumption gets checked in usability sessions with other people.

## Principles

1. **Privacy by default.** Cycle tracking is off until the user explicitly opts in. We collect only
   what a feature uses. There is no third-party analytics. Users can export or delete everything.
2. **Estimates, not advice.** Phase is always labelled as an estimate. Cadence is never medical
   advice and never contraception.
3. **Correlation, not causation.** Insights describe what the user's own data shows ("your
   average RPE was higher in these weeks"). They never say why, and they show "not enough data
   yet" rather than a weak conclusion.
4. **One-thumb logging.** Logging a run should take under 15 seconds on a phone. It needs large
   touch targets, sensible defaults and minimal typing.
5. **Accessible by default.** WCAG 2.2 AA. Every chart has a table alternative, and colour is never
   the only way information is shown.
6. **The user's experience is the authority.** Energy and RPE are the user's own subjective
   ratings. The app reflects them back and doesn't judge them.
7. **AI on request, never on health data.** The AI workout builder
   ([EPIC-05](../epics/EPIC-05-ai-workout-builder.md)) only acts when the user asks. It works
   only from what they tell it (equipment, focus) and only picks exercises from Cadence's own
   catalogue. It never sees cycle data or workout history.

## AI workout builder

Users can say what equipment they have at home and what they want to train, by typing (voice
later) or by answering a few questions. They get a short workout back: catalogue exercises
with sets, reps and a demo link. These are **user-requested suggestions**, not a training
plan, and they never change with cycle phase. See the
[spec](../specs/ai-workout-builder.md) and
[ADR-0007](../adr/0007-llm-workout-generation-claude-api.md).

## Non-goals

- Medical, diagnostic or fertility/contraceptive functionality. This includes ovulation
  prediction for conception or avoidance.
- Prescriptive "cycle-synced" training plans (the MVP scope and messaging stay descriptive).
  The AI workout builder is in scope because it gives on-request suggestions based only on the
  user's equipment and focus, never on their cycle.
- Social features: feeds, followers, leaderboards, sharing.
- Third-party analytics, ad SDKs, data sale or sharing. The only external processor is the AI
  provider for the workout builder ([ADR-0007](../adr/0007-llm-workout-generation-claude-api.md)).
  It receives only the user's request text and equipment, and nothing is stored.
- Native iOS/Android apps (see [ADR-0002](../adr/0002-pwa-over-native.md)).
- GPS tracking or live workout recording. Cadence logs workouts after the fact.
- Nutrition, sleep or wearable integrations in the MVP.

## Success signals

- **Usability:** in testing, ≥ 80% task success logging a run and a strength session without
  help. SUS ≥ 75. Median time to log a run < 15 s after one practice attempt.
- **Accessibility:** zero serious or critical axe violations on key journeys. Full keyboard and
  screen-reader flows work for logging and viewing insights.
- **Trust:** participants can correctly explain what happens to their cycle data, and what the
  phase estimate is and is not. Measured with a comprehension check in usability sessions.
- **Engineering:** CI passes on every PR. The integration suite shows idempotent event handling
  and complete deletion propagation.
