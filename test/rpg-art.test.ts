import { describe, expect, it } from 'vitest'
import { ITEMS, TALENTS, TECHNIQUES } from '../src/content'
import { itemArtFor, talentArtFor, techniqueArtFor } from '../src/ui/rpgArt'

describe('RPG art registry', () => {
  it('registers one raster artwork for every currently defined item', () => {
    for (const item of ITEMS) expect(itemArtFor(item.id)).toMatch(/\.png$/)
  })

  it('registers one raster artwork for every currently defined talent', () => {
    for (const talent of TALENTS) expect(talentArtFor(talent.id)).toMatch(/\.png$/)
  })

  it('registers one raster artwork for every currently defined technique', () => {
    for (const technique of TECHNIQUES) expect(techniqueArtFor(technique.id)).toMatch(/\.png$/)
  })

  it('does not invent art for unknown content identifiers', () => {
    expect(itemArtFor('not-an-item')).toBeUndefined()
    expect(talentArtFor('not-a-talent')).toBeUndefined()
    expect(techniqueArtFor('not-a-technique')).toBeUndefined()
  })
})
