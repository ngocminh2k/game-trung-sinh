import { describe, expect, it } from 'vitest'
import { applyAction, newGame } from '../src/engine'
import { navTo } from './test-utils'

function encounterAtMistyForest() {
  let state = navTo(newGame('focus-test'), 'misty_forest')
  state = applyAction(state, { kind: 'start_encounter' }).state
  return state
}

describe('P0-5: combat focus action', () => {
  it('costs 0 qi, applies +5 guard to the encounter, and stacks +2 for next strike', () => {
    const state = encounterAtMistyForest()
    const qiBefore = state.player.qi
    const result = applyAction(state, { kind: 'combat_focus' })
    expect(result.state.player.qi).toBe(qiBefore)
    expect(result.state.encounter?.focusStacks).toBe(1)
    expect(result.state.encounter?.focusDamage).toBe(2)
    expect(result.events.some((e) => e.type === 'COMBAT_GUARDED' && e.amount === 5)).toBe(true)
    expect(result.events.some((e) => e.type === 'QI_SPENT')).toBe(false)
  })

  it('rejects focus outside an encounter', () => {
    const result = applyAction(newGame('focus-outside'), { kind: 'combat_focus' })
    expect(result.events).toEqual([{ type: 'ERROR', code: 'NOT_AT_LOCATION' }])
  })

  it('adds +2 damage to the next strike and resets the stack', () => {
    const state = encounterAtMistyForest()
    const focused = applyAction(state, { kind: 'combat_focus' }).state
    const attack = applyAction(focused, { kind: 'combat_attack' })
    expect(attack.state.encounter?.focusStacks).toBe(0)
    expect(attack.state.encounter?.focusDamage).toBe(0)
    const hitEvent = attack.events.find((e) => e.type === 'COMBAT_HIT' && e.actor === 'player')
    expect(hitEvent).toBeDefined()
    expect((hitEvent as { amount: number }).amount).toBeGreaterThanOrEqual(2)
  })
})