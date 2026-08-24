import { validateGameState } from '../engine'
import type { GameState, Locale } from '../engine'

export const SESSION_KEY = 'phe-can-ky:save:v1'

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

export function loadSession(storage: SessionStorage): GameSession | null {
  const raw = storage.get(SESSION_KEY)
  if (typeof raw !== 'string') return null

  try {
    const candidate = JSON.parse(raw) as Partial<GameSession>
    if (candidate.locale !== 'vi' && candidate.locale !== 'en') return null
    if (!Array.isArray(candidate.chronicle) || !candidate.chronicle.every((line) => typeof line === 'string')) {
      return null
    }
    return {
      game: validateGameState(candidate.game),
      locale: candidate.locale,
      chronicle: candidate.chronicle.slice(-80),
    }
  } catch {
    return null
  }
}
