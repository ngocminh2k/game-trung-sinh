// System Layer S05 — pure runtime helpers. No rng, no Date, no Math.random.
// Imports only system-defs (NOT authored Scenario-I content) + engine types.
import { systemById, type SystemDef } from '../content/system-defs'
import { SYSTEM_QUESTS } from '../content/system-quests'
import { questStatus } from './quests'
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
 *  requiredSystemId matches, plus anything already active in state.quests{}.
 *  A never-touched pool quest stays hidden until its requiredFlags are met,
 *  so the chain-locked ones only surface as the player clears their
 *  predecessors; anything already in state.quests (active or completed) stays
 *  visible so an in-flight quest never disappears mid-run. */
export function systemQuestsFor(state: GameState): QuestDef[] {
  const system = activeSystem(state)
  if (system === null) return []
  const pool = SYSTEM_QUESTS.filter(
    (def) =>
      def.requiredSystemId === system.id &&
      (state.quests[def.id] !== undefined || def.requiredFlags.every((f) => Boolean(state.flags[f]))),
  )
  const activeExtras: QuestDef[] = []
  for (const questId of Object.keys(state.quests)) {
    if (pool.some((def) => def.id === questId)) continue
    const def = systemQuestDef(questId)
    if (def !== undefined && questStatus(state, questId) === 'active') activeExtras.push(def)
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

export interface SystemPassiveBonus {
  readonly combatDamageBonus: number
  readonly alchemyEfficiencyBonus: number
  readonly shopDiscountPercent: number
  readonly lotteryLuckBonus: number
  readonly dangerDamageReduction: number
  readonly critChanceBonus: number
  readonly hpRestHealBonus: number
  readonly equipmentBonus: number
  readonly cultivationBonus: number
  readonly demonGodShield: boolean
  readonly spiritStoneYieldBonus: number
}

export const EMPTY_SYSTEM_PASSIVE_BONUS: SystemPassiveBonus = {
  combatDamageBonus: 0,
  alchemyEfficiencyBonus: 0,
  shopDiscountPercent: 0,
  lotteryLuckBonus: 0,
  dangerDamageReduction: 0,
  critChanceBonus: 0,
  hpRestHealBonus: 0,
  equipmentBonus: 0,
  cultivationBonus: 0,
  demonGodShield: false,
  spiritStoneYieldBonus: 0,
}

export function systemPassiveBonus(systemId?: string | null): SystemPassiveBonus {
  if (!systemId) return EMPTY_SYSTEM_PASSIVE_BONUS

  switch (systemId) {
    case 'sys_battle':
      return { ...EMPTY_SYSTEM_PASSIVE_BONUS, combatDamageBonus: 15 }
    case 'sys_alchemy':
      return { ...EMPTY_SYSTEM_PASSIVE_BONUS, alchemyEfficiencyBonus: 25 }
    case 'sys_merchant':
      return { ...EMPTY_SYSTEM_PASSIVE_BONUS, shopDiscountPercent: 10 }
    case 'sys_lottery':
      return { ...EMPTY_SYSTEM_PASSIVE_BONUS, lotteryLuckBonus: 15 }
    case 'sys_explorer':
      return { ...EMPTY_SYSTEM_PASSIVE_BONUS, dangerDamageReduction: 20 }
    case 'sys_assassin':
      return { ...EMPTY_SYSTEM_PASSIVE_BONUS, critChanceBonus: 15 }
    case 'sys_healer':
      return { ...EMPTY_SYSTEM_PASSIVE_BONUS, hpRestHealBonus: 15 }
    case 'sys_artisan':
      return { ...EMPTY_SYSTEM_PASSIVE_BONUS, equipmentBonus: 15 }
    case 'sys_scholar':
      return { ...EMPTY_SYSTEM_PASSIVE_BONUS, cultivationBonus: 15 }
    case 'sys_void':
      return { ...EMPTY_SYSTEM_PASSIVE_BONUS, demonGodShield: true, spiritStoneYieldBonus: 20 }
    default:
      return EMPTY_SYSTEM_PASSIVE_BONUS
  }
}

export function systemMechanismText(systemId?: string | null, locale: 'vi' | 'en' = 'vi'): string {
  if (!systemId) return ''
  const system = systemById(systemId)
  if (!system) return ''
  return locale === 'en' ? system.mechanismEn : system.mechanismVi
}

export function calculateSystemCombatDamageBonus(state: { systemId?: string | null }): number {
  return systemPassiveBonus(state.systemId).combatDamageBonus
}

export function calculateSystemDangerDamageReduction(state: { systemId?: string | null }): number {
  return systemPassiveBonus(state.systemId).dangerDamageReduction
}

export function calculateSystemRestHealBonus(state: { systemId?: string | null }): number {
  return systemPassiveBonus(state.systemId).hpRestHealBonus
}

export function calculateSystemShopDiscount(state: { systemId?: string | null }): number {
  return systemPassiveBonus(state.systemId).shopDiscountPercent
}

export function calculateSystemCultivationBonus(state: { systemId?: string | null }): number {
  return systemPassiveBonus(state.systemId).cultivationBonus
}

export function isVoidDemonGodActive(state: { systemId?: string | null }): boolean {
  return systemPassiveBonus(state.systemId).demonGodShield
}

