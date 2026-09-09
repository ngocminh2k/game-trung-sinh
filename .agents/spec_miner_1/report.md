# UI Icon Shortfall Specification Mining Report

**Date:** 2026-09-08  
**Author:** Spec Miner 1  
**Authoritative Sources:**  
- `docs/agent-work/asset-requests/ui-icon-shortfall-2026-09-08.md`  
- `.agents/ORIGINAL_REQUEST.md`  
- `.impeccable.md`  
- `src/content/locations.ts`  
- `src/ui/ProtoShell.tsx`  
- `src/ui/LeftRailTabContent.tsx`  

---

## Executive Summary

The project requires producing **121 unique UI icons** to replace placeholder Chinese characters (`人`, `事`, `凶`, `門`, `氣`, `囊`, `市`, `道`, `契`, `神`, `心`, `脈`, `運`) across map pins, navigation tabs, attribute seals, and HUD status bars. Existing assets (60 full-body NPC portraits, 16 location full illustrations, 87 item icons, 11 player action poses) are already complete and must NOT be recreated.

All 121 new icons must adhere strictly to a 128×128 pixel resolution in PNG format with a fully transparent alpha background, following an authentic Vietnamese/East-Asian ink-wash aesthetic (*mực tàu giấy bản*) with category-specific color accents.

---

## 1. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Map Pins (NPC) | 60 Unique NPC Pins | Individual profession/role symbol for each of the 60 NPCs on map | NPC ID & profession concept | 128×128 PNG, transparent, vermilion accent | Fallback to glyph `人` if asset unrendered | `ui-icon-shortfall-2026-09-08.md` §1 |
| 2 | Map Pins (Event) | 23 Event Node Pins | Symbolic iconography representing map event nodes | Node slug & contextual name | 128×128 PNG, transparent, turquoise accent | Fallback to glyph `事` if asset unrendered | `ui-icon-shortfall-2026-09-08.md` §2 |
| 3 | Map Pins (Danger) | 9 Danger Node Pins | Hazard & combat threat markers on region maps | Hazard type & environment | 128×128 PNG, transparent, blood red accent | Fallback to glyph `凶` if asset unrendered | `ui-icon-shortfall-2026-09-08.md` §3 |
| 4 | Map Pins (Exit) | 16 Destination Exit Pins | Gateways connecting 30 exit pins to 16 distinct regions | Destination region identity | 128×128 PNG, transparent, golden accent | Fallback to glyph `門` if asset unrendered | `ui-icon-shortfall-2026-09-08.md` §4 |
| 5 | LeftRail Navigation | 6 Rail Tab Icons | Navigation drawer tabs replacing Chinese text glyphs | Tab identity (`people`, `vital`, `items`, etc.) | 128×128 PNG, transparent, ink with turquoise active | Fallback to glyphs `人 氣 囊 市 道 契` | `ui-icon-shortfall-2026-09-08.md` §5 |
| 6 | Player Attributes | 4 Tứ Tượng Attribute Seals | Core cultivation stats (Thần, Tâm, Mạch, Vận) | Stat name (`charm`, `mind`, `body`, `luck`) | 128×128 PNG, transparent, golden accent | Fallback to glyphs `神 心 脈 運` | `ui-icon-shortfall-2026-09-08.md` §6 |
| 7 | HUD Bars | 3 Status Bar Indicators | Vitality, energy, and progression indicators | Stat type (`hp`, `qi`, `cultivation`) | 128×128 PNG, transparent, themed accents | Missing gauge icon in status bar | `ui-icon-shortfall-2026-09-08.md` §7 |
| 8 | Asset Verification | Automated Verification Script | Headless Node.js script asserting existence, dimensions, and alpha channel | 121 asset paths | Process exit code 0 or 1, pass/fail report | Throws non-zero exit code if missing or invalid | `ORIGINAL_REQUEST.md` R4 |

---

## 2. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Map Pin Scaling | 128×128 asset rendered at 32px–48px | Overly fine ink details blur if stroke weight is too thin; ~10% padding prevents canvas boundary clipping |
| 2 | Alpha Channel Transparency | AI image generator outputs solid white `#ffffff` or black `#000000` background | Verification script detects 0 transparent pixels; UI displays ugly opaque bounding boxes over map painting |
| 3 | Modern Aesthetics Prohibitions | Generator creates 3D glossy spheres, modern gradient glows, or emojis | Clashes with project `.impeccable.md` ink-and-jade design philosophy |
| 4 | Filename Collisions | `market.png` exists in both `src/assets/art/pins/exit/` and `src/assets/art/tabs/` | Safe because they reside in segregated directories, but code loaders must qualify full directory paths |
| 5 | Dual Role Names | NPC #24 `herbalist-dan.png` vs #31 `herbalist-lan.png`, #41 `gardener-thin.png` vs #44 `gardener-vien.png` | Separate unique kebab-case filenames assigned per character to avoid collisions |
| 6 | Exit Pin Many-to-One | 30 exit pins on regional maps lead to 16 regions | Multiple map exit pins reuse the same destination exit icon (e.g. all roads to Greenwood village use `village.png`) |

---

## 3. Detailed Inventory of 121 Missing UI Icons

### 3.1. Category 1: NPC Map Pins (60 Files)
- **Target Directory:** `src/assets/art/pins/npc/`
- **Replaces Glyph:** `人` on `.pin.npc`
- **Base Style:** Ink-wash (*mực tàu giấy bản*) `oklch(18% 0.02 60)`
- **Accent Color:** Son đỏ (vermilion) `oklch(48% 0.18 25)`
- **Design Rule:** Mỗi NPC một vật biểu tượng riêng theo nghề/vai trò — không lặp lại.

| # | Filename | Target Directory | Character Name (NPC) | Profession / Role | Visual Concept | Accent Color |
|---|----------|------------------|----------------------|-------------------|----------------|--------------|
| 1 | `elder-meihua.png` | `src/assets/art/pins/npc/` | Cụ Mai Hoa | Trưởng làng | Cành mai hoa + gậy tre | Son đỏ `oklch(48% 0.18 25)` |
| 2 | `storyteller-ngo.png` | `src/assets/art/pins/npc/` | Ngo kể chuyện | Người kể chuyện | Quạt xếp mở | Son đỏ `oklch(48% 0.18 25)` |
| 3 | `merchant-bao.png` | `src/assets/art/pins/npc/` | Thương nhân Bảo | Thương nhân | Bàn tính gỗ | Son đỏ `oklch(48% 0.18 25)` |
| 4 | `hermit-coc.png` | `src/assets/art/pins/npc/` | Cốc chủ Cốc | Ẩn sĩ hang đá | Hồ lô + hang đá | Son đỏ `oklch(48% 0.18 25)` |
| 5 | `rival-khoa.png` | `src/assets/art/pins/npc/` | Sư đệ Khoa | Sư đệ cạnh tranh | Hai kiếm chéo + búi tóc | Son đỏ `oklch(48% 0.18 25)` |
| 6 | `master-vo.png` | `src/assets/art/pins/npc/` | Võ Trưởng Sư | Trưởng sư tông môn | Kiếm dài + râu bạc | Son đỏ `oklch(48% 0.18 25)` |
| 7 | `lost-soul-ha.png` | `src/assets/art/pins/npc/` | Vong hồn Hà | Vong hồn lang thang | Đốm lửa ma lập lòe | Son đỏ `oklch(48% 0.18 25)` |
| 8 | `innkeeper-hanh.png` | `src/assets/art/pins/npc/` | Chủ quán Hạnh | Chủ quán trọ | Cờ quán rượu + vò | Son đỏ `oklch(48% 0.18 25)` |
| 9 | `alchemist-sam.png` | `src/assets/art/pins/npc/` | Luyện dược Sâm | Luyện dược sư | Lò đan khói bay | Son đỏ `oklch(48% 0.18 25)` |
| 10 | `hunter-son.png` | `src/assets/art/pins/npc/` | Thợ săn Sơn | Thợ săn | Cung + lông chim | Son đỏ `oklch(48% 0.18 25)` |
| 11 | `guard-truong.png` | `src/assets/art/pins/npc/` | Dân binh Trường | Dân binh | Giáo + mũ trụ | Son đỏ `oklch(48% 0.18 25)` |
| 12 | `kid-xiaobao.png` | `src/assets/art/pins/npc/` | Tiểu Bảo | Đứa trẻ tinh nghịch | Con diều giấy | Son đỏ `oklch(48% 0.18 25)` |
| 13 | `farmer-tu.png` | `src/assets/art/pins/npc/` | Nông phu Tư | Nông phu | Nón lá + cái cày | Son đỏ `oklch(48% 0.18 25)` |
| 14 | `fortune-lien.png` | `src/assets/art/pins/npc/` | Bà đồng Liên | Bói vé số | Ống quẻ + thẻ tre | Son đỏ `oklch(48% 0.18 25)` |
| 15 | `cook-phung.png` | `src/assets/art/pins/npc/` | Đầu bếp Phụng | Đầu bếp | Chảo lửa + hơi | Son đỏ `oklch(48% 0.18 25)` |
| 16 | `smith-duc.png` | `src/assets/art/pins/npc/` | Thợ rèn Đức | Thợ rèn | Búa + đe | Son đỏ `oklch(48% 0.18 25)` |
| 17 | `scholar-minh.png` | `src/assets/art/pins/npc/` | Học giả Minh | Học giả | Cuộn thư + bút lông | Son đỏ `oklch(48% 0.18 25)` |
| 18 | `pedlar-quyen.png` | `src/assets/art/pins/npc/` | Hàng rong Quyền | Hàng rong | Đòn gánh + hai giỏ | Son đỏ `oklch(48% 0.18 25)` |
| 19 | `tea-ma.png` | `src/assets/art/pins/npc/` | Bà Ma trà quán | Bà chủ quán trà | Chén trà có vung | Son đỏ `oklch(48% 0.18 25)` |
| 20 | `tailor-yen.png` | `src/assets/art/pins/npc/` | Thợ may Yến | Thợ may | Kim + chỉ + vải | Son đỏ `oklch(48% 0.18 25)` |
| 21 | `senior-lan.png` | `src/assets/art/pins/npc/` | Sư tỷ Lan | Sư tỷ | Kiếm tua + trâm cài | Son đỏ `oklch(48% 0.18 25)` |
| 22 | `keeper-anh.png` | `src/assets/art/pins/npc/` | Quản kho Ánh | Quản lý nhà kho | Chuỗi chìa khóa | Son đỏ `oklch(48% 0.18 25)` |
| 23 | `monk-thien.png` | `src/assets/art/pins/npc/` | Sa môn Thiện | Sa môn | Chuỗi tràng + mõ | Son đỏ `oklch(48% 0.18 25)` |
| 24 | `herbalist-dan.png` | `src/assets/art/pins/npc/` | Dược sư Đàn | Dược sư ruộng thuốc | Cân thuốc + thảo mộc | Son đỏ `oklch(48% 0.18 25)` |
| 25 | `gatherer-hue.png` | `src/assets/art/pins/npc/` | Thợ hái Huệ | Thợ hái | Giỏ tre + liềm | Son đỏ `oklch(48% 0.18 25)` |
| 26 | `ox-cart-hien.png` | `src/assets/art/pins/npc/` | Xe bò Hiền | Phu xe | Bánh xe bò | Son đỏ `oklch(48% 0.18 25)` |
| 27 | `woodcutter-bong.png` | `src/assets/art/pins/npc/` | Tiều phu Bồng | Tiều phu | Rìu + củi đẵn | Son đỏ `oklch(48% 0.18 25)` |
| 28 | `exile-ba.png` | `src/assets/art/pins/npc/` | Kẻ lưu đày Bá | Kẻ lưu đày | Gông cùm nứt | Son đỏ `oklch(48% 0.18 25)` |
| 29 | `exorcist-diem.png` | `src/assets/art/pins/npc/` | Trừ tà Diễm | Trừ tà sư | Kiếm đào + bùa | Son đỏ `oklch(48% 0.18 25)` |
| 30 | `crane-spirit.png` | `src/assets/art/pins/npc/` | Tiên hạc | Linh hạc | Lông hạc trắng | Son đỏ `oklch(48% 0.18 25)` |
| 31 | `herbalist-lan.png` | `src/assets/art/pins/npc/` | Dược nương Lan | Tu sĩ Vạn Thảo Cốc | Lan lá thuốc | Son đỏ `oklch(48% 0.18 25)` |
| 32 | `swordsman-diep.png` | `src/assets/art/pins/npc/` | Kiếm khách Diệp | Tu sĩ sa mạc | Kiếm + nón sa mạc | Son đỏ `oklch(48% 0.18 25)` |
| 33 | `monk-nhu.png` | `src/assets/art/pins/npc/` | Tăng nhân Như | Tu sĩ Hàn Băng Phong | Sen tuyết + tích trượng | Son đỏ `oklch(48% 0.18 25)` |
| 34 | `broker-tieu.png` | `src/assets/art/pins/npc/` | Kinh kỷ Tiêu | Tu sĩ hành thương | Khế ước + dấu triện | Son đỏ `oklch(48% 0.18 25)` |
| 35 | `fisher-yen.png` | `src/assets/art/pins/npc/` | Ngư ông Yến | Tu sĩ hồ Nguyệt Ảnh | Cần câu + trăng dưới nước | Son đỏ `oklch(48% 0.18 25)` |
| 36 | `relic-hunter-bach.png` | `src/assets/art/pins/npc/` | Đạo nhân Bạch | Tu sĩ nhặt tro | Đèn + mảnh cổ vật | Son đỏ `oklch(48% 0.18 25)` |
| 37 | `beast-tamer-le.png` | `src/assets/art/pins/npc/` | Ngự thú sư Lê | Tu sĩ Linh Thú Lĩnh | Sừng gọi thú + dây | Son đỏ `oklch(48% 0.18 25)` |
| 38 | `pavilion-disciple-anh.png` | `src/assets/art/pins/npc/` | Đệ tử Ánh | Đệ tử Thanh Vân Các | Bài bội bài các | Son đỏ `oklch(48% 0.18 25)` |
| 39 | `wandering-blade-phong.png` | `src/assets/art/pins/npc/` | Phiêu kiếm Phong | Tu sĩ giang hồ | Kiếm quấn vải | Son đỏ `oklch(48% 0.18 25)` |
| 40 | `rogue-cultivator-nhat.png` | `src/assets/art/pins/npc/` | Tán tu Nhất | Tán tu rừng sương | Kiếm gãy + bí kíp giấu | Son đỏ `oklch(48% 0.18 25)` |
| 41 | `gardener-thin.png` | `src/assets/art/pins/npc/` | Cụ ông Thìn | Chồng Mai Hoa (ký ức) | Cành mai phai mờ | Son đỏ `oklch(48% 0.18 25)` |
| 42 | `auctioneer-hoan.png` | `src/assets/art/pins/npc/` | Đấu giá sư Hoàn | Điều phối đấu giá | Búa đấu giá | Son đỏ `oklch(48% 0.18 25)` |
| 43 | `banker-tin.png` | `src/assets/art/pins/npc/` | Chủ cầm đồ Tín | Chủ tiệm cầm đồ | Bảng cầm đồ + cân | Son đỏ `oklch(48% 0.18 25)` |
| 44 | `gardener-vien.png` | `src/assets/art/pins/npc/` | Người giữ vườn Viên | Giữ vườn ươm | Cây mầm + bình tưới | Son đỏ `oklch(48% 0.18 25)` |
| 45 | `beekeeper-oanh.png` | `src/assets/art/pins/npc/` | Bà Oanh nuôi ong | Nuôi ong mật linh | Thìa mật + ong | Son đỏ `oklch(48% 0.18 25)` |
| 46 | `archivist-thu.png` | `src/assets/art/pins/npc/` | Thủ thư Thu | Thủ thư Thanh Vân Các | Rương sách vân mây | Son đỏ `oklch(48% 0.18 25)` |
| 47 | `judge-quang.png` | `src/assets/art/pins/npc/` | Chánh án Quang | Chánh án | Búa phán + cán cân | Son đỏ `oklch(48% 0.18 25)` |
| 48 | `tamer-hac.png` | `src/assets/art/pins/npc/` | Ngự thú sư Hạc | Huấn luyện thú | Lồng thú + sáo | Son đỏ `oklch(48% 0.18 25)` |
| 49 | `beast-singer-my.png` | `src/assets/art/pins/npc/` | Hát thú My | Hát gọi thú | Tiêu + tai thú | Son đỏ `oklch(48% 0.18 25)` |
| 50 | `ash-priest-cuu.png` | `src/assets/art/pins/npc/` | Tư tế Cửu | Tư tế tro xương | Bình tro + xương | Son đỏ `oklch(48% 0.18 25)` |
| 51 | `name-collector-tra.png` | `src/assets/art/pins/npc/` | Sưu tập tên Trà | Sưu tập tên bị xóa | Bài vị không chữ | Son đỏ `oklch(48% 0.18 25)` |
| 52 | `ice-hermit-bang.png` | `src/assets/art/pins/npc/` | Ẩn sĩ Băng | Ẩn sĩ Băng Tâm | Băng tinh + râu đóng băng | Son đỏ `oklch(48% 0.18 25)` |
| 53 | `snow-guard-han.png` | `src/assets/art/pins/npc/` | Vệ binh Hàn | Vệ binh tuyết | Giáo + áo lông | Son đỏ `oklch(48% 0.18 25)` |
| 54 | `caravan-duong.png` | `src/assets/art/pins/npc/` | Thủ lĩnh Dương | Thủ lĩnh thương đoàn | Cờ đoàn xe | Son đỏ `oklch(48% 0.18 25)` |
| 55 | `dune-guide-sa.png` | `src/assets/art/pins/npc/` | Hướng dẫn Sa | Hướng dẫn sa mạc | La bàn + cát chảy | Son đỏ `oklch(48% 0.18 25)` |
| 56 | `lake-keeper-trang.png` | `src/assets/art/pins/npc/` | Người giữ hồ Trang | Giữ hồ | Đèn hồ + lưới | Son đỏ `oklch(48% 0.18 25)` |
| 57 | `ferryman-cau.png` | `src/assets/art/pins/npc/` | Người chở đò Câu | Chở đò | Sào chống + thuyền con | Son đỏ `oklch(48% 0.18 25)` |
| 58 | `dice-master-luc.png` | `src/assets/art/pins/npc/` | Bậc thầy Lục | Bậc thầy xúc xắc | Đĩa + hai viên xúc xắc | Son đỏ `oklch(48% 0.18 25)` |
| 59 | `map-seller-man.png` | `src/assets/art/pins/npc/` | Bán bản đồ Mẫn | Bán bản đồ cổ | Cuộn bản đồ + la bàn | Son đỏ `oklch(48% 0.18 25)` |
| 60 | `ward-carver-khue.png` | `src/assets/art/pins/npc/` | Thợ khắc Khuê | Khắc bùa | Đục + tấm phù | Son đỏ `oklch(48% 0.18 25)` |

---

### 3.2. Category 2: Event Map Pins (23 Files)
- **Target Directory:** `src/assets/art/pins/event/`
- **Replaces Glyph:** `事` on `.pin.event`
- **Base Style:** Ink-wash (*mực tàu giấy bản*) `oklch(18% 0.02 60)`
- **Accent Color:** Ngọc lam (turquoise/jade) `oklch(56% 0.10 175)`
- **Naming:** Kebab-case corresponding to node identity.

| # | Filename | Target Directory | Event Name (Node) | Visual Concept | Accent Color |
|---|----------|------------------|-------------------|----------------|--------------|
| 1 | `bamboo-rampart.png` | `src/assets/art/pins/event/` | Lũy tre (`village-bamboo`) | Rặng tre xanh mực, cọc rào tre làng cổ | Ngọc lam `oklch(56% 0.10 175)` |
| 2 | `old-house.png` | `src/assets/art/pins/event/` | Nhà cũ của ngươi (`village-home`) | Mái nhà tranh mộc mạc, cánh cổng liếp xưa | Ngọc lam `oklch(56% 0.10 175)` |
| 3 | `village-well.png` | `src/assets/art/pins/event/` | Giếng làng (`village-well`) | Thành giếng đá rêu phong, gàu sòng múc nước | Ngọc lam `oklch(56% 0.10 175)` |
| 4 | `fortune-wheel.png` | `src/assets/art/pins/event/` | Quầy quay vận mệnh (`market-lottery`) | Bàn quay bát quái / bánh xe tài lộc | Ngọc lam `oklch(56% 0.10 175)` |
| 5 | `tea-house.png` | `src/assets/art/pins/event/` | Trà quán nghe chuyện (`market-teahouse`) | Ấm trà nghi ngút khói bên bàn gỗ cổ | Ngọc lam `oklch(56% 0.10 175)` |
| 6 | `arena.png` | `src/assets/art/pins/event/` | Diễn võ trường (`sect-training`) | Võ đài đá với cờ lệnh và giá binh khí | Ngọc lam `oklch(56% 0.10 175)` |
| 7 | `treasure-pavilion.png` | `src/assets/art/pins/event/` | Tàng vật các (`sect-storehouse`) | Lầu gác lưu trữ bảo vật tỏa linh khí | Ngọc lam `oklch(56% 0.10 175)` |
| 8 | `meditation-wall.png` | `src/assets/art/pins/event/` | Vách tĩnh tâm (`sect-meditation`) | Vách đá cheo leo khắc chữ tĩnh tâm | Ngọc lam `oklch(56% 0.10 175)` |
| 9 | `herb-terrace.png` | `src/assets/art/pins/event/` | Ruộng linh thảo (`herb-garden`) | Ruộng bậc thang thoai thoải mọc linh thảo | Ngọc lam `oklch(56% 0.10 175)` |
| 10 | `fog-crossroads.png` | `src/assets/art/pins/event/` | Ngã ba sương dày (`forest-crossroads`) | Ngã ba đường mòn chìm trong sương mờ | Ngọc lam `oklch(56% 0.10 175)` |
| 11 | `cloud-nest.png` | `src/assets/art/pins/event/` | Tổ lông mây (`ridge-feather-nest`) | Tổ tiên cầm đan bằng lông vũ mây trắng | Ngọc lam `oklch(56% 0.10 175)` |
| 12 | `wind-bell.png` | `src/assets/art/pins/event/` | Chuông phong vân (`azure-bell`) | Chuông đồng phong linh treo đung đưa đón gió | Ngọc lam `oklch(56% 0.10 175)` |
| 13 | `nameless-stele.png` | `src/assets/art/pins/event/` | Bia đá vô danh (`cave-tablet`) | Tấm bia đá cổ trầm mặc không khắc chữ | Ngọc lam `oklch(56% 0.10 175)` |
| 14 | `wind-cliff.png` | `src/assets/art/pins/event/` | Vách gió kể chuyện (`peak-wind`) | Mỏm đá vươn giữa mây ngàn đón gió lộng | Ngọc lam `oklch(56% 0.10 175)` |
| 15 | `herb-garden.png` | `src/assets/art/pins/event/` | Vườn sương dược (`herbs-dew-garden`) | Vườn dược thảo đọng giọt sương mai | Ngọc lam `oklch(56% 0.10 175)` |
| 16 | `dry-oasis.png` | `src/assets/art/pins/event/` | Ốc đảo cạn (`dunes-oasis`) | Lòng hồ cạn khô với nhánh cây trơ trụi | Ngọc lam `oklch(56% 0.10 175)` |
| 17 | `ice-mirror.png` | `src/assets/art/pins/event/` | Băng kính thiên quang (`frozen-mirror`) | Mặt gương băng trong suốt rọi ánh thiên quang | Ngọc lam `oklch(56% 0.10 175)` |
| 18 | `auction-stall.png` | `src/assets/art/pins/event/` | Sạp bán đấu giá (`wandering-auction`) | Sạp hàng di động bày búa gõ và kỳ trân | Ngọc lam `oklch(56% 0.10 175)` |
| 19 | `caravan-teahouse.png` | `src/assets/art/pins/event/` | Trà lều hành thương (`wandering-tea`) | Lều bạt vải thô dừng chân uống trà | Ngọc lam `oklch(56% 0.10 175)` |
| 20 | `moon-water.png` | `src/assets/art/pins/event/` | Mặt nước phản nguyệt (`moon-reflection`) | Mặt hồ phẳng lặng in bóng vầng trăng rằm | Ngọc lam `oklch(56% 0.10 175)` |
| 21 | `lotus-pond.png` | `src/assets/art/pins/event/` | Bãi sen đêm (`moon-lotus`) | Búp sen đêm hé nở lung linh trên mặt nước | Ngọc lam `oklch(56% 0.10 175)` |
| 22 | `broken-stele.png` | `src/assets/art/pins/event/` | Bia văn đổ vỡ (`ruins-inscription`) | Bia ký cổ gãy đổ rêu phong hoang phế | Ngọc lam `oklch(56% 0.10 175)` |
| 23 | `cloud-library.png` | `src/assets/art/pins/event/` | Tàng thư vân các (`azure-library`) | Tủ sách cuộn cổ thư mây khói lượn quanh | Ngọc lam `oklch(56% 0.10 175)` |

---

### 3.3. Category 3: Danger Map Pins (9 Files)
- **Target Directory:** `src/assets/art/pins/danger/`
- **Replaces Glyph:** `凶` on `.pin.event` (danger state)
- **Base Style:** Ink-wash (*mực tàu giấy bản*) `oklch(18% 0.02 60)`
- **Accent Color:** Huyết đỏ (blood red) `oklch(48% 0.18 25)`
- **Design Rule:** Khắc họa mối đe dọa hiểm ác, hung hiểm, yêu thú hoặc cấm địa.

| # | Filename | Target Directory | Danger Type (Node) | Visual Concept | Accent Color |
|---|----------|------------------|--------------------|----------------|--------------|
| 1 | `bee-nest.png` | `src/assets/art/pins/danger/` | Tổ ong linh (`herb-hive`) | Tổ ong linh khổng lồ tỏa sát khí độc | Huyết đỏ `oklch(48% 0.18 25)` |
| 2 | `wolf-tracks.png` | `src/assets/art/pins/danger/` | Dấu chân lang yêu (`forest-wolf`) | Dấu chân vuốt dã lang in sâu dính vết máu | Huyết đỏ `oklch(48% 0.18 25)` |
| 3 | `cracked-seal.png` | `src/assets/art/pins/danger/` | Phong ấn nứt vỡ (`cave-seal`) | Trận pháp phù chú nứt toác rò rỉ tà khí | Huyết đỏ `oklch(48% 0.18 25)` |
| 4 | `rift-core.png` | `src/assets/art/pins/danger/` | Tâm khe nứt (`rift-heart`) | Lõi vực sâu tối tăm phóng tia chớp hắc ám | Huyết đỏ `oklch(48% 0.18 25)` |
| 5 | `hive-hollow.png` | `src/assets/art/pins/danger/` | Hốc ong linh (`herbs-bee-hollow`) | Thân cây mục rỗng bầy ong độc hung dữ | Huyết đỏ `oklch(48% 0.18 25)` |
| 6 | `storm-eye.png` | `src/assets/art/pins/danger/` | Mắt bão hắc phong (`dunes-blackwind`) | Tâm bão xoáy cát đen hung bạo | Huyết đỏ `oklch(48% 0.18 25)` |
| 7 | `ice-fissure.png` | `src/assets/art/pins/danger/` | Khe băng thở sương (`frozen-crevasse`) | Khe vực nứt toác bốc hơi lạnh thấu xương | Huyết đỏ `oklch(48% 0.18 25)` |
| 8 | `bone-altar.png` | `src/assets/art/pins/danger/` | Tế đàn tro xương (`ruins-altar`) | Đàn tế xếp sọ người và tro xương cháy rực | Huyết đỏ `oklch(48% 0.18 25)` |
| 9 | `claw-rock.png` | `src/assets/art/pins/danger/` | Đá vuốt linh thú (`ridge-claw-stone`) | Tảng cự thạch bị móng vuốt hung thú cào rách | Huyết đỏ `oklch(48% 0.18 25)` |

---

### 3.4. Category 4: Exit Map Pins (16 Files)
- **Target Directory:** `src/assets/art/pins/exit/`
- **Replaces Glyph:** `門` on `.pin` (exit type)
- **Base Style:** Ink-wash (*mực tàu giấy bản*) `oklch(18% 0.02 60)`
- **Accent Color:** Hoàng kim (golden) `oklch(78% 0.13 85)`
- **Design Rule:** Đại diện cho 16 vùng đất đích đến mà 30 điểm exit trên toàn bản đồ trỏ tới.

| # | Filename | Target Directory | Destination Name | Visual Concept | Accent Color |
|---|----------|------------------|------------------|----------------|--------------|
| 1 | `village.png` | `src/assets/art/pins/exit/` | Thôn Thanh Mộc (`village`) | Mái nhà thôn dã dưới tán cây đa cổ thụ | Hoàng kim `oklch(78% 0.13 85)` |
| 2 | `market.png` | `src/assets/art/pins/exit/` | Chợ Vân Tập (`market`) | Cổng chợ buôn bán tấp nập, cờ đón khách | Hoàng kim `oklch(78% 0.13 85)` |
| 3 | `sect.png` | `src/assets/art/pins/exit/` | Sơn môn Vân Ẩn (`sect`) | Cổng sơn môn uy nghi trên những bậc thềm đá | Hoàng kim `oklch(78% 0.13 85)` |
| 4 | `herb-field.png` | `src/assets/art/pins/exit/` | Bờ ruộng linh thảo (`herb_field`) | Ruộng bậc thang thoai thoải với linh thảo | Hoàng kim `oklch(78% 0.13 85)` |
| 5 | `misty-forest.png` | `src/assets/art/pins/exit/` | Rừng sương (`misty_forest`) | Rừng cây thông chìm trong làn sương mù mờ ảo | Hoàng kim `oklch(78% 0.13 85)` |
| 6 | `sealed-cave.png` | `src/assets/art/pins/exit/` | Hang phong ấn (`sealed_cave`) | Miệng hang đá phủ đầy phù chú phong ấn | Hoàng kim `oklch(78% 0.13 85)` |
| 7 | `cursed-rift.png` | `src/assets/art/pins/exit/` | Khe nứt bị nguyền (`cursed_rift`) | Khe nứt vực sâu bốc luồng khí đen | Hoàng kim `oklch(78% 0.13 85)` |
| 8 | `cloud-peak.png` | `src/assets/art/pins/exit/` | Đỉnh mây (`cloud_peak`) | Đỉnh núi cao chót vót vờn mây với tế đài | Hoàng kim `oklch(78% 0.13 85)` |
| 9 | `thousand-herbs-valley.png` | `src/assets/art/pins/exit/` | Vạn Thảo Cốc (`thousand_herbs_valley`) | Hẻm núi thung lũng ngút ngàn dược thảo | Hoàng kim `oklch(78% 0.13 85)` |
| 10 | `blackwind-dunes.png` | `src/assets/art/pins/exit/` | Cồn cát Hắc Phong (`blackwind_dunes`) | Cồn cát mênh mông với ngọn gió lốc xoáy | Hoàng kim `oklch(78% 0.13 85)` |
| 11 | `frozen-peak.png` | `src/assets/art/pins/exit/` | Hàn Băng Phong (`frozen_peak`) | Dãy núi băng tuyết phủ nhọn hoắt lạnh lẽo | Hoàng kim `oklch(78% 0.13 85)` |
| 12 | `wandering-market.png` | `src/assets/art/pins/exit/` | Hành Thương Thị (`wandering_market`) | Lều trại dã chiến bên đoàn lạc đà buôn | Hoàng kim `oklch(78% 0.13 85)` |
| 13 | `moon-lake.png` | `src/assets/art/pins/exit/` | Nguyệt Ảnh Hồ (`moon_lake`) | Mặt hồ phẳng lặng in bóng vầng trăng tròn | Hoàng kim `oklch(78% 0.13 85)` |
| 14 | `bone-ash-ruins.png` | `src/assets/art/pins/exit/` | Phế tích Bạch Cốt (`bone_ash_ruins`) | Tàn tích đổ nát vương vãi xương trắng cổ xưa | Hoàng kim `oklch(78% 0.13 85)` |
| 15 | `spirit-beast-ridge.png` | `src/assets/art/pins/exit/` | Sống núi Linh Thú (`spirit_beast_ridge`) | Sống núi hiểm trở in hằn dấu chân hung thú | Hoàng kim `oklch(78% 0.13 85)` |
| 16 | `azure-pavilion.png` | `src/assets/art/pins/exit/` | Thanh Vân Các (`azure_pavilion`) | Lầu các ngói lưu ly xanh biếc ẩn hiện trong mây | Hoàng kim `oklch(78% 0.13 85)` |

---

### 3.5. Category 5: LeftRail Navigation Tabs (6 Files)
- **Target Directory:** `src/assets/art/tabs/`
- **Replaces Glyphs:** `人 氣 囊 市 道 契` on `.proto-leftrail .tabs button`
- **Base Style:** Ink-wash `oklch(18% 0.02 60)`
- **Accent Color:** Mặc định đơn sắc mực; khi trạng thái Active chuyển sang ngọc lam `oklch(56% 0.10 175)`.

| # | Filename | Target Directory | Tab Purpose | Replaced Glyph | Visual Concept | Accent Color |
|---|----------|------------------|-------------|----------------|----------------|--------------|
| 1 | `people.png` | `src/assets/art/tabs/` | Nhân sĩ (People / NPCs) | `人` | Hai bóng người đối diện thi lễ / trò chuyện | Mực tàu / Active ngọc lam |
| 2 | `vital.png` | `src/assets/art/tabs/` | Khí huyết (Vitality / Status) | `氣` | Huyệt vị cơ thể cùng vòng tuần hoàn khí | Mực tàu / Active ngọc lam |
| 3 | `items.png` | `src/assets/art/tabs/` | Hành trang (Inventory / Items) | `囊` | Túi càn khôn thắt nút dây gấm | Mực tàu / Active ngọc lam |
| 4 | `market.png` | `src/assets/art/tabs/` | Chợ (Market / Commerce) | `市` | Đòn cân đĩa cổ cùng xâu tiền đồng | Mực tàu / Active ngọc lam |
| 5 | `path.png` | `src/assets/art/tabs/` | Đạo đồ (Cultivation Path / Progression) | `道` | Con đường uốn lượn hướng về dãy núi xa xôi | Mực tàu / Active ngọc lam |
| 6 | `system.png` | `src/assets/art/tabs/` | Hệ thống (System / Chronicle / Settings) | `契` | Cuộn khế ước mở rộng đóng dấu triện son | Mực tàu / Active ngọc lam |

---

### 3.6. Category 6: Tứ Tượng Attributes (4 Files)
- **Target Directory:** `src/assets/art/attrs/`
- **Replaces Glyphs:** `神 心 脈 運` in player stat displays (`.proto-tg`, RightHUD)
- **Base Style:** Ink-wash `oklch(18% 0.02 60)`
- **Accent Color:** Hoàng kim (golden) `oklch(78% 0.13 85)`

| # | Filename | Target Directory | Attribute | Replaced Glyph | Visual Concept | Accent Color |
|---|----------|------------------|-----------|----------------|----------------|--------------|
| 1 | `charm.png` | `src/assets/art/attrs/` | THẦN (`charm` / Spirit) | `神` | Mắt phượng thần thái tỏa quầng hào quang | Hoàng kim `oklch(78% 0.13 85)` |
| 2 | `mind.png` | `src/assets/art/attrs/` | TÂM (`mind` / Will) | `心` | Trái tim cách điệu hình cụm mây thiền định | Hoàng kim `oklch(78% 0.13 85)` |
| 3 | `body.png` | `src/assets/art/attrs/` | MẠCH (`body` / Physique) | `脈` | Mạch đập cổ tay hòa cùng luồng khí lưu thông | Hoàng kim `oklch(78% 0.13 85)` |
| 4 | `luck.png` | `src/assets/art/attrs/` | VẬN (`luck` / Fortune) | `運` | Đồng xu cổ xoay tròn cùng vệt sao chổi | Hoàng kim `oklch(78% 0.13 85)` |

---

### 3.7. Category 7: HUD Status Bars (3 Files)
- **Target Directory:** `src/assets/art/hud/`
- **Replaces:** Text labels / empty status bar headers
- **Base Style:** Ink-wash `oklch(18% 0.02 60)`
- **Accent Color:** Color matched to corresponding resource bar.

| # | Filename | Target Directory | Status Bar Type | Visual Concept | Accent Color |
|---|----------|------------------|-----------------|----------------|--------------|
| 1 | `hp.png` | `src/assets/art/hud/` | Thanh KHÍ HUYẾT (HP / Health) | Bình ngọc đỏ bốc làn khí sinh mệnh | Son đỏ / Huyết `oklch(48% 0.18 25)` |
| 2 | `qi.png` | `src/assets/art/hud/` | Thanh LINH KHÍ (Qi / Energy) | Xoáy luồng chân khí xanh ngọc cuộn trào | Ngọc lam `oklch(56% 0.10 175)` |
| 3 | `cultivation.png` | `src/assets/art/hud/` | Thanh TU VI (Cultivation Progress) | Bông sen thanh tịnh nở rộ vươn khỏi bùn | Hoàng kim `oklch(78% 0.13 85)` |

---

## 4. Exact Graphic Specifications & Constraints

### 4.1. Technical Specifications
- **Dimensions:** Exactly `128×128` pixels.
- **Format:** PNG-24 or PNG-32 with an 8-bit Alpha Channel.
- **Alpha Transparency:**
  - Background must be 100% transparent (`alpha = 0`).
  - No opaque bounding boxes, white background fill (`#FFFFFF`), or black background fill (`#000000`).
  - Cutout silhouette aesthetic: transparent edge contouring smoothly into the canvas.
- **Composition & Padding:**
  - Subject strictly centered horizontally and vertically.
  - Safe margin/padding of approximately ~10% (around 12 to 14 pixels margin from every border).
  - Designed for high legibility when scaled down to map pin sizes (32px to 48px).

### 4.2. Aesthetic Guidelines (Vietnamese Ink-and-Jade / *Mực & Ngọc*)
- **Aesthetic Tradition:** Ink-wash on rice-paper (*mực tàu giấy bản*).
- **Line Quality:** Calligraphic brushwork with expressive thick-and-thin linework (*nét đậm nét thanh*), natural ink seepage, and soft bristle edge texture.
- **Palette Anchors:**
  - **Base Ink:** `oklch(18% 0.02 60)` (deep charcoal ink, roughly `#22211f`).
  - **Son Đỏ (NPC Vermilion):** `oklch(48% 0.18 25)` (cinnabar red, roughly `#b3402a`).
  - **Ngọc Lam (Event Turquoise / Jade):** `oklch(56% 0.10 175)` (patina jade, roughly `#3e8e6d`).
  - **Huyết Đỏ (Danger Blood Red):** `oklch(48% 0.18 25)` (intense crimson red).
  - **Hoàng Kim (Exit & Attrs Muted Gold):** `oklch(78% 0.13 85)` (warm antique gold, roughly `#c8a24b`).
- **Minimalist Accent Philosophy:** Each icon should feature primarily the ink base with **one single category accent color** applied purposefully to the focal point.

### 4.3. Strict Prohibitions
1. **No 3D Renders / Skeuomorphism:** No glossy plastic, raytraced reflections, metallic chamfers, or realistic 3D balls.
2. **No Modern Gradients:** No synthwave, cyberpunk neon gradients, or smooth multi-hue radial glows.
3. **No Emoji Style:** No simplistic rounded cartoon stickers or standard Unicode emojis.
4. **No Artificial Borders or Frames:** No decorative circle borders, shield badges, or square frames surrounding the subject. The icon is a floating silhouette pin.
5. **No Text / Chinese Characters:** Do NOT draw Chinese characters or letters inside the icon art. The icons exist precisely to replace Chinese character glyphs.

---

## 5. Automated Verification Criteria

A headless Node.js verification script (`scripts/verify-ui-icons.mjs`) must be executed to certify the completeness and technical compliance of the asset suite.

### 5.1. Verification Checks
The verification script must validate three essential conditions across all 121 assets:
1. **File Existence Check:**
   - Scan all 121 defined file paths across the 7 directories.
   - Assert each file exists on the filesystem.
2. **Dimension Conformity Check:**
   - Inspect the image header or metadata using `sharp` (already present in `devDependencies`).
   - Assert `width === 128` and `height === 128`.
3. **Alpha Channel & Transparency Validation:**
   - Assert image has an alpha channel (`channels === 4` or `hasAlpha === true`).
   - Sample pixel data or check corner pixels (e.g. coordinates `[0,0]`, `[127,0]`, `[0,127]`, `[127,127]`) to ensure corner alpha is transparent (`alpha < 10`).
   - Measure transparent pixel coverage (transparent ratio should exceed 15% to 30%, guaranteeing it is not a solid opaque image).

### 5.2. Success & Failure Reporting
- **Success Criteria:** 121/121 files pass all checks. Script exits cleanly with code `0` and prints an itemized summary table.
- **Failure Behavior:** If any file is missing, improperly sized, or lacks alpha transparency, the script must list each offending file path with the exact reason and terminate with exit code `1`.
