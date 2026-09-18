export type OutfitRarity = 'common' | 'rare' | 'epic' | 'legendary'
export type CurrencyTier = 'silver' | 'gold' | 'spiritStones'
export type SynergyAura = 'ink_drift' | 'azure_sky' | 'crimson_flame' | 'purple_mist' | 'golden_shimmer'

export interface CombatStatsZero {
  hp: 0
  attack: 0
  defense: 0
  crit: 0
}

export interface OutfitDef {
  id: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  rarity: OutfitRarity
  visualTag: string
  price: {
    currency: CurrencyTier
    amount: number
  }
  synergyTitleId: string
  combatStats: CombatStatsZero
}

export type TitleRequirementType = 'default' | 'achievement' | 'stage' | 'realm' | 'reincarnation'

export interface TitleDef {
  id: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  rarity: OutfitRarity
  prefixVi: string
  prefixEn: string
  requirement: {
    type: TitleRequirementType
    targetId?: string
    threshold?: number
  }
  combatStats: CombatStatsZero
}

export interface OutfitTitleSynergy {
  id: string
  outfitId: string
  titleId: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  flavorVi: string
  flavorEn: string
  buffs: {
    charmBonus: number
    shopDiscountPct: number
    travelStaminaReductionPct: number
    visualAura: SynergyAura
    prestigeTitle: { vi: string; en: string }
    combatAttackBonus: 0
    combatDefenseBonus: 0
    combatHpBonus: 0
    combatCritBonus: 0
  }
}

export const OUTFITS: OutfitDef[] = [
  {
    id: 'outfit_bamboo_scholar',
    nameVi: 'Áo Trúc Danh Sĩ',
    nameEn: 'Bamboo Scholar Robe',
    descVi: 'Được dệt từ sợi trúc thanh tao vùng núi Vân Mộng. Thanh nhã xuất trần, không nhiễm phong trần tục thế.',
    descEn: 'Woven from pristine bamboo fibers of Yunmeng Mountain. Refined and detached from earthly dust.',
    rarity: 'common',
    visualTag: 'bamboo_green',
    price: { currency: 'silver', amount: 50 },
    synergyTitleId: 'title_novice',
    combatStats: { hp: 0, attack: 0, defense: 0, crit: 0 },
  },
  {
    id: 'outfit_pure_wind',
    nameVi: 'Thanh Phong Đạo Bào',
    nameEn: 'Pure Wind Taoist Robe',
    descVi: 'Vạt áo bồng bềnh tựa gió thoảng qua đỉnh tuyết sơn, giúp tâm thần an định khi ngao du thiên hạ.',
    descEn: 'Flutters gracefully like winds over snowbound peaks, steadying the heart on boundless journeys.',
    rarity: 'rare',
    price: { currency: 'silver', amount: 120 },
    visualTag: 'azure_wind',
    synergyTitleId: 'title_wind_walker',
    combatStats: { hp: 0, attack: 0, defense: 0, crit: 0 },
  },
  {
    id: 'outfit_crimson_sand',
    nameVi: 'Xích Sa Chiến Y',
    nameEn: 'Crimson Sand Battle Garb',
    descVi: 'Ngoại trang nhuộm sắc cát đỏ sa mạc Hoàng Lăng, toát lên khí phách bất khuất của bậc nghịch thiên.',
    descEn: 'Dyed in the crimson sands of the Huangling desert, radiating the defiance of one who resists fate.',
    rarity: 'rare',
    price: { currency: 'gold', amount: 25 },
    visualTag: 'crimson_silk',
    synergyTitleId: 'title_fate_defier',
    combatStats: { hp: 0, attack: 0, defense: 0, crit: 0 },
  },
  {
    id: 'outfit_purple_cloud',
    nameVi: 'Tử Vân Tiên Y',
    nameEn: 'Purple Cloud Celestial Raiment',
    descVi: 'Dệt bằng sợi mây tía từ tầng trời thứ chín. Tỏa ra sương khói huyền diệu khiến thế nhân kính ngưỡng.',
    descEn: 'Spun from purple clouds of the ninth heaven. Swirling with mystical mist that commands reverence.',
    rarity: 'legendary',
    price: { currency: 'spiritStones', amount: 10 },
    visualTag: 'purple_aurora',
    synergyTitleId: 'title_revered_master',
    combatStats: { hp: 0, attack: 0, defense: 0, crit: 0 },
  },
]

export const TITLES: TitleDef[] = [
  {
    id: 'title_novice',
    nameVi: 'Sơ Nhập Tu Chân',
    nameEn: 'Novice Cultivator',
    descVi: 'Người mới bước chân vào con đường tầm tiên vấn đạo, tâm chí kiên định hướng thượng.',
    descEn: 'One who has just embarked on the path of seeking immortality with an earnest heart.',
    rarity: 'common',
    prefixVi: 'Đạo Đồng',
    prefixEn: 'Dao Disciple',
    requirement: { type: 'default' },
    combatStats: { hp: 0, attack: 0, defense: 0, crit: 0 },
  },
  {
    id: 'title_herb_master',
    nameVi: 'Thảo Dược Tông Sư',
    nameEn: 'Herb Grandmaster',
    descVi: 'Thông tường muôn loài linh thảo, ngón tay thoăn thoắt nhặt lá hái hoa trong rừng thẳm.',
    descEn: 'Master of mystical flora, deftly gathering spiritual herbs across deep mountain valleys.',
    rarity: 'rare',
    prefixVi: 'Dược Vương',
    prefixEn: 'Medicine Sage',
    requirement: { type: 'achievement', targetId: 'green_thumb' },
    combatStats: { hp: 0, attack: 0, defense: 0, crit: 0 },
  },
  {
    id: 'title_wind_walker',
    nameVi: 'Ngự Phong Du Hiệp',
    nameEn: 'Wind Walker Wanderer',
    descVi: 'Bước chân nhẹ nhàng lướt trên ngọn cỏ, ngao du tứ hải không vướng bận hồng trần.',
    descEn: 'Treading lightly atop grassy blades, roaming the four seas without worldly burdens.',
    rarity: 'rare',
    prefixVi: 'Ngự Phong Giả',
    prefixEn: 'Wind Strider',
    requirement: { type: 'stage', threshold: 2 },
    combatStats: { hp: 0, attack: 0, defense: 0, crit: 0 },
  },
  {
    id: 'title_fate_defier',
    nameVi: 'Nghịch Mệnh Tiên Phong',
    nameEn: 'Fate Defier',
    descVi: 'Quyết không cúi đầu trước thiên mệnh định sẵn, vượt qua vô vàn nghịch cảnh hiểm nghèo.',
    descEn: 'Refusing to bow before predetermined destiny, conquering countless perilous odds.',
    rarity: 'rare',
    prefixVi: 'Nghịch Mệnh Giả',
    prefixEn: 'Fate Defier',
    requirement: { type: 'stage', threshold: 3 },
    combatStats: { hp: 0, attack: 0, defense: 0, crit: 0 },
  },
  {
    id: 'title_revered_master',
    nameVi: 'Nhất Đại Tông Sư',
    nameEn: 'Revered Grandmaster',
    descVi: 'Đạt tới cảnh giới thâm sâu khó lường, muôn người kính phục xưng tụng danh xưng cao quý.',
    descEn: 'Reached an unfathomable realm of enlightenment, revered by peers across the land.',
    rarity: 'legendary',
    prefixVi: 'Tông Sư',
    prefixEn: 'Grandmaster',
    requirement: { type: 'realm', threshold: 2 },
    combatStats: { hp: 0, attack: 0, defense: 0, crit: 0 },
  },
]

export const OUTFIT_TITLE_SYNERGIES: OutfitTitleSynergy[] = [
  {
    id: 'synergy_bamboo_novice',
    outfitId: 'outfit_bamboo_scholar',
    titleId: 'title_novice',
    nameVi: 'Trúc Vận Đạo Đồng (Resonance)',
    nameEn: 'Bamboo Dao Novice (Resonance)',
    descVi: 'Áo Trúc kết hợp cùng sơ tâm Đạo Đồng, tạo nên khí chất thư sinh nho nhã mộc mạc.',
    descEn: 'Bamboo robe harmonizing with beginner sincerity, exuding tranquil scholarly grace.',
    flavorVi: 'Tâm như gương sáng, thân tựa cành trúc, tuy non trẻ mà phong thái thanh cao.',
    flavorEn: 'Heart clear as a mirror, form supple like bamboo, humble yet dignified.',
    buffs: {
      charmBonus: 10,
      shopDiscountPct: 5,
      travelStaminaReductionPct: 10,
      visualAura: 'ink_drift',
      prestigeTitle: {
        vi: 'Thanh Nhã Đạo Đồng',
        en: 'Graceful Dao Disciple',
      },
      combatAttackBonus: 0,
      combatDefenseBonus: 0,
      combatHpBonus: 0,
      combatCritBonus: 0,
    },
  },
  {
    id: 'synergy_wind_walker',
    outfitId: 'outfit_pure_wind',
    titleId: 'title_wind_walker',
    nameVi: 'Thanh Phong Du Tiên (Resonance)',
    nameEn: 'Pure Wind Nomad (Resonance)',
    descVi: 'Áo Thanh Phong hòa cùng danh xưng Ngự Phong, giúp thân pháp nhẹ nhõm khi ngao du thiên hạ.',
    descEn: 'Wind robe melding with Wind Walker title, lending effortless lightness to journeys.',
    flavorVi: 'Vạt áo cuốn theo làn gió nhẹ, dạo bước qua ngàn non mà gót hài không vương bụi đất.',
    flavorEn: 'Hem catching the alpine breeze, traversing thousand peaks with dustless soles.',
    buffs: {
      charmBonus: 15,
      shopDiscountPct: 5,
      travelStaminaReductionPct: 15,
      visualAura: 'azure_sky',
      prestigeTitle: {
        vi: 'Ngự Phong Tiên Lữ',
        en: 'Celestial Wind Traveler',
      },
      combatAttackBonus: 0,
      combatDefenseBonus: 0,
      combatHpBonus: 0,
      combatCritBonus: 0,
    },
  },
  {
    id: 'synergy_crimson_fate',
    outfitId: 'outfit_crimson_sand',
    titleId: 'title_fate_defier',
    nameVi: 'Xích Viêm Nghịch Mệnh (Resonance)',
    nameEn: 'Crimson Fate Defier (Resonance)',
    descVi: 'Áo Xích Sa cùng danh hiệu Nghịch Mệnh bộc phát hào quang đỏ rực bất khuất.',
    descEn: 'Crimson garb combined with Fate Defier title radiates an unyielding fiery aura.',
    flavorVi: 'Mệnh do ta định không do trời, ngạo nghễ đạp lên chông gai mà tiến bước.',
    flavorEn: 'My destiny is mine to forge, treading proudly through thorns and flame.',
    buffs: {
      charmBonus: 20,
      shopDiscountPct: 8,
      travelStaminaReductionPct: 10,
      visualAura: 'crimson_flame',
      prestigeTitle: {
        vi: 'Xích Hỏa Nghịch Tiên',
        en: 'Crimson Flame Defier',
      },
      combatAttackBonus: 0,
      combatDefenseBonus: 0,
      combatHpBonus: 0,
      combatCritBonus: 0,
    },
  },
  {
    id: 'synergy_purple_master',
    outfitId: 'outfit_purple_cloud',
    titleId: 'title_revered_master',
    nameVi: 'Tử Khí Đông Lai (Resonance)',
    nameEn: 'Purple Mist Ascendant (Resonance)',
    descVi: 'Tiên y chín tầng mây hòa cùng khí độ Tông Sư, tỏa sáng rực rỡ khiến vạn linh kính sợ.',
    descEn: 'Nine-cloud raiment united with Grandmaster aura, commanding deep reverence from all.',
    flavorVi: 'Tử khí cuồn cuộn vạn dặm, phong thái uy nghiêm chấn nhiếp bát phương quần hùng.',
    flavorEn: 'Purple clouds billowing for ten thousand li, commanding majesty that stills the realm.',
    buffs: {
      charmBonus: 30,
      shopDiscountPct: 10,
      travelStaminaReductionPct: 20,
      visualAura: 'purple_mist',
      prestigeTitle: {
        vi: 'Chí Tôn Tông Sư',
        en: 'Supreme Grandmaster',
      },
      combatAttackBonus: 0,
      combatDefenseBonus: 0,
      combatHpBonus: 0,
      combatCritBonus: 0,
    },
  },
]
