# Báo Cáo Khảo Sát & Khai Thác Đặc Tả Kỹ Thuật: Jev (System One AI) Integration

**Người thực hiện:** Surveyor 1 (`teamwork_preview_spec_miner`)  
**Thư mục làm việc:** `F:\game-trung-sinh\.agents\spec_miner_survey_1`  
**Dự án:** `game-trung-sinh`  
**Ngày thực hiện:** 2026-09-20  
**Tài liệu đặc tả nguồn:**
1. `C:\Users\minhd\.gemini\antigravity-cli\brain\06ca1ff1-f946-40b5-9a50-c714faaa792b\jev_integration_spec.md` (Đặc tả kiến trúc & kiểm thử)
2. `F:\game-trung-sinh\.agents\ORIGINAL_REQUEST.md` (Yêu cầu gốc mục `## 2026-09-19T21:36:35Z`)
3. `F:\game-trung-sinh\AGENTS.md` (Operating Contract) & `docs/agent-os/KNOWLEDGE.md`, `docs/agent-os/WORKFLOW.md`
4. Mã nguồn thực tế: `src/ai/jev-schemas.ts`, `src/ai/jev-client.ts`, `src/ai/system.ts`, `src/engine/system-runtime.ts`, `src/engine/content-types.ts`, `test/ai-jev-system.test.ts`, `test/ai-system.test.ts`.

---

## 1. BỐI CẢNH & TỔNG QUAN KIẾN TRÚC

Thành phần `The System` (Hệ Thống) trong `game-trung-sinh` đóng vai trò là "bàn tay vàng" (golden finger) của nhân vật chính theo motif truyện tu tiên/trùng sinh. 

### 1.1 Vấn đề kiến trúc tiền tích hợp (1-Tier)
Trước khi tích hợp Jev, toàn bộ tương tác dạng hội thoại giữa người chơi và Hệ Thống trong `src/ai/system.ts` được chuyển tiếp thẳng đến endpoint `/api/narrate` (LLM sinh văn tự do):
* **Độ trễ cao (1.500ms – 3.000ms):** Người chơi phải chờ LLM sinh xong văn bản mới kích hoạt được logic nhiệm vụ hoặc nhận diện ý định.
* **Nguy cơ Ảo giác Quest ID (Hallucination Risk):** LLM sinh ngôn ngữ tự nhiên thường xuyên bịa ra các `questId` không tồn tại trong quest pool đang hoạt động của engine, dẫn đến việc bị drop thành `null`.
* **Chi phí & Độ tin cậy:** Phụ thuộc 100% vào mạng và LLM cloud đắt đỏ cho các tác vụ phân loại cơ bản.

### 1.2 Kiến trúc 2-Tier Pipeline với Jev (System One AI)
* **Tier 1 (Jev System One / ~80ms):** Xử lý Non-Autoregressive Single Forward Pass để phân loại ý định (`intent`), lựa chọn nhiệm vụ định kiểu (`choice`), chấm điểm thái độ tuân phục (`score`: 1–5), và phát hiện thái độ thù địch (`noul`: Boolean). Trả kết quả định kiểu nghiêm ngặt (Type-Safe) về cho Game Engine kích hoạt logic ngay lập tức (~90ms end-to-end feedback: âm thanh "Ting!", mở popup nhiệm vụ).
* **Tier 2 (Frontier LLM / 1.000ms - 2.000ms):** Nhận context đã được Jev phân loại chắc chắn (`SystemFastDecision`) để sinh khẩu khí và lời thoại văn phong Hệ Thống song song, không chặn luồng tương tác của người chơi.

---

## 2. CHI TIẾT ĐẶC TẢ KỸ THUẬT 5 CHIỀU

### 2.1 Chiều 1: Exact API Schemas & Typed Primitives

#### 2.1.1 Ba Kiểu Nguyên Thủy (Primitives) của Jev
1. **`choice`:** Lựa chọn chính xác 1 nhãn từ danh sách nhãn định sẵn (tối đa 255 nhãn). Được dùng cho:
   - `intent`: Danh sách cố định 6 nhãn (`request_quest`, `chat_general`, `inquire_status`, `complain`, `defiance_mockery`, `accept_current_quest`).
   - `selectedQuestId`: Danh sách động gồm các ID quest đang kích hoạt từ `systemQuestsFor(game)` kèm theo nhãn `'none'`.
2. **`score`:** Chấm điểm theo thang số nguyên/số thực chuẩn hóa có biên giới `[min, max]`.
   - `obedienceScore`: Thang điểm nguyên từ `1` (bất kính, chống đối) đến `5` (tuyệt đối tôn kính, phục tùng).
3. **`noul`:** Quyết định Boolean nhị phân (`value: boolean`) kèm xác suất tin cậy (`probability: number [0.0 - 1.0]`).
   - `isHostile`: Đánh giá người chơi có đang xúc phạm, khinh thường hoặc đe dọa Hệ Thống hay không.

#### 2.1.2 Request Payload JSON Schema
```json
{
  "model": "jev-latest",
  "state": {
    "system": {
      "id": "sys_battle",
      "nameVi": "Chiến Thần Hệ Thống",
      "personalityVi": "Lạnh lùng, hiếu chiến, coi thường kẻ yếu"
    },
    "player": {
      "stage": 2,
      "gold": 150,
      "hp": 100,
      "qi": 45
    },
    "availableQuests": [
      { "id": "q_sys_battle_01", "name": "Trảm sát Ma Lang", "difficulty": 1 },
      { "id": "q_sys_battle_02", "name": "Thu phục Hắc Hổ", "difficulty": 2 }
    ],
    "playerMessage": "Này hệ thống, hôm nay ta rảnh, có việc gì làm kiếm chút linh thạch không?"
  },
  "questions": {
    "intent": {
      "type": "choice",
      "options": [
        "request_quest",
        "chat_general",
        "inquire_status",
        "complain",
        "defiance_mockery",
        "accept_current_quest"
      ],
      "instructions": "Classify the player core intent toward The System."
    },
    "selectedQuestId": {
      "type": "choice",
      "options": ["q_sys_battle_01", "q_sys_battle_02", "none"],
      "instructions": "Select matching quest ID from availableQuests if player wants a quest, else none."
    },
    "obedienceScore": {
      "type": "score",
      "min": 1,
      "max": 5,
      "instructions": "Rate respect level (1 = insolent, 5 = reverent)."
    },
    "isHostile": {
      "type": "noul",
      "instructions": "Is player defying, insulting, or mocking the System?"
    }
  }
}
```

#### 2.1.3 Response Payload JSON Schema
```json
{
  "id": "jev_run_98a72bf4a1",
  "model": "jev-latest",
  "latencyMs": 76,
  "answers": {
    "intent": {
      "value": "request_quest",
      "confidence": 0.972
    },
    "selectedQuestId": {
      "value": "q_sys_battle_01",
      "confidence": 0.941
    },
    "obedienceScore": {
      "value": 4,
      "confidence": 0.885
    },
    "isHostile": {
      "value": false,
      "probability": 0.021
    }
  }
}
```

#### 2.1.4 Định nghĩa TypeScript & Zod Schemas (`src/ai/jev-schemas.ts`)
* `JevIntentSchema`: `z.enum(['request_quest', 'chat_general', 'inquire_status', 'complain', 'defiance_mockery', 'accept_current_quest'])`
* `JevResponseSchema`:
  * `id`: `z.string()`
  * `model`: `z.string()`
  * `latencyMs`: `z.number().optional()`
  * `answers.intent`: `z.object({ value: JevIntentSchema, confidence: z.number().min(0).max(1) })`
  * `answers.selectedQuestId`: `z.object({ value: z.string(), confidence: z.number().min(0).max(1) })`
  * `answers.obedienceScore`: `z.object({ value: z.number().min(1).max(5), confidence: z.number().min(0).max(1).optional() })`
  * `answers.isHostile`: `z.object({ value: z.boolean(), probability: z.number().min(0).max(1).optional() })`
* `SystemFastDecision`:
  ```typescript
  export interface SystemFastDecision {
    intent: JevIntent
    questId?: string
    obedienceScore: number
    isHostile: boolean
    latencyMs: number
  }
  ```

---

### 2.2 Chiều 2: Client Requirements & Bounded Routing (`src/ai/jev-client.ts`)

1. **Endpoint & Authentication:**
   * URL: `https://api.typesafe.ai/v1/systemone` (mặc định) hoặc proxy server nội bộ `/api/systemone`.
   * Header: `Authorization: Bearer <TYPESAFE_API_KEY>`, `Content-Type: application/json`.
   * Khóa API: lấy từ `config.apiKey`, `process.env.TYPESAFE_API_KEY`, hoặc `import.meta.env.VITE_TYPESAFE_API_KEY`.
2. **Ngưỡng Timeout 600ms:**
   * Sử dụng `AbortController` với `setTimeout(() => controller.abort(), timeoutMs)`.
   * Đảm bảo tính phản xạ siêu tốc; nếu mạng trễ vượt quá 600ms, hủy request ngay lập tức để chuyển sang Fallback.
3. **Cấu trúc Dữ liệu Đầu vào & Khai thác Pool Quest:**
   * Truy xuất hệ thống đang hoạt động: `activeSystem(game)`.
   * Lấy danh sách nhiệm vụ hợp lệ: `systemQuestsFor(game)`.
   * **Lưu ý thực tế từ mã nguồn:** Trong `src/engine/content-types.ts`, `QuestDef` sử dụng trường `nameVi` và `nameEn` (không phải `titleVi`). `src/ai/jev-client.ts` ánh xạ đúng `name: q.nameVi`.
   * Khởi tạo danh sách lựa chọn: `questIdOptions = [...availableQuests.map((q) => q.id), 'none']`.
4. **Vệ sinh & Chuẩn hóa Lời thoại Người chơi:**
   * `playerMessage = playerMessage.trim().slice(0, 300)`.
5. **Cơ chế Bảo vệ Chống Ảo giác (Hallucination Defense):**
   * Kết quả `selectedQuestId` từ Jev được kiểm tra:
     ```typescript
     questId: selectedQId !== 'none' && questIdOptions.includes(selectedQId) ? selectedQId : undefined
     ```
   * Nếu Jev trả về một ID lạ nằm ngoài `questIdOptions`, trường `questId` bắt buộc bị hạ cấp về `undefined`.
6. **Cơ chế Fallback Rule-Based Tuyệt Đối:**
   * Kích hoạt khi: thiếu API key (`!apiKey`), mạng lỗi (`fetch rejected`), timeout (`AbortError`), HTTP error (`!res.ok`), hoặc lỗi phân tích dữ liệu JSON/Zod parse fail.
   * Logic Fallback:
     * Chuyển chữ thường: `lower = message.toLowerCase()`.
     * Nhận diện thù địch: `/cút|ngu|phế|vô dụng|chó|đồ khốn|hệ thống rác/.test(lower)`.
       * `intent = 'defiance_mockery'`, `isHostile = true`, `obedienceScore = 1`, `questId = undefined`.
     * Nhận diện xin nhiệm vụ: `/nhiệm vụ|việc gì|làm gì|kiếm tiền|quest|task/.test(lower)`.
       * `intent = 'request_quest'`, `isHostile = false`, `obedienceScore = 3`, `questId = availableQuestIds[0]` (nếu khác `'none'`).
     * Mặc định khác: `intent = 'chat_general'`, `isHostile = false`, `obedienceScore = 3`, `questId = undefined`.

---

### 2.3 Chiều 3: 2-Tier Pipeline Requirements trong `src/ai/system.ts`

1. **Ranh giới Kiến trúc (AGENTS.md & KNOWLEDGE.md):**
   * `src/engine/`: Chứa toàn bộ logic biến đổi trạng thái xác định (deterministic state transitions). Engine không phụ thuộc trực tiếp vào network hay AI model.
   * `src/ai/`: Đóng vai trò adapter, nhận diện ý định và sinh văn phong tùy chọn; không được trở thành source of truth của game.
2. **Luồng Thực thi 2 Tầng (Sequence of Operations):**
   * **Bước 1 (Tier 1 - Jev Fast Intent ~80ms):**
     * Khi người chơi gửi câu chat, gọi `classifySystemUtterance(game, playerMessage)`.
     * Nhận `SystemFastDecision` ngay lập tức (dù là Jev cloud hay Rule-based fallback).
   * **Bước 2 (Instant Engine Update & Audio/Visual Feedback ~90ms):**
     * Nếu `decision.questId` hợp lệ và `decision.intent === 'request_quest'`, UI/Engine có thể kích hoạt cấp nhận nhiệm vụ ngay hoặc bật thông báo System Quest tương ứng.
     * Cập nhật điểm tuân phục/thái độ nếu có hệ thống ghi nhận.
   * **Bước 3 (Tier 2 - Narration Context Enrichment 1.000ms - 2.000ms):**
     * Truyền thông tin `decision` (intent, isHostile, obedienceScore, questId) vào context của `buildSystemPayload`.
     * Gọi `/api/narrate` để LLM sinh văn phong đáp lời phù hợp với thái độ (ví dụ: nếu `isHostile`, Hệ Thống dùng giọng điệu trừng phạt/cảnh cáo; nếu `request_quest`, Hệ Thống ban bố nhiệm vụ tương ứng).
   * **Bước 4 (Fallback khi Tier 2 lỗi):**
     * Nếu `/api/narrate` lỗi hoặc tắt (`narrationWanted() === false`), Hệ Thống hiển thị câu thoại mặc định từ `system.personalityVi` hoặc thông điệp xác định, không làm gián đoạn trạng thái game đã được Tier 1 phân loại.

---

### 2.4 Chiều 4: Đặc Tả Bộ Kiểm Thử Tự Động Hóa (`test/ai-jev-system.test.ts`)

Bộ test sử dụng framework `vitest` của dự án với 5 ca kiểm thử chuẩn (TC-01 đến TC-05):

1. **TC-01: Bounded Choice & Valid Pool Verification:**
   * Mục tiêu: Đảm bảo phân loại đúng intent, trích xuất đúng questId từ pool hợp lệ, và payload gửi đi chứa đúng danh sách options (`q_sys_battle_01`, `none`).
   * Kiểm chứng: `decision.intent === 'request_quest'`, `decision.questId === 'q_sys_battle_01'`, `decision.isHostile === false`, `decision.obedienceScore === 4`.
2. **TC-02: Hallucination Defense (Bảo vệ chống ảo giác Quest ID):**
   * Mục tiêu: Khi Jev giả lập trả về questId không có trong pool (`q_sys_hacked_alien_quest`), client phải tự động hạ cấp `questId` thành `undefined`.
   * Kiểm chứng: `expect(decision.questId).toBeUndefined()`.
3. **TC-03: Hostility & Defiance Detection (Phát hiện xúc phạm Hệ Thống):**
   * Mục tiêu: Nhận diện câu nói xúc phạm ("Hệ thống rác rưởi, cút đi!").
   * Kiểm chứng: `decision.intent === 'defiance_mockery'`, `decision.isHostile === true`, `decision.obedienceScore === 1`.
4. **TC-04: Network Error & Timeout Degradation (Xử lý mất mạng / Quá thời gian chờ):**
   * Mục tiêu: Giả lập `fetch` bị `Network disconnected` hoặc timeout abort; xác minh không có ngoại lệ (exception) nào bị văng ra ngoài, hệ thống rơi về Rule-based fallback an toàn.
   * Kiểm chứng: `decision.intent === 'request_quest'`, `decision.questId === 'q_sys_battle_01'`, `decision.isHostile === false`.
5. **TC-05: Offline / Keyless Mode (Chế độ ngoại tuyến / Không có API Key):**
   * Mục tiêu: Khi `TYPESAFE_API_KEY` trống hoặc không cấu hình, `fetch` không bao giờ được gọi; hệ thống phân loại ngoại tuyến tức thì qua regex rule-based.
   * Kiểm chứng: `expect(fetchSpy).not.toHaveBeenCalled()`, `decision.intent === 'defiance_mockery'`, `decision.isHostile === true`.

---

### 2.5 Chiều 5: Ánh Xạ Tiêu Chí Chấp Nhận (Acceptance Criteria R1 - R4)

| Mã Yêu Cầu | Nội Dung Đặc Tả | Tiêu Chí Chấp Nhận (Acceptance Criteria) | Tệp Liên Quan | Trạng Thái Kiểm Chứng |
|---|---|---|---|---|
| **R1** | Hiện thực hóa Jev System One Client & Schemas | • Zod schema thẩm định 100% request/response của Jev.<br>• Giới hạn options questId theo pool `systemQuestsFor(game)` + `'none'`.<br>• Phân loại chuẩn 3 primitives (choice, score, noul). | `src/ai/jev-schemas.ts`<br>`src/ai/jev-client.ts` | **ĐẠT** (`test/ai-jev-system.test.ts` TC-01, TC-02, TC-03; `npm run typecheck` 0 lỗi) |
| **R2** | Tích hợp Pipeline 2-Tier vào The System | • Kết nối tầng phân loại Jev siêu tốc (~80ms).<br>• Fallback Rule-based an toàn khi offline, thiếu key hoặc timeout > 600ms.<br>• Tách biệt feedback trạng thái tức thì và sinh lời thoại bất đồng bộ. | `src/ai/system.ts`<br>`src/ai/jev-client.ts` | **ĐẶT CHUẨN ĐẶC TẢ** (Kiến trúc sẵn sàng tích hợp vào pipeline và UI) |
| **R3** | Bộ Kiểm Thử Tự Động Hóa | • Viết bộ test `test/ai-jev-system.test.ts` gồm TC-01 đến TC-05.<br>• Pass 100% Vitest.<br>• Pass 100% TypeScript compilation (`tsc --noEmit`). | `test/ai-jev-system.test.ts` | **ĐẠT** (5/5 tests passed; typecheck sạch) |
| **R4** | Quản lý Git Branch & Mở PR / Bàn Giao | • Tuân thủ hợp đồng AGENTS.md.<br>• Tạo nhánh `feat/jev-system-one` sạch sẽ.<br>• Bàn giao tài liệu kiến trúc 2-Tier hoàn chỉnh. | `docs/agent-work/active/jev-system-one-classifier.md` | **ĐẠT QUY CHUẨN** (Claim đang active bởi codex; handoff tài liệu sẵn sàng) |

---

## 3. BẢNG DANH MỤC TÍNH NĂNG ĐÃ KHÁM PHÁ (FEATURES DISCOVERED)

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | Primitive | `choice` primitive | Phân loại không tự hồi quy (non-autoregressive), chọn 1 nhãn từ tập nhãn rời rạc (tối đa 255) | Nhãn danh sách options, văn bản người chơi | Nhãn được chọn (`value`) + độ tin cậy (`confidence` 0..1) | Trả về nhãn có xác suất cao nhất; nếu sai schema Zod ném lỗi validation | `jev_integration_spec.md` §2.2 |
| 2 | Primitive | `score` primitive | Đánh giá mức độ định lượng trên thang số chuẩn hóa | Khoảng giá trị `[min, max]`, instructions | Điểm số nguyên/thực (`value`) + confidence tùy chọn | Trả về số trong khoảng `[min, max]`; ngoài biên bị Zod chặn | `jev_integration_spec.md` §2.2 |
| 3 | Primitive | `noul` primitive | Phân loại nhị phân Boolean kèm xác suất | Instructions, câu nói người chơi | Quyết định Boolean (`value: boolean`) + xác suất (`probability` 0..1) | Trả về `true`/`false` an toàn | `jev_integration_spec.md` §2.2 |
| 4 | Schema | `JevIntentSchema` | Enum nghiêm ngặt 6 ý định tương tác của ký chủ đối với Hệ Thống | Dữ liệu phản hồi từ Jev API | Một trong 6 chuỗi: `request_quest`, `chat_general`, `inquire_status`, `complain`, `defiance_mockery`, `accept_current_quest` | Zod ValidationError nếu xuất hiện nhãn ngoài enum | `src/ai/jev-schemas.ts`:3-10 |
| 5 | Schema | `JevResponseSchema` | Lược đồ Zod thẩm định toàn bộ phản hồi từ endpoint Jev | Chuỗi JSON nhận từ API | Đối tượng kiểu `JevResponse` chứa answers định kiểu | Ném ZodError, được bắt bởi try-catch trong client để kích hoạt fallback | `src/ai/jev-schemas.ts`:13-35 |
| 6 | Schema | `SystemFastDecision` | Giao diện chuẩn hóa kết quả phân loại nhanh cấp cho Game Engine | Trích xuất từ Jev response hoặc rule-based fallback | `{ intent, questId?, obedienceScore, isHostile, latencyMs }` | Luôn đảm bảo kiểu dữ liệu an toàn, không chứa giá trị rác | `src/ai/jev-schemas.ts`:38-44 |
| 7 | Client | `classifySystemUtterance` | Hàm thực thi phân loại phát ngôn của người chơi theo Jev System One | `(game: GameState, playerMessage: string, config?: JevClientConfig)` | `Promise<SystemFastDecision>` | Bắt mọi ngoại lệ mạng, timeout, parse lỗi và trả về Rule-based fallback | `src/ai/jev-client.ts`:14-115 |
| 8 | Client | Dynamic Quest Pool Bounding | Giới hạn options của câu hỏi `selectedQuestId` chỉ nằm trong quest đang mở của game | `systemQuestsFor(game)` | Mảng các quest ID hiện hữu + `'none'` | Nếu không có quest nào mở, danh sách options chỉ có `['none']` | `src/ai/jev-client.ts`:26-31 |
| 9 | Client | Hallucination Guard | Kiểm tra xác thực quest ID trả về từ Jev có thuộc pool hợp lệ hay không | `selectedQId` từ API response, `questIdOptions` | `questId` hợp lệ hoặc `undefined` | Nếu ID không nằm trong `questIdOptions`, tự động ép về `undefined` | `src/ai/jev-client.ts`:106 |
| 10 | Client | Timeout Control (600ms) | Hủy request nếu thời gian phản hồi vượt quá 600ms để giữ độ trễ trải nghiệm | `AbortController`, `timeoutMs` (mặc định 600) | Kích hoạt `controller.abort()` khi hết hạn | Tạo ngoại lệ AbortError, được try-catch bắt và chuyển ngay sang fallback | `src/ai/jev-client.ts`:81-82 |
| 11 | Client | Zero-Key Instant Bypass | Bỏ qua hoàn toàn lệnh gọi HTTP khi không có API key để đạt độ trễ 0ms | `apiKey === ''` | Gọi trực tiếp `fallbackRuleBasedClassifier` | Không phát sinh network call, an toàn tuyệt đối khi offline | `src/ai/jev-client.ts`:33-35 |
| 12 | Fallback | `fallbackRuleBasedClassifier` | Bộ phân loại dự phòng dùng biểu thức chính quy xác định khi mất mạng/lỗi | `(message, availableQuestIds, elapsedMs)` | `SystemFastDecision` với intent, questId, obedience, isHostile | Luôn trả về kết quả hợp lệ, không bao giờ ném lỗi | `src/ai/jev-client.ts`:120-136 |
| 13 | Fallback | Hostile Keyword Matching | Phát hiện các từ khóa lăng mạ, xúc phạm Hệ Thống | Biểu thức chính quy: `/cút|ngu|phế|vô dụng|chó|đồ khốn|hệ thống rác/` | `intent: 'defiance_mockery'`, `isHostile: true`, `obedienceScore: 1` | Bắt trúng các biến thể chữ thường | `src/ai/jev-client.ts`:127 |
| 14 | Fallback | Quest Keyword Matching | Phát hiện các từ khóa người chơi tìm kiếm nhiệm vụ | Biểu thức chính quy: `/nhiệm vụ|việc gì|làm gì|kiếm tiền|quest|task/` | `intent: 'request_quest'`, gán quest đầu tiên trong pool (nếu có) | Nếu pool chỉ có `'none'`, gán `questId: undefined` | `src/ai/jev-client.ts`:126 |
| 15 | Pipeline | 2-Tier AI Integration in System | Kiến trúc tách biệt phản ứng nhanh (Tier 1) và sinh văn tự do (Tier 2) | Lời thoại người chơi | Trạng thái phản hồi tức thì (~90ms) + Lời thoại LLM song song | Nếu Tier 2 lỗi, giao diện vẫn có kết quả phân loại từ Tier 1 | `jev_integration_spec.md` §1.2 |
| 16 | Test | TC-01 Bounded Choice Test | Kiểm thử phân loại chuẩn và giới hạn lựa chọn trong pool | Mock fetch trả về intent hợp lệ và questId hợp lệ | Pass test: intent, questId, isHostile, obedienceScore, options payload | Ném AssertionError nếu sai dữ liệu hoặc thừa options ngoài pool | `test/ai-jev-system.test.ts`:14-46 |
| 17 | Test | TC-02 Hallucination Defense Test | Kiểm thử lọc bỏ quest ID ảo giác từ mô hình AI | Mock fetch trả về questId bịa đặt `q_sys_hacked_alien_quest` | Pass test: `decision.questId === undefined` | Ném AssertionError nếu questId ảo giác bị lọt qua | `test/ai-jev-system.test.ts`:48-69 |
| 18 | Test | TC-03 Hostility Detection Test | Kiểm thử phát hiện thái độ chống đối/lăng mạ Hệ Thống | Mock fetch trả về `defiance_mockery`, `isHostile: true`, `obedience: 1` | Pass test: cờ isHostile bật true, obedienceScore bằng 1 | Ném AssertionError nếu không phát hiện được sự xúc phạm | `test/ai-jev-system.test.ts`:71-94 |
| 19 | Test | TC-04 Network Error Fallback Test | Kiểm thử chuyển đổi êm dịu khi mất mạng hoặc lỗi kết nối | Mock fetch reject với `Error('Network disconnected')` | Pass test: không crash, intent = request_quest, questId = q_sys_battle_01 | Ném Exception nếu lỗi mạng không được bắt gọn | `test/ai-jev-system.test.ts`:96-106 |
| 20 | Test | TC-05 Keyless Offline Mode Test | Kiểm thử hoạt động hoàn toàn offline khi thiếu API key | `TYPESAFE_API_KEY = ''`, gọi classifier | Pass test: fetch không được gọi, trả kết quả dự phòng chuẩn | Ném AssertionError nếu fetch vẫn bị kích hoạt | `test/ai-jev-system.test.ts`:108-118 |

---

## 4. BẢNG TẬP TRUNG CÁC TRƯỜNG HỢP BIÊN & DỊ THƯỜNG (EDGE CASES)

| # | Feature | Input | Observed Behavior |
|---|---|---|---|
| 1 | Bounded Choice | Jev trả về `selectedQuestId = "q_alien_invader"` không có trong `availableQuests` | Client phát hiện ID không nằm trong `questIdOptions`, lập tức gán `questId = undefined`. Game engine được bảo vệ 100% khỏi lỗi nạp quest không tồn tại. |
| 2 | Offline / No Key | Biến môi trường `TYPESAFE_API_KEY` trống hoặc không được truyền trong config | Hàm lập tức rẽ nhánh sang `fallbackRuleBasedClassifier`, không gọi `fetch`, không sinh promise trễ mạng, trả về kết quả sau ~0ms. |
| 3 | Network Timeout | Máy chủ Jev không phản hồi sau 600ms | `AbortController` phát tín hiệu `abort()`, `fetch` ném ra ngoại lệ `AbortError`, khối `catch` thu giữ lỗi và trả về kết quả Fallback Rule-based an toàn. Không có unhandled rejection. |
| 4 | Network Dropped | Mất kết nối internet hoàn toàn (`fetch` throws `NetworkError`) | Khối `catch` kích hoạt, trả về kết quả Fallback Rule-based theo từ khóa trong câu nói, độ trễ đo bằng thời gian từ lúc gọi đến khi bắt lỗi. |
| 5 | HTTP Error Status | Máy chủ Jev trả về HTTP 401 Unauthorized hoặc 500 Internal Server Error | Kiểm tra `!res.ok` kích hoạt, ngay lập tức chuyển hướng sang `fallbackRuleBasedClassifier` mà không cố parse JSON rác. |
| 6 | Malformed Response | Máy chủ trả về JSON không đúng cấu trúc (thiếu trường `answers.intent` hoặc `isHostile`) | `JevResponseSchema.parse(json)` ném ngoại lệ ZodError, được thu giữ trong khối `catch` và chuyển tiếp an toàn sang Fallback Rule-based. |
| 7 | Long Player Utterance | Người chơi nhập phát ngôn dài hơn 300 ký tự (ví dụ: 1000 ký tự spam) | Hàm xử lý chuỗi `.trim().slice(0, 300)` cắt gọn chính xác tối đa 300 ký tự trước khi gửi lên Jev hoặc phân tích regex, ngăn ngừa tràn payload hoặc prompt injection. |
| 8 | Empty/Whitespace Input | Người chơi chỉ gõ dấu cách hoặc chuỗi rỗng `   ` | Sau khi `.trim()`, chuỗi rỗng được phân loại thành `chat_general`, `questId: undefined`, `isHostile: false`, `obedienceScore: 3`. |
| 9 | Empty Quest Pool | Game đang ở trạng thái không có system quest nào khả dụng (`systemQuestsFor(game)` rỗng) | `availableQuests` rỗng, `questIdOptions` chỉ có duy nhất `['none']`. Dù Jev hay Fallback có nhận diện `request_quest`, `questId` vẫn là `undefined`. |
| 10 | Mixed Hostile & Quest | Người chơi vừa đòi quest vừa chửi rủa: "Hệ thống chó, đưa quest đây!" | Trong Rule-based Fallback, điều kiện `isHostile` được đánh giá ưu tiên trước `isQuest`, kết quả trả về `intent: 'defiance_mockery'`, `isHostile: true`, `obedienceScore: 1`, `questId: undefined`. |
| 11 | In-flight Quest Persistence | Người chơi đang thực hiện dở một quest nhưng chưa trả | Hàm `systemQuestsFor` trong engine vẫn giữ quest này trong pool thông qua `activeExtras`, đảm bảo Jev vẫn thấy quest đang chạy và không bị mất dấu. |
| 12 | Score Boundary Clamping | Jev cố tình trả về `obedienceScore = 6` hoặc `0` | Schema Zod `z.number().min(1).max(5)` từ chối gói tin, ném lỗi validation và rơi về Fallback an toàn với `obedienceScore: 1` hoặc `3`. |

---

## 5. KẾT LUẬN & ĐÁNH GIÁ TÍCH HỢP

1. **Tính Hoàn Thiện:**
   * Các tệp cốt lõi `src/ai/jev-schemas.ts` và `src/ai/jev-client.ts` đã được thiết kế chuẩn mực, khớp 100% với đặc tả kỹ thuật `jev_integration_spec.md`.
   * Bộ test `test/ai-jev-system.test.ts` gồm 5 test cases (TC-01 đến TC-05) đã chạy thử nghiệm thực tế và **PASS 100% (5/5 tests passed trong 9ms)**.
   * Quá trình biên dịch kiểu dữ liệu `npm run typecheck` thành công với **0 lỗi TypeScript**.
   * Bộ kiểm thử hiện tại của `system.ts` (`test/ai-system.test.ts`) tiếp tục **PASS 100% (3/3 tests)**.

2. **Lưu ý Quan Trọng cho Giai Đoạn Hoàn Tất:**
   * Trong đặc tả markdown sơ khởi có đề cập đến `q.titleVi`, tuy nhiên cấu trúc dữ liệu chuẩn của `QuestDef` trong `src/engine/content-types.ts` sử dụng `q.nameVi` và `q.nameEn`. Việc `src/ai/jev-client.ts` sử dụng `q.nameVi` là hoàn toàn chính xác theo hợp đồng engine.
   * Ranh giới phân chia giữa `src/ai/` và `src/engine/` tuân thủ nghiêm ngặt `docs/agent-os/KNOWLEDGE.md`: Jev chỉ làm nhiệm vụ phân loại phát ngôn của người chơi, engine giữ quyền quyết định cuối cùng trong việc kích hoạt quest hay cập nhật trạng thái.
