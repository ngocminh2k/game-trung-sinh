import { describe, expect, it } from 'vitest'
import { MAX_STAGE, CORRECTION_LIMIT, applyAction, currentBeat, newGame } from '../src/engine'
import type { GameState } from '../src/engine'
import { navTo } from './test-utils'

function feedGarbage(state: GameState): GameState {
  return applyAction(state, { kind: 'free_text', raw: 'blorptastic frumious bandersnatch' }).state
}

describe('corrections and bounded forced convergence', () => {
  it('invalid free text increments corrections without changing the world', () => {
    let state = newGame('corrections-1')
    state = feedGarbage(state)
    expect(state.corrections).toBe(1)
    expect(state.convergenceCount).toBe(0)
    const loc = state.player.locationId
    const day = state.day
    state = feedGarbage(state)
    expect(state.corrections).toBe(2)
    expect(state.player.locationId).toBe(loc)
    expect(state.day).toBe(day)
  })

  it('on the third invalid input the game converges to a suggested action', () => {
    let state = newGame('corrections-converge')
    const beat = currentBeat(state)
    expect(beat.suggested[0]?.kind).toBe('move')
    const suggested = beat.suggested[0]
    state = feedGarbage(state)
    state = feedGarbage(state)
    const result = applyAction(state, { kind: 'free_text', raw: 'zzz yyy xxx www' })
    const types = result.events.map((e) => e.type)
    expect(types).toContain('CORRECTION_REJECTED')
    expect(types).toContain('FORCED_CONVERGENCE')
    state = result.state
    expect(state.corrections).toBe(0)
    expect(state.convergenceCount).toBe(1)
    if (suggested?.kind === 'move') {
      expect(state.player.locationId).not.toBe('village')
      expect(state.flags['movedOnce']).toBe(true)
    }
  })

  it('corrections never exceed the bound across repeated invalid inputs', () => {
    let state = newGame('corrections-bound')
    for (let i = 0; i < 12; i++) {
      state = feedGarbage(state)
      expect(state.corrections).toBeGreaterThanOrEqual(0)
      expect(state.corrections).toBeLessThanOrEqual(CORRECTION_LIMIT - 1)
    }
    expect(state.convergenceCount).toBeGreaterThan(0)
  })

  it('a valid free-text command resets corrections', () => {
    let state = newGame('corrections-reset')
    state = feedGarbage(state)
    expect(state.corrections).toBe(1)
    const result = applyAction(state, { kind: 'free_text', raw: 'Nghỉ ngơi một đêm' })
    expect(result.events.some((e) => e.type === 'RESTED')).toBe(true)
    expect(result.state.corrections).toBe(0)
  })

  it('parser understands vietnamese with diacritics and english', () => {
    const state = newGame('corrections-parse')
    const r1 = applyAction(state, { kind: 'free_text', raw: 'luyện công' })
    expect(r1.events.some((e) => e.type === 'TRAINED')).toBe(true)
    const r2 = applyAction(r1.state, { kind: 'free_text', raw: 'go west' })
    expect(r2.events.some((e) => e.type === 'MOVED')).toBe(true)
    const r3 = applyAction(r2.state, {
      kind: 'free_text',
      raw: 'nói chuyện với thương nhân Bảo',
    })
    expect(r3.events.some((e) => e.type === 'TALKED')).toBe(true)
  })
})

describe('forced convergence runs the normal finalize pipeline', () => {
  it('the forced action evaluates achievements and endings on the same transition', () => {
    // Late-game state one step from ascension: whatever lore-consistent
    // action convergence forces, finalize must immediately grant the stage
    // achievements and the ENDING — nothing may wait for a later turn.
    const base = newGame('convergence-finalize')
    const staged: GameState = {
      ...base,
      player: { ...base.player, stage: MAX_STAGE, progress: 999 },
      flags: { movedOnce: true },
    }
    staged.corrections = 2
    const result = applyAction(staged, { kind: 'free_text', raw: 'blorptastic frumious' })
    const types = result.events.map((e) => e.type)
    expect(types).toContain('CORRECTION_REJECTED')
    expect(types).toContain('FORCED_CONVERGENCE')
    // Finalize pipeline ran on this very transition:
    expect(types).toContain('ACHIEVEMENT_UNLOCKED')
    expect(types).toContain('ENDING')
    expect(result.state.endingId).toBe('ascension')
    expect(result.state.terminal).toBe(true)
    expect(result.state.achievements).toContain('immortal_road_end')
  })

  it('repeated invalid input alone deterministically drives the run to an ending', () => {
    // Product rule: after every third invalid free-text attempt the engine
    // forces a lore-consistent valid action; a stream of nothing but invalid
    // input therefore still converges to *an* ending (eventually, not
    // necessarily on the first convergence).
    let state = newGame('convergence-eventual')
    let convergences = 0
    let guard = 0
    while (!state.terminal && guard < 3000) {
      const result = applyAction(state, {
        kind: 'free_text',
        raw: 'blorptastic frumious bandersnatch',
      })
      if (result.events.some((e) => e.type === 'FORCED_CONVERGENCE')) convergences += 1
      state = result.state
      guard += 1
    }
    expect(convergences).toBeGreaterThan(0)
    expect(state.terminal).toBe(true)
    expect(state.endingId).not.toBeNull()
  })
})

describe('free-text quantities resolve through content-derived item lookup', () => {
  it('buys multiple units with one utterance and charges the full price', () => {
    const atMarket = navTo(newGame('qty-buy'), 'market')
    let state: GameState = { ...atMarket, player: { ...atMarket.player, gold: 200 } }
    const result = applyAction(state, { kind: 'free_text', raw: 'mua 3 viên tụ khí' })
    expect(
      result.events.some((e) => e.type === 'BOUGHT' && e.qty === 3 && e.goldPaid === 90),
    ).toBe(true)
    state = result.state
    expect(state.inventory['pill_qi']).toBe(3)
    expect(state.player.gold).toBe(110)
  })

  it('sells multiple units when specified', () => {
    let state = navTo(newGame('qty-sell'), 'herb_field')
    state = applyAction(state, { kind: 'gather' }).state
    state = applyAction(state, { kind: 'gather' }).state
    expect(state.inventory['spirit_herb'] ?? 0).toBeGreaterThanOrEqual(2)
    state = navTo(state, 'market')
    const goldBefore = state.player.gold
    const sold = applyAction(state, { kind: 'free_text', raw: 'sell 2 herbs' })
    expect(sold.events.some((e) => e.type === 'SOLD' && e.qty === 2 && e.goldGain === 24)).toBe(
      true,
    )
    expect(sold.state.player.gold).toBe(goldBefore + 24)
    expect(sold.state.inventory['spirit_herb'] ?? 0).toBe(
      (state.inventory['spirit_herb'] ?? 0) - 2,
    )
  })

  it('uses two pills in one utterance with doubled effects', () => {
    const atMarket = navTo(newGame('qty-use'), 'market')
    let state: GameState = { ...atMarket, player: { ...atMarket.player, gold: 200 } }
    state = applyAction(state, { kind: 'buy', itemId: 'pill_hp' }).state
    state = applyAction(state, { kind: 'buy', itemId: 'pill_hp' }).state
    // Fresh life starts with one pill_hp already in the bag.
    expect(state.inventory['pill_hp']).toBe(3)
    const hurt: GameState = { ...state, player: { ...state.player, hp: 40 } }
    const result = applyAction(hurt, { kind: 'free_text', raw: 'dùng 2 viên hồi nguyên' })
    expect(result.events.some((e) => e.type === 'ITEM_USED' && e.hpDelta === 50)).toBe(true)
    expect(result.state.inventory['pill_hp']).toBe(1)
    expect(result.state.player.hp).toBe(90)
    expect(result.state.player.gold).toBe(130)
  })

  it('rejects absurd or nonsensical quantities as corrections', () => {
    const state = newGame('qty-invalid')
    const result = applyAction(state, {
      kind: 'free_text',
      raw: 'mua 50000 viên hồi nguyên',
    })
    expect(result.events.some((e) => e.type === 'CORRECTION_REJECTED')).toBe(true)
  })

  it('underspecified quantity defaults to exactly one', () => {
    const state = navTo(newGame('qty-default'), 'market')
    const result = applyAction(state, { kind: 'free_text', raw: 'mua viên hồi nguyên' })
    expect(result.events.some((e) => e.type === 'BOUGHT' && e.qty === 1)).toBe(true)
  })
})
