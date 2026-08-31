import { describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import { loadSession, saveSession } from '../src/ui/session'

describe('browser game session', () => {
  it('round-trips the deterministic state and the chosen language', () => {
    const storage = new Map<string, string>()
    const game = newGame('ui-save-seed')

    saveSession(storage, { game, locale: 'en', chronicle: ['A new tale begins.'] })

    const result = loadSession(storage)
    expect(result.status).toBe('loaded')
    if (result.status === 'loaded') {
      expect(result.session).toEqual({
        game,
        locale: 'en',
        chronicle: ['A new tale begins.'],
      })
    }
  })

  it('rejects malformed saved data instead of letting it corrupt a run', () => {
    const storage = new Map<string, string>([['phe-can-ky:save:v1', '{not-json']])

    expect(loadSession(storage).status).toBe('rejected')
  })

  it('reports "missing" for an empty store rather than faking a loaded session', () => {
    const storage = new Map<string, string>()
    expect(loadSession(storage).status).toBe('missing')
  })

  it('rejects saves with invalid locale or chronicle shape without returning a session', () => {
    const badLocale = new Map<string, string>([
      ['phe-can-ky:save:v1', JSON.stringify({ game: { version: 1 }, locale: 'fr', chronicle: [] })],
    ])
    expect(loadSession(badLocale).status).toBe('rejected')

    const badChronicle = new Map<string, string>([
      ['phe-can-ky:save:v1', JSON.stringify({ game: { version: 1 }, locale: 'vi', chronicle: 'nope' })],
    ])
    expect(loadSession(badChronicle).status).toBe('rejected')
  })
})
