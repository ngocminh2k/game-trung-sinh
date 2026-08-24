import { getItem } from '../content'
import { countOf } from './utils'

export function isBuyable(itemId: string): boolean {
  const def = getItem(itemId)
  return def !== undefined && def.buyPrice !== null
}

export function isSellable(itemId: string): boolean {
  const def = getItem(itemId)
  return def !== undefined && def.sellPrice !== null
}

export function buyPriceOf(itemId: string): number | null {
  return getItem(itemId)?.buyPrice ?? null
}

export function sellPriceOf(itemId: string): number | null {
  return getItem(itemId)?.sellPrice ?? null
}

export function canAfford(state: { player: { gold: number } }, price: number): boolean {
  return state.player.gold >= price
}

export function hasItem(state: { inventory: Record<string, number> }, itemId: string, qty = 1): boolean {
  return countOf(state.inventory, itemId) >= qty
}
