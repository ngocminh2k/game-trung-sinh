import { describe, expect, it } from 'vitest'
import { LOCATIONS, MAP_HEIGHT, MAP_WIDTH, REGION_MAPS, getRegionMap, isPassable } from '../src/content'
import { applyAction, findPath, newGame, validateGameState } from '../src/engine'
import type { GameState } from '../src/engine'
import { locationIconFor } from '../src/ui/locationArt'

function travel(state: GameState, destinationId: string): GameState {
  const path = findPath(state.player.posX, state.player.posY, destinationId, state.player.locationId)
  if (path === null) throw new Error(`No authored route to ${destinationId}`)
  for (const direction of path) state = applyAction(state, { kind: 'move', direction }).state
  return state
}

describe('Scenario I regional maps', () => {
  it('gives every authored location one complete local map with a safe entry and valid exits', () => {
    expect(REGION_MAPS).toHaveLength(LOCATIONS.length)
    for (const location of LOCATIONS) {
      const map = getRegionMap(location.id)
      expect(map, location.id).toBeDefined()
      expect(map?.cells).toHaveLength(MAP_WIDTH * MAP_HEIGHT)
      const entry = map?.cells.find((cell) => cell.x === map.entry.x && cell.y === map.entry.y)
      expect(entry === undefined ? false : isPassable(entry), `${location.id} entry`).toBe(true)
      for (const cell of map?.cells ?? []) {
        if (cell.exitTo !== undefined) {
          expect(getRegionMap(cell.exitTo), `${location.id} exit`).toBeDefined()
          expect(locationIconFor(cell.exitTo), `${location.id} exit badge`).toMatch(/\.png$/)
        }
      }
    }
  })

  it('uses exits to travel through the whole authored regional route without wild coordinates', () => {
    let state = newGame('regional-route')
    for (const destination of ['market', 'village', 'herb_field', 'village', 'misty_forest', 'sealed_cave', 'cursed_rift', 'cloud_peak']) {
      state = travel(state, destination)
      expect(state.player.locationId).toBe(destination)
      expect(state.player.locationId.startsWith('wild_')).toBe(false)
    }
  })

  it('moves across ordinary terrain without spending a day', () => {
    const fresh = newGame('regional-free-step')
    const moved = applyAction(fresh, { kind: 'move', direction: 'south' })

    expect(moved.state.player.locationId).toBe('village')
    expect(moved.state.player.posX).toBe(3)
    expect(moved.state.player.posY).toBe(4)
    expect(moved.state.day).toBe(fresh.day)
    expect(moved.events.some((event) => event.type === 'MOVED')).toBe(true)
    expect(moved.events.some((event) => event.type === 'DAY_PASSED' || event.type === 'NODE_REACHED')).toBe(false)
  })

  it('emits a reached-node event and blocks impassable local terrain', () => {
    const fresh = newGame('regional-node')
    const approach = applyAction(fresh, { kind: 'move', direction: 'west' })
    expect(approach.state.player.locationId).toBe('village')
    const moved = applyAction(approach.state, { kind: 'move', direction: 'west' })
    expect(moved.events.some((event) => event.type === 'NODE_REACHED' && event.kind === 'exit')).toBe(true)
    expect(moved.state.player.locationId).toBe('market')

    const sect = travel(fresh, 'sect')
    const blocked = applyAction(sect, { kind: 'move', direction: 'south' })
    expect(blocked.events.some((event) => event.type === 'ERROR' && event.code === 'MOVE_BLOCKED')).toBe(true)
  })

  it('recovers retired overview-map saves at a real regional entry instead of leaving them stuck', () => {
    const stale = newGame('old-overview-save')
    const parsed = validateGameState({
      ...stale,
      player: { ...stale.player, locationId: 'wild_5_5', posX: 5, posY: 5 },
    })
    expect(parsed.player.locationId).toBe('village')
    expect(parsed.player.posX).toBe(3)
    expect(parsed.player.posY).toBe(3)
  })
})
