import { RECIPES } from '../src/content'
import { applyAction, newGame, parseFreeText } from '../src/engine'
import { describe, expect, it } from 'vitest'

describe('material exchange loop', () => {
  it('makes a combat trophy a deliberate choice between immediate gold and expedition protection', () => {
    const recipe = RECIPES.find((entry) => entry.id === 'warding_exchange')
    expect(recipe).toBeDefined()
    expect(recipe?.ingredients).toEqual({ beast_fang: 1, spirit_herb: 1 })
    expect(recipe?.output).toEqual({ itemId: 'warding_talisman', qty: 1 })

    const game = newGame('refinement-choice')
    const atMarket = {
      ...game,
      player: { ...game.player, locationId: 'market', posX: 3, posY: 3 },
      inventory: { ...game.inventory, beast_fang: 1, spirit_herb: 2 },
    }
    const result = applyAction(atMarket, { kind: 'refine', recipeId: 'warding_exchange' })

    expect(result.state.inventory.beast_fang ?? 0).toBe(0)
    expect(result.state.inventory.spirit_herb).toBe(1)
    expect(result.state.inventory.warding_talisman).toBe(1)
    expect(result.state.player.gold).toBe(atMarket.player.gold)
    expect(result.events).toContainEqual({ type: 'REFINED', recipeId: 'warding_exchange', itemId: 'warding_talisman', qty: 1 })
  })

  it('rejects a material exchange away from the market without consuming resources', () => {
    const game = newGame('refinement-boundary')
    const withMaterials = { ...game, inventory: { ...game.inventory, beast_fang: 1, spirit_herb: 2 } }
    const result = applyAction(withMaterials, { kind: 'refine', recipeId: 'warding_exchange' })

    expect(result.state.inventory).toEqual(withMaterials.inventory)
    expect(result.events).toEqual([{ type: 'ERROR', code: 'NOT_AT_LOCATION' }])
  })

  it('understands a named material exchange from free text', () => {
    expect(parseFreeText('đổi bùa hồi lộ')).toEqual({ ok: true, action: { kind: 'refine', recipeId: 'warding_exchange' } })
  })
})
