# Handoff Report: Milestone 2 — Explorer 1 (System 2-Tier Pipeline Architecture)

**Agent:** Explorer 1 (`teamwork_preview_explorer`)  
**Target:** Parent Orchestrator (`5a466b68-3f91-467f-ac59-2dbf53885d36`) & Worker (`worker_m2_1`)  
**Working Directory:** `F:\game-trung-sinh\.agents\explorer_m2_1`  
**Milestone:** M2 (Requirement R2: 2-Tier Pipeline in The System)  
**Date:** 2026-09-20  

---

## 1. Observation

1. **`src/ai/system.ts` Baseline (Lines 64–88):**
   - Directly calls `/api/narrate` with unclassified `playerMessage`:
     ```typescript
     export async function requestSystemReply(game: GameState, message: string, locale: Locale): Promise<SystemReply | null> {
       if (!narrationWanted()) return null
       const payload = buildSystemPayload(game, message, locale)
       if (payload === null || payload.playerMessage.length === 0) return null
       try {
         const response = await fetch('/api/narrate', { ... })
         if (!response.ok) return null
         ...
       } catch {
         return null
       }
     }
     ```
   - On network error or offline proxy (`!response.ok` / `catch`), it blindly returns `null`, leaving the UI to display a static fallback string without offering quests or acknowledging the player's intent.
2. **`src/ai/jev-client.ts` Implementation (Lines 14–115):**
   - Provides `classifySystemUtterance(game: GameState, playerMessage: string, config?: JevClientConfig): Promise<SystemFastDecision>`.
   - Bounds `selectedQuestId` to `[...systemQuestsFor(game).map(q => q.id), 'none']`.
   - Has a 600ms AbortController timeout and instantaneous fallback to `fallbackRuleBasedClassifier` when offline or when `TYPESAFE_API_KEY` is missing.
   - Guaranteed never to throw an unhandled exception.
3. **Existing Test Suite in `test/ai-system.test.ts` (Lines 28–51):**
   - Line 35: Expects `requestSystemReply` to resolve to `{ kind: 'offer_quest', questId: 'q_sys_battle_01', textVi: '...', textEn: '...' }` when fetch returns valid pooled quest data.
   - Line 46: Expects `resolves.toBeNull()` when fetch returns an unpooled `questId` (`q_sys_void_01`).
   - Line 49: Expects `resolves.toBeNull()` when `VITE_AI_NARRATION_ENABLED === 'false'`.
4. **UI Consumers (`src/ui/GameScreen.tsx:955` and `src/ui/LeftRailTabContent.tsx:162-179`):**
   - Both consume `requestSystemReply(game, msg, locale)` returning `SystemReply | null`.
   - When `reply.kind === 'offer_quest'` and `reply.questId` is present, the UI renders the action button `{ kind: 'system_accept_quest', questId: reply.questId }`.
5. **Full Regression Health:**
   - Command `npm test` executed across all 150 test files with 1246 tests passing green (0 failures).

---

## 2. Logic Chain

1. **Step 1 (Tier 1 Reflex):** Integrating `classifySystemUtterance(game, cleanMessage)` as Tier 1 inside `requestSystemReply` provides an immediate (~80ms) structured decision (`SystemFastDecision`: intent, questId, obedienceScore, isHostile). (Supported by Obs 2).
2. **Step 2 (Hostility & Defiance Defenses):** If `fastDecision.isHostile === true` or `fastDecision.intent === 'defiance_mockery'`, The System must withhold all quest offers (`mode: 'chat'`, `questId: undefined`). Tone must be strictly disciplinary reflecting `obedienceScore: 1` and the System's personality. (Supported by Obs 2, Obs 4).
3. **Step 3 (Quest Offer Routing):** If `fastDecision.intent === 'request_quest'` and `fastDecision.questId` is valid, `mode: 'offer_quest'` is signaled. Both Tier 2 prompt and offline fallback attach the validated `questId` so the UI can activate the "Accept Quest" button. (Supported by Obs 2, Obs 4).
4. **Step 4 (Tier 2 Context Enrichment):** `SystemChatPayload` is enriched with `jevDecision`. When forwarded to `/api/narrate`, upstream LLMs have full situational awareness of the player's evaluated intent, obedience, and bounded quest. Making `fastDecision` optional in `buildSystemPayload` guarantees backwards compatibility with existing unit tests. (Supported by Obs 1, Obs 3).
5. **Step 5 (In-Character Deterministic Fallback):** When `/api/narrate` fails (timeout, network error, 502/503 status), `buildDeterministicSystemReply` synthesizes a lore-accurate, in-character response derived from `activeSystem(game)` and `fastDecision`. It provides full offline functionality without throwing exceptions or hanging. (Supported by Obs 1, Obs 4).
6. **Step 6 (Preserving Test Contracts):** Rejection of hallucinated quest IDs (`questId` not in pool) must return `null` to pass `test/ai-system.test.ts` line 46. Disabled narration toggle (`!narrationWanted()`) must return `null` to pass line 49. (Supported by Obs 3, Obs 5).

---

## 3. Caveats

1. **Vite Proxy Behavior:** In development mode without LLM credentials, `/api/narrate` returns HTTP 503. The new deterministic fallback gracefully catches this and supplies the in-character response, whereas previously it silently fell back to empty UI strings.
2. **Double Fetch in Tests:** If tests mock `globalThis.fetch` without differentiating URLs, both Jev and `/api/narrate` calls intercept the mock. However, Jev runs offline fallback when `TYPESAFE_API_KEY` is not set, preventing any conflict in standard test suites. In integration tests mocking both endpoints, the mock should inspect the request URL (`typesafe.ai` vs `/api/narrate`).
3. **Engine Boundary:** No game state mutations or content imports are introduced into `src/ai/system.ts`. Quests are queried purely through `systemQuestsFor(game)`.

---

## 4. Conclusion

The architecture for Requirement R2 is fully specified and validated:
1. `src/ai/system.ts` can be upgraded with a 2-Tier Pipeline where `classifySystemUtterance` serves as Tier 1 and `/api/narrate` serves as Tier 2.
2. `SystemFastDecision` provides complete hostility handling and deterministic quest dispatching.
3. `buildDeterministicSystemReply` provides a bulletproof offline fallback, ensuring zero UI exceptions, instant degradation, and full game playability in air-gapped environments.
4. The line-by-line implementation strategy in `analysis.md` is ready for immediate application by the Worker.

---

## 5. Verification Method

### 5.1 Independent Verification Commands
1. Run Jev test suite:
   ```powershell
   npx vitest run test/ai-jev-system.test.ts
   ```
2. Run System AI integration tests:
   ```powershell
   npx vitest run test/ai-system.test.ts
   ```
3. Run TypeScript typecheck:
   ```powershell
   npm run typecheck
   ```
4. Run full regression suite:
   ```powershell
   npm test
   ```

### 5.2 Key Invalidation Conditions
- Any change to `src/ai/system.ts` that causes `test/ai-system.test.ts` to fail.
- Any unhandled exception thrown when `/api/narrate` is offline or times out.
- Any questId offered that does not exist in `systemQuestsFor(game)`.
