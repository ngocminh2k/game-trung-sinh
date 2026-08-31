import { currentStoryScene, findStoryChoice } from '../engine'
import type { GameEvent, GameState, Locale } from '../engine'

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

export async function requestNarration(game: GameState, events: readonly GameEvent[], locale: Locale): Promise<string | null> {
  if (import.meta.env.VITE_AI_NARRATION_ENABLED !== 'true' || events.length === 0) return null

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

// A proxy that accepts the request but never answers must not leave the
// command form stuck on "Listening…" forever — bound the wait instead.
const SUGGEST_TIMEOUT_MS = 10_000

export async function requestSuggestion(game: GameState, utterance: string, locale: Locale, externalSignal?: AbortSignal): Promise<SuggestionResult> {
  if (import.meta.env.VITE_AI_NARRATION_ENABLED !== 'true') return { status: 'error' }
  const payload = buildSuggestPayload(game, utterance, locale)
  if (payload.choices.length === 0 || payload.playerUtterance.length === 0) return { status: 'empty' }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), SUGGEST_TIMEOUT_MS)
  const forwardAbort = () => controller.abort()
  externalSignal?.addEventListener('abort', forwardAbort, { once: true })
  try {
    const response = await fetch('/api/narrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
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
    // Abort (timeout, external cancel) and network failures all recover to the
    // deterministic parser.
    return { status: 'error' }
  } finally {
    clearTimeout(timer)
    externalSignal?.removeEventListener('abort', forwardAbort)
  }
}
