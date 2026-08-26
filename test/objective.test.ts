import { describe, expect, it } from 'vitest'
import { deriveObjective } from '../src/ui/objective'
import { newGame } from '../src/engine'
import type { Locale } from '../src/engine'

function seededState() {
  return newGame('objective-test-seed')
}

describe('deriveObjective', () => {
  it('returns null once the run is terminal', () => {
    const state = seededState()
    state.terminal = true
    expect(deriveObjective(state, 'vi')).toBeNull()
    expect(deriveObjective(state, 'en')).toBeNull()
  })

  it('shows the combat line when an encounter is active', () => {
    const state = seededState()
    state.encounter = { enemyId: 'beast_spring', hp: 12, maxHp: 12, guard: 0 }
    expect(deriveObjective(state, 'en')).toContain('In battle')
    expect(deriveObjective(state, 'vi')).toContain('Giao chiến')
  })

  it('points to a local danger before it is defeated', () => {
    const state = seededState()
    state.player.locationId = 'misty_forest'
    const line = deriveObjective(state, 'en')
    expect(line).toMatch(/face .* in /)
    expect(line).not.toContain('cultivate')
  })

  it('falls back to cultivation progress on safe ground', () => {
    const state = seededState()
    state.player.progress = 4
    expect(deriveObjective(state, 'en')).toContain('4/120')
    expect(deriveObjective(state, 'vi')).toContain('tu luyện')
  })

  it('asks for a breakthrough once progress is full', () => {
    const state = seededState()
    state.player.progress = 120
    state.player.stage = 2
    const line = deriveObjective(state, 'en')
    expect(line).toContain('Tier 3')
    expect(line).toContain('breakthrough')
  })

  it('is deterministic for both locales', () => {
    const state = seededState()
    state.player.locationId = 'market'
    state.player.progress = 40
    const vi = deriveObjective(state, 'vi' as Locale)
    const en = deriveObjective(state, 'en' as Locale)
    expect(vi).not.toEqual(en)
    expect(vi).toContain('40/120')
    expect(en).toContain('40/120')
  })
})
