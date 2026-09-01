import { activeSystem, systemQuestsFor } from '../engine'
import type { GameState, Locale } from '../engine'
import { narrationWanted } from './narration'

export interface SystemChatPayload {
  mode: 'chat' | 'offer_quest'
  locale: Locale
  system: {
    id: string
    nameVi: string
    nameEn: string
    personalityVi: string
    personalityEn: string
  }
  context: {
    day: number
    stage: number
    gold: number
    luck: number
    hp: number
    qi: number
  }
  questPool: Array<{ id: string; difficulty: number; rewardGold: number }>
  playerMessage: string
}

export interface SystemReply {
  kind: 'chat' | 'offer_quest'
  textVi: string
  textEn: string
  questId?: string
}

export function buildSystemPayload(game: GameState, message: string, locale: Locale): SystemChatPayload | null {
  const system = activeSystem(game)
  if (system === null) return null
  return {
    mode: 'chat',
    locale,
    system: {
      id: system.id,
      nameVi: system.nameVi,
      nameEn: system.nameEn,
      personalityVi: system.personalityVi,
      personalityEn: system.personalityEn,
    },
    context: {
      day: game.day,
      stage: game.player.stage,
      gold: game.player.gold,
      luck: game.player.attrs.luck,
      hp: game.player.hp,
      qi: game.player.qi,
    },
    questPool: systemQuestsFor(game).map((quest) => ({
      id: quest.id,
      difficulty: quest.difficulty ?? 1,
      rewardGold: quest.rewardGold,
    })),
    playerMessage: message.replace(/\s+/g, ' ').trim().slice(0, 300),
  }
}

export async function requestSystemReply(game: GameState, message: string, locale: Locale): Promise<SystemReply | null> {
  if (!narrationWanted()) return null
  const payload = buildSystemPayload(game, message, locale)
  if (payload === null || payload.playerMessage.length === 0) return null

  try {
    const response = await fetch('/api/narrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) return null
    const data: unknown = await response.json()
    if (typeof data !== 'object' || data === null) return null
    const reply = data as Partial<SystemReply>
    if ((reply.kind !== 'chat' && reply.kind !== 'offer_quest') || typeof reply.textVi !== 'string' || typeof reply.textEn !== 'string') return null
    if (reply.kind === 'offer_quest' && (typeof reply.questId !== 'string' || !payload.questPool.some((quest) => quest.id === reply.questId))) return null
    const textVi = reply.textVi.replace(/\s+/g, ' ').trim().slice(0, 300)
    const textEn = reply.textEn.replace(/\s+/g, ' ').trim().slice(0, 300)
    if (textVi.length === 0 || textEn.length === 0) return null
    return reply.kind === 'offer_quest' ? { kind: reply.kind, textVi, textEn, questId: reply.questId } : { kind: reply.kind, textVi, textEn }
  } catch {
    return null
  }
}
