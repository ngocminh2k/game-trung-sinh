# T11 — shops-per-npc (Cửa hàng riêng từng NPC)

- **Wave**: W1. **Phụ thuộc**: contracts (npc-registry + item-ids). KHÔNG cần code của task khác.
- **FILE ĐƯỢC SỬA (độc quyền)**: tạo mới `src/content/shops.ts`, `src/engine/shopStock.ts`, `test/shops.test.ts`.
- **CẤM sửa**: `src/engine/shop.ts` (hàm giá hiện có — T12 nối), items.ts (T07), reducer, UI.

## Thiết kế

Shop-per-NPC = bảng dữ liệu khai báo + hàm tra pure. Giá quy ra 2 tầng: món thường tính Vàng/Bạc,
món hiếm (`pill_ls_*`, trang bị hiếm) tính Linh Thạch.

## Việc cần làm

1. `src/content/shops.ts`:
   ```ts
   export interface ShopEntry { itemId: string; priceGold?: number; priceSilver?: number; priceLS?: number; stockDay?: 'always' | 'season' }
   export interface ShopDef { npcId: string; labelVi: string; labelEn: string; entries: ShopEntry[] }
   export const SHOPS: ShopDef[]
   export const NPCS_WITHOUT_SHOP: string[]  // danh sách trắng — đúng 6 id dưới đây
   ```
   - Đủ shop cho **54/60 NPC** (60 − 6 trong danh sách trắng).
   - Danh sách trắng (NPC "giữ chuyện", KHÔNG có shop):
     `n_gardener_thin, n_judge_quang, n_ice_hermit_bang, n_lost_soul_ha, n_crane_spirit, n_monk_nhu`.
   - Mỗi shop **10–15 entry**; chỉ dùng item id trong contracts/item-ids.md (42 cũ + 43 mới).
   - Phân vai đúng bản chất NPC (gợi ý): bao → vũ khí; phung → lương thực; sam → đan; duc → rèn;
     quyen → ngọc-bùa; lien → vé số; hanh → thuê giường (món "nghỉ" giá bạc); bank_tin → đổi tiền
     (silver_coin/spirit_stone); tamer_hac/my → bait; archivist_thu → manual item.
   - Mỗi shop có ít nhất 1 entry tính bằng `priceSilver`; shop của `sam`, `bank_tin`, `name_collector_tra`
     có ≥ 2 entry tính `priceLS`.
2. `src/engine/shopStock.ts` (pure):
   ```ts
   import { SHOPS, ShopDef, ShopEntry } from '../content/shops'
   export function shopForNpc(npcId: string): ShopDef | null
   export function entryPrice(entry: ShopEntry, weatherMod: number): number // nhân weatherMod (T12 truyền), làm tròn xuống
   export function validateShops(errors: string[], validItemIds: Set<string>, validNpcIds: Set<string>): void
   ```
3. `test/shops.test.ts`: SHOPS.length === 54; mỗi shop 10–15 entry; mọi itemId/npcId hợp lệ
   (khai báo mảng id hợp lệ trong test theo contract); entryPrice với mod 0.8 làm tròn đúng.

## Tiêu chí nghiệm thu

`npx vitest run test/shops.test.ts` xanh; `npm run typecheck` xanh; SHOPS = 54, NPCS_WITHOUT_SHOP = 6.

## Cấm

- Sửa giá item trong items.ts. Đụng buy/sell flow reducer (T12). Bịa item id ngoài contract.
