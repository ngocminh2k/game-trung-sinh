# Active claim: expansion-x20-t04-quest-expansion

- Owner: cline
- Claimed: 2026-08-31T16:38:10.737Z
- Objective: T04 quest expansion 25->150 with q_mkt_08/q_lak_02 reconciliation
- Scope: src/content/quests.ts
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: cline
- To: t12-integration
- Handed off: 2026-08-31T16:44:39.466Z
- Completed or current state: T04 DONE: 150/150 quests in src/content/quests.ts. STEP0 reconciliation: q_mkt_08 completeItems crooked_circulation (technique id, not item) -> old_manual; q_lak_02 tide_breath -> tide_breath_manual; validateAllContent QUESTS errors now zero. Preserved all valid partial work from prior claude run (124 quests incl 4 main chained, 50 side, 16 secret, 15 timed, find_01..14). Added 26: q_find_15..25 (secret:true, completeNpcTalk targets the remaining 11 registry NPCs: quang,cuu,tra,han,duong,sa,trang,cau,tin,vien,oanh) and q_aff_01..15 (3-quest chains x 5 core NPC meihua/ngo/bao/vo/bach). Affinity gates use aff_n_<npcId> flags (set by doTalk in reducer, numeric >=1 truthy) + quest_<id>_done chaining for ladder; T12 may swap to aff_gate_<npc> thresholds per T12 doc item 7. All new quests: >=2 steps, last step turnIn helper, rewardGold 10-45, requiredItems:{} declared, bilingual Vi/En pairs, aliases >=2. 60/60 registry NPC ids have >=1 giver quest.
- Touched files: src/content/quests.ts
- Verification: Select-String count { id: 'q_: 150; Group-Object duplicate audit: none; giverNpcId unique count: 60/60; completeNpcTalk refs: all resolve to real NPCs; npx eslint src/content/quests.ts: clean; npm run typecheck: BLOCKED by untracked partial src/content/shops.ts(262,1) TS1005 from T11 (outside T04 scope); npx vitest run test/content.test.ts: 10 passed 5 failed, all 5 are expected gate failures (NPC 40 vs 60, chapters 6 vs 8, endings 11 vs 12, scenes 9 vs 15, T08 hidden_manual items missing) - zero quest-related failures, validateAllContent error list contains no QUESTS: entries
- Known risks or blockers: npm run typecheck and npm run lint repo-wide stay red until T11 finishes/repairs src/content/shops.ts and T12 raises gates; affinity ladder currently opens after first talk (aff_n_* truthy at >=1) until T12 sets aff_gate threshold flags; 9 hidden_manual technique source items still missing from items.ts (T08/T07 debt, already flagged in W1 dispatch)
- Next action: T12 raises quests gate min(150), then per T12 doc: raise npc/chapter/ending gates, wire system panel/economy/weather/companion/memory, and set aff_gate_<npc> flags at aff 3/6/9 in doTalk
