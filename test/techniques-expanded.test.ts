import { describe, expect, it } from 'vitest'
import { TECHNIQUES } from '../src/content/rpg'
import {
  PHI_PHONG_TRAM,
  SKILL_BRANCHES,
  SKILL_NODES,
  SPECIAL_NODES,
  skillNodesInBranch,
} from '../src/content/skill-tree'

// T08 (expansion-x20): 9 hidden techniques + skill-tree wiring for them, plus
// the phi_phong_tram capstone unlock node. The nine pre-existing techniques are
// frozen here so any accidental edit to their identity fields fails this test.

const OLD_TECHNIQUES: ReadonlyArray<{ id: string; requiredStage: number; sourceItemId?: string }> = [
  { id: 'basic_staff_form', requiredStage: 0 },
  { id: 'crooked_circulation', requiredStage: 0, sourceItemId: 'old_manual' },
  { id: 'rift_step', requiredStage: 2, sourceItemId: 'rift_step_scroll' },
  { id: 'herbal_breath', requiredStage: 1, sourceItemId: 'herbal_breath_manual' },
  { id: 'iron_skin', requiredStage: 1, sourceItemId: 'iron_skin_manual' },
  { id: 'cloudwalk', requiredStage: 2, sourceItemId: 'cloudwalk_manual' },
  { id: 'peak_cleaver', requiredStage: 3, sourceItemId: 'peak_cleaver_manual' },
  { id: 'tide_breath', requiredStage: 2, sourceItemId: 'tide_breath_manual' },
  { id: 'stone_aegis', requiredStage: 3, sourceItemId: 'stone_aegis_manual' },
]

const HIDDEN = TECHNIQUES.filter((t) => t.id.endsWith('_hidden'))
const MAIN_9 = OLD_TECHNIQUES.map((t) => t.id)
const HIDDEN_BY_BRANCH: Record<string, number> = { sword: 2, aura: 2, herbal: 2, shadow: 2, thunder: 1 }

describe('TECHNIQUES — 18 main + 10 system signatures', () => {
  it('has the 18 main techniques (9 old + 9 hidden) plus 10 system signatures', () => {
    // P1-1 system divergence adds 10 system_<id>_signature techniques.
    expect(TECHNIQUES).toHaveLength(28)
    expect(new Set(TECHNIQUES.map((t) => t.id)).size).toBe(28)
  })

  it('has exactly 9 hidden techniques (ids ending _hidden)', () => {
    expect(HIDDEN).toHaveLength(9)
  })

  it('keeps the 9 original techniques untouched', () => {
    for (const old of OLD_TECHNIQUES) {
      const t = TECHNIQUES.find((x) => x.id === old.id)
      expect(t, `old technique ${old.id} missing`).toBeDefined()
      expect(t!.requiredStage).toBe(old.requiredStage)
      expect(t!.sourceItemId).toBe(old.sourceItemId)
    }
  })

  it('distributes the 9 hidden techniques as sword 2 / aura 2 / herbal 2 / shadow 2 / thunder 1', () => {
    const counts: Record<string, number> = {}
    for (const t of HIDDEN) {
      const branch = t.id.split('_')[0]!
      counts[branch] = (counts[branch] ?? 0) + 1
    }
    expect(counts).toEqual(HIDDEN_BY_BRANCH)
  })

  it('every hidden technique is Phase-3 two-faced: benefit + cost in Vi and En', () => {
    for (const t of HIDDEN) {
      expect(t.benefitVi?.trim().length ?? 0, `${t.id} benefitVi`).toBeGreaterThan(0)
      expect(t.benefitEn?.trim().length ?? 0, `${t.id} benefitEn`).toBeGreaterThan(0)
      expect(t.costVi?.trim().length ?? 0, `${t.id} costVi`).toBeGreaterThan(0)
      expect(t.costEn?.trim().length ?? 0, `${t.id} costEn`).toBeGreaterThan(0)
    }
  })

  it('every hidden technique has a contextual penalty field matching its cost text face', () => {
    for (const t of HIDDEN) {
      const hasPenalty = t.gatherQiDrain !== undefined || t.sellPenalty !== undefined
      expect(hasPenalty, `${t.id} has no gatherQiDrain/sellPenalty`).toBe(true)
    }
  })

  it('every hidden technique sits above the old ladder: stage 4-5 and sourceItemId <id>_manual', () => {
    const maxOldStage = Math.max(...OLD_TECHNIQUES.map((t) => t.requiredStage))
    for (const t of HIDDEN) {
      expect(t.requiredStage).toBeGreaterThan(maxOldStage)
      expect(t.requiredStage).toBeLessThanOrEqual(5)
      expect(t.sourceItemId).toBe(`${t.id}_manual`)
      expect(t.maxLevel).toBe(1)
      expect(typeof t.power).toBe('number')
    }
  })

  it('every technique (old and hidden) has non-empty bilingual names and descriptions', () => {
    for (const t of TECHNIQUES) {
      expect(t.nameVi.trim().length).toBeGreaterThan(0)
      expect(t.nameEn.trim().length).toBeGreaterThan(0)
      expect(t.descVi.trim().length).toBeGreaterThan(0)
      expect(t.descEn.trim().length).toBeGreaterThan(0)
    }
  })

  it('creates no 19th technique for phi_phong_tram', () => {
    expect(TECHNIQUES.some((t) => t.id === 'phi_phong_tram')).toBe(false)
  })
})

describe('skill-tree — hidden-technique gating and phi_phong_tram', () => {
  it('main tree keeps its pinned shape: 100 nodes, 20 tiers per branch', () => {
    expect(SKILL_NODES).toHaveLength(100)
    for (const branch of SKILL_BRANCHES) {
      expect(skillNodesInBranch(branch)).toHaveLength(20)
    }
  })

  it('every branch has at least 3 nodes', () => {
    for (const branch of SKILL_BRANCHES) {
      expect(skillNodesInBranch(branch).length).toBeGreaterThanOrEqual(3)
    }
  })

  it('every branch gates at least one node on one of its own hidden techniques', () => {
    const hiddenIds = new Set(HIDDEN.map((t) => t.id))
    for (const branch of SKILL_BRANCHES) {
      const gated = skillNodesInBranch(branch).filter(
        (n) => n.require.techniques?.some((id) => hiddenIds.has(id)) ?? false,
      )
      expect(gated.length, `branch ${branch} has no hidden-technique gate`).toBeGreaterThanOrEqual(1)
      for (const node of gated) {
        for (const id of node.require.techniques ?? []) {
          if (hiddenIds.has(id)) expect(id.startsWith(`${branch}_`), `${node.id} gates on foreign hidden ${id}`).toBe(true)
        }
      }
    }
  })

  it('every require.techniques reference across the tree resolves to a real technique', () => {
    const techniqueIds = new Set(TECHNIQUES.map((t) => t.id))
    for (const node of [...SKILL_NODES, ...SPECIAL_NODES]) {
      for (const id of node.require.techniques ?? []) {
        expect(techniqueIds.has(id), `${node.id} requires unknown technique ${id}`).toBe(true)
      }
    }
  })

  it('phi_phong_tram exists exactly once across the whole skill tree', () => {
    const everywhere = [...SKILL_NODES, ...SPECIAL_NODES].filter((n) => n.id === 'phi_phong_tram')
    expect(everywhere).toHaveLength(1)
    expect(everywhere[0]).toBe(PHI_PHONG_TRAM)
  })

  it('phi_phong_tram is the sword-branch capstone requiring all 9 main techniques', () => {
    expect(PHI_PHONG_TRAM.branch).toBe('sword')
    expect(PHI_PHONG_TRAM.tier).toBeGreaterThan(20)
    expect([...PHI_PHONG_TRAM.require.techniques ?? []].sort()).toEqual([...MAIN_9].sort())
    expect(PHI_PHONG_TRAM.effect.kind).toBe('aoe')
    expect(PHI_PHONG_TRAM.effect.value).toBe(9)
    expect(PHI_PHONG_TRAM.conflictsWith).toEqual([])
  })

  it('phi_phong_tram is not inside the pinned 100-node SKILL_NODES array', () => {
    expect(SKILL_NODES.some((n) => n.id === 'phi_phong_tram')).toBe(false)
  })
})
