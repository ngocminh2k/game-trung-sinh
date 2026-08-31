import { validateGameState } from '../engine'
import type { GameState, Locale } from '../engine'

export const SESSION_KEY = 'phe-can-ky:save:v1'
export const SESSION_ORPHAN_KEY = 'phe-can-ky:save:v1:orphaned'

export interface GameSession {
  game: GameState
  locale: Locale
  chronicle: string[]
}

export interface SessionStorage {
  get(key: string): string | null | undefined
  set(key: string, value: string): unknown
}

export function saveSession(storage: SessionStorage, session: GameSession): void {
  storage.set(SESSION_KEY, JSON.stringify(session))
}

/** Discriminated load result so a rejected save is never silently mistaken
 * for a missing one (which would let a fresh run overwrite the old save). */
export type LoadResult =
  | { status: 'loaded'; session: GameSession }
  | { status: 'missing' }
  | { status: 'rejected' }

export function loadSession(storage: SessionStorage): LoadResult {
  const raw = storage.get(SESSION_KEY)
  if (typeof raw !== 'string') return { status: 'missing' }

  try {
    const candidate = JSON.parse(raw) as Partial<GameSession>
    if (candidate.locale !== 'vi' && candidate.locale !== 'en') return { status: 'rejected' }
    if (!Array.isArray(candidate.chronicle) || !candidate.chronicle.every((line) => typeof line === 'string')) {
      return { status: 'rejected' }
    }
    return {
      status: 'loaded',
      session: {
        game: validateGameState(candidate.game),
        locale: candidate.locale,
        chronicle: candidate.chronicle.slice(-80),
      },
    }
  } catch {
    return { status: 'rejected' }
  }
}
