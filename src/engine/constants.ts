import type { GameState } from './types'

export const GAME_STATE_VERSION = 1 as const

export const DEFAULT_SEED = 'ink-and-jade'

export const START_DAY = 1
export const START_GOLD = 60

export const MAX_HP = 100
export const MAX_QI = 60

export const STAGE_THRESHOLDS = [0, 12, 30, 55, 85, 120] as const
export const MAX_STAGE = STAGE_THRESHOLDS.length - 1

export const DEFECTIVE_ROOT_EFFICIENCY = 0.5
export const MANUAL_ROOT_EFFICIENCY = 0.75
export const TRAIN_BASE_PROGRESS = 4
export const TRAIN_HP_COST = 6
export const TRAIN_QI_COST = 10

export const REST_HEAL_HP = 30

// Locations with danger >= this level are "high danger": entering one consumes
// a warding talisman instead of rolling damage. Lower-danger locations (e.g.
// the misty woods) always deal damage and never burn a talisman.
export const HIGH_DANGER_LEVEL = 2

export const STORAGE_CAPACITY = 50

export const LOTTERY_COST = 10
export const LOTTERY_ROLL_MAX = 16
export const LOTTERY_GRAND_GOLD = 300
export const LOTTERY_MAJOR_GOLD = 60
export const LOTTERY_MINOR_GOLD = 20

export const CORRECTION_LIMIT = 3

export const WEALTH_ENDING_GOLD = 600
export const PEACE_ENDING_DAY = 30
export const PEACE_ENDING_GOLD = 200

export const ITEM_MANUAL = 'old_manual'
export const ITEM_TALISMAN = 'warding_talisman'
export const ITEM_HERB = 'spirit_herb'
export const LOCATION_MARKET = 'market'
export const LOCATION_SECT = 'sect'
export const LOCATION_HERB_FIELD = 'herb_field'
export const LOCATION_CAVE = 'sealed_cave'
export const LOCATION_RIFT = 'cursed_rift'
export const LOCATION_VILLAGE = 'village'

export function newGame(seed: string): GameState {
  return {
    version: GAME_STATE_VERSION,
    seed,
    rng: hashSeed(seed),
    day: START_DAY,
    player: {
      hp: MAX_HP,
      qi: MAX_QI,
      gold: START_GOLD,
      attrs: { body: 3, mind: 4, charm: 3, luck: 2 },
      stage: 0,
      progress: 0,
      posX: 3,
      posY: 3,
      locationId: LOCATION_VILLAGE,
      alive: true,
    },
    spiritRoot: {
      kind: 'defective',
      elementVi: 'Mộc hỗn tạp',
      elementEn: 'Muddled Wood',
      efficiency: DEFECTIVE_ROOT_EFFICIENCY,
    },
    inventory: { [ITEM_HERB]: 1, pill_hp: 1 },
    storage: {},
    flags: {},
    quests: {},
    achievements: [],
    lastLotteryDay: null,
    corrections: 0,
    convergenceCount: 0,
    terminal: false,
    endingId: null,
  }
}

export function hashSeed(seed: string): number {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507)
  h = Math.imul(h ^ (h >>> 13), 3266489909)
  return (h ^ (h >>> 16)) >>> 0
}
