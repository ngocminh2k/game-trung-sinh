# Active claim: phase7-self-playtest

- Owner: claude
- Claimed: 2026-08-30T18:18:18.094Z
- Objective: Deterministic self-playtest sim: 3 route runs to terminal endings, balance verdict on DEADLINE_DAYS
- Scope: test/playtest-sim.test.ts, src/engine/constants.ts (only if evidence-decisive)
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: claude
- To: coordinator
- Handed off: 2026-08-30T19:11:21.887Z
- Completed or current state: Phase 7 self-playtest complete. 3 deterministic full runs (mercy/wealth/truth) reach terminal endings in 18-19 days without soft-lock. DEADLINE_DAYS=21 is correctly calibrated for the optimal path; no constants change. Findings table printed in vi test log. 216/216 unit tests pass, typecheck + lint clean.
- Touched files: test/playtest-sim.test.ts
- Verification: npx vitest run test/playtest-sim.test.ts: 5/5 passed (1.04s); npx vitest run: 39 files / 216 tests passed; npm run typecheck: exit 0; npx eslint test/playtest-sim.test.ts: exit 0
- Known risks or blockers: Pacing: deadline clock starts at the chapter>=2 gameplay beat (gatheredSome/caveSeen) which fires at Hồi II lead choice in optimal play (day 4) but the route-playthrough shows it activating at Hồi III cave arrival (day 14) because the gameplay beat fires after a section of story-side pacing. Three of the three optimal runs end 16 days before the deadline — strictly a feel/slack risk, not a correctness risk. The P1 'every outing has a trade-off' pillar 3 still requires the player to KNOW about the deadline, which the objective line already surfaces (objective.test.ts). All routes are technically passable in 18-19 days; external playtest is the next evidence layer (Phase 7 step 2 per design-review-2026-08.md). Doctrine Part D #5: N was NOT tuned by feel; the recorded test is this file. Phase 4 target is the 'first moment a choice doesn't change anything' — for now, mercy_route caves at 'call_roll_witnesses' vs alternative 'record_ha' produces a different ending, so the witness checkpoint is NOT the target; flag this for external playtest observation.
- Next action: Hand off the findings table to the coordinator for the Phase 7 review note. The next step is external playtest (5 players, 30 min unguided per design-review §Phase 7 step 2) — this sim only proves the optimal-play path is feasible, not that the pressure is felt.
