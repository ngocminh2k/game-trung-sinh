# T09 — endings-chapters (8 chương + 12 ending + sublayer)

- **Wave**: W1. **Phụ thuộc**: T02 (flag/state shape) — chỉ đọc.
- **FILE ĐƯỢC SỬA (độc quyền)**: `src/content/endings-data.ts`, `src/content/chapters.ts`,
  `src/content/story.ts` (STORY_SCENES — chú ý: file content, KHÔNG phải `src/engine/story.ts`),
  tạo mới `src/content/sublayers.ts`, `test/sublayers.test.ts`.
- **CẤM sửa**: `src/engine/endings.ts`, `src/engine/story.ts` (đang bị claim khác giữ — T12 lo),
  gate `length(11)`/`length(6)` ở content/index.ts (T12 lo).

## Hiện trạng đã xác minh

- `ENDINGS` có **11** ending: tragic_death, keeper_of_names, rootless_star, city_of_ghosts,
  iron_lantern, borrowed_face, rift_kingdom, forgiven_enemy, blank_page, jade_heir, quiet_harmony.
- `CHAPTERS` có **6** chapter. `STORY_SCENES` ≥ 6 (gate hiện tại).
- Lựa chọn chi nhánh ghi qua `StoryChoiceDef.effects` (Record<string, ...>) → flags. Dùng pattern này.

## Việc cần làm

1. **chapters.ts**: thêm 2 chapter để đủ **8**:
   - index 6: `nameVi: 'Đỉnh Mây và Hàn Băng Phong'`, `nameEn: 'Cloud Peak and the Frozen Peak'`
   - index 7: `nameVi: 'Phi Thăng'`, `nameEn: 'Ascension'`
   Giữ style taglineVi/En của 6 chapter cũ.
2. **endings-data.ts**: thêm **1** ending mới `id: 'nameless_ascension'`
   (`nameVi: 'Phi Thăng Vô Danh'`) → tổng **12**. Vị trí thêm: CUỐI mảng (không chen giữa —
   thứ tự có thể được dùng ở UI).
3. **story.ts (content)**: thêm 4 scene lựa chọn đường đi (mỗi đường 1 scene, chapter 7):
   - `scene_branch_mercy` (MINH), `scene_branch_path` (HÀNH), `scene_branch_blade` (SÁT),
     `scene_branch_rootless` (GỐC).
   - Mỗi scene 2–3 choices; mỗi choice đặt `effects: { branch: 'mercy' | 'path' | 'blade' | 'rootless' }`
     + `playerDelta` hợp lý. KHÔNG xóa scene/choice cũ; chỉ thêm.
3b. **Scene xuyên không + kích hoạt Hệ Thống (canon `contracts/story-canon.md` §1, §4 — BẮT BUỘC)**:
   - `scene_transmigration` (chapter 0): người hiện đại tỉnh lại trong xác Vệ Vô Danh; Hệ Thống
     kích hoạt (đưa thông báo đầu `【Hệ Thống】 Kích hoạt...` vào textVi/textEn); choices = 3 nhánh
     cũ (mercy/ngo/rootless) + choice mới `refuse_system` (nhánh rootless = **từ chối kích hoạt
     Hệ Thống**, effects `{ branch: 'rootless', system_refused: true }`).
   - `scene_system_doubt` (chapter 6): Hệ Thống lỡ lời — thông báo không khớp ký ức; choices:
     hỏi tiếp (→ sys_dodge) / im lặng / ghi lại bằng chứng (flag `system_doubt_recorded`).
   - Ghi chú: nếu graph scene hiện tại không cho chèn 2 scene mới mà không sửa scene cũ,
     chỉ được thêm trường `nextSceneId`/effects vào scene CHƯƠNG 0 hiện có (tối thiểu can thiệp)
     và ghi rõ vào handoff cho T12.
4. **sublayers.ts** (mới) — dữ liệu tính lớp con:
   ```ts
   export type Branch = 'mercy' | 'path' | 'blade' | 'rootless'
   export interface SublayerDef { id: string; branch: Branch; minNames: number; requireFlag?: string; nameVi: string; nameEn: string; epilogueVi: string; epilogueEn: string }
   export const SUBLAYERS: SublayerDef[]        // 12 entry: 4 branch × 3
   export function sublayerFor(branch: Branch, rememberedCount: number, flags: Record<string, boolean|number|string>): SublayerDef
   ```
   12 sublayer: mỗi branch 3 bậc theo `minNames` 0 / 100 / 200 (bậc cao nhất có `requireFlag`
   ví dụ `vow_kept`). Pure function, không đụng rng.
5. `test/sublayers.test.ts`: SUBLAYERS.length === 12; mỗi branch đúng 3; `sublayerFor` chọn đúng bậc
   theo minNames; epilogue có đủ Vi/En.

## Tiêu chí nghiệm thu

`npx vitest run test/sublayers.test.ts` xanh; `npm run typecheck` xanh;
CHAPTERS = 8, ENDINGS = 12 (đếm bằng grep).

## Cấm

- Xóa/đổi id 11 ending cũ. Đụng engine/endings.ts hay engine/story.ts. Tạo ending thứ 13.
