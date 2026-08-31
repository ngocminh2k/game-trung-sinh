# Expansion merge handoff — 2026-08-31 (coordinator)

All 7 workstreams delivered and merged into `ngocminh2k/build-full-game-gdd`.
Commit `2818fe7` pushed to PR #1 (now titled "feat: full game expansion — NPC
depth, romance, skill tree, 16-region world, quests, multi-save").

## Verification (coordinator-run, merged tree)

| Gate | Result |
|---|---|
| Unit | `npx vitest run` → **383/383** (45 files) |
| Typecheck | `npm run typecheck` → exit 0 |
| Lint | `npm run lint` → exit 0 |
| Build | `npm run build` → ✓ built in 1.51s |
| E2E | `npx playwright test e2e --workers=1` → exit 0 (full suite incl. 5 save-slots) |

## Deliverables

- **W1 — Multi-save**: 5 localStorage slots + autosave per day, slot-selection
  boot screen (keyboard navigable), legacy save migration. `src/ui/session.ts`,
  `src/App.tsx`, `e2e/save-slots.spec.ts`, `test/save-slots.test.ts`.
- **W2 — World**: +8 regions (thousand_herbs_valley, blackwind_dunes,
  frozen_peak, wandering_market, moon_lake, bone_ash_ruins, spirit_beast_ridge,
  azure_pavilion), each with authored 7×7 map + exits. `src/content/locations.ts`,
  `src/ui/locationArt.ts`, `test/world-expansion.test.ts` (14 tests).
- **W3 — NPC depth**: 40 NPCs total (10 principal × ≥6 lines, 30 supporting ×
  ≥3 lines), bilingual conditional lines (affMin/questDone/dayMin/flag/scene).
  `src/content/npcs.ts` (+10 cultivator NPCs), `test/npc-depth.test.ts` (94 tests).
- **W4 — Romance**: 5 tracks × 20 nodes = 100 bilingual nodes, `advance_romance`
  action, commitment/bittersweet/friend endings. `src/content/romance.ts`,
  `src/engine/romance.ts`, `test/romance.test.ts` (9 tests).
- **W5 — Skill tree**: 5 branches × 20 tiers = 100 nodes (sword/aura/herbal/
  shadow/thunder). `src/content/skill-tree.ts`, `test/skill-tree.test.ts` (30 tests).
- **W6 — Combat**: 18 enemies (15 new) with element (Ngũ Hành), behaviorPattern,
  defense, statusOnHit; ELEMENT_COUNTERS, comboMultiplier helpers.
  `src/content/rpg.ts`, `test/combat-depth.test.ts` (17 tests).
- **W7 — Quests**: 25 quests (8 main + 10 side + 4 secret + 3 world), multi-step
  chain engine. `src/content/quests.ts`, `src/engine/quests.ts`, `test/narrator.test.ts`.

## Integration fixes (coordinator)

1. NPC cap 30→40 (`src/content/index.ts` + `test/content.test.ts`,
   `test/npc-art.test.ts`).
2. Beat ref `q_sealed_cave` → `q_main_sealed_cave` (`src/content/beats-data.ts`).
3. Player position-bounds test now derives a walkable cell dynamically instead
   of hardcoding `MAP-2` (that tile is water in the reworked village map).
4. `newGame()` now emits `player.status: []` so fresh state round-trips
   `validateGameState` unchanged (was schema default-filled).
5. `npcArt.ts` exports `INDIVIDUAL_NPC_PORTRAITS`; npc-art test scoped to
   "every NPC renders a PNG, no orphaned registry keys" (world cultivators use
   the truthful ensemble fallback per CONTENT-02).
6. ESLint determinism rule (`no-restricted-properties`) narrowed from `**/*` to
   `src/engine/**` + `src/content/**` — UI/tests may use `Date.now`/querySelector
   (save-slot timestamps, focus handling are UI chrome, not engine state).
7. Removed stale `eslint-disable no-console` + diagnostic console.log in
   `test/npc-depth.test.ts`.

## Open items (non-blocking)

- **Engine wiring for W6/W4 mechanics** (frozen during parallel phase, data layer
  done, reducer integration deferred): `doCombatAttack`/`resolveEnemyTurn`/
  `doCombatDefend`/`doStartEncounter` still use legacy stats; skill-tree and
  romance reducer actions exist (`advance_romance` is wired) but UI panels
  (skill tree, romance badge, romance journal) are not yet rendered in
  `GameScreen.tsx`/`index.css` — these were freeze-excluded and are the next
  serial integration pass.
- Romance endings (15) in `endings-data.ts` and i18n UI strings pending.

## Commands

```
npx vitest run
npm run typecheck
npm run lint
npm run build
npx playwright test e2e --workers=1
```
