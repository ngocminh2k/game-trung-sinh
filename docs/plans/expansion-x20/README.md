# EXPANSION ×20 — BỘ TÀI LIỆU THỰC THI (AGENT-EXECUTABLE)

> **Đây là nguồn sự thật duy nhất để thực thi** kế hoạch mở rộng. File gốc `docs/plans/expansion-x20.md`
> chỉ còn giá trị narrative/thiết kế. **Khi xung đột giữa file gốc và bộ tài liệu này → BỘ TÀI LIỆU NÀY THẮNG.**

## Trạng thái nền đã xác minh (2026-08-31, commit `b24f2ed`)

KHÔNG tin số liệu trong file gốc. Số thật, đã đếm bằng lệnh:

| Thứ | File gốc ghi | **THỰC TẾ** | Nơi kiểm chứng |
|---|---|---|---|
| Region | 8 | **16** | `src/content/locations.ts` → `LOCATIONS` |
| NPC | 30 | **40** | `src/content/npcs.ts` → `NPCS` |
| Quest | 25 | **25** ✅ | `src/content/quests.ts` → `QUESTS` |
| Ending | 5 | **11** | `src/content/endings-data.ts` → `ENDINGS` |
| Chapter | 8 | **6** | `src/content/chapters.ts` → `CHAPTERS` |
| Schema version | 1 | **1** | `src/engine/constants.ts` → `GAME_STATE_VERSION` |

Hệ quả: 5 map "mới" của file gốc **đã tồn tại** (`thousand_herbs_valley`, `azure_pavilion`,
`spirit_beast_ridge`, `bone_ash_ruins`, `frozen_peak`, cùng `moon_lake`, `blackwind_dunes`).
Không tạo map mới. Công việc còn lại là: nội dung (NPC/quest), kinh tế 3 lớp, weather, linh thú,
alchemy, skill tree, phân nhánh + sublayer, 200 cái tên, shop-per-NPC.

## Canon bắt buộc (bổ sung 2026-08-31 — user chỉ đích danh)

**Cốt truyện phải là xuyên không có Hệ Thống hiện hình** — người hiện đại chết, tỉnh lại trong
thân xác thiếu niên linh căn phế, 【Hệ Thống】 phát nhiệm vụ + thưởng "Đinh!". File gốc chỉ "chung
chủ đề" → KHÔNG đạt. Đọc `contracts/story-canon.md` TRƯỚC khi viết bất kỳ scene/quest/thoại nào.
Tác động: task **T14** mới (giao diện Hệ Thống, wave W1); T02 thêm `systemQueue`; T09 thêm
scene xuyên không + kích hoạt Hệ Thống; T12 nối panel thông báo; "Memory of Names" trở thành
**bí mật nguồn gốc của Hệ Thống** (twist chương 6–8) — toàn bộ dữ liệu 200 tên giữ nguyên.

## Mô hình sóng (WAVE) — cách chạy song song

Mỗi task SỞ HỮU ĐỘC QUYỀN một số file. Hai task không bao giờ sửa chung một file.

```
W0 (CỔNG — làm 1 lần, tuần tự):
    - Claim `minor-realm-character-progression` phải hoàn tất/handoff TRƯỚC
      (nó đang giữ schema.ts, types.ts, story.ts, reducer.ts).
    - Baseline xanh: npm run typecheck && npm run lint && npx vitest run

W1 (SONG SONG — 12 agent có thể chạy cùng lúc):
    T01 village-map-fix      → chỉ src/content/locations.ts
    T02 state-currency       → src/engine/schema.ts, types.ts, + engine/economy.ts (mới)
    T03 npc-expansion        → chỉ src/content/npcs.ts
    T04 quest-expansion      → chỉ src/content/quests.ts
    T05 weather              → src/engine/weather.ts (mới) + test riêng
    T06 companion-beasts     → src/content/beasts.ts, engine/companion.ts (mới)
    T07 alchemy-items        → src/content/items.ts, refinement.ts, + content/alchemy.ts (mới)
    T08 techniques-skilltree → chỉ src/content/rpg.ts, content/skill-tree.ts
    T09 endings-chapters     → content/endings-data.ts, chapters.ts, story.ts, + sublayers.ts (mới)
    T10 memory-names         → content/name-memories.ts, engine/memory.ts (mới)
    T11 shops-per-npc        → content/shops.ts, engine/shopStock.ts (mới)
    T14 system-interface     → content/system-messages.ts, engine/system.ts (mới)

W2 (TUẦN TỰ — 1 agent, sau khi CẢ W1 xong):
    T12 integration-wiring   → reducer.ts, engine/index.ts, content/index.ts,
                               GameScreen.tsx, i18n, shop.ts, map.ts

W3 (TUẦN TỰ — 1 agent):
    T13 verification-e2e     → test/, e2e/ + chạy đủ 5 lệnh nghiệm thu
```

T03 và T04 chạy song song an toàn vì cả hai chỉ đọc `contracts/` (ID đã đóng băng), không đọc code của nhau.

## Quy tắc bắt buộc cho MỌI agent (đọc `CONVENTIONS.md` trước khi làm)

1. Đọc `CONVENTIONS.md` + task doc của mình + các file contract liên quan. KHÔNG đọc file gốc làm spec.
2. Chỉ sửa file nằm trong mục "FILE ĐƯỢC SỬA" của task. Cấm sửa file khác — kể cả "để fix kẹt build".
3. Cấm: `Math.random()`, `Date.now()`, `console.log` trong `src/engine/`, commit/push tự ý, reset stash.
4. Mọi nội dung viết 2 ngôn ngữ: mọi field `*Vi` phải có cặp `*En` cùng lúc.
5. Chạy đúng lệnh kiểm chứng trong task, dán kết quả thật vào báo cáo. Test đỏ = chưa xong.
6. Xong thì handoff: `npm run agent:handoff -- --id <task-id> --from cline --to <next> ...`

## Checklist tiến độ toàn dự án

| Task | Wave | Trạng thái | Người làm |
|---|---|---|---|
| T01 village-map-fix | W1 | ☐ chưa làm | |
| T02 state-currency | W1 | ☐ | |
| T03 npc-expansion | W1 | ☐ | |
| T04 quest-expansion | W1 | ☐ | |
| T05 weather | W1 | ☐ | |
| T06 companion-beasts | W1 | ☐ | |
| T07 alchemy-items | W1 | ☐ | |
| T08 techniques-skilltree | W1 | ☐ | |
| T09 endings-chapters | W1 | ☐ | |
| T10 memory-names | W1 | ☐ | |
| T11 shops-per-npc | W1 | ☐ | |
| T14 system-interface | W1 | ☐ | |
| T12 integration-wiring | W2 | ☐ | |
| T13 verification-e2e | W3 | ☐ | |
