import { describe, expect, it } from 'vitest'
import { applyAction, newGame } from '../src/engine'
import type { GameState } from '../src/engine'
import { navTo } from './test-utils'

function walkIntoRift(state: GameState): GameState {
  state = navTo(state, 'cursed_rift')
  let guard = 0
  while (state.player.alive && guard < 20) {
    const out = applyAction(state, { kind: 'move', direction: 'west' })
    state = out.state
    if (!state.player.alive) break
    const back = applyAction(state, { kind: 'move', direction: 'east' })
    state = back.state
    guard += 1
  }
  return state
}

describe('one-life terminal condition', () => {
  it('repeated danger exposure kills and locks the game', () => {
    let state = newGame('terminal-death')
    state = navTo(state, 'market')
    expect(state.player.alive).toBe(true)
    state = walkIntoRift(state)
    expect(state.player.alive).toBe(false)
    expect(state.player.hp).toBe(0)
    expect(state.terminal).toBe(true)
    expect(state.endingId).toBe('tragic_death')
  })

  it('every action after death returns TERMINAL and leaves state untouched', () => {
    let state = newGame('terminal-lock')
    state = walkIntoRift(state)
    expect(state.terminal).toBe(true)
    const snapshot = JSON.stringify(state)
    for (const action of [
      { kind: 'rest' },
      { kind: 'train' },
      { kind: 'move', direction: 'west' },
      { kind: 'draw_lottery' },
      { kind: 'free_text', raw: 'rest' },
    ] as const) {
      const result = applyAction(state, action)
      expect(
        result.events.some((e) => e.type === 'ERROR' && e.code === 'TERMINAL'),
      ).toBe(true)
      expect(JSON.stringify(result.state)).toBe(snapshot)
    }
  })

  it('restart from death begins a fresh life', () => {
    let state = newGame('terminal-restart')
    state = walkIntoRift(state)
    expect(state.terminal).toBe(true)
    const result = applyAction(state, { kind: 'restart', seed: 'fresh-life' })
    expect(result.events.some((e) => e.type === 'GAME_STARTED')).toBe(true)
    expect(result.state.terminal).toBe(false)
    expect(result.state.endingId).toBeNull()
    expect(result.state.seed).toBe('fresh-life')
    expect(result.state.player.alive).toBe(true)
  })
})
