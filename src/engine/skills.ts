import { getSkillNode } from '../content/skill-tree'
import { countOf } from './utils'
import type { ErrorCode, GameState } from './types'
import type { SkillNode } from './content-types'

// Issue 5: read-side of the skill tree. Unlocked node effects are derived
// (never stored) from state.unlockedSkills, so the reducer stays the single
// write path and every combat formula can call these helpers purely.
// Node effects that have no combat analog (aoe radius, utility flags like
// pickpocket/aggro/cleanse, status application) are deliberately inert in the
// engine for now: unlocking them spends the cost and shows the name, but only
// attack/crit/defense/guard/dodge/heal kinds move combat numbers.

function nodes(state: GameState): SkillNode[] {
  const unlocked = state.unlockedSkills ?? []
  const out: SkillNode[] = []
  for (const id of unlocked) {
    const node = getSkillNode(id)
    if (node !== undefined) out.push(node)
  }
  return out
}

function valueOf(node: SkillNode): number {
  return typeof node.effect.value === 'number' ? node.effect.value : 0
}

function sumBy(state: GameState, pred: (node: SkillNode) => number): number {
  return nodes(state).reduce((sum, node) => sum + pred(node), 0)
}

const statIs = (stat: string) => (node: SkillNode): boolean =>
  node.effect.kind === 'buff' && node.effect.stat === stat

export function skillAttackBonus(state: GameState): number {
  return sumBy(state, (n) => (n.effect.kind === 'attack' ? valueOf(n) : 0))
}

/** Flat +critChance percent granted by attack nodes (sword_t7/t13/t14/t20). */
export function skillCritBonus(state: GameState): number {
  return sumBy(state, (n) => (n.effect.kind === 'attack' && typeof n.effect.crit === 'number' ? n.effect.crit : 0))
}

export function skillDefenseBonus(state: GameState): number {
  return sumBy(state, (n) => (statIs('defense')(n) ? valueOf(n) : 0))
}

export function skillGuardBonus(state: GameState): number {
  return sumBy(state, (n) => (statIs('guard')(n) ? valueOf(n) : 0))
}

/** Summed dodge tier (shadow branch). Interpreted as percent, capped so a
 *  full shadow build never exceeds 40% evasion. */
export const DODGE_CAP = 40
export function skillDodgeChance(state: GameState): number {
  return Math.min(DODGE_CAP, sumBy(state, (n) => (n.effect.kind === 'dodge' ? valueOf(n) : 0))) / 100
}

/** heal nodes with trigger onHit/onKill restore HP at those moments;
 *  drain: true halves the amount (lighter life-drain nodes). */
export function skillOnHitHeal(state: GameState): number {
  return sumBy(state, (n) => (n.effect.kind === 'heal' && n.effect.trigger === 'onHit' ? Math.max(1, Math.round(valueOf(n) / (n.effect.drain === true ? 2 : 1))) : 0))
}

export function skillOnKillHeal(state: GameState): number {
  return sumBy(state, (n) => (n.effect.kind === 'heal' && n.effect.trigger === 'onKill' ? valueOf(n) : 0))
}

/** Gates checked in unlock order; null = the node may be unlocked. */
export function skillUnlockGate(state: GameState, nodeId: string): ErrorCode | null {
  const node = getSkillNode(nodeId)
  if (node === undefined) return 'SKILL_UNKNOWN'
  const unlocked = state.unlockedSkills ?? []
  if (unlocked.includes(nodeId)) return 'SKILL_ALREADY_UNLOCKED'
  if (unlocked.some((id) => node.conflictsWith?.includes(id))) return 'SKILL_CONFLICT'
  if (state.player.stage < node.require.stage) return 'SKILL_REQUIREMENT_NOT_MET'
  if ((node.require.techniques ?? []).some((t) => (state.techniques[t] ?? 0) <= 0)) return 'SKILL_REQUIREMENT_NOT_MET'
  // Branch progression: tier n opens only after tier n-1 of the same branch.
  if (node.tier > 1 && !unlocked.includes(`${node.branch}_t${String(node.tier - 1)}`)) return 'SKILL_REQUIREMENT_NOT_MET'
  if ((state.player.skillPoints ?? 0) < node.cost.skillPoints) return 'INSUFFICIENT_SKILL_POINTS'
  if (node.cost.gold !== undefined && state.player.gold < node.cost.gold) return 'INSUFFICIENT_GOLD'
  if (node.cost.item !== undefined && countOf(state.inventory, node.cost.item) < 1) return 'NO_ITEM'
  return null
}
