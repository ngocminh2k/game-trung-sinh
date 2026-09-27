# BRIEFING — 2026-09-19T21:49:30Z

## Mission
Analyze `src/ai/system.ts` and plan the exact implementation for Requirement R2 (2-Tier Pipeline in The System).

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: F:\game-trung-sinh\.agents\explorer_m2_1
- Original parent: 5a466b68-3f91-467f-ac59-2dbf53885d36
- Milestone: Milestone 2 (2-Tier Pipeline in The System)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement main codebase changes
- Strictly adhere to AGENTS.md and PROJECT.md
- Maintain backwards compatibility and regression pass (150 test suites)

## Current Parent
- Conversation ID: 5a466b68-3f91-467f-ac59-2dbf53885d36
- Updated: not yet

## Investigation State
- **Explored paths**: `src/ai/system.ts`, `src/ai/jev-client.ts`, `src/ai/jev-schemas.ts`, `src/ai/narration.ts`, `src/ui/LeftRailTabContent.tsx`, `src/ui/GameScreen.tsx`, `test/ai-system.test.ts`, `test/ai-jev-system.test.ts`, `src/content/system-defs.ts`, `src/content/system-quests.ts`
- **Key findings**: `src/ai/system.ts` currently calls `/api/narrate` directly with no intent classification or personality-driven fallback. Need 2-tier pipeline: Tier 1 fast classification via `classifySystemUtterance`, payload enrichment for Tier 2, and robust deterministic in-character fallback.
- **Unexplored areas**: None

## Key Decisions Made
- Tier 1 call to `classifySystemUtterance` provides `SystemFastDecision` (intent, questId, obedienceScore, isHostile, latencyMs).
- `SystemChatPayload` is enriched with `jevDecision` and `mode: fastDecision.intent === 'request_quest' && fastDecision.questId ? 'offer_quest' : 'chat'`.
- Deterministic fallback generates system-specific in-character responses according to active System personality and fast decision attributes when `/api/narrate` fails or is disabled.
- Optional helper `fastClassifySystem` exposed for UI instant feedback if needed.

## Artifact Index
- F:\game-trung-sinh\.agents\explorer_m2_1\analysis.md — Detailed analysis and Worker implementation guide
- F:\game-trung-sinh\.agents\explorer_m2_1\handoff.md — 5-component handoff report
- F:\game-trung-sinh\.agents\explorer_m2_1\progress.md — Liveness tracker
- F:\game-trung-sinh\.agents\explorer_m2_1\DISPATCH.md — Task history
