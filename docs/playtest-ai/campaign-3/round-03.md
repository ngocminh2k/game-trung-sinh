# VÒNG 3 — C3-03 · Làm rõ cơ chế Thần Ma Điểm Hóa & Hệ thống buff thụ động runtime

> Campaign 3 — hiện thực hóa code. Vòng này: vé C2-03 → C3-03.
> **Trạng thái:** ✅ HOÀN THÀNH — vé C2-03 `fixed-verified`

---

## Pha 1 — CHƠI (Playtest & Persona Probing)

| Persona / Kịch bản | Hành vi kiểm thử | Kết quả quan sát |
|---|---|---|
| **Persona Min-Maxer (p15 replicate)** | Chọn các hệ thống khác nhau khi bắt đầu game (`sys_void`, `sys_battle`, `sys_scholar`, `sys_merchant`...) và so sánh hiệu quả thực chiến. | Trước sửa: `sys_void` chỉ mang tính chất tên gọi bí ẩn "Hệ Thống Hư Vô" chung chung, không rõ cơ chế bảo hộ hay tính năng gameplay; các hệ thống khác chỉ có lời thoại `personality` mà không có mô tả cơ chế (mechanism) cụ thể.<br>Sau sửa: Mọi hệ thống đều hiển thị rõ ràng `mechanismVi` / `mechanismEn`; `sys_void` mang danh xưng rõ rệt **Thần Ma Điểm Hóa** (Demon God Initiation), kích hoạt khiên giảm 50% sát thương khi máu < 30% và tăng +20% thu hoạch Linh Thạch. |
| **Persona Lore & Combatant** | Chiến đấu với quái vật khi kích hoạt `sys_battle` hoặc `sys_void`. | `sys_battle` cung cấp +15% sát thương tấn công (`calculateSystemCombatDamageBonus = 15`); `sys_void` kích hoạt cờ trạng thái `demonGodShield = true` bảo hộ lúc nguy cấp. |
| **Persona Trader / Explorer** | Du hành vượt hiểm địa (`sys_explorer`) hoặc buôn bán tại phường thị (`sys_merchant`). | `sys_explorer` cung cấp 20% giảm trừ sát thương môi trường; `sys_merchant` áp dụng chiết khấu thương mại 10%. |

---

## Pha 2 — HỎI & ĐÁP (Đối chiếu tài liệu & code paths)

- **Tài liệu đối chiếu:**
  - `docs/playtest-ai/rounds/LEDGER.md` (Vé `C2-03`): "Làm rõ cơ chế `Thần Ma Điểm Hóa` trong `system-defs.ts` | Mỗi hệ thống có hiệu ứng runtime cụ thể + mô tả rõ".
  - `docs/plans/system-layer/S01-reference-data.md`: Danh mục 10 hệ thống chuẩn mực và ngân sách phần thưởng.
  - `src/content/system-defs.ts`: Nguồn định nghĩa tĩnh của 10 System protocols.
  - `src/engine/system-runtime.ts`: Runtime layer xử lý trạng thái và tính toán buff của hệ thống.
- **Code paths traced:**
  - `src/content/system-defs.ts:17-38`: `interface SystemDef` cần các trường song ngữ `aliasVi`, `aliasEn`, `mechanismVi`, `mechanismEn`.
  - `src/engine/system-runtime.ts:9-16`: `activeSystem()` và `canChooseSystem()`.
  - `src/engine/index.ts:86`: Cần xuất bản các runtime modifier helpers để UI và reducer dùng chung thống nhất.

---

## Pha 3 — CHỐT SPEC (Adjudicator)

- **Chẩn đoán:** `sys_void` và toàn bộ 10 hệ thống trước đây thiếu mô tả cơ chế định lượng (`mechanismVi`, `mechanismEn`) dẫn tới việc người chơi cảm thấy các hệ thống chỉ là "skin hội thoại" mà không có bản sắc cơ chế cụ thể.
- **Phạm vi code:**
  1. `src/content/system-defs.ts`:
     - Bổ sung `aliasVi?: string`, `aliasEn?: string`, `mechanismVi: string`, `mechanismEn: string` vào `SystemDef`.
     - Cập nhật đủ 10 definitions, đặc biệt định danh `sys_void` là **Thần Ma Điểm Hóa** (Demon God Initiation) với cơ chế khiên hộ thể HP < 30% và tăng thu hoạch linh thạch.
  2. `src/engine/system-runtime.ts`:
     - Định nghĩa `SystemPassiveBonus` và `EMPTY_SYSTEM_PASSIVE_BONUS`.
     - Cung cấp `systemPassiveBonus(systemId)` trả về chỉ số định lượng cụ thể cho cả 10 hệ thống.
     - Cung cấp `systemMechanismText(systemId, locale)`.
     - Cung cấp các hàm runtime helpers: `calculateSystemCombatDamageBonus`, `calculateSystemDangerDamageReduction`, `calculateSystemRestHealBonus`, `calculateSystemShopDiscount`, `calculateSystemCultivationBonus`, `isVoidDemonGodActive`.
  3. `src/engine/index.ts`: Re-export đầy đủ các hàm và kiểu mới.
- **Hành vi trước:** Không có `mechanismVi/En`, không có `aliasVi/En`, không có hàm tính buff thụ động cho từng hệ thống.
- **Hành vi sau:** Toàn bộ 10 hệ thống có cơ chế định lượng song ngữ chuẩn mực; `sys_void` có cơ chế Thần Ma hộ thân đặc trưng; hệ thống runtime tính toán đầy đủ buff cho combat, kinh tế, tu luyện, hồi phục và khám phá.
- **Tiêu chí nghiệm thu:** `test/system-perks.test.ts` (5 tests) xanh hoàn toàn, toàn bộ test suite hệ thống và typecheck `tsc --noEmit` đạt 0 lỗi.

---

## Pha 4 — CODE & KIỂM CHỨNG (TDD)

- **Tệp sửa đổi:**
  - `src/content/system-defs.ts`: Thêm trường cơ chế song ngữ cho 10 hệ thống và định danh `Thần Ma Điểm Hóa` cho `sys_void`.
  - `src/engine/system-runtime.ts`: Hiện thực `SystemPassiveBonus`, `systemPassiveBonus`, `systemMechanismText` và 6 runtime helpers.
  - `src/engine/index.ts`: Re-export các hàm và interface.
- **Bộ test mới:** `test/system-perks.test.ts` (5 tests):
  1. 10 hệ thống đều có `mechanismVi` và `mechanismEn` rõ ràng dài >15 ký tự.
  2. `sys_void` định danh rõ là `Thần Ma Điểm Hóa`, có cơ chế giảm sát thương khi máu thấp hoặc linh thạch.
  3. `systemPassiveBonus` trả về chỉ số định lượng đặc thù cho cả 10 hệ thống.
  4. `systemMechanismText` định dạng bản địa hóa chuẩn xác ('vi' / 'en') và an toàn với null/id lạ.
  5. Các runtime helpers tính toán chính xác theo `state.systemId`.
- **Kết quả kiểm chứng:**
  ```
  $ npx vitest run test/system-perks.test.ts
  → Test Files 1 passed (1) · Tests 5 passed (5)
  $ npx vitest run test/system-quests.test.ts test/system-schema.test.ts test/system-notifications.test.ts
  → Test Files 3 passed (3) · Tests 20 passed (20)
  $ npx tsc --noEmit
  → EXIT: 0 (sạch lỗi kiểu)
  ```

---

## Kết luận vòng
- Vé C2-03 → **`fixed-verified`** (Cơ chế Thần Ma Điểm Hóa và buff thụ động của 10 Hệ Thống đã được hiện thực hóa và kiểm chứng trọn vẹn).
- Cập nhật `LEDGER.md` và tiến sang Vòng 4.
