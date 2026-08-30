# Active claim: ai-narration-resilience

- Owner: claude-e2e
- Claimed: 2026-08-30T16:47:01.966Z
- Objective: Make AI narration suggestions recover deterministically from empty and failed responses with explicit UI states.
- Scope: src/ai/narration.ts,src/engine/narrator.ts,src/engine/schema.ts,src/ui/GameScreen.tsx,src/i18n/en.ts,src/i18n/vi.ts,test/narrator.test.ts,test/ai-narration.test.ts
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: claude-e2e
- To: claude-story
- Handed off: 2026-08-30T17:07:52.856Z
- Completed or current state: AI suggestion flow hardened: requestSuggestion now returns a discriminated SuggestionResult (suggested/empty/error) instead of an opaque null; GameScreen maps empty and error to the existing deterministic free-text fallback with a busy button state that always clears (never-stuck). Added test/ai-narration.test.ts (payload/fallback contract) and test/ai-ui.test.tsx (loading, success line, failure fallback, disabled-mode skip; deterministic, fetch stubbed, no network).
- Touched files: src/ai/narration.ts,src/ui/GameScreen.tsx,test/ai-narration.test.ts,test/ai-ui.test.tsx
- Verification: npm run test: 195/195 green across 37 files; npm run typecheck: clean; npm run lint: 2 errors only in e2e/fresh-endings.spec.ts (pre-existing, e2e worker scope, not this write-set)
- Known risks or blockers: schema.ts and narrator.ts were already modified by the concurrent RPG/narrator worker before this task; i18n untouched because the deterministic fallback renders no AI-error copy by design. SuggestionResult is additive; requestNarration unchanged.
- Next action: e2e worker: fix the two unused helper lint errors in e2e/fresh-endings.spec.ts; production owners: consider a dedicated i18n AI-error status line if product wants visible AI failure messaging.
