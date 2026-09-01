# Active claim: map-icons-redesign

- Owner: claude
- Claimed: 2026-09-01T06:45:23.464Z
- Objective: Redesign regional map with 9router-generated location icons and desktop layout
- Scope: src/ui/locationArt.ts,src/ui/GameScreen.tsx,src/index.css,test/location-art.test.ts,test/regional-map.test.ts,test/game-screen-art.test.tsx,e2e/acceptance-visual.spec.ts
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: claude
- To: claude
- Handed off: 2026-09-01T06:47:47.859Z
- Completed or current state: Completed map icon pack and desktop layout redesign. All 16 locations have reviewed badges; map uses 45% desktop allocation with non-overlapping HUD subgrid; tests pass and build is green.
- Touched files: src/ui/locationArt.ts,src/ui/GameScreen.tsx,src/index.css,test/location-art.test.ts,test/regional-map.test.ts,test/game-screen-art.test.tsx,e2e/acceptance-visual.spec.ts,docs/asset-pipeline.md
- Verification: npm run typecheck && npm run lint && npx vitest run test/location-art.test.ts test/regional-map.test.ts test/game-screen-art.test.tsx && npx playwright test e2e/acceptance-visual.spec.ts --workers=1 && npm run build: all green
- Known risks or blockers: none
- Next action: Ready for main branch integration review
