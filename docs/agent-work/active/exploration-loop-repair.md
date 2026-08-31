# Active claim: exploration-loop-repair

- Owner: claude
- Claimed: 2026-08-31T04:32:10.951Z
- Objective: Restore exploration-first UI and day-neutral ordinary movement
- Scope: src/App.tsx,src/engine/reducer.ts,src/ui/GameScreen.tsx,src/index.css,test/app.ui.test.tsx,test/game-screen.test.tsx,test/regional-map.test.ts,e2e/game.spec.ts
- Acceptance criteria: Ordinary movement keeps the same day; exploration starts without narration; NPC/event interaction opens narration; choices/free text retain it until Continue or Escape; an open narration dialog blocks background pointer and keyboard interaction.
- Verification plan: `npx vitest run test/app.ui.test.tsx test/game-screen.test.tsx test/regional-map.test.ts test/save-slots.test.ts`; then typecheck, lint, full unit/E2E/build.
- Verification status (2026-08-31):
  - `npx vitest run` — 45 files / 387 tests, all green.
  - `npm run typecheck` — exit 0.
  - `npm run lint` — exit 0.
  - `npm run build` — exit 0.
  - `npx playwright test e2e/game.spec.ts --workers=1` — 12 passed (21.1s).
  - Full `e2e` sweep not run; consider before merge.
- Handoff: docs/agent-work/handoffs/exploration-loop-repair-2026-08-31.md
