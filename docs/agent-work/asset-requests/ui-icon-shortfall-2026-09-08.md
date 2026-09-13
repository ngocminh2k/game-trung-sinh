# Yêu cầu ảnh còn thiếu — UI icons (map pins, tabs, HUD)

**Ngày:** 2026-09-08
**Bối cảnh:** Game đã có 243 ảnh (60 NPC portrait full-body, 16 location icon, 87 item, 11 player pose, audio). Nhưng UI map-pin / tab / HUD hiện đang dùng **chữ Hán thay icon** (`人` `門` `事` `凶` `氣` `囊` `市` `道` `契` `神` `心` `脈` `運`) — cần ảnh thật, **mỗi thứ một icon unique**.

## Spec chung (áp dụng mọi file)

- **Kích thước:** 128×128 PNG, **trong suốt nền** (alpha), chủ thể canh giữa, chừa padding ~10%.
- **Style:** mực tàu giấy bản (ink-wash) — nét đậm mảnh màu `oklch(18% 0.02 60)` (gần đen mực), điểm nhấn duy nhất 1 màu theo nhóm (xem từng mục). Không gradient hiện đại, không 3D, không emoji.
- **Naming:** kebab-case, đúng tên file cột dưới, đặt vào thư mục cột "Thư mục".
- **Tổng: 121 file.**

---

## 1. Icon NPC pin trên map — 60 file (UNIQUE từng NPC)

Thư mục: `src/assets/art/pins/npc/` · Nhấn nhá: **son đỏ** `oklch(48% 0.18 25)`
Dùng thay glyph `人` trên `.pin.npc`. Mỗi NPC một vật biểu tượng riêng theo nghề — không lặp.

| # | File | NPC | Vai trò | Concept icon |
|---|------|-----|---------|--------------|
| 1 | `elder-meihua.png` | Cụ Mai Hoa | trưởng làng | cành mai hoa + gậy tre |
| 2 | `storyteller-ngo.png` | Ngo kể chuyện | người kể chuyện | quạt xếp mở |
| 3 | `merchant-bao.png` | Thương nhân Bảo | thương nhân | bàn tính gỗ |
| 4 | `hermit-coc.png` | Cốc chủ Cốc | ẩn sĩ hang đá | hồ lô + hang đá |
| 5 | `rival-khoa.png` | Sư đệ Khoa | sư đệ cạnh tranh | hai kiếm chéo + búi tóc |
| 6 | `master-vo.png` | Võ Trưởng Sư | trưởng sư tông môn | kiếm dài + râu bạc |
| 7 | `lost-soul-ha.png` | Vong hồn Hà | vong hồn lang thang | đốm lửa ma lập lòe |
| 8 | `innkeeper-hanh.png` | Chủ quán Hạnh | chủ quán trọ | cờ quán rượu + vò |
| 9 | `alchemist-sam.png` | Luyện dược Sâm | luyện dược sư | lò đan khói bay |
| 10 | `hunter-son.png` | Thợ săn Sơn | thợ săn | cung + lông chim |
| 11 | `guard-truong.png` | Dân binh Trường | dân binh | giáo + mũ trụ |
| 12 | `kid-xiaobao.png` | Tiểu Bảo | đứa trẻ tinh nghịch | con diều giấy |
| 13 | `farmer-tu.png` | Nông phu Tư | nông phu | nón lá + cái cày |
| 14 | `fortune-lien.png` | Bà đồng Liên | bói vé số | ống quẻ + thẻ tre |
| 15 | `cook-phung.png` | Đầu bếp Phụng | đầu bếp | chảo lửa + hơi |
| 16 | `smith-duc.png` | Thợ rèn Đức | thợ rèn | búa + đe |
| 17 | `scholar-minh.png` | Học giả Minh | học giả | cuộn thư + bút lông |
| 18 | `pedlar-quyen.png` | Hàng rong Quyền | hàng rong | đòn gánh + hai giỏ |
| 19 | `tea-ma.png` | Bà Ma trà quán | bà chủ quán trà | chén trà có vung |
| 20 | `tailor-yen.png` | Thợ may Yến | thợ may | kim + chỉ + vải |
| 21 | `senior-lan.png` | Sư tỷ Lan | sư tỷ | kiếm tua + trâm cài |
| 22 | `keeper-anh.png` | Quản kho Ánh | quản lý nhà kho | chuỗi chìa khóa |
| 23 | `monk-thien.png` | Sa môn Thiện | sa môn | chuỗi tràng + mõ |
| 24 | `herbalist-dan.png` | Dược sư Đàn | dược sư ruộng thuốc | cân thuốc + thảo mộc |
| 25 | `gatherer-hue.png` | Thợ hái Huệ | thợ hái | giỏ tre + liềm |
| 26 | `ox-cart-hien.png` | Xe bò Hiền | phu xe | bánh xe bò |
| 27 | `woodcutter-bong.png` | Tiều phu Bồng | tiều phu | rìu + củi đẵn |
| 28 | `exile-ba.png` | Kẻ lưu đày Bá | kẻ lưu đày | gông cùm nứt |
| 29 | `exorcist-diem.png` | Trừ tà Diễm | trừ tà sư | kiếm đào + bùa |
| 30 | `crane-spirit.png` | Tiên hạc | linh hạc | lông hạc trắng |
| 31 | `herbalist-lan.png` | Dược nương Lan | tu sĩ Vạn Thảo Cốc | lan lá thuốc |
| 32 | `swordsman-diep.png` | Kiếm khách Diệp | tu sĩ sa mạc | kiếm + nón sa mạc |
| 33 | `monk-nhu.png` | Tăng nhân Như | tu sĩ Hàn Băng Phong | sen tuyết + tích trượng |
| 34 | `broker-tieu.png` | Kinh kỷ Tiêu | tu sĩ hành thương | khế ước + dấu triện |
| 35 | `fisher-yen.png` | Ngư ông Yến | tu sĩ hồ Nguyệt Ảnh | cần câu + trăng dưới nước |
| 36 | `relic-hunter-bach.png` | Đạo nhân Bạch | tu sĩ nhặt tro | đèn + mảnh cổ vật |
| 37 | `beast-tamer-le.png` | Ngự thú sư Lê | tu sĩ Linh Thú Lĩnh | sừng gọi thú + dây |
| 38 | `pavilion-disciple-anh.png` | Đệ tử Ánh | đệ tử Thanh Vân Các | bài bội bài các |
| 39 | `wandering-blade-phong.png` | Phiêu kiếm Phong | tu sĩ giang hồ | kiếm quấn vải |
| 40 | `rogue-cultivator-nhat.png` | Tán tu Nhất | tán tu rừng sương | kiếm gãy + bí kíp giấu |
| 41 | `gardener-thin.png` | Cụ ông Thìn | chồng Mai Hoa (ký ức) | cành mai phai mờ |
| 42 | `auctioneer-hoan.png` | Đấu giá sư Hoàn | điều phối đấu giá | búa đấu giá |
| 43 | `banker-tin.png` | Chủ cầm đồ Tín | chủ tiệm cầm đồ | bảng cầm đồ + cân |
| 44 | `gardener-vien.png` | Người giữ vườn Viên | giữ vườn ươm | cây mầm + bình tưới |
| 45 | `beekeeper-oanh.png` | Bà Oanh nuôi ong | nuôi ong mật linh | thìa mật + ong |
| 46 | `archivist-thu.png` | Thủ thư Thu | thủ thư Thanh Vân Các | rương sách vân mây |
| 47 | `judge-quang.png` | Chánh án Quang | chánh án | búa phán + cán cân |
| 48 | `tamer-hac.png` | Ngự thú sư Hạc | huấn luyện thú | lồng thú +笛 sáo |
| 49 | `beast-singer-my.png` | Hát thú My | hát gọi thú | tiêu + tai thú |
| 50 | `ash-priest-cuu.png` | Tư tế Cửu | tư tế tro xương | bình tro + xương |
| 51 | `name-collector-tra.png` | Sưu tập tên Trà | sưu tập tên bị xóa | bài vị không chữ |
| 52 | `ice-hermit-bang.png` | Ẩn sĩ Băng | ẩn sĩ Băng Tâm | băng tinh + râu đóng băng |
| 53 | `snow-guard-han.png` | Vệ binh Hàn | vệ binh tuyết | giáo + áo lông |
| 54 | `caravan-duong.png` | Thủ lĩnh Dương | thủ lĩnh thương đoàn | cờ đoàn xe |
| 55 | `dune-guide-sa.png` | Hướng dẫn Sa | hướng dẫn sa mạc | la bàn + cát chảy |
| 56 | `lake-keeper-trang.png` | Người giữ hồ Trang | giữ hồ | đèn hồ + lưới |
| 57 | `ferryman-cau.png` | Người chở đò Câu | chở đò | sào chống + thuyền con |
| 58 | `dice-master-luc.png` | Bậc thầy Lục | bậc thầy xúc xắc | đĩa + hai viên xúc xắc |
| 59 | `map-seller-man.png` | Bán bản đồ Mẫn | bán bản đồ cổ | cuộn bản đồ + la bàn |
| 60 | `ward-carver-khue.png` | Thợ khắc Khuê | khắc bùa | đục + tấm phù |

## 2. Icon điểm sự kiện trên map — 23 file

Thư mục: `src/assets/art/pins/event/` · Nhấn nhá: **ngọc lam** `oklch(56% 0.10 175)`
Dùng thay glyph `事`. Tên file = tên node (dịch ngữ cảnh, kebab-case):

| File | Node | | File | Node |
|------|------|-|------|------|
| `bamboo-rampart.png` | Lũy tre | | `nameless-stele.png` | Bia đá vô danh |
| `old-house.png` | Nhà cũ của ngươi | | `wind-cliff.png` | Vách gió kể chuyện |
| `village-well.png` | Giếng làng | | `herb-garden.png` | Vườn sương dược |
| `fortune-wheel.png` | Quầy quay vận mệnh | | `dry-oasis.png` | Ốc đảo cạn |
| `tea-house.png` | Trà quán nghe chuyện | | `ice-mirror.png` | Băng kính thiên quang |
| `arena.png` | Diễn võ trường | | `auction-stall.png` | Sạp bán đấu giá |
| `treasure-pavilion.png` | Tàng vật các | | `caravan-teahouse.png` | Trà lều hành thương |
| `meditation-wall.png` | Vách tĩnh tâm | | `moon-water.png` | Mặt nước phản nguyệt |
| `herb-terrace.png` | Ruộng linh thảo | | `lotus-pond.png` | Bãi sen đêm |
| `fog-crossroads.png` | Ngã ba sương dày | | `broken-stele.png` | Bia văn đổ vỡ |
| `cloud-nest.png` | Tổ lông mây | | `cloud-library.png` | Tàng thư vân các |
| `wind-bell.png` | Chuông phong vân | | | |

## 3. Icon điểm nguy hiểm trên map — 9 file

Thư mục: `src/assets/art/pins/danger/` · Nhấn nhá: **huyết đỏ** `oklch(48% 0.18 25)`
Dùng thay glyph `凶`:

| File | Node | | File | Node |
|------|------|-|------|------|
| `bee-nest.png` | Tổ ong linh | | `storm-eye.png` | Mắt bão hắc phong |
| `wolf-tracks.png` | Dấu chân lang yêu | | `ice-fissure.png` | Khe băng thở sương |
| `cracked-seal.png` | Phong ấn nứt vỡ | | `bone-altar.png` | Tế đàn tro xương |
| `rift-core.png` | Tâm khe nứt | | `claw-rock.png` | Đá vuốt linh thú |
| `hive-hollow.png` | Hốc ong linh | | | |

## 4. Icon cửa vùng (exit pin) — 16 file

Thư mục: `src/assets/art/pins/exit/` · Nhấn nhá: **hoàng kim** `oklch(78% 0.13 85)`
Dùng thay glyph `門`. 30 exit pin trên map trỏ về 16 vùng — **icon theo vùng đến** (đã có `location-icons/` full-size, nhưng pin cần bản 128px riêng cùng bộ):

`village.png` (thôn + cây đa) · `market.png` (cổng chợ + cờ) · `sect.png` (cổng sơn môn + bậc đá) · `herb-field.png` (ruộng bậc thang + thảo) · `misty-forest.png` (sương + thông) · `sealed-cave.png` (hang + phù ấn) · `cursed-rift.png` (khe nứt + khí đen) · `cloud-peak.png` (đỉnh mây + đài) · `thousand-herbs-valley.png` (thung lũng dược) · `blackwind-dunes.png` (cồn + gió xoáy) · `frozen-peak.png` (núi băng) · `wandering-market.png` (lều + lạc đà) · `moon-lake.png` (hồ + trăng tròn) · `bone-ash-ruins.png` (cổ tích + xương) · `spirit-beast-ridge.png` (dấu thú trên núi) · `azure-pavilion.png` (các các mái xanh)

## 5. Icon tab LeftRail — 6 file

Thư mục: `src/assets/art/tabs/` · Nhấn nhá: mặc định mực, active = ngọc lam
Thay glyph `人 氣 囊 市 道 契`:

| File | Tab | Concept |
|------|-----|---------|
| `people.png` | Nhân sĩ | hai bóng người đối diện |
| `vital.png` | Khí huyết | huyệt vị + vòng khí |
| `items.png` | Hành trang | túi càn khôn thắt nút |
| `market.png` | Chợ | cân đĩa + xâu tiền |
| `path.png` | Đạo đồ | con đường uốn + núi xa |
| `system.png` | Hệ thống | cuộn khế ước + triện |

## 6. Icon Tứ Tượng (tetragrammaton) — 4 file

Thư mục: `src/assets/art/attrs/` · Nhấn nhá: hoàng kim
Thay glyph `神 心 脈 運`:

| File | Thuộc tính | Concept |
|------|-----------|---------|
| `charm.png` | THẦN (神) | mắt phượng + quầng |
| `mind.png` | TÂM (心) | trái tim cách điệu mây |
| `body.png` | MẠCH (脈) | mạch cổ tay + khí lưu |
| `luck.png` | VẬN (運) | đồng xu xoay + sao chổi |

## 7. Icon HUD phụ — 3 file

Thư mục: `src/assets/art/hud/`

| File | Dùng cho | Concept |
|------|----------|---------|
| `hp.png` | thanh KHÍ HUYẾT | bình ngọc đỏ + hơi |
| `qi.png` | thanh LINH KHÍ | xoáy khí xanh |
| `cultivation.png` | thanh TU VI | sen nở từ bùn |

## Tổng kết

| Nhóm | Số file | Trạng thái hiện tại |
|------|---------|---------------------|
| NPC pin | 60 | đang dùng `人` chung |
| Event pin | 23 | đang dùng `事` chung |
| Danger pin | 9 | đang dùng `凶` chung |
| Exit pin | 16 | đang dùng `門` chung |
| Tabs | 6 | đang dùng chữ Hán |
| Attrs | 4 | đang dùng chữ Hán |
| HUD bars | 3 | chưa có icon |
| **Tổng** | **121** | |

**Ghi chú:** portrait full-body NPC (60), location icon (16), item art (87), player pose (11) **đã đủ** — không cần làm lại. Sau khi có ảnh, UI sẽ render `<img>` thay glyph; glyph giữ làm fallback khi ảnh chưa load.
