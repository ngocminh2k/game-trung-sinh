# Active claim: expansion-x20-t10-memory-names

- Owner: claude
- Claimed: 2026-08-31T15:51:26.898Z
- Objective: Create 200 erased-name memories (quest/ash/night) + pure memory engine helpers + tests
- Scope: src/content/name-memories.ts, src/engine/memory.ts, test/memory-names.test.ts
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: claude
- To: codex
- Handed off: 2026-08-31T16:04:48.313Z
- Completed or current state: T10 done: 200 erased names (quest 100 / ash 60 / night 40, nm_001..nm_200) with Vi/En parity, NIGHT_PAGES night_1..night_4 x10 for nm_161..200; pure memory.ts (MEMORY_TOTAL=200, MEMORY_GATE=50, rememberedCount, rememberNames, memoryMilestone)
- Touched files: src/content/name-memories.ts, src/engine/memory.ts, test/memory-names.test.ts
- Verification: npx vitest run test/memory-names.test.ts: 13/13 pass; npx tsc --noEmit: pass; npm run lint: pass; count proof quest=100 ash=60 night=40
- Known risks or blockers: night_4 nm_200 hint hints the self-erased name (story canon sec3 twist); T12 wiring not started
- Next action: T12: wire rememberNames into reducer on quest completion and night events (day 7/14/21/28)
