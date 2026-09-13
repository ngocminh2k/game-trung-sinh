import { describe, expect, it } from 'vitest'
import { DEADLINE_DAYS, applyAction } from '../src/engine'
import type { GameState } from '../src/engine'
import { navTo, newGame } from './test-utils'
import { deriveObjective, nightDeadlineRemaining } from '../src/ui/objective'

function gatherUntilDeadline(seed: string): GameState {
  let state = navTo(newGame(seed), 'herb_field')
  let guard = 0
  while (typeof state.flags['night_deadline'] !== 'number' && guard < 6) {
    state = applyAction(state, { kind: 'gather' }).state
    guard += 1
  }
  return state
}

describe('time cost (2026-09 four-slot clock)', () => {
  it('ordinary travel is free while deliberate actions spend one slot, not a full day', () => {
    let state = newGame('time-cost')
    const day = state.day
    state = applyAction(state, { kind: 'move', direction: 'west' }).state
    expect(state.day).toBe(day)
    expect(state.timeOfDay).toBe('sang')
    const trainable = { ...state, player: { ...state.player, qi: 60 } }
    const trained = applyAction(trainable, { kind: 'train' }).state
    expect(trained.day).toBe(day)
    expect(trained.timeOfDay).toBe('trua')
  })

  it('four slots wrap a full day: gathering stays same-day until the night edge', () => {
    let state = navTo(newGame('time-loop'), 'herb_field')
    const day = state.day
    state = applyAction(state, { kind: 'gather' }).state // Sáng → Trưa
    expect(state.day).toBe(day)
    state = applyAction(state, { kind: 'gather' }).state // Trưa → Chiều
    state = applyAction(state, { kind: 'gather' }).state // Chiều → Tối
    state = applyAction(state, { kind: 'gather' }).state // Tối → Sáng ngày mới
    expect(state.day).toBe(day + 1)
    expect(state.timeOfDay).toBe('sang')
    // Selling is a new outing with its own slot budget.
    state = navTo(state, 'market')
    const sellDay = state.day
    state = applyAction(state, { kind: 'sell', itemId: 'spirit_herb' }).state
    expect(state.day).toBe(sellDay)
    expect(state.timeOfDay).toBe('trua')
  })

  it('a pill outside a fight is an outing; mid-fight it is a free turn', () => {
    const state = newGame('time-pill')
    const used = applyAction(state, { kind: 'use_item', itemId: 'pill_hp' })
    expect(used.events.some((e) => e.type === 'ITEM_USED')).toBe(true)
    expect(used.events.some((e) => e.type === 'TIME_ADVANCED')).toBe(true)
    expect(used.state.day).toBe(state.day)
    expect(used.state.timeOfDay).toBe('trua')

    let fighting = navTo(newGame('time-pill-fight'), 'misty_forest')
    fighting = applyAction(fighting, { kind: 'start_encounter' }).state
    const midfight = applyAction(fighting, { kind: 'use_item', itemId: 'pill_hp' })
    expect(midfight.events.some((e) => e.type === 'ITEM_USED')).toBe(true)
    expect(midfight.state.day).toBe(fighting.day)
    expect(midfight.state.inventory['pill_hp'] ?? 0).toBe(0)
  })

  it('story decisions keep the whole-day montage cost (boot lands on Ngày 3)', () => {
    const state = newGame('time-story')
    const result = applyAction(state, { kind: 'story_choice', choiceId: 'return_pin' })
    expect(result.events.some((e) => e.type === 'STORY_CHOICE')).toBe(true)
    expect(result.state.day).toBe(state.day + 1)
    expect(result.state.timeOfDay).toBe(state.timeOfDay)
  })

  it('failed actions never charge time', () => {
    const state = newGame('time-error')
    const result = applyAction(state, { kind: 'buy', itemId: 'pill_hp' }) // not at market
    expect(result.events.some((e) => e.type === 'ERROR')).toBe(true)
    expect(result.state.day).toBe(state.day)
    expect(result.state.timeOfDay).toBe(state.timeOfDay)
    expect(result.events.some((e) => e.type === 'TIME_ADVANCED' || e.type === 'DAY_PASSED')).toBe(false)
  })

  it('talking is free — a chat does not burn a slot', () => {
    const state = newGame('time-talk')
    const result = applyAction(state, { kind: 'talk', npcId: 'n_elder_meihua' })
    expect(result.events.some((e) => e.type === 'TALKED')).toBe(true)
    expect(result.state.timeOfDay).toBe(state.timeOfDay)
  })

  it('combat turns are free inside an encounter — the trip is paid at start_encounter', () => {
    let state = navTo(newGame('time-combat'), 'misty_forest')
    const slotBefore = state.timeOfDay
    state = applyAction(state, { kind: 'start_encounter' }).state
    expect(state.timeOfDay).not.toBe(slotBefore)
    const fought = applyAction(state, { kind: 'combat_attack' }).state
    expect(fought.timeOfDay).toBe(state.timeOfDay)
    expect(fought.day).toBe(state.day)
  })

  it('resting sleeps to the next dawn', () => {
    const state = newGame('time-rest')
    const result = applyAction(state, { kind: 'rest' })
    expect(result.state.day).toBe(state.day + 1)
    expect(result.state.timeOfDay).toBe('sang')
    expect(result.events.some((e) => e.type === 'DAY_PASSED')).toBe(true)
  })

  it('entering Hồi II sets the twelfth-night deadline from the current day', () => {
    const state = gatherUntilDeadline('deadline-start')
    expect(typeof state.flags['night_deadline']).toBe('number')
    expect(state.flags['night_deadline']).toBe(state.day + DEADLINE_DAYS)
    expect(state.day).toBeGreaterThanOrEqual(1)
  })

  it('sets the deadline exactly once', () => {
    let state = gatherUntilDeadline('deadline-once')
    const deadline = state.flags['night_deadline']
    state = applyAction(state, { kind: 'rest' }).state
    expect(state.flags['night_deadline']).toBe(deadline)
  })

  it('overshooting opens a content branch, never a game over', () => {
    let state = gatherUntilDeadline('deadline-expiry')
    state = { ...state, flags: { ...state.flags, night_deadline: state.day } }
    const result = applyAction(state, { kind: 'rest' })
    expect(result.state.flags['night_forgotten']).toBe(true)
    expect(result.state.player.alive).toBe(true)
    expect(result.state.terminal).toBe(false)
    expect(result.events.some((e) => e.type === 'WARNING' && e.level === 2)).toBe(true)
    // The expiry is announced once.
    const again = applyAction(result.state, { kind: 'rest' })
    expect(again.events.some((e) => e.type === 'WARNING' && e.level === 2)).toBe(false)
  })

  it('surviving to the deadline day is still in time — the night itself is the limit', () => {
    let state = gatherUntilDeadline('deadline-boundary')
    state = { ...state, flags: { ...state.flags, night_deadline: state.day + 1 } }
    expect(nightDeadlineRemaining(state)).toBe(1)
    const result = applyAction(state, { kind: 'rest' })
    expect(result.state.flags['night_forgotten']).toBeUndefined()
    expect(result.state.player.alive).toBe(true)
    expect(nightDeadlineRemaining(result.state)).toBe(0)
  })

  it('surfaces the countdown in the objective line when the night is close', () => {
    let state = gatherUntilDeadline('deadline-objective')
    state = { ...state, flags: { ...state.flags, night_deadline: state.day + 2 } }
    expect(nightDeadlineRemaining(state)).toBe(2)
    const vi = deriveObjective(state, 'vi')
    expect(vi).toContain('đêm thứ mười hai')
    const en = deriveObjective(state, 'en')
    expect(en).toContain('twelfth night')
  })

  it('hides the countdown once the night has passed', () => {
    let state = gatherUntilDeadline('deadline-forgotten')
    state = {
      ...state,
      flags: { ...state.flags, night_deadline: state.day, night_forgotten: true },
    }
    expect(nightDeadlineRemaining(state)).toBeNull()
  })

  it('pins the deadline budget: walking is day-neutral so the core route clears the window', () => {
    let state = gatherUntilDeadline('deadline-balance')
    const startDay = state.day
    state = navTo(state, 'market')
    state = applyAction(state, { kind: 'buy', itemId: 'warding_talisman' }).state
    state = navTo(state, 'sealed_cave')
    state = applyAction(state, { kind: 'start_encounter' }).state
    let guard = 0
    while (state.encounter !== null && guard < 20 && !state.terminal) {
      state = applyAction(state, { kind: 'combat_attack', techniqueId: 'basic_staff_form' }).state
      guard += 1
    }
    expect(state.flags['defeated_seal_wraith']).toBe(true)
    expect(state.player.alive).toBe(true)
    expect(state.terminal).toBe(false)
    // Reaching the seal resolves the clock — the village still remembers.
    expect(state.flags['night_deadline_cleared']).toBe(true)
    const coreDays = state.day - startDay
    // Walking is day-neutral; only deliberate actions consume the calendar.
    expect(coreDays).toBeLessThanOrEqual(DEADLINE_DAYS - 1)
  })
})