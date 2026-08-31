# Active claim: expansion-x20-t11-shops-per-npc

- Owner: cline
- Claimed: 2026-08-31T16:35:13.178Z
- Objective: T11 shop-per-NPC data + pure stock lookup + tests
- Scope: src/content/shops.ts, src/engine/shopStock.ts, test/shops.test.ts
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: cline
- To: t12-integration
- Handed off: 2026-08-31T16:52:03.862Z
- Completed or current state: T11 done: 54 shops (one per NPC outside the frozen 6-id whitelist: n_gardener_thin, n_judge_quang, n_ice_hermit_bang, n_lost_soul_ha, n_crane_spirit, n_monk_nhu) with bilingual labels, 10-15 entries each, >=1 priceSilver entry per shop, >=2 priceLS for n_alchemist_sam / n_banker_tin / n_name_collector_tra; pure engine helpers shopForNpc / entryPrice (floors base price * weatherMod) / validateShops; role-appropriate wares using ONLY item ids that exist in src/content/items.ts (note: crooked_circulation, rift_step, herbal_breath, iron_skin, cloudwalk, peak_cleaver, tide_breath, stone_aegis are technique ids taught via manuals, NOT item ids — shops use only real item ids); no existing file touched, shop.ts/items.ts/reducer/UI untouched for T12 wiring.
- Touched files: src/content/shops.ts, src/engine/shopStock.ts, test/shops.test.ts
- Verification: npx vitest run test/shops.test.ts: 9 passed (1 file); npm run typecheck: green (tsc --noEmit exit 0); npm run lint: green (eslint exit 0)
- Known risks or blockers: entryPrice returns the entry's own-tier base price (gold/silver/LS value scaled by weatherMod, floored) — T12 must read which price field is set to know the currency; prices are authored flavor values, T12 may rebalance when wiring; stockDay 'season' only marks herb entries, T12 decides gating
- Next action: T12 wires shopForNpc + entryPrice into the buy/sell flow (src/engine/shop.ts + reducer) and adds validateShops to validateAllContent in src/content/index.ts
