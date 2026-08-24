import { describe, expect, it } from 'vitest'
import { hasIndividualNpcPortrait, npcPortraitFor } from '../src/ui/npcArt'

describe('NPC art registry', () => {
  it('registers individual portraits for the completed village and market batch', () => {
    const ids = [
      'n_elder_meihua',
      'n_guard_truong',
      'n_kid_xiaobao',
      'n_innkeeper_hanh',
      'n_farmer_tu',
      'n_storyteller_ngo',
      'n_merchant_bao',
      'n_fortune_lien',
      'n_cook_phung',
    ]

    for (const id of ids) {
      expect(hasIndividualNpcPortrait(id)).toBe(true)
      expect(npcPortraitFor(id)).toMatch(/\.png$/)
    }
  })
})
