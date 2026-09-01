import { currentStoryScene, findStoryChoice } from '../engine'
import type { GameEvent, GameState, Locale } from '../engine'
import { SETTINGS_KEY } from '../ui/session'

export interface NarrationPayload {
  locale: Locale
  canon: {
    day: number
    locationId: string
    stage: number
    progress: number
    hp: number
    qi: number
    terminal: boolean
    endingId: string | null
  }
  events: readonly GameEvent[]
}

export function buildNarrationPayload(game: GameState, events: readonly GameEvent[], locale: Locale): NarrationPayload {
  return {
    locale,
    canon: {
      day: game.day,
      locationId: game.player.locationId,
      stage: game.player.stage,
      progress: game.player.progress,
      hp: game.player.hp,
      qi: game.player.qi,
      terminal: game.terminal,
      endingId: game.endingId,
    },
    events,
  }
}

// Narration gate: the player's Settings toggle wins; when the toggle is on but
// the operator hasn't configured the proxy server-side (VITE_AI_NARRATION_ENABLED),
// requests fail and the deterministic fallback stays — no error reaches play.
// Reads only the on/off intent; credentials never enter the browser.
export function narrationWanted(): boolean {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    if (raw !== null) {
      const wanted = (JSON.parse(raw) as { narrationEnabled?: boolean }).narrationEnabled
      if (wanted === true) return true
      if (wanted === false) return false
    }
  } catch { /* unreadable settings — fall through to the operator default */ }
  return import.meta.env.VITE_AI_NARRATION_ENABLED === 'true'
}

export async function requestNarration(game: GameState, events: readonly GameEvent[], locale: Locale): Promise<string | null> {
  if (!narrationWanted() || events.length === 0) return null

  try {
    const response = await fetch('/api/narrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildNarrationPayload(game, events, locale)),
    })
    if (!response.ok) return null
    const data: unknown = await response.json()
    const text = typeof data === 'object' && data !== null ? (data as { text?: unknown }).text : undefined
    if (typeof text !== 'string') return null
    const sanitized = text.replace(/\s+/g, ' ').trim().slice(0, 500)
    return sanitized.length > 0 ? sanitized : null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Phase 5 (design review 2026-08): free-text "suggest" mode.
//
// The player types freely while a story choice is open; the AI receives the
// scene, the authored choices, and the utterance, and may return ONE choice id
// plus an in-character line. The engine never sees AI text or state — the
// reducer only ever receives a `story_choice` action with an authored choice
// id, and without AI the deterministic parser handles the utterance as before.
// ---------------------------------------------------------------------------

export interface SuggestPayload {
  mode: 'suggest'
  locale: Locale
  scene: { id: string; title: string; text: string }
  choices: Array<{ id: string; label: string }>
  playerUtterance: string
}

export interface Suggestion {
  choiceId: string
  reply: string
}

export type SuggestionResult =
  | { status: 'suggested'; suggestion: Suggestion }
  | { status: 'empty' }
  | { status: 'error' }

export function buildSuggestPayload(game: GameState, utterance: string, locale: Locale): SuggestPayload {
  const scene = currentStoryScene(game)
  const choices = scene.choices
    .filter((choice) => findStoryChoice(game, choice.id) !== undefined)
    .map((choice) => ({
      id: choice.id,
      label: locale === 'vi' ? choice.labelVi : choice.labelEn,
    }))
  return {
    mode: 'suggest',
    locale,
    scene: {
      id: scene.id,
      title: locale === 'vi' ? scene.titleVi : scene.titleEn,
      text: locale === 'vi' ? scene.textVi : scene.textEn,
    },
    choices,
    playerUtterance: utterance.replace(/\s+/g, ' ').trim().slice(0, 300),
  }
}

export async function requestSuggestion(game: GameState, utterance: string, locale: Locale): Promise<SuggestionResult> {
  if (!narrationWanted()) return { status: 'error' }
  const payload = buildSuggestPayload(game, utterance, locale)
  if (payload.choices.length === 0 || payload.playerUtterance.length === 0) return { status: 'empty' }

  try {
    const response = await fetch('/api/narrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) return { status: 'error' }
    const data: unknown = await response.json()
    if (typeof data !== 'object' || data === null) return { status: 'empty' }
    const candidate = data as { choiceId?: unknown; reply?: unknown }
    if (typeof candidate.choiceId !== 'string') return { status: 'empty' }
    // The AI may only pick one of the authored, currently-available choices.
    if (!payload.choices.some((choice) => choice.id === candidate.choiceId)) return { status: 'empty' }
    const reply = typeof candidate.reply === 'string'
      ? candidate.reply.replace(/\s+/g, ' ').trim().slice(0, 300)
      : ''
    return { status: 'suggested', suggestion: { choiceId: candidate.choiceId, reply } }
  } catch {
    return { status: 'error' }
  }
}
