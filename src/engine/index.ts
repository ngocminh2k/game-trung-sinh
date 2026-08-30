export { newlyQualifiedAchievements } from './achievements'
export { currentBeat } from './beats'
export { currentStoryScene, findStoryChoice, storyRouteEncounter, storyRouteProof, storyRouteTarget } from './story'
export { currentStepIndex, isQuestUnlocked, isTurnInReady, questStatus } from './quests'
export { currentRomanceNode, romanceProgress, romanceTrackUnlocked } from './romance'
export {
  BASIC_STRIKE_QI_COST,
  CORRECTION_LIMIT,
  DEADLINE_DAYS,
  DEFAULT_SEED,
  HIGH_DANGER_LEVEL,
  LOTTERY_COST,
  MAX_HP,
  MAX_QI,
  MAX_STAGE,
  RETREAT_HP_COST,
  RETREAT_PROGRESS_COST,
  STAGE_THRESHOLDS,
  START_GOLD,
  STORAGE_CAPACITY,
  WEALTH_ENDING_GOLD,
  newGame,
  techniqueGuard,
  techniqueQiCost,
} from './constants'
export { parseFreeText, normalizeText } from './corrections'
import type { GameState } from './types'
import { parseGameState } from './schema'
export { ERROR_CODES } from './types'
export { LOW_HP_WARNING, damageRoll, dangerWarning } from './danger'
export { evaluateEndingId } from './endings'
export { checkLottery, rollLottery } from './lottery'
export { checkMoveFrom, findPath, playerPosition, targetCell } from './map'
export { narrate, narrateLine, FALLBACK_TEXT } from './narrator'
export { applyAction, totalInventoryUnits } from './reducer'
export { initialRng, nextFloat, nextInt, pickFrom } from './rng'
export { buyPriceOf, canAfford, hasItem, isBuyable, isSellable, sellPriceOf } from './shop'
export {
  trainingEffectiveness,
  trainProgressGain,
  nextStageThreshold,
} from './stats'
export {
  canStore,
  canWithdraw,
  itemTotalHeld,
  storageRemaining,
  storageUnitsUsed,
} from './storage'
export { useGameStore } from './store'
export { ENEMIES, EQUIPMENT, TALENTS, TECHNIQUES } from '../content/rpg'
export { canAcceptQuest, canCompleteQuest } from './quests'

export function validateGameState(state: unknown): GameState {
  return parseGameState(state)
}

export type {
  Action,
  ConcreteAction,
  Direction,
  ErrorCode,
  GameEvent,
  GameState,
  Locale,
  PlayerState,
  TransitionResult,
} from './types'
export type {
  AchievementDef,
  BeatDef,
  CellDef,
  ChapterDef,
  EndingDef,
  ItemDef,
  RefinementRecipeDef,
  LocationDef,
  NpcDef,
  QuestDef,
  EnemyDef,
  EquipmentDef,
  EquipmentSlot,
  } from './content-types'
