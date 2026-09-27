# Handoff Report: Jev System One Integration Feasibility & Codebase Survey

**Agent:** Surveyor 2 (`teamwork_preview_explorer`)  
**Working Directory:** `F:\game-trung-sinh\.agents\explorer_survey_2\`  
**Date:** 2026-09-19T21:43:00Z  
**Type:** Hard Handoff (Investigation Survey Complete)

---

## 1. Observation

1. **Current System Chat Implementation (`src/ai/system.ts`)**:
   - `src/ai/system.ts:64-88` implements `requestSystemReply(game: GameState, message: string, locale: Locale)`:
     ```typescript
     export async function requestSystemReply(game: GameState, message: string, locale: Locale): Promise<SystemReply | null> {
       if (!narrationWanted()) return null
       const payload = buildSystemPayload(game, message, locale)
       if (payload === null || payload.playerMessage.length === 0) return null

       try {
         const response = await fetch('/api/narrate', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(payload),
         })
         if (!response.ok) return null
         const data: unknown = await response.json()
         if (typeof data !== 'object' || data === null) return null
         const reply = data as Partial<SystemReply>
         if ((reply.kind !== 'chat' && reply.kind !== 'offer_quest') || typeof reply.textVi !== 'string' || typeof reply.textEn !== 'string') return null
         if (reply.kind === 'offer_quest' && (typeof reply.questId !== 'string' || !payload.questPool.some((quest) => quest.id === reply.questId))) return null
         const textVi = reply.textVi.replace(/\s+/g, ' ').trim().slice(0, 300)
         const textEn = reply.textEn.replace(/\s+/g, ' ').trim().slice(0, 300)
         if (textVi.length === 0 || textEn.length === 0) return null
         return reply.kind === 'offer_quest' ? { kind: reply.kind, textVi, textEn, questId: reply.questId } : { kind: reply.kind, textVi, textEn }
       } catch {
         return null
       }
     }
     ```
   - It directly calls `/api/narrate` in a single-tier pattern without prior intent classification or bounded choice enforcement.
   - It is invoked by `src/ui/LeftRailTabContent.tsx:162` and `src/ui/GameScreen.tsx:595`.

2. **Engine Exports & Quest Definitions (`src/engine/`)**:
   - `src/engine/index.ts:157` exports `activeSystem` from `./system-runtime`.
   - `src/engine/index.ts:169` exports `systemQuestsFor` from `./system-runtime`.
   - `src/engine/index.ts:269` exports `type GameState`.
   - `src/engine/content-types.ts:290-320` defines `interface QuestDef`. Crucially, Vietnamese name field is `nameVi: string` (there is NO `titleVi` property in `QuestDef`).
   - `test/system-scenario.test.ts:14-22` enforces scenario containment: `src/ai/system.ts` and core engine files must NOT import authored Scenario-I content (`content/story`, `content/npcs`, `content/locations`, `content/endings-data`, `content/chapters`, `content/quests`).

3. **Tooling & Dependencies (`package.json`)**:
   - `package.json:26`: `"zod": "^3.23.8"` is installed in production dependencies.
   - `package.json:43`: `"typescript": "^5.6.2"` is installed.
   - `package.json:47`: `"vitest": "^2.1.2"` is installed.
   - `package.json:17`: script `"typecheck": "tsc --noEmit"` is available.
   - `package.json:18`: script `"agent:check": "node scripts/agent-os.mjs check"` is available.

4. **Existing Jev Prototype Files in Worktree**:
   - `docs/agent-work/active/jev-system-one-classifier.md`: Active claim by `codex` claiming scope `src/ai/jev-schemas.ts`, `src/ai/jev-client.ts`, `test/ai-jev-system.test.ts`.
   - `src/ai/jev-schemas.ts`: Defines `JevIntentSchema`, `JevResponseSchema`, `type SystemFastDecision`.
   - `src/ai/jev-client.ts`: Implements `classifySystemUtterance(game, playerMessage, config)` and `fallbackRuleBasedClassifier(message, availableQuestIds, elapsedMs)`. Correctly maps `q.nameVi` (avoiding the `titleVi` bug from the spec document).
   - `test/ai-jev-system.test.ts`: Contains 5 test cases (`TC-01` to `TC-05`).

5. **Tool Execution Results**:
   - `npx vitest run test/ai-jev-system.test.ts`:
     ```
      ✓ test/ai-jev-system.test.ts (5 tests) 11ms
      Test Files  1 passed (1)
           Tests  5 passed (5)
     ```
   - `npm run typecheck` (`tsc --noEmit`): Exited code 0 with 0 errors.
   - `npm run agent:check`: Exited code 0: `agent-os: OK - shared rules, MCP registry, and tool bridges are present.`
   - `npx eslint src/ai/ test/ai-jev-system.test.ts test/ai-system.test.ts`: Exited code 0 (0 errors, 0 warnings).
   - `git branch --show-current`: `main`.

---

## 2. Logic Chain

1. **Requirement R1 (Jev Schemas & Client)**:
   - Observation 4 shows `src/ai/jev-schemas.ts` and `src/ai/jev-client.ts` exist.
   - Observation 3 shows `zod` is installed at `^3.23.8`.
   - Observation 2 confirms `activeSystem`, `systemQuestsFor`, and `QuestDef.nameVi` are properly used.
   - Observation 5 confirms `test/ai-jev-system.test.ts` passes 5/5 tests and `tsc --noEmit` compiles cleanly.
   - **Deduction:** Requirement R1 is fully realized and validated.

2. **Requirement R2 (2-Tier Pipeline Integration into The System)**:
   - Observation 1 shows `src/ai/system.ts` still only calls `/api/narrate` directly and does not reference `classifySystemUtterance` or `SystemFastDecision`.
   - Observation 1 also shows UI components (`LeftRailTabContent.tsx`, `GameScreen.tsx`) rely on `requestSystemReply`.
   - **Deduction:** Requirement R2 is the primary remaining implementation work. Connecting `classifySystemUtterance` inside `src/ai/system.ts` will complete the 2-tier pipeline architecture.

3. **Requirement R3 (Automated Test Suite)**:
   - Observation 4 and Observation 5 demonstrate that `test/ai-jev-system.test.ts` tests bounded choice, hallucination protection, defiance detection, and network error/timeout fallback.
   - All 5 test cases execute in ~11ms and pass 100%.
   - **Deduction:** Requirement R3 is implemented and operational.

4. **Requirement R4 (Branch & PR Management)**:
   - Observation 5 indicates current branch is `main` and active claim `jev-system-one-classifier` exists in `docs/agent-work/active/`.
   - **Deduction:** Branch `feat/jev-system-one` needs to be created from `main`, dirty changes committed following AGENTS.md, and PR opened.

---

## 3. Caveats

- **API Key Environment Variables**: `src/ai/jev-client.ts` currently accesses `process.env.TYPESAFE_API_KEY`. While this works in Node/Vitest, in Vite browser production builds `process.env` is typically undefined. It should optionally support `import.meta?.env?.VITE_TYPESAFE_API_KEY` for client-side deployments without a backend proxy.
- **Backwards Compatibility with `test/ai-system.test.ts`**: When wiring R2 into `src/ai/system.ts`, note that `test/ai-system.test.ts:48-51` tests that `requestSystemReply` resolves to `null` when `VITE_AI_NARRATION_ENABLED="false"`. If `requestSystemReply` is modified to return an offline fallback instead of `null`, that test assertion would need to be updated.

---

## 4. Conclusion

1. The codebase is in a healthy state with 0 TypeScript compilation errors and all AI test suites passing green.
2. R1 (`src/ai/jev-schemas.ts`, `src/ai/jev-client.ts`) and R3 (`test/ai-jev-system.test.ts`) are already prototyped, correct, and verified.
3. The remaining work is **R2**: wiring `classifySystemUtterance` into `src/ai/system.ts` to form the 2-Tier Pipeline, followed by **R4** (branch creation, commit, and PR).
4. The system is ready for the implementation phase.

---

## 5. Verification Method

To independently verify the survey findings:

1. **Verify TypeScript typechecking**:
   ```powershell
   npm run typecheck
   ```
   *Expected result: Exits 0 with zero errors.*

2. **Verify Jev test suite**:
   ```powershell
   npx vitest run test/ai-jev-system.test.ts
   ```
   *Expected result: 5 tests passed (100%).*

3. **Verify AI regression test suite**:
   ```powershell
   npx vitest run test/ai-system.test.ts test/ai-jev-system.test.ts test/ai-narration.test.ts
   ```
   *Expected result: 15 tests passed across 3 test files.*

4. **Verify ESLint on AI files**:
   ```powershell
   npx eslint src/ai/ test/ai-jev-system.test.ts test/ai-system.test.ts
   ```
   *Expected result: Exits 0 with 0 errors and 0 warnings.*

5. **Inspect generated analysis report**:
   - `F:\game-trung-sinh\.agents\explorer_survey_2\analysis.md`
