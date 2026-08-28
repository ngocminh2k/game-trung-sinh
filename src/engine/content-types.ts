import type { ConcreteAction } from './types'

export interface ItemDef {
  id: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  aliases: string[]
  usable: boolean
  effects?: { hp?: number; qi?: number }
  equipmentSlot?: EquipmentSlot
  teachesTechniqueId?: string
  /** Market availability gate. Zero/undefined means immediately available. */
  requiredStage?: number
  buyPrice: number | null
  sellPrice: number | null
}

/** A market exchange turns exploration or combat loot into a concrete
 * expedition tool. Raw materials can always be sold instead, so each recipe
 * represents a deliberate short-term tradeoff rather than a mandatory gate. */
export interface RefinementRecipeDef {
  id: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  locationId: string
  ingredients: Record<string, number>
  output: { itemId: string; qty: number }
}

export type EquipmentSlot = 'weapon' | 'robe' | 'accessory'

export interface TalentDef {
  id: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  requiredStage: number
  /** One optional talent may be chosen from each tier. */
  tier: number
  selectable: boolean
  attackBonus: number
  defenseBonus: number
  trainingBonus: number
}

export interface TechniqueDef {
  id: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  requiredStage: number
  maxLevel: number
  power: number
  trainingBonus: number
  sourceItemId?: string
}

export interface EquipmentDef {
  id: string
  itemId: string
  slot: EquipmentSlot
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  attackBonus: number
  defenseBonus: number
  qiBonus: number
}

export interface EnemyDef {
  id: string
  locationId: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  maxHp: number
  attack: number
  rewardGold: number
  rewardItems: Record<string, number>
}

export interface LocationDef {
  id: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  danger: number
}

export type Terrain = 'plain' | 'road' | 'water' | 'mountain' | 'forest' | 'cave' | 'rift'

export interface CellDef {
  x: number
  y: number
  terrain: Terrain
  locationId?: string
}

/** A labelled point on a local-area map.  Nodes are deliberately content data,
 * not a UI-only list: a player reaches them by moving onto their cell. */
export interface MapNodeDef {
  id: string
  nameVi: string
  nameEn: string
  kind: 'npc' | 'event' | 'exit' | 'danger'
}

export interface RegionCellDef extends CellDef {
  node?: MapNodeDef
  /** Stepping onto an exit changes region and uses that region's authored entry. */
  exitTo?: string
}

export interface RegionMapDef {
  locationId: string
  cells: RegionCellDef[]
  /** Safe default/arrival point.  Every regional map has one. */
  entry: { x: number; y: number }
  /** Arrival points keyed by the region the player came from. */
  arrivals: Record<string, { x: number; y: number }>
}

export interface NpcDef {
  id: string
  nameVi: string
  nameEn: string
  roleVi: string
  roleEn: string
  locationId: string
  greetVi: string
  greetEn: string
  aliases: string[]
}

export interface ChapterDef {
  index: number
  nameVi: string
  nameEn: string
  taglineVi: string
  taglineEn: string
}

export interface EndingDef {
  id: string
  nameVi: string
  nameEn: string
  epitaphVi: string
  epitaphEn: string
}

export interface QuestDef {
  id: string
  giverNpcId: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  requiredItems: Record<string, number>
  requiredFlags: string[]
  rewardGold: number
  rewardItems: Record<string, number>
  aliases: string[]
}

export interface AchievementDef {
  id: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
}

export interface BeatDef {
  id: string
  chapter: number
  predicate: string
  titleVi: string
  titleEn: string
  textVi: string
  textEn: string
  suggested: ConcreteAction[]
}

/** A authored decision point. Effects are recorded in flags so saves remain
 * forward-compatible and the ending can read the player's whole history. */
export interface StoryChoiceDef {
  id: string
  labelVi: string
  labelEn: string
  consequenceVi: string
  consequenceEn: string
  nextSceneId: string | null
  effects?: Record<string, number | boolean | string>
  /** A concrete cost or boon makes a story stance felt before its ending. */
  playerDelta?: Partial<Record<'hp' | 'qi' | 'gold' | 'progress', number>>
  requires?: Record<string, number | boolean | string>
  final?: boolean
}

export interface StorySceneDef {
  id: string
  chapter: number
  titleVi: string
  titleEn: string
  textVi: string
  textEn: string
  choices: StoryChoiceDef[]
}
