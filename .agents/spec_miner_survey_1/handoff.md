# Handoff Report: Jev (System One AI) Specification Mining

- **From:** Surveyor 1 (`teamwork_preview_spec_miner`)
- **To:** Orchestrator (`parent` / `5a466b68-3f91-467f-ac59-2dbf53885d36`)
- **Date:** 2026-09-20T04:41:00+07:00
- **Type:** Hard Handoff (Task Complete)

---

## 1. Observation

1. **Authoritative Specification Document:**
   - Path: `C:\Users\minhd\.gemini\antigravity-cli\brain\06ca1ff1-f946-40b5-9a50-c714faaa792b\jev_integration_spec.md` (Total Lines: 476, Bytes: 16942).
   - Section 1.2 (Lines 17-20): "Tier 1 (Jev - System One / ~80ms): Nhận diện ý đồ (Intent), định tuyến nhiệm vụ (Strict Enum Choice) và chấm điểm thái độ của Ký chủ (Score/Noul). Trả kết quả định kiểu nghiêm ngặt (Type-Safe) về cho Game Engine kích hoạt logic ngay lập tức. Tier 2 (Frontier LLM / 1000ms): Nhận kết quả đã được Jev phân loại chắc chắn để sinh khẩu khí và lời thoại nhập vai của Hệ Thống."
   - Section 2.1 (Lines 50-56): Endpoint `https://api.typesafe.ai/v1/systemone`, Method `POST`, Header `Authorization: Bearer <TYPESAFE_API_KEY>`, Model `jev-latest`.
   - Section 2.2 (Lines 58-62): Three primitives: `choice` (selects 1 of <= 255 predefined labels), `score` (ratings on normalized min/max scale, e.g. 1..5), `noul` (boolean true/false with probability 0.0..1.0).
   - Section 5 (Lines 473-476): "Toàn bộ việc gọi Jev và chuẩn hóa dữ liệu nằm ở `src/ai/jev-client.ts` và `src/ai/system.ts`. Engine `src/engine/` chỉ nhận các kết quả đã được phân loại (deterministic event)."

2. **Original User Request Contract:**
   - Path: `F:\game-trung-sinh\.agents\ORIGINAL_REQUEST.md` (Lines 53-97, Section `## 2026-09-19T21:36:35Z`).
   - R1 (Line 66-68): "Hiện thực hóa Jev System One Client & Schemas... module src/ai/jev-schemas.ts và src/ai/jev-client.ts... Giới hạn danh sách lựa chọn quest ID chỉ trong pool quest đang hoạt động của game engine (systemQuestsFor(game))."
   - R2 (Line 69-71): "Tích hợp Pipeline 2-Tier vào The System... Cập nhật luồng xử lý src/ai/system.ts... tự động chuyển sang Fallback Rule-based an toàn nếu không có API key, khi offline hoặc khi thời gian phản hồi vượt quá 600ms."
   - R3 (Line 72-74): "Bộ Kiểm Thử Tự Động Hóa... tại test/ai-jev-system.test.ts kiểm chứng: phân loại intent chuẩn, bảo vệ chống ảo giác quest ID (Hallucination Defense), phát hiện người chơi chống đối/xúc phạm Hệ Thống, và xử lý suy giảm êm dịu khi mất mạng/timeout."
   - R4 (Line 75-77): "Quản lý Git Branch & Mở Pull Request... nhánh tính năng mới feat/jev-system-one, commit các thay đổi theo đúng chuẩn AGENTS.md..."

3. **Active Claim & Implementation State:**
   - Active claim path: `F:\game-trung-sinh\docs\agent-work\active\jev-system-one-classifier.md`:
     Owner: codex; Claimed: 2026-09-19T21:34:38.710Z; Scope: `src/ai/jev-schemas.ts`, `src/ai/jev-client.ts`, `test/ai-jev-system.test.ts`.
   - `src/ai/jev-schemas.ts` (Lines 1-44): Implements `JevIntentSchema`, `JevResponseSchema`, and `SystemFastDecision`.
   - `src/ai/jev-client.ts` (Lines 1-136): Implements `classifySystemUtterance`, 600ms timeout with `AbortController`, quest ID bounding, and `fallbackRuleBasedClassifier`.
   - `src/engine/content-types.ts` (Lines 290-319): `QuestDef` has `nameVi: string` and `nameEn: string` (spec line 225 mentioned `q.titleVi`, but the actual engine model property is `q.nameVi`). `src/ai/jev-client.ts:28` maps `name: q.nameVi`, matching the engine contract.
   - `test/ai-jev-system.test.ts` (Lines 1-119): Implements TC-01 (Bounded Choice), TC-02 (Hallucination Defense), TC-03 (Hostile Defiance), TC-04 (Network Error/Timeout Fallback), and TC-05 (Keyless Offline Mode).

4. **Empirical Verification Runs:**
   - Vitest command: `npx vitest run test/ai-jev-system.test.ts`
     Result: `✓ test/ai-jev-system.test.ts (5 tests) 9ms | Tests: 5 passed (5) | Duration: 2.44s`. Exit code: 0.
   - TypeScript compiler check: `npm run typecheck` (`tsc --noEmit`)
     Result: Clean compilation, 0 errors. Exit code: 0.
   - Vitest system regression test: `npx vitest run test/ai-system.test.ts`
     Result: `✓ test/ai-system.test.ts (3 tests) 15ms | Tests: 3 passed (3)`. Exit code: 0.
   - Agent environment check: `npm run agent:check`
     Result: `agent-os: OK - shared rules, MCP registry, and tool bridges are present.` Exit code: 0.

---

## 2. Logic Chain

1. **Specification Authority & Schema Coherence (Observation 1 & 2 -> Conclusion):**
   - The authoritative spec specifies 3 Jev primitives (`choice`, `score`, `noul`).
   - In `src/ai/jev-schemas.ts`, `JevIntentSchema` implements `choice` for intent across 6 enum labels; `answers.selectedQuestId` implements dynamic `choice`; `answers.obedienceScore` implements `score` (min 1, max 5); `answers.isHostile` implements `noul` (boolean value + probability 0..1).
   - All response fields are strictly validated via Zod, ensuring type safety.

2. **Bounding Quest IDs to Active Pool Prevents Hallucinations (Observation 1, 2, 3 -> Conclusion):**
   - In `src/ai/jev-client.ts`, line 26 calls `systemQuestsFor(game)` to retrieve active quests for the current system.
   - The question payload sent to Jev explicitly restricts `options` to `[...availableQuests.map(q => q.id), 'none']`.
   - Upon receiving Jev's output, line 106 validates: `selectedQId !== 'none' && questIdOptions.includes(selectedQId) ? selectedQId : undefined`.
   - Test TC-02 empirically verifies that an unknown/hallucinated quest ID (`q_sys_hacked_alien_quest`) evaluates to `undefined`, protecting the engine from invalid state transitions.

3. **High Reliability & Zero-Latency Offline Fallback (Observation 1, 3, 4 -> Conclusion):**
   - In environments without an API key (`!apiKey`), `classifySystemUtterance` bypasses network requests immediately and executes `fallbackRuleBasedClassifier` in 0ms (tested in TC-05).
   - In network error or timeout scenarios (>600ms via `AbortController`), the try-catch block intercepts the error and executes `fallbackRuleBasedClassifier` (tested in TC-04).
   - The regex rules accurately identify hostility (`/cút|ngu|phế|vô dụng|chó|đồ khốn|hệ thống rác/`) and quest queries (`/nhiệm vụ|việc gì|làm gì|kiếm tiền|quest|task/`), maintaining gameplay continuity without throwing unhandled exceptions.

4. **Engine & AI Separation per Operating Contract (Observation 1, 3 -> Conclusion):**
   - Per `AGENTS.md` and `docs/agent-os/KNOWLEDGE.md`, `src/engine/` is deterministic and must not depend on cloud AI.
   - Jev System One integration is completely isolated within `src/ai/jev-client.ts` and `src/ai/system.ts`.
   - The engine receives only typed decisions and events (`SystemFastDecision`).

---

## 3. Caveats

1. **Engine Field Naming Discrepancy:**
   - The spec document `jev_integration_spec.md` line 225 wrote `name: q.titleVi`, whereas the engine's canonical definition `QuestDef` in `src/engine/content-types.ts` line 293 uses `nameVi: string`. The implementation in `src/ai/jev-client.ts` uses `q.nameVi`, which is correct and verified by `npm run typecheck`.
2. **Environment Variable Configuration:**
   - In client-side Vite runtime, environment variables are typically exposed as `import.meta.env.VITE_TYPESAFE_API_KEY`, whereas Node/test environments use `process.env.TYPESAFE_API_KEY`. `jev-client.ts` currently reads `process.env.TYPESAFE_API_KEY` or `config.apiKey`. If consumed directly in browser UI without backend proxy, `import.meta.env.VITE_TYPESAFE_API_KEY` or a Vite proxy at `/api/systemone` should be configured.
3. **Existing Active Claim:**
   - `docs/agent-work/active/jev-system-one-classifier.md` is registered under owner `codex`. Per AGENTS.md, specification miner remains read-only and documents the specification findings in `.agents/spec_miner_survey_1/analysis.md` without modifying code in `src/` or `test/`.

---

## 4. Conclusion

- The technical specifications for Jev (System One AI) integration have been completely mined, cross-referenced, and documented in detail in `F:\game-trung-sinh\.agents\spec_miner_survey_1\analysis.md`.
- All 5 required dimensions are fully covered:
  1. Exact API schemas (Zod schemas, request/response JSON contracts, 3 primitives: choice, score, noul).
  2. Client requirements (endpoint, headers, timeout 600ms, payload construction, bounding questId to engine's active quest pool, error handling).
  3. 2-Tier Pipeline requirements in `src/ai/system.ts` (Tier 1 fast classification, instant state update/feedback, Tier 2 LLM narration context, deterministic fallback rules).
  4. Test suite specification (`test/ai-jev-system.test.ts` TC-01 to TC-05).
  5. Acceptance criteria mapping (R1, R2, R3, R4).
- The implementation and test suite are verified: Vitest tests pass 5/5, TypeScript passes with 0 errors, and regression tests pass.

---

## 5. Verification Method

To independently verify all findings and test suites:

1. **Verify Jev Test Suite:**
   ```powershell
   npx vitest run test/ai-jev-system.test.ts
   ```
   *Expected result:* 5 tests passed (TC-01 through TC-05), 0 failures.

2. **Verify TypeScript Types & Schemas:**
   ```powershell
   npm run typecheck
   ```
   *Expected result:* Exits with code 0, 0 diagnostic errors.

3. **Verify Existing System Regression Coverage:**
   ```powershell
   npx vitest run test/ai-system.test.ts
   ```
   *Expected result:* 3 tests passed, 0 failures.

4. **Verify Agent OS Checks:**
   ```powershell
   npm run agent:check
   ```
   *Expected result:* `agent-os: OK - shared rules, MCP registry, and tool bridges are present.`

5. **Inspect Artifact Files:**
   - Full specification analysis: `F:\game-trung-sinh\.agents\spec_miner_survey_1\analysis.md`
   - Implementation schemas: `src/ai/jev-schemas.ts`
   - Implementation client: `src/ai/jev-client.ts`
   - Test suite: `test/ai-jev-system.test.ts`
