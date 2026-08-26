import { describe, expect, it } from 'vitest'
import { ITEMS, TALENTS, TECHNIQUES } from '../src/content'
import { ITEM_ART, TALENT_ART, TECHNIQUE_ART, itemArtFor, talentArtFor, techniqueArtFor } from '../src/ui/rpgArt'

describe('RPG art registry', () => {
  it('registers a distinct shipped raster illustration for every authored item', () => {
    for (const artwork of Object.values(ITEM_ART)) expect(artwork).toMatch(/\.png$/)
    expect(new Set(Object.values(ITEM_ART)).size).toBe(ITEMS.length)
    for (const item of ITEMS) expect(itemArtFor(item.id)).toMatch(/\.png$/)
  })

  it('registers a distinct shipped raster illustration for every talent and technique', () => {
    for (const artwork of [...Object.values(TALENT_ART), ...Object.values(TECHNIQUE_ART)]) expect(artwork).toMatch(/\.png$/)
    expect(new Set(Object.values(TALENT_ART)).size).toBe(TALENTS.length)
    expect(new Set(Object.values(TECHNIQUE_ART)).size).toBe(TECHNIQUES.length)
    for (const talent of TALENTS) expect(talentArtFor(talent.id)).toMatch(/\.png$/)
    for (const technique of TECHNIQUES) expect(techniqueArtFor(technique.id)).toMatch(/\.png$/)
  })

  it('does not invent art for unknown content identifiers', () => {
    expect(itemArtFor('not-an-item')).toBeUndefined()
    expect(talentArtFor('not-a-talent')).toBeUndefined()
    expect(techniqueArtFor('not-a-technique')).toBeUndefined()
  })
})
