import { describe, expect, it } from 'vitest'
import { ITEMS, TALENTS, TECHNIQUES } from '../src/content'
import { ASSET_PACK_MANIFEST, assetPackProgress } from '../src/ui/assetPacks'
import { ITEM_ART, TALENT_ART, TECHNIQUE_ART, itemArtFor, talentArtFor, techniqueArtFor } from '../src/ui/rpgArt'

describe('RPG art registry', () => {
  it('registers one distinct shipped illustration for every authored item', () => {
    for (const artwork of Object.values(ITEM_ART)) expect(artwork).toMatch(/\.png$/)
    expect(new Set(Object.values(ITEM_ART)).size).toBe(Object.keys(ITEM_ART).length)
    expect(Object.keys(ITEM_ART)).toHaveLength(ITEMS.length)
    for (const item of ITEMS) expect(itemArtFor(item.id)).toMatch(/\.png$/)
  })

  it('registers a distinct shipped raster illustration for every talent and technique', () => {
    for (const artwork of [...Object.values(TALENT_ART), ...Object.values(TECHNIQUE_ART)]) expect(artwork).toMatch(/\.png$/)
    expect(new Set(Object.values(TALENT_ART)).size).toBe(TALENTS.length)
    expect(new Set(Object.values(TECHNIQUE_ART)).size).toBe(TECHNIQUES.length)
    for (const talent of TALENTS) expect(talentArtFor(talent.id)).toMatch(/\.png$/)
    for (const techniqueId of Object.keys(TECHNIQUE_ART)) expect(TECHNIQUES.some((technique) => technique.id === techniqueId)).toBe(true)
  })

  it('does not invent art for unknown content identifiers', () => {
    expect(itemArtFor('not-an-item')).toBeUndefined()
    expect(talentArtFor('not-a-talent')).toBeUndefined()
    expect(techniqueArtFor('not-a-technique')).toBeUndefined()
  })

  it('keeps the shipped progression manifest truthful as content grows', () => {
    const talentPack = ASSET_PACK_MANIFEST.find((pack) => pack.id === 'talents-and-effects')
    const itemPack = ASSET_PACK_MANIFEST.find((pack) => pack.id === 'items-and-equipment')

    expect(talentPack?.requiredAssetCount).toBe(TALENTS.length + TECHNIQUES.length)
    expect(talentPack?.loadedAssets).toBe(TALENTS.length + TECHNIQUES.length)
    expect(talentPack?.status).toBe('ready')
    expect(itemPack?.requiredAssetCount).toBe(ITEMS.length)
    expect(itemPack?.loadedAssets).toBe(ITEMS.length)
    expect(itemPack?.status).toBe('ready')
    expect(assetPackProgress(ASSET_PACK_MANIFEST).loaded).toBe(103)
    expect(assetPackProgress(ASSET_PACK_MANIFEST).total).toBe(103)
  })
})
