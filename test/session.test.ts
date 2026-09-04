import { describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import { loadSession, saveSession } from '../src/ui/session'

describe('browser game session', () => {
  it('round-trips the deterministic state and the chosen language', () => {
    const storage = new Map<string, string>()
    const game = newGame('ui-save-seed')

    saveSession(storage, { game, locale: 'en', chronicle: ['A new tale begins.'] })

    // The schema parser fills migration-safe expansion defaults that newGame
    // intentionally omits, so the round-trip is compared field-by-field.
    const loaded = loadSession(storage)
    expect(loaded).not.toBeNull()
    expect(loaded!.locale).toBe('en')
    expect(loaded!.chronicle).toEqual(['A new tale begins.'])
    // The schema parser fills migration-safe defaults (silver/spiritStones) that
    // newGame omits, so compare the authored fields plus the safe defaults.
    const p = loaded!.game.player
    expect({ ...p, silver: undefined, spiritStones: undefined, poison: undefined }).toEqual(game.player)
    expect(p.silver).toBe(0)
    expect(p.spiritStones).toBe(0)
    expect(loaded!.game.rng).toBe(game.rng)
    expect(loaded!.game.day).toBe(game.day)
  })

  it('rejects malformed or stale saved data instead of letting it corrupt a run', () => {
    const storage = new Map<string, string>([['phe-can-ky:save:v1', '{not-json']])

    expect(loadSession(storage)).toBeNull()
  })
})
