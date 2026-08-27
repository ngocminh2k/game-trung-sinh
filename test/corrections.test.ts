import { describe, expect, it } from 'vitest'
import { applyAction, newGame } from '../src/engine'
import type { GameState } from '../src/engine'
import { navTo } from './test-utils'

function feedGarbage(state: GameState): GameState {
  return applyAction(state, { kind: 'free_text', raw: 'blorptastic frumious bandersnatch' }).state
}

describe('corrections and bounded forced convergence', () => {
  it('invalid free text increments corrections without changing the world', () => {
    let state = newGame('corrections-1')
    state = feedGarbage(state)
    expect(state.corrections).toBe(1)
    const loc = state.player.locationId
    const day = state.day
    state = feedGarbage(state)
    expect(state.corrections).toBe(2)
    expect(state.player.locationId).toBe(loc)
    expect(state.day).toBe(day)
  })

  it('on the third invalid input the game still leaves the player in control', () => {
    let state = newGame('corrections-converge')
    state = feedGarbage(state)
    state = feedGarbage(state)
    const result = applyAction(state, { kind: 'free_text', raw: 'zzz yyy xxx www' })
    const types = result.events.map((e) => e.type)
    expect(types).toContain('CORRECTION_REJECTED')
    expect(types).not.toContain('FORCED_CONVERGENCE')
    const loc = state.player.locationId
    state = result.state
    // World is unchanged — the engine never moves or acts for the player.
    expect(state.player.locationId).toBe(loc)
    expect(state.corrections).toBe(3)
  })

  it('repeated invalid free text keeps counting and leaves the world untouched', () => {
    let state = newGame('corrections-bound')
    const loc = state.player.locationId
    const day = state.day
    for (let i = 0; i < 12; i++) {
      state = feedGarbage(state)
      expect(state.corrections).toBe(i + 1)
      expect(state.player.locationId).toBe(loc)
      expect(state.day).toBe(day)
    }
  })

  it('a valid free-text command resets corrections', () => {
    let state = newGame('corrections-reset')
    state = feedGarbage(state)
    expect(state.corrections).toBe(1)
    const result = applyAction(state, { kind: 'free_text', raw: 'Nghỉ ngơi một đêm' })
    expect(result.events.some((e) => e.type === 'RESTED')).toBe(true)
    expect(result.state.corrections).toBe(0)
  })

  it('parser understands vietnamese with diacritics and english', () => {
    const state = newGame('corrections-parse')
    const r1 = applyAction(state, { kind: 'free_text', raw: 'luyện công' })
    expect(r1.events.some((e) => e.type === 'TRAINED')).toBe(true)
    const r2 = applyAction(r1.state, { kind: 'free_text', raw: 'go west' })
    expect(r2.events.some((e) => e.type === 'MOVED')).toBe(true)
    const r3 = applyAction(r2.state, {
      kind: 'free_text',
      raw: 'nói chuyện với thương nhân Bảo',
    })
    expect(r3.events.some((e) => e.type === 'TALKED')).toBe(true)
  })
})

describe('free-text quantities resolve through content-derived item lookup', () => {
  it('buys multiple units with one utterance and charges the full price', () => {
    const atMarket = navTo(newGame('qty-buy'), 'market')
    let state: GameState = { ...atMarket, player: { ...atMarket.player, gold: 200 } }
    const result = applyAction(state, { kind: 'free_text', raw: 'mua 3 viên tụ khí' })
    expect(
      result.events.some((e) => e.type === 'BOUGHT' && e.qty === 3 && e.goldPaid === 90),
    ).toBe(true)
    state = result.state
    expect(state.inventory['pill_qi']).toBe(3)
    expect(state.player.gold).toBe(110)
  })

  it('sells multiple units when specified', () => {
    let state = navTo(newGame('qty-sell'), 'herb_field')
    state = applyAction(state, { kind: 'gather' }).state
    state = applyAction(state, { kind: 'gather' }).state
    expect(state.inventory['spirit_herb'] ?? 0).toBeGreaterThanOrEqual(2)
    state = navTo(state, 'market')
    const goldBefore = state.player.gold
    const sold = applyAction(state, { kind: 'free_text', raw: 'sell 2 herbs' })
    expect(sold.events.some((e) => e.type === 'SOLD' && e.qty === 2 && e.goldGain === 24)).toBe(
      true,
    )
    expect(sold.state.player.gold).toBe(goldBefore + 24)
    expect(sold.state.inventory['spirit_herb'] ?? 0).toBe(
      (state.inventory['spirit_herb'] ?? 0) - 2,
    )
  })

  it('uses two pills in one utterance with doubled effects', () => {
    const atMarket = navTo(newGame('qty-use'), 'market')
    let state: GameState = { ...atMarket, player: { ...atMarket.player, gold: 200 } }
    state = applyAction(state, { kind: 'buy', itemId: 'pill_hp' }).state
    state = applyAction(state, { kind: 'buy', itemId: 'pill_hp' }).state
    // Fresh life starts with one pill_hp already in the bag.
    expect(state.inventory['pill_hp']).toBe(3)
    const hurt: GameState = { ...state, player: { ...state.player, hp: 40 } }
    const result = applyAction(hurt, { kind: 'free_text', raw: 'dùng 2 viên hồi nguyên' })
    expect(result.events.some((e) => e.type === 'ITEM_USED' && e.hpDelta === 50)).toBe(true)
    expect(result.state.inventory['pill_hp']).toBe(1)
    expect(result.state.player.hp).toBe(90)
    expect(result.state.player.gold).toBe(130)
  })

  it('rejects absurd or nonsensical quantities as corrections', () => {
    const state = newGame('qty-invalid')
    const result = applyAction(state, {
      kind: 'free_text',
      raw: 'mua 50000 viên hồi nguyên',
    })
    expect(result.events.some((e) => e.type === 'CORRECTION_REJECTED')).toBe(true)
  })

  it('underspecified quantity defaults to exactly one', () => {
    const state = navTo(newGame('qty-default'), 'market')
    const result = applyAction(state, { kind: 'free_text', raw: 'mua viên hồi nguyên' })
    expect(result.events.some((e) => e.type === 'BOUGHT' && e.qty === 1)).toBe(true)
  })
})
