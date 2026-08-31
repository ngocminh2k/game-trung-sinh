# T04 — quest-expansion (25 → 150 quest)

- **Wave**: W1 (song song với T03 — chỉ cần contracts, không cần code của T03).
- **FILE ĐƯỢC SỬA (độc quyền)**: `src/content/quests.ts`
- **CẤM sửa**: npcs.ts, items.ts, gate `min(1)` ở content/index.ts (T12 lo).

## Hiện trạng đã xác minh

- `QUESTS` có **25** quest (8 main + 10 side + 4 secret + 3 world). Helper `turnIn(...)` đã có
  ở đầu file — dùng nó cho step cuối.
- ID mới: ĐÓNG BĂNG trong `contracts/quest-catalog.md` (125 quest mới, 6 nhóm).
- Item id được phép tham chiếu: `contracts/item-ids.md` (42 cũ + những id T07 sẽ tạo — có thể
  tham chiếu SỚM vì T07 cùng wave; nếu item chưa có khi bạn chạy test → comment rõ trong handoff).

## Việc cần làm (theo catalog, đúng 125 quest mới)

1. **4 MAIN**: nối `nextQuestId`/`storySceneNextId` hợp lệ; 2 quest đầu đặt sau `q_main_final_vow`
   bằng chuỗi `nextQuestId`. Nếu cần scene mới → KHÔNG tự tạo; bỏ qua `storySceneNextId` (T12 lo).
2. **50 SIDE** `q_<area>_<nn>`: mỗi quest gắn 1 NPC của vùng đó (gom theo npc-registry);
   mỗi NPC trong registry phải được ít nhất 1 quest phủ (side hoặc aff hoặc main). Audit bằng
   lệnh grep `giverNpcId` và đối chiếu 60 id.
3. **16 SECRET** `q_secret_<area>_<nn>`: `secret: true`, `requiredFlags: ['flag_gợi_ý']`
   (flag snake_case mới được, ví dụ `found_blood_field`).
4. **15 TIMED** `q_timed_01..15`: `deadlineDays: 1|2|3`, giver là NPC của vùng hợp lý.
5. **25 EXPLORATION** `q_find_01..25`: `secret: true`, step là `completeNpcTalk: '<n_...>'`,
   giver là NPC chỉ điểm (không phải NPC ẩn).
6. **15 AFFINITY** `q_aff_01..15`: chuỗi 3 quest cho 5 NPC core (meihua 3, ngo 3, bao 3, vo 3, bach 3);
   mở bằng `requiredFlags` bậc thang aff (flag do T12 set: `aff_gate_<npc>`; tạm dùng flag có sẵn
   `aff_n_elder_meihua`... nếu tồn tại trong engine — kiểm tra `doTalk` trong reducer trước khi đặt tên).
7. Mỗi quest ≥ 2 steps, bước cuối dùng helper `turnIn`, `rewardGold` 5–60,
   `requiredItems: {}` khai báo đầy đủ.

## Tiêu chí nghiệm thu

1. `Select-String -Path src\content\quests.ts -Pattern "\{ id: 'q_" | Measure-Object | % Count` → **150**.
2. Không id trùng (validate sẵn có sẽ bắt khi T12 nâng gate; tự audit bằng script PowerShell:
   gom id, `Group-Object`, lọc count > 1).
3. `npm run typecheck` xanh; `npx vitest run test/content.test.ts` xanh.
4. Mỗi 1 trong 60 NPC id có ≥ 1 quest (audit tay bằng grep giverNpcId).

## Cấm

- Sửa 25 quest cũ (kể cả đổi reward). Tạo quest không có trong catalog. Quên `requiredItems: {}`.
