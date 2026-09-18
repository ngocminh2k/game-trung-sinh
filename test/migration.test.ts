import { describe, expect, it } from 'vitest'
import { FLAG_QUEST_DONE } from '../src/content/flag-keys'
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

  // v1 → v2 (reviewer-chain MEDIUM-1): saves written by the transient buggy
  // build carry quest-done flags with the double-underscore suffix
  // (`quest_<id>__done`) that no reader accepts — the chain deadlocked on
  // them. The migration renames them to the canonical single-underscore
  // key. NOTE: the legacy suffix is composed from FLAG_QUEST_DONE, never a
  // literal — see the writer tripwire in test/system-quest-chain.test.ts.
  const QUEST_ID = 'q_sys_assassin_04'
  const LEGACY_DONE = `quest_${QUEST_ID}_${FLAG_QUEST_DONE}` // `quest_x__done`: an extra `_` before the suffix
  const CANONICAL_DONE = `quest_${QUEST_ID}${FLAG_QUEST_DONE}` // `quest_x_done`

  it('renames double-underscore quest-done flags to the canonical key', () => {
    const raw = freshSave()
    raw['version'] = 1
    raw['flags'] = { [LEGACY_DONE]: true, quest_herb_intro: 1 }
    const migrated = migrate(raw)
    const flags = migrated['flags'] as Record<string, unknown>
    expect(flags[CANONICAL_DONE]).toBe(true)
    expect(LEGACY_DONE in flags).toBe(false)
    // unrelated flags are untouched
    expect(flags['quest_herb_intro']).toBe(1)
    expect(migrated['version']).toBe(GAME_STATE_VERSION)
  })

  it('done-wins when the buggy save has both spellings', () => {
    const raw = freshSave()
    raw['version'] = 1
    raw['flags'] = { [LEGACY_DONE]: true, [CANONICAL_DONE]: false }
    const flags = migrate(raw)['flags'] as Record<string, unknown>
    expect(flags[CANONICAL_DONE]).toBe(true)
    expect(LEGACY_DONE in flags).toBe(false)
  })

  it('migrates the flag rename through migrateGameState (schema-valid)', () => {
    const raw = freshSave()
    raw['version'] = 1
    raw['flags'] = { [LEGACY_DONE]: true }
    const migrated = migrateGameState(raw)
    expect(migrated.flags[CANONICAL_DONE]).toBe(true)
    expect(LEGACY_DONE in migrated.flags).toBe(false)
  })

  it('rejects non-object payloads', () => {
    expect(() => migrate(null)).toThrow(/object/)
    expect(() => migrate('not-an-object')).toThrow(/object/)
    expect(() => migrate([1, 2])).toThrow(/object/)
  })

  // C3-01 (Ticket C2-01): v1→v2 must reconcile the quest RUNTIME too. A legacy
  // save can carry the canonical done flag (`quest_<id>_done`) while
  // `raw.quests[id].status` still reads `'active'` — the dual-source-of-truth
  // desync that resurrects completed quests in the objective line and journal.
  // After migrate, a done-flagged quest must report status 'completed'.
  it('reconciles a done-flagged quest runtime to completed on migrate', () => {
    const raw = freshSave()
    raw['version'] = 1
    raw['flags'] = { quest_q_herb_delivery_done: true }
    raw['quests'] = { q_herb_delivery: { status: 'active', step: 0 } }
    const migrated = migrate(raw)
    const quests = migrated['quests'] as Record<string, { status: string }>
    expect(quests['q_herb_delivery']!.status).toBe('completed')
    expect(migrated['version']).toBe(GAME_STATE_VERSION)
  })

  it('leaves a genuinely-active quest untouched when no done flag exists', () => {
    const raw = freshSave()
    raw['version'] = 1
    raw['quests'] = { q_herb_delivery: { status: 'active', step: 1 } }
    const migrated = migrate(raw)
    const quests = migrated['quests'] as Record<string, { status: string; step: number }>
    expect(quests['q_herb_delivery']!.status).toBe('active')
    expect(quests['q_herb_delivery']!.step).toBe(1)
  })
})

describe('migrateGameState', () => {
  it('returns a fully parsed GameState (not an unsafe cast)', () => {
    // Schema defaults (silver, spiritStones, equipment, encounter=null, …) are
    // only applied by GameStateSchema.parse — migrateGameState must run it.
    const raw = freshSave()
    delete raw['version']
    // Simulate a true pre-silver save so the default-filling is exercised.
    const player = raw['player'] as Record<string, unknown>
    delete player['silver']
    delete player['spiritStones']
    // pr/4's time-of-day clock is an additive top-level field: a pre-clock save
    // must get the schema default rather than fail to parse.
    delete raw['timeOfDay']
    const migrated = migrateGameState(raw)
    expect(migrated.version).toBe(GAME_STATE_VERSION)
    expect(migrated.timeOfDay).toBe('sang')
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
