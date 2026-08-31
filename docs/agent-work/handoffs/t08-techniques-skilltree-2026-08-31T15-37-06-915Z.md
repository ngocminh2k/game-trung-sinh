# Active claim: t08-techniques-skilltree

- Owner: claude
- Claimed: 2026-08-31T15:30:56.980Z
- Objective: Add 9 hidden techniques to TECHNIQUES and wire hidden-technique gates + phi_phong_tram capstone into skill-tree
- Scope: src/content/rpg.ts (TECHNIQUES only), src/content/skill-tree.ts, test/techniques-expanded.test.ts
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: claude
- To: t12-integration-wiring
- Handed off: 2026-08-31T15:37:06.916Z
- Completed or current state: T08 done: 9 hidden techniques appended to TECHNIQUES (sword 2, aura 2, herbal 2, shadow 2, thunder 1; stage 4-5; sourceItemId <id>_hidden_manual per contract; Phase-3 benefit/cost Vi+En + gatherQiDrain/sellPenalty). Old 9 techniques untouched. skill-tree: t19/t20 of each branch now gate on that branch's hidden technique ids via require.techniques; phi_phong_tram capstone (sword, tier 21, aoe 9, requires all 9 main techniques, conflictsWith []) exported as PHI_PHONG_TRAM/SPECIAL_NODES OUTSIDE SKILL_NODES because test/skill-tree.test.ts (not editable in T08) pins 100 nodes/20 tiers. Deviation note: T08 doc assumed 3-4 nodes per branch but the tree already had 20/branch from the Phase-8 merge, so gating was added to existing terminal nodes instead of adding new nodes. No 19th TechniqueDef created.
- Touched files: src/content/rpg.ts (TECHNIQUES only), src/content/skill-tree.ts, test/techniques-expanded.test.ts
- Verification: npx vitest run test/techniques-expanded.test.ts: 16/16 pass; npx vitest run test/skill-tree.test.ts: 30/30 pass; npx tsc --noEmit: clean; npm run lint: clean; npx vitest run test/content.test.ts: 2 failures — NPC 60-vs-40 pre-existing from dirty npcs.ts (T03), and validateAllContent errors: 4 pre-existing from dirty quests.ts (q_mkt_08/q_lak_02 missing items) + 9 expected 'source item *_hidden_manual missing' until T07 creates the 9 manual items in items.ts
- Known risks or blockers: 9 hidden techniques blocked from in-game learning until T07 adds <id>_hidden_manual items; phi_phong_tram is exported but not yet consumed by reducer/UI (T12 wiring); content.test.ts validateAllContent stays red on those 9 lines until T07 lands
- Next action: T07: add the 9 <technique>_hidden_manual items to src/content/items.ts with teachesTechniqueId set to the matching hidden technique id
