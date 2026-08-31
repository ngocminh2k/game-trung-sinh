# CONVENTIONS — Sổ tay bắt buộc cho mọi agent thực thi

Đọc file này TRƯỚC KHI mở code. Mọi quy tắc dưới đây đã được xác minh từ code thật.

## 1. Ranh giới kiến trúc (eslint sẽ từ chối nếu vi phạm)

- `src/content/` — DỮ LIỆU khai báo + validate. Không chứa logicGameState.
- `src/engine/` — state machine thuần nhất định (deterministic). Cấm DOM, cấm network, cấm `console.log`.
- `src/ui/` — render + input. `src/ai/` — narration, KHÔNG được trở thành nguồn sự thật của game.
- Randomness: chỉ qua `state.rng` + helpers `initialRng`/`pickFrom` trong `src/engine/rng.ts`.
  **Ngoại lệ duy nhất**: weather là hàm thuần `weatherFor(seed, day)` — KHÔNG tiêu rng stream (T05).
- Cấm `Date.now()`, `new Date()` trong engine — thời gian game là `state.day`, chỉ tăng bằng action
  (`rest` v.v.). ESLint `no-restricted-globals` đang bật các rule này.

## 2. Quy tắc đặt tên (bắt buộc, agent KHÔNG được tự chế)

- NPC id: `n_<vai_trov>_<ten>` viết thường, ví dụ `n_elder_meihua`, `n_merchant_bao`.
- Quest id: theo đúng bảng trong `contracts/quest-catalog.md`, ví dụ `q_vil_01`.
- Item id: `snake_case` (ví dụ `moon_moss`, `pill_hp`). Flag: `snake_case`.
- Mọi bản ghi có đủ cặp field `nameVi/nameEn`, `descVi/descEn`, `textVi/textEn` — thiếu En = lỗi nghiệm thu.

## 3. Hình dạng dữ liệu (copy Y HỆT các interface này)

Mọi record trong content phải khớp Zod schema trong `src/engine/schema.ts`.
Ba shape quan trọng nhất (đầy đủ trong `src/engine/content-types.ts`):

```ts
// NPC — bắt buộc: id, nameVi/En, roleVi/En, locationId, greetVi/En, aliases
{ id: 'n_elder_meihua', nameVi: 'Cụ Mai Hoa', nameEn: 'Elder Meihua',
  roleVi: 'trưởng làng', roleEn: 'village elder', locationId: 'village',
  greetVi: '...', greetEn: '...', aliases: ['elder', 'meihua'],
  lines: [ { when: { affMin: 1 }, vi: '“...”', en: '“...”' }, ... ] }

// QUEST — bắt buộc: id, giverNpcId, nameVi/En, descVi/En, steps,
// requiredItems {}, requiredFlags [], rewardGold, rewardItems {}, aliases
// steps[].isTurnInStep=true ở BƯỚC CUỐI. secret?: true để ẩn quest.
// deadlineDays?: N cho world-timed.
```

- `locationId` của NPC phải là 1 trong 16 id trong `contracts/npc-registry.md` — validation đã sẵn
  sàng chặn id lạ (`validateAllContent` trong `src/content/index.ts`).
- `giverNpcId` của quest phải tồn tại trong NPCS — validation chặn.
- `completeItems` của step phải là item id tồn tại — validation chặn.

## 4. Các "cổng validate" PHẢI cập nhật khi mở rộng (file `src/content/index.ts` — chỉ T12 sửa)

| Dòng kiểm tra hiện tại | Giá trị mới sau mở rộng |
|---|---|
| `NpcDefSchema.array().min(30)` | `min(60)` |
| `EndingDefSchema.length(11)` | `length(12)` |
| `ChapterDefSchema.length(6)` | `length(8)` |
| `z.array(QuestDefSchema).min(1)` | `min(150)` |

Task W1 KHÔNG được tự sửa các gate này (tránh conflict) — T12 cập nhật trong W2.
Trước khi T12 chạy, task nào thêm dữ liệu phải bảo đảm test unit riêng của nó pass mà KHÔNG đổi gate.

## 5. Lệnh kiểm chứng (dùng đúng lệnh, dán kết quả thật vào báo cáo)

| Mục đích | Lệnh |
|---|---|
| Type toàn dự án | `npm run typecheck` |
| Lint | `npm run lint` |
| Test 1 file | `npx vitest run test/<tên>.test.ts` |
| Test toàn bộ | `npx vitest run` |
| Build | `npm run build` |
| E2E | `npx playwright test` |
| Đếm nhanh NPC/quest (PowerShell) | `Select-String -Path src\content\npcs.ts -Pattern "id: 'n_" | Measure-Object | % Count` |

## 6. Qui trình 1 task (làm đúng thứ tự)

1. `git status --short` — nếu có thay đổi ngoài phạm vi mình, DỪNG, báo cáo, không đụng vào.
2. Đọc task doc + contract. Ghi ra 3–5 tiêu chí nghiệm thu trước khi code.
3. Code. Copy pattern từ bản ghi có sẵn cùng loại (đừng tự chế field mới).
4. Chạy lệnh kiểm chứng của task. Sửa đến khi xanh.
5. `npm run typecheck` + `npm run lint` phải xanh.
6. Handoff theo AGENTS.md với: file đã sửa, lệnh đã chạy + kết quả, rủi ro còn lại.

## 7. Cấm tuyệt đối

- Sửa file ngoài danh sách ownership của task mình.
- Xóa/sửa bản ghi NPC/quest/item CŨ (chỉ được thêm hoặc sửa lỗi chính tả nếu test yêu cầu).
- Đổi `GAME_STATE_VERSION`, đổi tên field có sẵn trong `GameState`, đổi key localStorage `phe-can-ky:save:v1`.
- Đụng `src/ai/` (narration boundary), `src/engine/narrator.ts` (T12 mới được phép nếu cần).
- Bịa ID mới ngoài `contracts/` — ID trùng = content validation chặn, nhưng tốn thời gian làm lại.

## 8. Giọng Hệ Thống (canon 2026-08-31 — xem `contracts/story-canon.md`)

- Hệ Thống **KHÔNG phải NPC** — cấm đưa vào `npcs.ts`, cấm cho nó đứng trên map hay `talk`.
- Chỉ nói qua khung `【Hệ Thống】` (En: `【System】`), mở thông báo thưởng bằng `Đinh!`.
- Ngắn, máy móc, lạnh, cà khịa ≤ 1 câu/thông báo. Không emoji, không "chủ nhân à~".
- Không bao giờ nói sai con số (hiển thị đúng state) — nhưng né mọi câu hỏi về nguồn gốc:
  `【Hệ Thống】 Dữ liệu không đủ để trả lời.`
