# Project: Jev System One Integration

## Architecture
Integrating Jev (System One AI from TypeSafe AI) into The System in `game-trung-sinh` using a 2-Tier Pipeline:
- **Tier 1 (Jev System One / ~80ms)**: Fast reflex classification in `src/ai/jev-client.ts` via `POST https://api.typesafe.ai/v1/systemone` using Zod validation (`src/ai/jev-schemas.ts`). Bounded choice for `intent` (6 labels) and `selectedQuestId` (active quest pool from `systemQuestsFor(game)` + `'none'`), `obedienceScore` (1..5), and `isHostile` (noul boolean + probability). Instant fallback to deterministic rules on timeout (>600ms), offline, or missing API key.
- **Tier 2 (Frontier LLM / 1-2s)**: Generative narration in `src/ai/system.ts` via `/api/narrate`, enriched with Tier 1 decision context.
- **Boundary Isolation**: Deterministic game logic in `src/engine/` is completely decoupled from cloud AI. UI components (`LeftRailTabContent.tsx`, `GameScreen.tsx`) interact via `src/ai/system.ts`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Jev Zod Schemas | Zod validation for request/response, 3 primitives (choice, score, noul) in `src/ai/jev-schemas.ts` | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Jev Client & Bounded Choice | HTTP client with 600ms timeout, dynamic quest pool bounding, and deterministic fallback in `src/ai/jev-client.ts` | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Hallucination Defense | Rejection of unauthorized quest IDs (mapped to `undefined`) in `src/ai/jev-client.ts` | M1 | ORIGINAL_REQUEST §R1 |
| 4 | The System 2-Tier Wiring | Connect Tier 1 fast classification inside `src/ai/system.ts` (`requestSystemReply`) with fast state/decision handling | M2 | ORIGINAL_REQUEST §R2 |
| 5 | Deterministic System Fallback | In-character fallback for offline / missing API key / timeout in `src/ai/system.ts` | M2 | ORIGINAL_REQUEST §R2 |
| 6 | Automated Test Suite TC-01..TC-05 | Vitest unit tests in `test/ai-jev-system.test.ts` testing bounded choice, hallucination defense, defiance, network/timeout fallback, offline keyless | M3 | ORIGINAL_REQUEST §R3 |
| 7 | Full Regression Verification | 150 test suites, typecheck 0 errors, clean lint on in-scope files | M3 | ORIGINAL_REQUEST §R3 |
| 8 | AGENTS.md Claim & Handoff | Comply with operating contract: close active claim `jev-system-one-classifier`, record handoffs | M4 | ORIGINAL_REQUEST §R4 |
| 9 | Git Branch & Pull Request | Create clean branch `feat/jev-system-one`, commit, and create PR via GitHub CLI | M4 | ORIGINAL_REQUEST §R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Jev Client & Schemas | `src/ai/jev-schemas.ts`, `src/ai/jev-client.ts` | Survey | DONE |
| M2 | 2-Tier Pipeline in The System | `src/ai/system.ts` | M1 | DONE |
| M3 | Automated Tests & Regression | `test/ai-jev-system.test.ts`, `test/ai-system.test.ts` | M1, M2 | DONE |
| M4 | Git Branch, AGENTS.md & PR | `feat/jev-system-one`, `docs/agent-work/handoffs/` | M1, M2, M3 | DONE |

## Interface Contracts
### `src/ai/jev-schemas.ts`
- `JevIntentSchema`: `z.enum(['request_quest', 'chat_general', 'inquire_status', 'complain', 'defiance_mockery', 'accept_current_quest'])`
- `JevResponseSchema`: Validates `id`, `model`, `latencyMs`, and `answers` (`intent`, `selectedQuestId`, `obedienceScore`, `isHostile`).
- `SystemFastDecision`:
  ```typescript
  export interface SystemFastDecision {
    intent: JevIntent
    questId?: string
    obedienceScore: number
    isHostile: boolean
    latencyMs: number
  }
  ```

### `src/ai/jev-client.ts` ↔ `src/ai/system.ts`
- `classifySystemUtterance(game: GameState, playerMessage: string, config?: JevClientConfig): Promise<SystemFastDecision>`
- Returns guaranteed `SystemFastDecision` (either from Jev API or deterministic fallback). Never throws exception.

### `src/ai/system.ts` ↔ UI Components (`GameScreen`, `LeftRailTabContent`)
- `requestSystemReply(game: GameState, message: string, locale: Locale): Promise<SystemReply | null>`
- `fastClassifySystem(game: GameState, message: string): Promise<SystemFastDecision>` (optional direct access for instant UI feedback).

## Code Layout
```
src/ai/
├── jev-schemas.ts     # Zod schemas for Jev 3 primitives
├── jev-client.ts      # Jev System One client with 600ms timeout & fallback
├── system.ts          # 2-Tier Pipeline combining Jev Tier 1 & LLM Tier 2
├── system-types.ts    # System types and payload builders
├── narration.ts       # Narration utilities
└── ...

test/
├── ai-jev-system.test.ts # Jev unit tests (TC-01..TC-05)
├── ai-system.test.ts     # System narration integration tests
└── ...

docs/agent-work/
├── active/               # Active claims
└── handoffs/             # Completed agent handoffs
```
