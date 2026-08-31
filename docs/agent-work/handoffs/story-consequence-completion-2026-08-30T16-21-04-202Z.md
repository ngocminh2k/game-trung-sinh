# Active claim: story-consequence-completion

- Owner: claude-story
- Claimed: 2026-08-30T14:09:10.846Z
- Objective: Complete and prove Phase 4 consequential story branches with reachable map/NPC effects.
- Scope: src/content/story.ts, src/content/locations.ts, src/content/beats-data.ts, src/engine/story.ts, test/endings.test.ts, dedicated story tests

## Acceptance criteria (recorded before implementation)

Design-review 2026-08 Phase 4 (docs/design-review-2026-08.md §Phase 4) requires:
every chapter has ≥1 choice that opens/locks a **real** map node or NPC within
the stated horizon. Reconciled acceptance IDs (design-review names vs MASTER_ACCEPTANCE):

| Design-review Phase 4 ID | MASTER_ACCEPTANCE equivalent | Meaning here |
| --- | --- | --- |
| STORY-07 (mới) | STORY-07 No soft lock (P0, §4.3) | Every valid state keeps a legal path to a terminal state; the unlocked/locked nodes never trap a run. |
| A-01 | A-01 (reducer matrix, §8) | Reducer-level proof of route states: target → arrived → encounter result → proof → later choice. |
| A-02 | A-02 (reducer matrix, §8) | Every proof read at cave, trial, and terminal epilogue. |
| A-05 | A-05 (Playwright, §8) | Proof-specific cave/trial outcomes. Reducer coverage in this claim; browser journey belongs to claude-e2e (e2e-fresh-route-repair). |
| A-01/A-02/A-05/A-06 referenced from Phase 4 | A-06 (Playwright endings) | Endings from legal play — E2E owned by claude-e2e; this claim provides reducer-level ending reachability. |

Concrete, verifiable criteria for THIS claim:

1. **AC1 — Hồi I choice unlocks a reachable route-specific lead.** From a fresh
   seed, each Hồi I choice (return_pin / study_letter / sell_pin) opens its
   Phase 4 lead at market_rumor (walk_with_meihua / decode_letter /
   sell_map_premium) and only that one; the two non-matching leads are
   unavailable. The lead's route target is a real map node reachable by legal
   moves (existing ROUTE_TARGETS behavior — proven by test, not restated).
2. **AC2 — Route-specific downstream effect at the cave (Hồi III).** At
   cave_witness, the route proof changes at least one authored, mechanically
   gated choice *per route* beyond the existing present/withhold split: each of
   the three routes enables a distinct cave action the other two cannot take.
   The unlocked cave choice must produce a real deterministic delta (flag +
   player delta), not prose alone.
3. **AC3 — Route-specific downstream effect at the sect trial (Hồi IV).** Same
   contract at sect_trial: each route proof enables one distinct trial choice
   with a deterministic delta.
4. **AC4 — Forgotten-NPC consequence stays route-specific and non-blocking.**
   When the twelfth night expires, the forgotten name derives from the Hồi I
   choice (existing forgottenNameFor behavior); with night_forgotten set, the
   affected NPC's dialogue changes and the run remains completable (no soft
   lock): every story scene keeps ≥1 available choice path to a final choice
   and a terminal ending.
5. **AC5 — Convergence proof survives.** Route + proof + forgotten combination
   changes at least two later scenes (cave, trial) and one terminal epilogue
   reading (existing endingEpilogue contract) — reducer-level tests only; the
   Playwright layer is claude-e2e's claim.

## Verification plan

- `npx vitest run test/endings.test.ts test/story-consequences.test.ts` (new
  dedicated story tests) — primary proof for AC1–AC5.
- `npx vitest run test/content.test.ts` — guard STORY_SCENES shape contract
  (6 choices at market_rumor, 3 elsewhere) still holds after edits.
- `npx vitest run test/route-proof-record.test.ts` — ROUTE-04 contract
  regression.
- `npm run typecheck` and `npm run lint`.
- Out of scope (owned elsewhere): e2e/* (claude-e2e), src/ui/*, reducer,
  src/ai/*, src/content/rpg.ts (claude-rpg).

## Handoff

- From: claude-story
- To: codex-root
- Handed off: 2026-08-30T16:21:04.203Z
- Completed or current state: Stopped mid-implementation after exceeding the one-hour budget. It recorded acceptance criteria and created or modified story-consequence work, but did not run the planned verification or handoff.
- Touched files: src/content/story.ts, src/content/locations.ts, src/content/beats-data.ts, src/engine/story.ts, test/endings.test.ts, test/story-consequences.test.ts
- Verification: No green focused-test/typecheck/lint evidence from this worker.
- Known risks or blockers: Partial story changes may be incomplete or conflict with E2E assumptions; inspect and test before accepting.
- Next action: Run a bounded 15-minute review of the current Phase 4 diff; either complete one acceptance criterion with focused tests or hand off the precise failing invariant.
