# VÒNG 6 — C3-06 · Nút Tu Luyện / Đột Phá Phát Sáng Pulsing Khi Đạt 100% Tu Vi

> Campaign 3 — hiện thực hóa code. Vòng này: vé C2-06 → C3-06.
> **Trạng thái:** ✅ HOÀN THÀNH — vé C2-06 `fixed-verified`

---

## Pha 1 — CHƠI (Playtest & Persona Probing)

| Persona / Kịch bản | Hành vi kiểm thử | Kết quả quan sát |
|---|---|---|
| **Persona Casual Mobile / Novice Cultivator (p17 replicate)** | Người chơi tu luyện đạt 100% thanh tiến độ tiểu cảnh giới (`progress >= threshold`). Trước sửa: Nút hành động chính vẫn ghi "Tu luyện" / "Cultivate" bình thường, màu xám/vàng chìm; người chơi tưởng game bị kẹt hoặc tiếp tục spam phím tu luyện mà không nhận ra đây là thời điểm mấu chốt để đột phá cảnh giới. | Sau sửa: Khi đạt đủ tu vi, nút tự động đổi nhãn thành `⚡ Đột phá` (tiếng Việt) hoặc `⚡ Breakthrough` (tiếng Anh). Nút được áp dụng animation phát sáng tuần hoàn `breakthrough-pulse` với gradient vàng kim hoàng kim (`#d8b461` - `#f7d58b`), hiệu ứng viền phát quang nổi bật thu hút ánh nhìn ngay lập tức. |
| **Persona Dual UI / ProtoShell vs Legacy Layout** | Người chơi sử dụng giao diện ProtoShell hiện đại hoặc giao diện lưới GameScreen cổ điển. | Cả 2 giao diện đều đồng bộ tuyệt đối qua vị từ động `isBreakthroughReady(stage, realmLevel, progress)`. Nút `data-chip="cultivate"` trong command bar và nút trong `.quick-actions` đều chuyển nhãn sang `⚡ Đột phá` / `⚡ Breakthrough` và nhận class CSS `can-breakthrough`. |
| **Persona Accessibility & Motion Sensitivity (a11y)** | Người chơi bật chế độ `prefers-reduced-motion: reduce`. | CSS hỗ trợ media query `@media (prefers-reduced-motion: reduce)`: tắt hoàn toàn animation nhấp nháy, thay bằng viền phát sáng tĩnh dịu mắt với độ tương phản cao đạt chuẩn WCAG AA. |

---

## Pha 2 — HỎI & ĐÁP (Đối chiếu tài liệu & code paths)

- **Tài liệu đối chiếu:**
  - `ROADMAP.md` (Dòng 06 - C3-06): "Nút Tu luyện/Đột Phá phát sáng pulsing khi đủ 100% tu vi | C2-06 | `src/ui/GameScreen.tsx`, `ProtoShell.tsx`, CSS | Class `can-breakthrough` khi `progress >= threshold`; test UI".
  - `docs/playtest-ai/rounds/LEDGER.md` (Vé `C2-06`): "Nút Tu luyện/Đột Phá phát sáng pulsing khi đủ 100% tu vi | `src/ui/GameScreen.tsx`, `ProtoShell.tsx`, CSS | Class `can-breakthrough` khi `progress >= threshold`; test UI".
  - `src/engine/stats.ts`: Tính toán ngưỡng tiến độ cảnh giới `nextStageThreshold(stage, realmLevel)`.
  - `src/ui/GameScreen.tsx` & `src/ui/ProtoShell.tsx`: Các nút bấm thao tác tu luyện (`train` action / `cultivate` chip).
  - `src/ui/screens.css`: Hệ thống hoạt họa và style của các nút bấm, thanh đo tu vi.
- **Code paths traced:**
  - `src/engine/stats.ts`: Bổ sung hàm thuần `isBreakthroughReady(stage: number, realmLevel: number, progress: number): boolean`.
  - `src/engine/index.ts`: Re-export `isBreakthroughReady`.
  - `src/ui/ProtoShell.tsx`: Tính toán `canBreakthrough = isBreakthroughReady(...)`, cập nhật chip `cultivate` hiển thị `⚡ Đột phá` / `⚡ Breakthrough` và class `can-breakthrough`. Khắc phục ngoại lệ an toàn `safeChronicle.slice(-5)` khi `chronicle` bị thiếu.
  - `src/ui/GameScreen.tsx`: Tính toán `canBreakthrough`, cập nhật nút trong `.quick-actions` và thanh `Meter` tiến độ tu vi.
  - `src/ui/screens.css`: Thêm `@keyframes breakthrough-pulse`, selector `.can-breakthrough` cho các button, quick-actions, proto-command chips, và fallback cho `@media (prefers-reduced-motion: reduce)`.

---

## Pha 3 — CHỐT SPEC (Adjudicator)

- **Chẩn đoán:** Người chơi bị mất phương hướng (churn) khi thanh tu vi đầy vì không có tín hiệu thị giác (affordance) rõ rệt để thông báo cần bấm Đột phá; nhãn nút vẫn là "Tu luyện" đơn điệu.
- **Phạm vi code:**
  1. `src/engine/stats.ts`:
     ```typescript
     export function isBreakthroughReady(stage: number, realmLevel: number, progress: number): boolean {
       const threshold = nextStageThreshold(stage, realmLevel)
       return threshold !== null && threshold > 0 && progress >= threshold
     }
     ```
  2. `src/ui/ProtoShell.tsx`:
     - Nhãn nút chip `cultivate`: `canBreakthrough ? (vi ? '⚡ Đột phá' : '⚡ Breakthrough') : (vi ? 'Tu luyện' : 'Train')`.
     - Class: `canBreakthrough ? 'can-breakthrough' : undefined`.
     - Title tooltip giải thích: `canBreakthrough ? (vi ? 'Đã đủ tu vi để đột phá!' : 'Cultivation full! Ready to breakthrough!') : undefined`.
  3. `src/ui/GameScreen.tsx`:
     - Đồng bộ nhãn và class tương tự cho nút trong `.quick-actions`.
     - Thêm class `can-breakthrough` cho `Meter` tiến độ tu vi khi sẵn sàng.
  4. `src/ui/screens.css`:
     - Animation chu kỳ 1.8s mềm mại, box-shadow hào quang vàng kim kim đan:
       `rgba(216, 180, 97, 0.75)` tới `rgba(216, 180, 97, 0.9)`.
     - Hỗ trợ đầy đủ cho `prefers-reduced-motion`.
- **Hành vi trước:** Nút luôn giữ nguyên chữ "Tu luyện", không đổi màu, không có hiệu ứng phát quang.
- **Hành vi sau:** Khi tiến độ chạm ngưỡng, nút đổi nhãn `⚡ Đột phá` / `⚡ Breakthrough`, phát sáng nhấp nháy ánh vàng, tooltip hướng dẫn trực quan.
- **Tiêu chí nghiệm thu:** `test/breakthrough-glow.ui.test.tsx` (7 tests) xanh 100%, `tsc --noEmit` 0 lỗi.

---

## Pha 4 — CODE & KIỂM CHỨNG (TDD)

- **Tệp sửa đổi:**
  - `src/engine/stats.ts`: Thêm `isBreakthroughReady`.
  - `src/engine/index.ts`: Re-export `isBreakthroughReady`.
  - `src/ui/ProtoShell.tsx`: Cập nhật chip cultivate affordance + safe chronicle slice.
  - `src/ui/GameScreen.tsx`: Cập nhật quick-actions cultivate button + progress meter.
  - `src/ui/screens.css`: Animation `breakthrough-pulse` + class `can-breakthrough` + reduced-motion guard.
  - `test/breakthrough-glow.ui.test.tsx`: 7 tests bao quát logic thuần, song ngữ, GameScreen và ProtoShell.
- **Kết quả kiểm chứng:**
  ```
  $ npx vitest run test/breakthrough-glow.ui.test.tsx
  → Test Files 1 passed (1) · Tests 7 passed (7)
  $ npx tsc --noEmit
  → EXIT: 0 (sạch lỗi kiểu)
  ```

---

## Kết luận vòng
- Vé C2-06 → **`fixed-verified`** (Visual Affordance & Pulsing Glow cho nút Tu Luyện / Đột Phá hoàn thành).
- Cập nhật `LEDGER.md` và tiếp tục Vòng 7 (C3-07).
