# Active claim: e2e-fresh-route-repair

- Owner: claude
- Claimed: 2026-08-30T16:45:57.086Z
- Objective: Reproduce fresh Rootless Star and Spring for an Enemy browser routes, then correct only a proven E2E route/helper defect.
- Scope: e2e/fresh-endings.spec.ts, e2e/debug-map.spec.ts, e2e helpers if needed
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: claude
- To: coordinator
- Handed off: 2026-08-30T17:42:35.372Z
- Completed or current state: All 8 fresh-endings journeys + full e2e dir green (32 passed). Root causes were E2E journey mismatches, not production bugs.
- Touched files: e2e/fresh-endings.spec.ts,e2e/game.spec.ts
- Verification: npx playwright test e2e --workers=1 -> 32 passed; npx eslint e2e/fresh-endings.spec.ts e2e/game.spec.ts -> clean; npx tsc --noEmit -> clean
- Known risks or blockers: tragic_death now seeds hp16 so forest hazard (15) leaves 1hp before combat death; if hazard damage changes, adjust seed
- Next action: None in e2e scope; Phase 3 RPG work still paused with claude-rpg
