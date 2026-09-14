import { getSkillNode, SKILL_BRANCHES, SKILL_TREES, SPECIAL_NODES } from '../../../content/skill-tree'
import { skillUnlockGate } from '../../../engine/skills'
import type { GameState } from '../../../engine'
import type { SkillNode } from '../../../engine/content-types'

/* =========================================================================
 *  Issue #33 — read-side model for the skill tree panel.
 *
 *  Pure derivation over GameState: legality comes from the engine's own
 *  `skillUnlockGate` (src/engine/skills.ts), so the UI can never offer a move
 *  the reducer would refuse. Nothing here decides rules — it only names the
 *  reason behind a gate code, and flags node effects the engine does not
 *  honour yet (`effectHonoured`).
 * ========================================================================= */

export type SkillBranchId = (typeof SKILL_BRANCHES)[number]

/** Why a node cannot be unlocked right now. `tier` is the branch chain
 *  (tier n needs tier n-1); `progression` = the engine refused and this UI
 *  could not pin the cause (only reachable if the gate grows a new check). */
export type LockReason = 'already' | 'conflict' | 'stage' | 'technique' | 'tier' | 'points' | 'gold' | 'item' | 'progression'

export interface SkillNodeView {
  node: SkillNode
  id: string
  branch: SkillBranchId
  tier: number
  unlocked: boolean
  /** skillUnlockGate returned null — the unlock button is enabled exactly here. */
  legal: boolean
  /** Null for unlocked nodes; a reason for every locked one. */
  reason: LockReason | null
  /** effect.kind has no combat analog in src/engine — cosmetic unlock. */
  inert: boolean
  cost: SkillNode['cost']
}

export interface SkillBranchView {
  branch: SkillBranchId
  nodes: SkillNodeView[]
  unlockedCount: number
  /** Highest unlocked tier in this branch (0 = nothing learned yet). */
  frontier: number
}

export interface SkillTreeView {
  branches: SkillBranchView[]
  special: SkillNodeView[]
  skillPoints: number
  unlockedCount: number
  /** Nodes the engine would accept an unlock_skill for right now. */
  legalCount: number
  total: number
  /** Of the 101 nodes, how many actually move combat numbers. */
  honouredTotal: number
}

/** Mirrors src/engine/skills.ts: only these effect shapes reach combat math —
 *  attack (plus crit via an extra numeric `crit`), buff on defense/guard,
 *  dodge, and heal triggered onHit/onKill. Everything else (aoe radius,
 *  utility flags, status application, buff qi, trigger-less heals) is stored
 *  and named only.
 *  ponytail: ceiling = duplicated knowledge of the engine's read side; upgrade
 *  path is a `skillEffectIsLive(node)` export in skills.ts, then delete this. */
export function effectHonoured(effect: SkillNode['effect']): boolean {
  if (effect.kind === 'attack') return true
  if (effect.kind === 'buff') return effect.stat === 'defense' || effect.stat === 'guard'
  if (effect.kind === 'dodge') return true
  if (effect.kind === 'heal') return effect.trigger === 'onHit' || effect.trigger === 'onKill'
  return false
}

/** The engine collapses stage / technique / branch-chain into the single code
 *  SKILL_REQUIREMENT_NOT_MET. Re-run those three checks in the gate's own
 *  order to pick which one to show the player.
 *  ponytail: ceiling = mirrors gate order in UI; upgrade path is a gate that
 *  returns a structured reason (an engine change, out of issue #33's scope). */
function refineRequirement(state: GameState, node: SkillNode): LockReason {
  if (state.player.stage < node.require.stage) return 'stage'
  if ((node.require.techniques ?? []).some((id) => (state.techniques[id] ?? 0) <= 0)) return 'technique'
  if (node.tier > 1) {
    const prereq = `${node.branch}_t${String(node.tier - 1)}`
    if (getSkillNode(prereq) !== undefined && !(state.unlockedSkills ?? []).includes(prereq)) return 'tier'
    return 'progression'
  }
  return 'progression'
}

export function nodeView(state: GameState, node: SkillNode): SkillNodeView {
  const unlocked = (state.unlockedSkills ?? []).includes(node.id)
  const code = skillUnlockGate(state, node.id)
  let reason: LockReason | null = null
  if (unlocked) reason = 'already'
  else if (code === 'SKILL_CONFLICT') reason = 'conflict'
  else if (code === 'SKILL_REQUIREMENT_NOT_MET') reason = refineRequirement(state, node)
  else if (code === 'INSUFFICIENT_SKILL_POINTS') reason = 'points'
  else if (code === 'INSUFFICIENT_GOLD') reason = 'gold'
  else if (code === 'NO_ITEM') reason = 'item'
  else if (code !== null) reason = 'progression'
  return {
    node,
    id: node.id,
    branch: node.branch,
    tier: node.tier,
    unlocked,
    legal: code === null,
    reason: unlocked ? null : reason,
    inert: !effectHonoured(node.effect),
    cost: node.cost,
  }
}

/** Whole-tree derivation, called per render while the panel is open.
 *  ponytail: no memoisation — 101 cheap gate calls, only while a modal is up. */
export function deriveSkillTree(state: GameState): SkillTreeView {
  const branches: SkillBranchView[] = SKILL_BRANCHES.map((branch) => {
    const nodes = SKILL_TREES[branch].map((node) => nodeView(state, node))
    return {
      branch,
      nodes,
      unlockedCount: nodes.filter((view) => view.unlocked).length,
      frontier: nodes.reduce((acc, view) => (view.unlocked ? view.tier : acc), 0),
    }
  })
  const special = SPECIAL_NODES.map((node) => nodeView(state, node))
  const all = [...branches.flatMap((b) => b.nodes), ...special]
  return {
    branches,
    special,
    skillPoints: state.player.skillPoints ?? 0,
    unlockedCount: all.filter((view) => view.unlocked).length,
    legalCount: all.filter((view) => view.legal).length,
    total: all.length,
    honouredTotal: all.filter((view) => !view.inert).length,
  }
}
