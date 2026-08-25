import type { EnemyDef, EquipmentDef, TalentDef, TechniqueDef } from '../engine/content-types'

// These tables are content-only: the reducer stores stable ids, so new content
// can be appended without rewriting a player's deterministic save.
export const TALENTS: TalentDef[] = [
  {
    id: 'tenacious_root',
    nameVi: 'Linh Căn Lì Lợm',
    nameEn: 'Stubborn Spirit Root',
    descVi: 'Linh căn phế không nhanh, nhưng chưa từng chịu tắt.',
    descEn: 'A defective root is slow, but refuses to go out.',
    requiredStage: 0,
    selectable: false,
    attackBonus: 0,
    defenseBonus: 1,
    trainingBonus: 0,
  },
  {
    id: 'iron_bones',
    nameVi: 'Gân Cốt Sắt',
    nameEn: 'Iron Bones',
    descVi: 'Đau thì đau, nhưng xương vẫn đứng thẳng.',
    descEn: 'Pain is pain; the bones still stand straight.',
    requiredStage: 1,
    selectable: true,
    attackBonus: 0,
    defenseBonus: 2,
    trainingBonus: 0,
  },
  {
    id: 'wild_herbalist',
    nameVi: 'Dược Sư Cỏ Dại',
    nameEn: 'Wild Herbalist',
    descVi: 'Mỗi lần vận công, mùi cỏ thuốc khiến khí mạch ngoan hơn.',
    descEn: 'Herb scent makes the meridians a little more obedient.',
    requiredStage: 1,
    selectable: true,
    attackBonus: 0,
    defenseBonus: 0,
    trainingBonus: 1,
  },
  {
    id: 'fortunate_fool',
    nameVi: 'Kẻ Ngốc Có Phúc',
    nameEn: 'Fortunate Fool',
    descVi: 'Ra đòn có vẻ hồ đồ, nhưng thường trúng đúng chỗ.',
    descEn: 'The swing looks foolish, yet often lands exactly right.',
    requiredStage: 1,
    selectable: true,
    attackBonus: 2,
    defenseBonus: 0,
    trainingBonus: 0,
  },
]

export const TECHNIQUES: TechniqueDef[] = [
  {
    id: 'basic_staff_form',
    nameVi: 'Mộc Trượng Thức',
    nameEn: 'Wooden Staff Form',
    descVi: 'Ba thế đơn giản để giữ yêu quái ngoài tầm răng.',
    descEn: 'Three plain forms for keeping monsters beyond biting range.',
    requiredStage: 0,
    maxLevel: 1,
    power: 2,
    trainingBonus: 0,
  },
  {
    id: 'crooked_circulation',
    nameVi: 'Chu Thiên Cong Queo',
    nameEn: 'Crooked Circulation',
    descVi: 'Đường khí sai sách vở, lại vừa khít linh căn phế.',
    descEn: 'Wrong by every textbook, yet perfect for a defective root.',
    requiredStage: 0,
    maxLevel: 1,
    power: 3,
    trainingBonus: 1,
    sourceItemId: 'old_manual',
  },
  {
    id: 'rift_step',
    nameVi: 'Khe Bộ',
    nameEn: 'Rift Step',
    descVi: 'Một bước lệch nhịp, né mũi vuốt ngay trước khi nó tới.',
    descEn: 'One off-beat step, dodging the claw just before it arrives.',
    requiredStage: 2,
    maxLevel: 1,
    power: 5,
    trainingBonus: 0,
    sourceItemId: 'rift_step_scroll',
  },
]

export const EQUIPMENT: EquipmentDef[] = [
  {
    id: 'wooden_staff',
    itemId: 'wooden_staff',
    slot: 'weapon',
    nameVi: 'Mộc Trượng Cũ',
    nameEn: 'Old Wooden Staff',
    descVi: 'Không sắc, nhưng rất thuyết phục khi vung đúng lúc.',
    descEn: 'Not sharp, but persuasive when swung at the right moment.',
    attackBonus: 2,
    defenseBonus: 0,
    qiBonus: 0,
  },
  {
    id: 'tattered_robe',
    itemId: 'tattered_robe',
    slot: 'robe',
    nameVi: 'Áo Vải Vá',
    nameEn: 'Patched Cloth Robe',
    descVi: 'Vá nhiều hơn vải mới, vẫn che được gió.',
    descEn: 'More patch than cloth, still keeps the wind out.',
    attackBonus: 0,
    defenseBonus: 1,
    qiBonus: 0,
  },
  {
    id: 'jade_charm',
    itemId: 'jade_charm',
    slot: 'accessory',
    nameVi: 'Ngọc Bội Hộ Tâm',
    nameEn: 'Heartward Jade Charm',
    descVi: 'Một miếng ngọc mát tay, giữ tâm không loạn lúc nguy.',
    descEn: 'Cool jade that steadies the heart when danger closes in.',
    attackBonus: 0,
    defenseBonus: 1,
    qiBonus: 5,
  },
]

export const ENEMIES: EnemyDef[] = [
  {
    id: 'mist_boar',
    locationId: 'misty_forest',
    nameVi: 'Trư Nha Sương',
    nameEn: 'Mist-Tusk Boar',
    descVi: 'Nó hắt hơi ra sương rồi lao tới như một tảng đá có răng.',
    descEn: 'It sneezes fog and charges like a rock with teeth.',
    maxHp: 32,
    attack: 7,
    rewardGold: 16,
    rewardItems: { spirit_herb: 1 },
  },
  {
    id: 'seal_wraith',
    locationId: 'sealed_cave',
    nameVi: 'Oán Linh Phong Ấn',
    nameEn: 'Sealbound Wraith',
    descVi: 'Một bóng người bị bùa cũ kéo dài thành làn khói lạnh.',
    descEn: 'An old ward stretches a human shadow into cold smoke.',
    maxHp: 54,
    attack: 11,
    rewardGold: 42,
    rewardItems: { old_manual: 1 },
  },
  {
    id: 'rift_hound',
    locationId: 'cursed_rift',
    nameVi: 'Liệt Khuyển Khe Nứt',
    nameEn: 'Rift Hound',
    descVi: 'Bốn chân nó đứng ở đây, tiếng gầm lại vọng từ nơi khác.',
    descEn: 'Its paws stand here; its growl arrives from somewhere else.',
    maxHp: 72,
    attack: 15,
    rewardGold: 80,
    rewardItems: { rift_step_scroll: 1 },
  },
]

export function getTalent(id: string): TalentDef | undefined {
  return TALENTS.find((talent) => talent.id === id)
}

export function getTechnique(id: string): TechniqueDef | undefined {
  return TECHNIQUES.find((technique) => technique.id === id)
}

export function getEquipmentByItem(itemId: string): EquipmentDef | undefined {
  return EQUIPMENT.find((equipment) => equipment.itemId === itemId)
}

export function getEnemy(id: string): EnemyDef | undefined {
  return ENEMIES.find((enemy) => enemy.id === id)
}

export function enemyAt(locationId: string): EnemyDef | undefined {
  return ENEMIES.find((enemy) => enemy.locationId === locationId)
}
