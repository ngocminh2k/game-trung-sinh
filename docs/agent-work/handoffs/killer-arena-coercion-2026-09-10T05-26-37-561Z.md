# Active claim: killer-arena-coercion

- Owner: claude
- Claimed: 2026-09-10T01:00:30.903Z
- Objective: Issue #19: Sect Arena tower-climb (Lôi Đài Khiêu Chiến) + NPC coercion/resource-plunder for the Killer player type
- Scope: src/engine/reducer.ts, src/engine/types.ts, src/engine/constants.ts, src/engine/corrections.ts, src/content/, src/ui/, src/i18n/, test/
- Acceptance criteria: (a) a playable Lôi Đài tower-climb: `arena_challenge` opens the next floor's
  disciple in order, win advances the pointer and seizes that floor's stores, retreat keeps the floor
  retryable (no softlock), topping the tower is announced once and closes the ladder; (b) at least one
  resource-plunder coercion: `coerce_npc { approach: 'plunder' }` takes fixed gold + items from a
  personality-opposite NPC once (no farming), raises infamy, zeroes affection; `back_off` is the
  restrained alternative; both reachable in VI and EN via buttons and free text.
- Verification plan: `test/killer-arena-coercion.test.ts` drives every criterion through the reducer
  (ladder order, error guards, retreat retry, one-time tower-top, plunder one-shot, infamy/affection,
  free-text parsing both languages); plus `npm run typecheck`, `npx vitest run`, `npm run lint`,
  `npm run build`, and the content validators in `src/content/index.ts` (arena ladder contiguity,
  flag-key coverage) exercised by `test/content.test.ts` and `test/flag-keys.test.ts`.
- Note: criteria/plan recorded at handoff time rather than pre-implementation; content matches what
  was actually built and tested.

## Handoff

- From: claude
- To: coordinator
- Handed off: 2026-09-10T05:26:37.561Z
- Completed or current state: Issue #19 complete: Lôi Đài 5-floor tower climb (arena_challenge opens next floor in order, win seizes that floor stores, retreat keeps floor retryable, topping announced once + closes ladder) + resource coercion (coerce_npc plunder takes fixed gold/items once, raises infamy, zeroes affection; back_off repairs). Both reachable via UI buttons and VI/EN free text. State is flags-only (arena_floor, arena_cleared, coerced_<id>, infamy) so old saves stay loadable.
- Touched files: src/content/rpg.ts, src/content/killer.ts (new), src/content/flag-keys.ts, src/content/index.ts, src/engine/types.ts, src/engine/content-types.ts, src/engine/reducer.ts, src/engine/schema.ts, src/engine/corrections.ts, src/engine/narrator.ts, src/ui/GameScreen.tsx, src/ui/gameScreen/panels.tsx, src/ui/objective.ts, test/killer-arena-coercion.test.ts (new, 11 tests), test/combat-depth.test.ts (enemy census 21->26)
- Verification: npm run typecheck: clean. npx vitest run test/killer-arena-coercion.test.ts: 11/11 pass. npx vitest run (full): 694 passed, 4 failed (romance x3 + crooked circulation x1) - reproduced identically on clean HEAD in a throwaway worktree, so pre-existing and unrelated. npm run lint: 28 errors, all in untouched root cocos-*.mjs no-undef window/console; zero in touched files. npm run build: OK in 2.22s.
- Known risks or blockers: Tower balance only proven at buffed stats (stage 5, body 40, hp 400); a real playthrough may find floor 4-5 qi-starved - winFloor had to defend to bank the +5/3-turns regen even with max body. .coercion-choices div has no CSS yet (buttons inherit dock styling). App.tsx visualActionFor not extended for arena_challenge/coerce_npc, so those actions show no pose (default idle is safe).
- Next action: Coordinator: playtest arena pacing + coercion at intended stats; triage the 4 pre-existing failures as a separate issue; optional polish - CSS for .coercion-choices, visualActionFor entries for the two new action kinds.
