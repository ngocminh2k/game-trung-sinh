# VÒNG 2 — C3-02 · Bịt farm điểm luân hồi: Thưởng theo cột mốc thành tựu, không theo "sống tới ngày 5"

> Campaign 3 — hiện thực hóa code. Vòng này: vé C2-02 → C3-02.
> **Trạng thái:** ✅ HOÀN THÀNH — vé C2-02 `fixed-verified`

---

## Pha 1 — CHƠI (Playtest & Exploit Probing)

| Persona / Kịch bản | Hành vi kiểm thử | Kết quả quan sát |
|---|---|---|
| **Persona Exploit Hunter (p15 replicate)** | Khởi tạo game mới, liên tục chọn hành động nghỉ ngơi (`rest`) để skip ngày: Ngày 1 → 2 → 3 → 4 → 5. Chết tại ngày 5 không làm nhiệm vụ hay tu luyện. | Trước sửa: Nhận điểm luân hồi đột biến ở ngày 5 (gấp 3 lần ngày 4) chỉ nhờ số ngày sống sót.<br>Sau sửa: Không có cột mốc nào đạt được → **Nhận đúng 0 điểm luân hồi** (lỗ hổng farm idle bị triệt tiêu hoàn toàn). |
| **Persona Achiever / Quester** | Nhận và hoàn thành lần lượt 3 nhiệm vụ (`q_herb_delivery`, `q_herb_intro`, `q_bounty_boar`). | Đạt mốc ≥3 nhiệm vụ hoàn thành → **Nhận 30 điểm luân hồi**. (<3 nhiệm vụ nhận 0 điểm). |
| **Persona Cultivator** | Tu luyện, ngộ đạo, đột phá cảnh giới đến Luyện Khí tầng 3 (`stage: 1, realmLevel: 3`) hoặc Trúc Cơ (`stage: 2`). | Đạt mốc Luyện Khí tầng 3+ → **Nhận 30 điểm luân hồi**. (Phàm nhân hoặc Luyện Khí tầng 1-2 nhận 0 điểm). |
| **Persona Hero / Storyteller** | Vượt qua Đấu trường (`FLAG_ARENA_CLEARED`), phong ấn sơn động cổ (`visitedCaveWarded`), hoặc đạt kết cục câu chuyện không bi thảm (`peace_ending`, `sect_master`...). | Đạt mốc Đại sự kiện / Kết cục viên mãn → **Nhận 50 điểm luân hồi**. (Chết thảm vô danh không sự kiện nhận 0 điểm). |

---

## Pha 2 — HỎI & ĐÁP (Đối chiếu tài liệu & code paths)

- **Tài liệu đối chiếu:**
  - `docs/playtest-ai/rounds/LEDGER.md` (Vé `C2-02`): "Kẽ hở farm điểm luân hồi: chết ngày 5 được 30 điểm gấp 3 lần ngày 4... Đổi sang cột mốc thành tựu (3 nhiệm vụ / Luyện Khí t3)".
  - `docs/playtest-ai/campaign-2/round-08.md` & `round-17.md`: Thiết kế kinh tế luân hồi 30 điểm (3 nhiệm vụ), 30 điểm (Luyện Khí t3), 50 điểm (đại sự kiện/kết cục).
  - `src/content/death-legacy.ts:25-30`: `legacyPointsFor(cause)` giữ nguyên vai trò cấp điểm thuộc tính khởi đầu kiếp sau (`pendingAttributePoints = 1`).
- **Code paths traced:**
  - `src/engine/quests.ts:11-20`: `questStatus()` là nguồn chân lý cho trạng thái nhiệm vụ.
  - `src/engine/endings.ts:7-25`: `evaluateEndingId()` phân xử kết thúc run.
  - `src/engine/globalProfile.ts:9-94`: `GlobalProfile` và `recordTerminal()` quản lý dữ liệu meta-progression xuyên suốt giữa các kiếp.
  - `src/App.tsx:505-515`: Điểm giao giữa kết thúc kiếp sống hiện tại và ghi nhận hồ sơ toàn cục.

---

## Pha 3 — CHỐT SPEC (Adjudicator)

- **Chẩn đoán:** Cơ chế tính điểm luân hồi trước đây tính theo số ngày sinh tồn, dẫn tới việc người chơi spam nghỉ tại quán trọ để sống tới ngày 5 nhằm tích lũy tiền tệ meta-progression mà không trải nghiệm gameplay.
- **Phạm vi code:**
  1. `src/engine/quests.ts`: Bổ sung `countCompletedQuests(state: GameState): number` truy vấn độc lập và triệt để các nhiệm vụ hoàn thành từ cả `state.quests` lẫn canonical flags (`quest_<id>_done`).
  2. `src/engine/endings.ts`: Bổ sung `evaluateReincarnationKarma(state: GameState): KarmaMilestoneBreakdown` áp dụng bảng điểm cột mốc (30 / 30 / 50 / ngày=0).
  3. `src/engine/globalProfile.ts`:
     - Bổ sung trường `reincarnationPoints: number` (mặc định 0) vào `GlobalProfile` và `GlobalProfileSchema`.
     - Cập nhật `mergeGlobalProfile()` tích lũy điểm không âm.
     - Mở rộng `recordTerminal()` tiếp nhận `earnedKarma: number = 0`.
  4. `src/engine/index.ts`: Export các hàm và kiểu dữ liệu mới.
  5. `src/App.tsx`: Kết nối `evaluateReincarnationKarma(prev.game).total` vào `recordTerminal()`.
- **Hành vi trước:** Điểm dựa vào ngày sống sót, chết ngày 5 nhận 30 điểm dù không làm gì. `GlobalProfile` không lưu trữ điểm luân hồi tích lũy.
- **Hành vi sau:** Ngày sống sót cho 0 điểm. Điểm luân hồi chỉ cấp theo thành tựu thực tế (3 NV = 30đ, Luyện Khí t3 = 30đ, Đại sự kiện/Kết cục = 50đ). Hồ sơ cũ tải lên tương thích ngược an toàn với `reincarnationPoints = 0`.
- **Tiêu chí nghiệm thu:** Bộ test `test/reincarnation-karma.test.ts` (7 tests) RED→GREEN, typecheck `tsc --noEmit` sạch, full suite 129 test files xanh.

---

## Pha 4 — CODE & KIỂM CHỨNG (TDD)

- **Thay đổi cụ thể:**
  - `src/engine/quests.ts`: Hiện thực hàm `countCompletedQuests()`.
  - `src/engine/endings.ts`: Định nghĩa interface `KarmaMilestoneBreakdown` và hiện thực `evaluateReincarnationKarma()`.
  - `src/engine/globalProfile.ts`: Thêm `reincarnationPoints` vào schema, default profile, delta và updater.
  - `src/engine/index.ts`: Export `evaluateReincarnationKarma`, `KarmaMilestoneBreakdown`, `countCompletedQuests`.
  - `src/App.tsx`: Truyền điểm từ `evaluateReincarnationKarma` vào `recordTerminal`.
- **Bộ test mới:** `test/reincarnation-karma.test.ts` (7 tests):
  1. Bịt exploit ngày 5: nghỉ tới ngày 5 hoặc ngày 50 không có mốc nào thì 0 điểm.
  2. Mốc nhiệm vụ: đủ 3 nhiệm vụ mới được 30 điểm (<3 được 0 điểm).
  3. Mốc cảnh giới: Luyện Khí tầng 3 hoặc Trúc Cơ được 30 điểm (Phàm nhân, LK t1-2 được 0 điểm).
  4. Mốc đại sự kiện: Đấu trường / sơn động cổ / kết cục viên mãn được 50 điểm.
  5. Cộng dồn chính xác khi đạt mọi cột mốc (110 điểm).
  6. Tích lũy `reincarnationPoints` trong `recordTerminal`.
  7. Tương thích ngược parse profile cũ không có `reincarnationPoints`.
- **Kết quả kiểm chứng:**
  ```
  $ npx vitest run test/reincarnation-karma.test.ts
  → Test Files 1 passed (1) · Tests 7 passed (7)
  $ npx vitest run test/globalProfile.test.ts
  → Test Files 1 passed (1) · Tests 7 passed (7)
  $ npx tsc --noEmit
  → EXIT: 0 (sạch lỗi kiểu)
  $ npm test -- --run
  → Test Files 129 passed (129) · Tests 1028 passed (1028)
  ```

---

## Kết luận vòng
- Vé C2-02 → **`fixed-verified`** (Bịt hoàn toàn kẽ hở farm điểm ngày 5; chuyển đổi trọn vẹn sang hệ thống cột mốc thành tựu).
- Cập nhật `LEDGER.md` và tiếp tục Vòng 3.
