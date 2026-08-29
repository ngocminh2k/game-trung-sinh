import { describe, expect, it } from 'vitest'
import { applyAction, newGame, storyRouteProof } from '../src/engine'
import { getItem } from '../src/content/items'
import { endingEpilogue } from '../src/ui/endingEpilogue'
import type { GameState } from '../src/engine'

const ROUTES = ['mercy', 'wealth', 'truth'] as const
type Route = (typeof ROUTES)[number]

function arrivedAtRoute(route: Route): GameState {
  const base = newGame(`proof-record-${route}`)
  return { ...base, flags: { ...base.flags, story_route: route, story_route_arrived: true } }
}

function resolveProot(state: GameState, approach: 'present' | 'withhold'): GameState {
  return applyAction(state, { kind: 'resolve_route_event', approach }).state
}

describe('ROUTE-04 / A-02 — route proof is a stable inspectable evidence record', () => {
  it('carries the proof as a named inventory item with a stable id after the on-site event', () => {
    for (const route of ROUTES) {
      const state = resolveProot(arrivedAtRoute(route), 'present')
      const itemId = `evidence_route_${route}`
      expect(state.inventory[itemId]).toBe(1)
      const def = getItem(itemId)
      expect(def).toBeDefined()
      expect(def?.usable).toBe(false)
      // The inventory item name must match the carried proof name shown in the world UI.
      const carried = storyRouteProof(state)
      expect(carried).toBeDefined()
      if (carried !== undefined && def !== undefined) {
        expect(def.nameVi).toBe(carried.proofVi)
        expect(def.nameEn).toBe(carried.proofEn)
      }
      // Deterministic state keeps a stable proof id independent of the inventory copy.
      expect(state.flags.story_route_proof).toBe(route)
    }
  })

  it('keeps the proof in deterministic state even if the inventory copy is removed', () => {
    const state = resolveProot(arrivedAtRoute('mercy'), 'present')
    const stripped = { ...state, inventory: {} }
    expect(storyRouteProof(stripped)).toBeDefined()
    expect(stripped.flags.story_route_proof).toBe('mercy')
  })

  it('reads the carried proof at the terminal epilogue', () => {
    const base = newGame('proof-epilogue')
    const withProof = {
      ...base,
      flags: {
        ...base.flags,
        story_route_ready: true,
        story_route: 'truth',
        story_route_proof: 'truth',
        story_proof_present: true,
        story_scene: 'last_page',
      },
    }
    const lines = endingEpilogue(withProof, 'en')
    expect(lines.some((line) => line.includes('Copy of the eighth name'))).toBe(true)

    const withoutProof = { ...base, flags: { ...base.flags, story_scene: 'last_page' } }
    const quiet = endingEpilogue(withoutProof, 'en')
    expect(quiet.some((line) => line.includes('No evidence travelled'))).toBe(true)
  })
})
