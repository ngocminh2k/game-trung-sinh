import {
  MANUAL_ROOT_EFFICIENCY,
  MINOR_REALM_MAX,
  MINOR_REALM_THRESHOLDS,
  TRAIN_BASE_PROGRESS,
} from './constants'
import { ITEM_MANUAL } from './constants'
import { countOf } from './utils'
import { getTalent, getTechnique } from '../content/rpg'
import type { GameState } from './types'

export function trainingEffectiveness(state: GameState): number {
  return countOf(state.inventory, ITEM_MANUAL) > 0 || countOf(state.storage, ITEM_MANUAL) > 0
    ? MANUAL_ROOT_EFFICIENCY
    : state.spiritRoot.efficiency
}

export function attributeTrainingBonus(mind: number): number {
  return Math.floor(Math.sqrt(mind / 3))
}

export function attributeCombatBonus(body: number): number {
  return Math.floor(Math.sqrt(body) * 2)
}

export function charmPriceDiscount(charm: number): number {
  return Math.floor(charm / 10)
}

export function luckGatherBonus(luck: number): number {
  return Math.floor(luck / 20)
}

export function trainProgressGain(state: GameState): number {
  const talentBonus = state.talents.reduce((sum, id) => sum + (getTalent(id)?.trainingBonus ?? 0), 0)
  const techniqueBonus = Object.entries(state.techniques).reduce(
    (sum, [id, level]) => sum + (getTechnique(id)?.trainingBonus ?? 0) * level,
    0,
  )
  return Math.max(1, Math.floor((
    TRAIN_BASE_PROGRESS + attributeTrainingBonus(state.player.attrs.mind) + talentBonus + techniqueBonus
  ) * trainingEffectiveness(state)))
}

export function minorRealmThreshold(stage: number, realmLevel: number): number | null {
  return MINOR_REALM_THRESHOLDS[stage]?.[realmLevel - 1] ?? null
}

export function nextStageThreshold(stage: number, realmLevel = 1): number | null {
  return minorRealmThreshold(stage, realmLevel)
}

export function applyProgress(
  state: GameState,
  gain: number,
): { stage: number; realmLevel: number; progress: number; breakthroughs: number } {
  let stage = state.player.stage
  let realmLevel = state.player.realmLevel
  let progress = state.player.progress + gain
  let breakthroughs = 0

  while (true) {
    const threshold = minorRealmThreshold(stage, realmLevel)
    if (threshold === null || progress < threshold) break
    progress -= threshold
    breakthroughs += 1
    if (realmLevel < MINOR_REALM_MAX) {
      realmLevel += 1
    } else {
      stage += 1
      realmLevel = 1
    }
  }

  return { stage, realmLevel, progress, breakthroughs }
}

export function isDefectiveRoot(state: GameState): boolean {
  return state.spiritRoot.kind === 'defective'
}
