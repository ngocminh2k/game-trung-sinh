# Active claim: phase5-proxy-suggest

- Owner: claude
- Claimed: 2026-08-30T18:18:46.018Z
- Objective: Add suggest-mode branch to vite dev proxy: relay model-picked choiceId, validate against authored choices, never decide state
- Scope: vite.config.ts, test/ai-narration.test.ts
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: claude
- To: human
- Handed off: 2026-08-30T18:23:08.389Z
- Completed or current state: Suggest-mode branch added to vite dev proxy narrationProxy: suggest payloads POST an upstream system prompt demanding JSON {choiceId, reply} in payload locale, parseSuggestContent validates choiceId against payload choices, replies 200 {choiceId, reply} or 502 {choiceId:null}; narration branch byte-identical; SAFE-02 intact (proxy relays only, client drops invalid picks). Pure helper parseSuggestContent exported from vite.config.ts and unit-tested.
- Touched files: vite.config.ts, test/ai-narration.test.ts
- Verification: npx vitest run test/ai-narration.test.ts test/ai-ui.test.tsx: 11 passed; npx vitest run: 206 passed (37 files); npm run typecheck: clean; npm run lint: clean
- Known risks or blockers: none
- Next action: Optional live e2e with a real AI_BASE_URL/AI_MODEL to confirm upstream prompt compliance beyond the unit tests.
