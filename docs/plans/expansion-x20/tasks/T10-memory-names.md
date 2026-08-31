# T10 — memory-names (200 cái tên bị xóa)

- **Wave**: W1. **Phụ thuộc**: T02 (đọc `state.rememberedNames` shape).
- **FILE ĐƯỢC SỬA (độc quyền)**: tạo mới `src/content/name-memories.ts`, `src/engine/memory.ts`, `test/memory-names.test.ts`.
- **CẤM sửa**: schema/types, reducer, GameScreen (T12 nối HUD `Đã nhớ: N/200`).

## Quyết định thiết kế (giải mâu thuẫn của file gốc)

200 tên chia 3 nguồn: **100 trong quest** (nhóm `quest`), **60 trong đám tro xương** (nhóm `ash`),
**40 trong 4 sự kiện đêm** (nhóm `night` — mỗi đêm mở 1 trang sổ = 10 tên; KHÔNG phải 1 tên/đêm).

## Việc cần làm

1. `src/content/name-memories.ts`:
   ```ts
   export interface NameMemory { id: string; nameVi: string; nameEn: string; source: 'quest' | 'ash' | 'night'; hintVi: string; hintEn: string }
   export const NAME_MEMORIES: NameMemory[]   // đúng 200
   ```
   - id scheme: `nm_<stt 001..200>` (zero-pad 3 chữ số) — ĐƠN GIẢN VÀ KHÔNG TRÙNG.
   - 100 quest: gắn với hint là loại quest (side/secret/find/aff/timed từ quest-catalog).
   - 60 ash: hint đề cập Tro Xương/tư tế Cuu.
   - 40 night: id `nm_161..nm_200`, chia 4 trang sổ 10 tên: `night_1..night_4`
     (export thêm `export const NIGHT_PAGES: Record<'night_1'|'night_2'|'night_3'|'night_4', string[]>`).
   - Tên tiếng Việt hợp phong cách cổ trang (Nguyễn Văn A kiểu plain là SAI tông — dùng tên 2–3 chữ
     kiểu "Trịnh Bàn", "La Cửu Nương"...) + nameEn là phiên âm/nghĩa ngắn.
2. `src/engine/memory.ts` (pure):
   ```ts
   export const MEMORY_TOTAL = 200
   export const MEMORY_GATE = 50   // >50 mở lớp kết cuối
   export function rememberedCount(state: { rememberedNames: string[] }): number
   export function rememberNames(state: { rememberedNames: string[] }, ids: string[]): string[] // pure merge, dedupe
   export function memoryMilestone(count: number): 0 | 1 | 2 | 3 // 0: <50, 1: >=50, 2: >=100, 3: 200
   ```
3. `test/memory-names.test.ts`: đúng 200, id unique, nguồn 100/60/40; rememberNames dedupe;
   milestone đúng bậc.

## Tiêu chí nghiệm thu

`npx vitest run test/memory-names.test.ts` xanh; `npm run typecheck` xanh; đếm NAME_MEMORIES === 200.

## Cấm

- Đụng HUD (T12), quest data (T04), story scene (T09).
