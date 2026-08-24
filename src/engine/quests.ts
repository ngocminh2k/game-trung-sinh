import { getNpc, getQuest } from '../content'
import { countOf } from './utils'
import type { GameState } from './types'

export type QuestCheckErr =
  | 'QUEST_UNKNOWN'
  | 'QUEST_WRONG_STATE'
  | 'NOT_AT_LOCATION'

export function questStatus(state: GameState, questId: string): 'available' | 'active' | 'completed' {
  return state.quests[questId]?.status ?? 'available'
}

export function canAcceptQuest(
  state: GameState,
  questId: string,
): { ok: true; giverLocationId: string } | { ok: false; code: QuestCheckErr } {
  const def = getQuest(questId)
  if (def === undefined) return { ok: false, code: 'QUEST_UNKNOWN' }
  const giver = getNpc(def.giverNpcId)
  if (giver === undefined) return { ok: false, code: 'QUEST_UNKNOWN' }
  if (questStatus(state, questId) !== 'available') return { ok: false, code: 'QUEST_WRONG_STATE' }
  if (state.player.locationId !== giver.locationId) return { ok: false, code: 'NOT_AT_LOCATION' }
  return { ok: true, giverLocationId: giver.locationId }
}

export function canCompleteQuest(
  state: GameState,
  questId: string,
): { ok: true } | { ok: false; code: QuestCheckErr } {
  const def = getQuest(questId)
  if (def === undefined) return { ok: false, code: 'QUEST_UNKNOWN' }
  const giver = getNpc(def.giverNpcId)
  if (giver === undefined) return { ok: false, code: 'QUEST_UNKNOWN' }
  if (questStatus(state, questId) !== 'active') return { ok: false, code: 'QUEST_WRONG_STATE' }
  if (state.player.locationId !== giver.locationId) return { ok: false, code: 'NOT_AT_LOCATION' }
  for (const [itemId, qty] of Object.entries(def.requiredItems)) {
    if (countOf(state.inventory, itemId) < qty) return { ok: false, code: 'QUEST_WRONG_STATE' }
  }
  for (const flag of def.requiredFlags) {
    if (!state.flags[flag]) return { ok: false, code: 'QUEST_WRONG_STATE' }
  }
  return { ok: true }
}
