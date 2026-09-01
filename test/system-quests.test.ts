import { describe, expect, it } from 'vitest'
import { SYSTEM_QUESTS } from '../src/content/system-quests'
import { SYSTEMS, type SystemId } from '../src/content/system-defs'
import { ITEMS } from '../src/content/items'

describe('S03 System Quest Pool', () => {
  it('has at least 50 quests total', () => {
    expect(SYSTEM_QUESTS.length).toBeGreaterThanOrEqual(50)
  })

  it('has between 5 and 8 quests for each of the 10 systems', () => {
    const counts: Record<SystemId, number> = Object.fromEntries(SYSTEMS.map((sys) => [sys.id, 0])) as Record<SystemId, number>
    for (const q of SYSTEM_QUESTS) {
      expect(q.requiredSystemId).toBeDefined()
      const id = q.requiredSystemId as SystemId
      counts[id] += 1
    }
    for (const [sysId, count] of Object.entries(counts)) {
      expect(count, `Quest count for ${sysId}`).toBeGreaterThanOrEqual(5)
      expect(count, `Quest count for ${sysId}`).toBeLessThanOrEqual(8)
    }
  })

  it('enforces system quest structural invariants', () => {
    const ids = new Set<string>()
    for (const q of SYSTEM_QUESTS) {
      expect(ids.has(q.id), `Duplicate quest id ${q.id}`).toBe(false)
      ids.add(q.id)
      expect(q.id).toMatch(/^q_sys_[a-z]+_\d{2}$/)
      expect(q.giverNpcId).toBeNull()
      expect(q.storySceneNextId).toBeUndefined()
      expect(q.secret).toBe(true)
      expect(q.deadlineDays).toBeGreaterThanOrEqual(1)
      expect(q.deadlineDays).toBeLessThanOrEqual(3)
      expect(q.difficulty).toBeGreaterThanOrEqual(1)
      expect(q.difficulty).toBeLessThanOrEqual(10)
    }
  })

  it('respects budget limits for every system quest', () => {
    const itemIds = new Set(ITEMS.map((item) => item.id))
    const sysMap = new Map(SYSTEMS.map((s) => [s.id, s]))

    for (const q of SYSTEM_QUESTS) {
      const sys = sysMap.get(q.requiredSystemId as SystemId)
      expect(sys, `System for ${q.id}`).toBeDefined()
      const budget = sys!.rewardBudget

      expect(q.rewardGold).toBeGreaterThanOrEqual(budget.minGold)
      expect(q.rewardGold).toBeLessThanOrEqual(budget.maxGold)

      if (q.rewardSpiritStones !== undefined) {
        expect(q.rewardSpiritStones).toBeGreaterThanOrEqual(budget.minSpiritStones)
        expect(q.rewardSpiritStones).toBeLessThanOrEqual(budget.maxSpiritStones)
      }

      for (const [itemId, qty] of Object.entries(q.rewardItems)) {
        expect(qty).toBeGreaterThan(0)
        expect(itemIds.has(itemId), `Unknown item ${itemId} in reward`).toBe(true)
        expect(budget.itemPool.includes(itemId), `Item ${itemId} not in ${sys!.id} budget itemPool`).toBe(true)
      }
    }
  })
})
