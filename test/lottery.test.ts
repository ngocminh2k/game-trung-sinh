import { describe, expect, it } from 'vitest'
import { LOTTERY_COST, applyAction, newGame } from '../src/engine'
import { navTo } from './test-utils'

describe('lottery restriction', () => {
  it('drawing outside the market is rejected', () => {
    const state = newGame('lottery-loc')
    expect(state.player.locationId).toBe('village')
    const result = applyAction(state, { kind: 'draw_lottery' })
    expect(result.events.some((e) => e.type === 'ERROR' && e.code === 'NOT_AT_LOCATION')).toBe(true)
    expect(result.state.lastLotteryDay).toBeNull()
  })

  it('exactly one draw per in-game day; rest unlocks the next day', () => {
    let state = navTo(newGame('lottery-day'), 'market')
    const goldBefore = state.player.gold
    const first = applyAction(state, { kind: 'draw_lottery' })
    expect(first.events.some((e) => e.type === 'DRAW_RESULT')).toBe(true)
    state = first.state
    expect(state.player.gold).toBeGreaterThanOrEqual(goldBefore - LOTTERY_COST)
    // The draw itself is an outing: it costs the day it is recorded on.
    expect(state.lastLotteryDay).toBe(state.day)

    const snapshot = JSON.stringify(state)
    const second = applyAction(state, { kind: 'draw_lottery' })
    expect(
      second.events.some((e) => e.type === 'ERROR' && e.code === 'LOTTERY_ALREADY_DRAWN'),
    ).toBe(true)
    expect(JSON.stringify(second.state)).toBe(snapshot)

    const dayBeforeRest = state.day
    state = applyAction(state, { kind: 'rest' }).state
    expect(state.day).toBe(dayBeforeRest + 1)

    const third = applyAction(state, { kind: 'draw_lottery' })
    expect(third.events.some((e) => e.type === 'DRAW_RESULT')).toBe(true)
    expect(third.state.lastLotteryDay).toBe(third.state.day)
  })

  it('a broke player cannot buy a ticket', () => {
    let state = navTo(newGame('lottery-broke'), 'market')
    let guard = 0
    while (state.player.gold > LOTTERY_COST && !state.terminal && guard < 200) {
      const next = applyAction(state, { kind: 'draw_lottery' })
      if (next.events.some((e) => e.type === 'ERROR')) break
      state = next.state
      if (state.player.gold <= LOTTERY_COST) break
      state = applyAction(state, { kind: 'rest' }).state
      guard += 1
    }
    if (state.player.gold < LOTTERY_COST) {
      const result = applyAction(state, { kind: 'draw_lottery' })
      expect(
        result.events.some(
          (e) =>
            e.type === 'ERROR' &&
            (e.code === 'LOTTERY_NEED_GOLD' || e.code === 'INSUFFICIENT_GOLD'),
        ),
      ).toBe(true)
    }
  })
})
