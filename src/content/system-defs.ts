// System Layer S01 — the 10 System definitions (pure data).
// Reference values from docs/plans/system-layer/S01-reference-data.md.
// Must NOT import authored Scenario-I modules (scenario independence, SPEC §6).

export type SystemId =
  | 'sys_battle'
  | 'sys_alchemy'
  | 'sys_merchant'
  | 'sys_lottery'
  | 'sys_explorer'
  | 'sys_assassin'
  | 'sys_healer'
  | 'sys_artisan'
  | 'sys_scholar'
  | 'sys_void'

export interface SystemDef {
  id: SystemId
  /** Display order in the pick screen — 1..10, strictly ascending. */
  order: number
  nameVi: string
  nameEn: string
  headerVi: string
  headerEn: string
  /** One-line persona for the LLM chat + deterministic fallback. */
  personalityVi: string
  personalityEn: string
  /** Pool bucket — two systems may later share a pool. */
  questPoolId: string
  rewardBudget: {
    minGold: number
    maxGold: number
    minSpiritStones: number
    maxSpiritStones: number
    /** Real item ids from src/content/items.ts (validated at test time). */
    itemPool: string[]
  }
}

export const SYSTEMS: SystemDef[] = [
  {
    id: 'sys_battle',
    order: 1,
    nameVi: 'Hệ Thống Chiến Đấu',
    nameEn: 'Battle System',
    headerVi: '【Hệ Thống Chiến Đấu】',
    headerEn: '【Battle System】',
    personalityVi: 'Hệ Thống thích xem ngươi máu me. Đừng làm nó thất vọng.',
    personalityEn: 'The System likes watching you bleed. Do not disappoint it.',
    questPoolId: 'battle-1',
    rewardBudget: {
      minGold: 40,
      maxGold: 80,
      minSpiritStones: 0,
      maxSpiritStones: 2,
      itemPool: ['ninefold_pill', 'marrow_gather_pill', 'beast_fang', 'cold_iron_ore', 'ironwood_saber', 'frostfang_saber', 'cloudveil_robe'],
    },
  },
  {
    id: 'sys_alchemy',
    order: 2,
    nameVi: 'Hệ Thống Luyện Đan',
    nameEn: 'Alchemy System',
    headerVi: '【Hệ Thống Luyện Đan】',
    headerEn: '【Alchemy System】',
    personalityVi: 'Hệ Thống ghi chú về các phản ứng. Có những lò luyện đan không nên mở hai lần.',
    personalityEn: 'The System notes reactions. Some cauldrons should not be opened twice.',
    questPoolId: 'alchemy-1',
    rewardBudget: {
      minGold: 25,
      maxGold: 55,
      minSpiritStones: 0,
      maxSpiritStones: 2,
      itemPool: ['pill_hp', 'pill_qi', 'dew_pill', 'marrow_gather_pill', 'herb_hong_silk', 'herb_ice_heart', 'herb_fire_lotus', 'pill_hybrid_moon_fire'],
    },
  },
  {
    id: 'sys_merchant',
    order: 3,
    nameVi: 'Hệ Thống Hội Thương',
    nameEn: 'Merchant System',
    headerVi: '【Hệ Thống Hội Thương】',
    headerEn: '【Merchant System】',
    personalityVi: 'Hệ Thống tính tiền chính xác đến đồng bạc cuối. Không ai lừa được hai lần.',
    personalityEn: 'The System counts to the last coin. Nobody cheats it twice.',
    questPoolId: 'merchant-1',
    rewardBudget: {
      minGold: 30,
      maxGold: 60,
      minSpiritStones: 0,
      maxSpiritStones: 3,
      itemPool: ['silver_coin', 'spirit_stone', 'gold_note', 'trail_rations', 'plum_qi_wine', 'cloudsilk_thread', 'moon_moss', 'travelers_coat'],
    },
  },
  {
    id: 'sys_lottery',
    order: 4,
    nameVi: 'Hệ Thống Cờ Bạc',
    nameEn: 'Lottery System',
    headerVi: '【Hệ Thống Cờ Bạc】',
    headerEn: '【Lottery System】',
    personalityVi: 'Hệ Thống đã tính xác suất. Ngươi vẫn muốn thử chứ?',
    personalityEn: 'The System has computed the odds. You still want to try?',
    questPoolId: 'lottery-1',
    rewardBudget: {
      minGold: 20,
      maxGold: 90,
      minSpiritStones: 0,
      maxSpiritStones: 1,
      itemPool: ['pill_hp', 'pill_qi', 'jade_charm', 'silver_coin', 'spirit_stone', 'moonstone_pendant', 'dew_pill', 'trail_rations'],
    },
  },
  {
    id: 'sys_explorer',
    order: 5,
    nameVi: 'Hệ Thống Vạn Dặm',
    nameEn: 'Explorer System',
    headerVi: '【Hệ Thống Vạn Dặm】',
    headerEn: '【Explorer System】',
    personalityVi: 'Hệ Thống đã vẽ lại bản đồ. Những vùng trắng chỉ dành cho kẻ đủ liều.',
    personalityEn: 'The System redrew the map. The white zones belong only to the reckless.',
    questPoolId: 'explorer-1',
    rewardBudget: {
      minGold: 25,
      maxGold: 60,
      minSpiritStones: 0,
      maxSpiritStones: 2,
      itemPool: ['trail_rations', 'cloudwalk_manual', 'tide_breath_manual', 'rift_step_scroll', 'moonstone_pendant', 'crane_feather', 'moon_moss', 'bait_crane_spirit'],
    },
  },
  {
    id: 'sys_assassin',
    order: 6,
    nameVi: 'Hệ Thống Ám Sát',
    nameEn: 'Assassin System',
    headerVi: '【Hệ Thống Ám Sát】',
    headerEn: '【Assassin System】',
    personalityVi: 'Hệ Thống thích lối tắt. Đừng để lại dấu vết.',
    personalityEn: 'The System favors shortcuts. Leave no trace.',
    questPoolId: 'assassin-1',
    rewardBudget: {
      minGold: 45,
      maxGold: 85,
      minSpiritStones: 0,
      maxSpiritStones: 3,
      itemPool: ['shadow_eclipse_step_hidden_manual', 'shadow_molt_hidden_manual', 'ironwood_saber', 'frostfang_saber', 'rift_step_scroll', 'beast_fang'],
    },
  },
  {
    id: 'sys_healer',
    order: 7,
    nameVi: 'Hệ Thống Dưỡng Sinh',
    nameEn: 'Healer System',
    headerVi: '【Hệ Thống Dưỡng Sinh】',
    headerEn: '【Healer System】',
    personalityVi: 'Hệ Thống đo mạch và ghi chú. Nó không cứu người, nó tối ưu.',
    personalityEn: 'The System reads pulses and takes notes. It does not save people; it optimizes.',
    questPoolId: 'healer-1',
    rewardBudget: {
      minGold: 20,
      maxGold: 50,
      minSpiritStones: 0,
      maxSpiritStones: 2,
      itemPool: ['pill_hp', 'pill_qi', 'dew_pill', 'ninefold_pill', 'marrow_gather_pill', 'herb_blood_ginseng', 'pill_hybrid_blood_dew'],
    },
  },
  {
    id: 'sys_artisan',
    order: 8,
    nameVi: 'Hệ Thống Luyện Khí',
    nameEn: 'Artisan System',
    headerVi: '【Hệ Thống Luyện Khí】',
    headerEn: '【Artisan System】',
    personalityVi: 'Hệ Thống đo lửa và tiếng búa. Búa không cần xin phép.',
    personalityEn: 'The System measures fire and forge-noise. The hammer asks no permission.',
    questPoolId: 'artisan-1',
    rewardBudget: {
      minGold: 30,
      maxGold: 65,
      minSpiritStones: 0,
      maxSpiritStones: 2,
      itemPool: ['cold_iron_ore', 'cloudsilk_thread', 'crane_feather', 'jade_charm', 'bone_ward_charm', 'stone_aegis_manual', 'iron_skin_manual', 'peak_cleaver_manual'],
    },
  },
  {
    id: 'sys_scholar',
    order: 9,
    nameVi: 'Hệ Thống Tàng Thư',
    nameEn: 'Scholar System',
    headerVi: '【Hệ Thống Tàng Thư】',
    headerEn: '【Scholar System】',
    personalityVi: 'Hệ Thống đếm từng câu chữ. Một đời thiếu ký ức là một trang thiếu mực.',
    personalityEn: 'The System counts every word. A life without memory is a page without ink.',
    questPoolId: 'scholar-1',
    rewardBudget: {
      minGold: 20,
      maxGold: 55,
      minSpiritStones: 0,
      maxSpiritStones: 2,
      itemPool: ['herbal_breath_manual', 'iron_skin_manual', 'cloudwalk_manual', 'tide_breath_manual', 'stone_aegis_manual', 'rift_step_scroll', 'moonstone_pendant', 'spirit_stone'],
    },
  },
  {
    id: 'sys_void',
    order: 10,
    nameVi: 'Hệ Thống Hư Vô',
    nameEn: 'Void System',
    headerVi: '【Hệ Thống Hư Vô】',
    headerEn: '【Void System】',
    personalityVi: 'Hệ Thống nhìn xuyên mọi thứ. Kể cả ngươi.',
    personalityEn: 'The System sees through everything. Even you.',
    questPoolId: 'void-1',
    rewardBudget: {
      minGold: 50,
      maxGold: 100,
      minSpiritStones: 1,
      maxSpiritStones: 5,
      itemPool: ['pill_ls_cloud', 'pill_ls_iron', 'pill_ls_marrow', 'pill_ls_ninefold', 'spirit_stone', 'rift_step_scroll', 'stone_aegis_manual'],
    },
  },
]

export function systemById(id: string): SystemDef | undefined {
  return SYSTEMS.find((system) => system.id === id)
}
