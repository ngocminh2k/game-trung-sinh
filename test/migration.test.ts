import { describe, expect, it } from 'vitest'
import { GAME_STATE_VERSION } from '../src/engine/constants'
import { migrate, migrateGameState } from '../src/engine/migration'
import { newGame } from '../src/engine'

function freshSave(): Record<string, unknown> {
  return JSON.parse(JSON.stringify(newGame('migration-test'))) as Record<string, unknown>
}

describe('migrate', () => {
  it('upgrades a version-less save to GAME_STATE_VERSION', () => {
    const raw = freshSave()
    delete raw['version']
    const migrated = migrate(raw) as { version: number; seed: string }
    expect(migrated.version).toBe(GAME_STATE_VERSION)
    expect(migrated.seed).toBe('migration-test')
  })

  it('rejects a save whose version is newer than supported', () => {
    const raw = freshSave()
    raw['version'] = GAME_STATE_VERSION + 1
    expect(() => migrate(raw)).toThrow(/newer than supported/)
  })

  it('rejects non-object payloads', () => {
    expect(() => migrate(null)).toThrow(/object/)
    expect(() => migrate('not-an-object')).toThrow(/object/)
    expect(() => migrate([1, 2])).toThrow(/object/)
  })
})

describe('migrateGameState', () => {
  it('returns a fully parsed GameState (not an unsafe cast)', () => {
    // Schema defaults (silver, spiritStones, equipment, encounter=null, …) are
    // only applied by GameStateSchema.parse — migrateGameState must run it.
    const raw = freshSave()
    delete raw['version']
    const migrated = migrateGameState(raw)
    expect(migrated.version).toBe(GAME_STATE_VERSION)
    expect(migrated.player.alive).toBe(true)
    expect(typeof migrated.equipment.weapon === 'string' || migrated.equipment.weapon === null).toBe(true)
    expect(migrated.encounter).toBeNull()
    expect(migrated.player.silver).toBe(0)
    expect(migrated.player.spiritStones).toBe(0)
  })

  it('throws on a payload the schema cannot parse', () => {
    // Unknown extra fields are allowed by the schema; only a true shape
    // mismatch (e.g. player.hp = "abc") should fail. mutate raw to break shape.
    const raw = freshSave()
    ;(raw as Record<string, unknown>)['player'] = { ...((raw as Record<string, unknown>)['player'] as object), hp: 'not-a-number' }
    expect(() => migrateGameState(raw)).toThrow()
  })
})
