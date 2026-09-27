# Handoff Report: Specification Mining for The System Personality, Fallback Dialogues, and 2-Tier Timing (M2)

**From:** Spec Miner M2_3 (`teamwork_preview_spec_miner`)  
**To:** Orchestrator (`parent` / `5a466b68-3f91-467f-ac59-2dbf53885d36`)  
**Type:** Hard Handoff (Task Complete)  
**Date:** 2026-09-19T21:50:00Z  

---

## 1. Observation

1. **System Definitions & Personalities (`src/content/system-defs.ts` lines 44–265):**
   - 10 active System definitions exist with unique `id`, `nameVi`, `nameEn`, `headerVi`, `headerEn`, `personalityVi`, `personalityEn`, and `questPoolId`.
   - `sys_battle` (Order 1): `"Hệ Thống thích xem ngươi máu me. Đừng làm nó thất vọng."` / `"The System likes watching you bleed. Do not disappoint it."`
   - `sys_alchemy` (Order 2): `"Hệ Thống ghi chú về các phản ứng. Có những lò luyện đan không nên mở hai lần."` / `"The System notes reactions. Some cauldrons should not be opened twice."`
   - `sys_merchant` (Order 3, corresponding to `sys_wealth`): `"Hệ Thống tính tiền chính xác đến đồng bạc cuối. Không ai lừa được hai lần."` / `"The System counts to the last coin. Nobody cheats it twice."`
   - `sys_healer` (Order 7, alias `Dưỡng Sinh Trường Thọ`, corresponding to `sys_longevity`): `"Hệ Thống đo mạch và ghi chú. Nó không cứu người, nó tối ưu."` / `"The System reads pulses and takes notes. It does not save people; it optimizes."`
   - 6 additional systems: `sys_lottery`, `sys_explorer`, `sys_assassin`, `sys_artisan`, `sys_scholar`, `sys_void`.
   - Default/unselected fallback: `src/content/system-messages.ts` lines 23–24 (`SYSTEM_HEADER_VI = '【Hệ Thống】'`, `SYSTEM_HEADER_EN = '【System】'`).

2. **Existing System AI Interface (`src/ai/system.ts` lines 27–32, 64–88):**
   - `SystemReply` interface contract:
     ```typescript
     export interface SystemReply {
       kind: 'chat' | 'offer_quest'
       textVi: string
       textEn: string
       questId?: string
     }
     ```
   - Currently, `requestSystemReply` only calls `/api/narrate` and returns `null` on any fetch error or when `!narrationWanted()`. It does not yet invoke `classifySystemUtterance` nor does it supply in-character deterministic fallback dialogues.

3. **Existing Jev Client & Classifier (`src/ai/jev-client.ts` lines 14–136):**
   - `classifySystemUtterance(game, playerMessage, config)` handles `600ms` timeout via `AbortController`, bounds `selectedQuestId` to `systemQuestsFor(game)` + `'none'`, and falls back synchronously to `fallbackRuleBasedClassifier` when offline or missing `apiKey`.
   - Rule-based classifier maps hostile keywords (`/cút|ngu|phế|vô dụng|chó|đồ khốn|hệ thống rác/`) to `intent: 'defiance_mockery'`, `isHostile: true`, `obedienceScore: 1`.

4. **UI Usage (`src/ui/LeftRailTabContent.tsx` lines 162–179, `src/ui/GameScreen.tsx` lines 595–598):**
   - When `requestSystemReply` returns `null`, `LeftRailTabContent.tsx` falls back to repeating `system.personalityVi` verbatim or `"Hệ Thống im lặng."`.
   - When `reply !== null`, it renders `vi ? reply.textVi : reply.textEn` and tracks `reply.questId`.

5. **2-Tier Timing Specification (`jev_integration_spec.md § 1.2`):**
   - Tier 1: Jev System One fast forward pass (~80ms, timeout 600ms).
   - Parallel branches:
     - Branch 1 (Instant Feedback ~90ms): Engine activates quest / updates state; UI plays "Ting!" sound and shows quest popup.
     - Branch 2 (Async Narration 1–2s): Frontier LLM narrates rich persona dialogue; UI displays narrative.
   - Offline / zero-key mode executes in `< 2ms` via local deterministic logic without throwing exceptions.

6. **Test Execution & Build Verification:**
   - `npm run typecheck` returned code 0 (0 compilation errors).
   - `npx vitest run test/ai-jev-system.test.ts` passed 5/5 tests (14ms).
   - `npx vitest run test/ai-system.test.ts` passed 3/3 tests (13ms).

---

## 2. Logic Chain

1. **Step 1 (Source of Truth):** `src/content/system-defs.ts` contains the authoritative definitions for the 10 systems, their bilingual personas, and mechanical identities. Note that the prompt's `sys_wealth` is canonical `sys_merchant` and `sys_longevity` is canonical `sys_healer` (alias "Dưỡng Sinh Trường Thọ").
2. **Step 2 (Interface Compatibility):** The UI components (`GameScreen.tsx` and `LeftRailTabContent.tsx`) already consume `SystemReply` (`kind: 'chat' | 'offer_quest'`, `textVi`, `textEn`, `questId?`). Therefore, the fallback generator must output a valid `SystemReply` directly without modifying UI consumption signatures.
3. **Step 3 (Deterministic In-Character Fallback Matrix):** In Milestone 2 implementation, when `/api/narrate` is disabled or offline, `requestSystemReply` must not return `null`. Instead, it must map `SystemFastDecision` (`intent`, `questId`, `obedienceScore`, `isHostile`) to in-character bilingual templates across all 3 requested player states:
   - Hostile / Insolent (`isHostile` or `obedienceScore <= 2` or `defiance_mockery`): Hostile reprimand matching the specific System's personality.
   - Quest Request (`request_quest`): Quest offer with `kind: 'offer_quest'` and `questId` when available; graceful explanation if pool is empty.
   - General Chat / Status (`chat_general`, `inquire_status`): In-character reflection of player vitals (`hp`, `qi`, `gold`, `day`, `stage`).
4. **Step 4 (Timing Alignment):** The 2-Tier sequence diagram in `jev_integration_spec.md § 1.2` dictates a ~80ms Tier 1 reflex and ~90ms instant UI reaction, followed by 1–2s async narration. Integrating `classifySystemUtterance` before `/api/narrate` ensures that the UI can obtain `questId` and `intent` rapidly, while falling back gracefully to deterministic bilingual templates in `< 2ms` if network is unavailable.

---

## 3. Caveats

1. **Active System Pre-Selection:** If a player has not yet picked a system (`game.systemId == null`), the fallback templates must default to the cold, bureaucratic 【Hệ Thống】 / 【System】 persona using `SYSTEM_HEADER_VI` / `SYSTEM_HEADER_EN`.
2. **Quest Pool Availability:** When a player requests a quest but all chain quests for the active system are completed or locked behind unmet flags, `decision.questId` will be `undefined`. The fallback must emit `kind: 'chat'` rather than `kind: 'offer_quest'` to avoid UI errors.
3. **No Code Implementation in Spec Miner Role:** As Spec Miner, no modifications have been made to `src/ai/system.ts`. The implementation plan, templates, and specifications are fully documented in `analysis.md` ready for the implementer agent in M2.

---

## 4. Conclusion

The specification mining for Milestone 2 is complete.
1. The 10 System personalities and their voice traits have been mapped in detail.
2. In-character bilingual fallback dialogue templates have been designed for all active systems and default states across Hostile, Quest Request, and Status/Chat intents.
3. Strict conformance with `SystemReply` interface contract is established.
4. Timing budgets and degradation flows are fully verified against `jev_integration_spec.md § 1.2`.
5. Full analysis is available in `F:\game-trung-sinh\.agents\spec_miner_m2_3\analysis.md`.

---

## 5. Verification Method

To independently verify this specification:
1. **Inspect Analysis Report:**
   - Read `F:\game-trung-sinh\.agents\spec_miner_m2_3\analysis.md` to review the Features Discovered table, Edge Cases table, and complete Bilingual Fallback Dialogue matrices.
2. **Execute Project Verification Commands:**
   - Typecheck: `npm run typecheck` (must exit 0).
   - Jev Classifier tests: `npx vitest run test/ai-jev-system.test.ts` (must pass 5/5 tests).
   - Narration boundary tests: `npx vitest run test/ai-system.test.ts` (must pass 3/3 tests).
3. **Check Operating Boundaries:**
   - Verify that all game logic remains cleanly separated in `src/engine/` and AI wiring remains in `src/ai/`.
