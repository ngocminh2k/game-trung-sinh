# BRIEFING — 2026-09-20T04:52:00Z

## Mission
Analyze backward compatibility and test alignment for src/ai/system.ts for Milestone 2.

## 🔒 My Identity
- Archetype: explorer
- Roles: explorer
- Working directory: F:\game-trung-sinh\.agents\explorer_m2_2
- Original parent: 5a466b68-3f91-467f-ac59-2dbf53885d36
- Milestone: Milestone 2 (teamwork_preview_explorer)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Analyze backward compatibility and test alignment for src/ai/system.ts
- Do not break existing tests in test/ai-system.test.ts or test/ai-narration.test.ts
- Verify requestSystemReply signature compatibility with UI consumers (LeftRailTabContent.tsx, GameScreen.tsx)
- Keep deterministic game logic in src/engine/, data in src/content/, presentation in src/ui/, AI narration boundary in src/ai/

## Current Parent
- Conversation ID: 5a466b68-3f91-467f-ac59-2dbf53885d36
- Updated: 2026-09-20T04:52:00Z

## Investigation State
- **Explored paths**:
  - `test/ai-system.test.ts` (all 3 tests and assertions)
  - `test/ai-narration.test.ts` (7 tests, verified independence)
  - `test/system-scenario.test.ts` (critical containment regex check on `src/ai/system.ts`)
  - `test/dock-quests.test.tsx` and `test/system-ui.ui.test.tsx` (verified mock patterns)
  - `src/ai/system.ts` (existing 89-line implementation)
  - `src/ui/LeftRailTabContent.tsx` (lines 17, 162-180)
  - `src/ui/GameScreen.tsx` (lines 55, 235, 595-598, 955)
  - `src/ai/jev-schemas.ts` and `src/ai/jev-client.ts` (Tier 1 integration)
- **Key findings**:
  - `test/ai-system.test.ts` requires `buildSystemPayload` to be synchronous and strictly bounded to `systemQuestsFor(game)`.
  - `test/ai-system.test.ts` requires disabled narration guard to return `null` without making any fetch calls (`toHaveBeenCalledOnce()` across sequential tests).
  - Valid LLM quest offers must not be rejected even if Tier 1 rule fallback defaulted to `chat_general`.
  - `test/system-scenario.test.ts` forbids authored scenario imports in `src/ai/system.ts` (must only import through `../engine`).
  - `requestSystemReply` signature `(game, message, locale) => Promise<SystemReply | null>` is 100% compatible with `LeftRailTabContent.tsx` and `GameScreen.tsx`.
  - Exporting `fastClassifySystem` enables ~80ms instant UI feedback while preserving full backward-compatibility.
- **Unexplored areas**: None for this milestone.

## Key Decisions Made
- Confirmed backward-compatible signature for `requestSystemReply` with optional decision parameter.
- Confirmed backward-compatible signature for `buildSystemPayload` with optional decision parameter.
- Recommended exporting `fastClassifySystem(game, message, config?)` from `src/ai/system.ts`.
- Documented all containment rules and verification steps in `analysis.md` and `handoff.md`.

## Artifact Index
- F:\game-trung-sinh\.agents\explorer_m2_2\analysis.md — Detailed analysis report
- F:\game-trung-sinh\.agents\explorer_m2_2\handoff.md — 5-component handoff report
- F:\game-trung-sinh\.agents\explorer_m2_2\progress.md — Liveness heartbeat
