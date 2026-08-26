import { describe, expect, it } from 'vitest'
import { ITEMS, TALENTS, TECHNIQUES } from '../src/content'
import { ITEM_ART, TALENT_ART, TECHNIQUE_ART, itemArtFor, talentArtFor, techniqueArtFor } from '../src/ui/rpgArt'

describe('RPG art registry', () => {
  it('registers raster artwork only for actually shipped item assets', () => {
    for (const artwork of Object.values(ITEM_ART)) expect(artwork).toMatch(/\.png$/)
    for (const item of ITEMS) {
      const artwork = itemArtFor(item.id)
      if (artwork !== undefined) expect(artwork).toMatch(/\.png$/)
    }
  })

  it('does not claim ungenerated talent and technique art is available', () => {
    for (const artwork of [...Object.values(TALENT_ART), ...Object.values(TECHNIQUE_ART)]) expect(artwork).toMatch(/\.png$/)
    expect(TALENTS.some((talent) => talentArtFor(talent.id) === undefined)).toBe(true)
    expect(TECHNIQUES.some((technique) => techniqueArtFor(technique.id) === undefined)).toBe(true)
  })

  it('does not invent art for unknown content identifiers', () => {
    expect(itemArtFor('not-an-item')).toBeUndefined()
    expect(talentArtFor('not-a-talent')).toBeUndefined()
    expect(techniqueArtFor('not-a-technique')).toBeUndefined()
  })
})
