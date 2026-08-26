import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_SEED, applyAction, currentBeat, narrate, newGame } from './engine'
import type { Action, GameEvent, Locale } from './engine'
import { requestNarration } from './ai/narration'
import { GameScreen } from './ui/GameScreen'
import { loadSession, saveSession, type GameSession } from './ui/session'

function freshSession(locale: Locale = 'vi'): GameSession {
  const game = newGame(DEFAULT_SEED)
  return {
    game,
    locale,
    chronicle: locale === 'vi'
      ? ['Ngươi tỉnh dậy tại làng Thanh Mộc. Linh căn phế vẫn đó, nhưng kiếp này, con đường do chính ngươi chọn.']
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

export function visualActionFor(action: Action, events: GameEvent[]): Action['kind'] {
  if (action.kind !== 'free_text') return action.kind

  for (const event of [...events].reverse()) {
    switch (event.type) {
      case 'MOVED': return 'move'
      case 'RESTED': return 'rest'
      case 'TRAINED': return 'train'
      case 'GATHERED': return 'gather'
      case 'ITEM_USED':
      case 'WARD_USED': return 'use_item'
      case 'TALKED': return 'talk'
      case 'COMBAT_HIT':
        if (event.actor === 'player') return 'combat_attack'
        break
      case 'COMBAT_GUARDED': return 'combat_defend'
      case 'FORCED_CONVERGENCE': return event.action.kind
    }
  }

  return 'free_text'
}

function App() {
  const [session, setSession] = useState<GameSession>(initialSession)
  const [motion, setMotion] = useState<{ kind: Action['kind'] | null; nonce: number }>({ kind: null, nonce: 0 })
  const sessionRef = useRef(session)

  useEffect(() => {
    sessionRef.current = session
    saveSession({
      get: (key) => window.localStorage.getItem(key),
      set: (key, value) => window.localStorage.setItem(key, value),
    }, session)
  }, [session])

  const act = useCallback((action: Action) => {
    const previous = sessionRef.current
    const result = applyAction(previous.game, action)
    const next = {
      ...previous,
      game: result.state,
      chronicle: [...previous.chronicle, ...narrate(result.events, previous.locale)].slice(-80),
    }
    sessionRef.current = next
    setSession(next)
    const visualAction = visualActionFor(action, result.events)
    setMotion((current) => ({ kind: visualAction, nonce: current.nonce + 1 }))

    void requestNarration(result.state, result.events, previous.locale).then((line) => {
      if (line === null) return
      const current = sessionRef.current
      const narrated = { ...current, chronicle: [...current.chronicle, line].slice(-80) }
      sessionRef.current = narrated
      setSession(narrated)
    })
  }, [])

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
        const suggested = currentBeat(sessionRef.current.game).suggested[choice - 1]
        if (suggested !== undefined) {
          event.preventDefault()
          act(suggested)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [act])

  const changeLocale = useCallback((locale: Locale) => {
    const next = { ...sessionRef.current, locale }
    sessionRef.current = next
    setSession(next)
  }, [])

  return <GameScreen actionKind={motion.kind} actionNonce={motion.nonce} game={session.game} locale={session.locale} chronicle={session.chronicle} onAction={act} onLocaleChange={changeLocale} />
}

export default App
