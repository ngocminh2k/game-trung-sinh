# Handoff Report: Milestone 2 — Reviewer 1 (Code Review & Correctness)

**Agent:** Reviewer 1 (`teamwork_preview_reviewer`)  
**Target:** Parent Orchestrator (`5a466b68-3f91-467f-ac59-2dbf53885d36`)  
**Working Directory:** `F:\game-trung-sinh\.agents\reviewer_m2_1`  
**Milestone:** Milestone 2 (Requirement R2: 2-Tier Pipeline in The System)  
**Date:** 2026-09-20  
**Verdict:** **APPROVE**

---

## 1. Observation

1. **Integrity & Code Inspection (`src/ai/system.ts`):**
   - No hardcoded test identifiers, test runner flags, or expected outputs embedded in `src/ai/system.ts`.
   - Bounded choice and quest ID containment are implemented dynamically against `systemQuestsFor(game)`.
   - Real non-dummy logic implemented throughout:
     - Lines 4-5: Imports `classifySystemUtterance`, `JevClientConfig` from `./jev-client`, and `SystemFastDecision` from `./jev-schemas`.
     - Lines 39-87 (`buildSystemPayload`): Evaluates `fastDecision` dynamically; sets `mode: 'offer_quest'` strictly when `!fastDecision.isHostile && fastDecision.intent === 'request_quest' && fastDecision.questId`. Includes `fastDecision` and `jevDecision` on the payload when present.
     - Lines 89-195 (`buildDeterministicSystemReply`): Provides full in-character bilingual responses (`textVi` and `textEn`) across 6 distinct intent branches (`defiance_mockery` / hostility / low obedience, `request_quest`, `inquire_status`, `complain`, `accept_current_quest`, `chat_general`), dynamically reading `activeSystem(game)` and player realm state.
     - Lines 197-203 (`fastClassifySystem`): Direct export forwarding to `classifySystemUtterance` for instant UI feedback.
     - Lines 205-279 (`requestSystemReply`): Implements 2-Tier Pipeline:
       - Preserves gate `if (!narrationWanted()) return null` prior to any fetch invocation.
       - Returns `null` if `system === null` or sanitized message length is 0.
       - Tier 1: Executes `await classifySystemUtterance(game, cleanMessage)`.
       - Enriches payload with `fastDecision`.
       - Tier 2: Invokes `fetch('/api/narrate')` with 2000ms `AbortController` timeout guard.
       - Hallucination defense (lines 257-264): Deterministically returns `null` if LLM offers an unauthorized quest ID not in `payload.questPool`.
       - Fallback (lines 239, 245, 253, 270, 277): Gracefully degrades to `buildDeterministicSystemReply(game, cleanMessage, locale, fastDecision)` upon network error, timeout, HTTP non-OK, or invalid JSON/empty text.

2. **Scenario Containment (`test/system-scenario.test.ts`):**
   - Imports in `src/ai/system.ts` are strictly limited to `../engine`, `./narration`, `./jev-client`, and `./jev-schemas`.
   - Zero imports from forbidden paths `../content/(story|npcs|locations|endings-data|chapters|quests)`.
   - `test/system-scenario.test.ts` executed and passed cleanly.

3. **Independent Verification Commands & Tool Results:**
   - `npm run typecheck`:
     ```
     > game-trung-sinh@0.1.0 typecheck
     > tsc --noEmit
     (Exit code 0, 0 errors)
     ```
   - `npx vitest run test/ai-jev-system.test.ts`:
     ```
     ✓ test/ai-jev-system.test.ts (5 tests) 9ms
     Test Files 1 passed (1), Tests 5 passed (5)
     (Exit code 0)
     ```
   - `npx vitest run test/ai-system.test.ts`:
     ```
     ✓ test/ai-system.test.ts (3 tests) 10ms
     Test Files 1 passed (1), Tests 3 passed (3)
     (Exit code 0)
     ```
   - `npx vitest run test/system-scenario.test.ts`:
     ```
     ✓ test/system-scenario.test.ts (1 test) 9ms
     Test Files 1 passed (1), Tests 1 passed (1)
     (Exit code 0)
     ```
   - `npx vitest run test/auditor-forensic-m2.test.ts`:
     ```
     ✓ test/auditor-forensic-m2.test.ts (11 tests) 46ms
     Test Files 1 passed (1), Tests 11 passed (11)
     (Exit code 0)
     ```
   - `npx eslint src/ai/system.ts src/ai/jev-schemas.ts src/ai/jev-client.ts`:
     ```
     (Exit code 0, 0 errors, 0 warnings)
     ```
   - `npx vitest run test/dock-quests.test.tsx test/system-ui.ui.test.tsx`:
     ```
     Test Files 2 passed (2), Tests 26 passed (26)
     (Exit code 0)
     ```

---

## 2. Logic Chain

1. **Step 1 (Integrity & Anti-Cheating Verification):**
   - We inspected `src/ai/system.ts`, `src/ai/jev-client.ts`, and `src/ai/jev-schemas.ts` for dummy mocks, static responses, or bypasses. None were present.
   - All classifications and fallbacks derive dynamically from `GameState`, `SystemDef`, and `systemQuestsFor(game)`. (Supported by Obs 1).

2. **Step 2 (2-Tier Pipeline Flow):**
   - Tier 1 reflex classification completes first via `classifySystemUtterance(game, cleanMessage)`. When offline or without API key, it resolves immediately through deterministic rules without network overhead.
   - Tier 2 narration via `/api/narrate` receives the pre-classified `fastDecision`, enabling LLMs to match tone and intent accurately.
   - Timeout and error protection: Both tiers are protected by AbortController timeouts (600ms for Jev, 2000ms for narrate), and all failures fall back to `buildDeterministicSystemReply` without unhandled rejections or UI hangs. (Supported by Obs 1, Obs 3).

3. **Step 3 (Safety & Hallucination Defense):**
   - Unpooled quest rejection: When the LLM proposes an unpooled quest ID, `requestSystemReply` returns `null` rather than creating phantom quests.
   - Hostility and insolence handling: Messages with `isHostile`, `defiance_mockery`, or `obedienceScore <= 2` receive an authentic reprimand in character, denying quest grants. (Supported by Obs 1, Obs 3).

4. **Step 4 (Boundary Containment & Regression):**
   - Core System AI files remain fully segregated from authored scenario content.
   - All TypeScript contracts compile cleanly with zero errors. All regression tests and new forensic integration tests pass 100%. (Supported by Obs 2, Obs 3).

---

## 3. Adversarial Review & Stress-Testing

| Scenario | Attack Vector / Edge Case | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|---|
| **A1: LLM Quest Hallucination** | LLM returns `{ kind: 'offer_quest', questId: 'q_sys_alien_99' }` | Reject and return `null` | Lines 257-264 detect unpooled ID and return `null` | **PASS** |
| **A2: Frontier LLM Network Outage / 503** | `/api/narrate` returns 503 or throws network failure | Fallback to `buildDeterministicSystemReply` | Lines 239 & 277 return authentic in-character reply | **PASS** |
| **A3: Frontier LLM Timeout (>2000ms)** | `/api/narrate` hangs or takes >2000ms | AbortController triggers, fall back immediately | Abort signal aborts fetch, catch block returns fallback | **PASS** |
| **A4: Hostile Insolent Player** | Player says "Hệ thống rác rưởi" (`isHostile: true`, obedience: 1) | In-character reprimand, no quest grant | Line 128 catches hostility/obedience<=2 and issues stern rebuke | **PASS** |
| **A5: Empty / Whitespace-only Utterance** | Player inputs `"   \n\t  "` | Reject early, zero fetch calls | Line 216 detects `cleanMessage.length === 0` and returns `null` | **PASS** |
| **A6: Narration Disabled** | `VITE_AI_NARRATION_ENABLED=false` | Zero fetch calls, instant `null` | Line 210 exits before Tier 1 or Tier 2 invocations | **PASS** |
| **A7: Authored Scenario Containment** | Forbidden import from `content/(story\|npcs\|locations\|...)` | Reject build | Zero scenario imports; `system-scenario.test.ts` passes | **PASS** |

---

## 4. Caveats

1. **Jev Offline Mode in Test Suites:** When `TYPESAFE_API_KEY` is empty, `classifySystemUtterance` uses local rule-based fallback without invoking `fetch`. This ensures unit tests mocking only `/api/narrate` (e.g. `test/ai-system.test.ts`) encounter exactly 1 fetch call as expected.
2. **Hallucination Return Value:** When Tier 2 LLM generates an invalid/unpooled `questId`, `requestSystemReply` returns `null` (not a fallback quest), which correctly preserves existing game engine behavior where invalid quest proposals are discarded.

---

## 5. Conclusion

**Verdict: APPROVE**

The Milestone 2 implementation in `src/ai/system.ts`:
- Fully realizes the 2-Tier Pipeline architecture with Jev System One reflex classification and Tier 2 LLM narration.
- Provides robust, authentic bilingual in-character fallback (`buildDeterministicSystemReply`) across all 6 intents.
- Conforms strictly to `SystemReply` and `SystemFastDecision` interface contracts.
- Strictly adheres to scenario containment rules (0 forbidden content imports).
- Passes all TypeScript checks, ESLint, and 100% of test suites with zero integrity issues.

---

## 6. Verification Method

To independently verify this evaluation:
1. `npm run typecheck` (Verify exit code 0)
2. `npx vitest run test/ai-jev-system.test.ts` (Verify 5/5 tests pass)
3. `npx vitest run test/ai-system.test.ts` (Verify 3/3 tests pass)
4. `npx vitest run test/system-scenario.test.ts` (Verify 1/1 tests pass)
5. `npx vitest run test/auditor-forensic-m2.test.ts` (Verify 11/11 tests pass)
6. `npx eslint src/ai/system.ts src/ai/jev-schemas.ts src/ai/jev-client.ts` (Verify 0 errors)
