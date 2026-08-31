import { describe, expect, it } from 'vitest'
import { HYBRID_RECIPES, hybridForSeason } from '../src/content/alchemy'
import { ITEMS } from '../src/content/items'
import { RECIPES } from '../src/content/refinement'

/** Herb ids declared in contracts/item-ids.md (frozen). */
const HERB_IDS = [
  'herb_hong_silk',
  'herb_ice_heart',
  'herb_blood_ginseng',
  'herb_cloud_dew',
  'herb_moon_shard',
  'herb_fire_lotus',
  'herb_white_banner',
  'herb_green_vine',
  'herb_purple_daisy',
  'herb_earth_marrow',
  'herb_wind_bamboo',
  'herb_void_bamboo',
]

/** Hybrid pill ids declared in contracts/item-ids.md (frozen). */
const PILL_IDS = [
  'pill_hybrid_silk_heart',
  'pill_hybrid_blood_dew',
  'pill_hybrid_moon_fire',
  'pill_hybrid_banner_daisy',
  'pill_hybrid_marrow_bamboo',
  'pill_hybrid_cloud_lotus',
  'pill_hybrid_ice_ginseng',
  'pill_hybrid_dew_daisy',
  'pill_hybrid_earth_fire',
  'pill_hybrid_silk_dew',
  'pill_hybrid_moon_marrow',
  'pill_hybrid_wind_heart',
]

const SEASONS = ['xuan', 'ha', 'thu', 'dong'] as const

const hybridRecipes = RECIPES.filter((recipe) => recipe.id.startsWith('r_hybrid_'))

describe('alchemy hybrid recipes (T07)', () => {
  it('declares exactly twelve r_hybrid refinement recipes', () => {
    expect(hybridRecipes).toHaveLength(12)
    expect(new Set(hybridRecipes.map((recipe) => recipe.id)).size).toBe(12)
  })

  it('uses only real herb ingredients in a 2+1 shape and a real output item', () => {
    const herbSet = new Set(HERB_IDS)
    const itemIds = new Set(ITEMS.map((item) => item.id))
    for (const recipe of hybridRecipes) {
      expect(recipe.locationId).toBe('thousand_herbs_valley')
      const ingredientIds = Object.keys(recipe.ingredients)
      expect(ingredientIds).toHaveLength(2)
      for (const ingredientId of ingredientIds) {
        expect(herbSet.has(ingredientId)).toBe(true)
        expect(itemIds.has(ingredientId)).toBe(true)
      }
      expect(Object.values(recipe.ingredients).sort()).toEqual([1, 2])
      expect(itemIds.has(recipe.output.itemId)).toBe(true)
      expect(recipe.output.qty).toBe(1)
    }
  })

  it('outputs cover all twelve pill_hybrid ids exactly once', () => {
    expect(hybridRecipes.map((recipe) => recipe.output.itemId).sort()).toEqual([...PILL_IDS].sort())
  })

  it('declares twelve lore entries whose recipeIds match refinement.ts', () => {
    expect(HYBRID_RECIPES).toHaveLength(12)
    expect(new Set(HYBRID_RECIPES.map((lore) => lore.recipeId)).size).toBe(12)
    expect(new Set(HYBRID_RECIPES.map((lore) => lore.recipeId))).toEqual(
      new Set(hybridRecipes.map((recipe) => recipe.id)),
    )
    for (const lore of HYBRID_RECIPES) {
      expect(lore.nameVi.length).toBeGreaterThan(0)
      expect(lore.nameEn.length).toBeGreaterThan(0)
      expect(lore.loreVi.length).toBeGreaterThan(0)
      expect(lore.loreEn.length).toBeGreaterThan(0)
      expect(SEASONS).toContain(lore.seasonVi)
      expect(lore.seasonEn.length).toBeGreaterThan(0)
    }
  })

  it('gives every season at least two recipes and covers all twelve together', () => {
    const covered = new Set<string>()
    for (const season of SEASONS) {
      const ids = hybridForSeason(season)
      expect(ids.length).toBeGreaterThanOrEqual(2)
      for (const id of ids) covered.add(id)
    }
    expect(covered.size).toBe(12)
  })
})
