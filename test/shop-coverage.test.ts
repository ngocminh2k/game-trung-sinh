// T13 — shop coverage. Verifies against the REAL content arrays (NPCS,
// SHOPS), not a hand-copied id list: 54 shops + 6 public shop-less NPCs
// tile the 60 frozen NPC ids exactly once, and every entry carries at
// least one price that is >= 1.
import { describe, expect, it } from 'vitest'
import { NPCS } from '../src/content/npcs'
import { NPCS_WITHOUT_SHOP, SHOPS } from '../src/content/shops'

describe('shop coverage (T13)', () => {
  it('ships exactly 54 shops and 6 shop-less NPCs', () => {
    expect(SHOPS).toHaveLength(54)
    expect(new Set(SHOPS.map((shop) => shop.npcId)).size).toBe(SHOPS.length)
    expect(NPCS_WITHOUT_SHOP).toHaveLength(6)
    expect(new Set(NPCS_WITHOUT_SHOP).size).toBe(6)
  })

  it('covers exactly the 60 NPC ids once (54 shop + 6 whitelist)', () => {
    expect(NPCS).toHaveLength(60)
    const covered = [...SHOPS.map((shop) => shop.npcId), ...NPCS_WITHOUT_SHOP]
    const npcIds = new Set(NPCS.map((npc) => npc.id))
    // No overlap between shop NPCs and the whitelist, and nothing outside NPCS.
    expect(new Set(covered).size).toBe(60)
    for (const id of covered) {
      expect(npcIds.has(id), id).toBe(true)
    }
    // Every NPC is reachable through exactly one shop or the whitelist.
    for (const npc of NPCS) {
      expect(covered.filter((id) => id === npc.id)).toHaveLength(1)
    }
  })

  it('gives every shop entry at least one price and every price is >= 1', () => {
    for (const shop of SHOPS) {
      for (const entry of shop.entries) {
        const prices: number[] = []
        for (const key of ['priceGold', 'priceSilver', 'priceLS'] as const) {
          const value = entry[key]
          if (value !== undefined && value !== null) prices.push(value)
        }
        expect(prices.length, `${shop.npcId}:${entry.itemId}`).toBeGreaterThanOrEqual(1)
        for (const price of prices) {
          expect(price, `${shop.npcId}:${entry.itemId}`).toBeGreaterThanOrEqual(1)
        }
      }
    }
  })
})