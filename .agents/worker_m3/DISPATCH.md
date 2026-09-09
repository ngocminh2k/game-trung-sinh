## 2026-09-08T04:52:46+07:00
You are Worker M3 for the UI Icon Shortfall project.
Your working directory: C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\.agents\worker_m3
Your parent conversation ID: c32728b6-eadd-4f93-a876-f4f10e8ff39a

MANDATORY FIRST STEP: Read the authoritative request at C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\.agents\ORIGINAL_REQUEST.md.
Also read PROJECT.md and TEST_INFRA.md at the workspace root, and consult docs/agent-work/asset-requests/ui-icon-shortfall-2026-09-08.md for exact concept descriptions.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope Boundaries (Exclusive Write Ownership):
You exclusively own and must create exactly 30 PNG files in `src/assets/art/pins/npc/` (items 1–30):
1. `elder-meihua.png` (cành mai hoa + gậy tre)
2. `storyteller-ngo.png` (quạt xếp mở + thẻ tre ghi sử)
3. `merchant-bao.png` (bàn tính gỗ + thỏi bạc)
4. `hermit-coc.png` (bầu rượu hồ lô + lá trúc)
5. `rival-khoa.png` (hai thanh kiếm bắt chéo rực lửa)
6. `master-vo.png` (nắm đấm bọc băng vải + vòng thiết quyền)
7. `lost-soul-ha.png` (đốm lửa ma trơi lơ lửng)
8. `innkeeper-hanh.png` (vò rượu niêm phong + đôi đũa ngọc)
9. `alchemist-sam.png` (lò luyện đan tỏa khói mây)
10. `hunter-son.png` (cung tên gỗ + lông chim ưng)
11. `guard-truong.png` (mũi giáo thép + khiên gỗ)
12. `kid-xiaobao.png` (chong chóng tre + quả cầu lông)
13. `farmer-tu.png` (lưỡi cuốc đất + bó lúa chín)
14. `fortune-lien.png` (ống xăm tre + đồng tiền quẻ)
15. `cook-phung.png` (dao phay lớn + ngọn lửa hồng)
16. `smith-duc.png` (đe sắt + búa thợ rèn tỏa tia lửa)
17. `scholar-minh.png` (cuộn thư tịch mở + bút lông mực)
18. `pedlar-quyen.png` (đòn gánh tre + đôi sọt hàng)
19. `tea-ma.png` (ấm trà đất nung + chén trà bốc khói)
20. `tailor-yen.png` (cây kim thêu + cuộn chỉ lụa)
21. `senior-lan.png` (tràng hạt bồ đề + ngọc bội khắc cổ)
22. `keeper-anh.png` (chùm chìa khóa đồng + ngọn đèn lồng)
23. `monk-thien.png` (bát khất thực + chuỗi hạt thiền)
24. `herbalist-dan.png` (cối giã thuốc bằng đá + thảo dược)
25. `gatherer-hue.png` (gùi thuốc đeo lưng + liềm con)
26. `ox-cart-hien.png` (bánh xe gỗ lớn + roi mây)
27. `woodcutter-bong.png` (rìu đốn củi + khúc gỗ sồi)
28. `exile-ba.png` (vòng xiềng xích gãy + vạt áo rách)
29. `exorcist-diem.png` (lá bùa chu sa + chuông đồng trừ tà)
30. `crane-spirit.png` (lông vũ tiên hạc phát sáng)

Technical & Aesthetic Requirements:
- Each icon must be a genuine 128x128 PNG with 8-bit alpha transparency (alpha = 0 for transparent background, 4 corners alpha = 0, transparent ratio 15%-98%, outer border margin transparent).
- Style: Vietnamese ink-wash (*mực tàu giấy bản*) base `#180F09` with Vermilion / Son đỏ accent `#AC1922` (oklch(48% 0.18 25)). Centered subject, ~10% padding. No modern gradients, no 3D, no emojis, no borders, no text.
- Tooling: You can use `generate_image` tool to generate AI ink-wash subjects on clean white backgrounds, and use `scripts/process-ui-icon.mjs` (`processRawIconToStandardPng`) or automated Node.js scripts using `sharp` to composite, un-matte, trim, scale, and center into standard 128x128 transparent PNGs.

Self-Verification:
Run a verification check on all 30 files using `verifyFile` from `scripts/verify-ui-icons.mjs` or run `node scripts/verify-ui-icons.mjs` and confirm all 30 of your files are marked valid.

Output:
Write your complete handoff report to:
C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\.agents\worker_m3\handoff.md
When done, message parent (c32728b6-eadd-4f93-a876-f4f10e8ff39a) summarizing your completed files.
