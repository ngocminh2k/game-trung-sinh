import { activeSystem, systemQuestsFor } from '../engine'
import type { GameState, Locale } from '../engine'
import { narrationWanted } from './narration'
import { classifySystemUtterance, type JevClientConfig } from './jev-client'
import type { SystemFastDecision } from './jev-schemas'

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
  fastDecision?: SystemFastDecision
  jevDecision?: SystemFastDecision
}

export interface SystemReply {
  kind: 'chat' | 'offer_quest'
  textVi: string
  textEn: string
  questId?: string
  fastDecision?: SystemFastDecision
}

export function buildSystemPayload(
  game: GameState,
  message: string,
  locale: Locale,
  fastDecision?: SystemFastDecision,
): SystemChatPayload | null {
  const system = activeSystem(game)
  if (system === null) return null

  const mode =
    fastDecision &&
    !fastDecision.isHostile &&
    fastDecision.intent === 'request_quest' &&
    fastDecision.questId
      ? 'offer_quest'
      : 'chat'

  return {
    mode,
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
    ...(fastDecision
      ? {
          fastDecision,
          jevDecision: fastDecision,
        }
      : {}),
  }
}

export function buildDeterministicSystemReply(
  game: GameState,
  message: string,
  locale: Locale,
  fastDecision?: SystemFastDecision,
): SystemReply
export function buildDeterministicSystemReply(
  game: GameState,
  fastDecision: SystemFastDecision,
  locale?: Locale,
): SystemReply
export function buildDeterministicSystemReply(
  game: GameState,
  arg2: string | SystemFastDecision,
  _arg3?: Locale,
  arg4?: SystemFastDecision,
): SystemReply {
  let fastDecision: SystemFastDecision | undefined

  if (typeof arg2 === 'object' && arg2 !== null) {
    fastDecision = arg2
  } else {
    fastDecision = arg4
  }

  const system = activeSystem(game)
  const nameVi = system ? system.nameVi : 'Hệ Thống'
  const nameEn = system ? system.nameEn : 'The System'
  const personalityVi = system ? system.personalityVi : 'Hệ Thống im lặng theo dõi.'
  const personalityEn = system ? system.personalityEn : 'The System watches in silence.'

  const decision: SystemFastDecision = fastDecision ?? {
    intent: 'chat_general',
    obedienceScore: 3,
    isHostile: false,
    latencyMs: 0,
  }

  // 1. Hostility or defiance mockery
  if (decision.isHostile || decision.intent === 'defiance_mockery' || decision.obedienceScore <= 2) {
    return {
      kind: 'chat',
      textVi: `【${nameVi}】: Ký chủ to gan! Thái độ ngỗ ngược (Tuân phục: ${decision.obedienceScore}/5). ${personalityVi} Bổn Hệ Thống từ chối phục vụ kẻ vô lễ!`,
      textEn: `[${nameEn}]: Impudent host! Insubordinate attitude (Obedience: ${decision.obedienceScore}/5). ${personalityEn} The System refuses to serve the disrespectful!`,
    }
  }

  // 2. Request quest
  if (decision.intent === 'request_quest') {
    const available = systemQuestsFor(game)
    if (decision.questId) {
      const quest = available.find((q) => q.id === decision.questId)
      if (quest) {
        return {
          kind: 'offer_quest',
          questId: quest.id,
          textVi: `【${nameVi}】: Ký chủ yêu cầu nhiệm vụ. Ban bố: [${quest.nameVi}]. ${quest.descVi} Thưởng: ${quest.rewardGold} vàng.`,
          textEn: `[${nameEn}]: Host requested a task. Issued: [${quest.nameEn}]. ${quest.descEn} Reward: ${quest.rewardGold} gold.`,
        }
      }
    }
    return {
      kind: 'chat',
      textVi: `【${nameVi}】: Hiện tại không có nhiệm vụ nào phù hợp với cảnh giới của ngươi. ${personalityVi}`,
      textEn: `[${nameEn}]: No quests currently available for your cultivation realm. ${personalityEn}`,
    }
  }

  // 3. Inquire status
  if (decision.intent === 'inquire_status') {
    return {
      kind: 'chat',
      textVi: `【${nameVi}】: Trạng thái Ký chủ: Cảnh giới Tầng ${game.player.stage}, Khí huyết ${game.player.hp}, Chân khí ${game.player.qi}, Ngân lượng ${game.player.gold}. ${personalityVi}`,
      textEn: `[${nameEn}]: Host Status: Realm Stage ${game.player.stage}, HP ${game.player.hp}, Qi ${game.player.qi}, Gold ${game.player.gold}. ${personalityEn}`,
    }
  }

  // 4. Complain
  if (decision.intent === 'complain') {
    return {
      kind: 'chat',
      textVi: `【${nameVi}】: Than vãn vô ích! Con đường tu tiên nghịch thiên cải mệnh, chỉ có kẻ yếu mới than vãn. ${personalityVi}`,
      textEn: `[${nameEn}]: Complaining is futile! The path of cultivation defies the heavens; only the weak lament. ${personalityEn}`,
    }
  }

  // 5. Accept current quest
  if (decision.intent === 'accept_current_quest' && decision.questId) {
    const available = systemQuestsFor(game)
    const quest = available.find((q) => q.id === decision.questId)
    if (quest) {
      return {
        kind: 'offer_quest',
        questId: quest.id,
        textVi: `【${nameVi}】: Tiếp nhận ý chỉ! Ban bố: [${quest.nameVi}]. Hãy mau chóng hoàn thành!`,
        textEn: `[${nameEn}]: Decree received! Issued: [${quest.nameEn}]. Complete it without delay!`,
      }
    }
  }

  // 6. Chat general / default
  return {
    kind: 'chat',
    textVi: `【${nameVi}】: ${personalityVi}`,
    textEn: `[${nameEn}]: ${personalityEn}`,
  }
}

export async function fastClassifySystem(
  game: GameState,
  message: string,
  config?: JevClientConfig,
): Promise<SystemFastDecision> {
  return classifySystemUtterance(game, message, config)
}

export async function requestSystemReply(
  game: GameState,
  message: string,
  locale: Locale,
): Promise<SystemReply | null> {
  if (!narrationWanted()) return null

  const system = activeSystem(game)
  if (system === null) return null

  const cleanMessage = message.replace(/\s+/g, ' ').trim().slice(0, 300)
  if (cleanMessage.length === 0) return null

  // Tier 1: Fast reflex classification via Jev System One (~80ms)
  const fastDecision = await classifySystemUtterance(game, cleanMessage)

  // Build Tier 2 payload enriched with Jev fast decision
  const payload = buildSystemPayload(game, cleanMessage, locale, fastDecision)
  if (payload === null) return null

  // Tier 2: Generative LLM via /api/narrate with timeout & deterministic fallback
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 2000)

  try {
    const response = await fetch('/api/narrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      return buildDeterministicSystemReply(game, cleanMessage, locale, fastDecision)
    }

    const data: unknown = await response.json()
    if (typeof data !== 'object' || data === null) {
      return buildDeterministicSystemReply(game, cleanMessage, locale, fastDecision)
    }

    const reply = data as Partial<SystemReply>
    if (
      (reply.kind !== 'chat' && reply.kind !== 'offer_quest') ||
      typeof reply.textVi !== 'string' ||
      typeof reply.textEn !== 'string'
    ) {
      return buildDeterministicSystemReply(game, cleanMessage, locale, fastDecision)
    }

    // Hallucination Defense: If Tier 2 LLM offers a quest not in the pool, reject deterministically (null)
    if (reply.kind === 'offer_quest') {
      if (
        typeof reply.questId !== 'string' ||
        !payload.questPool.some((quest) => quest.id === reply.questId)
      ) {
        return null
      }
    }

    const textVi = reply.textVi.replace(/\s+/g, ' ').trim().slice(0, 300)
    const textEn = reply.textEn.replace(/\s+/g, ' ').trim().slice(0, 300)
    if (textVi.length === 0 || textEn.length === 0) {
      return buildDeterministicSystemReply(game, cleanMessage, locale, fastDecision)
    }

    return reply.kind === 'offer_quest'
      ? { kind: reply.kind, textVi, textEn, questId: reply.questId }
      : { kind: reply.kind, textVi, textEn }
  } catch {
    clearTimeout(timeoutId)
    return buildDeterministicSystemReply(game, cleanMessage, locale, fastDecision)
  }
}
