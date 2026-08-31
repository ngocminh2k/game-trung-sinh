// T11 — shop-per-NPC data + pure stock lookup. Verifies against the REAL
// content arrays (ITEMS, NPCS), not a hand-copied id list, so the test cannot
// drift from src/content.
import { describe, expect, it } from 'vitest'
import { ITEMS } from '../src/content/items'
import { NPCS } from '../src/content/npcs'
import { NPCS_WITHOUT_SHOP, SHOPS, type ShopEntry } from '../src/content/shops'
import { entryPrice, shopForNpc, validateShops } from '../src/engine/shopStock'

const WHITELIST = [
  'n_gardener_thin',
  'n_judge_quang',
  'n_ice_hermit_bang',
  'n_lost_soul_ha',
  'n_crane_spirit',
  'n_monk_nhu',
].sort()

const LS_HEAVY = ['n_alchemist_sam', 'n_banker_tin', 'n_name_collector_tra']

const validItemIds = new Set(ITEMS.map((item) => item.id))
const validNpcIds = new Set(NPCS.map((npc) => npc.id))
const shopNpcIds = SHOPS.map((shop) => shop.npcId)

describe('shops-per-npc (T11)', () => {
  it('has exactly 54 shops — one per NPC outside the whitelist', () => {
    expect(SHOPS).toHaveLength(54)
    expect(new Set(shopNpcIds).size).toBe(54)
    expect(NPCS).toHaveLength(60)
    expect(validNpcIds.size).toBe(60)
    // Every non-whitelisted NPC has exactly one shop, and only those.
    const expected = [...validNpcIds].filter((id) => !NPCS_WITHOUT_SHOP.includes(id)).sort()
    expect([...shopNpcIds].sort()).toEqual(expected)
  })

  it('whitelists exactly the 6 story-quiet NPCs', () => {
    expect(NPCS_WITHOUT_SHOP).toHaveLength(6)
    expect([...NPCS_WITHOUT_SHOP].sort()).toEqual(WHITELIST)
  })

  it('every shop has 10-15 entries with exactly one price field', () => {
    for (const shop of SHOPS) {
      expect(shop.entries.length, shop.npcId).toBeGreaterThanOrEqual(10)
      expect(shop.entries.length, shop.npcId).toBeLessThanOrEqual(15)
      const ids = new Set(shop.entries.map((entry) => entry.itemId))
      expect(ids.size, shop.npcId).toBe(shop.entries.length)
      for (const entry of shop.entries) {
        const prices = [entry.priceGold, entry.priceSilver, entry.priceLS].filter((p) => p !== undefined)
        expect(prices.length, `${shop.npcId}:${entry.itemId}`).toBe(1)
      }
    }
  })

  it('only uses real item ids and real npc ids', () => {
    for (const shop of SHOPS) {
      expect(validNpcIds.has(shop.npcId), shop.npcId).toBe(true)
      for (const entry of shop.entries) {
        expect(validItemIds.has(entry.itemId), `${shop.npcId}:${entry.itemId}`).toBe(true)
      }
    }
  })

  it('has bilingual, non-empty labels on every shop', () => {
    for (const shop of SHOPS) {
      expect(shop.labelVi.length, shop.npcId).toBeGreaterThan(0)
      expect(shop.labelEn.length, shop.npcId).toBeGreaterThan(0)
    }
  })

  it('gives every shop >=1 priceSilver entry, and sam/banker_tin/tra >=2 priceLS', () => {
    for (const shop of SHOPS) {
      const silverCount = shop.entries.filter((e) => e.priceSilver !== undefined).length
      const lsCount = shop.entries.filter((e) => e.priceLS !== undefined).length
      expect(silverCount, shop.npcId).toBeGreaterThanOrEqual(1)
      if (LS_HEAVY.includes(shop.npcId)) {
        expect(lsCount, shop.npcId).toBeGreaterThanOrEqual(2)
      }
    }
    for (const npcId of LS_HEAVY) {
      const shop = shopForNpc(npcId)
      expect(shop, npcId).not.toBeNull()
      expect(shop!.entries.filter((e) => e.priceLS !== undefined).length, npcId).toBeGreaterThanOrEqual(2)
    }
  })

  it('shopForNpc resolves the right shop and null elsewhere', () => {
    const bao = shopForNpc('n_merchant_bao')
    expect(bao).not.toBeNull()
    expect(bao!.npcId).toBe('n_merchant_bao')
    expect(bao!.entries.length).toBeGreaterThanOrEqual(10)
    for (const npcId of WHITELIST) {
      expect(shopForNpc(npcId)).toBeNull()
    }
    expect(shopForNpc('n_nobody')).toBeNull()
  })

  it('entryPrice scales by weatherMod and floors', () => {
    const gold: ShopEntry = { itemId: 'pill_hp', priceGold: 10 }
    const silver: ShopEntry = { itemId: 'moon_moss', priceSilver: 50 }
    const ls: ShopEntry = { itemId: 'pill_ls_ninefold', priceLS: 5 }
    expect(entryPrice(gold, 1)).toBe(10)
    expect(entryPrice(gold, 0.8)).toBe(8)
    expect(entryPrice({ itemId: 'pill_hp', priceGold: 9 }, 0.8)).toBe(7) // 7.2 -> 7
    expect(entryPrice(silver, 0.8)).toBe(40)
    expect(entryPrice(ls, 0.8)).toBe(4)
    expect(entryPrice(ls, 0.31)).toBe(1) // 1.55 -> 1
    expect(entryPrice(gold, 1.25)).toBe(12) // 12.5 -> 12
  })

  it('validateShops is quiet on real content and loud on junk', () => {
    const errors: string[] = []
    validateShops(errors, validItemIds, validNpcIds)
    expect(errors).toEqual([])

    const junk: string[] = []
    validateShops(junk, new Set(), new Set())
    expect(junk.length).toBeGreaterThan(0)
    expect(junk.some((line) => line.includes('npcId not found in NPCS'))).toBe(true)

    const badItem: string[] = []
    validateShops(badItem, validItemIds, validNpcIds)
    expect(badItem).toEqual([])
    const withFakeItem = new Set(validItemIds)
    withFakeItem.delete('pill_hp')
    const missing: string[] = []
    validateShops(missing, withFakeItem, validNpcIds)
    expect(missing.some((line) => line.includes('unknown itemId pill_hp'))).toBe(true)
  })
})
