# Tasks

## 1. `GET /export` streamed JSON (T-04-01)

- [ ] 1.1 Implement the streamed, versioned export with exclusions, headers and a 5/hour rate limit. Verify an integration test checks every category, empty-array keys and no secrets

## 2. Export UI (T-04-02)

- [ ] 2.1 Add Settings → Your data → "Download my data". Verify the file downloads with the dated name and axe passes

## 3. `requestAccountDeletion` + primary deletion (T-04-03)

- [ ] 3.1 Implement the transactional primary deletion, tombstone, outbox handling and session revocation. Verify wrong confirmation is rejected and a second request returns the pending one

## 4. Worker deletion handler (T-04-04)

- [ ] 4.1 Handle `user.deletion_requested` (delete insights and processed events, write `deleted_users`, record completion) and skip stale events for deleted users. Verify unit tests including the stale `workout.logged` case

## 5. Deletion tracking + reconciliation (T-04-05)

- [ ] 5.1 Complete requests when all consumers finish (remove tombstone and consents, 30-day TTL) and add the 24 h reconciliation job. Verify with an injected clock

## 6. Deletion UI (T-04-06)

- [ ] 6.1 Build the confirmation screen (what's deleted, export suggestion, type DELETE, honest timing copy). Verify focus management, non-colour destructive styling and axe

## 7. Deletion propagation integration test (T-04-07)

- [ ] 7.1 Add the end-to-end deletion test that enumerates every collection. Verify it fails when a userId-bearing collection is not covered

## 8. Log redaction audit (T-04-08)

- [ ] 8.1 Audit redact paths and add the production error formatter. Verify unexpected errors are masked
- [ ] 8.2 Add the log-capture suite running every mutation (incl. `generateWorkout`) with synthetic inputs. Verify no health values, notes, prompts or emails appear

## 9. `/metrics` (T-04-09)

- [ ] 9.1 Add prom-client metrics for operations, outbox lag, consumer counts and pending deletions (ask first). Verify a test scrapes `/metrics` and finds no per-user labels

## 10. WCAG 2.2 AA pass (T-04-10)

- [ ] 10.1 Run axe on every route and a manual VoiceOver (iOS) and TalkBack (Android) pass. Verify findings are recorded and fixed or ticketed

## 11. Cypress coverage of key journeys (T-04-11)

- [ ] 11.1 Cover sign-up, log run, log strength, consent grant/withdraw, insights, export, delete and the AI workout builder. Verify `pnpm e2e` passes with `checkA11y` on every visit

## 12. Usability test plan (T-04-12)

- [ ] 12.1 Write `docs/research/usability-test-plan.md` (tasks, metrics, comprehension checks, consent for participants). Verify it covers every key journey

## 13. Moderated pilot round (T-04-13)

- [ ] 13.1 Run 5 moderated think-aloud sessions and record findings with severity. Verify findings are written up

## 14. Unmoderated remote round + fixes (T-04-14)

- [ ] 14.1 Run the unmoderated round (task success, time on task, SEQ, SUS) and fix the top 3 issues or create tasks. Verify metrics against VISION success signals

## 15. Final README (T-04-15)

- [ ] 15.1 Add screenshots, a demo GIF, badges and the findings summary. Verify every README command and link works

## Workflow follow-up

- Archive this change once every group is merged and the spec scenarios pass.
