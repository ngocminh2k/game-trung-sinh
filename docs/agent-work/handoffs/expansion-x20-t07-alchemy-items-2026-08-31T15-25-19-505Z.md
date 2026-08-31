# Active claim: expansion-x20-t07-alchemy-items

- Owner: codex
- Claimed: 2026-08-31T15:14:06.107Z
- Objective: Add 43 alchemy/economy items, 12 hybrid refinement recipes, alchemy narrative data + tests
- Scope: src/content/items.ts, src/content/refinement.ts, src/content/alchemy.ts, test/alchemy.test.ts
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: codex
- To: codex
- Handed off: 2026-08-31T15:25:19.506Z
- Completed or current state: T07 done: +43 items (12 herb_*, 12 pill_hybrid_*, silver_coin/spirit_stone/gold_note, 12 bait_*, 4 pill_ls_*), +12 r_hybrid_* refinement recipes at thousand_herbs_valley covering all 12 pill_hybrid outputs, new src/content/alchemy.ts with HYBRID_RECIPES(12)+hybridForSeason, new test/alchemy.test.ts. No old items touched (0 deletions). Note: contract bait table has copy-paste herb_ prefixes; used bait_* per scheme column/task doc. Note: contract says 42 existing items but lists 43 entries incl. 8 technique ids; real HEAD count was 38 items.
- Touched files: src/content/items.ts, src/content/refinement.ts, src/content/alchemy.ts, test/alchemy.test.ts
- Verification: npx vitest run test/alchemy.test.ts: 5/5 passed; npx vitest run test/content.test.ts: 2 failed / 18 passed — failures are 4 pre-existing QUESTS errors (q_mkt_08 crooked_circulation, q_lak_02 tide_breath) from uncommitted T04 quests.ts work, none from T07; npx tsc --noEmit: exit 0; npm run lint: clean
- Known risks or blockers: content.test.ts zod-gate red until T04 fixes quest step items or T12 updates gates; SHOP_STOCK now auto-includes new buyable items (herbs/baits) before T12 wiring
- Next action: T12 integration: wire weather-based herb pricing, Linh Thach purchases for pill_ls_*, export HYBRID_RECIPES/hybridForSeason from src/content/index.ts
