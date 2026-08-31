import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_SEED, applyAction, currentStoryScene, narrate, newGame, storyRouteEncounter } from './engine'
import type { Action, GameEvent, Locale } from './engine'
import { requestNarration } from './ai/narration'
import { GameScreen } from './ui/GameScreen'
import { LoadingScreen } from './ui/LoadingScreen'
import { SESSION_KEY, SESSION_ORPHAN_KEY, loadSession, saveSession, type GameSession } from './ui/session'
import './ui/screens.css'

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

function loadInitialSession(): { session: GameSession; recoveredFrom: string | null } {
  if (typeof window === 'undefined') return { session: freshSession(), recoveredFrom: null }
  const storage = {
    get: (key: string) => window.localStorage.getItem(key),
    set: (key: string, value: string) => window.localStorage.setItem(key, value),
  }
  const result = loadSession(storage)
  if (result.status === 'loaded') return { session: result.session, recoveredFrom: null }
  // Back up any rejected blob before it can be clobbered. If a user wants to
  // continue their old run, they can still read the orphaned key.
  if (result.status === 'rejected') {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (raw !== null) window.localStorage.setItem(SESSION_ORPHAN_KEY, raw)
    return { session: freshSession(), recoveredFrom: SESSION_ORPHAN_KEY }
  }
  return { session: freshSession(), recoveredFrom: null }
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
    }
  }

  return 'free_text'
}

function App() {
  const [session, setSession] = useState<GameSession>(() => {
    const init = loadInitialSession()
    // Session was recovered from an orphaned rejected blob; keep that info
    // in the session's chronicle header so the player knows what happened.
    return init.session
  })
  const [motion, setMotion] = useState<{ kind: Action['kind'] | null; nonce: number }>({ kind: null, nonce: 0 })
  const [phase, setPhase] = useState<'loading' | 'playing'>('loading')
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
      if (storyRouteEncounter(sessionRef.current.game) !== undefined && (move !== undefined || /^[1-3]$/.test(event.key))) {
        event.preventDefault()
        return
      }
      if (move !== undefined) {
        event.preventDefault()
        act(move)
        return
      }
      const choice = Number(event.key)
      if (choice >= 1 && choice <= 3) {
        const storyChoice = currentStoryScene(sessionRef.current.game).choices[choice - 1]
        if (storyChoice !== undefined) {
          event.preventDefault()
          act({ kind: 'story_choice', choiceId: storyChoice.id })
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

  const restart = useCallback(() => {
    const fresh = freshSession(sessionRef.current.locale)
    sessionRef.current = fresh
    setSession(fresh)
    setPhase('loading')
  }, [])

  if (phase === 'loading') {
    return <LoadingScreen locale={session.locale} onDone={() => setPhase('playing')} />
  }

  return <GameScreen actionKind={motion.kind} actionNonce={motion.nonce} game={session.game} locale={session.locale} chronicle={session.chronicle} onAction={act} onLocaleChange={changeLocale} onRestart={restart} />
}

export default App
