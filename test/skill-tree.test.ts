import { expect, test } from 'vitest'
import { SKILL_NODES, SKILL_BRANCHES, SKILL_TREES, getSkillNode, skillNodesInBranch } from '../src/content/skill-tree'

// Items that actually exist in src/content/items.ts (used in cost.item)
const VALID_ITEM_IDS = new Set([
  'wooden_staff', 'tattered_robe', 'pill_hp', 'pill_qi', 'jade_charm',
  'rift_step_scroll', 'ironwood_saber', 'mistweave_vest', 'spirit_ring',
  'cloudpiercer_spear', 'herbal_breath_manual', 'iron_skin_manual',
  'cloudwalk_manual', 'peak_cleaver_manual', 'dew_pill', 'plum_qi_wine',
  'ninefold_pill', 'marrow_gather_pill', 'trail_rations', 'moon_moss',
  'cold_iron_ore', 'beast_fang', 'cloudsilk_thread', 'crane_feather',
  'bamboo_saber', 'travelers_coat', 'bone_ward_charm', 'frostfang_saber',
  'cloudveil_robe', 'moonstone_pendant', 'tide_breath_manual',
  'stone_aegis_manual', 'evidence_route_mercy', 'evidence_route_wealth',
  'evidence_route_truth',
])

const VALID_EFFECT_KINDS = new Set(['attack', 'heal', 'buff', 'dodge', 'aoe', 'status', 'utility'])

// ── Count / structure invariants ─────────────────────────────────────────────

test('100 nodes total', () => {
  expect(SKILL_NODES.length).toBe(100)
})

test('5 branches', () => {
  expect(SKILL_BRANCHES).toHaveLength(5)
  expect(SKILL_BRANCHES).toContain('sword')
  expect(SKILL_BRANCHES).toContain('aura')
  expect(SKILL_BRANCHES).toContain('herbal')
  expect(SKILL_BRANCHES).toContain('shadow')
  expect(SKILL_BRANCHES).toContain('thunder')
})

test('each branch has exactly 20 tiers (1-20, no gaps, no duplicates)', () => {
  for (const branch of SKILL_BRANCHES) {
    const list = skillNodesInBranch(branch)
    expect(list.length).toBe(20)
    const tiers = list.map((n) => n.tier)
    const sorted = [...tiers].sort((a, b) => a - b)
    expect(sorted).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
  }
})

// ── Id invariants ─────────────────────────────────────────────────────────────

test('no duplicate node ids', () => {
  const ids = SKILL_NODES.map((n) => n.id)
  const unique = new Set(ids)
  expect(unique.size).toBe(ids.length)
})

test('every node id matches branch_tN pattern', () => {
  for (const node of SKILL_NODES) {
    expect(node.id).toMatch(new RegExp(`^${node.branch}_t\\d+$`))
  }
})

test('getSkillNode returns correct node for every id', () => {
  for (const node of SKILL_NODES) {
    expect(getSkillNode(node.id)).toBe(node)
  }
})

test('getSkillNode returns undefined for unknown id', () => {
  expect(getSkillNode('nonexistent_node')).toBeUndefined()
})

// ── Effect invariants ─────────────────────────────────────────────────────────

test('every node has a valid effect.kind', () => {
  for (const node of SKILL_NODES) {
    expect(VALID_EFFECT_KINDS.has(node.effect.kind), `${node.id} has invalid kind: ${node.effect.kind}`).toBe(true)
  }
})

test('every effect has a numeric or string value', () => {
  for (const node of SKILL_NODES) {
    expect(typeof node.effect.value).toMatch(/^(number|string)$/)
  }
})

test('attack nodes have numeric value', () => {
  for (const node of SKILL_NODES.filter((n) => n.effect.kind === 'attack')) {
    expect(typeof node.effect.value).toBe('number')
  }
})

// trigger is only present on combat-proc heals (onHit/onKill); passive heals
// use drain, stat, or costQi instead. We assert the union covers all.
test('heal nodes have one of: trigger | stat | drain | costQi', () => {
  for (const node of SKILL_NODES.filter((n) => n.effect.kind === 'heal')) {
    const e = node.effect as Record<string, unknown>
    const ok = typeof e['trigger'] === 'string' ||
      typeof e['stat'] === 'string' ||
       e['drain'] !== undefined ||
       e['costQi'] !== undefined
    expect(ok, `${node.id} heal has none of trigger/stat/drain/costQi`).toBe(true)
  }
})

test('buff nodes have stat field', () => {
  for (const node of SKILL_NODES.filter((n) => n.effect.kind === 'buff')) {
    expect(typeof node.effect.stat).toBe('string')
  }
})

test('dodge nodes have numeric value', () => {
  for (const node of SKILL_NODES.filter((n) => n.effect.kind === 'dodge')) {
    expect(typeof node.effect.value).toBe('number')
  }
})

test('aoe nodes have aoeRadius', () => {
  for (const node of SKILL_NODES.filter((n) => n.effect.kind === 'aoe')) {
    expect(typeof node.effect.aoeRadius).toBe('number')
  }
})

test('status nodes have status field', () => {
  for (const node of SKILL_NODES.filter((n) => n.effect.kind === 'status')) {
    expect(typeof node.effect.status).toBe('string')
  }
})

test('utility nodes have stat field', () => {
  for (const node of SKILL_NODES.filter((n) => n.effect.kind === 'utility')) {
    expect(typeof node.effect.stat).toBe('string')
  }
})

// ── Require invariants ────────────────────────────────────────────────────────

test('every node has require.stage >= 0', () => {
  for (const node of SKILL_NODES) {
    expect(node.require.stage).toBeGreaterThanOrEqual(0)
  }
})

test('require.level, when present, is between 1 and 20', () => {
  for (const node of SKILL_NODES) {
    if (node.require.level !== undefined) {
      expect(node.require.level).toBeGreaterThanOrEqual(1)
      expect(node.require.level).toBeLessThanOrEqual(20)
    }
  }
})

test('require.techniques, when present, is a non-empty string array', () => {
  for (const node of SKILL_NODES) {
    if (node.require.techniques !== undefined) {
      expect(Array.isArray(node.require.techniques)).toBe(true)
      expect(node.require.techniques.length).toBeGreaterThan(0)
      expect(node.require.techniques.every((t) => typeof t === 'string')).toBe(true)
    }
  }
})

test('require.flag, when present, is a non-empty string', () => {
  for (const node of SKILL_NODES) {
    if (node.require.flag !== undefined) {
      expect(typeof node.require.flag).toBe('string')
      expect(node.require.flag.length).toBeGreaterThan(0)
    }
  }
})

// ── Cost invariants ───────────────────────────────────────────────────────────

test('every node has cost.skillPoints >= 1', () => {
  for (const node of SKILL_NODES) {
    expect(node.cost.skillPoints).toBeGreaterThanOrEqual(1)
  }
})

test('cost.gold, when present, is >= 0', () => {
  for (const node of SKILL_NODES) {
    if (node.cost.gold !== undefined) {
      expect(node.cost.gold).toBeGreaterThanOrEqual(0)
    }
  }
})

test('cost.item, when present, references a known item id', () => {
  for (const node of SKILL_NODES) {
    if (node.cost.item !== undefined) {
      expect(VALID_ITEM_IDS.has(node.cost.item), `${node.id} cost.item '${node.cost.item}' not in items.ts`).toBe(true)
    }
  }
})

// ── conflictsWith invariants ─────────────────────────────────────────────────

test('conflictsWith entries reference existing node ids', () => {
  const allIds = new Set(SKILL_NODES.map((n) => n.id))
  for (const node of SKILL_NODES) {
    if (node.conflictsWith !== undefined) {
      for (const conflictId of node.conflictsWith) {
        expect(allIds.has(conflictId), `${node.id} conflictsWith '${conflictId}' which does not exist`).toBe(true)
      }
    }
  }
})

test('conflictsWith is symmetric: if A conflicts with B, B conflicts with A', () => {
  for (const node of SKILL_NODES) {
    if (node.conflictsWith === undefined) continue
    for (const conflictId of node.conflictsWith) {
      const target = getSkillNode(conflictId)
      expect(target, `${node.id} conflictsWith unknown id ${conflictId}`).not.toBeUndefined()
      expect(target!.conflictsWith, `${node.id} conflicts with ${conflictId} but not vice versa`).toContain(node.id)
    }
  }
})

// ── Bilingual text invariants ─────────────────────────────────────────────────

test('every node has non-empty bilingual names and descriptions', () => {
  for (const node of SKILL_NODES) {
    expect(node.nameVi.trim().length, `${node.id} nameVi is empty`).toBeGreaterThan(0)
    expect(node.nameEn.trim().length, `${node.id} nameEn is empty`).toBeGreaterThan(0)
    expect(node.descVi.trim().length, `${node.id} descVi is empty`).toBeGreaterThan(0)
    expect(node.descEn.trim().length, `${node.id} descEn is empty`).toBeGreaterThan(0)
  }
})

// ── Branch / tier structure ───────────────────────────────────────────────────

test('SKILL_TREES has all 5 branches', () => {
  for (const branch of SKILL_BRANCHES) {
    expect(SKILL_TREES[branch]).toBeDefined()
    expect(SKILL_TREES[branch].length).toBe(20)
  }
})

test('SKILL_TREES tier ordering matches node.tier', () => {
  for (const branch of SKILL_BRANCHES) {
    const list = SKILL_TREES[branch]
    for (let i = 0; i < list.length; i++) {
      expect(list[i]!.tier).toBe(i + 1)
    }
  }
})

// ── Tier-gating plausibility (earlier tiers accessible earlier) ────────────────

test('tier 1 nodes require stage 0', () => {
  for (const branch of SKILL_BRANCHES) {
    const tier1 = SKILL_TREES[branch]![0]!
    expect(tier1.tier).toBe(1)
    expect(tier1.require.stage).toBe(0)
  }
})

test('max stage requirement across all tiers does not exceed 5', () => {
  for (const node of SKILL_NODES) {
    expect(node.require.stage).toBeLessThanOrEqual(5)
  }
})
