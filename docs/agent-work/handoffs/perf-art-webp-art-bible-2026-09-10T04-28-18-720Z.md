# Active claim: perf-art-webp-art-bible

- Owner: claude
- Claimed: 2026-09-10T04:28:06.851Z
- Objective: Issue #16: WebP compression + Art Bible harmonization
- Scope: src/assets/art/**, src/ui/*Art.ts, src/ui/GameScreen.tsx, src/ui/gameScreen/panels.tsx, src/index.css, scripts/convert-art.mjs, docs/asset-pipeline.md, test/*art*.test.ts, test/*art*.test.tsx, test/progression-content.test.ts, test/regional-map.test.ts
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: claude
- To: next-owner
- Handed off: 2026-09-10T04:28:18.721Z
- Completed or current state: Issue #16 done: 472MB PNG art converted in place to 5.6MB WebP (222 files); imports/tests switched to .webp; CSS Art Bible harmonization added to src/index.css; documented in docs/asset-pipeline.md
- Touched files: scripts/convert-art.mjs, src/assets/art/**, src/ui/rpgArt.ts, src/ui/npcArt.ts, src/ui/locationArt.ts, src/ui/playerArt.ts, src/ui/GameScreen.tsx, src/ui/gameScreen/panels.tsx, src/index.css, docs/asset-pipeline.md, test/location-art.test.ts, test/npc-art.test.ts, test/player-action-art.ui.test.tsx, test/player-art.test.ts, test/progression-content.test.ts, test/regional-map.test.ts, test/rpg-art.test.ts
- Verification: typecheck PASS; eslint changed paths PASS; 8 art/palette test files 35/35 PASS; build PASS 5.06MB webp in dist, 0 PNG; full suite 683/687, 4 pre-existing failures test/romance.test.ts + test/rpg-systems.test.ts
- Known risks or blockers: Romance/rpg-systems failures pre-date this branch and sit inside active claim w4-romance; saturate values 0.74-0.92 may need visual tuning
- Next action: Visual review at 1440px, then commit on user authorization
