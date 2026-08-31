import { describe, expect, it } from 'vitest'
import { NPCS } from '../src/content/npcs'
import { INDIVIDUAL_NPC_PORTRAITS, npcPortraitFor } from '../src/ui/npcArt'

describe('NPC art registry', () => {
  it('resolves every NPC to a real portrait and never orphans a registered key', () => {
    expect(NPCS).toHaveLength(40)

    // Every NPC (core or world cultivator) renders a real PNG; world NPCs may
    // use the truthful ensemble fallback (CONTENT-02), never a missing asset.
    for (const npc of NPCS) {
      expect(npcPortraitFor(npc.id)).toMatch(/\.png$/)
    }

    // Every registered portrait key maps to a real NPC — no stale entries.
    const npcIds = new Set(NPCS.map((n) => n.id))
    for (const id of Object.keys(INDIVIDUAL_NPC_PORTRAITS)) {
      expect(npcIds.has(id)).toBe(true)
    }
  })
})
