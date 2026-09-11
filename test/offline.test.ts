import { describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import { calculateOfflineGains, applyOfflineGains } from '../src/engine/offline'
import type { GameSession } from '../src/ui/session'

const HOUR = 60 * 60 * 1000
// Fixed clock so the pure helper stays deterministic; the caller (UI) supplies
// this in production.
const NOW = 1_700_000_000_000

function makeSession(): GameSession {
  return { game: newGame('offline-test'), locale: 'vi', chronicle: ['start'] }
}

describe('calculateOfflineGains (issue #14 — AC3)', () => {
  it('returns null when away < 4 hours', () => {
    expect(calculateOfflineGains(NOW - 3 * HOUR, NOW)).toBeNull()
  })

  it('returns 4 progress for exactly 4 hours', () => {
    const result = calculateOfflineGains(NOW - 4 * HOUR, NOW)
    expect(result).toEqual({ hoursAway: 4, progressGain: 4 })
  })

  it('scales linearly: 10 hours → 10 progress', () => {
    expect(calculateOfflineGains(NOW - 10 * HOUR, NOW)).toEqual({ hoursAway: 10, progressGain: 10 })
  })

  it('caps at 72 hours', () => {
    const result = calculateOfflineGains(NOW - 100 * HOUR, NOW)
    expect(result).toEqual({ hoursAway: 72, progressGain: 72 })
  })
})

describe('applyOfflineGains (issue #14 — AC3)', () => {
  it('returns untouched session on a terminal game', () => {
    const session = makeSession()
    session.game.terminal = true
    const result = applyOfflineGains(session, 10 * HOUR, NOW)
    expect(result.gains).toBeNull()
    expect(result.session).toBe(session)
  })

  it('returns untouched session when elapsed < OFFLINE_MIN_MS', () => {
    const session = makeSession()
    const result = applyOfflineGains(session, 2 * HOUR, NOW)
    expect(result.gains).toBeNull()
  })

  it('appends a Vietnamese chronicle line, newest last', () => {
    const session = makeSession()
    const result = applyOfflineGains(session, 8 * HOUR, NOW)
    expect(result.gains).not.toBeNull()
    expect(result.gains!.progress).toBe(8)
    expect(result.session.chronicle).toHaveLength(2)
    expect(result.session.chronicle[0]).toBe('start') // old chronicle untouched at the front
    expect(result.session.chronicle[1]).toContain('8') // offline line appended last
  })

  it('keeps chronicleKinds index-aligned when present', () => {
    const session = makeSession()
    session.chronicleKinds = ['game_started']
    const result = applyOfflineGains(session, 8 * HOUR, NOW)
    expect(result.session.chronicleKinds).toEqual(['game_started', 'trained'])
  })

  it('applies English chronicle line when locale is en', () => {
    const session = makeSession()
    session.locale = 'en'
    const result = applyOfflineGains(session, 6 * HOUR, NOW)
    expect(result.session.chronicle[1]).toContain('6')
    expect(result.session.chronicle[1]).toContain('hour')
  })

  it('increments pendingAttributePoints on breakthroughs', () => {
    // Fresh state: stage 0, realmLevel 1, progress 0.
    // Stage-0 minor-realm thresholds are all 2. 8 progress → 4 breakthroughs
    // at 2pts each = 8 pendingAttributePoints.
    const session = makeSession()
    const result = applyOfflineGains(session, 8 * HOUR, NOW)
    expect(result.gains!.breakthroughs).toBeGreaterThan(0)
    expect(result.session.game.player.pendingAttributePoints).toBe(
      result.gains!.breakthroughs * 2,
    )
  })
})
