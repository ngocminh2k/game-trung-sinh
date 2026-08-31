import { describe, expect, it } from 'vitest'
import { ENEMIES, EQUIPMENT, ITEMS, TECHNIQUES, validateAllContent } from '../src/content'
import { itemArtFor, techniqueArtFor } from '../src/ui/rpgArt'

const NEW_ITEM_IDS = [
  'dew_pill', 'plum_qi_wine', 'ninefold_pill', 'marrow_gather_pill',
  'trail_rations', 'moon_moss', 'cold_iron_ore', 'beast_fang',
  'cloudsilk_thread', 'crane_feather', 'bamboo_saber', 'travelers_coat',
  'bone_ward_charm', 'frostfang_saber', 'cloudveil_robe', 'moonstone_pendant',
  'tide_breath_manual', 'stone_aegis_manual',
] as const

const NEW_TECHNIQUE_IDS = ['tide_breath', 'stone_aegis'] as const
const NEW_EQUIPMENT_IDS = [
  'bamboo_saber', 'travelers_coat', 'bone_ward_charm', 'frostfang_saber',
  'cloudveil_robe', 'moonstone_pendant',
] as const

describe('Scenario I progression content', () => {
  it('gives every new item a stable bilingual definition and shipped art', () => {
    for (const id of NEW_ITEM_IDS) {
      const item = ITEMS.find((entry) => entry.id === id)
      expect(item, id).toBeDefined()
      expect(item?.nameVi).not.toEqual(item?.nameEn)
      expect(item?.descVi.length).toBeGreaterThan(0)
      expect(item?.descEn.length).toBeGreaterThan(0)
      expect(itemArtFor(id)).toMatch(/\.png$/)
    }
  })

  it('makes new manuals and gear mechanically connected to their requirements', () => {
    for (const techniqueId of NEW_TECHNIQUE_IDS) {
      const technique = TECHNIQUES.find((entry) => entry.id === techniqueId)
      expect(technique?.sourceItemId).toBeDefined()
      expect(ITEMS.some((item) => item.id === technique?.sourceItemId)).toBe(true)
      expect(techniqueArtFor(techniqueId)).toMatch(/\.png$/)
    }
    for (const equipmentId of NEW_EQUIPMENT_IDS) {
      const equipment = EQUIPMENT.find((entry) => entry.id === equipmentId)
      const item = ITEMS.find((entry) => entry.id === equipment?.itemId)
      expect(item?.equipmentSlot).toBe(equipment?.slot)
      expect(itemArtFor(equipmentId)).toMatch(/\.png$/)
    }
  })

  it('connects the raw combat drops to real authored item IDs', () => {
    expect(ENEMIES.find((enemy) => enemy.id === 'mist_boar')?.rewardItems.beast_fang).toBe(1)
    expect(ENEMIES.find((enemy) => enemy.id === 'seal_wraith')?.rewardItems.moon_moss).toBe(1)
    expect(ENEMIES.find((enemy) => enemy.id === 'seal_wraith')?.rewardItems.cold_iron_ore).toBe(1)
    expect(ENEMIES.find((enemy) => enemy.id === 'rift_hound')?.rewardItems.crane_feather).toBe(1)
    expect(ENEMIES.find((enemy) => enemy.id === 'rift_hound')?.rewardItems.cloudsilk_thread).toBe(1)
    expect(validateAllContent().errors).toEqual([])
  })
})
