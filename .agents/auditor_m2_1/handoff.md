# Forensic Audit & Handoff Report: Milestone 2 (`teamwork_preview_auditor`)

**Work Product**: Milestone 2 (`src/ai/system.ts`, `src/ai/jev-client.ts`, `src/ai/jev-schemas.ts`)  
**Profile**: General Project  
**Integrity Mode**: `development` (per `ORIGINAL_REQUEST.md:58`)  
**Verdict**: **CLEAN**  

---

## 1. Observation

1. **Static Analysis of Source Code:**
   - `src/ai/jev-schemas.ts` (lines 1-45):
     - `JevIntentSchema`: Strict enum over `['request_quest', 'chat_general', 'inquire_status', 'complain', 'defiance_mockery', 'accept_current_quest']`.
     - `JevResponseSchema`: Strictly validates `id`, `model`, `latencyMs`, and nested answers: `intent` (enum + confidence [0..1]), `selectedQuestId` (string + confidence [0..1]), `obedienceScore` (int min 1 max 5), and `isHostile` (boolean + optional probability [0..1]).
   - `src/ai/jev-client.ts` (lines 14-115, 120-136):
     - `classifySystemUtterance`: Authentically forms the Jev payload containing `model: 'jev-latest'`, active system definition `{ id, nameVi, personalityVi }`, player state `{ stage, gold, hp, qi }`, bounded `availableQuests` mapped from `systemQuestsFor(game)`, and trimmed message.
     - Questions structure encodes typed primitives: `intent` (choice), `selectedQuestId` (choice of active quests + `'none'`), `obedienceScore` (score 1..5), `isHostile` (noul).
     - Network invocation uses `fetch(endpoint, ...)` with `Authorization: Bearer <key>`, `Content-Type: application/json`, and an `AbortController` timeout (default 600ms).
     - Zod schema validation: `const parsed = JevResponseSchema.parse(json)`.
     - Hallucination defense: `questId: selectedQId !== 'none' && questIdOptions.includes(selectedQId) ? selectedQId : undefined`.
     - Fallback: On missing API key, non-200 HTTP response, timeout abort, or Zod parsing failure, calls `fallbackRuleBasedClassifier(playerMessage, questIdOptions, elapsedMs)`.
   - `src/ai/system.ts` (lines 39-87, 89-195, 197-203, 205-279):
     - `buildSystemPayload`: Computes `mode: 'offer_quest'` strictly when `fastDecision.intent === 'request_quest'`, `fastDecision.questId` is present, and `!fastDecision.isHostile`. Sets both `fastDecision` and `jevDecision`.
     - `buildDeterministicSystemReply`: Dynamically constructs authentic bilingual replies from `activeSystem(game)` (`nameVi`, `nameEn`, `personalityVi`, `personalityEn`) and `systemQuestsFor(game)` (`quest.nameVi`, `quest.descVi`, `quest.rewardGold`, `quest.nameEn`, `quest.descEn`). Zero hardcoded query-matching strings detected.
     - `requestSystemReply`: Implements 2-tier pipeline: Tier 1 fast reflex `classifySystemUtterance`, Tier 2 generative LLM `/api/narrate` with 2000ms timeout guard.
     - Hallucination Defense: If Tier 2 returns `offer_quest` with an unauthorized `questId` not in `payload.questPool`, it returns `null`.
     - Graceful degradation: If `/api/narrate` fails, times out, or throws, falls back to `buildDeterministicSystemReply`, returning an authentic `SystemReply`.
     - Early exits: Returns `null` without invoking fetch when `!narrationWanted()`, `activeSystem(game) === null`, or message is empty whitespace.

2. **Scenario Containment Verification (`test/system-scenario.test.ts`):**
   - Core modules tested:
     - `src/content/system-defs.ts`
     - `src/content/system-quests.ts`
     - `src/engine/system-runtime.ts`
     - `src/ai/system.ts`
     - `src/content/system-messages.ts`
     - `src/engine/system.ts`
   - Prohibited pattern: `/\bfrom\s+['"](?:\.\.\/)+content\/(?:story|npcs|locations|endings-data|chapters|quests)['"]/u`
   - Verification command: `npx vitest run test/system-scenario.test.ts`
   - Result: `✓ test/system-scenario.test.ts (1 test) 37ms` — Exit code 0, 0 violations.

3. **Empirical Forensic & Adversarial Test Execution:**
   - Authored and executed an empirical forensic test suite covering 13 adversarial scenarios:
     - Zod schema boundary validation (rejects invalid intents, out-of-range scores >5 or <1, confidence >1).
     - Authentic HTTP payload construction (POST, headers, model, state, questions, bounded choices).
     - Jev client hallucination rejection (unauthorized quest ID stripped to `undefined`).
     - HTTP 500 error & malformed JSON fallback recovery.
     - Deterministic system reply authenticity for all 6 intents across multiple system personas.
     - Null system handling without exceptions.
     - Tier 2 LLM hallucination defense (returns `null` on unpooled quest).
     - Tier 2 LLM 503 fallback to deterministic reply.
     - Zero-fetch guarantee when `VITE_AI_NARRATION_ENABLED=false`.
     - Message sanitization and truncation to 300 characters.
   - Command: `npx vitest run test/auditor-forensic-m2.test.ts`
   - Result: `✓ test/auditor-forensic-m2.test.ts (13 tests) 127ms` — 13 passed, 0 failed.
   - Cleaned up temporary test file following audit execution.

4. **Regression & Challenger Suite Execution:**
   - `npm run typecheck`: Exit code 0, 0 errors.
   - `npx vitest run test/ai-jev-system.test.ts test/ai-system.test.ts`: Exit code 0, 8 passed (8).
   - `npx vitest run test/adversarial-jev-system.test.ts test/challenger-m2-boundary-concurrency.test.ts`: Exit code 0, 31 passed (31).
   - `npx eslint src/ai/system.ts src/ai/jev-schemas.ts src/ai/jev-client.ts`: Exit code 0, 0 errors, 0 warnings.
   - `npm run agent:check`: Exit code 0 (`agent-os: OK - shared rules, MCP registry, and tool bridges are present.`).

5. **Operating Contract (AGENTS.md) Compliance:**
   - Active claim `jev-system-two-tier` registered in `docs/agent-work/active/jev-system-two-tier.md`.
   - Worktree discipline: Only assigned scope `src/ai/system.ts` was modified. No foreign files or existing configurations overwritten.

---

## 2. Logic Chain

1. **Premise 1 (Authenticity vs. Facade):** A facade implementation returns static constants or uses dummy mocks embedded in production code. Static analysis and runtime inspection of `src/ai/jev-client.ts` and `src/ai/system.ts` confirm that network calls are structured using standard Web APIs (`fetch`, `AbortController`), request payloads are fully populated from live `GameState`, and response schemas are parsed using Zod with runtime error handling. (Supported by Obs 1, Obs 3).
2. **Premise 2 (Dynamic Construction vs. Hardcoded Test Matches):** When tested with dynamic system configurations (`systemId: 'sys_battle'`), `buildDeterministicSystemReply` generated quest names (`【Chiến Đấu I】 Thử Thách Máu`), rewards (`45 vàng`), and personality quotes directly derived from `systemQuestsFor(game)` and `activeSystem(game)`. No hardcoded query/response string pairs exist in the codebase. (Supported by Obs 1, Obs 3).
3. **Premise 3 (Defense Against Hallucination & Failures):**
   - In Tier 1, unpooled quest IDs are rejected and mapped to `undefined`.
   - In Tier 2, unpooled quest IDs from generative LLM are rejected and return `null`.
   - Network errors, timeouts (>600ms for Jev, >2000ms for LLM), and HTTP 5xx errors consistently trigger graceful fallback without throwing exceptions to UI callers. (Supported by Obs 1, Obs 3, Obs 4).
4. **Premise 4 (Scenario Containment & Isolation):** `test/system-scenario.test.ts` confirms zero imports from authored Scenario-I content directories, preserving strict architectural boundaries. (Supported by Obs 2).
5. **Premise 5 (Contract & Scope Adherence):** `npm run agent:check` and git diff confirm proper claim tracking and isolation to assigned scope. (Supported by Obs 5).

Therefore, all integrity criteria are satisfied.

---

## 3. Caveats

- **External Network Dependency:** In the test environment, the live remote Jev API (`https://api.typesafe.ai/v1/systemone`) was verified via mock injection and offline fallback paths because a live cloud API key was not provisioned in the local environment. The fallback and payload construction logic was verified directly and completely.
- No other caveats.

---

## 4. Conclusion

**Verdict: CLEAN**

Milestone 2 implementation in `src/ai/system.ts`, `src/ai/jev-client.ts`, and `src/ai/jev-schemas.ts` exhibits complete authentic functionality, rigorous type-safety with Zod, dynamic in-character fallback, strict hallucination defense, and zero integrity violations.

---

## 5. Verification Method

To independently verify this verdict:
1. Run typecheck: `npm run typecheck` (Exit code 0)
2. Run M2 test suites: `npx vitest run test/ai-jev-system.test.ts test/ai-system.test.ts` (8/8 pass)
3. Run scenario containment test: `npx vitest run test/system-scenario.test.ts` (1/1 pass)
4. Run challenger test suites: `npx vitest run test/adversarial-jev-system.test.ts test/challenger-m2-boundary-concurrency.test.ts` (31/31 pass)
5. Run lint check: `npx eslint src/ai/system.ts src/ai/jev-schemas.ts src/ai/jev-client.ts` (0 errors)
6. Run agent contract check: `npm run agent:check` (Exit code 0)
