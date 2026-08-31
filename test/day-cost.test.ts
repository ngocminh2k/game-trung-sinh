import { describe, expect, it } from 'vitest'
import { DEADLINE_DAYS, applyAction, newGame } from '../src/engine'
import type { GameState } from '../src/engine'
import { navTo } from './test-utils'
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

describe('day cost (design review 2026-08, Phase 2)', () => {
  it('ordinary travel is free while deliberate training costs a day', () => {
    let state = newGame('day-cost')
    const day = state.day
    state = applyAction(state, { kind: 'move', direction: 'west' }).state
    expect(state.day).toBe(day)
    const trainable = { ...state, player: { ...state.player, qi: 60 } }
    const trained = applyAction(trainable, { kind: 'train' }).state
    expect(trained.day).toBe(day + 1)
  })

  it('the core loop verbs — gathering and selling — each burn a day', () => {
    let state = navTo(newGame('day-cost-loop'), 'herb_field')
    const gatherDay = state.day
    state = applyAction(state, { kind: 'gather' }).state
    expect(state.day).toBe(gatherDay + 1)
    state = navTo(state, 'market')
    const sellDay = state.day
    state = applyAction(state, { kind: 'sell', itemId: 'spirit_herb' }).state
    expect(state.day).toBe(sellDay + 1)
  })

  it('a pill outside a fight is an outing; mid-fight it is a free turn', () => {
    const state = newGame('day-cost-pill')
    const used = applyAction(state, { kind: 'use_item', itemId: 'pill_hp' })
    expect(used.events.some((e) => e.type === 'ITEM_USED')).toBe(true)
    expect(used.events.some((e) => e.type === 'DAY_PASSED')).toBe(true)
    expect(used.state.day).toBe(state.day + 1)

    let fighting = navTo(newGame('day-cost-pill-fight'), 'misty_forest')
    fighting = applyAction(fighting, { kind: 'start_encounter' }).state
    const midfight = applyAction(fighting, { kind: 'use_item', itemId: 'pill_hp' })
    expect(midfight.events.some((e) => e.type === 'ITEM_USED')).toBe(true)
    expect(midfight.state.day).toBe(fighting.day)
    expect(midfight.state.inventory['pill_hp'] ?? 0).toBe(0)
  })

  it('story decisions are part of the day cost', () => {
    const state = newGame('day-cost-story')
    const result = applyAction(state, { kind: 'story_choice', choiceId: 'return_pin' })
    expect(result.events.some((e) => e.type === 'STORY_CHOICE')).toBe(true)
    expect(result.state.day).toBe(state.day + 1)
  })

  it('failed actions never charge a day', () => {
    const state = newGame('day-cost-error')
    const result = applyAction(state, { kind: 'buy', itemId: 'pill_hp' }) // not at market
    expect(result.events.some((e) => e.type === 'ERROR')).toBe(true)
    expect(result.state.day).toBe(state.day)
    expect(result.events.some((e) => e.type === 'DAY_PASSED')).toBe(false)
  })

  it('talking is free — conversations do not burn a day', () => {
    const state = newGame('day-cost-talk')
    const result = applyAction(state, { kind: 'talk', npcId: 'n_elder_meihua' })
    expect(result.events.some((e) => e.type === 'TALKED')).toBe(true)
    expect(result.state.day).toBe(state.day)
  })

  it('combat turns are free inside an encounter — the trip is paid at start_encounter', () => {
    let state = navTo(newGame('day-cost-combat'), 'misty_forest')
    const dayBefore = state.day
    state = applyAction(state, { kind: 'start_encounter' }).state
    expect(state.day).toBe(dayBefore + 1)
    const fought = applyAction(state, { kind: 'combat_attack' }).state
    expect(fought.day).toBe(state.day)
  })

  it('rest keeps its own day accounting', () => {
    const state = newGame('day-cost-rest')
    const result = applyAction(state, { kind: 'rest' })
    expect(result.state.day).toBe(state.day + 1)
    expect(result.events.some((e) => e.type === 'DAY_PASSED')).toBe(true)
  })
})

describe('the twelfth night (design review 2026-08, Phase 2)', () => {
  it('starts the countdown when the story reaches Hồi II', () => {
    const state = gatherUntilDeadline('deadline-start')
    expect(typeof state.flags['night_deadline']).toBe('number')
    expect(state.flags['night_deadline']).toBe(state.day + DEADLINE_DAYS)
    expect(state.day).toBeGreaterThan(1)
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

  it('pins DEADLINE_DAYS: the core path clears the twelfth night', () => {
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
    // Walking is day-neutral; only deliberate actions consume the deadline.
    expect(coreDays).toBeLessThanOrEqual(DEADLINE_DAYS - 1)
  })
})
