# T01 — village-map-fix (Sửa node map Mai Hoa)

- **Wave**: W1 (song song). **Phụ thuộc**: W0 (baseline xanh).
- **FILE ĐƯỢC SỬA (độc quyền)**: `src/content/locations.ts`
- **CẤM sửa**: mọi file khác. Việc "Mai Hoa di chuyển theo giờ" là logic engine → T12 lo, KHÔNG làm ở đây.

## Hiện trạng đã xác minh

`REGION_MAPS` (trong locations.ts) có bản đồ 7×7 cho từng region. Region `village` có node
NPC chứa cụ Mai Hoa (tìm chuỗi `village-elder` trong `cells[].node`). Cell `(3,3)` là node nhà
cũ của nhân vật — KHÔNG được đụng.

## Việc cần làm (từng bước)

1. Mở `src/content/locations.ts`, tìm trong `REGION_MAPS` region có `locationId: 'village'`.
2. Đổi node id `village-elder` thành `village-elder-porch`, đặt tại cell **(2,2)**, giữ kind `'npc'`,
   đổi `nameVi: 'Hiên nhà Cụ Mai Hoa'` / `nameEn: "Elder Meihua's Porch"`.
3. Thêm node mới `village-elder-home` tại cell **(2,3)**, kind `'npc'`,
   `nameVi: 'Cửa nhà Cụ Mai Hoa'` / `nameEn: "Elder Meihua's Door"`. Cell (2,3) phải là terrain
   đi được (`plain`/`road`) — nếu đang là terrain khác thì đổi terrain, KHÔNG đụng cell khác.
4. Kiểm tra node `village-elder-porch` không còn trùng vị trí nào khác; mỗi cell chỉ 1 node
   (validation chặn duplicate cell: `positions.size !== cells.length`).

## Tiêu chí nghiệm thu + lệnh kiểm chứng

1. `Select-String -Path src\content\locations.ts -Pattern "village-elder"` trả về đúng 2 node id
   (`village-elder-porch`, `village-elder-home`).
2. `npx vitest run test/regional-map.test.ts` — xanh.
3. `npm run typecheck` — xanh.
4. Cell (3,3) không đổi: grep đoạn cell x:3,y:3 trong village map, nội dung như trước khi bắt đầu.

## Cấm

- Thêm/xóa region, đổi `MAP_WIDTH/HEIGHT`, đổi `CELLS` toàn cục, đổi exitTo của cell khác.
