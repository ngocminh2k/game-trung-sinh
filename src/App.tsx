import { useEffect, useState } from 'react'
import { DEFAULT_SEED, applyAction, currentBeat, narrate, newGame } from './engine'
import type { Action, Locale } from './engine'
import { GameScreen } from './ui/GameScreen'
import { loadSession, saveSession, type GameSession } from './ui/session'

function freshSession(locale: Locale = 'vi'): GameSession {
  const game = newGame(DEFAULT_SEED)
  return {
    game,
    locale,
    chronicle: locale === 'vi'
      ? ['Ngươi tỉnh dậy ở làng Thanh Mộc. Linh căn cong queo vẫn còn, nhưng đường đời thì mới.']
      : ['You wake in Greenwood Village. The crooked spirit root remains, but the road is new.'],
  }
}

function initialSession(): GameSession {
  if (typeof window === 'undefined') return freshSession()
  return loadSession({
    get: (key) => window.localStorage.getItem(key),
    set: (key, value) => window.localStorage.setItem(key, value),
  }) ?? freshSession()
}

function App() {
  const [session, setSession] = useState<GameSession>(initialSession)

  useEffect(() => {
    saveSession({
      get: (key) => window.localStorage.getItem(key),
      set: (key, value) => window.localStorage.setItem(key, value),
    }, session)
  }, [session])

  const act = (action: Action) => {
    setSession((previous) => {
      const result = applyAction(previous.game, action)
      const lines = narrate(result.events, previous.locale)
      return {
        ...previous,
        game: result.state,
        chronicle: [...previous.chronicle, ...lines].slice(-80),
      }
    })
  }

  useEffect(() => {
    const movement: Record<string, Action> = {
      ArrowUp: { kind: 'move', direction: 'north' },
      w: { kind: 'move', direction: 'north' },
      ArrowDown: { kind: 'move', direction: 'south' },
      s: { kind: 'move', direction: 'south' },
      ArrowLeft: { kind: 'move', direction: 'west' },
      a: { kind: 'move', direction: 'west' },
      ArrowRight: { kind: 'move', direction: 'east' },
      d: { kind: 'move', direction: 'east' },
    }
    const handler = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return
      const move = movement[event.key]
      if (move !== undefined) {
        event.preventDefault()
        act(move)
        return
      }
      const choice = Number(event.key)
      if (choice >= 1 && choice <= 3) {
        const suggested = currentBeat(session.game).suggested[choice - 1]
        if (suggested !== undefined) {
          event.preventDefault()
          act(suggested)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [session.game])

  const changeLocale = (locale: Locale) => {
    setSession((previous) => ({ ...previous, locale }))
  }

  return <GameScreen game={session.game} locale={session.locale} chronicle={session.chronicle} onAction={act} onLocaleChange={changeLocale} />
}

export default App
