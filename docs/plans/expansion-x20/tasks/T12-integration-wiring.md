# T12 — integration-wiring (Nối tất cả vào engine + UI)

- **Wave**: W2 — TUẦN TỰ, chỉ chạy khi CẢ T01–T11 đã handoff xanh.
- **FILE ĐƯỢC SỬA (độc quyền)**: `src/engine/reducer.ts`, `src/engine/index.ts`,
  `src/engine/shop.ts`, `src/content/index.ts`, `src/ui/GameScreen.tsx`, `src/ui/npcArt.ts` (nếu cần),
  `src/i18n/vi.ts`, `src/i18n/en.ts`, `src/App.tsx` (chỉ khi bắt buộc).
- **Chỉ task này** được sửa các gate validate trong `content/index.ts`.

## Danh sách việc (làm theo thứ tự, chạy test sau mỗi mục)

1. **Nâng gate validate** (`src/content/index.ts`):
   `NpcDefSchema.array().min(30)` → `min(60)`;
   `EndingDefSchema.length(11)` → `length(12)`;
   `ChapterDefSchema.length(6)` → `length(8)`;
   `z.array(QuestDefSchema).min(1)` → `min(150)`.
   Thêm validate: NPC alias unique; mỗi NPC có quest (dùng dữ liệu thực); shops hợp lệ qua
   `validateShops(...)`; NPCS có node map tương ứng cho region `village` (node porch/home).
2. **Export module mới** từ `src/content/index.ts` và `src/engine/index.ts`:
   `SHOPS/shopForNpc` (T11), `BEASTS/companionBuff/canTame` (T06), `weatherFor/seasonFor/WEATHER_EFFECTS` (T05),
   `HYBRID_RECIPES` (T07), `SUBLAYERS/sublayerFor` (T09), `NAME_MEMORIES/rememberedCount` (T10),
   `economy` helpers (T02), `formatSystemMessage/queuePush/queueDrain` (T14).
3. **Reducer — economy 3 lớp**: thêm action `convert_currency` (tỷ giá T02); shop buy/sell hiện có
   đọc `priceGold/priceSilver/priceLS` qua `shopForNpc(npcId)`; món LS chỉ cho phép khi
   `spiritStones` đủ. Giữ mọi mutation qua pattern reducer hiện có (không mutate trực tiếp).
4. **Reducer — weather**: mỗi action tính `weatherFor(state.seed, state.day)` khi cần mod
   (giá thảo = weather.herbPriceMod...). KHÔNG lưu weather vào state (tính lại mỗi lần — pure).
5. **Reducer — companion**: action `tame_beast { beastId, baitItemId }`: check `canTame` + đúng bait
   trong inventory → set `companionId`, trừ bait, +1 action slot trong combat
   (`COMPANION_EXTRA_ACTION`). Combat buff qua `companionBuff`.
6. **Reducer — memory names**: khi hoàn thành quest nhóm `q_*` → `rememberNames` với các
   `nm_*` id do quest định nghĩa; sự kiện đêm (day 7/14/21/28 tại village) mở trang sổ
   `night_1..4` (mỗi trang 10 tên, dùng `NIGHT_PAGES`).
7. **Reducer — aff gate**: `doTalk` tăng aff hiện có (grep `aff_` trong reducer) — set flag
   `aff_gate_<npc>` khi aff chạm 3/6/9 để quest `q_aff_*` mở.
8. **Endings**: khi lên ending — tính `branch` từ flag `branch` (scene T09 đặt), tính
   `sublayerFor(branch, rememberedCount(state), state.flags)`, ghép epilogue vào màn ending.
8b. **Hệ Thống hiện hình (canon `contracts/story-canon.md` — BẮT BUỘC)**:
   - Khi nhận/hoàn thành quest CHÍNH, trao thưởng main, deadline còn ≤ 1 ngày, mở khoá
     (tame/technique/region mới): push vào `state.systemQueue` qua `queuePush` với đúng
     message id của T14; vi phạm quy tắc giọng = lỗi nghiệm thu.
   - `GameScreen`: panel thông báo render `queueDrain(state.systemQueue)` — tối đa 3 dòng
     mới nhất, format qua `formatSystemMessage(..., locale)` theo ngôn ngữ UI; KHÔNG hiển thị
     khi `systemQueue` rỗng.
   - Nhánh rootless chọn "từ chối kích hoạt" (flag `system_refused`) → mọi push thông báo
     Hệ Thống bị chặn (nó đã tắt) — đây là điểm twist, không phải bug.
9. **Mai Hoa di chuyển theo giờ**: vị trí NPC village — sáng (day tick đầu) node
   `village-elder-porch`, sau giữa ngày `village-elder-home` (dựa `state.day` + action count hiện có;
   nếu engine chưa có khái niệm "giờ trong ngày" — dùng quy tắc: sau action `rest` → ở home,
   còn lại → porch; GHI RÕ quyết định này vào handoff).
10. **HUD/i18n**: hiển thị tiền 3 tầng, `Đã nhớ: N/200`, slot linh thú; thêm key i18n vi/en
    ĐỒNG BỘ (cùng bộ key ở 2 file).
11. Chạy `npx vitest run` — sửa mọi test vỡ do gate mới.

## Tiêu chí nghiệm thu

`npm run typecheck && npm run lint && npx vitest run` đều xanh. `npm run build` xanh.
Không còn TODO khi để trống logic.

## Cấm

- Xóa test cũ để cho qua. Đổi hành vi narration (`src/ai/`, `src/engine/narrator.ts`) ngoài
  phạm vi hiển thị. Tự ý đổi key localStorage.
