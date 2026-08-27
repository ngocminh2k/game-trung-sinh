export type Locale = 'vi' | 'en'

export interface Attrs {
  body: number
  mind: number
  charm: number
  luck: number
}

export interface PlayerState {
  hp: number
  qi: number
  gold: number
  attrs: Attrs
  stage: number
  progress: number
  posX: number
  posY: number
  locationId: string
  alive: boolean
}

export interface SpiritRootInfo {
  kind: 'defective'
  elementVi: string
  elementEn: string
  efficiency: number
}

export type QuestStatus = 'available' | 'active' | 'completed'

export interface QuestRuntime {
  status: QuestStatus
}

export type EquipmentSlot = 'weapon' | 'robe' | 'accessory'

export interface EquipmentState {
  weapon: string | null
  robe: string | null
  accessory: string | null
}

export interface EncounterState {
  enemyId: string
  hp: number
  maxHp: number
  guard: number
}

export interface GameState {
  version: 1
  seed: string
  rng: number
  day: number
  player: PlayerState
  spiritRoot: SpiritRootInfo
  inventory: Record<string, number>
  storage: Record<string, number>
  flags: Record<string, number | boolean | string>
  quests: Record<string, QuestRuntime>
  achievements: string[]
  talents: string[]
  techniques: Record<string, number>
  equipment: EquipmentState
  encounter: EncounterState | null
  lastLotteryDay: number | null
  corrections: number
  terminal: boolean
  endingId: string | null
}

export type Direction = 'north' | 'south' | 'east' | 'west'

export type Action =
  | { kind: 'move'; direction: Direction }
  | { kind: 'rest' }
  | { kind: 'train' }
  | { kind: 'gather' }
  | { kind: 'refine'; recipeId: string }
  | { kind: 'buy'; itemId: string; qty?: number }
  | { kind: 'sell'; itemId: string; qty?: number }
  | { kind: 'use_item'; itemId: string; qty?: number }
  | { kind: 'store'; itemId: string; qty: number }
  | { kind: 'withdraw'; itemId: string; qty: number }
  | { kind: 'draw_lottery' }
  | { kind: 'talk'; npcId: string }
  | { kind: 'accept_quest'; questId: string }
  | { kind: 'complete_quest'; questId: string }
  | { kind: 'choose_talent'; talentId: string }
  | { kind: 'learn_technique'; techniqueId: string }
  | { kind: 'equip_item'; itemId: string }
  | { kind: 'start_encounter' }
  | { kind: 'combat_attack'; techniqueId: string }
  | { kind: 'combat_defend' }
  | { kind: 'story_choice'; choiceId: string }
  | { kind: 'free_text'; raw: string }
  | { kind: 'restart'; seed: string }

export type ConcreteAction = Exclude<Action, { kind: 'free_text' } | { kind: 'restart' }>

// Single runtime source of truth for error codes: the ErrorCode union is
// derived from this array, and the i18n test asserts every entry maps to an
// `errors.*` key in both dictionaries.
export const ERROR_CODES = [
  'TERMINAL',
  'MOVE_BLOCKED',
  'NOT_AT_LOCATION',
  'INSUFFICIENT_GOLD',
  'INSUFFICIENT_QI',
  'NO_ITEM',
  'ITEM_NOT_USABLE',
  'ITEM_UNAVAILABLE',
  'INVALID_QTY',
  'STORAGE_FULL',
  'STORAGE_EMPTY',
  'LOTTERY_ALREADY_DRAWN',
  'LOTTERY_NEED_GOLD',
  'QUEST_UNKNOWN',
  'QUEST_WRONG_STATE',
  'NPC_UNKNOWN',
  'NPC_NOT_HERE',
  'STORY_CHOICE_UNAVAILABLE',
] as const

export type ErrorCode = (typeof ERROR_CODES)[number]

export type GameEvent =
  | { type: 'GAME_STARTED'; seed: string }
  | { type: 'MOVED'; from: string; to: string }
  | { type: 'NODE_REACHED'; nodeId: string; nameVi: string; nameEn: string; kind: 'npc' | 'event' | 'exit' | 'danger' }
  | { type: 'DAY_PASSED'; day: number }
  | { type: 'RESTED'; hpHeal: number }
  | { type: 'TRAINED'; gain: number; stage: number }
  | { type: 'GATHERED'; itemId: string; qty: number }
  | { type: 'REFINED'; recipeId: string; itemId: string; qty: number }
  | { type: 'ITEM_USED'; itemId: string; hpDelta: number; qiDelta: number }
  | { type: 'BOUGHT'; itemId: string; qty: number; goldPaid: number }
  | { type: 'SOLD'; itemId: string; qty: number; goldGain: number }
  | { type: 'STORED'; itemId: string; qty: number }
  | { type: 'WITHDRAWN'; itemId: string; qty: number }
  | { type: 'DRAW_RESULT'; tier: 'grand' | 'major' | 'minor' | 'herb' | 'none'; goldDelta: number; itemId?: string }
  | { type: 'TALKED'; npcId: string; lineVi?: string; lineEn?: string }
  | { type: 'STORY_CHOICE'; sceneId: string; choiceId: string; nextSceneId: string | null }
  | { type: 'QUEST_ACCEPTED'; questId: string }
  | { type: 'QUEST_COMPLETED'; questId: string; rewardGold: number }
  | { type: 'TALENT_CHOSEN'; talentId: string }
  | { type: 'TECHNIQUE_LEARNED'; techniqueId: string; level: number }
  | { type: 'EQUIPPED'; itemId: string; slot: EquipmentSlot }
  | { type: 'ENCOUNTER_STARTED'; enemyId: string }
  | { type: 'COMBAT_HIT'; actor: 'player' | 'enemy'; amount: number; enemyId: string }
  | { type: 'COMBAT_GUARDED'; amount: number }
  | { type: 'COMBAT_WON'; enemyId: string; rewardGold: number }
  | { type: 'WARNING'; level: number; locationId: string; messageVi: string; messageEn: string }
  | { type: 'WARD_USED'; itemId: string }
  | { type: 'DAMAGED'; amount: number; source: string }
  | { type: 'DEATH'; cause: string }
  | { type: 'ACHIEVEMENT_UNLOCKED'; achievementId: string }
  | { type: 'ENDING'; endingId: string }
  | { type: 'CORRECTION_REJECTED'; count: number }
  | { type: 'ERROR'; code: ErrorCode }

export interface TransitionResult {
  state: GameState
  events: GameEvent[]
}
