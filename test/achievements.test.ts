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
