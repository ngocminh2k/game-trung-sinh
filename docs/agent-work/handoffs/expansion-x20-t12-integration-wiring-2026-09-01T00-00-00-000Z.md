# Active claim: expansion-x20-t12-integration-wiring

- Owner: claude
- Claimed: 2026-08-31T16:52:03.862Z
- Objective: T12 integration-wiring — raise content gates, re-export new modules, wire economy/weather/companion/memory/system into engine + UI, i18n keys, fix affected tests
- Scope: src/content/index.ts, src/engine/index.ts, src/engine/reducer.ts, src/engine/* (new modules), src/content/* (new data), src/ui/GameScreen.tsx, src/i18n/vi.ts, src/i18n/en.ts, affected test files
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: claude (session "fix-day-neutral-walking-and-context-only-narrati-2")
- To: done / next session
- Handed off: 2026-09-01 (work committed as 69e2725 on branch worktree-fix-exploration-loop-2)
- Completed or current state: T12 + T13 done, all seven x20 phases landed.
  - Pha 0: 9 missing `<technique>_hidden_manual` items added to src/content/items.ts (T07 leftover, unblocks T08's hidden techniques).
  - T06: src/content/beasts.ts (36 beasts, 12 species x 3 tier), src/engine/companion.ts (canTame / companionBuff / COMPANION_EXTRA_ACTION), test/companion.test.ts.
  - T02: test/economy.test.ts (3-tier currency ratios, canAffordCurrency, spendCurrency order, systemQueue default on old saves).
  - T12: content gates raised in src/content/index.ts (NPCS min 60, QUESTS min 150, ENDINGS 12, CHAPTERS 8) + validateShops/validateBeasts added to validateAllContent; src/content/index.ts and src/engine/index.ts re-export alchemy/shops/beasts/name-memories/sublayers/system-messages/weather/economy/memory/system/shopStock/companion; economy 3-tier wired into reducer buy/sell; weather mods applied via entryPrice; memory names module (rememberedCount/rememberNames/MEMORY_TOTAL/MEMORY_GATE); system message formatting + queuePush/queueDrain with system_refused blocking; aff-gate flags at 3/6/9 from doTalk; ending branch + sublayerFor epilogue merge; HUD i18n keys added to vi.ts/en.ts.
  - T13: test/affinity.test.ts, test/alchemy.test.ts, test/memory-names.test.ts, test/realm-progression.test.ts, test/shops.test.ts, test/sublayers.test.ts, test/system.test.ts, test/techniques-expanded.test.ts, test/weather.test.ts added; all previously failing tests (content/npc-art/npc-depth/session/game-screen/codex-panel/rpg-art/i18n) updated to the expanded counts.
  - e2e: all four legacy specs (game, save-reload, fresh-endings, acceptance-visual, debug-map) converted from the legacy `phe-can-ky:save:v1` boot to the save-slots flow; fresh-endings clickChoice closes an open story panel when a route-encounter screen is up.
  - Production fix found by e2e: stepping onto a route-encounter node fired NODE_REACHED kind:event and left a ghost story-backdrop blocking the world (panel doesn't render over the route screen). Fix in src/App.tsx: setStoryOpen yields when storyRouteEncounter(result.state) is active.
- Touched files: 41 modified + 42 new (full list in commit 69e2725) — new: src/content/{alchemy,beasts,name-memories,shops,sublayers,system-messages}.ts, src/engine/{companion,economy,memory,shopStock,system,weather}.ts, 11 test files, docs/plans/{expansion-x20,system-layer}/**
- Verification: npm run typecheck green; npm run lint green; npx vitest run 529/529 pass; npm run build green (pre-existing >500kB chunk warning only); npx playwright test 43/43 pass.
- Known risks or blockers (deferred, need product decision before implementing): romance UI surface (the one contract-verified gap); other NPCs' aff-gate alignment (q_aff_04..15 still gate on raw counter flag instead of aff_gate_<npc>); per-NPC shop reducer flow (doBuy uses shopForNpc but the per-NPC routing in src/engine/shop.ts was not restructured); taming/companion has no combat effect wired (COMPANION_EXTRA_ACTION unused by reducer); memory-name award triggers not fired from quest completion (rememberNames exists, no reducer caller); System queue has formatters + gates but no producer events fire pushes on quest accept/complete; Mei Hoa does not move between porch/home on rest.
- Next action: implement the deferred wiring items above (or hand to docs/plans/system-layer/ tasks, which are queued to run after x20 T12+T13 — that precondition is now satisfied).
