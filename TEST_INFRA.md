# UI Icon Shortfall — Test Infrastructure & Verification Architecture

## 1. Test Philosophy & Principles

The UI Icon Shortfall project introduces 121 production-grade graphical UI icons replacing legacy Chinese Hanzi glyph placeholders across the game interface. The test infrastructure establishes an uncompromising automated Quality Gate to ensure that every asset delivered meets the exact technical and aesthetic specifications of the game engine.

### Core Principles

1. **Progressive Testability**:
   - The test infrastructure is designed to test assets progressively as they are delivered across milestones (M1 through M4).
   - The verification runner evaluates each category independently and aggregates totals, enabling workers to check sub-batches or the full suite.

2. **Dual-Layer Verification (Zero Facades)**:
   - **Tier 1 (Binary Parser)**: Reads raw PNG chunks directly from the disk byte buffer without third-party decoding libraries to verify PNG signature, `IHDR` width/height (128×128), and PNG colorType headers.
   - **Tier 2 (Deep Pixel Audit)**: Decodes raw pixel buffers via `sharp` to verify true alpha transparency, corner transparency, transparency ratio, and outer perimeter margins.
   - No mock assertions, hardcoded passes, or superficial file checks are used.

3. **Adversarial Hardening**:
   - Prevents common AI generation failure modes:
     - Non-transparent / solid backgrounds (e.g. pure white or colored backgrounds produced by AI models).
     - Ghost images / faint traces (over 98% transparent).
     - Oversized subjects bleeding to the canvas edge (margin violation / clipping).
     - Dirty corners caused by incomplete background matting.
     - Dimension mismatches (e.g. raw 1024×1024 or unscaled crops).

---

## 2. Complete Feature Inventory (121 Assets across 7 Categories)

| # | Filename | Category | Target Directory | Description / Concept | Accent Color |
|---|----------|----------|------------------|-----------------------|--------------|
| **1–60: NPC Pins (60 files)** | | `src/assets/art/pins/npc/` | | Son đỏ `oklch(48% 0.18 25)` (`#AC1922`) |
| 1 | `elder-meihua.png` | NPC Pins | `src/assets/art/pins/npc/` | Cụ Mai Hoa (Cành mai hoa + gậy tre) | Son đỏ |
| 2 | `storyteller-ngo.png` | NPC Pins | `src/assets/art/pins/npc/` | Ngo kể chuyện (Quạt xếp mở) | Son đỏ |
| 3 | `merchant-bao.png` | NPC Pins | `src/assets/art/pins/npc/` | Thương nhân Bảo (Bàn tính gỗ) | Son đỏ |
| 4 | `hermit-coc.png` | NPC Pins | `src/assets/art/pins/npc/` | Cốc chủ Cốc (Hồ lô + hang đá) | Son đỏ |
| 5 | `rival-khoa.png` | NPC Pins | `src/assets/art/pins/npc/` | Sư đệ Khoa (Hai kiếm chéo + búi tóc) | Son đỏ |
| 6 | `master-vo.png` | NPC Pins | `src/assets/art/pins/npc/` | Võ Trưởng Sư (Kiếm dài + râu bạc) | Son đỏ |
| 7 | `lost-soul-ha.png` | NPC Pins | `src/assets/art/pins/npc/` | Vong hồn Hà (Đốm lửa ma lập lòe) | Son đỏ |
| 8 | `innkeeper-hanh.png` | NPC Pins | `src/assets/art/pins/npc/` | Chủ quán Hạnh (Cờ quán rượu + vò) | Son đỏ |
| 9 | `alchemist-sam.png` | NPC Pins | `src/assets/art/pins/npc/` | Luyện dược Sâm (Lò đan khói bay) | Son đỏ |
| 10 | `hunter-son.png` | NPC Pins | `src/assets/art/pins/npc/` | Thợ săn Sơn (Cung + lông chim) | Son đỏ |
| 11 | `guard-truong.png` | NPC Pins | `src/assets/art/pins/npc/` | Dân binh Trường (Giáo + mũ trụ) | Son đỏ |
| 12 | `kid-xiaobao.png` | NPC Pins | `src/assets/art/pins/npc/` | Tiểu Bảo (Con diều giấy) | Son đỏ |
| 13 | `farmer-tu.png` | NPC Pins | `src/assets/art/pins/npc/` | Nông phu Tư (Nón lá + cái cày) | Son đỏ |
| 14 | `fortune-lien.png` | NPC Pins | `src/assets/art/pins/npc/` | Bà đồng Liên (Ống quẻ + thẻ tre) | Son đỏ |
| 15 | `cook-phung.png` | NPC Pins | `src/assets/art/pins/npc/` | Đầu bếp Phụng (Chảo lửa + hơi) | Son đỏ |
| 16 | `smith-duc.png` | NPC Pins | `src/assets/art/pins/npc/` | Thợ rèn Đức (Búa + đe) | Son đỏ |
| 17 | `scholar-minh.png` | NPC Pins | `src/assets/art/pins/npc/` | Học giả Minh (Cuộn thư + bút lông) | Son đỏ |
| 18 | `pedlar-quyen.png` | NPC Pins | `src/assets/art/pins/npc/` | Hàng rong Quyền (Đòn gánh + hai giỏ) | Son đỏ |
| 19 | `tea-ma.png` | NPC Pins | `src/assets/art/pins/npc/` | Bà Ma trà quán (Chén trà có vung) | Son đỏ |
| 20 | `tailor-yen.png` | NPC Pins | `src/assets/art/pins/npc/` | Thợ may Yến (Kim + chỉ + vải) | Son đỏ |
| 21 | `senior-lan.png` | NPC Pins | `src/assets/art/pins/npc/` | Sư tỷ Lan (Kiếm tua + trâm cài) | Son đỏ |
| 22 | `keeper-anh.png` | NPC Pins | `src/assets/art/pins/npc/` | Quản kho Ánh (Chuỗi chìa khóa) | Son đỏ |
| 23 | `monk-thien.png` | NPC Pins | `src/assets/art/pins/npc/` | Sa môn Thiện (Chuỗi tràng + mõ) | Son đỏ |
| 24 | `herbalist-dan.png` | NPC Pins | `src/assets/art/pins/npc/` | Dược sư Đàn (Cân thuốc + thảo mộc) | Son đỏ |
| 25 | `gatherer-hue.png` | NPC Pins | `src/assets/art/pins/npc/` | Thợ hái Huệ (Giỏ tre + liềm) | Son đỏ |
| 26 | `ox-cart-hien.png` | NPC Pins | `src/assets/art/pins/npc/` | Phu xe Hiền (Bánh xe bò) | Son đỏ |
| 27 | `woodcutter-bong.png` | NPC Pins | `src/assets/art/pins/npc/` | Tiều phu Bồng (Rìu + củi đẵn) | Son đỏ |
| 28 | `exile-ba.png` | NPC Pins | `src/assets/art/pins/npc/` | Kẻ lưu đày Bá (Gông cùm nứt) | Son đỏ |
| 29 | `exorcist-diem.png` | NPC Pins | `src/assets/art/pins/npc/` | Trừ tà Diễm (Kiếm đào + bùa) | Son đỏ |
| 30 | `crane-spirit.png` | NPC Pins | `src/assets/art/pins/npc/` | Linh hạc (Lông hạc trắng) | Son đỏ |
| 31 | `herbalist-lan.png` | NPC Pins | `src/assets/art/pins/npc/` | Dược nương Lan (Lan lá thuốc) | Son đỏ |
| 32 | `swordsman-diep.png` | NPC Pins | `src/assets/art/pins/npc/` | Kiếm khách Diệp (Kiếm + nón sa mạc) | Son đỏ |
| 33 | `monk-nhu.png` | NPC Pins | `src/assets/art/pins/npc/` | Tăng nhân Như (Sen tuyết + tích trượng) | Son đỏ |
| 34 | `broker-tieu.png` | NPC Pins | `src/assets/art/pins/npc/` | Kinh kỷ Tiêu (Khế ước + dấu triện) | Son đỏ |
| 35 | `fisher-yen.png` | NPC Pins | `src/assets/art/pins/npc/` | Ngư ông Yến (Cần câu + trăng dưới nước) | Son đỏ |
| 36 | `relic-hunter-bach.png` | NPC Pins | `src/assets/art/pins/npc/` | Đạo nhân Bạch (Đèn + mảnh cổ vật) | Son đỏ |
| 37 | `beast-tamer-le.png` | NPC Pins | `src/assets/art/pins/npc/` | Ngự thú sư Lê (Sừng gọi thú + dây) | Son đỏ |
| 38 | `pavilion-disciple-anh.png` | NPC Pins | `src/assets/art/pins/npc/` | Đệ tử Ánh (Bài bội bài các) | Son đỏ |
| 39 | `wandering-blade-phong.png` | NPC Pins | `src/assets/art/pins/npc/` | Phiêu kiếm Phong (Kiếm quấn vải) | Son đỏ |
| 40 | `rogue-cultivator-nhat.png` | NPC Pins | `src/assets/art/pins/npc/` | Tán tu Nhất (Kiếm gãy + bí kíp giấu) | Son đỏ |
| 41 | `gardener-thin.png` | NPC Pins | `src/assets/art/pins/npc/` | Cụ ông Thìn (Cành mai phai mờ) | Son đỏ |
| 42 | `auctioneer-hoan.png` | NPC Pins | `src/assets/art/pins/npc/` | Đấu giá sư Hoàn (Búa đấu giá) | Son đỏ |
| 43 | `banker-tin.png` | NPC Pins | `src/assets/art/pins/npc/` | Chủ cầm đồ Tín (Bảng cầm đồ + cân) | Son đỏ |
| 44 | `gardener-vien.png` | NPC Pins | `src/assets/art/pins/npc/` | Giữ vườn Viên (Cây mầm + bình tưới) | Son đỏ |
| 45 | `beekeeper-oanh.png` | NPC Pins | `src/assets/art/pins/npc/` | Bà Oanh nuôi ong (Thìa mật + ong) | Son đỏ |
| 46 | `archivist-thu.png` | NPC Pins | `src/assets/art/pins/npc/` | Thủ thư Thu (Rương sách vân mây) | Son đỏ |
| 47 | `judge-quang.png` | NPC Pins | `src/assets/art/pins/npc/` | Chánh án Quang (Búa phán + cán cân) | Son đỏ |
| 48 | `tamer-hac.png` | NPC Pins | `src/assets/art/pins/npc/` | Ngự thú sư Hạc (Lồng thú + sáo) | Son đỏ |
| 49 | `beast-singer-my.png` | NPC Pins | `src/assets/art/pins/npc/` | Hát thú My (Tiêu + tai thú) | Son đỏ |
| 50 | `ash-priest-cuu.png` | NPC Pins | `src/assets/art/pins/npc/` | Tư tế Cửu (Bình tro + xương) | Son đỏ |
| 51 | `name-collector-tra.png` | NPC Pins | `src/assets/art/pins/npc/` | Sưu tập tên Trà (Bài vị không chữ) | Son đỏ |
| 52 | `ice-hermit-bang.png` | NPC Pins | `src/assets/art/pins/npc/` | Ẩn sĩ Băng (Băng tinh + râu đóng băng) | Son đỏ |
| 53 | `snow-guard-han.png` | NPC Pins | `src/assets/art/pins/npc/` | Vệ binh Hàn (Giáo + áo lông) | Son đỏ |
| 54 | `caravan-duong.png` | NPC Pins | `src/assets/art/pins/npc/` | Thủ lĩnh Dương (Cờ đoàn xe) | Son đỏ |
| 55 | `dune-guide-sa.png` | NPC Pins | `src/assets/art/pins/npc/` | Hướng dẫn Sa (La bàn + cát chảy) | Son đỏ |
| 56 | `lake-keeper-trang.png` | NPC Pins | `src/assets/art/pins/npc/` | Người giữ hồ Trang (Đèn hồ + lưới) | Son đỏ |
| 57 | `ferryman-cau.png` | NPC Pins | `src/assets/art/pins/npc/` | Người chở đò Câu (Sào chống + thuyền con) | Son đỏ |
| 58 | `dice-master-luc.png` | NPC Pins | `src/assets/art/pins/npc/` | Bậc thầy Lục (Đĩa + hai viên xúc xắc) | Son đỏ |
| 59 | `map-seller-man.png` | NPC Pins | `src/assets/art/pins/npc/` | Bán bản đồ Mẫn (Cuộn bản đồ + la bàn) | Son đỏ |
| 60 | `ward-carver-khue.png` | NPC Pins | `src/assets/art/pins/npc/` | Thợ khắc Khuê (Đục + tấm phù) | Son đỏ |
| **61–83: Event Pins (23 files)** | | `src/assets/art/pins/event/` | | Ngọc lam `oklch(56% 0.10 175)` (`#178771`) |
| 61 | `bamboo-rampart.png` | Event Pins | `src/assets/art/pins/event/` | Lũy tre xanh làng | Ngọc lam |
| 62 | `old-house.png` | Event Pins | `src/assets/art/pins/event/` | Nhà cũ của ngươi | Ngọc lam |
| 63 | `village-well.png` | Event Pins | `src/assets/art/pins/event/` | Giếng làng cổ tích | Ngọc lam |
| 64 | `fortune-wheel.png` | Event Pins | `src/assets/art/pins/event/` | Quầy quay vận mệnh | Ngọc lam |
| 65 | `tea-house.png` | Event Pins | `src/assets/art/pins/event/` | Trà quán nghe chuyện | Ngọc lam |
| 66 | `arena.png` | Event Pins | `src/assets/art/pins/event/` | Diễn võ trường | Ngọc lam |
| 67 | `treasure-pavilion.png` | Event Pins | `src/assets/art/pins/event/` | Tàng vật các | Ngọc lam |
| 68 | `meditation-wall.png` | Event Pins | `src/assets/art/pins/event/` | Vách tĩnh tâm | Ngọc lam |
| 69 | `herb-terrace.png` | Event Pins | `src/assets/art/pins/event/` | Ruộng linh thảo | Ngọc lam |
| 70 | `fog-crossroads.png` | Event Pins | `src/assets/art/pins/event/` | Ngã ba sương dày | Ngọc lam |
| 71 | `cloud-nest.png` | Event Pins | `src/assets/art/pins/event/` | Tổ lông mây | Ngọc lam |
| 72 | `wind-bell.png` | Event Pins | `src/assets/art/pins/event/` | Chuông phong vân | Ngọc lam |
| 73 | `nameless-stele.png` | Event Pins | `src/assets/art/pins/event/` | Bia đá vô danh | Ngọc lam |
| 74 | `wind-cliff.png` | Event Pins | `src/assets/art/pins/event/` | Vách gió kể chuyện | Ngọc lam |
| 75 | `herb-garden.png` | Event Pins | `src/assets/art/pins/event/` | Vườn sương dược | Ngọc lam |
| 76 | `dry-oasis.png` | Event Pins | `src/assets/art/pins/event/` | Ốc đảo cạn | Ngọc lam |
| 77 | `ice-mirror.png` | Event Pins | `src/assets/art/pins/event/` | Băng kính thiên quang | Ngọc lam |
| 78 | `auction-stall.png` | Event Pins | `src/assets/art/pins/event/` | Sạp bán đấu giá | Ngọc lam |
| 79 | `caravan-teahouse.png` | Event Pins | `src/assets/art/pins/event/` | Trà lều hành thương | Ngọc lam |
| 80 | `moon-water.png` | Event Pins | `src/assets/art/pins/event/` | Mặt nước phản nguyệt | Ngọc lam |
| 81 | `lotus-pond.png` | Event Pins | `src/assets/art/pins/event/` | Bãi sen đêm | Ngọc lam |
| 82 | `broken-stele.png` | Event Pins | `src/assets/art/pins/event/` | Bia văn đổ vỡ | Ngọc lam |
| 83 | `cloud-library.png` | Event Pins | `src/assets/art/pins/event/` | Tàng thư vân các | Ngọc lam |
| **84–92: Danger Pins (9 files)** | | `src/assets/art/pins/danger/` | | Huyết đỏ `oklch(48% 0.18 25)` (`#AC1922`) |
| 84 | `bee-nest.png` | Danger Pins | `src/assets/art/pins/danger/` | Tổ ong linh | Huyết đỏ |
| 85 | `wolf-tracks.png` | Danger Pins | `src/assets/art/pins/danger/` | Dấu chân lang yêu | Huyết đỏ |
| 86 | `cracked-seal.png` | Danger Pins | `src/assets/art/pins/danger/` | Phong ấn nứt vỡ | Huyết đỏ |
| 87 | `rift-core.png` | Danger Pins | `src/assets/art/pins/danger/` | Hạch tâm khe nứt | Huyết đỏ |
| 88 | `hive-hollow.png` | Danger Pins | `src/assets/art/pins/danger/` | Hốc ong linh | Huyết đỏ |
| 89 | `storm-eye.png` | Danger Pins | `src/assets/art/pins/danger/` | Mắt bão hắc phong | Huyết đỏ |
| 90 | `ice-fissure.png` | Danger Pins | `src/assets/art/pins/danger/` | Khe băng thở sương | Huyết đỏ |
| 91 | `bone-altar.png` | Danger Pins | `src/assets/art/pins/danger/` | Tế đàn tro xương | Huyết đỏ |
| 92 | `claw-rock.png` | Danger Pins | `src/assets/art/pins/danger/` | Đá vuốt linh thú | Huyết đỏ |
| **93–108: Exit Pins (16 files)** | | `src/assets/art/pins/exit/` | | Hoàng kim `oklch(78% 0.13 85)` (`#DDB049`) |
| 93 | `village.png` | Exit Pins | `src/assets/art/pins/exit/` | Làng khởi đầu (Thôn + cây đa) | Hoàng kim |
| 94 | `market.png` | Exit Pins | `src/assets/art/pins/exit/` | Chợ phiên (Cổng chợ + cờ) | Hoàng kim |
| 95 | `sect.png` | Exit Pins | `src/assets/art/pins/exit/` | Tông môn (Cổng sơn môn + bậc đá) | Hoàng kim |
| 96 | `herb-field.png` | Exit Pins | `src/assets/art/pins/exit/` | Ruộng dược thảo (Ruộng bậc thang) | Hoàng kim |
| 97 | `misty-forest.png` | Exit Pins | `src/assets/art/pins/exit/` | Rừng sương mù (Sương + thông) | Hoàng kim |
| 98 | `sealed-cave.png` | Exit Pins | `src/assets/art/pins/exit/` | Hang động phong ấn (Hang + phù ấn) | Hoàng kim |
| 99 | `cursed-rift.png` | Exit Pins | `src/assets/art/pins/exit/` | Khe nứt nguyền rủa (Khí đen) | Hoàng kim |
| 100 | `cloud-peak.png` | Exit Pins | `src/assets/art/pins/exit/` | Đỉnh mây mù (Đài trên đỉnh núi) | Hoàng kim |
| 101 | `thousand-herbs-valley.png` | Exit Pins | `src/assets/art/pins/exit/` | Thung lũng vạn thảo | Hoàng kim |
| 102 | `blackwind-dunes.png` | Exit Pins | `src/assets/art/pins/exit/` | Cồn cát hắc phong (Cồn cát + lốc) | Hoàng kim |
| 103 | `frozen-peak.png` | Exit Pins | `src/assets/art/pins/exit/` | Đỉnh núi băng | Hoàng kim |
| 104 | `wandering-market.png` | Exit Pins | `src/assets/art/pins/exit/` | Chợ du mục (Lều + lạc đà) | Hoàng kim |
| 105 | `moon-lake.png` | Exit Pins | `src/assets/art/pins/exit/` | Hồ trăng (Hồ + trăng tròn) | Hoàng kim |
| 106 | `bone-ash-ruins.png` | Exit Pins | `src/assets/art/pins/exit/` | Tàn tích tro cốt (Cổ tích + xương) | Hoàng kim |
| 107 | `spirit-beast-ridge.png` | Exit Pins | `src/assets/art/pins/exit/` | Dãy núi linh thú (Dấu thú) | Hoàng kim |
| 108 | `azure-pavilion.png` | Exit Pins | `src/assets/art/pins/exit/` | Thiên thanh các (Mái lầu xanh) | Hoàng kim |
| **109–114: LeftRail Tabs (6 files)** | | `src/assets/art/tabs/` | | Mực tàu / Ngọc lam active (`#178771`) |
| 109 | `people.png` | LeftRail Tabs | `src/assets/art/tabs/` | Nhân sĩ / Mối quan hệ (2 bóng người) | Ngọc lam active |
| 110 | `vital.png` | LeftRail Tabs | `src/assets/art/tabs/` | Khí huyết / Sinh mệnh (Huyệt vị + khí) | Ngọc lam active |
| 111 | `items.png` | LeftRail Tabs | `src/assets/art/tabs/` | Hành trang / Túi đồ (Túi càn khôn) | Ngọc lam active |
| 112 | `market.png` | LeftRail Tabs | `src/assets/art/tabs/` | Phố thị / Chợ (Cân đĩa + tiền) | Ngọc lam active |
| 113 | `path.png` | LeftRail Tabs | `src/assets/art/tabs/` | Đạo lộ / Bản đồ (Đường uốn + núi) | Ngọc lam active |
| 114 | `system.png` | LeftRail Tabs | `src/assets/art/tabs/` | Hệ thống / Thiết lập (Cuộn khế ước) | Ngọc lam active |
| **115–118: Tứ Tượng Attrs (4 files)** | | `src/assets/art/attrs/` | | Hoàng kim `oklch(78% 0.13 85)` (`#DDB049`) |
| 115 | `charm.png` | Tứ Tượng Attrs | `src/assets/art/attrs/` | THẦN (神) Mị lực (Mắt phượng + quầng) | Hoàng kim |
| 116 | `mind.png` | Tứ Tượng Attrs | `src/assets/art/attrs/` | TÂM (心) Ngộ tính (Trái tim mây) | Hoàng kim |
| 117 | `body.png` | Tứ Tượng Attrs | `src/assets/art/attrs/` | MẠCH (脈) Thể chất (Mạch cổ tay + khí) | Hoàng kim |
| 118 | `luck.png` | Tứ Tượng Attrs | `src/assets/art/attrs/` | VẬN (運) May mắn (Đồng xu + sao) | Hoàng kim |
| **119–121: HUD Bars (3 files)** | | `src/assets/art/hud/` | | Phân loại theo thanh trạng thái |
| 119 | `hp.png` | HUD Bars | `src/assets/art/hud/` | Sinh lực / HP (Bình ngọc đỏ + hơi) | Son đỏ (`#AC1922`) |
| 120 | `qi.png` | HUD Bars | `src/assets/art/hud/` | Linh khí / Qi (Xoáy khí xanh) | Ngọc lam (`#178771`) |
| 121 | `cultivation.png` | HUD Bars | `src/assets/art/hud/` | Tu vi (Sen nở từ bùn) | Hoàng kim (`#DDB049`) |

---

## 3. Test Architecture & Verification Logic

```
                     ┌───────────────────────────────────┐
                     │ scripts/verify-ui-icons.mjs       │
                     │ Scan 121 items across 7 categories│
                     └─────────────────┬─────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────────────┐             ┌───────────────────────────────────┐
│ Tier 1: Binary Chunk Parsing  │             │ Tier 2: Sharp Deep Pixel Audit    │
├───────────────────────────────┤             ├───────────────────────────────────┤
│ • PNG Signature: 8-byte magic │             │ • Corner Alpha: (0,0), (127,0),   │
│ • IHDR Chunk: 128x128 exact   │             │   (0,127), (127,127) === 0        │
│ • Bit Depth: 8-bit            │             │ • Transparency Ratio: 15% - 98%   │
│ • ColorType: RGBA (6),        │             │ • Margin Check: Outer 1px         │
│   Gray+Alpha (4), or          │             │   perimeter strictly transparent  │
│   Palette (3) + tRNS chunk    │             │   (enforcing ~10% padding)        │
└───────────────────────────────┘             └───────────────────────────────────┘
            │                                                     │
            └──────────────────────────┬──────────────────────────┘
                                       │
                                       ▼
                        ┌───────────────────────────────┐
                        │ Quality Gate Decision         │
                        │ Exit 0 (PASS) / Exit 1 (FAIL) │
                        └───────────────────────────────┘
```

### Tier 1: Binary Validation Specifications
- **Magic Bytes**: `89 50 4E 47 0D 0A 1A 0A` (hex signature).
- **Chunk Name**: Offset 12..16 must be ASCII string `'IHDR'`.
- **Dimensions**: Big-endian uint32 at offset 16 must equal `128`, and offset 20 must equal `128`.
- **Transparency Header**:
  - ColorType 6 (RGBA Truecolor with alpha) or ColorType 4 (Grayscale with alpha).
  - Or ColorType 3 (Indexed color) provided a valid `tRNS` chunk exists in the file structure.

### Tier 2: Deep Pixel Validation Specifications
- **Corner Transparency**:
  $$(0,0), (127,0), (0,127), (127,127) \implies \text{alpha} = 0$$
  Guarantees that no background matte, frame border, or rectangular artifacts persist at the icon boundary.
- **Transparency Ratio Threshold**:
  $$15\% \le \frac{\text{Count}(\text{alpha} = 0)}{16384} \times 100 \le 98\%$$
  - $< 15\%$: Image has a solid or insufficiently removed background (`SOLID_BACKGROUND` or `INSUFFICIENT_TRANSPARENCY`).
  - $> 98\%$: Image is an empty ghost canvas (`IMAGE_EMPTY_OR_GHOST`).
- **Margin & Perimeter Integrity**:
  Every pixel on the outermost border ($y = 0$, $y = 127$, $x = 0$, $x = 127$) must have $\text{alpha} = 0$.
  Prevents subjects from bleeding into the canvas edge, enforcing the required ~10% (~12px) margin.

---

## 4. Shared Post-Processing Module (`scripts/process-ui-icon.mjs`)

Because generative AI models (`generate_image`) output RGB JPEGs on white paper backgrounds (1024×1024), the shared post-processing helper transforms them deterministically:

1. **Alpha Matting & Un-premultiplying**:
   - Computes $min(R,G,B)$ and saturation $\max(R,G,B) - \min(R,G,B)$.
   - White paper background ($\min \ge 244$, saturation $< 15$): $\alpha = 0$.
   - Antialiased ink feather zone ($210 < \min < 244$, saturation $< 25$): computes un-premultiplied color:
     $$C_{\text{clean}} = \text{clamp}\left(\frac{C_{\text{source}} - 255 \times (1 - \alpha_{\text{norm}})}{\alpha_{\text{norm}}}, 0, 255\right)$$
   - Foreground ink strokes: $\alpha = 255$.
2. **Bounding Box Trim**:
   - Trims transparent outer empty space using `sharp.trim()`.
3. **Lanczos3 Resampling**:
   - Scales the trimmed subject inside a $104 \times 104$ bounding box (`fit: 'inside'`, `kernel: 'lanczos3'`).
4. **Centered Composite on 128×128 Transparent Canvas**:
   - Composites centered on a $128 \times 128$ RGBA canvas with alpha $= 0$, leaving exactly $12\text{px}$ margin on each side ($9.38\% \approx 10\%$).
5. **Compression**:
   - Writes optimized PNG with compression level 9.

### Module Interface Contract
```typescript
interface ProcessResult {
  success: boolean;
  outputPath: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export function processRawIconToStandardPng(
  inputPath: string,
  outputPath: string
): Promise<ProcessResult>;
```

---

## 5. Usage Commands

### Execute Full Verification
```powershell
node scripts/verify-ui-icons.mjs
```
- **Exit Code 0**: All 121 icons present and valid.
- **Exit Code 1**: Any icon missing, wrong dimension, non-transparent, or violating margin constraints.

### Process Raw AI Icon via CLI
```powershell
node scripts/process-ui-icon.mjs <path/to/raw-artifact.jpg> <path/to/target.png>
```

### Import in Worker Subagents
```javascript
import { processRawIconToStandardPng } from '../scripts/process-ui-icon.mjs';
import { verifyFile } from '../scripts/verify-ui-icons.mjs';

await processRawIconToStandardPng('raw-ai-art.jpg', 'src/assets/art/pins/npc/elder-meihua.png');
const check = await verifyFile('src/assets/art/pins/npc/elder-meihua.png');
if (!check.ok) {
  console.error('Validation failed:', check.error);
}
```
