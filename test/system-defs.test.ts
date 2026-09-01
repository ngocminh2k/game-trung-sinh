// S01 — System definitions: shape, uniqueness, item-pool validity, i18n parity.
import { describe, expect, it } from 'vitest'
import { SYSTEMS, systemById } from '../src/content/system-defs'
import { ITEMS } from '../src/content/items'

describe('S01 system defs', () => {
  it('has exactly 10 systems', () => {
    expect(SYSTEMS).toHaveLength(10)
  })

  it('keeps ids unique and order strictly ascending 1..10', () => {
    const ids = SYSTEMS.map((system) => system.id)
    expect(new Set(ids).size).toBe(10)
    SYSTEMS.forEach((system, index) => {
      expect(system.order).toBe(index + 1)
    })
  })

  it('has non-empty bilingual name/header/personality', () => {
    for (const system of SYSTEMS) {
      expect(system.nameVi.length).toBeGreaterThan(0)
      expect(system.nameEn.length).toBeGreaterThan(0)
      expect(system.headerVi.length).toBeGreaterThan(0)
      expect(system.headerEn.length).toBeGreaterThan(0)
      expect(system.personalityVi.length).toBeGreaterThan(0)
      expect(system.personalityEn.length).toBeGreaterThan(0)
    }
  })

  it('references only real item ids in itemPool', () => {
    const itemIds = new Set(ITEMS.map((item) => item.id))
    for (const system of SYSTEMS) {
      expect(system.rewardBudget.itemPool.length).toBeGreaterThan(0)
      for (const id of system.rewardBudget.itemPool) {
        expect(itemIds.has(id), `${system.id} references missing item ${id}`).toBe(true)
      }
    }
  })

  it('keeps budgets sane (min <= max)', () => {
    for (const system of SYSTEMS) {
      expect(system.rewardBudget.minGold).toBeLessThanOrEqual(system.rewardBudget.maxGold)
      expect(system.rewardBudget.minSpiritStones).toBeLessThanOrEqual(system.rewardBudget.maxSpiritStones)
    }
  })

  it('systemById resolves and misses cleanly', () => {
    expect(systemById('sys_void')?.id).toBe('sys_void')
    expect(systemById('nope')).toBeUndefined()
  })
})
