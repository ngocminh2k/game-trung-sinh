# Active claim: expansion-x20-t03-npc-expansion

- Owner: claude
- Claimed: 2026-08-31T14:46:53.519Z
- Objective: Add exactly 20 new NPCs per contracts/npc-registry.md to src/content/npcs.ts
- Scope: src/content/npcs.ts
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: claude
- To: any
- Handed off: 2026-08-31T14:55:05.204Z
- Completed or current state: T03 done: 20 new NPCs per contracts/npc-registry.md appended to NPCS (60 total), old 40 untouched (343 additions, 0 deletions)
- Touched files: src/content/npcs.ts
- Verification: Select-String id:'n_ count: 60; npx vitest run test/content-boundaries.test.ts: 4/4 passed (exit 0); npx tsc --noEmit: exit 0; npm run lint: exit 0
- Known risks or blockers: Pre-existing duplicate aliases (yen, lan, anh, monk, herbalist) inside the old 40 were left as-is (forbidden to edit); content/index.ts gate min(30) intentionally not raised (T12's scope)
- Next action: T12 raises NpcDefSchema.array().min(30) to min(60) in W2
