import { describe, expect, it } from 'vitest'
import { deriveObjective } from '../src/ui/objective'
import { newGame } from './test-utils'
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

  it('moves the objective with the authored story beat', () => {
    const state = seededState()
    state.flags.story_scene = 'cave_witness'
    expect(deriveObjective(state, 'en')).toContain('Ha’s testimony')
    expect(deriveObjective(state, 'vi')).toContain('lời chứng của Hà')
  })

  it('makes an unresolved route target louder than the cultivation grind', () => {
    const base = newGame('route-objective')
    const game = { ...base, flags: { ...base.flags, story_route: 'mercy', story_scene: 'village_vow' } }
    expect(deriveObjective(game, 'vi')).toContain('Hiên nhà Cụ Mai Hoa')
  })

  it('keeps a reached route as an on-site encounter until its action is resolved', () => {
    const base = newGame('route-encounter-objective')
    const game = { ...base, flags: { ...base.flags, story_route: 'mercy', story_scene: 'village_vow', story_route_arrived: true } }
    expect(deriveObjective(game, 'en')).toContain('on-site event')
  })

  it('names the specific person waiting at an active route encounter', () => {
    const base = newGame('route-encounter-contact')
    const game = { ...base, flags: { ...base.flags, story_route: 'wealth', story_scene: 'market_bargain', story_route_arrived: true } }
    expect(deriveObjective(game, 'vi')).toContain('Bảo đang chờ')
    expect(deriveObjective(game, 'en')).toContain('Bao is waiting')
  })

  it('uses the current narrative beat as the early-game objective', () => {
    const state = seededState()

    expect(deriveObjective(state, 'vi')).toContain('Linh căn phế')
    expect(deriveObjective(state, 'en')).toContain('broken root')
  })

  it('keeps the final story decision legible', () => {
    const state = seededState()
    state.flags.story_scene = 'last_page'
    const line = deriveObjective(state, 'en')
    expect(line).toContain('final decision')
    expect(line).toContain('no one else')
  })

  it('is deterministic for both locales', () => {
    const state = seededState()
    state.player.locationId = 'market'
    state.player.progress = 40
    const vi = deriveObjective(state, 'vi' as Locale)
    const en = deriveObjective(state, 'en' as Locale)
    expect(vi).not.toEqual(en)
    expect(vi).toContain('Linh căn phế')
    expect(en).toContain('broken root')
  })
})
