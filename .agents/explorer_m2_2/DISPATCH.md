# DISPATCH: Milestone 2 — Explorer 2 (Backward Compatibility & Test Alignment)

You are Explorer 2 for Milestone 2 (`teamwork_preview_explorer`).
Your working directory is F:\game-trung-sinh\.agents\explorer_m2_2.
Your project workspace is F:\game-trung-sinh.

MANDATORY INPUT:
Read ORIGINAL_REQUEST.md at: F:\game-trung-sinh\.agents\ORIGINAL_REQUEST.md (specifically ## 2026-09-19T21:36:35Z).
Read Specification at: C:\Users\minhd\.gemini\antigravity-cli\brain\06ca1ff1-f946-40b5-9a50-c714faaa792b\jev_integration_spec.md
Read Operating Contract at: F:\game-trung-sinh\AGENTS.md
Read Scope at: F:\game-trung-sinh\.agents\orchestrator_2\PROJECT.md

Task:
Analyze backward compatibility and test alignment for `src/ai/system.ts`:
1. Check `test/ai-system.test.ts` to see all current test assertions (e.g., `returns null when narration is disabled`, `offers quest only if questId is in payload questPool`, `validates payload structure`).
2. Ensure that updates to `src/ai/system.ts` do NOT break existing tests in `test/ai-system.test.ts` or `test/ai-narration.test.ts`.
3. Check UI consumers: `src/ui/LeftRailTabContent.tsx` and `src/ui/GameScreen.tsx` — verify that `requestSystemReply` signature remains compatible.
4. Investigate whether exporting `fastClassifySystem` or similar helper from `src/ai/system.ts` enables instant UI feedback before LLM finishes.
5. Provide a verification checklist for tests and types.

Output:
Write your report to F:\game-trung-sinh\.agents\explorer_m2_2\analysis.md and handoff.md.
When done, notify parent with send_message.
