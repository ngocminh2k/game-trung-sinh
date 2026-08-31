# T06 — companion-beasts (Linh thú 36 con)

- **Wave**: W1. **Phụ thuộc**: T02 đã khai báo `state.companionId` (đọc types.ts mới).
- **FILE ĐƯỢC SỬA (độc quyền)**: tạo mới `src/content/beasts.ts`, `src/engine/companion.ts`, `test/companion.test.ts`.
- **CẤM sửa**: schema/types (T02 đã lo), reducer (T12 nối action thuần thú).

## Việc cần làm

1. Tạo `src/content/beasts.ts` — data thuần, export `BEASTS: BeastDef[]` với interface tự định nghĩa
   trong cùng file (đặt interface bên cạnh data, không sửa content-types.ts):
   ```ts
   export interface BeastDef {
     id: string            // beast_<loai>_<cap>: thường|dac_biet|boss → beast_bach_ho_thuong v.v.
     speciesVi: string     // Bạch Hổ
     speciesEn: string
     tier: 'thuong' | 'dac_biet' | 'boss'
     locationId: string    // 1 trong 16 region (chọn hợp sinh thái: ridge/forest/frozen/peak/dunes/moon_lake)
     requiredBait: string  // item id từ contracts/item-ids.md nhóm bait_*
     minLuck: number       // ngưỡng Luck để thuần: thuong 3, dac_biet 5, boss 7
     buff: { kind: 'attack' | 'defense' | 'heal' | 'qi' | 'dodge'; value: number }
     descVi: string; descEn: string
   }
   ```
2. Đúng **12 loài × 3 con = 36** bản ghi. 12 loài: Bạch Hổ, Yêu Lang, Hạc Linh, Hồ Ly, Long Xà,
   Kỳ Lân Con, Trư Nha Sương, Liệt Khuyển, Ong Hoàng, Đào Tinh, Quy Thủy Quái, Vũ Điểu.
   Mỗi loài dùng đúng 1 bait từ contract (`bait_<ten>`).
3. Tạo `src/engine/companion.ts` (pure):
   ```ts
   export function canTame(state: { flags: Record<string, number|boolean|string>; luck: number }, beast: BeastDef): boolean
   export function companionBuff(companionId: string | null, beasts: BeastDef[]): { kind: string; value: number } | null
   export const COMPANION_EXTRA_ACTION = 1 // thuần thành công = +1 lượt hành động (T12 áp vào combat)
   ```
   Lưu ý: đọc `src/engine/types.ts` để xem tên field flags/luck THẬT của GameState trước khi viết
   signature — không đoán mò.
4. `test/companion.test.ts`: đủ 36 con; mỗi bait tồn tại trong contract (mock mảng item id);
   `canTame` đúng ngưỡng minLuck; `companionBuff(null)` → null.

## Tiêu chí nghiệm thu

`npx vitest run test/companion.test.ts` xanh; `npm run typecheck` xanh; đếm BEASTS.length === 36.

## Cấm

- Đụng combat/reducer. Tạo item bait (T07 lo item). Buff màn hình HUD (T12).
