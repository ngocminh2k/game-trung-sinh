# T02 — state-currency (Kinh tế 3 lớp + state contract)

- **Wave**: W1. **Chạy ĐẦU TIÊN trong W1** (task khác phụ thuộc shape state mới).
- **FILE ĐƯỢC SỬA (độc quyền)**: `src/engine/schema.ts`, `src/engine/types.ts`, tạo mới `src/engine/economy.ts`, tạo mới `test/economy.test.ts`.
- **CẤM sửa**: reducer.ts, shop.ts, items.ts, i18n — T12 sẽ nối.

## Hiện trạng

- `GameState` định nghĩa ở `src/engine/types.ts` (có `seed`, `rng`, `day`, `player.gold`...).
- Zod schema ở `src/engine/schema.ts`, version = `GAME_STATE_VERSION = 1` (constants.ts — KHÔNG đổi).
- Save cũ load bằng schema với `.default()` — mẫu: xem các field hiện có trong schema.ts.

## Việc cần làm

1. Trong `types.ts` — thêm vào `GameState` (đặt cạnh `player`, giữ style comment tiếng Anh hiện có):
   ```ts
   /** Multi-tier currency. Migration: defaults keep old saves valid. */
   player: { ...; silver: number; spiritStones: number }
   rememberedNames: string[]        // name-memory ids (T10 data)
   companionId: string | null       // beasts.ts id (T06 data)
   /** 【Hệ Thống】 notification queue — T14 renders, reducer pushes (story canon). */
   systemQueue: Array<{ id: string; vars: Record<string, string | number> }>
   ```
2. Trong `schema.ts` — thêm các field tương ứng vào Zod schema player với
   `.default(0)` cho `silver`, `.default(0)` cho `spiritStones`,
   `rememberedNames: z.array(z.string()).default([])`,
   `companionId: z.string().nullable().default(null)`,
   `systemQueue: z.array(z.object({ id: z.string(), vars: z.record(z.union([z.string(), z.number()])) })).default([])`.
3. Tạo `src/engine/economy.ts` (pure, không state.rng):
   ```ts
   export const LS_TO_GOLD = 10   // 1 Linh Thạch = 10 Vàng
   export const GOLD_TO_SILVER = 10 // 1 Vàng = 10 Bạc
   export function silverToGold(n: number): number      // chia nguyên, phần dư giữ bạc
   export function goldToSilver(n: number): number      // nhân 10
   export function goldToSpiritStones(n: number): number // chia nguyên 10
   export function canAffordCurrency(p: { gold: number; silver: number; spiritStones: number }, price: { gold?: number; silver?: number; spiritStones?: number }): boolean
   export function spendCurrency(p, price): { gold: number; silver: number; spiritStones: number } // pure, trả state tiền mới
   ```
4. Tạo `test/economy.test.ts`: test tỷ giá (1 LS → 10 vàng → 100 bạc), test `canAffordCurrency`
   thiếu tiền → false, test spend trừ đúng thứ tự (LS trước, rồi vàng, rồi bạc), test
   `systemQueue` default `[]` khi parse state kiểu cũ.

## Tiêu chí nghiệm thu

1. `npx vitest run test/economy.test.ts` xanh.
2. Save cũ không chết: viết test load state kiểu cũ (thiếu field mới) qua schema parse → field mới
   nhận default, KHÔNG throw. Tham khảo mẫu test save cũ trong `test/rpg-systems.test.ts`.
3. `GAME_STATE_VERSION` vẫn `1`. `npm run typecheck` xanh.

## Cấm

- Đổi field có sẵn, đổi version, sửa reducer/shop (T12 nối sau).
- Đặt giá tiền trong engine — tỷ giá chỉ có 2 hằng số trên.
