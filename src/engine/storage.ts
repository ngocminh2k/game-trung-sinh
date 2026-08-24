import { STORAGE_CAPACITY } from './constants'
import { countOf, totalUnits } from './utils'
import type { GameState } from './types'

export function storageUnitsUsed(state: GameState): number {
  return totalUnits(state.storage)
}

export function storageRemaining(state: GameState): number {
  return Math.max(0, STORAGE_CAPACITY - storageUnitsUsed(state))
}

export function canStore(state: GameState, itemId: string, qty: number): boolean {
  if (qty <= 0) return false
  if (countOf(state.inventory, itemId) < qty) return false
  return storageUnitsUsed(state) + qty <= STORAGE_CAPACITY
}

export function canWithdraw(state: GameState, itemId: string, qty: number): boolean {
  if (qty <= 0) return false
  return countOf(state.storage, itemId) >= qty
}

export function itemTotalHeld(state: GameState, itemId: string): number {
  return countOf(state.inventory, itemId) + countOf(state.storage, itemId)
}
