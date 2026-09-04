import { describe, expect, it } from 'vitest'
import { applyAction, newGame } from '../src/engine'
import type { GameState } from '../src/engine'
import { hasError, navTo } from './test-utils'

function atDay(state: GameState, day: number): GameState {
  return { ...state, day }
}

describe('deadline consequences (P1-2)', () => {
  it('day >= 18 sets flags.village_silent', () => {
    const state = atDay(newGame('deadline-18'), 18)
    const result = applyAction(state, { kind: 'rest' })
    expect(result.state.flags['village_silent']).toBe(true)
  })

  it('day >= 22 sets flags.storage_locked and breaks doStore/doWithdraw', () => {
    let state = atDay(newGame('deadline-22'), 22)
    state = navTo(state, 'sect')
    const result = applyAction(state, { kind: 'store', itemId: 'spirit_herb', qty: 1 })
    expect(result.state.flags['storage_locked']).toBe(true)
    expect(hasError(result.events, 'STORAGE_LOCKED')).toBe(true)

    const withdraw = applyAction(state, { kind: 'withdraw', itemId: 'spirit_herb', qty: 1 })
    expect(hasError(withdraw.events, 'STORAGE_LOCKED')).toBe(true)
  })

  it('day >= 24 sets flags.region_locked and blocks moves into sealed_cave', () => {
    let state = atDay(newGame('deadline-24'), 24)
    state = navTo(state, 'misty_forest')
    // Move twice north to reach the sealed-cave exit cell at (3, 2).
    state = applyAction(state, { kind: 'move', direction: 'north' }).state
    state = applyAction(state, { kind: 'move', direction: 'north' }).state
    const result = applyAction(state, { kind: 'move', direction: 'north' })
    expect(result.state.flags['region_locked']).toBe(true)
    expect(hasError(result.events, 'REGION_LOCKED')).toBe(true)
  })

  it('storage and region remain available before the gate', () => {
    let state = atDay(newGame('deadline-before'), 17)
    state = navTo(state, 'sect')
    expect(state.flags['storage_locked']).toBeUndefined()
    const stored = applyAction(state, { kind: 'store', itemId: 'spirit_herb', qty: 1 })
    expect(hasError(stored.events, 'STORAGE_LOCKED')).toBe(false)

    state = navTo(atDay(newGame('deadline-before-region'), 23), 'misty_forest')
    const intoCave = applyAction(state, { kind: 'move', direction: 'north' })
    expect(hasError(intoCave.events, 'REGION_LOCKED')).toBe(false)
  })
})