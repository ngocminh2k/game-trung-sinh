import type { EndingDef } from './content-types'
import { MAX_STAGE } from './constants'
import type { GameState } from './types'

// Priority is implicit in the first-match order of evaluateEndingId below;
// there is no separate priority table to keep in sync.
export function evaluateEndingId(state: GameState): string | null {
  if (!state.player.alive) return 'tragic_death'
  // P1-1 system divergence: each System has a matching system_<id>_end that
  // fires when the player maxes the realm ladder with the matching signature
  // technique learned. The System chose the player; the player completed the
  // System's path.
  if (state.systemId !== null && state.systemId !== undefined && state.player.stage >= MAX_STAGE) {
    const techniqueId = `system_${state.systemId.replace('sys_', '')}_signature`
    if ((state.techniques[techniqueId] ?? 0) > 0) return `${state.systemId.replace('sys_', 'system_')}_end`
  }
  const storyEnding = state.flags['story_ending']
  if (typeof storyEnding === 'string') return storyEnding
  return null
}

export function endingDefById(endings: readonly EndingDef[], id: string): EndingDef | undefined {
  return endings.find((e) => e.id === id)
}
