import { describe, expect, it } from 'vitest'
import { NPCS } from '../src/content'
import type { NpcDef } from '../src/engine/content-types'

// ─────────────────────────────────────────────────────────────────────────────
// NPC grouping (matches task brief: 10 principal + 20 supporting)
// ─────────────────────────────────────────────────────────────────────────────
const PRINCIPAL_IDS = new Set([
  'n_elder_meihua',
  'n_storyteller_ngo',
  'n_merchant_bao',
  'n_hermit_coc',
  'n_rival_khoa',
  'n_master_vo',
  'n_lost_soul_ha',
  'n_innkeeper_hanh',
  'n_alchemist_sam',
  'n_hunter_son',
])

const isPrincipal = (npc: NpcDef) => PRINCIPAL_IDS.has(npc.id)

// ─────────────────────────────────────────────────────────────────────────────
// (a) Every principal NPC has ≥ 6 authored lines; every supporting NPC has ≥ 3.
// ─────────────────────────────────────────────────────────────────────────────
describe('npc-depth data: line count requirements', () => {
  it('10 principal NPCs have at least 6 authored lines each', () => {
    const principals = NPCS.filter(isPrincipal)
    expect(principals.length, 'should have 10 principals').toBe(10)
    for (const npc of principals) {
      const count = npc.lines?.length ?? 0
      expect(count, `${npc.id} has ${count} lines, need ≥6`).toBeGreaterThanOrEqual(6)
    }
  })

  it('30 remaining NPCs have at least 3 authored lines each', () => {
    const supporting = NPCS.filter((n) => !isPrincipal(n))
    expect(supporting.length, 'should have 30 supporting').toBe(30)
    for (const npc of supporting) {
      const count = npc.lines?.length ?? 0
      expect(count, `${npc.id} has ${count} lines, need ≥3`).toBeGreaterThanOrEqual(3)
    }
  })

  it('every NPC with authored lines has at least one line with a valid condition', () => {
    for (const npc of NPCS) {
      if (!npc.lines || npc.lines.length === 0) continue
      const hasCondition = npc.lines.some(
        (line) =>
          line.when.affMin !== undefined ||
          line.when.affMax !== undefined ||
          line.when.dayMin !== undefined ||
          line.when.questDone !== undefined ||
          line.when.questActive !== undefined ||
          line.when.flag !== undefined ||
          line.when.scene !== undefined,
      )
      expect(hasCondition, `${npc.id} has lines but none have a when-condition`).toBe(true)
    }
  })

  it('every authored line is bilingual: both vi and en non-empty', () => {
    for (const npc of NPCS) {
      if (!npc.lines) continue
      for (const line of npc.lines) {
        expect(line.vi.length, `${npc.id}: vi line is empty`).toBeGreaterThan(0)
        expect(line.en.length, `${npc.id}: en line is empty`).toBeGreaterThan(0)
      }
    }
  })

  it('affMin conditions on the same NPC are in ascending order', () => {
    for (const npc of NPCS) {
      if (!npc.lines) continue
      let prev = -1
      for (const line of npc.lines) {
        if (line.when.affMin !== undefined) {
          expect(line.when.affMin, `${npc.id}: affMin ${line.when.affMin} ≤ previous ${prev}`).toBeGreaterThan(prev)
          prev = line.when.affMin
        }
      }
    }
  })

  it('affMin values use milestone denominations 1, 3, 6, 9', () => {
    const VALID = new Set([1, 3, 6, 9])
    for (const npc of NPCS) {
      if (!npc.lines) continue
      for (const line of npc.lines) {
        if (line.when.affMin !== undefined) {
          expect(VALID.has(line.when.affMin), `${npc.id}: affMin=${line.when.affMin} not in {1,3,6,9}`).toBe(true)
        }
      }
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// (b) Dialogue selection: affinity conditions yield different lines as aff grows.
// This is a DATA-CONSISTENCY test — it verifies the authored data is structured
// so the engine can return distinct lines at different affinity levels.
// ─────────────────────────────────────────────────────────────────────────────
describe('npc-depth data: affinity escalation per NPC', () => {
  for (const npc of NPCS) {
    if (!npc.lines || npc.lines.length === 0) continue
    const affLines = npc.lines.filter((l) => l.when.affMin !== undefined).sort((a, b) => (a.when.affMin ?? 0) - (b.when.affMin ?? 0))
    if (affLines.length < 2) continue

    // At least two distinct affMin thresholds must differ
    const thresholds = affLines.map((l) => l.when.affMin!)
    const distinct = new Set(thresholds)
    it(`${npc.id} has at least two different affMin thresholds (found: ${[...distinct].join(', ')})`, () => {
      expect(distinct.size).toBeGreaterThanOrEqual(2)
    })

    // Each affinity tier has a unique vi string (engine uses first-match)
    it(`${npc.id}: each affMin tier has a unique VI line`, () => {
      const viSet = new Set(affLines.map((l) => l.vi))
      expect(viSet.size, `${npc.id}: duplicate VI text across affMin tiers`).toBe(affLines.length)
    })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// (c) questDone / questActive conditions reference existing quest IDs.
// ─────────────────────────────────────────────────────────────────────────────
describe('npc-depth data: quest references', () => {
  // Quest IDs that exist in the current quest data
  const VALID_QUEST_IDS = new Set(['q_herb_delivery', 'q_talisman_order', 'q_sealed_cave'])

  it('questDone conditions reference valid quest IDs', () => {
    let total = 0
    for (const npc of NPCS) {
      if (!npc.lines) continue
      for (const line of npc.lines) {
        if (line.when.questDone !== undefined) {
          total += 1
          expect(
            VALID_QUEST_IDS.has(line.when.questDone),
            `${npc.id}: questDone="${line.when.questDone}" not in known quests`,
          ).toBe(true)
        }
      }
    }
    expect(total, 'no questDone lines found — at least one should exist').toBeGreaterThan(0)
  })

  it('questActive conditions reference valid quest IDs', () => {
    let total = 0
    for (const npc of NPCS) {
      if (!npc.lines) continue
      for (const line of npc.lines) {
        if (line.when.questActive !== undefined) {
          total += 1
          expect(
            VALID_QUEST_IDS.has(line.when.questActive),
            `${npc.id}: questActive="${line.when.questActive}" not in known quests`,
          ).toBe(true)
        }
      }
    }
    expect(total, 'no questActive lines found — at least one should exist').toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// (d) Fallback greet fields remain non-empty on every NPC (engine fallback).
// ─────────────────────────────────────────────────────────────────────────────
describe('npc-depth data: greet fallback integrity', () => {
  it('every NPC has a non-empty greetVi', () => {
    for (const npc of NPCS) {
      expect(npc.greetVi.length, `${npc.id}: greetVi is empty`).toBeGreaterThan(0)
    }
  })

  it('every NPC has a non-empty greetEn', () => {
    for (const npc of NPCS) {
      expect(npc.greetEn.length, `${npc.id}: greetEn is empty`).toBeGreaterThan(0)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// (e) Scene conditions reference known story scene IDs.
// ─────────────────────────────────────────────────────────────────────────────
describe('npc-depth data: story scene references', () => {
  const VALID_SCENES = new Set([
    'letter_at_dawn',
    'market_rumor',
    'village_vow',
    'market_bargain',
    'memory_trail',
    'cave_witness',
    'sect_trial',
    'mirror_choice',
    'last_page',
  ])

  it('scene conditions reference valid story scene IDs', () => {
    let total = 0
    for (const npc of NPCS) {
      if (!npc.lines) continue
      for (const line of npc.lines) {
        if (line.when.scene !== undefined) {
          total += 1
          expect(
            VALID_SCENES.has(line.when.scene),
            `${npc.id}: scene="${line.when.scene}" not in known scenes`,
          ).toBe(true)
        }
      }
    }
    expect(total, 'no scene lines found').toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Summary statistics
// ─────────────────────────────────────────────────────────────────────────────
describe('npc-depth data: summary', () => {
  it('total authored lines across all 40 NPCs', () => {
    const principal = NPCS.filter(isPrincipal)
    const supporting = NPCS.filter((n) => !isPrincipal(n))
    const pLines = principal.reduce((s, n) => s + (n.lines?.length ?? 0), 0)
    const sLines = supporting.reduce((s, n) => s + (n.lines?.length ?? 0), 0)
    expect(pLines).toBeGreaterThanOrEqual(60) // 10 × 6
    expect(sLines).toBeGreaterThanOrEqual(90) // 30 × 3
  })

  it('all 40 NPCs are present with unique ids', () => {
    expect(NPCS).toHaveLength(40)
    const ids = new Set(NPCS.map((n) => n.id))
    expect(ids.size).toBe(40)
  })

  it('all NPCs have a valid locationId', () => {
    for (const npc of NPCS) {
      expect(typeof npc.locationId).toBe('string')
      expect(npc.locationId.length).toBeGreaterThan(0)
    }
  })
})
