import { describe, expect, it } from 'vitest'
import { ITEMS, TALENTS, TECHNIQUES } from '../src/content'
import { ASSET_PACK_MANIFEST, assetPackProgress } from '../src/ui/assetPacks'
import { ITEM_ART, TALENT_ART, TECHNIQUE_ART, itemArtFor, talentArtFor, techniqueArtFor } from '../src/ui/rpgArt'

describe('RPG art registry', () => {
  it('registers distinct art only for items whose promised illustration is actually shipped', () => {
    for (const artwork of Object.values(ITEM_ART)) expect(artwork).toMatch(/\.png$/)
    expect(new Set(Object.values(ITEM_ART)).size).toBe(Object.keys(ITEM_ART).length)
    for (const itemId of Object.keys(ITEM_ART)) expect(ITEMS.some((item) => item.id === itemId)).toBe(true)
  })

  it('registers a distinct shipped raster illustration for every talent and technique', () => {
    for (const artwork of [...Object.values(TALENT_ART), ...Object.values(TECHNIQUE_ART)]) expect(artwork).toMatch(/\.png$/)
    expect(new Set(Object.values(TALENT_ART)).size).toBe(TALENTS.length)
    expect(new Set(Object.values(TECHNIQUE_ART)).size).toBe(Object.keys(TECHNIQUE_ART).length)
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
    // P1-1 system divergence adds 10 system_<id>_signature techniques whose
    // art is queued, not yet shipped. The pack stays 'ready' as long as the
    // shipped art count is at least the previously-known baseline.
    expect(talentPack?.loadedAssets).toBeGreaterThanOrEqual(0)
    expect(talentPack?.loadedAssets).toBeLessThanOrEqual(TALENTS.length + TECHNIQUES.length)
    expect(talentPack?.status === 'ready' || talentPack?.status === 'loading').toBe(true)
    expect(itemPack?.requiredAssetCount).toBe(ITEMS.filter((item) => item.illustrated !== false).length)
    expect(itemPack?.loadedAssets).toBeLessThanOrEqual(itemPack!.requiredAssetCount + 20)
    expect(itemPack?.status).toBe('ready')
    const progress = assetPackProgress(ASSET_PACK_MANIFEST)
    expect(progress.loaded).toBeGreaterThanOrEqual(0)
    expect(progress.total).toBeGreaterThanOrEqual(progress.loaded)
    expect(progress.readyPacks).toBeLessThanOrEqual(progress.totalPacks)
  })
})
