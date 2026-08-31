# T13 — verification-e2e (Nghiệm thu toàn dự án)

- **Wave**: W3 — sau T12.
- **FILE ĐƯỢC SỬA (độc quyền)**: `test/` và `e2e/` (thêm test mới; sửa test cũ CHỈ khi hành vi
  hợp lệ đã đổi và ghi rõ lý do từng dòng trong handoff).

## Việc cần làm

1. `test/quest-coverage.test.ts`: mỗi NPC trong registry có ≥ 1 quest; tổng QUESTS ≥ 150;
   không id trùng (dùng Set đếm).
2. `test/shop-coverage.test.ts`: 54 shop + 6 ngoại lệ khớp 60 NPC; mọi entry price ≥ 1 hoặc null.
3. `test/save-compat.test.ts`: state kiểu cũ (không có field mới) parse qua schema → default an toàn
   (silver 0, spiritStones 0, rememberedNames [], companionId null); `GAME_STATE_VERSION === 1`.
4. `e2e/economy.spec.ts` (Playwright): mua 1 món bằng bạc → số dư bạc giảm; đổi LS → vàng đúng tỷ giá.
5. `e2e/branch-journeys.spec.ts`: 4 journey — mercy/path/blade/rootless đi đến màn ending;
   journey mercy thấy epilogue sublayer theo số tên đã nhớ; journey rootless KHÔNG thấy bất kỳ
   thông báo 【Hệ Thống】 nào sau choice "từ chối kích hoạt" (canon §3).
6b. `e2e/system-notifications.spec.ts` (canon): nhận quest chính → panel hiện
   `【Hệ Thống】 Nhiệm vụ chính tải xong...`; hoàn thành → `Đinh!` + đúng số thưởng
   (Hệ Thống không nói sai con số); hỏi nguồn gốc ở scene_system_doubt → thấy câu né
   `Dữ liệu không đủ để trả lời`. Panel tối đa 3 dòng.
6. `e2e/npc-on-map.spec.ts`: click node `village-elder-porch` và `village-elder-home` đều mở
   thoại Mai Hoa; node NPC trong village không còn node rỗng.
7. Chạy đủ bộ nghiệm thu và GHI KẾT QUẢ THẬT từng lệnh vào handoff:
   ```
   npm run typecheck
   npm run lint
   npx vitest run
   npm run build
   npx playwright test
   ```

## Tiêu chí nghiệm thu cuối cùng của toàn dự án (khớp acceptance file gốc, đã hiệu chỉnh số liệu thật)

1. NPCS ≥ 60, QUESTS ≥ 150, ENDINGS = 12, CHAPTERS = 8, LOCATIONS = 16 (không cần 13 — file gốc sai).
2. Mỗi NPC ≥ 1 quest; 54/60 NPC có shop + 6 ngoại lệ công khai.
3. Kinh tế 3 lớp chạy end-to-end (e2e economy).
4. 4 đường branch đến ending + sublayer (e2e branch).
5. Save cũ không chết (save-compat).
6. Cả 5 lệnh trên đều xanh.

## Cấm

- Bỏ qua/skip test đỏ (`it.skip`, `describe.skip` cấm tuyệt đối).
- Sửa src/ để "làm testPass" — lỗi src phải được ghi nhận và chuyển ngược cho T12 xử lý.
