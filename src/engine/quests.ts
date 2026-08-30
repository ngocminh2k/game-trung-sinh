import { getNpc, getQuest } from '../content'
import { countOf } from './utils'
import type { GameState, QuestRuntime } from './types'

export type QuestCheckErr =
  | 'QUEST_UNKNOWN'
  | 'QUEST_WRONG_STATE'
  | 'NOT_AT_LOCATION'

export function questStatus(state: GameState, questId: string): 'available' | 'active' | 'completed' {
  return state.quests[questId]?.status ?? 'available'
}

export function questRuntime(state: GameState, questId: string): QuestRuntime {
  return state.quests[questId] ?? { status: 'available', step: 0 }
}

export function currentStepIndex(state: GameState, questId: string): number {
  const rt = state.quests[questId]
  if (rt === undefined) return 0
  return typeof rt.step === 'number' ? rt.step : 0
}

/** A secret quest is hidden from the journal until the player has met
 * its unlock condition (specific flag, NPC, or scene). It still resolves
 * correctly via the engine — the UI just refuses to show it. */
export function isQuestUnlocked(state: GameState, questId: string): boolean {
  const def = getQuest(questId)
  if (def === undefined) return false
  if (def.secret !== true) return true
  // Secret quests: require the requiredFlags + a secret-specific unlock.
  // requiredFlags doubles as the unlock key.
  return def.requiredFlags.every((flag) => Boolean(state.flags[flag]))
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
  if (!isQuestUnlocked(state, questId)) return { ok: false, code: 'QUEST_WRONG_STATE' }
  // Honour legacy requiredFlags for backwards compat — old quest items/flags
  // still gate acceptance.
  for (const flag of def.requiredFlags) {
    if (!state.flags[flag]) return { ok: false, code: 'QUEST_WRONG_STATE' }
  }
  if (state.player.locationId !== giver.locationId) return { ok: false, code: 'NOT_AT_LOCATION' }
  return { ok: true, giverLocationId: giver.locationId }
}

/** Returns true when the quest's CURRENT step's completion conditions are met.
 * For multi-step quests, this advances to the next step in the engine call. */
export function isCurrentStepComplete(state: GameState, questId: string): boolean {
  const def = getQuest(questId)
  if (def === undefined) return false
  const idx = currentStepIndex(state, questId)
  if (idx < 0 || idx >= def.steps.length) return false
  const step = def.steps[idx]!
  if (step.completeItems !== undefined) {
    for (const [itemId, qty] of Object.entries(step.completeItems)) {
      if (countOf(state.inventory, itemId) < qty) return false
    }
  }
  if (step.completeFlags !== undefined) {
    for (const flag of step.completeFlags) {
      if (!state.flags[flag]) return false
    }
  }
  if (step.completeNpcTalk !== undefined) {
    const talkKey = `talk_${step.completeNpcTalk}`
    if (!state.flags[talkKey]) return false
  }
  if (step.completeNode !== undefined) {
    const reachKey = `reached_${step.completeNode}`
    if (!state.flags[reachKey]) return false
  }
  return true
}

/** The current step is ready for turn-in at the NPC. */
export function isTurnInReady(state: GameState, questId: string): boolean {
  const def = getQuest(questId)
  if (def === undefined) return false
  const idx = currentStepIndex(state, questId)
  if (idx < 0 || idx >= def.steps.length) return false
  const step = def.steps[idx]!
  if (!step.isTurnInStep) return false
  return isCurrentStepComplete(state, questId)
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
  const expiry = state.flags[`quest_${questId}_expires_day`]
  if (typeof expiry === 'number' && state.day > expiry) return { ok: false, code: 'QUEST_WRONG_STATE' }
  if (state.player.locationId !== giver.locationId) return { ok: false, code: 'NOT_AT_LOCATION' }
  if (!isTurnInReady(state, questId)) return { ok: false, code: 'QUEST_WRONG_STATE' }
  return { ok: true }
}

/** Pure: derive the next step index after checking completion of the current.
 * The reducer applies this; the caller writes the result back into state.quests. */
export function advanceIfReady(state: GameState, questId: string): { state: GameState; advanced: boolean } {
  const def = getQuest(questId)
  if (def === undefined) return { state, advanced: false }
  const rt = state.quests[questId]
  if (rt === undefined || rt.status !== 'active') return { state, advanced: false }
  const idx = typeof rt.step === 'number' ? rt.step : 0
  const step = def.steps[idx]
  if (step === undefined) return { state, advanced: false }
  // Check whether current step's completion conditions are met.
  if (step.completeItems !== undefined) {
    let ok = true
    for (const [itemId, qty] of Object.entries(step.completeItems)) {
      if (countOf(state.inventory, itemId) < qty) { ok = false; break }
    }
    if (!ok) return { state, advanced: false }
  }
  if (step.completeFlags !== undefined) {
    let ok = true
    for (const flag of step.completeFlags) {
      if (!state.flags[flag]) { ok = false; break }
    }
    if (!ok) return { state, advanced: false }
  }
  if (step.completeNpcTalk !== undefined) {
    if (!state.flags[`talk_${step.completeNpcTalk}`]) return { state, advanced: false }
  }
  if (step.completeNode !== undefined) {
    if (!state.flags[`reached_${step.completeNode}`]) return { state, advanced: false }
  }
  // Current step is complete. If it was a turn-in step, do not auto-advance.
  if (step.isTurnInStep) return { state, advanced: false }
  // Otherwise, advance to next step.
  const nextIdx = idx + 1
  const nextRuntime: QuestRuntime = { status: 'active', step: nextIdx }
  return {
    state: { ...state, quests: { ...state.quests, [questId]: nextRuntime } },
    advanced: true,
  }
}

/** All currently-active quests for which the current step has just been
 * completed and which should now advance. Used by the reducer as a side
 * effect of any action. */
export function tickQuestSteps(state: GameState): GameState {
  let s = state
  for (const questId of Object.keys(s.quests)) {
    if (s.quests[questId]?.status !== 'active') continue
    const result = advanceIfReady(s, questId)
    s = result.state
  }
  return s
}
