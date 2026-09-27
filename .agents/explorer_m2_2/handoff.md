# Handoff Report: Milestone 2 Backward Compatibility & Test Alignment for `src/ai/system.ts`

**From:** Explorer 2 (`explorer_m2_2`)  
**To:** Parent Orchestrator (`orchestrator_2`) / Implementer  
**Status:** Complete (Hard Handoff)  
**Date:** 2026-09-20  

---

## 1. Observation

1. **`test/ai-system.test.ts` (lines 12–52)**:
   - Line 12–26: `buildSystemPayload` tests:
     ```typescript
     expect(payload).toMatchObject({
       mode: 'chat',
       locale: 'en',
       system: { id: 'sys_battle' },
       playerMessage: 'hello system',
     })
     expect(payload?.questPool).toHaveLength(1)
     expect(payload?.questPool[0]?.id).toBe('q_sys_battle_01')
     expect(payload?.questPool.every((quest) => quest.id.startsWith('q_sys_battle_'))).toBe(true)
     ```
   - Line 28–37: `requestSystemReply` resolves valid offer:
     ```typescript
     await expect(requestSystemReply({ ...newGame('system-ai-reply'), systemId: 'sys_battle' }, 'offer', 'en'))
       .resolves.toEqual({ kind: 'offer_quest', questId: 'q_sys_battle_01', textVi: 'Nhiệm vụ đã tải.', textEn: 'Quest loaded.' })
     ```
   - Line 39–51: Rejection and call count constraint:
     ```typescript
     await expect(requestSystemReply(game, 'offer', 'en')).resolves.toBeNull()
     vi.stubEnv('VITE_AI_NARRATION_ENABLED', 'false')
     await expect(requestSystemReply(game, 'offer', 'en')).resolves.toBeNull()
     expect(fetchMock).toHaveBeenCalledOnce()
     ```
2. **`test/system-scenario.test.ts` (lines 5–23)**:
   - Line 9: `'../src/ai/system.ts'` is listed in `CORE_FILES`.
   - Line 14: `AUTHORED_SCENARIO_IMPORT = /\bfrom\s+['"](?:\.\.\/)+content\/(?:story|npcs|locations|endings-data|chapters|quests)['"]/u`.
   - Line 20: `expect(source, relativePath).not.toMatch(AUTHORED_SCENARIO_IMPORT)`.
   - Verified that `src/ai/system.ts` must never import directly from `../content/quests`.
3. **UI Call Sites**:
   - `src/ui/LeftRailTabContent.tsx:17` and `162`: `void requestSystemReply(game, msg, locale).then((reply) => { ... })`.
   - `src/ui/GameScreen.tsx:55` and `595`: `void requestSystemReply(game, systemMessage, locale).then((reply) => { ... })`.
   - Both expect `reply: SystemReply | null` with `{ kind, textVi, textEn, questId? }`.
4. **Existing Mocking in UI Tests**:
   - `test/dock-quests.test.tsx:19`: `vi.mock('../src/ai/system', () => ({ requestSystemReply: vi.fn().mockResolvedValue({ kind: 'idle', textVi: '', textEn: '' }) }))`.
   - `test/system-ui.ui.test.tsx:14`: `vi.mock('../src/ai/system', () => ({ requestSystemReply: vi.fn().mockResolvedValue({ kind: 'offer_quest', textVi: 'Đề nghị', textEn: 'Quest offer', questId: 'q_sys_battle_01' }) }))`.
5. **Baseline Test & Type Status**:
   - `npx vitest run test/ai-jev-system.test.ts`: 5/5 passed.
   - `npx vitest run test/ai-system.test.ts`: 3/3 passed.
   - `npx vitest run test/ai-narration.test.ts`: 7/7 passed.
   - `npx vitest run test/system-scenario.test.ts`: 1/1 passed.
   - `npm test`: 150 test suites passed (1246 tests).
   - `npm run typecheck`: 0 errors.

---

## 2. Logic Chain

1. **Test Invariant Preservation**:
   - Observation 1 shows `expect(fetchMock).toHaveBeenCalledOnce()` when testing disabled narration.
   - If `requestSystemReply` calls `narrationWanted()` first and returns `null` if false, no fetch is performed for disabled narration.
   - In `test/ai-system.test.ts`, `TYPESAFE_API_KEY` is not set. `classifySystemUtterance` uses `fallbackRuleBasedClassifier` synchronously without calling `fetch`.
   - Therefore, calling `classifySystemUtterance` before `/api/narrate` produces 0 extra fetch calls in existing tests, preserving `toHaveBeenCalledOnce()`.
2. **LLM Output Precedence**:
   - Observation 1 shows that in test 2, the message is `'offer'`. The offline rule-based fallback classifies this as `chat_general`.
   - However, the mock LLM returned `offer_quest` with `q_sys_battle_01`. The test asserts that `requestSystemReply` resolves to `{ kind: 'offer_quest', questId: 'q_sys_battle_01', ... }`.
   - Therefore, `requestSystemReply` must not reject a valid pooled quest offer from LLM just because Tier 1 intent was not `request_quest`. Tier 1 informs Tier 2, but valid Tier 2 responses take priority for narration output.
3. **Scenario Isolation Containment**:
   - Observation 2 demonstrates that any import from `../content/quests` in `src/ai/system.ts` causes `test/system-scenario.test.ts` to immediately fail.
   - All quest filtering must continue to use `systemQuestsFor(game)` imported from `../engine`.
4. **UI Consumer Compatibility**:
   - Observation 3 shows both `LeftRailTabContent.tsx` and `GameScreen.tsx` call `requestSystemReply(game, msg, locale)`.
   - Maintaining `requestSystemReply(game: GameState, message: string, locale: Locale, options?: { decision?: SystemFastDecision; config?: JevClientConfig })` preserves 100% backward compatibility for all current callers while allowing pre-computed decisions.
5. **Mock Safety for UI Tests**:
   - Observation 4 shows UI tests mock only `requestSystemReply`.
   - Therefore, UI components must continue to rely on `requestSystemReply` as the primary integration point, and any direct use of `fastClassifySystem` must be optional or guarded.

---

## 3. Caveats

1. **Environment Variable Precedence**:
   - If `TYPESAFE_API_KEY` were set globally in an environment running `test/ai-system.test.ts`, `fetch` would be called by Jev. Because `test/ai-system.test.ts` does not stub `TYPESAFE_API_KEY`, the test suite assumes unit-level execution without external credentials. If necessary, `test/ai-system.test.ts` can be protected or `requestSystemReply` can pass `{ config: { apiKey: '' } }` if isolated mode is desired.
2. **Tier 2 Narration Failure Behavior**:
   - When `/api/narrate` returns non-ok or non-JSON, `requestSystemReply` returns `null` to match the exact contract expected by both UI components and test 3.

---

## 4. Conclusion

Updating `src/ai/system.ts` for Milestone 2 is completely safe and backwards compatible provided that:
1. `requestSystemReply` retains signature `(game: GameState, message: string, locale: Locale, options?: ...): Promise<SystemReply | null>`.
2. `buildSystemPayload` retains signature `(game: GameState, message: string, locale: Locale, decision?: SystemFastDecision): SystemChatPayload | null`.
3. `fastClassifySystem(game: GameState, message: string, config?: JevClientConfig): Promise<SystemFastDecision>` is exported as a first-class helper for instant UI feedback (~80ms).
4. `src/ai/system.ts` never imports from `../content/quests` (must use `../engine`).
5. `if (!narrationWanted()) return null` remains the first line of `requestSystemReply`.

---

## 5. Verification Method

To independently verify backward compatibility and test alignment:

```powershell
# 1. Verify TypeScript types
npm run typecheck

# 2. Verify all AI test suites (Jev, System, Narration)
npx vitest run test/ai-jev-system.test.ts test/ai-system.test.ts test/ai-narration.test.ts

# 3. Verify Scenario containment rule
npx vitest run test/system-scenario.test.ts

# 4. Verify UI mock integration tests
npx vitest run test/dock-quests.test.tsx test/system-ui.ui.test.tsx

# 5. Verify full test regression suite
npm test
```

Invalidation conditions:
- Any failure in `test/ai-system.test.ts` (e.g. extra fetch calls, wrong payload structure, or failure to reject unpooled quest).
- Failure in `test/system-scenario.test.ts` due to authored scenario imports.
- TypeScript compiler errors in `src/ai/system.ts` or its consumers.
