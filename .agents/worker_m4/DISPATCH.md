## 2026-09-08T04:52:46+07:00

You are Worker M4 for the UI Icon Shortfall project.
Your working directory: C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\.agents\worker_m4
Your parent conversation ID: c32728b6-eadd-4f93-a876-f4f10e8ff39a

MANDATORY FIRST STEP: Read the authoritative request at C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\.agents\ORIGINAL_REQUEST.md.
Also read PROJECT.md and TEST_INFRA.md at the workspace root, and consult docs/agent-work/asset-requests/ui-icon-shortfall-2026-09-08.md for exact concept descriptions.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope Boundaries (Exclusive Write Ownership):
You exclusively own and must create exactly 30 PNG files in `src/assets/art/pins/npc/` (items 31–60):
31. `herbalist-lan.png` (cây linh chi ngàn năm + hoa sen tuyết)
32. `swordsman-diep.png` (thanh trường kiếm gỉ sáng bóng mũi)
33. `monk-nhu.png` (mõ gỗ gõ kinh + cây thiền trượng)
34. `broker-tieu.png` (cuộn hợp đồng khế ước + con dấu đồng)
35. `fisher-yen.png` (cần câu trúc + con cá chép vẫy đuôi)
36. `relic-hunter-bach.png` (la bàn cổ bằng đồng phong thủy)
37. `beast-tamer-le.png` (vòng lục lạc lục giác + dây cương da thú)
38. `pavilion-disciple-anh.png` (phù hiệu Thiên Thanh Các đúc ngọc)
39. `wandering-blade-phong.png` (thanh đao gãy quấn vải thô)
40. `rogue-cultivator-nhat.png` (mặt nạ gỗ quỷ dị che nửa mặt)
41. `gardener-thin.png` (kéo tỉa cành bằng đồng + đóa hoa cúc)
42. `auctioneer-hoan.png` (búa gõ đấu giá bằng ngọc + chuông đồng)
43. `banker-tin.png` (tấm ngân phiếu cổ khắc hoa văn kim ấn)
44. `gardener-vien.png` (bình tưới nước bằng gốm + mầm cây non)
45. `beekeeper-oanh.png` (tổ ong mật hình lục giác nhỏ giọt)
46. `archivist-thu.png` (kính lúp viền đồng + trang sách mục)
47. `judge-quang.png` (thanh kinh đường mộc đập bàn xử án)
48. `tamer-hac.png` (roi da thú gai nhọn + khúc xương thú)
49. `beast-singer-my.png` (chiếc sáo ngọc trúc phát ra âm ba)
50. `ash-priest-cuu.png` (lư hương ba chân tỏa tàn tro)
51. `name-collector-tra.png` (quyển sổ da dê ghi tên người đã khuất)
52. `ice-hermit-bang.png` (khối băng vĩnh cửu tỏa hàn khí)
53. `snow-guard-han.png` (mũi thương băng tuyết + khiên da gấu)
54. `caravan-duong.png` (chuông lạc đà bằng đồng + túi da đựng nước)
55. `dune-guide-sa.png` (kính chắn cát thô sơ + mảnh vải quấn)
56. `lake-keeper-trang.png` (chiếc gầu múc nước gỗ soi bóng trăng)
57. `ferryman-cau.png` (mái chèo gỗ cũ mòn + sóng nước)
58. `dice-master-luc.png` (ba viên xúc xắc ngà điểm son)
59. `map-seller-man.png` (ống đựng bản đồ da khắc hải đồ)
60. `ward-carver-khue.png` (dao khắc phù văn trận pháp + phiến đá trận)

Technical & Aesthetic Requirements:
- Each icon must be a genuine 128x128 PNG with 8-bit alpha transparency (alpha = 0 for transparent background, 4 corners alpha = 0, transparent ratio 15%-98%, outer border margin transparent).
- Style: Vietnamese ink-wash (*mực tàu giấy bản*) base `#180F09` with Vermilion / Son đỏ accent `#AC1922` (oklch(48% 0.18 25)). Centered subject, ~10% padding. No modern gradients, no 3D, no emojis, no borders, no text.
- Tooling: You can use `generate_image` tool to generate AI ink-wash subjects on clean white backgrounds, and use `scripts/process-ui-icon.mjs` (`processRawIconToStandardPng`) or automated Node.js scripts using `sharp` to composite, un-matte, trim, scale, and center into standard 128x128 transparent PNGs.

Self-Verification:
Run a verification check on all 30 files using `verifyFile` from `scripts/verify-ui-icons.mjs` or run `node scripts/verify-ui-icons.mjs` and confirm all 30 of your files are marked valid.

Output:
Write your complete handoff report to:
C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\.agents\worker_m4\handoff.md
When done, message parent (c32728b6-eadd-4f93-a876-f4f10e8ff39a) summarizing your completed files.
