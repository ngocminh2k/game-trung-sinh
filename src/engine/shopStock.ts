// T11 — pure shop-stock helpers. No DOM, no network, no RNG, no clock.
// T12 wires these into the buy/sell flow (src/engine/shop.ts stays untouched).
// Currency tiers live on the entry itself: priceGold / priceSilver / priceLS.
// entryPrice() returns the entry's own-tier base price scaled by the weather
// modifier (T05 passes it in), floored — so callers already know the tier from
// which field is set and never need extra rounding here.
import { SHOPS, NPCS_WITHOUT_SHOP } from '../content/shops'
import type { ShopDef, ShopEntry } from '../content/shops'

const SHOP_BY_NPC = new Map(SHOPS.map((shop) => [shop.npcId, shop] as const))
const WHITELIST_SET = new Set(NPCS_WITHOUT_SHOP)

/** NPCs that must run exactly >=2 priceLS entries. */
const LS_HEAVY_NPC_IDS = new Set(['n_alchemist_sam', 'n_banker_tin', 'n_name_collector_tra'])

/** Resolve the shop of an NPC; null for whitelisted or unknown NPCs. */
export function shopForNpc(npcId: string): ShopDef | null {
  return SHOP_BY_NPC.get(npcId) ?? null
}

/** Base price scaled by weatherMod, floored. Deterministic, no side effects. */
export function entryPrice(entry: ShopEntry, weatherMod: number): number {
  const base = entry.priceGold ?? entry.priceSilver ?? entry.priceLS ?? 0
  return Math.floor(base * weatherMod)
}

/**
 * Content validation gate for T12's validateAllContent wiring. Appends human
 * readable problems to `errors` and returns nothing (void), so callers can
 * collect all problems in one pass.
 */
export function validateShops(errors: string[], validItemIds: Set<string>, validNpcIds: Set<string>): void {
  const seenNpcIds = new Set<string>()
  for (const shop of SHOPS) {
    const where = `shop ${shop.npcId}`
    if (!validNpcIds.has(shop.npcId)) errors.push(`${where}: npcId not found in NPCS`)
    if (seenNpcIds.has(shop.npcId)) errors.push(`${where}: duplicate shop for the same NPC`)
    seenNpcIds.add(shop.npcId)
    if (WHITELIST_SET.has(shop.npcId)) errors.push(`${where}: whitelisted NPC must not have a shop`)
    if (!shop.labelVi || !shop.labelEn) errors.push(`${where}: missing bilingual label`)
    if (shop.entries.length < 10 || shop.entries.length > 15) {
      errors.push(`${where}: ${shop.entries.length} entries, expected 10-15`)
    }
    const seenItemIds = new Set<string>()
    let silverCount = 0
    let lsCount = 0
    for (const entry of shop.entries) {
      if (!validItemIds.has(entry.itemId)) errors.push(`${where}: unknown itemId ${entry.itemId}`)
      if (seenItemIds.has(entry.itemId)) errors.push(`${where}: duplicate entry ${entry.itemId}`)
      seenItemIds.add(entry.itemId)
      const priceCount = [entry.priceGold, entry.priceSilver, entry.priceLS].filter((p) => p !== undefined).length
      if (priceCount === 0) errors.push(`${where}: entry ${entry.itemId} has no price`)
      if (priceCount > 1) errors.push(`${where}: entry ${entry.itemId} has multiple price fields`)
      if (entry.priceSilver !== undefined) silverCount += 1
      if (entry.priceLS !== undefined) lsCount += 1
    }
    if (silverCount < 1) errors.push(`${where}: needs at least 1 priceSilver entry`)
    if (LS_HEAVY_NPC_IDS.has(shop.npcId) && lsCount < 2) {
      errors.push(`${where}: needs at least 2 priceLS entries`)
    }
  }
  for (const npcId of NPCS_WITHOUT_SHOP) {
    if (!validNpcIds.has(npcId)) errors.push(`whitelisted npcId ${npcId} not found in NPCS`)
    if (SHOP_BY_NPC.has(npcId)) errors.push(`whitelisted NPC ${npcId} must not have a shop`)
  }
}
