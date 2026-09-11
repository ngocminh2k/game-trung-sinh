# Active claim: achievement-real-thresholds

- Owner: claude
- Claimed: 2026-09-10T17:58:32.906Z
- Objective: Replace >=1 / boolean-once achievement thresholds with real ones (issue #13)
- Scope: src/engine/achievements.ts, src/engine/reducer.ts, src/content/achievements-data.ts, test/achievements.test.ts
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: claude
- To: maintainer
- Handed off: 2026-09-10T18:36:35.304Z
- Completed or current state: implemented & committed as e2aa6c0; PR #27 open; no uncommitted changes left
- Touched files: src/engine/achievements.ts, src/engine/reducer.ts, src/content/achievements-data.ts, test/achievements.test.ts
- Verification: npm run typecheck: pass; npx vitest run test/achievements.test.ts: 5/5 pass; npx vitest run: 693/697 pass (4 pre-existing failures unrelated to change); npx eslint on 4 touched files: pass
- Known risks or blockers: saved game first_step not yet unlocked needs 3 moves now (intended)
- Next action: merge PR #27 to close issue #13
