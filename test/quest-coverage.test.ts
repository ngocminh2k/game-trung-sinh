// T13 — quest coverage. Verifies against the REAL content arrays (NPCS,
// QUESTS), not a hand-copied id list: every one of the 60 frozen NPC ids
// (contract docs/plans/expansion-x20/contracts/npc-registry.md) gives >=1
// quest, the pool is >=150, and quest ids are globally unique.
import { describe, expect, it } from 'vitest'
import { NPCS } from '../src/content/npcs'
import { QUESTS } from '../src/content/quests'

describe('quest coverage (T13)', () => {
  it('has at least 150 quests', () => {
    expect(QUESTS.length).toBeGreaterThanOrEqual(150)
  })

  it('keeps quest ids globally unique', () => {
    const ids = QUESTS.map((quest) => quest.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(ids).size).toBe(QUESTS.length)
  })

  it('gives every one of the 60 frozen NPC ids at least one quest', () => {
    expect(NPCS).toHaveLength(60)
    const givers = new Set<string>()
    for (const quest of QUESTS) {
      if (quest.giverNpcId !== null) givers.add(quest.giverNpcId)
    }
    for (const npc of NPCS) {
      expect(givers.has(npc.id), `no quest for ${npc.id}`).toBe(true)
    }
  })
})