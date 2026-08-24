import { describe, expect, it } from 'vitest'
import { HIGH_DANGER_LEVEL, applyAction, findPath, newGame } from '../src/engine'
import type { Direction, GameEvent, GameState } from '../src/engine'

function withTalisman(base: GameState): GameState {
  return { ...base, inventory: { ...base.inventory, warding_talisman: 1 } }
}

function walkTo(state: GameState, locationId: string): { state: GameState; events: GameEvent[] } {
  const path = findPath(state.player.posX, state.player.posY, locationId)
  if (path === null) throw new Error(`no path to ${locationId}`)
  let events: GameEvent[] = []
  for (const dir of path as Direction[]) {
    const result = applyAction(state, { kind: 'move', direction: dir })
    state = result.state
    events = result.events
    if (state.terminal) break
  }
  return { state, events }
}

describe('warding talismans are consumed only at high-danger locations', () => {
  it(`low-danger woods deal damage and never burn a talisman (threshold ${HIGH_DANGER_LEVEL})`, () => {
    const base = newGame('danger-forest')
    const { state, events } = walkTo(withTalisman(base), 'misty_forest')
    // Warning fires for any danger > 0...
    expect(events.some((e) => e.type === 'WARNING' && e.locationId === 'misty_forest')).toBe(true)
    // ...but a danger-1 location rolls damage instead of consuming the ward.
    expect(events.some((e) => e.type === 'WARD_USED')).toBe(false)
    expect(events.some((e) => e.type === 'DAMAGED')).toBe(true)
    expect(state.inventory['warding_talisman'] ?? 0).toBe(1)
    expect(state.player.alive).toBe(true)
  })

  it('the sealed cave consumes the talisman and deals no damage', () => {
    const base = newGame('danger-cave')
    const { state, events } = walkTo(withTalisman(base), 'sealed_cave')
    expect(events.some((e) => e.type === 'WARNING' && e.level >= HIGH_DANGER_LEVEL)).toBe(true)
    expect(events.some((e) => e.type === 'WARD_USED' && e.itemId === 'warding_talisman')).toBe(
      true,
    )
    expect(events.some((e) => e.type === 'DAMAGED')).toBe(false)
    expect(state.inventory['warding_talisman']).toBeUndefined()
    expect(state.flags['visitedCaveWarded']).toBe(true)
    expect(state.player.alive).toBe(true)
  })

  it('the cursed rift is warded the same way', () => {
    const base = newGame('danger-rift')
    const { state, events } = walkTo(withTalisman(base), 'cursed_rift')
    expect(events.some((e) => e.type === 'WARD_USED')).toBe(true)
    expect(events.some((e) => e.type === 'DAMAGED')).toBe(false)
    expect(state.player.alive).toBe(true)
  })

  it('high-danger locations without a talisman still roll damage', () => {
    const base = newGame('danger-unwarded')
    const { state, events } = walkTo(base, 'sealed_cave')
    expect(events.some((e) => e.type === 'WARD_USED')).toBe(false)
    expect(events.some((e) => e.type === 'DAMAGED')).toBe(true)
    expect(state.player.hp).toBeLessThan(newGame('danger-unwarded').player.hp)
  })
})
