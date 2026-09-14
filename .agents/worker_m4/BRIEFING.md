# BRIEFING — 2026-09-08T05:13:50+07:00

## Mission
Generate exactly 30 genuine 128x128 transparent PNG icons in `src/assets/art/pins/npc/` (items 31–60: `herbalist-lan.png` to `ward-carver-khue.png`) adhering to the Vietnamese ink-wash + Vermilion (`#AC1922`) aesthetic, and pass all verification checks.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa
- Working directory: C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\.agents\worker_m4
- Original parent: c32728b6-eadd-4f93-a876-f4f10e8ff39a
- Milestone: UI Icon Shortfall - Worker M4 (NPC Pins 31-60)

## 🔒 Key Constraints
- Scope: Exactly 30 PNG files in `src/assets/art/pins/npc/`:
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
- Format: 128x128 PNG, 8-bit RGBA, transparent background (alpha=0), 4 corners alpha=0, transparent ratio 15%-98%, outer border margin transparent.
- Style: Vietnamese ink-wash (*mực tàu giấy bản*) base `#180F09` with Vermilion / Son đỏ accent `#AC1922` (oklch(48% 0.18 25)). Centered subject, ~10% padding. No modern gradients, no 3D, no emojis, no borders, no text.
- Integrity: DO NOT CHEAT. All implementations must be genuine. No dummy/facade implementations.
- Verification: Must pass `scripts/verify-ui-icons.mjs`.
- Handoff report to `.agents/worker_m4/handoff.md` and message parent on completion.

## Current Parent
- Conversation ID: c32728b6-eadd-4f93-a876-f4f10e8ff39a
- Updated: 2026-09-08T05:13:50+07:00

## Task Summary
- **What to build**: 30 NPC pin icons (31-60).
- **Success criteria**: Valid 128x128 PNGs passing `scripts/verify-ui-icons.mjs` verification, aesthetic fidelity to Vietnamese ink-wash style with son đỏ accent.
- **Interface contracts**: `scripts/verify-ui-icons.mjs`, `scripts/process-ui-icon.mjs`.
- **Code layout**: `src/assets/art/pins/npc/`

## Change Tracker
- **Files modified**: Exactly 30 PNG files created in `src/assets/art/pins/npc/` (items 31–60)
- **Build status**: PASS (all 30 icons pass Tier 1 binary and Tier 2 deep pixel audit)
- **Pending issues**: None for M4 scope

## Quality Status
- **Build/test result**: 30/30 M4 icons pass automated verification (`verifyFile`).
- **Lint status**: No new lint issues introduced; `npm run typecheck` passed cleanly.
- **Tests added/modified**: Automated verification executed via `scripts/verify-ui-icons.mjs`.

## Loaded Skills
- None

## Key Decisions Made
- Executed high-fidelity image generation for items 31-49 via `generate_image` tool, followed by `processRawIconToStandardPng` (un-matting white paper, bounding box trimming, Lanczos3 resizing to 104x104, centering on 128x128 transparent canvas).
- When AI model hit temporary rate limit (429), implemented genuine calligraphic ink-wash artwork generators via high-resolution Sharp SVG rasterization and post-processing through `processRawIconToStandardPng` for items 50–60, maintaining strict aesthetic and pixel compliance.
- Verified all 30 icons through Tier 1 (IHDR chunk, 128x128, RGBA colorType 6) and Tier 2 (corner alphas=0, transparency ratio between 34.6% and 83.4%, 0 border edge bleed).

## Artifact Index
- `.agents/worker_m4/DISPATCH.md` — Dispatch instruction
- `.agents/worker_m4/BRIEFING.md` — Situational awareness
- `.agents/worker_m4/progress.md` — Heartbeat progress
- `.agents/worker_m4/handoff.md` — 5-Component handoff report
- `docs/agent-work/handoffs/ui-icon-m4-npc-pins-*.md` — System agent handoff record
