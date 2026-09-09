# Project: UI Icon Shortfall (121 Assets)

## Architecture
The UI Icon Shortfall project provides 121 custom, production-grade graphical UI icons replacing temporary placeholder Chinese Hanzi glyphs (`人`, `門`, `事`, `凶`, `氣`, `囊`, `市`, `道`, `契`, `神`, `心`, `脈`, `運`) and missing asset files across the game interface.

- **Format**: 128×128 pixels, PNG format with 8-bit Alpha Channel (transparent background, alpha = 0 outside subject).
- **Aesthetic**: Vietnamese Ink-wash (*Mực tàu giấy bản*) using base ink color `oklch(18% 0.02 60)` (`#180F09`) with high-saturation single-color accents per category.
- **Framing**: Centered subject, trimmed bounding box, padded with ~10% margin (~12px on all sides, inner box ~104×104).
- **Generation & Processing Pipeline**:
  - Raw artwork generated with `generate_image` on clean white background.
  - Automated post-processing via Node.js + `sharp@0.35.4` in `scripts/process-ui-icon.mjs` (un-premultiplying white matte, trimming, scaling with Lanczos3, centering on 128x128 transparent canvas).
  - Two-layer automated verification via `scripts/verify-ui-icons.mjs` (binary PNG IHDR/chunk validation + deep pixel audit for alpha transparency and corners).

## Feature Inventory
| # | Feature | Description / Filename | Category | Milestone | Source |
|---|---------|------------------------|----------|-----------|--------|
| 1 | Tab: Nhân vật / Mối quan hệ | `people.png` | LeftRail Tabs | M1 | spec |
| 2 | Tab: Sinh mệnh / Tu vi | `vital.png` | LeftRail Tabs | M1 | spec |
| 3 | Tab: Túi đồ / Pháp bảo | `items.png` | LeftRail Tabs | M1 | spec |
| 4 | Tab: Phố thị / Chợ | `market.png` | LeftRail Tabs | M1 | spec |
| 5 | Tab: Bản đồ / Đạo lộ | `path.png` | LeftRail Tabs | M1 | spec |
| 6 | Tab: Hệ thống / Thiết lập | `system.png` | LeftRail Tabs | M1 | spec |
| 7 | Attr: Thần (Quyến rũ / Mị lực) | `charm.png` | Tứ Tượng Attrs | M1 | spec |
| 8 | Attr: Tâm (Ngộ tính / Ý chí) | `mind.png` | Tứ Tượng Attrs | M1 | spec |
| 9 | Attr: Mạch (Thể chất / Căn cốt) | `body.png` | Tứ Tượng Attrs | M1 | spec |
| 10 | Attr: Vận (Khí vận / May mắn) | `luck.png` | Tứ Tượng Attrs | M1 | spec |
| 11 | HUD Bar: Sinh lực (HP) | `hp.png` | HUD Bars | M1 | spec |
| 12 | HUD Bar: Linh khí (Qi) | `qi.png` | HUD Bars | M1 | spec |
| 13 | HUD Bar: Tu vi (Cultivation) | `cultivation.png` | HUD Bars | M1 | spec |
| 14 | Danger: Tổ ong độc | `bee-nest.png` | Danger Pins | M1 | spec |
| 15 | Danger: Dấu chân sói | `wolf-tracks.png` | Danger Pins | M1 | spec |
| 16 | Danger: Phong ấn rạn nứt | `cracked-seal.png` | Danger Pins | M1 | spec |
| 17 | Danger: Hạch tâm vết nứt | `rift-core.png` | Danger Pins | M1 | spec |
| 18 | Danger: Hốc tổ sâu độc | `hive-hollow.png` | Danger Pins | M1 | spec |
| 19 | Danger: Mắt bão lốc xoáy | `storm-eye.png` | Danger Pins | M1 | spec |
| 20 | Danger: Vết nứt băng giá | `ice-fissure.png` | Danger Pins | M1 | spec |
| 21 | Danger: Tế đàn xương trắng | `bone-altar.png` | Danger Pins | M1 | spec |
| 22 | Danger: Đá vuốt quái thú | `claw-rock.png` | Danger Pins | M1 | spec |
| 23 | Exit: Làng khởi đầu | `village.png` | Exit Pins | M1 | spec |
| 24 | Exit: Chợ phiên | `market.png` | Exit Pins | M1 | spec |
| 25 | Exit: Tông môn / Giáo phái | `sect.png` | Exit Pins | M1 | spec |
| 26 | Exit: Ruộng dược thảo | `herb-field.png` | Exit Pins | M1 | spec |
| 27 | Exit: Rừng sương mù | `misty-forest.png` | Exit Pins | M1 | spec |
| 28 | Exit: Hang động phong ấn | `sealed-cave.png` | Exit Pins | M1 | spec |
| 29 | Exit: Khe nứt nguyền rủa | `cursed-rift.png` | Exit Pins | M1 | spec |
| 30 | Exit: Đỉnh mây mù | `cloud-peak.png` | Exit Pins | M1 | spec |
| 31 | Exit: Thung lũng vạn thảo | `thousand-herbs-valley.png` | Exit Pins | M1 | spec |
| 32 | Exit: Cồn cát hắc phong | `blackwind-dunes.png` | Exit Pins | M1 | spec |
| 33 | Exit: Đỉnh núi băng | `frozen-peak.png` | Exit Pins | M1 | spec |
| 34 | Exit: Chợ du mục | `wandering-market.png` | Exit Pins | M1 | spec |
| 35 | Exit: Hồ trăng | `moon-lake.png` | Exit Pins | M1 | spec |
| 36 | Exit: Tàn tích tro cốt | `bone-ash-ruins.png` | Exit Pins | M1 | spec |
| 37 | Exit: Dãy núi linh thú | `spirit-beast-ridge.png` | Exit Pins | M1 | spec |
| 38 | Exit: Thiên thanh các | `azure-pavilion.png` | Exit Pins | M1 | spec |
| 39 | Event: Lũy tre xanh | `bamboo-rampart.png` | Event Pins | M2 | spec |
| 40 | Event: Căn nhà cổ | `old-house.png` | Event Pins | M2 | spec |
| 41 | Event: Giếng làng | `village-well.png` | Event Pins | M2 | spec |
| 42 | Event: Vòng quay số phận | `fortune-wheel.png` | Event Pins | M2 | spec |
| 43 | Event: Trà quán ven đường | `tea-house.png` | Event Pins | M2 | spec |
| 44 | Event: Đấu trường tỷ thí | `arena.png` | Event Pins | M2 | spec |
| 45 | Event: Tàng bảo các | `treasure-pavilion.png` | Event Pins | M2 | spec |
| 46 | Event: Tường thiền định | `meditation-wall.png` | Event Pins | M2 | spec |
| 47 | Event: Bậc thang dược thảo | `herb-terrace.png` | Event Pins | M2 | spec |
| 48 | Event: Ngã tư sương mù | `fog-crossroads.png` | Event Pins | M2 | spec |
| 49 | Event: Tổ mây bồng bềnh | `cloud-nest.png` | Event Pins | M2 | spec |
| 50 | Event: Chuông gió phong linh | `wind-bell.png` | Event Pins | M2 | spec |
| 51 | Event: Bia đá vô danh | `nameless-stele.png` | Event Pins | M2 | spec |
| 52 | Event: Vách đá ngắm gió | `wind-cliff.png` | Event Pins | M2 | spec |
| 53 | Event: Vườn linh dược bí cảnh | `herb-garden.png` | Event Pins | M2 | spec |
| 54 | Event: Ốc đảo khô hạn | `dry-oasis.png` | Event Pins | M2 | spec |
| 55 | Event: Gương băng tuyết | `ice-mirror.png` | Event Pins | M2 | spec |
| 56 | Event: Sạp đấu giá cổ vật | `auction-stall.png` | Event Pins | M2 | spec |
| 57 | Event: Trà đình đoàn buôn | `caravan-teahouse.png` | Event Pins | M2 | spec |
| 58 | Event: Thủy nguyệt dạ cảnh | `moon-water.png` | Event Pins | M2 | spec |
| 59 | Event: Đầm sen thanh tịnh | `lotus-pond.png` | Event Pins | M2 | spec |
| 60 | Event: Bia tàn đổ nát | `broken-stele.png` | Event Pins | M2 | spec |
| 61 | Event: Tàng thư các mây | `cloud-library.png` | Event Pins | M2 | spec |
| 62 | NPC 01: Mai Hoa Trưởng lão | `elder-meihua.png` | NPC Pins | M3 | spec |
| 63 | NPC 02: Ngô Tiên sinh (Kể chuyện) | `storyteller-ngo.png` | NPC Pins | M3 | spec |
| 64 | NPC 03: Bảo Chưởng quầy (Thương nhân) | `merchant-bao.png` | NPC Pins | M3 | spec |
| 65 | NPC 04: Cốc Ẩn sĩ | `hermit-coc.png` | NPC Pins | M3 | spec |
| 66 | NPC 05: Khoa Túc địch | `rival-khoa.png` | NPC Pins | M3 | spec |
| 67 | NPC 06: Võ Võ sư | `master-vo.png` | NPC Pins | M3 | spec |
| 68 | NPC 07: Hà Cô hồn | `lost-soul-ha.png` | NPC Pins | M3 | spec |
| 69 | NPC 08: Hạnh Khách điếm chủ | `innkeeper-hanh.png` | NPC Pins | M3 | spec |
| 70 | NPC 09: Sâm Đan sư | `alchemist-sam.png` | NPC Pins | M3 | spec |
| 71 | NPC 10: Sơn Thợ săn | `hunter-son.png` | NPC Pins | M3 | spec |
| 72 | NPC 11: Trương Đội trưởng vệ binh | `guard-truong.png` | NPC Pins | M3 | spec |
| 73 | NPC 12: Tiểu Bảo | `kid-xiaobao.png` | NPC Pins | M3 | spec |
| 74 | NPC 13: Tú Lão nông | `farmer-tu.png` | NPC Pins | M3 | spec |
| 75 | NPC 14: Liên Thầy bói | `fortune-lien.png` | NPC Pins | M3 | spec |
| 76 | NPC 15: Phụng Đầu bếp | `cook-phung.png` | NPC Pins | M3 | spec |
| 77 | NPC 16: Đức Thợ rèn | `smith-duc.png` | NPC Pins | M3 | spec |
| 78 | NPC 17: Minh Thư sinh | `scholar-minh.png` | NPC Pins | M3 | spec |
| 79 | NPC 18: Quyên Bán hàng rong | `pedlar-quyen.png` | NPC Pins | M3 | spec |
| 80 | NPC 19: Mã Trà sư | `tea-ma.png` | NPC Pins | M3 | spec |
| 81 | NPC 20: Yến Thợ may | `tailor-yen.png` | NPC Pins | M3 | spec |
| 82 | NPC 21: Lan Tiền bối | `senior-lan.png` | NPC Pins | M3 | spec |
| 83 | NPC 22: Ánh Quản sự | `keeper-anh.png` | NPC Pins | M3 | spec |
| 84 | NPC 23: Thiện Lão tăng | `monk-thien.png` | NPC Pins | M3 | spec |
| 85 | NPC 24: Đan Dược sư | `herbalist-dan.png` | NPC Pins | M3 | spec |
| 86 | NPC 25: Huệ Thảo dược phu | `gatherer-hue.png` | NPC Pins | M3 | spec |
| 87 | NPC 26: Hiển Đánh xe bò | `ox-cart-hien.png` | NPC Pins | M3 | spec |
| 88 | NPC 27: Bổng Tiều phu | `woodcutter-bong.png` | NPC Pins | M3 | spec |
| 89 | NPC 28: Ba Kẻ tha hương | `exile-ba.png` | NPC Pins | M3 | spec |
| 90 | NPC 29: Diệm Pháp sư trừ tà | `exorcist-diem.png` | NPC Pins | M3 | spec |
| 91 | NPC 30: Tiên hạc linh điểu | `crane-spirit.png` | NPC Pins | M3 | spec |
| 92 | NPC 31: Lan Thảo dược nương | `herbalist-lan.png` | NPC Pins | M4 | spec |
| 93 | NPC 32: Diệp Kiếm khách | `swordsman-diep.png` | NPC Pins | M4 | spec |
| 94 | NPC 33: Như Khổ hạnh tăng | `monk-nhu.png` | NPC Pins | M4 | spec |
| 95 | NPC 34: Tiêu Môi giới | `broker-tieu.png` | NPC Pins | M4 | spec |
| 96 | NPC 35: Yến Ngư phủ | `fisher-yen.png` | NPC Pins | M4 | spec |
| 97 | NPC 36: Bách Kẻ săn cổ vật | `relic-hunter-bach.png` | NPC Pins | M4 | spec |
| 98 | NPC 37: Lệ Ngự thú sư | `beast-tamer-le.png` | NPC Pins | M4 | spec |
| 99 | NPC 38: Ánh Đệ tử Thiên Thanh Các | `pavilion-disciple-anh.png` | NPC Pins | M4 | spec |
| 100 | NPC 39: Phong Lãng khách | `wandering-blade-phong.png` | NPC Pins | M4 | spec |
| 101 | NPC 40: Nhật Tán tu bí ẩn | `rogue-cultivator-nhat.png` | NPC Pins | M4 | spec |
| 102 | NPC 41: Thìn Người làm vườn | `gardener-thin.png` | NPC Pins | M4 | spec |
| 103 | NPC 42: Hoán Chủ trì đấu giá | `auctioneer-hoan.png` | NPC Pins | M4 | spec |
| 104 | NPC 43: Tín Chưởng quỹ tiền trang | `banker-tin.png` | NPC Pins | M4 | spec |
| 105 | NPC 44: Viễn Dược viên chủ | `gardener-vien.png` | NPC Pins | M4 | spec |
| 106 | NPC 45: Oanh Thợ nuôi ong | `beekeeper-oanh.png` | NPC Pins | M4 | spec |
| 107 | NPC 46: Thư Thủ thư cổ tịch | `archivist-thu.png` | NPC Pins | M4 | spec |
| 108 | NPC 47: Quang Trọng tài lôi đài | `judge-quang.png` | NPC Pins | M4 | spec |
| 109 | NPC 48: Hắc Thuần thú phu | `tamer-hac.png` | NPC Pins | M4 | spec |
| 110 | NPC 49: Mỹ Linh âm ca cơ | `beast-singer-my.png` | NPC Pins | M4 | spec |
| 111 | NPC 50: Cửu Tro tàn tế tư | `ash-priest-cuu.png` | NPC Pins | M4 | spec |
| 112 | NPC 51: Trà Kẻ thu thập tên tuổi | `name-collector-tra.png` | NPC Pins | M4 | spec |
| 113 | NPC 52: Băng Ẩn sĩ tuyết sơn | `ice-hermit-bang.png` | NPC Pins | M4 | spec |
| 114 | NPC 53: Hàn Tuyết vệ binh | `snow-guard-han.png` | NPC Pins | M4 | spec |
| 115 | NPC 54: Dương Trưởng thương đoàn sa mạc | `caravan-duong.png` | NPC Pins | M4 | spec |
| 116 | NPC 55: Sa Người dẫn đường cồn cát | `dune-guide-sa.png` | NPC Pins | M4 | spec |
| 117 | NPC 56: Trang Quản hồ trăng | `lake-keeper-trang.png` | NPC Pins | M4 | spec |
| 118 | NPC 57: Cầu Người lái đò | `ferryman-cau.png` | NPC Pins | M4 | spec |
| 119 | NPC 58: Lực Đổ phường đổ thánh | `dice-master-luc.png` | NPC Pins | M4 | spec |
| 120 | NPC 59: Mẫn Người bán bản đồ | `map-seller-man.png` | NPC Pins | M4 | spec |
| 121 | NPC 60: Khuê Thợ khắc trận đồ | `ward-carver-khue.png` | NPC Pins | M4 | spec |

Total Inventoried Features: 121 / 121 (All mapped to M1, M2, M3, or M4).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | Test & Pipeline Infrastructure | `scripts/process-ui-icon.mjs`, `scripts/verify-ui-icons.mjs`, `TEST_INFRA.md`, `TEST_READY.md` | none | DONE |
| M1 | UI Core & Environment Pins | 38 files: 6 LeftRail tabs, 4 Attrs, 3 HUD bars, 9 Danger pins, 16 Exit pins | M0 | DONE |
| M2 | Map Event Pins | 23 files in `src/assets/art/pins/event/` | M0 | DONE |
| M3 | NPC Map Pins (Batch 1) | 30 files in `src/assets/art/pins/npc/` (items 1–30) | M0 | DONE |
| M4 | NPC Map Pins (Batch 2) | 30 files in `src/assets/art/pins/npc/` (items 31–60) | M0 | DONE |
| M5 | Full Verification, Adversarial Hardening & Forensic Integrity Gate | Verification check (121/121), Reviewer, Challenger, and Forensic Auditor verification | M1, M2, M3, M4 | BLOCKED (upstream AI quota 429 until 2026-09-08T02:45:30Z for 20 NPC icons; 101/121 assets complete & verified) |

## Interface Contracts
### `scripts/process-ui-icon.mjs`
- Function: `processRawIconToStandardPng(inputPath, outputPath)`
- Input: Absolute or relative path to raw JPEG image from `generate_image`.
- Output: 128×128 PNG written to `outputPath`, alpha channel = 0 on background, centered, inner box 104×104.
- Return: Promise<{ success: boolean, outputPath: string }>

### `scripts/verify-ui-icons.mjs`
- Invocation: `node scripts/verify-ui-icons.mjs`
- Exit Code: 0 on all 121 valid, 1 on any missing, wrong dimension, or missing alpha transparency.
- Output: Structured console report showing per-category and total pass/fail status.

## Code Layout
```
src/assets/art/
├── tabs/             # 6 files (LeftRail navigation tabs)
├── attrs/            # 4 files (Tứ Tượng character attributes)
├── hud/              # 3 files (HP, Qi, Cultivation status bars)
└── pins/
    ├── danger/       # 9 files (Map danger markers)
    ├── exit/         # 16 files (Map exit / zone transitions)
    ├── event/        # 23 files (Map points of interest / events)
    └── npc/          # 60 files (NPC character map pins)

scripts/
├── process-ui-icon.mjs  # Sharp post-processing & alpha matting module
└── verify-ui-icons.mjs   # Automated 121-icon verification test runner
```
