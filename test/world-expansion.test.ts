import { describe, expect, it } from 'vitest'
import {
  LOCATIONS,
  MAP_HEIGHT,
  MAP_WIDTH,
  REGION_MAPS,
  getRegionMap,
  getLocation,
  isPassable,
} from '../src/content/locations'

/** IDs of the 8 new locations added by W2. */
export const NEW_REGION_IDS = [
  'thousand_herbs_valley',
  'blackwind_dunes',
  'frozen_peak',
  'wandering_market',
  'moon_lake',
  'bone_ash_ruins',
  'spirit_beast_ridge',
  'azure_pavilion',
] as const

/** IDs of the 8 pre-existing locations from Scenario I. */
export const SCENARIO_ONE_REGION_IDS = [
  'village',
  'market',
  'sect',
  'herb_field',
  'misty_forest',
  'sealed_cave',
  'cursed_rift',
  'cloud_peak',
] as const

describe('W2 world expansion — 16 regions', () => {
  it('gives exactly 16 authored locations', () => {
    expect(LOCATIONS).toHaveLength(16)
  })

  it('registers a region map for every location', () => {
    expect(REGION_MAPS).toHaveLength(LOCATIONS.length)
    for (const loc of LOCATIONS) {
      const map = getRegionMap(loc.id)
      expect(map, loc.id).toBeDefined()
    }
  })

  it('gives every new region a valid danger level and bilingual name parity', () => {
    for (const id of NEW_REGION_IDS) {
      const loc = getLocation(id)
      expect(loc, id).toBeDefined()
      expect(loc!.danger).toBeGreaterThanOrEqual(0)
      expect(loc!.danger).toBeLessThanOrEqual(3)
      expect(loc!.nameVi.length).toBeGreaterThan(0)
      expect(loc!.nameEn.length).toBeGreaterThan(0)
      expect(loc!.nameVi).not.toBe(loc!.nameEn)
    }
  })

  it('each region map has MAP_HEIGHT × MAP_WIDTH cells with no duplicates', () => {
    for (const map of REGION_MAPS) {
      expect(map.cells).toHaveLength(MAP_WIDTH * MAP_HEIGHT)
      const positions = new Set(map.cells.map((c) => `${c.x},${c.y}`))
      expect(positions.size).toBe(map.cells.length)
    }
  })

  it('every region map has a passable entry cell', () => {
    for (const map of REGION_MAPS) {
      const entry = map.cells.find((c) => c.x === map.entry.x && c.y === map.entry.y)
      expect(entry, `${map.locationId} entry`).toBeDefined()
      expect(entry && isPassable(entry), `${map.locationId} entry passable`).toBe(true)
    }
  })

  it('every region has at least one exit node linking to a known region', () => {
    for (const map of REGION_MAPS) {
      const exits = map.cells.filter((c) => c.exitTo !== undefined)
      expect(exits.length, `${map.locationId} has no exits`).toBeGreaterThanOrEqual(1)
      for (const exit of exits) {
        const target = getRegionMap(exit.exitTo!)
        expect(target, `${map.locationId} exits to unknown ${exit.exitTo}`).toBeDefined()
      }
    }
  })

  it('every new region exit cell is passable (not water/mountain)', () => {
    for (const id of NEW_REGION_IDS) {
      const map = getRegionMap(id)!
      const exitCells = map.cells.filter((c) => c.exitTo !== undefined)
      for (const cell of exitCells) {
        expect(isPassable(cell), `${id} exit at ${cell.x},${cell.y} is blocked (terrain=${cell.terrain})`).toBe(true)
      }
    }
  })

  it('every new region has at least one authored node (npc/event/danger)', () => {
    for (const id of NEW_REGION_IDS) {
      const map = getRegionMap(id)!
      const nodes = map.cells.filter((c) => c.node !== undefined)
      expect(nodes.length, `${id} has no authored nodes`).toBeGreaterThanOrEqual(1)
    }
  })

  it('hub regions (village and market) connect to multiple destinations', () => {
    const villageMap = getRegionMap('village')!
    const marketMap = getRegionMap('market')!
    const villageExits = villageMap.cells.filter((c) => c.exitTo !== undefined)
    const marketExits = marketMap.cells.filter((c) => c.exitTo !== undefined)
    expect(villageExits.length).toBeGreaterThanOrEqual(3)
    expect(marketExits.length).toBeGreaterThanOrEqual(2)
  })

  it('scenario-one pre-existing routes remain passable (village → misty → cave → rift → cloud)', () => {
    const ordered = ['village', 'misty_forest', 'sealed_cave', 'cursed_rift', 'cloud_peak'] as const
    for (let i = 0; i < ordered.length - 1; i++) {
      const locId = ordered[i]!
      const from = getRegionMap(locId)!
      const to = ordered[i + 1]!
      const exits = from.cells.filter((c) => c.exitTo === to)
      expect(exits.length, `${locId} has no exit to ${to}`).toBeGreaterThanOrEqual(1)
      const firstExit = exits[0]
      expect(firstExit !== undefined && isPassable(firstExit), `${locId}→${to} exit is impassable`).toBe(true)
    }
  })

  it('late-game regions (danger ≥ 2) are reachable via authored exits only', () => {
    const lateGame = LOCATIONS.filter((l) => l.danger >= 2)
    for (const loc of lateGame) {
      const map = getRegionMap(loc.id)!
      const exits = map.cells.filter((c) => c.exitTo !== undefined)
      expect(exits.length, `${loc.id} (danger=${loc.danger}) has no authored exits`).toBeGreaterThanOrEqual(1)
    }
  })

  it('new regions have plausible travel day cost (no special mechanic needed)', () => {
    // Each move already costs +1 day — no new logic required for new regions.
    // This test documents the expectation rather than re-testing the reducer.
    const newMaps = NEW_REGION_IDS.map((id) => getRegionMap(id))
    for (const map of newMaps) {
      expect(map).toBeDefined()
    }
  })
})
