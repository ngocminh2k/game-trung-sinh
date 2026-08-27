import type { EndingDef } from './content-types'
import type { GameState } from './types'

// Priority is implicit in the first-match order of evaluateEndingId below;
// there is no separate priority table to keep in sync.
export function evaluateEndingId(state: GameState): string | null {
  if (!state.player.alive) return 'tragic_death'
  const storyEnding = state.flags['story_ending']
  if (typeof storyEnding === 'string') return storyEnding
  return null
}

export function endingDefById(endings: readonly EndingDef[], id: string): EndingDef | undefined {
  return endings.find((e) => e.id === id)
}
