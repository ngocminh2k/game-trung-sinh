# Báo Cáo Khảo Sát Kỹ Thuật: Tích Hợp Jev (System One AI) Vào The System

**Tác tử khảo sát:** Surveyor 2 (`teamwork_preview_explorer`)  
**Thư mục làm việc:** `F:\game-trung-sinh\.agents\explorer_survey_2\`  
**Thời điểm khảo sát:** 2026-09-19T21:42:00Z  
**Tài liệu tham chiếu:**
- Yêu cầu người dùng: `F:\game-trung-sinh\.agents\ORIGINAL_REQUEST.md` (mục `## 2026-09-19T21:36:35Z`)
- Bản đặc tả kỹ thuật: `C:\Users\minhd\.gemini\antigravity-cli\brain\06ca1ff1-f946-40b5-9a50-c714faaa792b\jev_integration_spec.md`
- Hợp đồng tác tử: `F:\game-trung-sinh\AGENTS.md` & `docs/agent-os/`

---

## 1. TỔNG QUAN HIỆN TRẠNG TƯƠNG TÁC HỆ THỐNG TRONG `src/ai/`

### 1.1 Luồng Xử Lý Hiện Tại Trong `src/ai/system.ts`
Trong tệp `src/ai/system.ts` (89 dòng code):
- **Cơ chế gọi:** Hiện tại sử dụng trực tiếp mô hình đơn tầng (Single-tier) gọi qua endpoint proxy `/api/narrate` (`fetch('/api/narrate', ...)`).
- **Hàm xây dựng payload:** `buildSystemPayload(game: GameState, message: string, locale: Locale): SystemChatPayload | null`
  - Trích xuất trạng thái: `day`, `stage`, `gold`, `luck`, `hp`, `qi`.
  - Trích xuất thông tin Hệ Thống đang kích hoạt: `id`, `nameVi`, `nameEn`, `personalityVi`, `personalityEn`.
  - Xây dựng pool quest hợp lệ thông qua `systemQuestsFor(game)`:
    ```typescript
    questPool: systemQuestsFor(game).map((quest) => ({
      id: quest.id,
      difficulty: quest.difficulty ?? 1,
      rewardGold: quest.rewardGold,
    }))
    ```
  - Chuẩn hóa tin nhắn người chơi: `message.replace(/\s+/g, ' ').trim().slice(0, 300)`.
- **Hàm yêu cầu phản hồi:** `requestSystemReply(game: GameState, message: string, locale: Locale): Promise<SystemReply | null>`
  - Chốt chặn quyền riêng tư / cấu hình: Kiểm tra `narrationWanted()` (từ `src/ai/narration.ts`). Nếu `false`, trả về `null` ngay lập tức.
  - Kiểm tra tính hợp lệ: Nếu `reply.kind === 'offer_quest'`, bắt buộc `reply.questId` phải nằm trong `payload.questPool`. Nếu vi phạm, trả về `null`.
  - Khi có lỗi mạng, lỗi parse JSON, hoặc phản hồi rỗng: Bắt `catch` và âm thầm trả về `null`.

### 1.2 Tương Tác Giữa Giao Diện UI và `src/ai/system.ts`
1. **`src/ui/LeftRailTabContent.tsx` (dòng 155–180):**
   - Sự kiện gửi tin nhắn: `handleSendSystemMessage`.
   - Gọi `requestSystemReply(game, msg, locale)`.
   - Nếu kết quả `reply !== null`: Thêm tin nhắn phản hồi từ Hệ Thống vào danh sách `userMessages`, kèm `questId` nếu có.
   - Nếu kết quả `reply === null`: Hiển thị câu thoại mặc định dự phòng tĩnh từ định nghĩa hệ thống:
     `vi ? 【${system.nameVi}】: ${system.personalityVi} : [${system.nameEn}]: ${system.personalityEn}`.
2. **`src/ui/GameScreen.tsx` (dòng 591–599, 954–955):**
   - Sự kiện gửi tin nhắn: `submitSystemMessage`.
   - Cập nhật state `systemReplying` và lưu `systemReply`.
   - Tại dòng 955: Nếu `systemReply.questId` khả dụng và `questStatus(game, systemReply.questId) === 'available'`, hiển thị nút nhận nhiệm vụ:
     `onAction({ kind: 'system_accept_quest', questId: systemReply.questId! })`.
   - Nếu `systemReply === null`: Hiển thị văn bản dự phòng `t(locale, 'system.chatFallback')`.

### 1.3 Nhận Xét Kỹ Thuật
- **Hạn chế:** Toàn bộ việc xác định người chơi muốn nhận nhiệm vụ hay tán gẫu đều phụ thuộc vào mô hình sinh văn bản chậm chạp tại `/api/narrate` (độ trễ 1.5s–3s). Nếu mất mạng hoặc chưa bật AI proxy, người chơi chỉ nhận được câu thoại tĩnh hoặc `null`, không có khả năng phân loại ý đồ theo luật (rule-based intent recognition).

---

## 2. KIỂM CHỨNG EXPORT VÀ CẤU TRÚC DỮ LIỆU TẠI `src/engine/`

### 2.1 Các Export Cốt Lõi Tại `src/engine/index.ts`
Khảo sát tệp `src/engine/index.ts` và các module liên quan cho thấy:
- **`activeSystem`**: Được định nghĩa tại `src/engine/system-runtime.ts:9` và re-export tại `src/engine/index.ts:157`:
  ```typescript
  export function activeSystem(state: { systemId?: string | null }): SystemDef | null
  ```
  Trả về `SystemDef` nếu `state.systemId` hợp lệ, ngược lại trả về `null`.
- **`systemQuestsFor`**: Được định nghĩa tại `src/engine/system-runtime.ts:33` và re-export tại `src/engine/index.ts:169`:
  ```typescript
  export function systemQuestsFor(state: GameState): QuestDef[]
  ```
  Lọc danh sách các nhiệm vụ hệ thống thuộc `SYSTEM_QUESTS` (`src/content/system-quests.ts`) có `requiredSystemId === system.id` và thỏa mãn các cờ tiên quyết (`requiredFlags`), cộng với các nhiệm vụ đang thực hiện (`state.quests`).
- **`GameState`**: Định nghĩa tại `src/engine/types.ts` và export kiểu tại `src/engine/index.ts:269`. Chứa đầy đủ `player`, `systemId`, `flags`, `quests`, `inventory`, v.v.
- **`newGame`**: Re-export tại `src/engine/index.ts:74`, tạo đối tượng `GameState` khởi tạo chuẩn phục vụ unit test.

### 2.2 Cấu Trúc Dữ Liệu Quest (`QuestDef`)
Tại `src/engine/content-types.ts:290-320`:
```typescript
export interface QuestDef {
  id: string
  giverNpcId: string | null
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  steps: QuestStep[]
  requiredItems: Record<string, number>
  requiredFlags: string[]
  rewardGold: number
  rewardItems: Record<string, number>
  aliases: string[]
  secret?: boolean
  deadlineDays?: number
  nextQuestId?: string
  storySceneNextId?: string
  requiredSystemId?: string
  difficulty?: number
  rewardSpiritStones?: number
}
```
> **LƯU Ý CỰC KỲ QUAN TRỌNG:**
> Trong bản đặc tả `jev_integration_spec.md` đoạn mã mẫu có viết: `name: q.titleVi`.  
> Tuy nhiên, trong toàn bộ mã nguồn thực tế của game, trường tên nhiệm vụ tiếng Việt là **`nameVi`** (không tồn tại trường `titleVi`). Sử dụng `q.titleVi` sẽ gây lỗi biên dịch TypeScript `Property 'titleVi' does not exist on type 'QuestDef'`.  
> Trong nguyên mẫu hiện tại `src/ai/jev-client.ts`, code đã được điều chỉnh chuẩn xác thành `name: q.nameVi`.

### 2.3 Ranh Giới Độc Lập Kịch Bản (Scenario Containment)
Đã kiểm chứng bài test kiến trúc `test/system-scenario.test.ts`:
Toàn bộ các module System (`src/ai/system.ts`, `src/engine/system-runtime.ts`, `src/content/system-*`) tuân thủ nghiêm ngặt quy tắc không import trực tiếp nội dung Scenario-I cụ thể (`content/story`, `content/npcs`, `content/locations`, `content/quests`).

---

## 3. KHẢO SÁT `package.json`, CÔNG CỤ VÀ THƯ VIỆN

### 3.1 Dependencies & Công Cụ
- **`zod`**: Đã cài đặt phiên bản `^3.23.8` trong `dependencies`. Hoàn toàn sẵn sàng cho việc parse và validate schema của Jev ở cả runtime trình duyệt và môi trường kiểm thử.
- **`vitest`**: Đã cài đặt phiên bản `^2.1.2` (`devDependencies`) cùng `@vitest/coverage-v8: ^2.1.9`.
- **`typescript`**: Phiên bản `^5.6.2`.
- **`eslint`**: Phiên bản `^9.39.5` với `typescript-eslint: ^8.68.0`.

### 3.2 Các Lệnh Kiểm Thử & Tình Trạng Hiện Tại
| Lệnh kiểm thử | Mô tả | Trạng thái thực tế |
|---|---|---|
| `npm run typecheck` | `tsc --noEmit` | **PASS (Exit code 0)** — Không có bất kỳ lỗi biên dịch nào |
| `npm run agent:check` | Kiểm tra OS rules & bridges | **PASS (Exit code 0)** |
| `npx vitest run test/ai-jev-system.test.ts` | Test bộ Jev System One | **PASS (5/5 tests, 11ms)** |
| `npx vitest run test/ai-system.test.ts` | Test System AI boundary hiện tại | **PASS (3/3 tests, 10ms)** |
| `npx vitest run test/ai-narration.test.ts` | Test Narration AI | **PASS (7/7 tests, 14ms)** |
| `npx eslint src/ai/ test/ai-*.test.ts` | Linting các file AI | **PASS (0 errors, 0 warnings)** |

---

## 4. TÌNH TRẠNG CÁC TỆP NGUYÊN MẪU JEV ĐANG CÓ TRONG WORKTREE

Trong thư mục làm việc, các tệp Jev đã được tạo dưới active claim `docs/agent-work/active/jev-system-one-classifier.md` (chủ sở hữu: `codex`):

### 4.1 Tệp `src/ai/jev-schemas.ts` (45 dòng)
- Định nghĩa enum `JevIntentSchema`:
  `'request_quest' | 'chat_general' | 'inquire_status' | 'complain' | 'defiance_mockery' | 'accept_current_quest'`.
- Định nghĩa `JevResponseSchema`:
  - `answers.intent`: `{ value: JevIntentSchema, confidence: number }`
  - `answers.selectedQuestId`: `{ value: string, confidence: number }`
  - `answers.obedienceScore`: `{ value: number (1-5), confidence?: number }`
  - `answers.isHostile`: `{ value: boolean, probability?: number }`
- Định nghĩa interface `SystemFastDecision`:
  `{ intent, questId?, obedienceScore, isHostile, latencyMs }`.

### 4.2 Tệp `src/ai/jev-client.ts` (137 dòng)
- Hiện thực hóa hàm `classifySystemUtterance(game, playerMessage, config)`:
  - Lấy `apiKey` an toàn từ `config.apiKey ?? (typeof process !== 'undefined' && process.env ? process.env.TYPESAFE_API_KEY : undefined) ?? ''`.
  - Thu thập danh sách `availableQuests` từ `systemQuestsFor(game)` bằng `q.nameVi`.
  - Tạo mảng lựa chọn bị chặn chặt chẽ: `questIdOptions = [...availableQuests.map(q => q.id), 'none']`.
  - Thiết lập timeout 600ms với `AbortController`.
  - Gửi payload chuẩn định dạng Jev với 3 nguyên thủy: `choice`, `score`, `noul`.
  - Parse kết quả bằng `JevResponseSchema.parse(json)`.
  - **Hallucination Defense:** Kiểm tra `selectedQId !== 'none' && questIdOptions.includes(selectedQId)` — nếu Jev sinh ra questId ngoài pool, gán về `undefined`.
  - **Deterministic Rule-based Fallback:** Hàm `fallbackRuleBasedClassifier` tự động kích hoạt khi thiếu API key, offline, timeout, hoặc HTTP error:
    - Nhận diện khiêu khích/xúc phạm: `regex /cút|ngu|phế|vô dụng|chó|đồ khốn|hệ thống rác/` $\rightarrow$ `defiance_mockery`, `isHostile = true`, `obedienceScore = 1`.
    - Nhận diện xin nhiệm vụ: `regex /nhiệm vụ|việc gì|làm gì|kiếm tiền|quest|task/` $\rightarrow$ `request_quest`, `questId = availableQuestIds[0]`, `obedienceScore = 3`.
    - Mặc định: `chat_general`, `obedienceScore = 3`.

### 4.3 Tệp `test/ai-jev-system.test.ts` (120 dòng)
Đã có 5 bài test tự động hóa:
1. `TC-01`: Phân loại đúng intent và chỉ chọn questId có trong danh sách pool hợp lệ.
2. `TC-02`: Nếu Jev trả về questId không có trong pool, tự động chuyển thành undefined (Hallucination Defense).
3. `TC-03`: Nhận diện người chơi xúc phạm Hệ Thống và kích hoạt cờ isHostile.
4. `TC-04`: Tự động rơi về Fallback Rule-based an toàn khi fetch bị lỗi hoặc timeout.
5. `TC-05`: Chạy chế độ Offline Fallback hoàn toàn nếu không truyền API Key.

---

## 5. BẢN ĐỒ RANH GIỚI VÀ GIAO DIỆN CẦN THIẾT CHO R1, R2, R3

Dưới đây là ánh xạ chi tiết giữa 3 yêu cầu cốt lõi (R1, R2, R3) và cấu trúc mã nguồn:

```
+-----------------------------------------------------------------------------+
|                                    UI LAYER                                 |
|  (src/ui/LeftRailTabContent.tsx, src/ui/GameScreen.tsx)                     |
+-------------------------------------+---------------------------------------+
                                      |
                                      | 1. playerMessage
                                      v
+-----------------------------------------------------------------------------+
|                                  src/ai/                                    |
|                                                                             |
|  [R1] Tier 1: Fast Classifier                                               |
|  - src/ai/jev-schemas.ts (Zod schemas: choice, score, noul)                 |
|  - src/ai/jev-client.ts (classifySystemUtterance, fallbackRuleBased)        |
|                                                                             |
|  [R2] 2-Tier Pipeline Orchestrator                                          |
|  - src/ai/system.ts:                                                        |
|      Step 1: classifySystemUtterance(game, message) (~80ms / fallback)      |
|      Step 2: If online & wanted -> /api/narrate with Decision context       |
|              If offline/timeout -> Deterministic in-character speech        |
|                                                                             |
+-------------------------------------+---------------------------------------+
                                      |
                                      | queries systemQuestsFor, activeSystem
                                      v
+-----------------------------------------------------------------------------+
|                                src/engine/                                  |
|  - system-runtime.ts: activeSystem(state), systemQuestsFor(state)           |
|  - content-types.ts: QuestDef (nameVi, difficulty, rewardGold)              |
|  - quests.ts: questStatus(state, questId)                                   |
|  - Pure deterministic, NO AI imports, NO network                            |
+-----------------------------------------------------------------------------+
```

### 5.1 R1: Hoàn Thiện Jev Client & Schemas
- **Tệp:** `src/ai/jev-schemas.ts`, `src/ai/jev-client.ts`.
- **Trạng thái:** Đã hiện thực hóa đầy đủ và vượt qua test.
- **Khuyến nghị bổ sung:**
  - Hỗ trợ thêm biến môi trường trình duyệt: `typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_TYPESAFE_API_KEY : undefined` để chạy mượt mà trên cả môi trường Vite client thực tế bên cạnh môi trường Node/Vitest `process.env`.

### 5.2 R2: Tích Hợp Pipeline 2-Tier Vào The System (`src/ai/system.ts`)
- **Tệp:** `src/ai/system.ts`.
- **Trạng thái:** **CHƯA ĐƯỢC KẾT NỐI (Chưa tích hợp)**. Hiện `src/ai/system.ts` vẫn là code cũ gọi thẳng `/api/narrate`.
- **Đề xuất tích hợp cụ thể:**
  1. Cập nhật `requestSystemReply(game, message, locale)`:
     - Trước hết gọi `const fastDecision = await classifySystemUtterance(game, message)`.
     - Nếu `fastDecision.intent === 'request_quest'` và có `fastDecision.questId`:
       Đảm bảo trả về `kind: 'offer_quest'` kèm `questId`.
     - Nếu `narrationWanted()` trả về `false` hoặc cuộc gọi `/api/narrate` thất bại / timeout:
       Thay vì trả về `null` như trước, sử dụng `fastDecision` để tạo câu thoại tự nhiên có tính cách của Hệ Thống:
       - Nếu `fastDecision.isHostile`:
         `textVi: 'To gan! Ngươi dám bất kính với Bổn Hệ Thống sao?'`
         `textEn: 'Audacious! You dare disrespect the System?'`
       - Nếu `fastDecision.intent === 'request_quest'` và `fastDecision.questId`:
         `textVi: '【Bổn Hệ Thống】Ban bố nhiệm vụ mới cho ngươi. Tiếp nhận hay không?'`
         `textEn: '[The System] A new quest has been issued. Do you accept?'`
       - Mặc định: Trả về lời thoại tính cách `system.personalityVi` / `system.personalityEn`.
     - Lưu ý tính tương thích ngược với `test/ai-system.test.ts`:
       Trong `test/ai-system.test.ts`, case kiểm thử dòng 48-51 kỳ vọng `requestSystemReply` trả về `null` khi `VITE_AI_NARRATION_ENABLED=false`. Cần đảm bảo nếu tắt narration thì tuân thủ đúng hợp đồng test hoặc cập nhật test tương ứng.
  2. Bổ sung hàm xuất `requestSystemFastDecision(game: GameState, message: string): Promise<SystemFastDecision>`:
     - Cho phép UI có thể gọi riêng tầng Tier 1 để nhận diện ngay tức thì trong 80ms, kích hoạt âm thanh "Ting!" hoặc popup thông báo trước khi lời thoại Tier 2 hoàn tất.

### 5.3 R3: Bộ Kiểm Thử Tự Động Hóa (`test/ai-jev-system.test.ts`)
- **Tệp:** `test/ai-jev-system.test.ts`.
- **Trạng thái:** Đã hoàn thành 5/5 test case và chạy thành công 100%.
- **Khuyến nghị:** Có thể bổ sung test case kiểm tra tích hợp 2-Tier trực tiếp qua `src/ai/system.ts` để chứng minh end-to-end flow hoạt động liền mạch.

### 5.4 R4: Quản Lý Git Branch & Pull Request
- Hiện tại worktree đang ở nhánh `main`.
- Khi chuyển giao cho tác tử lập trình/implementer, cần tạo nhánh tính năng `feat/jev-system-one` từ `main`, cam kết mã nguồn theo chuẩn AGENTS.md, và đóng active claim `jev-system-one-classifier.md`.
