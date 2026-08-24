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
