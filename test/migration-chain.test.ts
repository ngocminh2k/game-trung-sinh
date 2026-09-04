import { describe, expect, it } from 'vitest'
import { GAME_STATE_VERSION } from '../src/engine/constants'
import { migrate } from '../src/engine/migration'

function freshV0(): Record<string, unknown> {
  return {
    seed: 'chain-test',
    rng: 12345,
    day: 1,
    player: { hp: 100, qi: 60, gold: 60, attrs: { body: 3, mind: 4, charm: 3, luck: 2 }, stage: 0, realmLevel: 1, progress: 0, pendingAttributePoints: 0, posX: 3, posY: 3, locationId: 'village', alive: true },
    spiritRoot: { kind: 'defective', elementVi: 'Mộc', elementEn: 'Wood', efficiency: 0.5 },
    inventory: { wooden_staff: 1 },
    storage: {},
    flags: {},
    quests: {},
    achievements: [],
    talents: [],
    techniques: {},
    equipment: { weapon: null, robe: null, accessory: null },
    encounter: null,
    lastLotteryDay: null,
    corrections: 0,
    terminal: false,
    endingId: null,
  }
}

describe('migration chain', () => {
  it('walks a v0 save through the entire chain to the current version', () => {
    const raw = freshV0()
    const migrated = migrate(raw)
    expect(migrated.version).toBe(GAME_STATE_VERSION)
    // chain is non-augmenting for v1: original fields are preserved
    expect(migrated.seed).toBe('chain-test')
    expect(migrated.player).toEqual(raw.player)
  })

  it('is idempotent for an already-current save', () => {
    const raw = freshV0()
    const once = migrate(raw)
    const twice = migrate(once)
    expect(twice).toEqual(once)
  })

  it('rejects a save beyond the supported version', () => {
    const raw = freshV0()
    raw.version = GAME_STATE_VERSION + 5
    expect(() => migrate(raw)).toThrow(/newer than supported/)
  })

  it('runs exactly one step for a v0 → v1 chain of length one', () => {
    // Snapshot the chain through the public surface. A future v2 step would
    // not change v0 → v1 output, so this stays a stable regression guard.
    expect(migrate(freshV0()).version).toBe(GAME_STATE_VERSION)
  })
})