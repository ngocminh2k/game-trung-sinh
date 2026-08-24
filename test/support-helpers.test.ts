import { describe, expect, it } from 'vitest'
import {
  buyPriceOf,
  canAfford,
  canStore,
  canWithdraw,
  hasItem,
  isBuyable,
  isSellable,
  itemTotalHeld,
  newGame,
  sellPriceOf,
  storageRemaining,
  storageUnitsUsed,
  useGameStore,
} from '../src/engine'

describe('shop, storage, and browser store helpers', () => {
  it('reports market availability and prices without guessing unavailable items', () => {
    expect(isBuyable('pill_hp')).toBe(true)
    expect(isBuyable('old_manual')).toBe(false)
    expect(isSellable('spirit_herb')).toBe(true)
    expect(isSellable('old_manual')).toBe(false)
    expect(buyPriceOf('pill_hp')).toBe(35)
    expect(buyPriceOf('old_manual')).toBeNull()
    expect(sellPriceOf('spirit_herb')).toBe(12)
    expect(sellPriceOf('old_manual')).toBeNull()
    expect(canAfford({ player: { gold: 35 } }, 35)).toBe(true)
    expect(canAfford({ player: { gold: 34 } }, 35)).toBe(false)
  })

  it('enforces storage capacity and can restore a persisted browser store run', () => {
    const game = newGame('storage-check')
    expect(hasItem(game, 'spirit_herb')).toBe(true)
    expect(hasItem(game, 'spirit_herb', 2)).toBe(false)
    expect(canStore(game, 'spirit_herb', 1)).toBe(true)
    expect(canStore(game, 'spirit_herb', 0)).toBe(false)
    expect(canWithdraw(game, 'spirit_herb', 1)).toBe(false)
    expect(storageUnitsUsed(game)).toBe(0)
    expect(storageRemaining(game)).toBe(50)
    expect(itemTotalHeld(game, 'spirit_herb')).toBe(1)

    useGameStore.getState().reset('store-check')
    useGameStore.getState().dispatch({ kind: 'move', direction: 'west' })
    expect(useGameStore.getState().state.player.locationId).toBe('market')
    useGameStore.getState().reset()
    expect(useGameStore.getState().state.player.locationId).toBe('village')
  })
})
