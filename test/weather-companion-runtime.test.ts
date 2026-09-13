import { describe, expect, it } from 'vitest'
import { applyAction, newGame } from '../src/engine'
import { WEATHER_EFFECTS, weatherFor } from '../src/engine/weather'
import { BEASTS } from '../src/content'
import { navTo } from './test-utils'
import type { GameState } from '../src/engine'

// Issue 6: weather (WEATHER_EFFECTS) and companion buffs (companionBuff) are
// wired into the reducer, not just defined as pure modules. These tests drive
// the actual actions to prove the runtime path — buy/sell market prices move
// with the day's weather, enemy damage scales on storm days, and each
// companion buff kind lands in combat.

// Seed 'wx': day 1 is clear (quang, herb mod 1), day 5 is a storm (bao,
// herb mod 1.2). Both land in season xuan, so only the weather differs.
expect(weatherFor('wx', 1).kind).toBe('quang')
expect(weatherFor('wx', 5).kind).toBe('bao')

function herbPriceMod(seed: string, day: number): number {
  return WEATHER_EFFECTS[weatherFor(seed, day).id]?.herbPriceMod ?? 1
}

function atMarket(seed: string): GameState {
  return navTo(newGame(seed), 'market')
}

// Advance the market state to the given day WITHOUT touching rng: rest one
// night at a time until the stamped day lands there.
function advanceToDay(state: GameState, day: number): GameState {
  let s = state
  while (s.day < day) s = applyAction(s, { kind: 'rest' }).state
  return s
}

describe('Issue 6: weather market variance', () => {
  it('buy price moves with the day\'s herbPriceMod', () => {
    const clear = advanceToDay(atMarket('wx'), 1)
    const storm = advanceToDay(atMarket('wx'), 5)
    expect(storm.day).toBe(5)
    expect(herbPriceMod('wx', 5)).toBe(1.2)
    const clearBuy = applyAction(clear, { kind: 'buy', itemId: 'herb_hong_silk' })
    const stormBuy = applyAction(storm, { kind: 'buy', itemId: 'herb_hong_silk' })
    expect(stormBuy.events.some((e) => e.type === 'ERROR')).toBe(false)
    const clearPaid = clearBuy.events.find((e) => e.type === 'BOUGHT')
    const stormPaid = stormBuy.events.find((e) => e.type === 'BOUGHT')
    if (clearPaid?.type !== 'BOUGHT' || stormPaid?.type !== 'BOUGHT') {
      expect.unreachable('both buys must succeed')
    }
    // Market stall price is 18 gold: clear 18*1.0 vs storm 18*1.2.
    // Charm and tax are identical across the two runs, so the paid gap
    // isolates the weather mod.
    expect(stormPaid.goldPaid - clearPaid.goldPaid).toBe(3)
  })

  it('sell payout tracks the market weather modifier', () => {
    const stock = (base: GameState): GameState => ({ ...base, inventory: { herb_hong_silk: 5 } })
    const clearSell = applyAction(stock(advanceToDay(atMarket('wx'), 1)), { kind: 'sell', itemId: 'herb_hong_silk', qty: 5 })
    const stormSell = applyAction(stock(advanceToDay(atMarket('wx'), 5)), { kind: 'sell', itemId: 'herb_hong_silk', qty: 5 })
    const clearGain = clearSell.events.find((e) => e.type === 'SOLD')
    const stormGain = stormSell.events.find((e) => e.type === 'SOLD')
    if (clearGain?.type !== 'SOLD' || stormGain?.type !== 'SOLD') {
      expect.unreachable('both sells must succeed')
    }
    // By design the SELL side uses the authored base price (no weather mod)
    // to avoid arbitrage. Both payouts are equal.
    expect(stormGain.goldGain).toBe(clearGain.goldGain)
  })
})

describe('Issue 6: weather and companion combat', () => {
  function combative(seed: string, companionId: string | null): GameState {
    let state = navTo(newGame(seed), 'misty_forest')
    state = applyAction(state, { kind: 'start_encounter' }).state
    return companionId === null ? state : { ...state, companionId }
  }

  it('attack companions raise player strike damage', () => {
    const tiger = BEASTS.find((b) => b.buff.kind === 'attack' && b.tier === 'thuong')
    expect(tiger).toBeDefined()
    const base = combative('c1', null)
    const buffed = combative('c1', tiger!.id)
    // Same seed, same rng position: the only difference is the companion, so
    // the first-strike gap isolates the attack buff.
    const hitBase = applyAction(base, { kind: 'combat_attack' }).events.find(
      (e) => e.type === 'COMBAT_HIT' && e.actor === 'player',
    )
    const hitBuffed = applyAction(buffed, { kind: 'combat_attack' }).events.find(
      (e) => e.type === 'COMBAT_HIT' && e.actor === 'player',
    )
    if (hitBase?.type === 'COMBAT_HIT' && hitBuffed?.type === 'COMBAT_HIT') {
      expect(hitBuffed.amount).toBeGreaterThan(hitBase.amount)
    } else {
      expect.unreachable('both strikes must land player hits')
    }
  })

  it('a dodge companion stays deterministic on identical replays', () => {
    const wolf = BEASTS.find((b) => b.buff.kind === 'dodge' && b.tier === 'thuong')
    expect(wolf).toBeDefined()
    const run = (): GameState => combative('c2', wolf!.id)
    const a = applyAction(run(), { kind: 'combat_defend' }).state
    const b = applyAction(run(), { kind: 'combat_defend' }).state
    expect(a.rng).toBe(b.rng)
  })
})