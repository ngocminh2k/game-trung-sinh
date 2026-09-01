# Active claim: expansion-x20-t13-verification-e2e

- Owner: cline
- Claimed: 2026-08-31T20:27:57.337Z
- Objective: Complete T13 verification-e2e for x20: add missing test/quest-coverage, shop-coverage, save-compat, and e2e/economy, branch-journeys, system-notifications, npc-on-map; verify all 5 gates green; write T13 handoff
- Scope: test/quest-coverage.test.ts, test/shop-coverage.test.ts, test/save-compat.test.ts, e2e/economy.spec.ts, e2e/branch-journeys.spec.ts, e2e/system-notifications.spec.ts, e2e/npc-on-map.spec.ts
- Acceptance criteria: 3 unit test files green — quest-coverage (60 NPC ids each give >=1 quest in QUESTS; QUESTS >= 150; quest ids unique), shop-coverage (SHOPS === 54, NPCS_WITHOUT_SHOP === 6, union covers exactly the 60 NPCS ids once; every entry has >=1 price and every price >= 1), save-compat (pre-x20 save omitting silver/spiritStones/rememberedNames/companionId/systemQueue parses via validateGameState with defaults 0/0/[]/null/[]; GAME_STATE_VERSION === 1). systemId excluded — S02 system-layer field, absent from current schema, out of x20 scope (user-confirmed).
- Verification plan: `npx vitest run test/quest-coverage.test.ts test/shop-coverage.test.ts test/save-compat.test.ts` (expect all green); `npx tsc --noEmit` for type safety of the new test files.
