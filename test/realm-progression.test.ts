import { describe, expect, it } from 'vitest'
import {
  ATTRIBUTE_MAX,
  applyAction,
  minorRealmThreshold,
  newGame,
} from '../src/engine'

describe('minor realm breakthroughs', () => {
  it('awards two required attribute points after crossing a minor-realm threshold', () => {
    const base = newGame('minor-breakthrough')
    const threshold = minorRealmThreshold(base.player.stage, base.player.realmLevel)
    expect(threshold).not.toBeNull()
    const game = { ...base, player: { ...base.player, progress: threshold! - 1 } }
    const result = applyAction(game, { kind: 'train' })

    expect(result.state.player.realmLevel).toBe(2)
    expect(result.state.player.pendingAttributePoints).toBe(2)
    expect(result.events.some((event) => event.type === 'MINOR_REALM_ADVANCED')).toBe(true)
    expect(applyAction(result.state, { kind: 'move', direction: 'north' }).events).toEqual([{ type: 'ERROR', code: 'ATTRIBUTE_ALLOCATION_REQUIRED' }])
  })

  it('carries progress from rank nine into the next major realm', () => {
    const base = newGame('realm-carry')
    const threshold = minorRealmThreshold(0, 9)
    expect(threshold).not.toBeNull()
    const state = {
      ...base,
      player: { ...base.player, realmLevel: 9, progress: threshold! - 1 },
    }
    const result = applyAction(state, { kind: 'train' })

    expect(result.state.player.stage).toBe(1)
    expect(result.state.player.realmLevel).toBe(1)
    expect(result.state.player.pendingAttributePoints).toBe(2)
  })

  it('allocates a selected attribute without spending time or RNG', () => {
    const base = newGame('allocate')
    const state = { ...base, player: { ...base.player, pendingAttributePoints: 2 } }
    const result = applyAction(state, { kind: 'allocate_attribute', attribute: 'body' })

    expect(result.state.player.attrs.body).toBe(4)
    expect(result.state.player.pendingAttributePoints).toBe(1)
    expect(result.state.day).toBe(state.day)
    expect(result.state.rng).toBe(state.rng)
  })

  it('rejects allocations above the attribute cap', () => {
    const base = newGame('attribute-cap')
    const state = {
      ...base,
      player: {
        ...base.player,
        attrs: { ...base.player.attrs, body: ATTRIBUTE_MAX },
        pendingAttributePoints: 1,
      },
    }

    expect(applyAction(state, { kind: 'allocate_attribute', attribute: 'body' }).events)
      .toEqual([{ type: 'ERROR', code: 'ATTRIBUTE_MAXED' }])
  })
})
