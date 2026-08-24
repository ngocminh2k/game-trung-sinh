import { describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import { loadSession, saveSession } from '../src/ui/session'

describe('browser game session', () => {
  it('round-trips the deterministic state and the chosen language', () => {
    const storage = new Map<string, string>()
    const game = newGame('ui-save-seed')

    saveSession(storage, { game, locale: 'en', chronicle: ['A new tale begins.'] })

    expect(loadSession(storage)).toEqual({
      game,
      locale: 'en',
      chronicle: ['A new tale begins.'],
    })
  })

  it('rejects malformed or stale saved data instead of letting it corrupt a run', () => {
    const storage = new Map<string, string>([['phe-can-ky:save:v1', '{not-json']])

    expect(loadSession(storage)).toBeNull()
  })
})
