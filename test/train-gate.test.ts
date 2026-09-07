import { describe, expect, it } from 'vitest'
import { applyAction, newGame } from '../src/engine'

describe('P0-6: train death gate', () => {
  it('rejects training when hp <= TRAIN_HP_COST + 1', () => {
    // TRAIN_HP_COST = 5; gate is hp <= 6 (5 + 1).
    for (const hp of [1, 4, 6]) {
      const state = { ...newGame(`train-gate-${hp}`), player: { ...newGame(`train-gate-${hp}`).player, hp } }
      const snapshot = JSON.stringify(state)
      const result = applyAction(state, { kind: 'train' })
      expect(result.events).toEqual([{ type: 'ERROR', code: 'INSUFFICIENT_HP' }])
      expect(JSON.stringify(result.state)).toBe(snapshot)
    }
  })

  it('allows training when hp > TRAIN_HP_COST + 1', () => {
    const state = { ...newGame('train-gate-ok'), player: { ...newGame('train-gate-ok').player, hp: 30, qi: 60 } }
    const result = applyAction(state, { kind: 'train' })
    expect(result.events.some((e) => e.type === 'TRAINED')).toBe(true)
    expect(result.events.some((e) => e.type === 'ERROR' && e.code === 'INSUFFICIENT_HP')).toBe(false)
  })
})