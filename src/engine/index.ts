export { newlyQualifiedAchievements } from './achievements'
export { currentBeat } from './beats'
export { currentStoryScene, findStoryChoice, storyRouteEncounter, storyRouteProof, storyRouteTarget } from './story'
export {
  canAcceptQuest,
  canCompleteQuest,
  countCompletedQuests,
  currentStepIndex,
  getQuestCategory,
  isQuestUnlocked,
  isTurnInReady,
  questCategoryLabel,
  questStatus,
  type QuestCategory,
} from './quests'
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

// P1-4: affection read helper. Prefers the structured map; falls back to the
// legacy aff_<npcId> flag so old saves stay queryable through the same API.
export function getAffection(state: GameState, npcId: string): number {
  const mapped = state.affection?.[npcId]
  if (typeof mapped === 'number') return mapped
  const legacy = state.flags[`aff_${npcId}`]
  return typeof legacy === 'number' ? legacy : 0
}
export { TIME_MODS, TIME_SLOTS, TIME_OF_DAY_EN, TIME_OF_DAY_VI, advanceTime, currentTimeOfDay, restToDawn } from './time'
export { LOW_HP_WARNING, damageRoll, dangerWarning } from './danger'
export { evaluateEndingId, evaluateReincarnationKarma, type KarmaMilestoneBreakdown } from './endings'
export { checkLottery, rollLottery } from './lottery'
export { checkMoveFrom, findPath, playerPosition, targetCell, hasBuriedRelicAt, getBuriedRelicHint, type BuriedRelicHint } from './map'
export { narrate, narrateLine, FALLBACK_TEXT } from './narrator'
export { applyAction, readDeathCause, totalInventoryUnits } from './reducer'
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
  isBreakthroughReady,
  playerMaxHp,
} from './stats'
export {
  canStore,
  canWithdraw,
  itemTotalHeld,
  storageRemaining,
  storageUnitsUsed,
} from './storage'
export { useGameStore } from './store'
export {
  weatherFor,
  seasonFor,
  WEATHER_EFFECTS,
  isBloodMoon,
  bloodMoonDamageModifier,
  elementWeatherModifier,
  weatherDodgeBonus,
  getPlayerElement,
  LUNAR_MONTH_DAYS,
  THIEN_CAN_VI,
  THIEN_CAN_EN,
  DIA_CHI_VI,
  DIA_CHI_EN,
  SEASON_NAMES_VI,
  SEASON_NAMES_EN,
  WEATHER_NAMES_VI,
  WEATHER_NAMES_EN,
  WEATHER_ICONS,
  WEATHER_ITEM_RAINCOAT,
  WEATHER_ITEM_SUN_GEM,
  WEATHER_ITEM_FOG_TALISMAN,
  hasWeatherCounterItem,
  getEffectiveWeatherEffects,
  getEffectiveElementModifier,
  getEffectiveWeatherDodgeBonus,
  getCanChiOfDay,
  getLunarDate,
  getLunarPhase,
  getWeatherForecast,
  type DayForecast,
  type LunarPhase,
  type LunarPhaseId,
  type Season,
  type WeatherKind,
} from './weather'
export {
  GOLD_TO_SILVER,
  LS_TO_GOLD,
  MARKET_TOLL_RATE,
  applyMarketToll,
  calculateArbitrage,
  calculateMarketToll,
  canAffordCurrency,
  goldToSilver,
  goldToSpiritStones,
  silverToGold,
  spendCurrency,
} from './economy'
export { MEMORY_GATE, MEMORY_TOTAL, memoryMilestone, rememberedCount, rememberNames } from './memory'
export { formatSystemMessage, queueDrain, queuePush } from './system'
export {
  DEFAULT_MARKET_LOCATION,
  entryPrice,
  effectiveTradePrice,
  isCrossRegionalShop,
  marketPriceFor,
  marketTollForTrade,
  shopForNpc,
  validateShops,
  type PriceTier,
  type ShopPrice,
} from './shopStock'
export {
  COMPANION_EXTRA_ACTION,
  TIEU_THAO_COMPANION_ID,
  calculateCompanionHeal,
  companionBuff,
  companionHealAmount,
  canTame,
} from './companion'
export {
  activeSystem,
  budgetOk,
  canChooseSystem,
  calculateSystemCombatDamageBonus,
  calculateSystemCultivationBonus,
  calculateSystemDangerDamageReduction,
  calculateSystemRestHealBonus,
  calculateSystemShopDiscount,
  isSystemQuest,
  isVoidDemonGodActive,
  systemMechanismText,
  systemPassiveBonus,
  systemQuestsFor,
  type SystemPassiveBonus,
} from './system-runtime'
export { ENEMIES, EQUIPMENT, TALENTS, TECHNIQUES } from '../content/rpg'
export { chooseInheritedRelic, canBuryRelic, buryRelic, canUnearthRelic, unearthRelic } from './relics'
export {
  OFFLINE_CAP_MS,
  OFFLINE_MIN_MS,
  OFFLINE_PROGRESS_PER_HOUR,
  calculateOfflineGains,
  applyOfflineGains,
} from './offline'
export {
  HIBERNATE_MAX_DAYS,
  HIBERNATE_MAX_HOURS,
  HIBERNATE_MAX_MS,
  canHibernate,
  enterHibernation,
  wakeFromHibernation,
  isHibernating,
  calculateHibernatedTime,
} from './time'
export {
  DEFAULT_GLOBAL_PROFILE,
  GLOBAL_PROFILE_VERSION,
  mergeGlobalProfile,
  parseGlobalProfile,
  recordTerminal,
  type BuriedRelic,
} from './globalProfile'
export {
  OUTFITS,
  TITLES,
  OUTFIT_TITLE_SYNERGIES,
  getOutfit,
  getTitle,
  getOutfitTitleSynergy,
  canBuyOutfit,
  buyOutfit,
  equipOutfit,
  equipTitle,
  getActiveSynergy,
  isTitleUnlocked,
  getUnlockedTitles,
  calculateSynergyCharmBonus,
  calculateSynergyShopDiscount,
  calculateSynergyTravelReduction,
  isZeroCombatStatsGuaranteed,
  type OutfitDef,
  type TitleDef,
  type OutfitTitleSynergy,
  type OutfitRarity,
  type CurrencyTier,
  type SynergyAura,
} from './outfits'

export {
  deriveSystemAdvice,
  generateSessionRecap,
  formatAwayDuration,
  type AdvicePriority,
  type AdviceTag,
  type AdviceActionSuggestion,
  type SystemAdvice,
  type ActiveQuestRecap,
  type SessionRecap,
} from './sessionRecap'

export {
  getSceneText,
  toConciseText,
  SCENE_CONCISE_TEXTS,
} from './concise'

export function validateGameState(state: unknown): GameState {
  return parseGameState(state)
}

// Issue 8: the UI load path (parseSession) routes saves through migration
// before validation so pre-version saves survive the schema's version gate.
export { migrateGameState, migrate } from './migration'

// Issue #37/#38 — read-only danger prediction, plus the #38 resume context line.
export {
  resumeContextLine,
  travelRisk,
  travelRiskLabel,
  type TravelRisk,
} from './telegraph'

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
  HibernationState,
  Locale,
  PlayerState,
  TimeOfDay,
  TransitionResult,
} from './types'
export type { GlobalProfile, ProfileDelta } from './globalProfile'
export type { OfflineGains, OfflineSession } from './offline'
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
