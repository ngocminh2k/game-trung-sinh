import { describe, expect, it } from 'vitest'
import { applyAction, currentStoryScene, findStoryChoice, newGame, storyRouteTarget } from '../src/engine'
import type { GameState } from '../src/engine'
import { navTo } from './test-utils'

const ROUTES = ['mercy', 'wealth', 'truth'] as const
type Route = (typeof ROUTES)[number]
type FlagValues = Record<string, string | number | boolean>

// Hồi I choice → exactly one Hồi II lead.
const LEADS = [
  ['return_pin', 'walk_with_meihua', ['sell_map_premium', 'decode_letter']],
  ['sell_pin', 'sell_map_premium', ['walk_with_meihua', 'decode_letter']],
  ['study_letter', 'decode_letter', ['walk_with_meihua', 'sell_map_premium']],
] as const

function choose(state: GameState, choiceId: string): GameState {
  const result = applyAction(state, { kind: 'story_choice', choiceId })
  expect(result.events.some((event) => event.type === 'STORY_CHOICE')).toBe(true)
  return result.state
}

function atScene(flags: FlagValues, scene: string): GameState {
  const base = newGame(`consequence-${scene}`)
  return { ...base, flags: { ...base.flags, ...flags, story_scene: scene } }
}

describe('STORY Phase 4 — Hồi I choice unlocks exactly one reachable lead', () => {
  it('gates the matching lead at market_rumor and keeps the others locked', () => {
    for (const [firstChoice, lead, locked] of LEADS) {
      let state = newGame(`lead-${firstChoice}`)
      state = choose(state, firstChoice)
      expect(currentStoryScene(state).id).toBe('market_rumor')
      expect(findStoryChoice(state, lead)).toBeDefined()
      for (const other of locked) expect(findStoryChoice(state, other)).toBeUndefined()
      state = choose(state, lead)
      const target = storyRouteTarget(state)
      expect(target).toBeDefined()
      if (target !== undefined) expect(navTo(state, target.locationId).player.locationId).toBe(target.locationId)
    }
  })
})

describe('STORY Phase 4 — the route proof changes cave and trial choices', () => {
  const ROUTE_CHOICES: Record<Route, Record<'cave_witness' | 'sect_trial', string>> = {
    mercy: { cave_witness: 'call_roll_witnesses', sect_trial: 'let_roll_testify' },
    wealth: { cave_witness: 'redeem_bao_ward', sect_trial: 'settle_ward_debt' },
    truth: { cave_witness: 'name_the_eighth', sect_trial: 'restore_eighth_name' },
  }

  it('unlocks one distinct deterministic action per route at cave and trial', () => {
    for (const scene of ['cave_witness', 'sect_trial'] as const) {
      for (const route of ROUTES) {
        const base = atScene({ story_route_ready: true, story_route: route, story_route_proof: route }, scene)
        const choiceId = ROUTE_CHOICES[route][scene]
        expect(findStoryChoice(base, choiceId)).toBeDefined()
        for (const other of ROUTES.filter((entry) => entry !== route)) {
          expect(findStoryChoice(base, ROUTE_CHOICES[other][scene])).toBeUndefined()
        }
        const result = applyAction(base, { kind: 'story_choice', choiceId }).state
        const choice = currentStoryScene(base).choices.find((entry) => entry.id === choiceId)
        expect(choice?.effects).toBeDefined()
        expect(choice?.playerDelta).toBeDefined()
        for (const [flag, value] of Object.entries(choice?.effects ?? {})) expect(result.flags[flag]).toBe(value)
      }
    }
  })

  it('never changes which choices are legal — availability stays proof- and requires-driven only', () => {
    for (const route of ROUTES) {
      const state = atScene({ story_route_ready: true, story_route: route, story_route_proof: route, story_proof_present: true }, 'cave_witness')
      expect(findStoryChoice(state, 'record_ha')).toBeDefined()
      expect(findStoryChoice(state, 'bind_ha')).toBeUndefined()
      expect(findStoryChoice(state, 'free_ha')).toBeDefined()
      expect(findStoryChoice(state, ROUTE_CHOICES[route].cave_witness)).toBeDefined()
    }
  })
})

describe('STORY Phase 4 — the forgotten name stays route-specific and never soft locks', () => {
  it('derives the forgotten name from Hồi I after the engine starts the deadline', () => {
    const cases = [
      ['return_pin', 'village'],
      ['sell_pin', 'bao'],
      ['study_letter', 'meihua'],
    ] as const
    for (const [firstChoice, forgottenName] of cases) {
      let state = choose(newGame(`forgotten-${firstChoice}`), firstChoice)
      // The Phase 2 clock keys off the gameplay beat (chapter >= 2), not the
      // story scene, so walk to the herb terraces and gather until the reducer
      // starts the countdown — the same legal path test/day-cost.test.ts uses.
      state = navTo(state, 'herb_field')
      let guard = 0
      while (typeof state.flags['night_deadline'] !== 'number' && guard < 6) {
        state = applyAction(state, { kind: 'gather' }).state
        guard += 1
      }
      expect(typeof state.flags['night_deadline']).toBe('number')
      state = { ...state, flags: { ...state.flags, night_deadline: state.day } }
      const result = applyAction(state, { kind: 'rest' })
      expect(result.state.flags['night_forgotten']).toBe(true)
      expect(result.state.flags['night_forgotten_name']).toBe(forgottenName)
      expect(result.state.player.alive).toBe(true)
      expect(result.state.terminal).toBe(false)
    }
  })

  it('keeps every scene on a legal path to a final choice with any flag snapshot', () => {
    // Realistic flag snapshots a run can actually carry.
    const snapshots: FlagValues[] = [
      { night_forgotten: true, night_forgotten_name: 'meihua' },
      { night_forgotten: true, night_forgotten_name: 'bao' },
      { night_forgotten: true, night_forgotten_name: 'ngo' },
      { night_forgotten: true, night_forgotten_name: 'village' },
      { story_route_ready: true, story_route: 'truth', story_route_proof: 'truth' },
      { story_route_ready: true, story_route: 'truth', story_route_proof: 'truth', story_proof_withhold: true },
      { story_route_ready: true, story_route: 'mercy', story_route_proof: 'mercy' },
      { story_route_ready: true, story_route: 'wealth', story_route_proof: 'wealth' },
    ]
    // Scenes whose choices are ever-present (no route gate): they must always
    // keep ≥1 legal choice and one that walks toward the final page.
    const everOpen = ['letter_at_dawn', 'market_rumor', 'cave_witness', 'sect_trial', 'mirror_choice', 'last_page']
    // Route scenes gate every choice on story_route_ready. Before that the
    // player travels to the route target to unlock them — that target's
    // existence on the map is the reachability proof, not a legal choice.
    const routeScenes = ['village_vow', 'market_bargain', 'memory_trail']
    for (const extra of snapshots) {
      for (const sceneId of everOpen) {
        const state = atScene(extra, sceneId)
        const legal = currentStoryScene(state).choices.filter((choice) => findStoryChoice(state, choice.id) !== undefined)
        expect(legal.length, `${sceneId} @ ${JSON.stringify(extra)}`).toBeGreaterThan(0)
        const next = legal.find((choice) => choice.final === true || choice.nextSceneId !== null)
        expect(next, `${sceneId} keeps a forward choice`).toBeDefined()
      }
      for (const sceneId of routeScenes) {
        const state = atScene(extra, sceneId)
        const legal = currentStoryScene(state).choices.filter((choice) => findStoryChoice(state, choice.id) !== undefined)
        // A route scene is only reachable via a market_rumor choice that sets
        // story_route, so inject it when the snapshot omits it.
        const withRoute = typeof state.flags.story_route === 'string'
          ? state
          : { ...state, flags: { ...state.flags, story_route: 'truth' } }
        const canAdvance = legal.length > 0 || storyRouteTarget(withRoute) !== undefined
        expect(canAdvance, `${sceneId} @ ${JSON.stringify(extra)}`).toBe(true)
      }
    }
  })
})
