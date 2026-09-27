## Overview
Integrates Jev (System One AI from TypeSafe AI) into The System (`game-trung-sinh`) implementing an ultra-fast 2-tier AI pipeline.

## Architectural Highlights
- **Tier 1 (Jev System One / ~80ms)**: Fast reflex classification in `src/ai/jev-client.ts` via `POST https://api.typesafe.ai/v1/systemone` using Zod schemas (`src/ai/jev-schemas.ts`). Strictly bounds `intent` (6 labels) and `selectedQuestId` to the engine active quest pool (`systemQuestsFor(game)` + `'none'`), scoring `obedienceScore` (1..5) and evaluating `isHostile`.
- **Tier 2 (Generative LLM / 1-2s)**: Narrative generation via `/api/narrate` enriched with Tier 1 decision context.
- **Graceful Offline & Timeout Fallback**: Instant, deterministic rule-based fallback in `src/ai/system.ts` (`buildDeterministicSystemReply`) when offline, missing API keys, on network drops, or upon timeout (>600ms on Jev, >2000ms on LLM).
- **Hallucination Defense**: Strictly checks any suggested `questId` against active quest pool; unauthorized quest IDs are rejected deterministically without affecting UI.
- **Strict Boundary Isolation**: Preserves engine determinism in `src/engine/` and adheres to AGENTS.md contract.

## Automated Testing & Verification Gates
- `test/ai-jev-system.test.ts`: TC-01..TC-07 all pass (100% pass rate).
- `test/adversarial-jev-system.test.ts`: Hostility, vulgarity, timeout resilience, schema corruption, and ReDoS probe tests all pass.
- `test/challenger-m2-boundary-concurrency.test.ts`: High-concurrency (20 concurrent requests), extreme inputs (10k+ chars, unicode/emojis), and edge states all pass.
- `npm run typecheck`: 0 errors.
- `npx eslint`: 0 errors, 0 warnings across all in-scope files.
- `npm test`: 152/152 test files passed, 1279/1279 tests passed.
- `npm run agent:check`: OK.
- `docs/agent-work/handoffs/`: Active claims archived via `npm run agent:handoff`.
