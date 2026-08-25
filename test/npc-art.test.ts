import { describe, expect, it } from 'vitest'
import { NPCS } from '../src/content/npcs'
import { hasIndividualNpcPortrait, npcPortraitFor } from '../src/ui/npcArt'

describe('NPC art registry', () => {
  it('registers one individual portrait for every Scenario I NPC', () => {
    expect(NPCS).toHaveLength(30)

    for (const npc of NPCS) {
      expect(hasIndividualNpcPortrait(npc.id)).toBe(true)
      expect(npcPortraitFor(npc.id)).toMatch(/\.png$/)
    }
  })
})
