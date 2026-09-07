import { describe, expect, it } from 'vitest'
import { applyAction, newGame } from '../src/engine'

describe('R-A: talk warning once per NPC', () => {
  it('fires a soft warning exactly once when affection reaches 9, not on subsequent talks', () => {
    let state = newGame('talk-warn-seed')

    // Talk 8 times - no warning yet
    for (let i = 0; i < 8; i++) {
      const res = applyAction(state, { kind: 'talk', npcId: 'n_elder_meihua' })
      state = res.state
      const warnEvents = res.events.filter((e) => e.type === 'WARNING')
      expect(warnEvents.length).toBe(0)
    }

    // 9th talk - crosses 9, fires the warning exactly once
    const res9 = applyAction(state, { kind: 'talk', npcId: 'n_elder_meihua' })
    state = res9.state
    const warn9 = res9.events.filter((e) => e.type === 'WARNING')
    expect(warn9.length).toBe(1)
    expect(warn9[0]?.messageVi).toContain('lặp lại chính câu cũ')

    // 10th talk - does not fire again
    const res10 = applyAction(state, { kind: 'talk', npcId: 'n_elder_meihua' })
    state = res10.state
    const warn10 = res10.events.filter((e) => e.type === 'WARNING')
    expect(warn10.length).toBe(0)

    // Flag is properly recorded
    expect(state.flags['talk_warn_n_elder_meihua']).toBe(true)
  })
})
