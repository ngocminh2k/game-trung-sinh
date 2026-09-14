# Active claim: ui-redesign-visual-fix-claude

- Owner: claude
- Claimed: 2026-09-04T14:56:35.005Z
- Objective: Resolve visual collisions: isolate legacy DOM from new 3-zone CSS grid; fix world-map-art pointer-events; repair overlapping typography; restore column width on Path panel; add contrast fixes for TopBar/Chronicle/CommandBar
- Scope: src/ui/**, src/index.css

## Acceptance criteria

1. The new 3-zone layout (TopBar / LeftRail / CenterStage / RightHUD / ChronicleTicker / CommandBar) renders with its intended sizes; the legacy `.world-content`, `.stage-notices`, `.system-dock`, `.journal-screen` DOM no longer participates in the grid (visibility-only: hidden visually, kept in DOM for tests).
2. The world map art (`img.world-map-art`) does not intercept clicks on the left-rail tabs.
3. CommandBar placeholder text is legible on its dark background.
4. Chronicle feed text has a translucent rice-paper scrim so it remains readable on bright backgrounds.
5. TopBar logo "Phế Căn Ký" renders in a light color over the dark top bar.
6. The Path panel column is not crushed to ~20px when the dock is open (rpg-system-grid columns stay readable).
7. All existing tests, typechecks, lint and build pass.
8. New screenshots show: (a) Menu, (b) New Game system picker, (c) Gameplay with all three zones populated, (d) Path panel with readable column widths.

## Verification plan

- `npm run typecheck` — must pass (0 errors).
- `npx eslint src/` — must pass (0 errors).
- `npm test` — full suite (expect 683/687 pre-existing pass rate preserved; 4 pre-existing PR3 failures skipped).
- `npm run build` — must succeed.
- `node take-screenshots.mjs` — produce 4 fresh screenshots; visually confirm fix.
## Handoff

- From: claude
- To: human
- Handed off: 2026-09-04T15:07:39.958Z
- Completed or current state: Visual collision and typography contrast fixes completed and verified
- Touched files: src/index.css, src/ui/GameScreen.tsx, src/ui/screens.css
- Verification: npm test: 90 passed, 2 failed (baseline); npm run typecheck: 0 errors
- Known risks or blockers: none
- Next action: all visual criteria satisfied
