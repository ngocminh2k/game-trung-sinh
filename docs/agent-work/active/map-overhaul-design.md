# Active claim: map-overhaul-design

- Owner: claude (delegated to sub-agent)
- Original owner: cline
- Claimed: 2026-09-01T19:44:05.831Z
- Delegated: 2026-09-02T03:30:00Z
- Objective: Continue map-overhaul implementation: icon-slot + terrain-wash foundation is shipped (MO-1, MO-2 in plan §5). Complete MO-3 (player marker polish + hover tooltip + fog-of-war light), MO-4 (legend + a11y + i18n), MO-5 (test updates + 5 green gates).
- Scope: src/ui/GameScreen.tsx, src/index.css, src/i18n/{vi,en}.ts, test/**, e2e/**
- Acceptance criteria: per docs/plans/map-overhaul/README.md §7 (no grid lines, every node in ≥32px icon slot, placeholders for all 4 kinds, hover/focus tooltip, legend with slots, all tests green + 5 gates).
- Verification plan: `npx vitest run`, `npm run typecheck`, `npm run lint`, `npm run build`, `npx playwright test --workers=1`.
- Verification status (2026-09-02, MO-1 + MO-2):
  - `npx vitest run test/system.test.ts test/game-screen-art.test.tsx` — 28/28 pass.
  - `npm run typecheck` — exit 0.
  - `npm run lint` and `npm run build` not run for this checkpoint; must run before MO-5.
- Plan file: docs/plans/map-overhaul/README.md
- Handoff: docs/agent-work/handoffs/map-overhaul-mo12-2026-09-02T03-30-00-000Z.md
