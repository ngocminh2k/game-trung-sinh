import { describe, expect, it } from 'vitest'
import { applyAction, newGame } from '../src/engine'
import type { GameState } from '../src/engine'

const VILLAGERS = [
  'n_elder_meihua',
  'n_guard_truong',
  'n_kid_xiaobao',
  'n_innkeeper_hanh',
  'n_farmer_tu',
] as const

function talkTo(state: GameState, npcId: string): GameState {
  const result = applyAction(state, { kind: 'talk', npcId })
  expect(result.events.some((e) => e.type === 'TALKED')).toBe(true)
  return result.state
}

describe('socialite achievement requires five distinct NPCs', () => {
  it('five chats with one NPC do not unlock it', () => {
    let state = newGame('socialite-repeat')
    for (let i = 0; i < 5; i++) state = talkTo(state, 'n_elder_meihua')
    expect(state.achievements).not.toContain('socialite')
  })

  it('the fifth distinct NPC unlocks it on that very talk', () => {
    let state = newGame('socialite-distinct')
    state = talkTo(state, VILLAGERS[0])
    state = talkTo(state, VILLAGERS[1])
    state = talkTo(state, VILLAGERS[2])
    state = talkTo(state, VILLAGERS[3])
    expect(state.achievements).not.toContain('socialite')

    // Repeat an earlier NPC — still only four distinct people met.
    state = talkTo(state, VILLAGERS[0])
    expect(state.achievements).not.toContain('socialite')

    const fifth = applyAction(state, { kind: 'talk', npcId: VILLAGERS[4] })
    expect(
      fifth.events.some(
        (e) => e.type === 'ACHIEVEMENT_UNLOCKED' && e.achievementId === 'socialite',
      ),
    ).toBe(true)
    expect(fifth.state.achievements).toContain('socialite')
  })
})

describe('achievements have real thresholds (issue #13)', () => {
  it('a single move does not unlock first_step', () => {
    let state = newGame('first-step-one-move')
    const one = applyAction(state, { kind: 'move', direction: 'west' })
    state = one.state
    expect(state.achievements).not.toContain('first_step')
  })

  it('first_step unlocks only on the third move', () => {
    let state = newGame('first-step-three-moves')
    for (let i = 0; i < 2; i++) {
      state = applyAction(state, { kind: 'move', direction: i % 2 === 0 ? 'west' : 'east' }).state
      expect(state.achievements).not.toContain('first_step')
    }
    const third = applyAction(state, { kind: 'move', direction: 'west' })
    expect(
      third.events.some(
        (e) => e.type === 'ACHIEVEMENT_UNLOCKED' && e.achievementId === 'first_step',
      ),
    ).toBe(true)
    expect(third.state.achievements).toContain('first_step')
  })

  it('first_purchase needs five bought units, not one', () => {
    // One purchase of a single cheap item leaves the achievement locked.
    let state = newGame('purchase-threshold')
    state = {
      ...state,
      flags: { ...state.flags, buyCount: 4 },
    }
    expect(state.achievements).not.toContain('first_purchase')
    // The fifth unit crosses the threshold and qualifies.
    state = { ...state, flags: { ...state.flags, buyCount: 5 } }
    // Re-evaluate through the public path: an action runs finalize.
    const res = applyAction(state, { kind: 'rest' })
    expect(res.state.achievements).toContain('first_purchase')
  })
})
