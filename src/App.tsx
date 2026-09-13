import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_GLOBAL_PROFILE, DEFAULT_SEED, applyAction, applyOfflineGains, chooseInheritedRelic, currentStoryScene, mergeGlobalProfile, narrate, newGame, readDeathCause, recordTerminal, storyRouteEncounter } from './engine'
import type { Action, GameDifficulty, GameEvent, GameState, GlobalProfile, Locale } from './engine'
import { ENDINGS } from './content'
import { requestNarration } from './ai/narration'
import { t } from './i18n'
import { GameScreen } from './ui/GameScreen'
import { LoadingScreen } from './ui/LoadingScreen'
import { MainMenu, NewGameScreen, SettingsScreen } from './ui/MainMenu'
import {
  SLOT_IDS,
  DEFAULT_SETTINGS,
  deleteSaveSlot,
  getActiveSlot,
  loadGlobalProfile,
  loadSaveSlots,
  loadSettings,
  saveGlobalProfile,
  saveSettings,
  saveSlot,
  setActiveSlot,
  shouldAutoSave,
  type GameSession,
  type PlayerSettings,
  type SaveSlot,
  type SessionStorage,
  type SlotId,
} from './ui/session'
import { soundEngine } from './ui/audio/soundEngine'
import { closeRun, saveFeedback, startRun, recordStep, type PlaytestSurvey } from './ui/playtest'
import { PlaytestSurveyCard } from './ui/PlaytestSurveyCard'
import './ui/screens.css'

function browserStorage(): SessionStorage {
  return {
    get: (key) => window.localStorage.getItem(key),
    set: (key, value) => window.localStorage.setItem(key, value),
    remove: (key) => window.localStorage.removeItem(key),
  }
}

function freshSession(
  locale: Locale = 'vi',
  options: {
    systemId?: string | null
    difficulty?: GameDifficulty
    legacyCause?: string | null
    ngPlusLevel?: number
    inheritedRelicId?: string | null
  } = {},
): GameSession {
  // Pre-menu new games carry the System pick straight into the state and open
  // on the first authored scene — no boot-story actions, no days spent.
  const { legacyCause, ngPlusLevel, inheritedRelicId, ...gameOptions } = options
  const game = gameOptions.systemId === undefined
    ? newGame(DEFAULT_SEED, { legacyCause, ngPlusLevel, inheritedRelicId })
    : newGame(DEFAULT_SEED, { ...gameOptions, difficulty: gameOptions.difficulty ?? 'balanced', storyScene: 'letter_at_dawn', legacyCause, ngPlusLevel, inheritedRelicId })
  return {
    game,
    locale,
    chronicle: locale === 'vi'
      ? ['Ngươi tỉnh dậy tại làng Thanh Mộc. Linh căn phế vẫn đó, nhưng kiếp này, con đường do chính ngươi chọn.']
      : ['You wake in Greenwood Village. The crooked spirit root remains, but the road is new.'],
  }
}

function relativeTime(locale: Locale, savedAt: number): string {
  const elapsed = Math.max(0, Date.now() - savedAt)
  if (elapsed < 60_000) return t(locale, 'ui.saveSlots.justNow')
  const minutes = Math.floor(elapsed / 60_000)
  if (minutes < 60) return t(locale, 'ui.saveSlots.minutesAgo', { count: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return t(locale, 'ui.saveSlots.hoursAgo', { count: hours })
  return t(locale, 'ui.saveSlots.daysAgo', { count: Math.floor(hours / 24) })
}

interface SaveSlotsScreenProps {
  slots: Partial<Record<SlotId, SaveSlot>>
  locale: Locale
  onSelect: (slotId: SlotId) => void
  onDelete: (slotId: SlotId) => void
}

function SaveSlotsScreen({ slots, locale, onSelect, onDelete }: SaveSlotsScreenProps) {
  const [confirming, setConfirming] = useState<SlotId | null>(null)
  const moveFocus = (slotId: SlotId, offset: number) => {
    const index = SLOT_IDS.indexOf(slotId)
    const next = SLOT_IDS[(index + offset + SLOT_IDS.length) % SLOT_IDS.length]!
    document.querySelector<HTMLButtonElement>(`[data-save-slot="${next}"]`)?.focus()
  }

  return <main className="save-slots-screen" data-testid="save-slots-screen" aria-labelledby="save-slots-title">
    <section className="save-slots-panel">
      <p className="save-slots-kicker">{t(locale, 'common.appName')}</p>
      <h1 id="save-slots-title">{t(locale, 'ui.saveSlots.title')}</h1>
      <p className="save-slots-subtitle">{t(locale, 'ui.saveSlots.subtitle')}</p>
      <div className="save-slots-list" role="list">
        {SLOT_IDS.map((slotId) => {
          const slot = slots[slotId]
          const ending = slot?.session.game.endingId === null || slot === undefined ? undefined : ENDINGS.find((entry) => entry.id === slot.session.game.endingId)
          return <article className="save-slot" role="listitem" key={slotId}>
            <button
              className="save-slot-main"
              data-save-slot={slotId}
              data-testid={`save-slot-${slotId}`}
              onClick={() => onSelect(slotId)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') { event.preventDefault(); moveFocus(slotId, -1) }
                if (event.key === 'ArrowDown' || event.key === 'ArrowRight') { event.preventDefault(); moveFocus(slotId, 1) }
              }}
            >
              <span className="save-slot-number">{t(locale, 'ui.saveSlots.slotName', { slot: slotId })}</span>
              {slot !== undefined && (slot.session.game.ngPlusLevel ?? 0) > 0 && <span className="save-slot-ngplus">{t(locale, 'ui.ngPlus.badge', { level: slot.session.game.ngPlusLevel ?? 0 })}</span>}
              {slot === undefined
                ? <span className="save-slot-empty">{t(locale, 'ui.saveSlots.empty')}</span>
                : <span className="save-slot-meta">
                    <span>{t(locale, 'ui.saveSlots.day', { day: slot.session.game.day })} · {t(locale, `stages.s${slot.session.game.player.stage}`)}</span>
                    {ending !== undefined && <span>{t(locale, 'ui.saveSlots.ending', { ending: locale === 'vi' ? ending.nameVi : ending.nameEn })}</span>}
                    <span>{t(locale, 'ui.saveSlots.saved', { time: relativeTime(locale, slot.savedAt) })}</span>
                  </span>}
              <strong>{t(locale, slot === undefined ? 'ui.saveSlots.start' : 'ui.saveSlots.continue')}</strong>
            </button>
            {slot !== undefined && <button className="save-slot-delete" data-confirming={confirming === slotId} aria-label={t(locale, confirming === slotId ? 'ui.saveSlots.deleteConfirm' : 'ui.saveSlots.delete')} onClick={() => {
              if (confirming === slotId) { onDelete(slotId); setConfirming(null) } else setConfirming(slotId)
            }}>{t(locale, confirming === slotId ? 'ui.saveSlots.deleteConfirm' : 'ui.saveSlots.delete')}</button>}
          </article>
        })}
      </div>
    </section>
  </main>
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

function firstFreeSlot(slots: Partial<Record<SlotId, SaveSlot>>): SlotId {
  return SLOT_IDS.find((slotId) => slots[slotId] === undefined) ?? 1
}

/** True while a save still sits in the boot story (transmigration / system
 *  choice) and the player never refused the System — resume must reopen it. */
function opensOnBootScene(game: GameState): boolean {
  const scene = currentStoryScene(game).id
  return game.flags.system_refused !== true && (scene === 'scene_transmigration' || scene === 'scene_system_selection')
}

/** New Game with every slot occupied: 0 is not a real slot — it means "ask
 *  the player which save to overwrite" and routes through the slots screen. */
const NEED_SLOT = 0 as unknown as SlotId

function App() {
  const storage = typeof window === 'undefined' ? undefined : browserStorage()
  const [settings, setSettings] = useState<PlayerSettings>(() => storage === undefined ? { ...DEFAULT_SETTINGS } : loadSettings(storage))
  const [slots, setSlots] = useState<Partial<Record<SlotId, SaveSlot>>>(() => storage === undefined ? {} : loadSaveSlots(storage))
  const [activeSlot, setActiveSlotState] = useState<SlotId | null>(() => storage === undefined ? null : getActiveSlot(storage))
  // Issue #17: F5 resumes the active run instead of dropping to the menu —
  // mirrors the occupied-slot branch of selectSlot (loading beat included).
  // Issue #14 (AC3): settle offline gains here too. The save-on-session-change
  // effect rewrites savedAt on mount, so a reload that skipped this would
  // silently swallow the absence — selectSlot is not the only entry point.
  const [session, setSession] = useState<GameSession | null>(() => {
    if (activeSlot === null) return null
    const slot = slots[activeSlot]
    if (slot === undefined) return null
    const now = Date.now()
    return applyOfflineGains(slot.session, now - slot.savedAt, now, (hours, progress) =>
      t(slot.session.locale, 'ui.offline.gained', { hours, progress })).session
  })
  const [locale, setLocale] = useState<Locale>(() => session?.locale ?? settings.locale)
  const [motion, setMotion] = useState<{ kind: Action['kind'] | null; nonce: number }>({ kind: null, nonce: 0 })
  const [storyOpen, setStoryOpen] = useState(() => session !== null && opensOnBootScene(session.game))
  const [phase, setPhase] = useState<'menu' | 'slots' | 'newgame' | 'settings' | 'loading' | 'playing'>(() => session === null ? 'menu' : 'loading')
  // Global meta-progression (issue #14 — AC1).
  const [globalProfile, setGlobalProfile] = useState<GlobalProfile>(() =>
    storage === undefined ? { ...DEFAULT_GLOBAL_PROFILE } : loadGlobalProfile(storage),
  )
  // New Game intent: slot chosen on the slots screen, awaiting its System pick.
  const [pendingSlot, setPendingSlot] = useState<SlotId | null>(null)
  const [runDifficulty, setRunDifficulty] = useState<GameDifficulty>(settings.difficulty)
  const sessionRef = useRef<GameSession | null>(null)
  // Latest profile readable from stable callbacks (act fires on every keypress).
  const globalProfileRef = useRef<GlobalProfile>(globalProfile)

  useEffect(() => {
    globalProfileRef.current = globalProfile
  }, [globalProfile])

  // Playtest telemetry (issue #20): one log per play session, keyed to a random
  // id so the ending-screen survey can be joined back to its journey.
  const [telemetryId, setTelemetryId] = useState<string | null>(null)

  useEffect(() => {
    if (phase !== 'playing' || sessionRef.current === null) return
    const local = browserStorage()
    setTelemetryId(startRun(local, sessionRef.current.game, sessionRef.current.locale).id)
  }, [phase])

  useEffect(() => {
    sessionRef.current = session
    if (session !== null && activeSlot !== null) saveSlot(browserStorage(), activeSlot, session)
  }, [session, activeSlot])

  useEffect(() => {
    if (phase === 'playing') {
      soundEngine.setAmbientTheme('village')
    } else {
      soundEngine.setAmbientTheme('silence')
    }
  }, [phase])

  const updateSettings = useCallback((next: PlayerSettings) => {
    setSettings(next)
    setLocale(next.locale)
    if (typeof window !== 'undefined') saveSettings(browserStorage(), next)
  }, [])

  // Slot selection. Occupied slot resumes in place — unless we arrived from a
  // new game that needs a target slot, in which case any pick is overwrite
  // intent and goes through the System grid. Empty slot starts a new run.
  const selectSlot = useCallback((slotId: SlotId) => {
    const slot = slots[slotId]
    if (pendingSlot === NEED_SLOT) {
      setPendingSlot(slotId)
      setPhase('newgame')
      return
    }
    if (slot !== undefined) {
      // AC3: settle offline gains before we hand the session to the UI so the
      // chronicle line is already baked into the first render.
      const now = Date.now()
      const settled = applyOfflineGains(slot.session, now - slot.savedAt, now, (hours, progress) =>
        t(slot.session.locale, 'ui.offline.gained', { hours, progress }))
      const next = settled.session
      // The save-on-session-change effect persists `next` to this slot with
      // savedAt reset to now, so offline gains apply exactly once per absence
      // (a later reload settles from *this* point, not the original absence).
      setActiveSlot(browserStorage(), slotId)
      setActiveSlotState(slotId)
      sessionRef.current = next
      setSession(next)
      setLocale(next.locale)
      setStoryOpen(opensOnBootScene(next.game))
      setPhase('loading')
      return
    }
    setPendingSlot(slotId)
    setPhase('newgame')
  }, [pendingSlot, slots])

  const startNewGame = useCallback((systemId: string) => {
    // No free slot and no explicit slot chosen: let the player pick (and thus
    // choose which run to overwrite) instead of silently replacing slot 1.
    if (pendingSlot === null && !SLOT_IDS.some((slotId) => slots[slotId] === undefined)) {
      setPendingSlot(NEED_SLOT)
      return
    }
    const slotId = pendingSlot ?? firstFreeSlot(slots)
    const local = browserStorage()
    // AC2 across slots: a relic queued by *some other* slot's finished run
    // (profile.inheritedRelicId, written in restart) seeds this fresh run and
    // is consumed — same-slot rebirth paths pass the relic directly and never
    // touch the queue. (review #28 LOW: field was write-only.)
    const queuedRelic = globalProfileRef.current.inheritedRelicId
    const next = freshSession(locale, {
      systemId,
      difficulty: runDifficulty,
      ...(queuedRelic !== null ? { inheritedRelicId: queuedRelic } : {}),
    })
    saveSlot(local, slotId, next)
    setActiveSlot(local, slotId)
    setActiveSlotState(slotId)
    setSlots(loadSaveSlots(local))
    if (queuedRelic !== null) {
      const cleared: GlobalProfile = { ...globalProfileRef.current, inheritedRelicId: null }
      globalProfileRef.current = cleared
      setGlobalProfile(cleared)
      saveGlobalProfile(local, cleared)
    }
    sessionRef.current = next
    setSession(next)
    setPendingSlot(null)
    setStoryOpen(false)
    setPhase('loading')
  }, [locale, pendingSlot, runDifficulty, slots])

  const removeSlot = useCallback((slotId: SlotId) => {
    const local = browserStorage()
    deleteSaveSlot(local, slotId)
    setSlots(loadSaveSlots(local))
    if (activeSlot === slotId) setActiveSlotState(null)
  }, [activeSlot])

  const act = useCallback((action: Action) => {
    const previous = sessionRef.current
    if (previous === null) return
    const result = applyAction(previous.game, action)
    const next = { ...previous, game: result.state, chronicle: [...previous.chronicle, ...narrate(result.events, previous.locale)].slice(-80), chronicleKinds: [...(previous.chronicleKinds ?? []), ...result.events.map((event) => event.type.toLowerCase())].slice(-80) }
    sessionRef.current = next
    if (activeSlot !== null && shouldAutoSave(previous.game, result.state)) saveSlot(browserStorage(), activeSlot, next)
    setSession(next)
const local = browserStorage()
    if (telemetryId !== null) recordStep(local, telemetryId, result.state, action.kind)
    if (result.state.terminal && telemetryId !== null) closeRun(local, telemetryId, result.state)

    // Global Profile sync (issue #14 — AC1): endings and achievements persist
    // across all slots the moment they fire — not just when a run is restarted.
    const endingEvent = result.events.find((e) => e.type === 'ENDING')
    const newAchievements = result.events
      .filter((e): e is Extract<GameEvent, { type: 'ACHIEVEMENT_UNLOCKED' }> => e.type === 'ACHIEVEMENT_UNLOCKED')
      .map((e) => e.achievementId)
    if (endingEvent !== undefined || newAchievements.length > 0) {
      const nextProfile = mergeGlobalProfile(globalProfileRef.current, {
        endings: endingEvent === undefined ? [] : [endingEvent.endingId],
        achievements: newAchievements,
      })
      globalProfileRef.current = nextProfile
      setGlobalProfile(nextProfile)
      saveGlobalProfile(local, nextProfile)
    }
    const opensStory = result.events.some((event) => event.type === 'TALKED' || (event.type === 'NODE_REACHED' && event.kind === 'event'))
    const bootScene = currentStoryScene(previous.game).id
    const resolvesSystemBoot = action.kind === 'story_choice'
      && (bootScene === 'scene_transmigration' || bootScene === 'scene_system_selection')
      && (result.state.systemId != null || result.state.flags.system_refused === true)
    // A route encounter replaces the world view (no panel renders over it), so it owns the screen — never leave a ghost backdrop open beneath it.
    setStoryOpen((open) => !resolvesSystemBoot && !result.state.terminal && (open || opensStory) && storyRouteEncounter(result.state) === undefined)
    const visualAction = visualActionFor(action, result.events)
    setMotion((current) => ({ kind: visualAction, nonce: current.nonce + 1 }))

    // Trigger Xianxia audio feedback
    if (result.events.some((e) => e.type === 'ACHIEVEMENT_UNLOCKED' || e.type === 'ENDING')) {
      soundEngine.play('stamp')
    } else if (result.events.some((e) => e.type === 'MINOR_REALM_ADVANCED')) {
      soundEngine.play('breakthrough')
    } else if (result.events.some((e) => e.type === 'COMBO_TRIGGERED')) {
      // Rising sweep overlay rides on top of the combat BGM.
      soundEngine.playCombo()
    } else if (result.events.some((e) => e.type === 'COMBAT_HIT')) {
      soundEngine.play('sword_strike')
    } else if (result.events.some((e) => e.type === 'COMBAT_GUARDED')) {
      soundEngine.play('sword_defend')
    } else if (result.events.some((e) => e.type === 'ITEM_USED' || e.type === 'WARD_USED')) {
      soundEngine.play('pill')
    } else if (action.kind === 'train') {
      soundEngine.play('cultivate')
    } else if (action.kind === 'move') {
      soundEngine.play('step')
    } else if (action.kind === 'story_choice') {
      soundEngine.play('bell')
    } else {
      soundEngine.play('click')
    }

    void requestNarration(result.state, result.events, previous.locale).then((line) => {
      if (line === null || sessionRef.current === null) return
      const current = sessionRef.current
      const narrated = { ...current, chronicle: [...current.chronicle, line].slice(-80) }
      sessionRef.current = narrated
      setSession(narrated)
    })
  }, [activeSlot, telemetryId])

  useEffect(() => {
    const movement: Record<string, Action> = { ArrowUp: { kind: 'move', direction: 'north' }, w: { kind: 'move', direction: 'north' }, ArrowDown: { kind: 'move', direction: 'south' }, s: { kind: 'move', direction: 'south' }, ArrowLeft: { kind: 'move', direction: 'west' }, a: { kind: 'move', direction: 'west' }, ArrowRight: { kind: 'move', direction: 'east' }, d: { kind: 'move', direction: 'east' } }
    const handler = (event: KeyboardEvent) => {
      const target = event.target
      if (sessionRef.current === null) return
      if (storyOpen) {
        if (event.key === 'Escape') { event.preventDefault(); setStoryOpen(false) }
        return
      }
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return
      const move = movement[event.key]
      if (storyRouteEncounter(sessionRef.current.game) !== undefined && (move !== undefined || /^[1-3]$/.test(event.key))) { event.preventDefault(); return }
      if (move !== undefined) { event.preventDefault(); act(move); return }
      const choice = Number(event.key)
      if (choice >= 1 && choice <= 3) {
        const storyChoice = currentStoryScene(sessionRef.current.game).choices[choice - 1]
        if (storyChoice !== undefined) { event.preventDefault(); act({ kind: 'story_choice', choiceId: storyChoice.id }) }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [act, storyOpen])

  const changeLocale = useCallback((nextLocale: Locale) => {
    if (sessionRef.current === null) return
    const next = { ...sessionRef.current, locale: nextLocale }
    sessionRef.current = next
    setSession(next)
  }, [])

  const restart = useCallback(() => {
    const prev = sessionRef.current
    if (prev === null) return
    const local = browserStorage()
    const relic = chooseInheritedRelic(prev.game) // snapshot before the wipe
    const nextNpPlus = (prev.game.ngPlusLevel ?? 0) + 1
    // Positive Failure: the fallen life's cause is stamped on its flags; the
    // reborn run reads it back and inherits one attribute point of hard-won
    // experience. A fresh boot (no death recorded) inherits nothing.
    const fresh = freshSession(prev.locale, {
      legacyCause: readDeathCause(prev.game),
      ngPlusLevel: nextNpPlus,
      inheritedRelicId: relic ?? undefined,
    })
    // Close the loop on the global profile: tally the finished run, remember the
    // inherited relic for the *next* new game, and bump the highest cycle reached.
    const nextProfile = recordTerminal(
      globalProfileRef.current,
      prev.game.endingId,
      [],
      nextNpPlus,
      relic,
    )
    globalProfileRef.current = nextProfile
    setGlobalProfile(nextProfile)
    saveGlobalProfile(local, nextProfile)
    sessionRef.current = fresh
    setSession(fresh)
    setPhase('loading')
  }, [])

// Leaving a run clears the resume marker (F5 lands on the menu again) but
  // keeps the slot itself — Load Game can pick the run back up.
  const exitToMenu = useCallback(() => {
    if (typeof window !== 'undefined') setActiveSlot(browserStorage(), null)
    setActiveSlotState(null)
    sessionRef.current = null
    setSession(null)
    setPhase('menu')
  }, [])

  const submitSurvey = useCallback((survey: PlaytestSurvey) => {
    saveFeedback(browserStorage(), survey)
  }, [])

  const hasSave = Object.keys(slots).length > 0

  if (phase === 'menu') return <MainMenu
    locale={locale}
    hasSave={hasSave}
    onNewGame={() => { setPendingSlot(null); setRunDifficulty(settings.difficulty); setPhase('newgame') }}
    onLoadGame={() => setPhase('slots')}
    onSettings={() => setPhase('settings')}
    onLocaleChange={(next) => updateSettings({ ...settings, locale: next })}
  />
  if (phase === 'settings') return <SettingsScreen locale={locale} settings={settings} onChange={updateSettings} onBack={() => setPhase('menu')} />
  if (phase === 'newgame') return <NewGameScreen
    locale={locale}
    difficulty={runDifficulty}
    onDifficulty={setRunDifficulty}
    onPick={startNewGame}
    onBack={() => { setPendingSlot(null); setPhase('menu') }}
  />
  if (phase === 'slots') return <SaveSlotsScreen slots={slots} locale={locale} onSelect={selectSlot} onDelete={removeSlot} />
  if (session === null) return null
  if (phase === 'loading') return <LoadingScreen locale={session.locale} onDone={() => setPhase('playing')} />
  return <>
    {storyOpen && <div className="story-backdrop" onClick={() => setStoryOpen(false)} aria-hidden="true" />}
    <GameScreen actionKind={motion.kind} actionNonce={motion.nonce} game={session.game} locale={session.locale} chronicle={session.chronicle} onAction={act} onLocaleChange={changeLocale} onRestart={restart} onExitToMenu={exitToMenu} storyOpen={storyOpen} onStoryClose={() => setStoryOpen(false)} unlockedEndingIds={globalProfile.unlockedEndingIds} unlockedAchievementIds={globalProfile.unlockedAchievementIds} />
    {session.game.terminal && telemetryId !== null && (
      <PlaytestSurveyCard game={session.game} locale={session.locale} runId={telemetryId} onSubmit={submitSurvey} />
    )}
  </>
}

export default App
