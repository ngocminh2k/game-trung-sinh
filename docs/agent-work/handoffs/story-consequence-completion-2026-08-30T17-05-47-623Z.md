# Active claim: story-consequence-completion

- Owner: claude
- Claimed: 2026-08-30T16:44:35.683Z
- Objective: Complete and verify Phase 4 route-proof story consequences.
- Scope: src/content/story.ts, src/content/locations.ts, src/content/beats-data.ts, src/engine/story.ts, test/story-consequences.test.ts, test/endings.test.ts, docs/agent-work
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: claude
- To: codex-root
- Handed off: 2026-08-30T17:05:47.624Z
- Completed or current state: Phase 4 story consequences complete. AC1 done: each Hoi I choice gates exactly one market_rumor lead (walk_with_meihua/sell_map_premium/decode_letter); test proves the lead's route target is a real, navigable location. AC2 done: cave_witness gains one proof-gated choice per route (call_roll_witnesses/redeem_bao_ward/name_the_eighth) with flag+playerDelta effects; each is locked for the other two routes. AC3 done: sect_trial gains let_roll_testify/settle_ward_debt/restore_eighth_name under the same contract. AC4 done: fixed the failing forgotten-name test — night_deadline is started by the Phase 2 beat clock (chapter>=2 via applyNightDeadline in reducer), not by story choices, so the test now walks to herb_field and gathers until the countdown appears, then asserts night_forgotten_name derives per route (village/bao/meihua) with run still alive and non-terminal; no-softlock snapshot test extended to mercy+wealth proofs. AC5 already satisfied by prior work (ROUTE_PROOF_TIP in engine/story.ts tips cave_witness/sect_trial in the route's own currency; endingEpilogue reads storyRouteProof; covered by route-proof-record.test.ts). Also updated the stale scene-shape guards in test/content.test.ts and test/i18n.test.ts (3-elsewhere is now 6 at market_rumor/cave_witness/sect_trial). locations.ts and beats-data.ts needed no changes.
- Touched files: src/content/story.ts, src/engine/story.ts, test/story-consequences.test.ts, test/content.test.ts, test/i18n.test.ts, test/endings.test.ts
- Verification: npx vitest run test/story-consequences.test.ts test/endings.test.ts test/content.test.ts test/route-proof-record.test.ts: 30/30 pass. npx vitest run test/i18n.test.ts: 8/8 pass. npm run typecheck: exit 0. npm run lint: only 2 pre-existing errors in e2e/fresh-endings.spec.ts (claude-e2e's file, combatDefend/combatRetreat unused). Full suite: 190/195 pass; 5 failures all in other agents' concurrent files (ai-ui.test.tsx x4 with GameScreen.tsx SuggestionResult, rpg-systems.test.ts x1 with src/content/rpg.ts).
- Known risks or blockers: Full-suite failures in ai-ui.test.tsx and rpg-systems.test.ts are concurrent work by claude-ai and claude-rpg, not Phase 4. The tip+deltas in engine/story.ts ROUTE_PROOF_TIP apply to every choice at cave_witness/sect_trial including the new route-gated ones, so a route-proofed player gets tip+choice deltas stacked; accepted as designed (proof tips in route currency), but balance may want playtesting per design-review Phase 7. Story-choice effects use requires {story_route_proof: 'mercy'|'wealth'|'truth'}; that flag is only set by doResolveRouteEvent in reducer (owned elsewhere) — if the reducer's flag name changes, these six choices go dark.
- Next action: Playtest balance of route-proof deltas (design-review Phase 7), then close STORY-07/A-01/A-02 in MASTER_ACCEPTANCE once claude-e2e finishes e2e-fresh-route-repair.
