import { describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import {
  canHibernate,
  enterHibernation,
  wakeFromHibernation,
  isHibernating,
  calculateHibernatedTime,
  HIBERNATE_MAX_DAYS,
  HIBERNATE_MAX_HOURS,
  HIBERNATE_MAX_MS,
} from '../src/engine/time'
import { calculateOfflineGains, applyOfflineGains } from '../src/engine/offline'
import { GameStateSchema } from '../src/engine/schema'
import { t } from '../src/i18n'
import type { GameSession } from '../src/ui/session'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const NOW = 1_700_000_000_000

function makeSession(): GameSession {
  return { game: newGame('hibernate-test'), locale: 'vi', chronicle: ['start'] }
}

const lineFor = (session: GameSession) => (hours: number, progress: number, frozenHours?: number) => {
  if (frozenHours && frozenHours > 0 && progress === 0) {
    return t(session.locale, 'ui.offline.hibernated', { hours: frozenHours })
  }
  if (frozenHours && frozenHours > 0 && progress > 0) {
    return t(session.locale, 'ui.offline.hibernatedWithProgress', {
      frozenHours,
      progressHours: hours,
      progress,
    })
  }
  return t(session.locale, 'ui.offline.gained', { hours, progress })
}

describe('C3-14: Cơ Chế Ngủ Đông (Hibernate)', () => {
  describe('Constants and Guards', () => {
    it('defines 7 days (168 hours) as the hibernation cap', () => {
      expect(HIBERNATE_MAX_DAYS).toBe(7)
      expect(HIBERNATE_MAX_HOURS).toBe(168)
      expect(HIBERNATE_MAX_MS).toBe(7 * 24 * 60 * 60 * 1000)
    })

    it('canHibernate returns true for healthy active player', () => {
      const state = newGame('test-guard')
      expect(canHibernate(state)).toBe(true)
    })

    it('canHibernate returns false if dead, terminal, in combat, or already hibernating', () => {
      const state = newGame('test-guard-fail')
      state.player.alive = false
      expect(canHibernate(state)).toBe(false)

      state.player.alive = true
      state.terminal = true
      expect(canHibernate(state)).toBe(false)

      state.terminal = false
      state.encounter = {
        enemyId: 'wolf',
        hp: 10,
        maxHp: 10,
        guard: 0,
      } as any
      expect(canHibernate(state)).toBe(false)

      state.encounter = null
      const hibernated = enterHibernation(state, NOW)
      expect(canHibernate(hibernated)).toBe(false)
    })
  })

  describe('enterHibernation and wakeFromHibernation', () => {
    it('enters hibernation and sets active flag and timestamp', () => {
      const state = newGame('test-enter')
      const next = enterHibernation(state, NOW)
      expect(isHibernating(next)).toBe(true)
      expect(next.hibernation?.active).toBe(true)
      expect(next.hibernation?.startedAt).toBe(NOW)
      // Immutable
      expect(isHibernating(state)).toBe(false)
    })

    it('wakes from hibernation and clears hibernation state', () => {
      const state = newGame('test-wake')
      const hibernated = enterHibernation(state, NOW)
      const awake = wakeFromHibernation(hibernated)
      expect(isHibernating(awake)).toBe(false)
      expect(awake.hibernation).toBeNull()
    })
  })

  describe('calculateHibernatedTime', () => {
    it('leaves elapsed time untouched when not hibernating', () => {
      const res = calculateHibernatedTime(10 * HOUR, false)
      expect(res).toEqual({ effectiveElapsedMs: 10 * HOUR, frozenMs: 0 })
    })

    it('completely freezes elapsed time up to 7 days', () => {
      const res3Days = calculateHibernatedTime(3 * DAY, true)
      expect(res3Days).toEqual({ effectiveElapsedMs: 0, frozenMs: 3 * DAY })

      const res7Days = calculateHibernatedTime(7 * DAY, true)
      expect(res7Days).toEqual({ effectiveElapsedMs: 0, frozenMs: 7 * DAY })
    })

    it('caps frozen duration at 7 days and lets excess time pass', () => {
      const res9Days = calculateHibernatedTime(9 * DAY, true)
      expect(res9Days.frozenMs).toBe(7 * DAY)
      expect(res9Days.effectiveElapsedMs).toBe(2 * DAY)
    })
  })

  describe('calculateOfflineGains with hibernation', () => {
    it('returns frozenHours and 0 progress when away under 7 days while hibernating', () => {
      const res = calculateOfflineGains(NOW - 5 * DAY, NOW, true)
      expect(res).toEqual({
        hoursAway: 0,
        progressGain: 0,
        frozenHours: 5 * 24,
      })
    })

    it('calculates progress only for elapsed time exceeding 7 days', () => {
      // 8 days away: 7 days frozen (168h), 1 day (24h) effective progress
      const res = calculateOfflineGains(NOW - 8 * DAY, NOW, true)
      expect(res).toEqual({
        hoursAway: 24,
        progressGain: 24,
        frozenHours: 168,
      })
    })

    it('returns frozenHours even for short absences when hibernating', () => {
      const res = calculateOfflineGains(NOW - 2 * HOUR, NOW, true)
      expect(res).toEqual({
        hoursAway: 0,
        progressGain: 0,
        frozenHours: 2,
      })
    })
  })

  describe('applyOfflineGains with hibernation', () => {
    it('wakes player from hibernation and appends frozen chronicle line', () => {
      const session = makeSession()
      session.game = enterHibernation(session.game, NOW - 3 * DAY)

      const result = applyOfflineGains(session, 3 * DAY, NOW, lineFor(session))
      expect(result.gains).not.toBeNull()
      expect(result.gains?.frozenHours).toBe(72)
      expect(result.gains?.progress).toBe(0)
      expect(isHibernating(result.session.game)).toBe(false)
      expect(result.session.chronicle).toHaveLength(2)
      expect(result.session.chronicle[1]).toContain('72')
      expect(result.session.chronicle[1]).toContain('ngủ đông')
    })

    it('applies progress for excess time and logs both frozen hours and progress in English', () => {
      const session = makeSession()
      session.locale = 'en'
      session.game = enterHibernation(session.game, NOW - 8 * DAY)

      const result = applyOfflineGains(session, 8 * DAY, NOW, lineFor(session))
      expect(result.gains).not.toBeNull()
      expect(result.gains?.frozenHours).toBe(168)
      expect(result.gains?.progress).toBe(24)
      expect(isHibernating(result.session.game)).toBe(false)
      expect(result.session.chronicle[1]).toContain('168')
      expect(result.session.chronicle[1]).toContain('hibernation')
      expect(result.session.chronicle[1]).toContain('24')
    })
  })

  describe('GameStateSchema & Persistence', () => {
    it('parses valid hibernation state from raw save', () => {
      const raw = {
        ...newGame('schema-hib'),
        hibernation: {
          active: true,
          startedAt: 123456789,
        },
      }
      const parsed = GameStateSchema.parse(raw)
      expect(parsed.hibernation).toEqual({
        active: true,
        startedAt: 123456789,
      })
    })

    it('defaults hibernation to null when missing in older saves', () => {
      const raw = newGame('schema-old')
      delete (raw as any).hibernation
      const parsed = GameStateSchema.parse(raw)
      expect(parsed.hibernation).toBeNull()
    })
  })
})
