import { describe, expect, it } from 'vitest'
import { applyAction, currentStoryScene, newGame } from '../src/engine'
import type { GameState } from '../src/engine'

function choose(state: GameState, choiceId: string): GameState {
  const result = applyAction(state, { kind: 'story_choice', choiceId })
  expect(result.events.some((event) => event.type === 'STORY_CHOICE')).toBe(true)
  return result.state
}

describe('branching story', () => {
  it('starts at the letter and advances only through authored choices', () => {
    let state = newGame('story-smoke')
    expect(currentStoryScene(state).id).toBe('letter_at_dawn')
    state = choose(state, 'return_pin')
    expect(state.flags.story_mercy).toBe(1)
    expect(currentStoryScene(state).id).toBe('market_rumor')
  })

  it('rejects a choice from another scene without changing the story', () => {
    const state = newGame('story-guard')
    const result = applyAction(state, { kind: 'story_choice', choiceId: 'free_ha' })
    expect(result.events).toEqual([{ type: 'ERROR', code: 'STORY_CHOICE_UNAVAILABLE' }])
    expect(currentStoryScene(result.state).id).toBe('letter_at_dawn')
  })

  it('splits the second act into three visible routes with immediate mechanical consequences', () => {
    const routes: Array<[string, string, string, number]> = [
      ['warn_village', 'village_vow', 'listen_to_thread', 46],
      ['buy_silence', 'market_bargain', 'buy_ward', 60],
      ['ask_ngo', 'memory_trail', 'trace_erased_name', 44],
    ]
    for (const [firstChoice, routeScene, routeChoice, expectedQi] of routes) {
      let state = newGame(`route-${routeScene}`)
      state = choose(state, 'return_pin')
      state = choose(state, firstChoice)
      expect(currentStoryScene(state).id).toBe(routeScene)
      state = choose(state, routeChoice)
      expect(state.player.qi).toBe(expectedQi)
      expect(currentStoryScene(state).id).toBe('cave_witness')
    }
  })

  it('turns the same final gesture into different endings from prior choices', () => {
    let truth = newGame('truth-ending')
    for (const id of ['study_letter', 'ask_ngo', 'trace_erased_name', 'record_ha', 'expose_vo', 'confess', 'open_last_page']) truth = choose(truth, id)
    expect(truth.terminal).toBe(true)
    expect(truth.endingId).toBe('rootless_star')

    let mercy = newGame('mercy-ending')
    for (const id of ['return_pin', 'warn_village', 'keep_roll_call', 'free_ha', 'keep_seal', 'confess', 'share_last_page']) mercy = choose(mercy, id)
    expect(mercy.terminal).toBe(true)
    expect(mercy.endingId).toBe('forgiven_enemy')
  })

  it('keeps all nine narrative endings reachable through branch values', () => {
    const cases: Array<[string, Record<string, number | boolean | string>, string]> = [
      ['open_last_page', { story_truth: 3 }, 'rootless_star'],
      ['open_last_page', { story_power: 3 }, 'borrowed_face'],
      ['open_last_page', { story_power: 3, story_ha_bound: true }, 'rift_kingdom'],
      ['open_last_page', { story_wealth: 2 }, 'city_of_ghosts'],
      ['open_last_page', {}, 'iron_lantern'],
      ['share_last_page', { story_mercy: 3, story_khoa_trusted: true }, 'forgiven_enemy'],
      ['share_last_page', { story_mercy: 2 }, 'keeper_of_names'],
      ['share_last_page', {}, 'jade_heir'],
      ['burn_last_page', { story_renounce: 2 }, 'blank_page'],
      ['burn_last_page', {}, 'quiet_harmony'],
    ]
    for (const [choiceId, flags, expected] of cases) {
      const base = newGame(`ending-${expected}`)
      const state = { ...base, flags: { ...base.flags, story_scene: 'last_page', ...flags } }
      const result = applyAction(state, { kind: 'story_choice', choiceId })
      expect(result.state.endingId).toBe(expected)
    }
  })
})
