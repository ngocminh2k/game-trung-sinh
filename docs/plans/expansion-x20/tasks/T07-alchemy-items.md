# T07 — alchemy-items (12 linh thảo + 12 đan lai + item nền kinh tế)

- **Wave**: W1. **Phụ thuộc**: contracts/item-ids.md.
- **FILE ĐƯỢC SỬA (độc quyền)**: `src/content/items.ts`, `src/content/refinement.ts`, tạo mới `src/content/alchemy.ts`, `test/alchemy.test.ts`.
- **CẤM sửa**: schema, shop.ts (T12 nối giá theo weather/LS).

## Việc cần làm

1. **items.ts** — thêm đúng 43 item theo `contracts/item-ids.md`:
   - 12 `herb_*`: `usable: false`, `buyPrice` 20–80, `sellPrice` = buyPrice/2 (làm tròn xuống),
     `aliases` ≥ 2, descVi/En 1 câu về mùa xuất hiện.
   - 12 `pill_hybrid_*`: `usable: true`, `effects: { hp: ... | qi: ... }` giá trị 20–60.
   - 3 tiền: `silver_coin`, `spirit_stone`, `gold_note` (item trưng bày; `buyPrice: null`).
   - 12 `bait_*`: `usable: false`, `buyPrice` 15–40.
   - 4 `pill_ls_*`: `buyPrice: null`, `sellPrice` cao (≥ 200 vàng quy đổi — mô tả trong desc
     "chỉ đổi bằng Linh Thạch").
   KHÔNG xóa/đổi 42 item cũ.
2. **refinement.ts** — thêm 12 `RefinementRecipeDef` cho đan lai:
   `id: 'r_hybrid_<tên>'`, `locationId: 'thousand_herbs_valley'`,
   `ingredients: { herb_X: 2, herb_Y: 1 }` (chỉ herb id có thật), `output: { itemId: 'pill_hybrid_*', qty: 1 }`.
   12 công thức phải phủ đúng 12 pill_hybrid theo bảng ở item-ids.md (cặp nguyên liệu tự chọn hợp lý).
3. **alchemy.ts** (mới) — data lai ghép ở tầng narrative:
   ```ts
   export const HYBRID_RECIPES: { recipeId: string; nameVi: string; nameEn: string; loreVi: string; loreEn: string; seasonVi: string; seasonEn: string }[]
   // 12 entry, recipeId khớp refinement.ts; seasonVi = mùa linh thảo chính ('xuan'|'ha'|'thu'|'dong')
   export function hybridForSeason(season: 'xuan'|'ha'|'thu'|'dong'): string[] // recipeId có mùa đó
   ```
4. `test/alchemy.test.ts`: 12 recipe ingredientes/output id hợp lệ (so với mảng id khai báo trong test);
   `HYBRID_RECIPES.length === 12`; mỗi season có ≥ 2 recipe.

## Tiêu chí nghiệm thu

`npx vitest run test/alchemy.test.ts` xanh; `npm run typecheck` xanh;
đếm items.ts tăng đúng 43 dòng `id: '`. Validate sẵn có sẽ tự chặn ingredient/output sai id
(chạy `npx vitest run test/content.test.ts` để chắc).

## Cấm

- Sửa item cũ, đụng SHOP_STOCK logic, sửa gate trong content/index.ts.
