import { describe, expect, it } from 'vitest'
import { applyAction, getAffection, newGame } from '../src/engine'

describe('NPC affection field (P1-4)', () => {
  it('schema-defaults affection to an empty record for new games', () => {
    const state = newGame('affection-default')
    expect(state.affection ?? {}).toEqual({})
  })

  it('doTalk increments the affection map for the targeted NPC', () => {
    let state = newGame('affection-talk')
    const before = getAffection(state, 'n_elder_meihua')
    state = applyAction(state, { kind: 'talk', npcId: 'n_elder_meihua' }).state
    const after = getAffection(state, 'n_elder_meihua')
    expect(after).toBe(before + 1)
    expect(state.affection?.['n_elder_meihua']).toBe(1)
  })

  it('repeated talks keep counting up', () => {
    let state = newGame('affection-repeat')
    for (let index = 0; index < 4; index += 1) {
      state = applyAction(state, { kind: 'talk', npcId: 'n_elder_meihua' }).state
    }
    expect(getAffection(state, 'n_elder_meihua')).toBe(4)
  })

  it('getAffection falls back to the legacy aff_<npcId> flag', () => {
    const state = newGame('affection-legacy')
    const legacy = { ...state, affection: {}, flags: { ...state.flags, aff_n_elder_meihua: 5 } }
    expect(getAffection(legacy, 'n_elder_meihua')).toBe(5)
  })
})