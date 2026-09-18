import { getNpc, getQuest } from '../content'
import { FLAG_QUEST_DONE } from '../content/flag-keys'
import { countOf } from './utils'
import type { GameState, Locale, QuestRuntime } from './types'
import type { QuestDef } from './content-types'

export type QuestCategory = 'main' | 'side' | 'sect' | 'secret'

export function getQuestCategory(quest: QuestDef): QuestCategory {
  if (quest.requiredSystemId !== undefined || quest.id.startsWith('q_sys_') || quest.id.startsWith('q_sec_')) return 'sect'
  if (quest.secret || quest.id.startsWith('q_secret_')) return 'secret'
  if (quest.id.startsWith('q_main_') || quest.storySceneNextId !== undefined) return 'main'
  return 'side'
}

export function questCategoryLabel(category: QuestCategory, locale: Locale): string {
  switch (category) {
    case 'main':
      return locale === 'vi' ? 'Chính Tuyến' : 'Main Quest'
    case 'side':
      return locale === 'vi' ? 'Phụ Tuyến' : 'Side Quest'
    case 'sect':
      return locale === 'vi' ? 'Tông Môn' : 'Sect Quest'
    case 'secret':
      return locale === 'vi' ? 'Nhiệm Vụ Ẩn' : 'Secret Quest'
  }
}

export type QuestCheckErr =
  | 'QUEST_UNKNOWN'
  | 'QUEST_WRONG_STATE'
  | 'NOT_AT_LOCATION'

export function questStatus(state: GameState, questId: string): 'available' | 'active' | 'completed' {
  // The done flag (`quest_<id>_done`) is canonical. Legacy/buggy saves can
  // carry a stale runtime that still reads `active`; a written flag must
  // always win so a finished quest can never resurrect (C3-01 / C2-01).
  if (state.flags[`quest_${questId}${FLAG_QUEST_DONE}`] === true) return 'completed'
  return state.quests[questId]?.status ?? 'available'
}

export function questRuntime(state: GameState, questId: string): QuestRuntime {
  return state.quests[questId] ?? { status: 'available', step: 0 }
}

/** Total unique completed quests across canonical flags and runtime state (C3-02). */
export function countCompletedQuests(state: GameState): number {
  const fromQuests = Object.keys(state.quests).filter((id) => questStatus(state, id) === 'completed')
  const fromFlags = Object.entries(state.flags)
    .filter(([k, v]) => v === true && k.startsWith('quest_') && k.endsWith(FLAG_QUEST_DONE))
    .map(([k]) => k.slice('quest_'.length, -FLAG_QUEST_DONE.length))
  return new Set([...fromQuests, ...fromFlags]).size
}

export function currentStepIndex(state: GameState, questId: string): number {
  const rt = state.quests[questId]
  if (rt === undefined) return 0
  return typeof rt.step === 'number' ? rt.step : 0
}

/** A quest is hidden from the journal until its unlock condition is met:
 * the matching System for system quests, and the authored requiredFlags
 * (prerequisite chain / story gates / secret discovery) for every quest.
 * It still resolves correctly via the engine — the UI just refuses to show
 * a quest the player cannot accept yet. */
export function isQuestUnlocked(state: GameState, questId: string): boolean {
  const def = getQuest(questId)
  if (def === undefined) return false
  // System Layer: a system quest unlocks only for the matching chosen System
  // (unless already accepted, so the panel keeps showing progress).
  if (def.requiredSystemId !== undefined) {
    const active = state.quests[questId]?.status
    if (active !== 'active' && state.systemId !== def.requiredSystemId) return false
    if (!def.requiredFlags.every((flag) => Boolean(state.flags[flag]))) return false
  }
  // Main/side/secret quests: requiredFlags gate visibility (chain/story/secret).
  return def.requiredFlags.every((flag) => Boolean(state.flags[flag]))
}

export function canAcceptQuest(
  state: GameState,
  questId: string,
): { ok: true; giverLocationId: string } | { ok: false; code: QuestCheckErr; at?: string | undefined } {
  const def = getQuest(questId)
  if (def === undefined) return { ok: false, code: 'QUEST_UNKNOWN' }
  if (questStatus(state, questId) !== 'available') return { ok: false, code: 'QUEST_WRONG_STATE' }
  if (!isQuestUnlocked(state, questId)) return { ok: false, code: 'QUEST_WRONG_STATE' }
  // Honour legacy requiredFlags for backwards compat — old quest items/flags
  // still gate acceptance.
  for (const flag of def.requiredFlags) {
    if (!state.flags[flag]) return { ok: false, code: 'QUEST_WRONG_STATE' }
  }
  // System Layer: system quests need no NPC/location — they are accepted and
  // turned in from the System panel wherever the player stands.
  if (def.requiredSystemId !== undefined) {
    return { ok: true, giverLocationId: state.player.locationId }
  }
  const giver = def.giverNpcId === null ? undefined : getNpc(def.giverNpcId)
  if (giver === undefined) return { ok: false, code: 'QUEST_UNKNOWN' }
  if (state.player.locationId !== giver.locationId) return { ok: false, code: 'NOT_AT_LOCATION', at: giver.locationId }
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
): { ok: true } | { ok: false; code: QuestCheckErr; at?: string | undefined } {
  const def = getQuest(questId)
  if (def === undefined) return { ok: false, code: 'QUEST_UNKNOWN' }
  if (questStatus(state, questId) !== 'active') return { ok: false, code: 'QUEST_WRONG_STATE' }
  // Round-6 review (CRITICAL): expiry must only bind when the quest type still
  // HAS a deadline. System quests dropped deadlineDays for chain ramping — a
  // pre-change save can carry quest_<id>_expires_day with the quest still
  // active, and there is no abandon path: turn-in would stay refused forever,
  // so its _done flag never lands and the entire chain behind it is dead.
  const expiry = def.deadlineDays === undefined ? undefined : state.flags[`quest_${questId}_expires_day`]
  if (typeof expiry === 'number' && state.day > expiry) return { ok: false, code: 'QUEST_WRONG_STATE' }
  // System Layer: turn-in happens from the System panel — no location gate.
  if (def.requiredSystemId === undefined) {
    const giver = def.giverNpcId === null ? undefined : getNpc(def.giverNpcId)
    if (giver === undefined) return { ok: false, code: 'QUEST_UNKNOWN' }
    if (state.player.locationId !== giver.locationId) return { ok: false, code: 'NOT_AT_LOCATION', at: giver.locationId }
  }
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
