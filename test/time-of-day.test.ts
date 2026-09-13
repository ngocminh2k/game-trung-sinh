import { describe, expect, it } from 'vitest'
import {
  TIME_MODS,
  TIME_OF_DAY_EN,
  TIME_OF_DAY_VI,
  TIME_SLOTS,
  advanceTime,
  applyAction,
  newGame,
} from '../src/engine'
import type { GameEvent, GameState } from '../src/engine'
import { navTo } from './test-utils'

function clockDay(day: number, timeOfDay: GameState['timeOfDay'] = 'sang'): GameState {
  return { ...newGame(`clock-${day}-${timeOfDay ?? 'none'}`), day, timeOfDay }
}

describe('four-slot day clock (2026-09)', () => {
  it('advanceTime walks the four beats and rolls DAY_PASSED past the night', () => {
    const base = clockDay(5, 'sang')
    const ev1: GameEvent[] = []
    const after1 = advanceTime(base, 1, ev1)
    expect(after1.timeOfDay).toBe('trua')
    expect(after1.day).toBe(5)
    expect(ev1.some((e) => e.type === 'TIME_ADVANCED')).toBe(true)
    expect(ev1.some((e) => e.type === 'DAY_PASSED')).toBe(false)

    const evWrap: GameEvent[] = []
    const afterWrap = advanceTime(after1, 3, evWrap) // trưa → sáng ngày 6
    expect(afterWrap.timeOfDay).toBe('sang')
    expect(afterWrap.day).toBe(6)
    expect(evWrap.some((e) => e.type === 'DAY_PASSED')).toBe(true)
  })

  it('the buff/debuff table covers every slot with the promised direction', () => {
    expect(TIME_SLOTS).toEqual(['sang', 'trua', 'chieu', 'toi'])
    for (const slot of TIME_SLOTS) expect(TIME_MODS[slot]).toBeDefined()
    // Sáng: calm and gentle — safe travel, fat dew harvest, light training.
    expect(TIME_MODS.sang.gatherYield).toBeGreaterThan(1)
    expect(TIME_MODS.sang.dangerDamage).toBeLessThan(1)
    expect(TIME_MODS.sang.trainRisk).toBeLessThan(1)
    // Chiều: the chợ dips its prices.
    expect(TIME_MODS.chieu.shopPrice).toBeLessThan(1)
    // Tối: cultivation surges — and taxes.
    expect(TIME_MODS.toi.trainProgress).toBeGreaterThan(1)
    expect(TIME_MODS.toi.trainHpCost).toBeGreaterThan(1)
    expect(TIME_MODS.toi.trainRisk).toBeGreaterThan(1)
    expect(TIME_OF_DAY_VI.sang).toBe('Sáng')
    expect(TIME_OF_DAY_EN.toi).toBe('Night')
  })

  it('night training gains more progress and pays for it in HP', () => {
    const dayState = { ...clockDay(4, 'sang'), player: { ...clockDay(4, 'sang').player, hp: 100, qi: 60, progress: 0 } }
    const nightState = { ...clockDay(4, 'toi'), player: { ...clockDay(4, 'toi').player, hp: 100, qi: 60, progress: 0 } }
    const dayResult = applyAction(dayState, { kind: 'train' })
    const nightResult = applyAction(nightState, { kind: 'train' })
    const dayGain = dayResult.events.find((e): e is Extract<GameEvent, { type: 'TRAINED' }> => e.type === 'TRAINED')
    const nightGain = nightResult.events.find((e): e is Extract<GameEvent, { type: 'TRAINED' }> => e.type === 'TRAINED')
    expect(nightGain?.gain ?? 0).toBeGreaterThan(dayGain?.gain ?? 99)
    expect(nightResult.state.player.hp).toBeLessThan(dayResult.state.player.hp)
    // A night session wraps the clock into the next day.
    expect(nightResult.state.day).toBe(4 + 1)
    expect(nightResult.state.timeOfDay).toBe('sang')
  })

  it('entering a danger zone rolls damage only once per day; a new day re-arms it', () => {
    let state = navTo(newGame('danger-once'), 'village')
    const hpBeforeFirst = state.player.hp
    state = navTo(state, 'misty_forest')
    expect(state.player.hp).toBeLessThan(hpBeforeFirst)

    const hpAfterFirst = state.player.hp
    state = navTo(state, 'village')
    state = navTo(state, 'misty_forest') // re-entry same day → free
    expect(state.player.hp).toBe(hpAfterFirst)

    state = applyAction(state, { kind: 'rest' }).state // a new day
    state = navTo(state, 'village')
    const hpBeforeSecond = state.player.hp
    state = navTo(state, 'misty_forest')
    expect(state.player.hp).toBeLessThan(hpBeforeSecond)
  })

  it('chiều dips the market price; the morning keeps the book value', () => {
    let state = navTo(newGame('chieu-buy'), 'market')
    const goldBefore = state.player.gold
    state = applyAction(state, { kind: 'buy', itemId: 'pill_hp' }).state
    const paidSang = goldBefore - state.player.gold
    // Issue 7 landed after this test was written: the market now pays the
    // cheapest stall listing (9g for a hồi nguyên pill), not the stale
    // static book value. Sáng stays neutral, Chiều still dips it.
    expect(paidSang).toBe(9)

    const chieuState = { ...state, timeOfDay: 'chieu' as const, player: { ...state.player, gold: goldBefore } }
    const chieuResult = applyAction(chieuState, { kind: 'buy', itemId: 'pill_hp' })
    const paidChieu = goldBefore - chieuResult.state.player.gold
    expect(paidChieu).toBe(8) // Math.round(9 × 0.9) = 8
    expect(paidChieu).toBeLessThan(paidSang)
  })
})