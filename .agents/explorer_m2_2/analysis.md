# Backward Compatibility & Test Alignment Analysis for `src/ai/system.ts`

**Agent:** Explorer 2 (`explorer_m2_2`)  
**Milestone:** Milestone 2 (`teamwork_preview_explorer` — 2-Tier Pipeline in The System)  
**Date:** 2026-09-20  
**Target File:** `src/ai/system.ts`  

---

## 1. Executive Summary

This investigation evaluates the backward-compatibility constraints, test alignment, and interface contracts for updating `src/ai/system.ts` to implement the 2-Tier AI Pipeline (Tier 1: Jev System One $\rightarrow$ Tier 2: Generative LLM Narration).

### Core Findings
1. **Existing Test Invariants (`test/ai-system.test.ts`)**:
   - `buildSystemPayload` is tested synchronously for whitespace collapsing, strict quest pooling from active system (`systemQuestsFor(game)`), and exact object structure (`mode: 'chat'`, `locale`, `system: { id }`, `playerMessage`).
   - `requestSystemReply` is tested for:
     - Accepting only pooled quest IDs when `kind === 'offer_quest'`, stripping surrounding whitespace from `textVi` / `textEn`.
     - Rejecting unpooled quest IDs (`q_sys_void_01`) by returning `null`.
     - Rejecting requests deterministically when `VITE_AI_NARRATION_ENABLED=false` without making any HTTP fetch calls (`toHaveBeenCalledOnce()` across sequential tests).
2. **Hidden Critical Test: `test/system-scenario.test.ts`**:
   - Line 9 explicitly includes `../src/ai/system.ts` in `CORE_FILES`.
   - Line 14 enforces `AUTHORED_SCENARIO_IMPORT` regex check: `src/ai/system.ts` **MUST NOT** import anything from `../content/(story|npcs|locations|endings-data|chapters|quests)`. All engine references must come through `../engine`.
3. **UI Consumer Contracts (`LeftRailTabContent.tsx`, `GameScreen.tsx`)**:
   - Both components consume `requestSystemReply(game, message, locale): Promise<SystemReply | null>`.
   - Both handle `null` gracefully with localized fallback text.
   - Neither UI component currently calls Jev directly; both expect `SystemReply` with optional `questId`.
4. **Mock Isolation in UI Tests (`dock-quests.test.tsx`, `system-ui.ui.test.tsx`)**:
   - Both test suites mock `../src/ai/system` via `vi.mock('../src/ai/system', () => ({ requestSystemReply: ... }))`.
   - Any new export (such as `fastClassifySystem`) is safe as an optional helper, but UI components must NOT be changed to mandate `fastClassifySystem` during this milestone without updating mocks.
5. **Fast Classification (`fastClassifySystem`) Recommendation**:
   - Exporting `fastClassifySystem(game, message, config?)` from `src/ai/system.ts` as a wrapper around `classifySystemUtterance` enables instant UI feedback (~80ms) for future UI adoption while keeping `requestSystemReply` as the unified 2-tier orchestrator.

---

## 2. Detailed Breakdown of `test/ai-system.test.ts` Assertions

The test file `test/ai-system.test.ts` contains 3 critical tests covering all baseline expectations for `src/ai/system.ts`:

### Test 1: `builds a bounded payload from the selected System quest pool only`
- **Target Function**: `buildSystemPayload(game: GameState, message: string, locale: Locale): SystemChatPayload | null`
- **Input**: `game = { ...newGame('system-ai'), systemId: 'sys_battle' }`, message `'  hello\n system  '`, locale `'en'`.
- **Assertions**:
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
- **Requirements for Milestone 2**:
  - `buildSystemPayload` must remain an exported synchronous function.
  - Signature must accept `(game: GameState, message: string, locale: Locale, decision?: SystemFastDecision)`.
  - Default `mode` when no quest is identified is `'chat'`.
  - Whitespace sanitization (`replace(/\s+/g, ' ').trim().slice(0, 300)`) must be preserved.
  - Adding optional `decision?: SystemFastDecision` to `SystemChatPayload` will not break `toMatchObject`.

### Test 2: `accepts a reply offering only a pooled quest and sanitizes text`
- **Target Function**: `requestSystemReply(game: GameState, message: string, locale: Locale): Promise<SystemReply | null>`
- **Mock Setup**:
  ```typescript
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      kind: 'offer_quest',
      questId: 'q_sys_battle_01',
      textVi: '  Nhiệm vụ\nđã tải. ',
      textEn: ' Quest\nloaded.  '
    }),
  })
  vi.stubGlobal('fetch', fetchMock)
  ```
- **Assertions**:
  ```typescript
  await expect(requestSystemReply({ ...newGame('system-ai-reply'), systemId: 'sys_battle' }, 'offer', 'en'))
    .resolves.toEqual({
      kind: 'offer_quest',
      questId: 'q_sys_battle_01',
      textVi: 'Nhiệm vụ đã tải.',
      textEn: 'Quest loaded.',
    })
  ```
- **Requirements for Milestone 2**:
  - The input message in this test is `'offer'`. In `src/ai/jev-client.ts`, `'offer'` does not match the Vietnamese regex (`/nhiệm vụ|việc gì|làm gì|kiếm tiền|quest|task/`), so `fallbackRuleBasedClassifier` returns `intent: 'chat_general'`.
  - However, the mock LLM returned `kind: 'offer_quest'` and `questId: 'q_sys_battle_01'`.
  - **CRITICAL**: `requestSystemReply` must accept the LLM's valid pooled quest offer and text even if Tier 1 fallback didn't tag it as `request_quest`. Tier 1 classifies and provides hints to Tier 2, but does NOT invalidate valid LLM output that passes questPool containment.
  - `fetchMock` is stubbed with the `/api/narrate` response format (not Jev response format). Because `TYPESAFE_API_KEY` is not set in `test/ai-system.test.ts`, Jev executes offline fallback without calling `fetch`. If Jev had attempted to call `fetch`, it would have received this non-Jev payload and failed validation. This confirms that the offline fallback must continue to bypass `fetch` when `TYPESAFE_API_KEY` is absent.

### Test 3: `rejects unavailable, invalid, and disabled replies deterministically`
- **Target Function**: `requestSystemReply(game: GameState, message: string, locale: Locale): Promise<SystemReply | null>`
- **Mock Setup & Execution**:
  ```typescript
  const game = { ...newGame('system-ai-reject'), systemId: 'sys_battle' }
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ kind: 'offer_quest', questId: 'q_sys_void_01', textVi: 'No.', textEn: 'No.' }),
  })
  vi.stubGlobal('fetch', fetchMock)
  await expect(requestSystemReply(game, 'offer', 'en')).resolves.toBeNull()

  vi.stubEnv('VITE_AI_NARRATION_ENABLED', 'false')
  await expect(requestSystemReply(game, 'offer', 'en')).resolves.toBeNull()
  expect(fetchMock).toHaveBeenCalledOnce()
  ```
- **Requirements for Milestone 2**:
  - **Hallucination rejection**: `q_sys_void_01` is not in `payload.questPool` (which contains only `q_sys_battle_01`). It MUST resolve to `null`.
  - **Disabled narration guard**: When `!narrationWanted()`, `requestSystemReply` MUST return `null` immediately.
  - **Call count invariant**: `expect(fetchMock).toHaveBeenCalledOnce()`. The first call made exactly 1 fetch (to `/api/narrate`), and the second call made 0 fetch calls. If Tier 1 Jev made a fetch call during either invocation, `toHaveBeenCalledOnce()` would fail.

---

## 3. Regression & Isolation Analysis with Other Test Suites

| Test Suite | Import from `src/ai/system` | Potential Failure Mode | Prevention / Invariant |
|---|---|---|---|
| `test/ai-system.test.ts` | `buildSystemPayload`, `requestSystemReply` | Extra fetch call, altered payload shape, rejected valid LLM offer | Verify guards, check `TYPESAFE_API_KEY`, preserve `toMatchObject` |
| `test/ai-narration.test.ts` | None (imports `src/ai/narration`) | None | No direct dependency. Unaffected. |
| `test/system-scenario.test.ts` | Scans source code of `src/ai/system.ts` via fs | Forbidden import from `../content/quests` or other scenario files | **MUST NOT** add imports from `../content/(story\|npcs\|locations\|endings-data\|chapters\|quests)`. Use `../engine` only. |
| `test/dock-quests.test.tsx` | Mocks `requestSystemReply` | Missing exported functions if UI calls them | UI must not call new functions without fallbacks. |
| `test/system-ui.ui.test.tsx` | Mocks `requestSystemReply` | Missing mock if UI calls new helper | UI must continue to work with mocked `requestSystemReply`. |
| `test/ai-jev-system.test.ts` | Imports `classifySystemUtterance` from `src/ai/jev-client` | None | Client module already verified (5/5 tests pass). |

---

## 4. UI Consumer Audit

### 1. `src/ui/LeftRailTabContent.tsx`
- **Import**: `import { requestSystemReply } from '../ai/system'` (Line 17)
- **Call site** (Lines 162–180):
  ```tsx
  void requestSystemReply(game, msg, locale).then((reply) => {
    setIsReplying(false)
    if (reply !== null) {
      setUserMessages((prev) => [
        ...prev,
        {
          sender: 'system',
          text: vi ? reply.textVi : reply.textEn,
          questId: reply.questId,
        },
      ])
    } else {
      const fallback = system
        ? (vi ? `【${system.nameVi}】: ${system.personalityVi}` : `[${system.nameEn}]: ${system.personalityEn}`)
        : (vi ? 'Hệ Thống im lặng.' : 'The System is silent.')
      setUserMessages((prev) => [...prev, { sender: 'system', text: fallback }])
    }
  })
  ```
- **Compatibility**:
  - `requestSystemReply` must accept `(game: GameState, message: string, locale: Locale)` and return `Promise<SystemReply | null>`.
  - `reply.questId` triggers the "Nhận nhiệm vụ" button (line 510).
  - When `reply === null`, fallback is rendered cleanly.

### 2. `src/ui/GameScreen.tsx`
- **Import**: `import { requestSystemReply, type SystemReply } from '../ai/system'` (Line 55)
- **State**: `const [systemReply, setSystemReply] = useState<SystemReply | null>(null)` (Line 235)
- **Call site** (Lines 595–598):
  ```tsx
  void requestSystemReply(game, systemMessage, locale).then((reply) => {
    setSystemReplying(false)
    setSystemReply(reply)
  })
  ```
- **Render site** (Line 955):
  ```tsx
  {systemReply !== null ? (
    <p role="status">
      {locale === 'vi' ? systemReply.textVi : systemReply.textEn}
      {systemReply.questId !== undefined && questStatus(game, systemReply.questId) === 'available' && (
        <button
          disabled={game.terminal || encounterLocked}
          onClick={() => {
            onAction({ kind: 'system_accept_quest', questId: systemReply.questId! })
            setSystemReply(null)
          }}
          type="button"
        >
          {t(locale, 'system.acceptQuest')}
        </button>
      )}
    </p>
  ) : (
    <small>{t(locale, 'system.chatFallback')}</small>
  )}
  ```
- **Compatibility**:
  - Type `SystemReply` and signature `requestSystemReply` are 100% compatible.

---

## 5. Fast Classification (`fastClassifySystem`) Feasibility & 2-Tier Architecture

### 5.1 The Opportunity
As specified in `jev_integration_spec.md` Section 1.2:
- **Tier 1 (Jev System One / ~80ms)**: Fast reflex classification. Resolves `intent`, bounded `questId`, `obedienceScore`, and `isHostile`.
- **Tier 2 (LLM / 1–2s)**: Generative stylistic narration. Receives the pre-classified decision to generate immersive dialogue.

### 5.2 Helper Export Design
In `src/ai/system.ts`:
```typescript
import { classifySystemUtterance, type JevClientConfig } from './jev-client'
import type { SystemFastDecision } from './jev-schemas'

export async function fastClassifySystem(
  game: GameState,
  message: string,
  config?: JevClientConfig
): Promise<SystemFastDecision> {
  return classifySystemUtterance(game, message, config)
}
```

### 5.3 2-Tier Pipeline Flow in `requestSystemReply`
```
1. Check narrationWanted() -> if false, return null immediately.
2. Sanitize playerMessage. If empty, return null.
3. Tier 1 Fast Classification:
   const decision = options?.decision ?? await classifySystemUtterance(game, sanitizedMessage, options?.config)
4. Build Tier 2 Payload:
   const payload = buildSystemPayload(game, sanitizedMessage, locale, decision)
5. Tier 2 Narration:
   POST /api/narrate with payload.
   Validate response: kind, textVi, textEn, and questId in payload.questPool.
   If invalid or error, return null (preserving existing contract and tests).
```

### 5.4 Instant UI Feedback Feasibility
- By exporting `fastClassifySystem`, UI components in future milestones or optional updates can invoke:
  ```typescript
  const decision = await fastClassifySystem(game, msg)
  // ~80ms: trigger instant UI sound, badge, or tentative state
  const reply = await requestSystemReply(game, msg, locale, { decision })
  // ~1500ms: display complete narrative dialogue
  ```
- If the UI caller does not pass `decision`, `requestSystemReply` executes Tier 1 automatically.

---

## 6. Verification Checklist for Tests and Types

Before completing Milestone 2 or merging changes to `src/ai/system.ts`, verify:

- [ ] **Typecheck**: `npm run typecheck` exits with code 0 (no TS errors).
- [ ] **Jev Classifier Suite**: `npx vitest run test/ai-jev-system.test.ts` passes 5/5 tests.
- [ ] **System Narration Suite**: `npx vitest run test/ai-system.test.ts` passes 3/3 tests.
- [ ] **Narration Suggestions Suite**: `npx vitest run test/ai-narration.test.ts` passes 7/7 tests.
- [ ] **Containment Rule**: `npx vitest run test/system-scenario.test.ts` passes 1/1 test.
- [ ] **UI Panel Mocks**: `npx vitest run test/dock-quests.test.tsx test/system-ui.ui.test.tsx` passes 26/26 tests.
- [ ] **Full Regression**: `npm test` passes all 150 test suites (1246+ tests).
- [ ] **Agent OS Contract**: `npm run agent:check` reports OK.
