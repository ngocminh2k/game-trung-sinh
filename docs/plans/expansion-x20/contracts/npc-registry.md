# CONTRACT — 60 NPC (đóng băng ID)

> Quy tắc: ID dưới đây là DUY NHẤT toàn dự án. Agent KHÔNG được tạo id khác, KHÔNG được đổi id cũ.
> Mỗi NPC: `locationId` thuộc bảng 16 region bên dưới. Aliases unique tuyệt đối (validation chặn trùng).

## 16 region hợp lệ (đã tồn tại — KHÔNG tạo region mới)

`village, market, sect, herb_field, misty_forest, sealed_cave, cursed_rift, cloud_peak,
thousand_herbs_valley, blackwind_dunes, frozen_peak, wandering_market, moon_lake,
bone_ash_ruins, spirit_beast_ridge, azure_pavilion`

## 40 NPC HIỆN CÓ (không được sửa id; chỉ được bổ sung `lines` nếu quest mới cần)

village: n_elder_meihua, n_storyteller_ngo, n_innkeeper_hanh, n_guard_truong, n_kid_xiaobao, n_farmer_tu, n_woodcutter_bong
market: n_merchant_bao, n_cook_phung, n_smith_duc, n_scholar_minh, n_pedlar_quyen, n_tea_ma, n_tailor_yen, n_fortune_lien
herb_field: n_herbalist_dan, n_gatherer_hue, n_ox_cart_hien
sect: n_master_vo, n_rival_khoa, n_senior_lan, n_keeper_anh, n_monk_thien, n_alchemist_sam, n_pavilion_disciple_anh
misty_forest: n_hunter_son, n_rogue_cultivator_nhat
sealed_cave: n_hermit_coc, n_lost_soul_ha
cursed_rift: n_exile_ba, n_exorcist_diem, n_wandering_blade_phong
cloud_peak: n_crane_spirit, n_monk_nhu
thousand_herbs_valley: n_herbalist_lan
azure_pavilion: (trống — xem NPC mới)
bone_ash_ruins: n_relic_hunter_bach
spirit_beast_ridge: n_beast_tamer_le
wandering_market: n_broker_tieu, n_swordsman_diep, n_fisher_yen

## 20 NPC MỚI — thêm đúng 20, đúng id, đúng region

| id | region | Vai trò (roleVi) | Ghi chú thoại |
|---|---|---|---|
| n_gardener_thin | village | Cụ ông Thìn — chồng quá cố của Mai Hoa, chỉ hiện qua ký ức | ≥4 dòng về 12 năm trước |
| n_auctioneer_hoan | market | người điều phối đấu giá bí kíp | phe tà |
| n_banker_tin | market | chủ tiệm cầm đồ — đổi bạc/linh thạch | trung tâm kinh tế 3 lớp |
| n_gardener_vien | thousand_herbs_valley | người giữ vườn ươm hạt giống | hệ gieo trồng |
| n_beekeeper_oanh | thousand_herbs_valley | người nuôi ong lấy mật linh | |
| n_archivist_thu | azure_pavilion | thủ thư Thanh Vân Các | điều kiện mượn sách 3 lớp |
| n_judge_quang | azure_pavilion | chánh án phiên xét xử ngày 18 | 4 lựa chọn ấn phong ấn |
| n_tamer_hac | spirit_beast_ridge | huấn luyện thú | dạy thuần hóa |
| n_beast_singer_my | spirit_beast_ridge | người hát gọi thú | mồi thuần theo loài |
| n_ash_priest_cuu | bone_ash_ruins | tư tế tro xương | trao 60 cái tên |
| n_name_collector_tra | bone_ash_ruins | kẻ sưu tập tên bị xóa | cửa hàng ký ức |
| n_ice_hermit_bang | frozen_peak | ẩn sĩ Băng Tâm | đường HÀNH |
| n_snow_guard_han | frozen_peak | vệ binh tuyết | |
| n_caravan_duong | blackwind_dunes | thủ lĩnh thương đoàn | |
| n_dune_guide_sa | blackwind_dunes | hướng dẫn sa mạc | |
| n_lake_keeper_trang | moon_lake | người giữ hồ | |
| n_ferryman_cau | moon_lake | người chở đò | |
| n_dice_master_luc | wandering_market | bậc thầy xúc xắc | vé số, may rủi |
| n_map_seller_man | wandering_market | người bán bản đồ cổ | mở vùng ẩn |
| n_ward_carver_khue | sealed_cave | thợ khắc bùa | bán ward charm |

## Đếm đối chiếu (làm xong T03 phải đúng)

`40 + 20 = 60`. Lệnh kiểm đếm:
`Select-String -Path src\content\npcs.ts -Pattern "id: 'n_" | Measure-Object | % Count` → **60**

## Quy tắc thoại

- NPC phụ (20 mới + 30 phụ cũ): ≥ 4 dòng `lines` với bậc thang `{affMin: 1|3|6|9}` (mỗi bậc 1 dòng).
- NPC chính đã có sẵn ≥ 6 dòng — KHÔNG xóa dòng cũ, chỉ được thêm dòng mới (khi quest cần).
- Mỗi NPC mới ≥ 3 aliases unique (chữ thường không dấu, ví dụ `['gardener', 'thin', 'cu ong thin']`).
