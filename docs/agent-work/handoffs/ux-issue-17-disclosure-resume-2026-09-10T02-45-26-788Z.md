# Active claim: ux-issue-17-disclosure-resume

- Owner: claude
- Claimed: 2026-09-10T02:26:11.508Z
- Objective: issue #17: progressive disclosure of system/HUD terminology + auto-resume active slot on F5
- Scope: src/App.tsx, src/ui/MainMenu.tsx, src/ui/GameScreen.tsx, src/ui/screens.css, test/
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: claude
- To: claude
- Handed off: 2026-09-10T02:45:26.789Z
- Completed or current state: Issue #17 done: removed body min-width 1060px (mobile single-column scroll via existing 1200/900/700px breakpoints); progressive disclosure day-1 (RealmLadder hidden until day>1 or stage>0, system-tile personas CSS-gated to hover/focus/selected, newGame revealHint vi+en); F5 auto-resume of active slot with loading beat, boot-scene story reopen, and in-run 'Ve menu' exit that clears the resume marker but keeps the save.
- Touched files: src/index.css, src/App.tsx, src/ui/GameScreen.tsx, src/ui/MainMenu.tsx, src/ui/screens.css, src/i18n/vi.ts, src/i18n/en.ts, test/app.ui.test.tsx
- Verification: npx tsc --noEmit: clean; npx vitest run test/app.ui.test.tsx: 5 passed; npm test: 684/688 passed (4 failures pre-existing on HEAD in test/romance.test.ts + test/rpg-systems.test.ts, engine/content only, untouched by diff); npm run build: ok
- Known risks or blockers: 4 pre-existing content/engine test failures on branch HEAD (romance 104 vs 100 nodes; crooked_circulation TRAINED gain) are NOT from this change but need an owner
- Next action: user authorization to commit; branch otherwise ready for PR on issue #17
