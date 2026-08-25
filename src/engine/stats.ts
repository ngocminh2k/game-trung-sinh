import { MANUAL_ROOT_EFFICIENCY, STAGE_THRESHOLDS, TRAIN_BASE_PROGRESS } from './constants'
import { ITEM_MANUAL } from './constants'
import { countOf } from './utils'
import { getTalent, getTechnique } from '../content/rpg'
import type { GameState } from './types'

export function trainingEffectiveness(state: GameState): number {
  return countOf(state.inventory, ITEM_MANUAL) > 0 || countOf(state.storage, ITEM_MANUAL) > 0
    ? MANUAL_ROOT_EFFICIENCY
    : state.spiritRoot.efficiency
}

export function trainProgressGain(state: GameState): number {
  const mindBonus = Math.floor(state.player.attrs.mind / 3)
  const talentBonus = state.talents.reduce((sum, id) => sum + (getTalent(id)?.trainingBonus ?? 0), 0)
  const techniqueBonus = Object.entries(state.techniques).reduce(
    (sum, [id, level]) => sum + (getTechnique(id)?.trainingBonus ?? 0) * level,
    0,
  )
  return Math.max(1, Math.floor((TRAIN_BASE_PROGRESS + mindBonus + talentBonus + techniqueBonus) * trainingEffectiveness(state)))
}

export function nextStageThreshold(stage: number): number | null {
  if (stage + 1 >= STAGE_THRESHOLDS.length) return null
  return STAGE_THRESHOLDS[stage + 1] ?? null
}

export function applyProgress(state: GameState, gain: number): { stage: number; progress: number; stagesGained: number } {
  let stage = state.player.stage
  let progress = state.player.progress + gain
  let stagesGained = 0
  while (stage < STAGE_THRESHOLDS.length - 1) {
    const thr = STAGE_THRESHOLDS[stage + 1]
    if (thr === undefined || progress < thr) break
    progress -= thr
    stage += 1
    stagesGained += 1
  }
  return { stage, progress, stagesGained }
}

export function isDefectiveRoot(state: GameState): boolean {
  return state.spiritRoot.kind === 'defective'
}
