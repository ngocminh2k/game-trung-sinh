# T08 — techniques-skilltree (18 chiêu + skill tree 5 nhánh)

- **Wave**: W1. **Phụ thuộc**: contracts/item-ids.md (manual item ẩn).
- **FILE ĐƯỢC SỬA (độc quyền)**: `src/content/rpg.ts` (chỉ mảng `TECHNIQUES` — KHÔNG đụng
  ENEMIES/EQUIPMENT/TALENTS), `src/content/skill-tree.ts`, tạo mới `test/techniques-expanded.test.ts`.
- **CẤM sửa**: schema, reducer, engine khác.

## Hiện trạng đã xác minh

- `TECHNIQUES: TechniqueDef[]` trong `src/content/rpg.ts` — ~9 chiêu hiện có (GIỮ NGUYÊN các bản ghi cũ,
  kể cả field `gatherQiDrain`/`sellPenalty`).
- `SkillNode` trong `src/content/skill-tree.ts` — branch type đã có sẵn:
  `'sword' | 'aura' | 'herbal' | 'shadow' | 'thunder'`.

## Việc cần làm

1. **9 chiêu ẨN mới** trong `TECHNIQUES` (tổng 18). Id scheme: `<ten>_hidden`
   (ví dụ `thunder_gasp_hidden`). Mỗi chiêu ẩn:
   - `requiredStage` cao hơn chiêu cùng nhánh (xem bản ghi cũ để đặt bậc thang hợp lý).
   - `sourceItemId` trỏ manual item `<ten>_hidden_manual` (T07 tạo item này — ghi chú trong handoff
     nếu chưa thấy item; test của bạn mock theo contract, không đợi item).
   - `benefitVi/En` + `costVi/En` BẮT BUỘC (pattern hai mặt của Phase 3).
   Phân bổ 9 ẩn theo 5 nhánh: sword 2, aura 2, herbal 2, shadow 2, thunder 1.
2. **skill-tree.ts** — bổ sung node cho các chiêu mới: mỗi nhánh đạt 3–4 node, node mới
   `require.techniques` trỏ chiêu ẩn tương ứng, `cost.skillPoints` 2–4, `tier` tăng dần.
   Thêm 1 node đặc biệt `phi_phong_tram` (branch `'sword'`): `require.techniques` = đủ 9 chiêu chính,
   `effect: { kind: 'aoe', value: 9 }`, `conflictsWith` rỗng. KHÔNG tạo chiêu TechniqueDef riêng
   cho node này (node là unlock, chiêu 19 không tồn tại).
3. `test/techniques-expanded.test.ts`:
   - `TECHNIQUES.length === 18` (9 cũ + 9 mới, đếm id đuôi `_hidden` = 9).
   - Mọi chiêu ẩn có đủ benefit/cost Vi/En.
   - skill-tree: mỗi branch có 3–4 node; `phi_phong_tram` tồn tại 1 lần.

## Tiêu chí nghiệm thu

`npx vitest run test/techniques-expanded.test.ts` xanh; `npx vitest run test/content.test.ts` xanh
(không phá validate techniques/item hiện có); `npm run typecheck` xanh.

## Cấm

- Sửa ENEMIES/EQUIPMENT/TALENTS. Đổi field chiêu cũ. Tạo chiêu thứ 19.
