# Đánh giá Game Design & Kế hoạch chi tiết — Phế Căn Ký

> Ngày: 2026-08-30. Viết bởi senior game designer (đánh giá độc lập).
> Đối chiếu với: `docs/GDD.md`, `docs/MASTER_ACCEPTANCE.md`, `docs/complete-game-contract.md`,
> `docs/STORY.md`, engine (`src/engine/**`), content (`src/content/**`), UI (`src/ui/**`).
> Khung lý thuyết dùng để đánh giá: MDA (Hunicke/LeBlanc/Zubek), Flow theory
> (Csíkszentmihályi), nguyên lý "Interesting Choices" (Sid Meier), Agency trong
> narrative design (Emily Short), loss aversion & feedback loops, game feel / "juice".

---

## PHẦN A — ĐÁNH GIÁ LẠI QUA LƯỚI LÝ THUYẾT

### A.1 Phân tích MDA

| Lớp | Trạng thái hiện tại | Nhận định |
|---|---|---|
| **Mechanics** | HP/Qi/gold/day/inventory/flags, danger = `danger×10 + rng(0–6)` (`src/engine/danger.ts`), training = cộng tuyến tính (`src/engine/stats.ts`), endings = `alive` + flag `story_ending` (`src/engine/endings.ts`) | Đầy đủ "hộp công cụ" nhưng mỗi mechanic riêng lẻ đều **phẳng**: không có mechanic nào buộc người chơi phải đánh đổi |
| **Dynamics** | Người chơi tự học: "mua manual sớm → train hiệu quả → mọi combat là thuế HP trả qua mặt" | Dynamic hiện tại là **một đường tối ưu duy nhất** — không có emergence, không có lối chơi thay thế |
| **Aesthetics** | Fantasy + Narrative + Discovery (đúng 3/8 thẩm mỹ trong MDA mà game nhắm tới) | Đây là lớp **mạnh nhất**: art direction ink-wash nhất quán, kịch bản có reveal thật (Hồi V), UI truyền đúng cảm giác tiên hiệp |

**Kết luận MDA:** designer chỉ có thể đụng vào Mechanics để thay đổi Dynamics và
Aesthetics. Lớp Aesthetics đã tốt; mọi nỗ lực tiếp theo phải đi vào Mechanics.

### A.2 Flow (kênh challenge–skill)

- **Bài toán 1 — Boredom channel:** combat hiện tại không có challenge (không có
  quyết định nào trong trận). Đi map + đọc truyện là nhịp chính; nhịp phụ
  (train/shop) là idle-lite. Flow chỉ xuất hiện ở các beat truyện.
- **Bài toán 2 — Thiếu "clear goals + immediate feedback" ở hệ phụ:** objective
  line đã làm tốt goals; feedback ngắn hạn (dùng item, mua đồ) chưa cảm nhận được
  vì hệ quả chậm (đi 2 node mới thấy khác biệt).
- **Bài toán 3 — Không có anxiety channel:** không có dead-line, không có nguồn
  áp lực thật. Truyện *kể* về "đêm thứ mười hai" nhưng không *tạo* áp lực.
  Flow cần cả hai cực: không có anxiety thì không có flow.

### A.3 Interesting Choices (Sid Meier)

Một lựa chọn "thú vị" khi: (1) không có đáp án hiển nhiên, (2) có trade-off rõ,
(3) có opportunity cost, (4) thông tin người chơi có là đủ để quyết nhưng không
đủ để chắc. Đối chiếu:

- **3 lựa chọn truyện/beat:** đúng dạng (1) và (2) về *narrative* — tốt. Nhưng
  (3) opportunity cost gần như bằng 0: chọn 1/2/3 rồi vẫn đi tiếp cùng lộ trình
  cùng NPC. Lựa chọn dramatic nhưng **mechanically trivial**.
- **Combat/shop/train:** các quyết định này lại ngược lại — mechanically có số
  liệu nhưng không có narrative trade-off, và hầu hết có "đáp án hiển nhiên".
- **Free-text:** hứa hẹn agency cao nhất (nghiên cứu Façade trong GDD), nhưng
  verb set nhỏ → người chơi học nhanh rằng hộp nhập là "menu dài hơn" → pillar 2
  ("hidden rails") bắt đầu lộ rails sau 3–4 lần correction.

### A.4 Agency (Emily Short) — Illusion of choice

3 loại agency: (a) **outcome agency** (quyết định điều gì xảy ra), (b) **process
agency** (quyết định *cách* làm), (c) **spectacle agency** (chọn thứ tự xem).
Hiện tại: (c) mạnh, (a) yếu (chỉ ở beat truyện), (b) gần như không có. Cửa sổ
dễ khai thác nhất là **(b)** — đó chính là combat, luyện công, kinh tế.

### A.5 Loss aversion & stakes

Truyện của bạn có tiền đề hoàn hảo để tạo stakes: "mỗi 12 năm làng quên một
người". Nhưng engine không có gì để *mất*. Gợi ý cốt lõi: biến "đêm thứ mười
hai" thành **bộ đếm ngày thật** — khi đó mọi giờ không tìm manh mối đều có giá.
Đây là trade-off rẻ nhất, hiệu quả cao nhất trong toàn bộ kế hoạch.

### A.6 Kết luận — điểm đánh giá lại (sau khi đối chiếu lý thuyết)

| Hạng mục | Điểm | Lý giải qua lý thuyết |
|---|---|---|
| Vision & Pillars | 9/10 | Pillars đúng, có căn cứ nghiên cứu; nhưng pillar 3 ("every outing has a trade-off") chưa được mechanics bảo chứng |
| Art & Aesthetic layer | 8.5/10 | MDA: lớp Aesthetics đạt; còn thiếu feedback động ("juice") |
| UI/UX | 8/10 | One-viewport, objective line chuẩn genre |
| **Systems / Mechanics** | **5/10** | MDA Dynamics: một đường tối ưu duy nhất; combat không có agency; không stakes |
| Story & Content | 7.5/10 | Reveal Hồi V tốt; chọn lựa chỉ re-tint (spectacle agency) |
| Engineering support | 9/10 | Determinism, 202/202 test (verify 2026-08-31: `npx vitest run`), Zod, AI boundary |
| **Tổng** | **7/10** | Nền móng xuất sắc; khoảng cách tới 8.5+ nằm hoàn toàn ở lớp Mechanics |

---

## PHẦN B — KẾ HOẠCH CHI TIẾT

> **Trạng thái thực thi (kiểm chứng 2026-08-31, coordinator tự chạy lệnh trên trạng thái
> hợp nhất):** Phase 0-A ✅ (32/32 E2E `npx playwright test e2e --workers=1`), Phase 0-B ✅
> (8/8 journey fresh-endings), Phase 1 ✅ (`test/combat-agency.test.ts` 10/10), Phase 2 ✅
> (`test/day-cost.test.ts` 15/15), Phase 3 ✅ (`test/rpg-systems.test.ts` 12/12, CodexPanel
> hiển thị benefit+cost), Phase 4 ✅ (`test/story-consequences.test.ts`, 6 lựa chọn
> route-proof, 30/30 nhóm test story), Phase 5 ✅ (`test/ai-narration.test.ts` +
> `test/ai-ui.test.tsx`, `SuggestionResult` suggested/empty/error, không bao giờ kẹt khi
> AI lỗi). Toàn bộ unit: 202/202 (`npx vitest run`); `npm run typecheck` exit 0; `npm run
> lint` exit 0. Phase 6 (juice) — chưa có implementation/test, mở. Phase 7 (playtest &
> balance) — chưa chạy, mở. Phase 8 — chưa bắt đầu. Chi tiết evidence từng phase nằm trong
> `docs/agent-work/handoffs/`.
>
> **Cập nhật 2026-08-31 (đợt 2 — đóng nốt kế hoạch):** Phase 3 build-gate hội thoại ✅
> (beat `b_crooked_deal`: Bảo phản ứng theo technique `crooked_circulation` đã học,
> `test/rpg-systems.test.ts`). Phase 5 proxy suggest ✅ (`vite.config.ts` phân nhánh
> `mode:'suggest'`, validate choiceId, `parseSuggestContent` + unit test). Phase 6 juice ✅
> (chip delta HP/Qi jade/vermilion, con dấu "Ngày X", chronicle scroll-into-view,
> `prefers-reduced-motion`, `test/juice.ui.test.tsx` 4/4, acceptance-visual 12/12). Phase 7
> self-playtest ✅ (`test/playtest-sim.test.ts` 5/5: 3 route deterministic đến terminal
> ending, không soft-lock, không night_forgotten; **không đổi constants** — slack 16 ngày,
> theo doctrine Part D #5). Verification hợp nhất cuối: `npx vitest run` **216/216** (39
> files); `npm run typecheck` exit 0; `npm run lint` exit 0; `npm run build` exit 0;
> `npx playwright test e2e --workers=1` **32/32**. Còn mở: playtest với người thật (5
> phiên unguided 30 phút) — sim chứng minh feasibility, không chứng minh pressure; Hồi V
> `mirror_choice` cần quan sát re-tint; truth route `qiLow=0` không dư địa chi tiêu qi
> trước Hồi IV. Phase 8 (Scenario II) — chưa bắt đầu.
>
> **Cập nhật 2026-08-31 (đợt 3 — mở khóa cổng):** GATE-01 build ✅ re-verified
> (`npm run build` exit 0, ✓ built in 1.73s). GATE-04 save-safety ✅ —
> `e2e/save-reload.spec.ts` 5/5: reload trong exploration, route encounter,
> combat, Journal, và ngay trước ending đều giữ nguyên state hợp lệ schema.
> Tổng E2E sau bổ sung: **37/37** (32 cũ + 5 save-reload). Giải phóng toàn bộ
> rủi ro "cổng chưa chạy" của §10.1 MASTER_ACCEPTANCE.

> Nguyên tắc: mỗi hạng mục viết theo đúng format handoff trong
> `docs/MASTER_ACCEPTANCE.md` §9 (acceptance IDs, owner files, player path,
> state/visible/downstream/automated proof). Mọi thay đổi rule phải sửa
> `docs/GDD.md` **trước** khi code (GDD §10).

### Phase 0 — Chốt nợ P0 hiện có (ước tính: 2–3 ngày)
Trước khi thêm mechanic mới, đóng hàng đợi remediation đang mở ở
`docs/MASTER_ACCEPTANCE.md` §10 để cửa sổ test sạch.

- **P0-A (GATE-02, UX-01):** sửa boot helper E2E để mọi browser path khởi động
  từ clean context. Close khi: `npx playwright test` pass từ clean profile.
- **P0-B (GATE-03, STORY-06, A-06):** thêm browser path fresh-run tới **mọi**
  ending + death. Close khi: A-06 có evidence cho từng ending.

### Phase 1 — Combat có agency (P1, cao nhất; ước tính: 4–6 ngày)
**Vấn đề:** `damageRoll` = thuế HP cố định; trận nào cũng giống trận nào.
**Mục tiêu:** mỗi encounter có ≥1 quyết định trước/khi trong trận đổi được kết cục.

Thiết kế đề xuất — "Encounter Decision Layer" (tối giản, không turn-based):
1. Khi vào node nguy hiểm, hiển thị **encounter panel**: tên địch, danger,
   telegraph đã có sẵn từ `dangerWarning`.
2. Người chơi chọn **1 trong 4** hành động: `đánh thường` (rẻ qi), `dùng kỹ
   thuật` (tốn qi, giảm damage nhận + tăng damage gây theo level kỹ thuật),
   `dùng vật phẩm` (pill/talisman — sửa balance trước trận), `rút lui` (mất ít
   HP + mất progress node).
3. Kết cục vẫn deterministic: outcome = f(techniques, talents, equipment, qi
   còn lại, danger, rng đã seed). Không đổi vòng RNG, không đổi determinism.
4. Win → material drop như hiện tại; thua → HP giảm sâu + có thể chết (giữ
   `Đường về dang dở`).

- Acceptance IDs: ROUTE-03, A-01, A-03, A-04, GATE-05.
- Owner files: `src/engine/danger.ts`, `src/engine/story.ts`, `src/engine/reducer.ts`,
  `src/content/story.ts`, `src/ui/GameScreen.tsx`, `test/danger.test.ts`,
  `e2e/game.spec.ts`.
- State proof: `state.encounter` (enemy, chosenAction, outcome) ghi vào flags.
- Visible proof: encounter panel + kết quả sau lượt chọn hiển thị trong scene text.
- Downstream proof: 1 kỹ thuật mở khóa ở Misty Sect đổi được kết cục Sealed Cave
  (chứng minh build quan trọng).
- GDD cần sửa: §5 (Systems) thêm Encounter Decision Layer; §3 minute-to-minute.

### Phase 2 — "Đêm thứ mười hai" thành dead-line thật (P1; ước tính: 2–3 ngày)
**Vấn đề:** `state.day` chỉ tăng khi `rest` → thời gian không phải tài nguyên.
**Mục tiêu:** tạo stakes + kích hoạt pillar 3 và anxiety channel của Flow.

Thiết kế:
1. Action cost: mọi hành động ngoài `rest` tăng 1 `state.day` (walking, gather,
   shop, story beat). `rest` +1 ngày nhưng hồi HP/qi — mọi hành động giờ có
   opportunity cost thật.
2. Deadline: khi tiến vào Hồi II, engine ghi `state.flags.night_deadline = day + N`
   (N điều chỉnh sao cho người chơi đi lệch 3–5 ngày vẫn cứu được nếu tối ưu —
   test để chốt số). Quá hạn → beat "làng quên một người" xảy ra *một cách có
   ý nghĩa truyện* (mở một nhánh NPC bị xóa), **không** phải game over.
3. Objective line hiển thị đếm ngày còn lại khi deadline đang chạy.

- Acceptance IDs: UX-05 (mới), A-01, A-03, A-04.
- Owner files: `src/engine/reducer.ts`, `src/engine/constants.ts`,
  `src/content/story.ts`, `src/ui/objective.ts`, test mới `test/day-cost.test.ts`.
- Downstream proof: 1 nhánh truyện chỉ đạt được khi *trễ* deadline (đổi thất bại
  thành nội dung — không phạt người chơi bằng sự nhàm chán).
- Rủi ro & giảm thiểu: không để dead-line giết run (vi phạm GDD "no soft-lock");
  luôn có fallback beat.

### Phase 3 — Technique/talent có trade-off thật (P2; ước tính: 3–4 ngày)
**Vấn đề:** `trainProgressGain` là cộng tuyến tính; manual là nhị phân → một
đường tối ưu duy nhất.
**Mục tiêu:** mỗi kỹ thuật/tài năng có hiệu ứng hai mặt, tạo build differentiation.

Thiết kế:
- Mỗi technique trong `src/content/rpg.ts` thêm 2 trường: `benefit` và `cost`
  (ví dụ: kiếm pháp +damage nhưng +qi drain khi gather trong rừng; tâm pháp
  +train nhưng −gold kiếm được).
- Giữ `trainingBonus` nhưng bù bằng cost; tối ưu hóa không còn hiển nhiên.
- Ít nhất 1 build-gate hội thoại: NPC phản ứng khác theo technique equipped

### Phase 4 — Nâng cấp hệ quả lựa chọn truyện (P1; ước tính: 3–5 ngày)
**Vấn đề:** flags chỉ "re-tint narration" → spectacle agency.
**Mục tiêu:** mỗi hồi có ≥1 lựa chọn **mở/khóa một node hoặc NPC thật** trong
15 phút tiếp theo.

Thiết kế:
- Hồi I → "giấu trâm" mở khóa đường manh mối riêng; "trả trâm" mở khóa quest
  line cụ Mai Hoa; "bán trâm" mở khóa cơ chế trade với Bảo.
- Hồi II + deadline (Phase 2) → người bị quên **dựa vào lựa chọn Hồi I**.
- Dùng proof-record đã có (ROUTE-04/05) làm khuôn: mỗi route mở 1 node mới.

- Acceptance IDs: STORY-07 (mới), A-01, A-02, A-05, A-06.
- Owner files: `src/engine/story.ts`, `src/content/beats-data.ts`,
  `src/content/locations.ts`, `test/endings.test.ts`.

### Phase 5 — Free-text: AI đề xuất, reducer xác thực (P2; ước tính: 4–6 ngày)
**Vấn đề:** free-text hứa hẹn nhiều nhất nhưng verb set nhỏ → illusion of choice.
**Giới hạn bất di bất dịch:** AI không bao giờ đổi state (SAFE-02 vẫn nguyên).
**Mục tiêu:** tăng *cảm giác* được lắng nghe mà không tăng phạm vi state.

Thiết kế:
1. Người chơi gõ tự do → client gọi `/api/narrate` như hiện tại, bổ sung mode
   "suggest": AI nhận (scene beat, 3 lựa chọn hiện có, câu người chơi) và trả về
   **một trong 3 lựa chọn + 1 câu phản hồi in-character**.
2. Engine chỉ nhận `choiceIndex` do AI trả về; không nhận text mới, không nhận
   state. Nếu AI trả gì khác → bỏ qua, fallback 3 lựa chọn hiện có.
3. Khi AI không khả dụng → giữ hành vi hiện tại (parser + forced convergence).
4. Nguyên tắc giữ nguyên: AI là lớp trang trí; reducer là luật.

- Acceptance IDs: SAFE-02 (bảo toàn), AI-02 (mới), A-04, A-07.
- Owner files: `src/ai/narration.ts`, server proxy, `src/ui/GameScreen.tsx`,
  `test/ai-narration.test.ts`.

### Phase 6 — Game feel ("juice") cho text game (P2; ước tính: 2–3 ngày)
Game feel không cần animation 3D; cần feedback tức thời cho mọi action:
- micro-animation khi nhận/giảm HP, Qi (số nhảy, vệt màu);
- stamp "Ngày X" khi day tăng (nhấn mạnh Phase 2);
- scroll-into-view cho event mới trong chronicle; focus ring đã có.

- Acceptance IDs: A-08 (visual matrix), UX-03/UX-04.

### Phase 7 — Playtest & balance (P1; liên tục, bắt đầu sau Phase 2)
1. **Self-playtest:** 3 run đủ 3 nhánh chính; ghi lại moment đầu tiên cảm thấy
   "chọn không đổi gì" — đó là mục tiêu Phase 4.
2. **5 người ngoài chơi 30 phút không hướng dẫn** (quan sát, không nói gì):
   đo (a) có hiểu loop không, (b) có gõ free text không, (c) chết ở đâu,
   (d) có notice dead-line không.
3. Chỉnh `N` của deadline + danger curves theo kết quả; cập nhật test.
4. Đo replay: 1 người chơi cũ chơi run 2 với build khác — có thấy khác không?

### Phase 8 — Scenario II / expansion (sau khi P0–P2 của Scenario I đóng)
Chỉ bắt đầu khi mọi P0/P1 trong `docs/MASTER_ACCEPTANCE.md` đã đóng và một
playtest round đã chạy. Scenario II là data pack (GDD §7), không đụng reducer.

---

## PHẦN C — THỨ TỰ THỰC HIỆN & ƯỚC LƯỢNG

| Thứ tự | Phase | Ước tính | Tác động cảm giác chơi |
|---|---|---|---|
| 1 | Phase 0 — nợ P0 | 2–3 ngày | none (bảo đảm chất lượng) |
| 2 | Phase 1 — Combat agency | 4–6 ngày | ⭐⭐⭐ cao nhất |
| 3 | Phase 2 — Dead-line | 2–3 ngày | ⭐⭐⭐ stakes thật |
| 4 | Phase 4 — Hệ quả lựa chọn | 3–5 ngày | ⭐⭐ pillar 2 thành sự thật |
| 5 | Phase 3 — Trade-off build | 3–4 ngày | ⭐⭐ replay |
| 6 | Phase 7 — Playtest (song song từ Phase 2) | liên tục | định hướng chỉnh sửa |
| 7 | Phase 6 — Juice | 2–3 ngày | ⭐ polish |
| 8 | Phase 5 — AI suggest | 4–6 ngày | ⭐ khác biệt cạnh tranh |

Tổng ước tính: **3–5 tuần** làm việc tập trung cho Scenario I đạt ngưỡng 8.5/10.

## PHẦN D — RỦI RO CHÍNH

1. **Phá determinism khi thêm combat decisions** — luôn chạy
   `test/determinism.test.ts` sau mỗi thay đổi reducer.
2. **Phá save cũ** — mọi thay đổi state schema phải qua migration
   (GDD §7, SAFE-04).
3. **Dead-line làm người chơi stress sai cách** — never game over; thất bại
   phải mở nội dung, không phải màn hình chết.
4. **Scope creep qua AI suggest** — AI chỉ chọn index; nếu requirement phình ra
   "AI viết lựa chọn mới" thì dừng và đưa lên GDD trước.
5. **Chỉnh số liệu mà không có playtest** — cấm chỉnh `N` deadline/danger bằng
   cảm tính; luôn 1 self-run + 1 recorded test.

  (micro-reactivity dạng build — đúng doctrine Disco Elysium đã trích trong GDD).

- Acceptance IDs: RPG-01 (mới), A-01, A-05.
- Owner files: `src/content/rpg.ts`, `src/engine/stats.ts`, `src/engine/reducer.ts`,
  `src/ui/CodexPanel.tsx`, `test/rpg-systems.test.ts`.

