import { describe, expect, it } from 'vitest'
import { applyAction, newGame } from '../src/engine'
import { hasError } from './test-utils'

describe('affinity quest gate', () => {
  it('unlocks an affinity quest after three talks with its giver', () => {
    let state = newGame('affinity-gate')

    state = applyAction(state, { kind: 'talk', npcId: 'n_elder_meihua' }).state
    expect(hasError(applyAction(state, { kind: 'accept_quest', questId: 'q_aff_01' }).events, 'QUEST_WRONG_STATE')).toBe(true)

    state = applyAction(state, { kind: 'talk', npcId: 'n_elder_meihua' }).state
    const result = applyAction(state, { kind: 'talk', npcId: 'n_elder_meihua' })
    state = result.state

    expect(state.flags['aff_gate_n_elder_meihua']).toBe(true)
    expect(result.events).toContainEqual({ type: 'AFFINITY', npcId: 'n_elder_meihua', level: 3 })
    expect(applyAction(state, { kind: 'accept_quest', questId: 'q_aff_01' }).events).not.toContainEqual({
      type: 'ERROR',
      code: 'QUEST_WRONG_STATE',
    })
  })
})
