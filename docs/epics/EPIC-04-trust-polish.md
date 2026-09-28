# EPIC-04 — Trust + polish

Spec: [data-export-deletion](../specs/data-export-deletion.md)

## Goal
Make privacy promises verifiable and the product portfolio-ready. That means:
- export and deletion that reach every store
- redaction that tests enforce
- metrics
- a WCAG 2.2 AA pass
- Cypress coverage of the key journeys
- two rounds of usability testing, with findings acted on
- a README that tells the story

## User stories
- As a **user**, I want to download all my data in a readable format, so I know what's stored and can take it elsewhere.
- As a **user**, I want deleting my account to remove everything, including derived data, so I can leave with confidence.
- As the **developer**, I want tests that prove health data never reaches logs, so the rule survives future changes.
- As the **developer**, I want metrics for outbox and consumer lag, so I can tell when the pipeline is unhealthy.
- As a **disabled user**, I want the whole app to meet WCAG 2.2 AA, so I can use it on equal terms.
- As a **hiring manager**, I want to read a README with architecture, privacy, testing and usability findings, so I can assess the engineer's judgement quickly.

## Scope
- `GET /export` (streamed JSON) and the export UI
- `requestAccountDeletion`, transactional primary deletion, `user.deletion_requested` fan-out,
  `deletion_requests` tracking and reconciliation, and the deletion UI
- A redaction audit: pino redact paths, a GraphQL error formatter, and a log-capture test suite
- `/metrics` with prom-client: HTTP/GraphQL latency, outbox lag, consumer processed and duplicate counts
- An accessibility pass: automated axe on every route plus a manual screen-reader check
  (VoiceOver iOS, TalkBack Android)
- Cypress coverage: sign-up, log run, log strength, consent grant/withdraw, insights, export, delete
- A usability test plan and two rounds:
  - a moderated think-aloud pilot (5 participants)
  - an unmoderated remote round (task success, time on task, SEQ, SUS)
- Findings are written up and top issues fixed
- The final README, with screenshots, a demo GIF and badges

## Out of scope
- A hosting decision (a future ADR)
- A formal DPIA document. It could be a stretch item, but the privacy design section covers the essentials
- Localisation

## Acceptance criteria
- Given a user with workouts, cycle data and insights, when she exports, then the JSON contains every category listed in the spec, and nothing from the exclusion list.
- Given a user requests deletion, when the pipeline settles, then there are zero documents with her userId in every collection in the coverage checklist, except the `deleted_users` marker and the `deletion_requests` audit row. An integration test verifies this.
- Given a stale `workout.logged` arrives after deletion, when the worker processes it, then no insights are recreated.
- Given the log-capture test suite, when every mutation runs with realistic inputs, then no health field name or value appears in the captured logs.
- Given every route, when Cypress runs `checkA11y`, then there are zero serious or critical violations.
- Given the usability study, when complete, then findings are recorded with severity, and the top 3 issues are fixed or have tasks created.

## Risks
| Risk | Mitigation |
|---|---|
| A new collection is added later without deletion coverage | Coverage checklist in the spec + privacy-reviewer checklist item + an integration test that enumerates collections |
| Recruiting participants for usability testing | Draw on personal running and lifting networks. Keep sessions to 30 min. Offer a small thank-you |
| The a11y pass reveals structural issues late | ux-a11y-reviewer runs on every UI task from EPIC-01 onward, so this pass is a confirmation |

## Tasks (titles only — detail later with `task-planner`)
| ID | Title |
|---|---|
| T-04-01 | `GET /export` streamed JSON endpoint + rate limit |
| T-04-02 | Export UI in Settings → Your data |
| T-04-03 | `requestAccountDeletion` + transactional primary deletion |
| T-04-04 | Worker: handle `user.deletion_requested` + `deleted_users` marker |
| T-04-05 | Deletion tracking, completion + reconciliation job |
| T-04-06 | Deletion UI with accessible confirmation |
| T-04-07 | Deletion propagation integration test (all collections) |
| T-04-08 | Log redaction audit + log-capture test suite |
| T-04-09 | `/metrics` with prom-client (no per-user labels) |
| T-04-10 | WCAG 2.2 AA pass: automated + manual screen reader |
| T-04-11 | Cypress coverage of key journeys |
| T-04-12 | Usability test plan (`docs/research/usability-test-plan.md`) |
| T-04-13 | Moderated pilot round (5 participants) + findings |
| T-04-14 | Unmoderated remote round + findings + fixes |
| T-04-15 | Final README: screenshots, demo GIF, badges, findings summary |
