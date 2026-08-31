# T03 — npc-expansion (40 → 60 NPC)

- **Wave**: W1 (song song). **Phụ thuộc**: contracts (đọc thôi).
- **FILE ĐƯỢC SỬA (độc quyền)**: `src/content/npcs.ts`
- **CẤM sửa**: file khác bất kỳ (kể cả `content/index.ts` gate `min(30)` — T12 lo).

## Hiện trạng đã xác minh

- `NPCS` trong `src/content/npcs.ts` có **40** NPC, format `NpcDef` (xem CONVENTIONS.md §3).
- 40 id cũ + 20 id mới: danh sách ĐÓNG BĂNG trong `contracts/npc-registry.md`.

## Việc cần làm

1. Thêm **đúng 20 NPC mới** theo bảng trong `contracts/npc-registry.md` — id, region, vai trò y hệt.
2. Mỗi NPC mới có:
   - `greetVi`/`greetEn` 1 câu, đúng tông trầm lắng/ký ức của game (đọc 2–3 NPC cũ để bắt tông).
   - `aliases` ≥ 3, unique toàn dự án (cả với NPC cũ).
   - `lines` ≥ 4 dòng với bậc thang `when: { affMin: 1 }`, `3`, `6`, `9` — mỗi dòng 1–2 câu,
     có cặp vi/en. Gợi ý nội dung theo "Ghi chú thoại" trong registry.
3. KHÔNG sửa id/line của 40 NPC cũ. Được phép THÊM dòng `lines` mới nếu cần để phủ quest mới
   (chỉ thêm, không xóa).
4. Kiểm tra trùng alias bằng lệnh:
   `Select-String -Path src\content\npcs.ts -Pattern "aliases:" | Measure-Object | % Count`
   và rà mắt: không alias nào xuất hiện 2 lần.

## Tiêu chí nghiệm thu

1. Đếm: `Select-String -Path src\content\npcs.ts -Pattern "id: 'n_" | Measure-Object | % Count` → **60**.
2. `npx vitest run test/content-boundaries.test.ts` xanh (không phá validate hiện có).
3. `npm run typecheck && npm run lint` xanh.
4. Không có 1 NPC cũ nào bị đổi id/xóa.

## Cấm

- Tạo id/alias ngoài registry. Đổi `locationId` NPC cũ. Sửa gate `min(30)` ở content/index.ts.
