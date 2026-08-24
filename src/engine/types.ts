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
  lastLotteryDay: number | null
  corrections: number
  convergenceCount: number
  terminal: boolean
  endingId: string | null
}

export type Direction = 'north' | 'south' | 'east' | 'west'

export type Action =
  | { kind: 'move'; direction: Direction }
  | { kind: 'rest' }
  | { kind: 'train' }
  | { kind: 'gather' }
  | { kind: 'buy'; itemId: string; qty?: number }
  | { kind: 'sell'; itemId: string; qty?: number }
  | { kind: 'use_item'; itemId: string; qty?: number }
  | { kind: 'store'; itemId: string; qty: number }
  | { kind: 'withdraw'; itemId: string; qty: number }
  | { kind: 'draw_lottery' }
  | { kind: 'talk'; npcId: string }
  | { kind: 'accept_quest'; questId: string }
  | { kind: 'complete_quest'; questId: string }
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
] as const

export type ErrorCode = (typeof ERROR_CODES)[number]

export type GameEvent =
  | { type: 'GAME_STARTED'; seed: string }
  | { type: 'MOVED'; from: string; to: string }
  | { type: 'DAY_PASSED'; day: number }
  | { type: 'RESTED'; hpHeal: number }
  | { type: 'TRAINED'; gain: number; stage: number }
  | { type: 'GATHERED'; itemId: string; qty: number }
  | { type: 'ITEM_USED'; itemId: string; hpDelta: number; qiDelta: number }
  | { type: 'BOUGHT'; itemId: string; qty: number; goldPaid: number }
  | { type: 'SOLD'; itemId: string; qty: number; goldGain: number }
  | { type: 'STORED'; itemId: string; qty: number }
  | { type: 'WITHDRAWN'; itemId: string; qty: number }
  | { type: 'DRAW_RESULT'; tier: 'grand' | 'major' | 'minor' | 'herb' | 'none'; goldDelta: number; itemId?: string }
  | { type: 'TALKED'; npcId: string }
  | { type: 'QUEST_ACCEPTED'; questId: string }
  | { type: 'QUEST_COMPLETED'; questId: string; rewardGold: number }
  | { type: 'WARNING'; level: number; locationId: string; messageVi: string; messageEn: string }
  | { type: 'WARD_USED'; itemId: string }
  | { type: 'DAMAGED'; amount: number; source: string }
  | { type: 'DEATH'; cause: string }
  | { type: 'ACHIEVEMENT_UNLOCKED'; achievementId: string }
  | { type: 'ENDING'; endingId: string }
  | { type: 'CORRECTION_REJECTED'; count: number }
  | { type: 'FORCED_CONVERGENCE'; action: ConcreteAction }
  | { type: 'ERROR'; code: ErrorCode }

export interface TransitionResult {
  state: GameState
  events: GameEvent[]
}
