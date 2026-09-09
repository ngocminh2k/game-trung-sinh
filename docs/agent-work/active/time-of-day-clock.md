# Active claim: time-of-day-clock

- Owner: cline
- Claimed: 2026-09-08T18:38:29.052Z
- Objective: Introduce four-slot day clock (sáng/trưa/chiều/tối) with per-action buff/debuff, fix danger-damage-on-every-village-crossing to once-per-day, and rebalance early cultivation thresholds; update GDD and tests.
- Scope: src/engine/time.ts,src/engine/types.ts,src/engine/schema.ts,src/engine/constants.ts,src/engine/stats.ts,src/engine/reducer.ts,src/engine/narrator.ts,src/ui/GameScreen.tsx,docs/GDD.md,test/day-cost.test.ts,test/time-of-day.test.ts,test/cultivation-pacing.test.ts,e2e/game.spec.ts
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Verification status (2026-09-08)

- `npm run typecheck` — exit 0 (tsc --noEmit).
- `npx eslint <all changed src/engine + src/ui/GameScreen + changed tests>` — exit 0
  (the single `prefer-const` flag in test/day-cost.test.ts was fixed). The full
  `npm run lint` still reports ~371 pre-existing errors confined to other
  agents' untracked/staged files (.agents/*.mjs, scripts/*.mjs, cocos-*.mjs,
  src/ui/ProtoShell.tsx, verify-shell.mjs, take-screenshots.mjs).
- `npx vitest run test --exclude '**/*.test.tsx'` — 79 files / 604 tests pass
  (includes new test/time-of-day.test.ts 5/5, rewritten day-cost 15/15 and
  cultivation-pacing 4/4, updated death 3/3, updated rpg-systems 13/13).
- UI `.tsx` subset: attribute-allocation, menu-family, etc. pass;
  `game-screen.test.tsx` and `aria-cleanup.test.tsx` fail with the SAME
  markup assertions already failing in the committed `tmp-test-out.txt`
  (parallel ProtoShell / panels layout work replaced `.regional-map` and the
  `◎` dingbat) — pre-existing concurrency noise, not this claim.
- `npm run build` — blocked by pre-existing TS errors in untracked
  `src/ui/ProtoShell.tsx` (teammate in-flight file, not in HEAD).
- `npx playwright test e2e/game.spec.ts --workers=1` — not run: exceeds the
  30 s tool window (needs playwright webServer boot). Next action: run it and
  confirm the day-chip text (still contains `Ngày 3`, now with `· Sáng`).
