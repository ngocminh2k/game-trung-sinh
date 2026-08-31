/**
 * Companion beasts (T06) — 36 records: 12 species × 3 tiers.
 * Each species uses exactly one bait id from contracts/item-ids.md.
 * Bilingual: every species has Vi + En fields.
 */

export interface BeastDef {
  /** beast_<loai>_<cap>: thuong|dac_biet|boss → beast_bach_ho_thuong ... */
  id: string
  speciesVi: string
  speciesEn: string
  tier: 'thuong' | 'dac_biet' | 'boss'
  /** One of the 16 region ids in LOCATIONS. */
  locationId: string
  /** Bait item id from contracts/item-ids.md (bait_*). */
  requiredBait: string
  /** Luck threshold to tame: thuong 3, dac_biet 5, boss 7. */
  minLuck: number
  buff: { kind: 'attack' | 'defense' | 'heal' | 'qi' | 'dodge'; value: number }
  descVi: string
  descEn: string
}

const beasts: BeastDef[] = [
  // ── Bạch Hổ / White Tiger — spirit_beast_ridge ──────────────────────────
  { id: 'beast_bach_ho_thuong', speciesVi: 'Bạch Hổ', speciesEn: 'White Tiger', tier: 'thuong', locationId: 'spirit_beast_ridge', requiredBait: 'bait_white_tiger', minLuck: 3, buff: { kind: 'attack', value: 3 }, descVi: 'Hổ vằn trắng non, còn đang học cách rống.', descEn: 'A young white-striped tiger still learning to roar.' },
  { id: 'beast_bach_ho_dac_biet', speciesVi: 'Bạch Hổ', speciesEn: 'White Tiger', tier: 'dac_biet', locationId: 'spirit_beast_ridge', requiredBait: 'bait_white_tiger', minLuck: 5, buff: { kind: 'attack', value: 6 }, descVi: 'Bạch hổ đã giữ được địa bàn riêng giữa rặng núi.', descEn: 'A white tiger that has claimed its own ridge.' },
  { id: 'beast_bach_ho_boss', speciesVi: 'Bạch Hổ', speciesEn: 'White Tiger', tier: 'boss', locationId: 'spirit_beast_ridge', requiredBait: 'bait_white_tiger', minLuck: 7, buff: { kind: 'attack', value: 10 }, descVi: 'Hổ trắng trăm năm, gầm một tiếng là đổi cả gió núi.', descEn: 'A century-old white tiger; one roar and the mountain wind changes.' },

  // ── Yêu Lang / Demon Wolf — misty_forest ────────────────────────────────
  { id: 'beast_yeu_lang_thuong', speciesVi: 'Yêu Lang', speciesEn: 'Demon Wolf', tier: 'thuong', locationId: 'misty_forest', requiredBait: 'bait_grey_wolf', minLuck: 3, buff: { kind: 'dodge', value: 3 }, descVi: 'Sói xám lạc bầy, đôi mắt còn sáng trước bóng tối.', descEn: 'A grey wolf far from its pack, eyes bright against the dark.' },
  { id: 'beast_yeu_lang_dac_biet', speciesVi: 'Yêu Lang', speciesEn: 'Demon Wolf', tier: 'dac_biet', locationId: 'misty_forest', requiredBait: 'bait_grey_wolf', minLuck: 5, buff: { kind: 'dodge', value: 6 }, descVi: 'Sói xám dẫn đàn, biết ngửi gió trước khi gió đến.', descEn: 'A pack-leading wolf that reads the wind before it arrives.' },
  { id: 'beast_yeu_lang_boss', speciesVi: 'Yêu Lang', speciesEn: 'Demon Wolf', tier: 'boss', locationId: 'misty_forest', requiredBait: 'bait_grey_wolf', minLuck: 7, buff: { kind: 'dodge', value: 10 }, descVi: 'Yêu lang già mọc răng thép, nơi nó đi sương mù phải nhường đường.', descEn: 'An old demon wolf with steel fangs; the mist gives way where it walks.' },

  // ── Hạc Linh / Crane Spirit — moon_lake ─────────────────────────────────
  { id: 'beast_hac_linh_thuong', speciesVi: 'Hạc Linh', speciesEn: 'Crane Spirit', tier: 'thuong', locationId: 'moon_lake', requiredBait: 'bait_crane_spirit', minLuck: 3, buff: { kind: 'heal', value: 3 }, descVi: 'Hạc trắng lội nước hồ, mỏ cắp ánh trăng non.', descEn: 'A white crane wading the lake, a sliver of moonlight in its beak.' },
  { id: 'beast_hac_linh_dac_biet', speciesVi: 'Hạc Linh', speciesEn: 'Crane Spirit', tier: 'dac_biet', locationId: 'moon_lake', requiredBait: 'bait_crane_spirit', minLuck: 5, buff: { kind: 'heal', value: 6 }, descVi: 'Hạc linh múa dưới trăng, chữa lành cho kẻ đi cùng.', descEn: 'A crane spirit dancing in the moonlight, mending those beside it.' },
  { id: 'beast_hac_linh_boss', speciesVi: 'Hạc Linh', speciesEn: 'Crane Spirit', tier: 'boss', locationId: 'moon_lake', requiredBait: 'bait_crane_spirit', minLuck: 7, buff: { kind: 'heal', value: 10 }, descVi: 'Hạc nghìn năm đậu trên đám mây giữa hồ, tiếng kêu vang cả trời sao.', descEn: 'A thousand-year crane perched on a mid-lake cloud; its cry reaches the stars.' },

  // ── Hồ Ly / Fox Spirit — misty_forest ───────────────────────────────────
  { id: 'beast_ho_ly_thuong', speciesVi: 'Hồ Ly', speciesEn: 'Fox Spirit', tier: 'thuong', locationId: 'misty_forest', requiredBait: 'bait_fox_spirit', minLuck: 3, buff: { kind: 'dodge', value: 3 }, descVi: 'Hồ ly con đuôi mới phát sáng, hay trêu người qua rừng.', descEn: 'A young fox whose tail has just begun to glow, fond of teasing travelers.' },
  { id: 'beast_ho_ly_dac_biet', speciesVi: 'Hồ Ly', speciesEn: 'Fox Spirit', tier: 'dac_biet', locationId: 'misty_forest', requiredBait: 'bait_fox_spirit', minLuck: 5, buff: { kind: 'dodge', value: 6 }, descVi: 'Hồ ly chín đuôi biết biến hóa, chỉ tin kẻ giữ lời hứa.', descEn: 'A nine-tailed fox that shapeshifts and trusts only those who keep a promise.' },
  { id: 'beast_ho_ly_boss', speciesVi: 'Hồ Ly', speciesEn: 'Fox Spirit', tier: 'boss', locationId: 'misty_forest', requiredBait: 'bait_fox_spirit', minLuck: 7, buff: { kind: 'dodge', value: 10 }, descVi: 'Hồ ly tinh đuôi vàng rực, nhìn thấu lòng người chỉ bằng một cái liếc.', descEn: 'A fox spirit with a blazing golden tail; one glance reads a heart.' },

  // ── Long Xà / Dragon Serpent — cursed_rift ──────────────────────────────
  { id: 'beast_long_xa_thuong', speciesVi: 'Long Xà', speciesEn: 'Dragon Serpent', tier: 'thuong', locationId: 'cursed_rift', requiredBait: 'bait_dragon_serpent', minLuck: 3, buff: { kind: 'attack', value: 3 }, descVi: 'Xà con vảy lấm tấm như rồng, lưỡi rung trong hơi đất.', descEn: 'A young serpent with dragon-speckled scales, its tongue tasting the earth.' },
  { id: 'beast_long_xa_dac_biet', speciesVi: 'Long Xà', speciesEn: 'Dragon Serpent', tier: 'dac_biet', locationId: 'cursed_rift', requiredBait: 'bait_dragon_serpent', minLuck: 5, buff: { kind: 'attack', value: 6 }, descVi: 'Long xà quấn quanh vực sâu, mắt vàng theo dõi mọi kẻ qua khe.', descEn: 'A dragon serpent coiled around the deep rift, golden eyes tracking every passerby.' },
  { id: 'beast_long_xa_boss', speciesVi: 'Long Xà', speciesEn: 'Dragon Serpent', tier: 'boss', locationId: 'cursed_rift', requiredBait: 'bait_dragon_serpent', minLuck: 7, buff: { kind: 'attack', value: 10 }, descVi: 'Long xà đã lột vảy thành sừng, hơi thở nóng cả đáy vực.', descEn: 'A dragon serpent that has shed its scales for horns; its breath warms the rift floor.' },

  // ── Kỳ Lân Con / Baby Qilin — thousand_herbs_valley ────────────────────
  { id: 'beast_ky_lan_non_thuong', speciesVi: 'Kỳ Lân Con', speciesEn: 'Baby Qilin', tier: 'thuong', locationId: 'thousand_herbs_valley', requiredBait: 'bait_baby_qilin', minLuck: 3, buff: { kind: 'qi', value: 3 }, descVi: 'Kỳ lân non còn mải gặm cỏ sương, chưa biết mình linh thiêng.', descEn: 'A baby qilin still busy with dew-grass, unaware of its own reverence.' },
  { id: 'beast_ky_lan_non_dac_biet', speciesVi: 'Kỳ Lân Con', speciesEn: 'Baby Qilin', tier: 'dac_biet', locationId: 'thousand_herbs_valley', requiredBait: 'bait_baby_qilin', minLuck: 5, buff: { kind: 'qi', value: 6 }, descVi: 'Kỳ lân con sừng nhú lộc nhộc, thảo dược quanh nó mọc nhanh hơn.', descEn: 'A qilin with budding horns; the herbs around it grow faster.' },
  { id: 'beast_ky_lan_non_boss', speciesVi: 'Kỳ Lân Con', speciesEn: 'Baby Qilin', tier: 'boss', locationId: 'thousand_herbs_valley', requiredBait: 'bait_baby_qilin', minLuck: 7, buff: { kind: 'qi', value: 10 }, descVi: 'Kỳ lân con toàn thân rực linh quang, đất dưới chân nó nảy mầm.', descEn: 'A qilin radiant with spirit light; the ground beneath it sprouts.' },

  // ── Trư Nha Sương / Frost Boar — frozen_peak ───────────────────────────
  { id: 'beast_tru_nha_suong_thuong', speciesVi: 'Trư Nha Sương', speciesEn: 'Frost Boar', tier: 'thuong', locationId: 'frozen_peak', requiredBait: 'bait_frost_boar', minLuck: 3, buff: { kind: 'defense', value: 3 }, descVi: 'Heo rừng đóng băng lớp lông, thở ra làn khói trắng.', descEn: 'A boar whose coat is rimed with frost, each breath a puff of white.' },
  { id: 'beast_tru_nha_suong_dac_biet', speciesVi: 'Trư Nha Sương', speciesEn: 'Frost Boar', tier: 'dac_biet', locationId: 'frozen_peak', requiredBait: 'bait_frost_boar', minLuck: 5, buff: { kind: 'defense', value: 6 }, descVi: 'Trư nha sương nanh cong phủ băng, đâm cả vách núi.', descEn: 'A frost boar with ice-sheathed tusks that crack cliff faces.' },
  { id: 'beast_tru_nha_suong_boss', speciesVi: 'Trư Nha Sương', speciesEn: 'Frost Boar', tier: 'boss', locationId: 'frozen_peak', requiredBait: 'bait_frost_boar', minLuck: 7, buff: { kind: 'defense', value: 10 }, descVi: 'Trư nha sương thủ lĩnh cả đàn, thân hình như tảng băng sống.', descEn: 'The herd-leader frost boar, a living iceberg on hooves.' },

  // ── Liệt Khuyển / Blaze Hound — blackwind_dunes ────────────────────────
  { id: 'beast_liet_khuyen_thuong', speciesVi: 'Liệt Khuyển', speciesEn: 'Blaze Hound', tier: 'thuong', locationId: 'blackwind_dunes', requiredBait: 'bait_blaze_hound', minLuck: 3, buff: { kind: 'attack', value: 3 }, descVi: 'Khuyển lông rực lửa, chạy qua cát để lại vệt than.', descEn: 'A hound with flame-red fur, leaving charcoal trails across the sand.' },
  { id: 'beast_liet_khuyen_dac_biet', speciesVi: 'Liệt Khuyển', speciesEn: 'Blaze Hound', tier: 'dac_biet', locationId: 'blackwind_dunes', requiredBait: 'bait_blaze_hound', minLuck: 5, buff: { kind: 'attack', value: 6 }, descVi: 'Liệt khuyển biết sủa ra lửa, giữ cồn cát riêng của mình.', descEn: 'A blaze hound that barks fire and guards its own dune.' },
  { id: 'beast_liet_khuyen_boss', speciesVi: 'Liệt Khuyển', speciesEn: 'Blaze Hound', tier: 'boss', locationId: 'blackwind_dunes', requiredBait: 'bait_blaze_hound', minLuck: 7, buff: { kind: 'attack', value: 10 }, descVi: 'Liệt khuyển thủ lĩnh, thân phủ lửa xanh, tiếng tru nghe như bão.', descEn: 'The hound king wreathed in blue fire; its howl sounds like a storm.' },

  // ── Ong Hoàng / Bee Queen — thousand_herbs_valley ──────────────────────
  { id: 'beast_ong_hoang_thuong', speciesVi: 'Ong Hoàng', speciesEn: 'Bee Queen', tier: 'thuong', locationId: 'thousand_herbs_valley', requiredBait: 'bait_bee_queen', minLuck: 3, buff: { kind: 'heal', value: 3 }, descVi: 'Ong chúa cánh vàng óng, mật nó nhỏ xuống như thuốc.', descEn: 'A golden-winged bee queen; its honey falls like medicine.' },
  { id: 'beast_ong_hoang_dac_biet', speciesVi: 'Ong Hoàng', speciesEn: 'Bee Queen', tier: 'dac_biet', locationId: 'thousand_herbs_valley', requiredBait: 'bait_bee_queen', minLuck: 5, buff: { kind: 'heal', value: 6 }, descVi: 'Ong hoàng dẫn cả tổ, tiếng vỗ cánh làm dịu vết thương.', descEn: 'A bee queen with a whole hive behind her; the hum of wings soothes wounds.' },
  { id: 'beast_ong_hoang_boss', speciesVi: 'Ong Hoàng', speciesEn: 'Bee Queen', tier: 'boss', locationId: 'thousand_herbs_valley', requiredBait: 'bait_bee_queen', minLuck: 7, buff: { kind: 'heal', value: 10 }, descVi: 'Ong hoàng ngàn năm, mật một giọt cũng đủ cứu người hấp hối.', descEn: 'A thousand-year bee queen; a single drop of her honey saves the dying.' },

  // ── Đào Tinh / Peach Spirit — herb_field ───────────────────────────────
  { id: 'beast_dao_tinh_thuong', speciesVi: 'Đào Tinh', speciesEn: 'Peach Spirit', tier: 'thuong', locationId: 'herb_field', requiredBait: 'bait_peach_spirit', minLuck: 3, buff: { kind: 'qi', value: 3 }, descVi: 'Đào tinh mọc từ cây đào cổ, cánh hoa rơi là khí ngọt.', descEn: 'A peach spirit born of an old tree; where its petals fall the air grows sweet.' },
  { id: 'beast_dao_tinh_dac_biet', speciesVi: 'Đào Tinh', speciesEn: 'Peach Spirit', tier: 'dac_biet', locationId: 'herb_field', requiredBait: 'bait_peach_spirit', minLuck: 5, buff: { kind: 'qi', value: 6 }, descVi: 'Đào tinh đã ngưng tụ nhân quả, gỗ nó tỏa mùi rượu tiên.', descEn: 'A peach spirit with a formed core; its wood smells of immortal wine.' },
  { id: 'beast_dao_tinh_boss', speciesVi: 'Đào Tinh', speciesEn: 'Peach Spirit', tier: 'boss', locationId: 'herb_field', requiredBait: 'bait_peach_spirit', minLuck: 7, buff: { kind: 'qi', value: 10 }, descVi: 'Đào tinh đã đổi xác ba lần, mỗi quả nó rụng là một viên đan.', descEn: 'A peach spirit reborn thrice; every fruit it drops is a pill.' },

  // ── Quy Thủy Quái / Turtle Imp — moon_lake ─────────────────────────────
  { id: 'beast_quy_thuy_quai_thuong', speciesVi: 'Quy Thủy Quái', speciesEn: 'Turtle Imp', tier: 'thuong', locationId: 'moon_lake', requiredBait: 'bait_turtle_imp', minLuck: 3, buff: { kind: 'defense', value: 3 }, descVi: 'Rùa nước mọc gai, mai khắc vân như vết chạm cổ.', descEn: 'A water turtle with thorny back, its shell carved with ancient marks.' },
  { id: 'beast_quy_thuy_quai_dac_biet', speciesVi: 'Quy Thủy Quái', speciesEn: 'Turtle Imp', tier: 'dac_biet', locationId: 'moon_lake', requiredBait: 'bait_turtle_imp', minLuck: 5, buff: { kind: 'defense', value: 6 }, descVi: 'Quy thủy quái nằm đáy hồ, mai chịu được cả pháp lôi.', descEn: 'A turtle imp resting on the lakebed; its shell endures spirit thunder.' },
  { id: 'beast_quy_thuy_quai_boss', speciesVi: 'Quy Thủy Quái', speciesEn: 'Turtle Imp', tier: 'boss', locationId: 'moon_lake', requiredBait: 'bait_turtle_imp', minLuck: 7, buff: { kind: 'defense', value: 10 }, descVi: 'Quy thủy quái ngàn tuổi, mai như một hòn đảo thu nhỏ.', descEn: 'A thousand-year turtle imp; its shell is a small island.' },

  // ── Vũ Điểu / Storm Bird — cloud_peak ──────────────────────────────────
  { id: 'beast_vu_dieu_thuong', speciesVi: 'Vũ Điểu', speciesEn: 'Storm Bird', tier: 'thuong', locationId: 'cloud_peak', requiredBait: 'bait_storm_bird', minLuck: 3, buff: { kind: 'dodge', value: 3 }, descVi: 'Chim đen lông lấp lánh như mưa, lượn quanh đỉnh mây.', descEn: 'A dark bird with rain-glittering feathers, circling the cloud peak.' },
  { id: 'beast_vu_dieu_dac_biet', speciesVi: 'Vũ Điểu', speciesEn: 'Storm Bird', tier: 'dac_biet', locationId: 'cloud_peak', requiredBait: 'bait_storm_bird', minLuck: 5, buff: { kind: 'dodge', value: 6 }, descVi: 'Vũ điểu gọi sấm về theo tiếng kêu, mắt nó nhìn rõ giữa bão.', descEn: 'A storm bird that summons thunder with its cry, seeing clearly through the gale.' },
  { id: 'beast_vu_dieu_boss', speciesVi: 'Vũ Điểu', speciesEn: 'Storm Bird', tier: 'boss', locationId: 'cloud_peak', requiredBait: 'bait_storm_bird', minLuck: 7, buff: { kind: 'dodge', value: 10 }, descVi: 'Vũ điểu chúa tể trời cao, đôi cánh che kín cả đỉnh núi.', descEn: 'The storm bird lord of the high sky; its wings cover the whole peak.' },
]

export const BEASTS: ReadonlyArray<BeastDef> = beasts
