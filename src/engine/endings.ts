import type { EndingDef } from './content-types'
import {
  MAX_STAGE,
  PEACE_ENDING_DAY,
  PEACE_ENDING_GOLD,
  WEALTH_ENDING_GOLD,
} from './constants'
import type { GameState } from './types'

// Priority is implicit in the first-match order of evaluateEndingId below;
// there is no separate priority table to keep in sync.
export function evaluateEndingId(state: GameState): string | null {
  if (!state.player.alive) return 'tragic_death'
  if (state.player.stage >= MAX_STAGE) return 'ascension'
  if (state.flags['grandPrizeWon'] === true) return 'destined_windfall'
  if (state.player.gold >= WEALTH_ENDING_GOLD) return 'merchant_tycoon'
  if (state.day >= PEACE_ENDING_DAY && state.player.gold >= PEACE_ENDING_GOLD)
    return 'quiet_harmony'
  return null
}

export function endingDefById(endings: readonly EndingDef[], id: string): EndingDef | undefined {
  return endings.find((e) => e.id === id)
}
