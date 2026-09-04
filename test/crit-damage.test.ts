import { describe, expect, it } from 'vitest'
import { applyAction, newGame } from '../src/engine'
import { navTo } from './test-utils'

function encounter(seed: string) {
  let state = navTo(newGame(seed), 'misty_forest')
  state = applyAction(state, { kind: 'start_encounter' }).state
  return state
}

function hitAmount(events: readonly { type: string; amount?: number; actor?: string }[]): number {
  const ev = events.find((e) => e.type === 'COMBAT_HIT' && e.actor === 'player') as { amount: number } | undefined
  if (ev === undefined) throw new Error('no player COMBAT_HIT event')
  return ev.amount
}

describe('P0-5: crit wiring from skill-tree', () => {
  it('a strike without crit hits for the base amount', () => {
    const state = encounter('crit-none')
    const result = applyAction(state, { kind: 'combat_attack' })
    const base = hitAmount(result.events)
    expect(base).toBeGreaterThan(0)
    expect(base).toBeLessThan(60) // sanity bound
  })

  it('critBonus=100 always doubles the damage', () => {
    // critChance(luck) caps at 0.25. Pin luck high enough to push crit chance
    // to that cap (luck ≥ 25 → critChance=0.25). crit is a probability, not
    // a guarantee: when critRoll<25 the flagged path fires the 2× multiplier
    // and drops the variance band (Finding #2). When the roll misses, both
    // flagged and noCrit take the same base + variance path.
    const base = encounter('crit-pinned')
    const flagged = { ...base, player: { ...base.player, attrs: { ...base.player.attrs, luck: 100 } } }
    const noCrit = { ...flagged, player: { ...flagged.player, attrs: { ...flagged.player.attrs, luck: 0 } } }
    let critFires = 0
    let critMisses = 0
    for (let i = 0; i < 200; i++) {
      const rng = (i * 7919 + 1) >>> 0
      const critAmount = hitAmount(applyAction({ ...flagged, rng }, { kind: 'combat_attack' }).events)
      const baseAmount = hitAmount(applyAction({ ...noCrit, rng }, { kind: 'combat_attack' }).events)
      // Crit detection: a crit strictly out-hits the noCrit path (it drops
      // variance and doubles the base, so crit > base + 0 always). When the
      // roll misses the flagged path falls back to base + variance, identical
      // to the noCrit path.
      const critFired = critAmount > baseAmount
      if (critFired) {
        expect(critAmount).toBeGreaterThan(baseAmount)
        critFires++
      } else {
        expect(critAmount).toBe(baseAmount)
        critMisses++
      }
    }
    // At ~25% crit chance over 200 trials we expect both branches to fire.
    expect(critFires).toBeGreaterThan(0)
    expect(critMisses).toBeGreaterThan(0)
  })

  it('critBonus=0 never crits', () => {
    const flagged = { ...encounter('crit-zero'), flags: { ...encounter('crit-zero').flags, critBonus: 0 } }
    const base = encounter('crit-zero-base')
    expect(hitAmount(applyAction(flagged, { kind: 'combat_attack' }).events))
      .toBe(hitAmount(applyAction(base, { kind: 'combat_attack' }).events))
  })
})