// System Layer S05 — pure runtime helpers. No rng, no Date, no Math.random.
// Imports only system-defs (NOT authored Scenario-I content) + engine types.
import { systemById, type SystemDef } from '../content/system-defs'
import { SYSTEM_QUESTS } from '../content/system-quests'
import type { QuestDef } from './content-types'
import type { GameState } from './types'

export function activeSystem(state: { systemId?: string | null }): SystemDef | null {
  return state.systemId == null ? null : systemById(state.systemId) ?? null
}

/** Hard-lock: a known System may be chosen only once, before anything else. */
export function canChooseSystem(state: { systemId?: string | null }, systemId: string): boolean {
  return state.systemId == null && systemById(systemId) !== undefined
}

export function isSystemQuest(def: QuestDef): boolean {
  return def.requiredSystemId !== undefined
}

function systemQuestDef(questId: string): QuestDef | undefined {
  if (!questId.startsWith('q_sys_')) return undefined
  return SYSTEM_QUESTS.find((def) => def.id === questId)
}

/** All quests of the player's active System: the frozen pool entries whose
 *  requiredSystemId matches, plus anything already active in state.quests{}. */
export function systemQuestsFor(state: GameState): QuestDef[] {
  const system = activeSystem(state)
  if (system === null) return []
  const pool = SYSTEM_QUESTS.filter((def) => def.requiredSystemId === system.id)
  const activeExtras: QuestDef[] = []
  for (const questId of Object.keys(state.quests)) {
    if (pool.some((def) => def.id === questId)) continue
    const def = systemQuestDef(questId)
    if (def !== undefined && state.quests[questId]?.status === 'active') activeExtras.push(def)
  }
  return [...pool, ...activeExtras]
}

/** SPEC §7 reward-budget check: gold/items/spiritStones inside the system budget. */
export function budgetOk(def: QuestDef, system: SystemDef): boolean {
  const budget = system.rewardBudget
  if (def.rewardGold < budget.minGold || def.rewardGold > budget.maxGold) return false
  if (def.rewardSpiritStones !== undefined) {
    if (def.rewardSpiritStones < budget.minSpiritStones || def.rewardSpiritStones > budget.maxSpiritStones) return false
  } else if (budget.minSpiritStones > 0) {
    return false
  }
  return Object.keys(def.rewardItems).every((itemId) => budget.itemPool.includes(itemId))
}

/** Convenience for the UI/reducer: resolve a System quest by id. */
export function systemQuestById(questId: string): QuestDef | undefined {
  return systemQuestDef(questId)
}
