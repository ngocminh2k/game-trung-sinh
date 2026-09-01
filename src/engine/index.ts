export { newlyQualifiedAchievements } from './achievements'
export { currentBeat } from './beats'
export { currentStoryScene, findStoryChoice, storyRouteEncounter, storyRouteProof, storyRouteTarget } from './story'
export { currentStepIndex, isQuestUnlocked, isTurnInReady, questStatus } from './quests'
export { currentRomanceNode, romanceProgress, romanceTrackUnlocked } from './romance'
export {
  ATTRIBUTE_MAX,
  ATTRIBUTE_POINTS_PER_BREAKTHROUGH,
  BASIC_STRIKE_QI_COST,
  CORRECTION_LIMIT,
  DEADLINE_DAYS,
  DEFAULT_SEED,
  HIGH_DANGER_LEVEL,
  LOTTERY_COST,
  MAX_HP,
  MAX_QI,
  MAX_STAGE,
  MINOR_REALM_MAX,
  MINOR_REALM_THRESHOLDS,
  RETREAT_HP_COST,
  RETREAT_PROGRESS_COST,
  STAGE_THRESHOLDS,
  START_GOLD,
  STORAGE_CAPACITY,
  WEALTH_ENDING_GOLD,
  damageMultiplier,
  newGame,
  techniqueGuard,
  techniqueQiCost,
  type NewGameOptions,
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
  attributeCombatBonus,
  attributeTrainingBonus,
  charmPriceDiscount,
  luckGatherBonus,
  minorRealmThreshold,
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
export { weatherFor, seasonFor, WEATHER_EFFECTS } from './weather'
export {
  GOLD_TO_SILVER,
  LS_TO_GOLD,
  canAffordCurrency,
  goldToSilver,
  goldToSpiritStones,
  silverToGold,
  spendCurrency,
} from './economy'
export { MEMORY_GATE, MEMORY_TOTAL, memoryMilestone, rememberedCount, rememberNames } from './memory'
export { formatSystemMessage, queueDrain, queuePush } from './system'
export { entryPrice, shopForNpc, validateShops } from './shopStock'
export { COMPANION_EXTRA_ACTION, canTame, companionBuff } from './companion'
export { activeSystem, budgetOk, canChooseSystem, isSystemQuest, systemQuestsFor } from './system-runtime'
export { ENEMIES, EQUIPMENT, TALENTS, TECHNIQUES } from '../content/rpg'
export { canAcceptQuest, canCompleteQuest } from './quests'

export function validateGameState(state: unknown): GameState {
  return parseGameState(state)
}

export type {
  Action,
  AttributeName,
  Attrs,
  ConcreteAction,
  Direction,
  EquipmentState,
  ErrorCode,
  GameDifficulty,
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
