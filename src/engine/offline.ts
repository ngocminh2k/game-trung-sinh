import { ATTRIBUTE_POINTS_PER_BREAKTHROUGH } from './constants'
import { applyProgress } from './stats'
import { calculateHibernatedTime } from './time'
import type { GameState } from './types'

// Issue #14 (AC3): reward returning players for time away. 1 progress/hour
// intentionally mirrors ~0.25 training sessions: TRAIN_BASE_PROGRESS=4 and
// stage-0 thresholds are 2 apiece, so 25/hr would catapult a fresh cultivator
// past MAX_STAGE on a single absence. The 72h cap keeps a month-long break
// from trivializing the whole early game.
//
// Pure session helper — NOT a reducer action — so no Action/GameEvent union
// bloat, no execAction switch arm, no narrator TEMPLATES, and no fight with
// the terminal guard. `finalize()` re-runs newlyQualifiedAchievements on the
// next real action, so breakthrough achievements from the offline gain still
// fire then. The chronicle line IS the notification (user decision 2026-09-11:
// no modal/toast).
export const OFFLINE_MIN_MS = 4 * 60 * 60 * 1000
export const OFFLINE_CAP_MS = 72 * 60 * 60 * 1000
export const OFFLINE_PROGRESS_PER_HOUR = 1

export interface OfflineGains {
  hoursAway: number
  progress: number
  breakthroughs: number
  frozenHours?: number
}

// Minimal shape the helper needs; a full GameSession satisfies it structurally
// (keeping engine free of the ui/ layer). Deliberately locale-free — the chronicle
// line arrives pre-localized via `lineFor`. chronicleKinds is carried alongside
// chronicle when present so the parallel array stays aligned.
export interface OfflineSession {
  game: GameState
  chronicle: string[]
  chronicleKinds?: string[]
}

/** Whole-hour progress between two timestamps, accounting for hibernation freezing. */
export function calculateOfflineGains(
  lastSavedAt: number,
  now: number,
  hibernating: boolean = false,
): { hoursAway: number; progressGain: number; frozenHours?: number } | null {
  const elapsedMs = Math.max(0, now - lastSavedAt)
  if (elapsedMs <= 0) return null
  const { effectiveElapsedMs, frozenMs } = calculateHibernatedTime(elapsedMs, hibernating)
  const frozenHours = Math.floor(frozenMs / (60 * 60 * 1000))

  if (effectiveElapsedMs < OFFLINE_MIN_MS) {
    return frozenHours > 0 ? { hoursAway: 0, progressGain: 0, frozenHours } : null
  }
  const hoursAway = Math.floor(Math.min(effectiveElapsedMs, OFFLINE_CAP_MS) / (60 * 60 * 1000))
  return {
    hoursAway,
    progressGain: hoursAway * OFFLINE_PROGRESS_PER_HOUR,
    ...(frozenHours > 0 ? { frozenHours } : {}),
  }
}

/** Settle one slot-load: applies realm cascade + attribute points, appends the
 *  chronicle line built by `lineFor`. The engine stays locale-free (no i18n
 *  import — caller injects the localized line, review #28 LOW). Terminal games
 *  and short absences pass through untouched (gains null, no line built). */
export function applyOfflineGains<T extends OfflineSession>(
  session: T,
  elapsedMs: number,
  now: number,
  lineFor: (hoursAway: number, progress: number, frozenHours?: number) => string,
): { session: T; gains: OfflineGains | null } {
  const hibernating = session.game.hibernation?.active === true
  if (session.game.terminal || (elapsedMs < OFFLINE_MIN_MS && !hibernating)) {
    return { session, gains: null }
  }
  const calc = calculateOfflineGains(now - elapsedMs, now, hibernating)
  if (calc === null) return { session, gains: null }

  const advanced = applyProgress(session.game, calc.progressGain)
  const pointsGranted = advanced.breakthroughs * ATTRIBUTE_POINTS_PER_BREAKTHROUGH
  const gains: OfflineGains = {
    hoursAway: calc.hoursAway,
    progress: calc.progressGain,
    breakthroughs: advanced.breakthroughs,
    frozenHours: calc.frozenHours,
  }
  return {
    session: {
      ...session,
      game: {
        ...session.game,
        hibernation: null, // wake up upon return
        player: {
          ...session.game.player,
          stage: advanced.stage,
          realmLevel: advanced.realmLevel,
          progress: advanced.progress,
          pendingAttributePoints:
            session.game.player.pendingAttributePoints + pointsGranted,
        },
      },
      // Append (newest last, like act()) and keep chronicleKinds index-aligned
      // with chronicle — the feed colors each line by its kind at that index.
      // 'trained' reuses the existing cultivation-gain styling.
      chronicle: [...session.chronicle, lineFor(calc.hoursAway, calc.progressGain, calc.frozenHours)],
      ...(session.chronicleKinds === undefined
        ? {}
        : { chronicleKinds: [...session.chronicleKinds, 'trained'] }),
    },
    gains,
  }
}
