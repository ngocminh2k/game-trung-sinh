import type { EndingDef } from './content-types'
import { MAX_STAGE } from './constants'
import { FLAG_ARENA_CLEARED } from '../content/flag-keys'
import { countCompletedQuests } from './quests'
import type { GameState } from './types'

export interface KarmaMilestoneBreakdown {
  readonly total: number
  readonly quests: number
  readonly realm: number
  readonly majorEvents: number
  readonly details: {
    readonly completedQuests: number
    readonly reachedStage3: boolean
    readonly clearedMajorEvent: boolean
  }
}

/** C3-02 / C2-02: Evaluates reincarnation karma strictly based on achieved milestones.
 * Idle days award 0 points, eliminating the day 5 farm loophole. */
export function evaluateReincarnationKarma(state: GameState): KarmaMilestoneBreakdown {
  const completedQuests = countCompletedQuests(state)
  const questsScore = completedQuests >= 3 ? 30 : 0

  const reachedStage3 = state.player.stage > 1 || (state.player.stage === 1 && state.player.realmLevel >= 3)
  const realmScore = reachedStage3 ? 30 : 0

  const nonTragicEnding = state.endingId !== null && state.endingId !== undefined && state.endingId !== 'tragic_death'
  const arenaCleared = Boolean(state.flags[FLAG_ARENA_CLEARED]) || state.flags['arena_champion'] === true
  const caveWarded = state.flags['visitedCaveWarded'] === true
  const clearedMajorEvent = nonTragicEnding || arenaCleared || caveWarded
  const majorEventsScore = clearedMajorEvent ? 50 : 0

  return {
    total: questsScore + realmScore + majorEventsScore,
    quests: questsScore,
    realm: realmScore,
    majorEvents: majorEventsScore,
    details: {
      completedQuests,
      reachedStage3,
      clearedMajorEvent,
    },
  }
}

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
