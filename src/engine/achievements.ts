import { ACHIEVEMENTS } from '../content'
import { FLAG_ARENA_CLEARED, FLAG_INFAMY } from '../content/flag-keys'
import { MAX_STAGE } from './constants'
import { flagNum } from './utils'
import type { GameState } from './types'

export function qualifiesForAchievement(state: GameState, achievementId: string): boolean {
  switch (achievementId) {
    case 'first_step':
      // Leaving the village once is trivial; require a few real journeys so the
      // milestone is earned rather than handed out on turn one.
      return flagNum(state.flags, 'moveCount') >= 3
    case 'green_thumb':
      return flagNum(state.flags, 'gatherCount') >= 10
    case 'socialite':
      // Requires five *distinct* NPCs: each talked-to NPC leaves an aff_<id>
      // counter flag, so counting positive ones gives the distinct total.
      return (
        Object.entries(state.flags).filter(
          ([k, v]) => k.startsWith('aff_') && typeof v === 'number' && v >= 1,
        ).length >= 5
      )
    case 'first_purchase':
      return flagNum(state.flags, 'buyCount') >= 5
    case 'first_sale':
      return flagNum(state.flags, 'sellCount') >= 5
    case 'lucky_star':
      return state.flags['grandPrizeWon'] === true
    case 'cave_brave':
      return state.flags['visitedCaveWarded'] === true
    case 'quest_done':
      return Object.values(state.quests).some((q) => q.status === 'completed')
    case 'halfway_there':
      return state.player.stage >= 2
    case 'wealthy':
      return state.player.gold >= 400
    case 'immortal_road_end':
      return state.player.stage >= MAX_STAGE
    // Issue #19: these two consume the previously write-only arena/infamy flags.
    case 'arena_champion':
      return state.flags[FLAG_ARENA_CLEARED] === true
    case 'notorious':
      return flagNum(state.flags, FLAG_INFAMY) >= 2
    default:
      return false
  }
}

export function newlyQualifiedAchievements(state: GameState): string[] {
  return ACHIEVEMENTS.filter(
    (a) => !state.achievements.includes(a.id) && qualifiesForAchievement(state, a.id),
  ).map((a) => a.id)
}
