export type Locale = 'vi' | 'en'

/** Combat-pressure preset. 'balanced' reproduces the pre-menu engine rules
 *  exactly; 'story' softens enemy output; 'hard' sharpens it. Never feeds RNG. */
export type GameDifficulty = 'story' | 'balanced' | 'hard'

export interface Attrs {
  body: number
  mind: number
  charm: number
  luck: number
}

export type AttributeName = keyof Attrs

export interface PlayerState {
  hp: number
  qi: number
  gold: number
  /** Multi-tier currency. Migration: schema defaults keep old saves valid. */
  silver?: number
  /** Spirit-stone (Linh Thạch) tier. Migration: schema defaults keep old saves valid. */
  spiritStones?: number
  attrs: Attrs
  stage: number
  realmLevel: number
  progress: number
  pendingAttributePoints: number
  posX: number
  posY: number
  locationId: string
  alive: boolean
  /** Combat conditions (poison, paralysis…). Optional so older saves stay
   *  valid; the reducer treats a missing array as empty. */
  status?: import('./content-types').StatusEffect[]
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
  /** Index into QuestDef.steps of the current step. Defaults to 0 for old saves. */
  step?: number
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
  /** Status effects on the enemy (poison, burn…). Optional so older saves
   *  stay valid; the reducer treats a missing array as empty. */
  statusEffects?: import('./content-types').StatusEffect[]
}

export interface GameState {
  version: 1
  seed: string
  rng: number
  day: number
  player: PlayerState
  /** Name-memory ids the player has unlocked (T10 data). Optional so older
   *  saves stay valid; the schema default fills [] on parse. */
  rememberedNames?: string[]
  /** Active companion beast id from beasts.ts (T06 data). Optional so older
   *  saves stay valid; the schema default fills null on parse. */
  companionId?: string | null
  /** 【Hệ Thống】 notification queue — reducer pushes, T14 renders (story canon). */
  systemQueue?: Array<{ id: string; vars: Record<string, string | number> }>
  /** Chosen System id (system-defs). null before boot; locked once set. */
  systemId?: string | null
  /** Combat pressure preset, chosen at new-game setup and persisted per save.
   *  Optional so older saves stay valid; the schema default is 'balanced'
   *  (byte-identical to the pre-difficulty engine rules). */
  difficulty?: GameDifficulty
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
  | { kind: 'allocate_attribute'; attribute: AttributeName }
  | { kind: 'gather' }
  | { kind: 'refine'; recipeId: string }
  | { kind: 'buy'; itemId: string; qty?: number }
  | { kind: 'sell'; itemId: string; qty?: number }
| { kind: 'convert_currency'; from: 'spiritStone' | 'silver'; qty: number }
  | { kind: 'use_item'; itemId: string; qty?: number }
  | { kind: 'store'; itemId: string; qty: number }
  | { kind: 'withdraw'; itemId: string; qty: number }
  | { kind: 'draw_lottery' }
  | { kind: 'talk'; npcId: string }
  | { kind: 'accept_quest'; questId: string }
  | { kind: 'turn_in_quest'; questId: string }
  /** System Layer: accept/turn-in from the System panel (no NPC/location). */
  | { kind: 'system_accept_quest'; questId: string }
  | { kind: 'system_turn_in_quest'; questId: string }
  /** Legacy alias retained for existing commands and saves. */
  | { kind: 'complete_quest'; questId: string }
  | { kind: 'choose_talent'; talentId: string }
  | { kind: 'learn_technique'; techniqueId: string }
  | { kind: 'equip_item'; itemId: string }
  | { kind: 'start_encounter' }
  | { kind: 'combat_attack'; techniqueId?: string }
  | { kind: 'combat_defend' }
  | { kind: 'combat_retreat' }

  | { kind: 'resolve_route_event'; approach: 'present' | 'withhold' }
  | { kind: 'story_choice'; choiceId: string }
  | { kind: 'advance_romance'; trackId: string; choiceId: string }
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
  'INSUFFICIENT_SILVER',
  'INSUFFICIENT_SPIRIT_STONES',
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
  'ATTRIBUTE_ALLOCATION_REQUIRED',
  'NO_ATTRIBUTE_POINTS',
  'ATTRIBUTE_MAXED',
] as const

export type ErrorCode = (typeof ERROR_CODES)[number]

export type GameEvent =
  | { type: 'GAME_STARTED'; seed: string }
  | { type: 'MOVED'; from: string; to: string }
  | { type: 'NODE_REACHED'; nodeId: string; nameVi: string; nameEn: string; kind: 'npc' | 'event' | 'exit' | 'danger' }
  | { type: 'DAY_PASSED'; day: number }
  | { type: 'RESTED'; hpHeal: number }
  | { type: 'TRAINED'; gain: number; stage: number }
  | { type: 'MINOR_REALM_ADVANCED'; stage: number; realmLevel: number; pointsGranted: number }
  | { type: 'ATTRIBUTE_ALLOCATED'; attribute: AttributeName; value: number; pointsRemaining: number }
  | { type: 'GATHERED'; itemId: string; qty: number; qiDrain: number }
  | { type: 'REFINED'; recipeId: string; itemId: string; qty: number }
  | { type: 'ITEM_USED'; itemId: string; hpDelta: number; qiDelta: number }
  | { type: 'BOUGHT'; itemId: string; qty: number; goldPaid: number }
  | { type: 'SOLD'; itemId: string; qty: number; goldGain: number }
  | { type: 'CURRENCY_CONVERTED'; from: 'spiritStone' | 'silver'; qty: number; goldGain: number }
  | { type: 'STORED'; itemId: string; qty: number }
  | { type: 'WITHDRAWN'; itemId: string; qty: number }
  | { type: 'DRAW_RESULT'; tier: 'grand' | 'major' | 'minor' | 'herb' | 'none'; goldDelta: number; itemId?: string }
  | { type: 'TALKED'; npcId: string; lineVi?: string; lineEn?: string }
  | { type: 'AFFINITY'; npcId: string; level: number }
  | { type: 'ROUTE_EVENT_RESOLVED'; route: 'mercy' | 'wealth' | 'truth'; approach: 'present' | 'withhold'; proofVi: string; proofEn: string; progressDelta: number; qiDelta: number; goldDelta: number }
  | { type: 'STORY_CHOICE'; sceneId: string; choiceId: string; nextSceneId: string | null }
  | { type: 'ROMANCE_NODE'; npcId: string; nodeId: string; choiceId: string; titleVi: string; titleEn: string }
  | { type: 'QUEST_ACCEPTED'; questId: string }
  | { type: 'QUEST_COMPLETED'; questId: string; rewardGold: number }
  | { type: 'SYSTEM_CHOSEN'; systemId: string }
  | { type: 'TALENT_CHOSEN'; talentId: string }
  | { type: 'TECHNIQUE_LEARNED'; techniqueId: string; level: number }
  | { type: 'EQUIPPED'; itemId: string; slot: EquipmentSlot }
  | { type: 'ENCOUNTER_STARTED'; enemyId: string }
  | { type: 'QI_SPENT'; amount: number }
  | { type: 'COMBAT_HIT'; actor: 'player' | 'enemy'; amount: number; enemyId: string }
  | { type: 'COMBAT_GUARDED'; amount: number }
  | { type: 'COMBAT_WON'; enemyId: string; rewardGold: number }
  | { type: 'COMBAT_RETREATED'; enemyId: string; hpCost: number; progressCost: number }
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
