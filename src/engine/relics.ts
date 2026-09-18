import { EQUIPMENT, getEquipmentByItem } from '../content/rpg'
import { ITEM_HERB } from './constants'
import type { BuriedRelic, GlobalProfile } from './globalProfile'
import type { GameState } from './types'

// Issue #14 (AC2): the best item a finished run carried into the next life.
// "Relic" = any equippable; the strongest by combined bonuses wins. Fully
// deterministic — no RNG — so a save always inherits the same relic, and the
// two default starting items are last-resort fallbacks (inheriting them back is
// a no-op, but keeps the "≥1 relic" guarantee true even on an empty-handed run).
const DEFAULT_GEAR = new Set(['wooden_staff', 'tattered_robe'])

function powerScore(itemId: string): number {
  const def = getEquipmentByItem(itemId)
  if (def === undefined) return -1
  return def.attackBonus + def.defenseBonus + def.qiBonus
}

// Catalog order breaks ties, so the pick is stable across runs and platforms.
const CATALOG_RANK = new Map(EQUIPMENT.map((def, index) => [def.itemId, index]))

/** The single relic to seed into the next run's starting inventory, or null if
 *  the player owns nothing equippable at all. */
export function chooseInheritedRelic(state: GameState): string | null {
  const owned = new Set<string>()
  for (const slot of [state.equipment.accessory, state.equipment.weapon, state.equipment.robe]) {
    if (slot !== null) owned.add(slot)
  }
  for (const itemId of Object.keys(state.inventory)) owned.add(itemId)
  for (const itemId of Object.keys(state.storage)) owned.add(itemId)

  // Non-default equippables first, strongest (then catalog order) wins.
  const candidates = [...owned]
    .filter((id) => id !== ITEM_HERB && powerScore(id) >= 0)
    .sort((a, b) => {
      const aDefault = DEFAULT_GEAR.has(a) ? 1 : 0
      const bDefault = DEFAULT_GEAR.has(b) ? 1 : 0
      if (aDefault !== bDefault) return aDefault - bDefault
      const byPower = powerScore(b) - powerScore(a)
      if (byPower !== 0) return byPower
      return (CATALOG_RANK.get(a) ?? 0) - (CATALOG_RANK.get(b) ?? 0)
    })

  return candidates.length > 0 ? (candidates[0] ?? null) : null
}

/** C3-13: Can the player bury an item at their current coordinates? */
export function canBuryRelic(state: GameState, itemId: string): boolean {
  if (!state.player.alive) return false
  return (state.inventory[itemId] ?? 0) >= 1
}

/** C3-13: Bury an inventory item at current player coordinates into GlobalProfile. */
export function buryRelic(
  state: GameState,
  profile: GlobalProfile,
  itemId: string,
): { state: GameState; profile: GlobalProfile; buried: BuriedRelic } | null {
  if (!canBuryRelic(state, itemId)) return null

  const count = state.inventory[itemId] ?? 0
  const nextInventory = { ...state.inventory }
  if (count <= 1) {
    delete nextInventory[itemId]
  } else {
    nextInventory[itemId] = count - 1
  }

  const buried: BuriedRelic = {
    itemId,
    locationId: state.player.locationId,
    x: state.player.posX,
    y: state.player.posY,
  }

  const nextState: GameState = {
    ...state,
    inventory: nextInventory,
  }

  const nextProfile: GlobalProfile = {
    ...profile,
    buriedRelic: buried,
  }

  return { state: nextState, profile: nextProfile, buried }
}

/** C3-13: Can the player unearth a buried relic at their current coordinates? */
export function canUnearthRelic(state: GameState, profile: GlobalProfile): boolean {
  if (!state.player.alive || profile.buriedRelic === null) return false
  return (
    state.player.locationId === profile.buriedRelic.locationId &&
    state.player.posX === profile.buriedRelic.x &&
    state.player.posY === profile.buriedRelic.y
  )
}

/** C3-13: Unearth the buried relic, adding it to inventory and clearing the profile slot. */
export function unearthRelic(
  state: GameState,
  profile: GlobalProfile,
): { state: GameState; profile: GlobalProfile; unearthedItemId: string } | null {
  if (!canUnearthRelic(state, profile) || profile.buriedRelic === null) return null

  const itemId = profile.buriedRelic.itemId
  const nextInventory = {
    ...state.inventory,
    [itemId]: (state.inventory[itemId] ?? 0) + 1,
  }

  const nextState: GameState = {
    ...state,
    inventory: nextInventory,
  }

  const nextProfile: GlobalProfile = {
    ...profile,
    buriedRelic: null,
  }

  return { state: nextState, profile: nextProfile, unearthedItemId: itemId }
}

