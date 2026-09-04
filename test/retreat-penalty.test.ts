import { describe, expect, it } from 'vitest'
import { RETREAT_HP_COST, RETREAT_PROGRESS_COST, applyAction, newGame } from '../src/engine'
import { navTo } from './test-utils'

function startEncounter() {
  let state = navTo(newGame('retreat-penalty'), 'misty_forest')
  state = applyAction(state, { kind: 'start_encounter' }).state
  return state
}

describe('P0-5: retreat penalty after the first flight', () => {
  it('first retreat from an enemy pays the base cost', () => {
    const state = { ...startEncounter(), player: { ...startEncounter().player, progress: 10 } }
    const result = applyAction(state, { kind: 'combat_retreat' })
    expect(result.events[0]).toMatchObject({ type: 'COMBAT_RETREATED', hpCost: RETREAT_HP_COST, progressCost: RETREAT_PROGRESS_COST })
    expect(result.state.flags['retreated_mist_boar']).toBe(true)
  })

  it('second retreat from the same enemy doubles both costs', () => {
    // Finding #3: retreat-repeat penalties are in-fight memory. The repeat
    // flag is cleared by spendDay, so to exercise the double-cost path we
    // must NOT advance the day between the two retreats. Re-engaging after
    // a day-trip is a fresh outing and pays only the base cost.
    const state1 = { ...startEncounter(), player: { ...startEncounter().player, progress: 20 } }
    const state = applyAction(state1, { kind: 'combat_retreat' }).state
    expect(state.flags['retreated_mist_boar']).toBe(true)
    // Manually re-arm the encounter without paying a new day, so the
    // retreated_<id> flag survives.
    const rearmed = { ...state, encounter: { enemyId: 'mist_boar', hp: 10, maxHp: 32, guard: 0 } }
    const result = applyAction(rearmed, { kind: 'combat_retreat' })
    expect(result.events[0]).toMatchObject({
      type: 'COMBAT_RETREATED',
      hpCost: RETREAT_HP_COST * 2,
      progressCost: RETREAT_PROGRESS_COST * 2,
    })
  })
})