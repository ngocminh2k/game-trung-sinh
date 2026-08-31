# CONTRACT — Item ID (đóng băng)

## 42 item HIỆN CÓ (không được đổi id; được tham chiếu tự do)

wooden_staff, tattered_robe, pill_hp, pill_qi, jade_charm, crooked_circulation,
rift_step_scroll, rift_step, ironwood_saber, mistweave_vest, spirit_ring,
cloudpiercer_spear, herbal_breath_manual, herbal_breath, iron_skin_manual, iron_skin,
cloudwalk_manual, cloudwalk, peak_cleaver_manual, peak_cleaver, dew_pill,
plum_qi_wine, ninefold_pill, marrow_gather_pill, trail_rations, moon_moss,
cold_iron_ore, beast_fang, cloudsilk_thread, crane_feather, bamboo_saber,
travelers_coat, bone_ward_charm, frostfang_saber, cloudveil_robe,
moonstone_pendant, tide_breath_manual, tide_breath, stone_aegis_manual,
stone_aegis, evidence_route_mercy, evidence_route_wealth, evidence_route_truth

## Item MỚI — CHỈ T07 được thêm vào `src/content/items.ts`

| Nhóm | Scheme ID | Số lượng | Ghi chú |
|---|---|---|---|
| 12 linh thảo Vạn Thảo Cốc | `herb_<ten>`: herb_hong_silk, herb_ice_heart, herb_blood_ginseng, herb_cloud_dew, herb_moon_shard, herb_fire_lotus, herb_white_banner, herb_green_vine, herb_purple_daisy, herb_earth_marrow, herb_wind_bamboo, herb_void_bamboo | 12 | mỗi loại 1 mùa; `buyPrice` theo mùa (T12 áp weather) |
| 12 đan lai | `pill_hybrid_<ten>`: pill_hybrid_silk_heart, pill_hybrid_blood_dew, pill_hybrid_moon_fire, pill_hybrid_banner_daisy, pill_hybrid_marrow_bamboo, pill_hybrid_cloud_lotus, pill_hybrid_ice_ginseng, pill_hybrid_dew_daisy, pill_hybrid_earth_fire, pill_hybrid_silk_dew, pill_hybrid_moon_marrow, pill_hybrid_wind_heart | 12 | output của 12 công thức alchemy |
| 3 đơn vị tiền | `silver_coin`, `spirit_stone` (vàng là `state.player.gold`, KHÔNG tạo item) | 3 (item đại diện) | chỉ để trưng bày/bán; số dư thật nằm ở `state.player.silver` / `state.player.spiritStones` (T02) |
| 12 mồi thuần thú | `bait_<ten>`: bait_white_tiger, herb_grey_wolf, herb_crane_spirit, herb_fox_spirit, herb_dragon_serpent, herb_baby_qilin, herb_frost_boar, herb_blaze_hound, herb_bee_queen, herb_peach_spirit, herb_turtle_imp, herb_storm_bird | 12 | tham chiếu bởi beasts.ts (T06) |
| Đan hiếm mua bằng Linh Thạch | `pill_ls_<ten>`: pill_ls_ninefold, pill_ls_marrow, pill_ls_iron, pill_ls_cloud (4 loại) | 4 | `buyPrice: null` — chỉ mua bằng LS qua T11/T12 |

Tổng item mới: 12 + 12 + 3 + 12 + 4 = **43**. Không thêm item nào khác.

## Quy tắc

- Mỗi ItemDef: `usable`, `effects?`, `buyPrice` (number|null), `sellPrice` (number|null), `aliases` ≥ 2.
- Tỷ giá (áp ở engine, không phải trong item): **1 Linh Thạch = 10 Vàng = 100 Bạc**.
- Item kỹ thuật ẩn (T08 cần): chiêu ẩn dùng `manual` item `*_hidden_manual` ×9 — thuộc T08,
  id scheme: `<technique>_hidden_manual` (ví dụ `thunder_gasp_hidden_manual`).
