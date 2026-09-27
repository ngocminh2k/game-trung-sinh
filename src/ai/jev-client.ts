import { JevResponseSchema, type SystemFastDecision } from './jev-schemas'
import type { GameState } from '../engine'
import { activeSystem, systemQuestsFor } from '../engine'
import { layaOnnxManager } from './laya-onnx-client'

export interface JevClientConfig {
  apiKey?: string
  endpoint?: string
  timeoutMs?: number
  useLayaOnnx?: boolean
}

const DEFAULT_ENDPOINT = 'https://api.typesafe.ai/v1/systemone'
const DEFAULT_TIMEOUT_MS = 600

export async function classifySystemUtterance(
  game: GameState,
  playerMessage: string,
  config: JevClientConfig = {}
): Promise<SystemFastDecision> {
  const startTime = Date.now()

  // 1. Ưu tiên mô hình cục bộ Laya ONNX nếu được kích hoạt
  const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test'
  const allowLaya = config.useLayaOnnx === true || (config.useLayaOnnx !== false && !isTest)

  if (allowLaya && layaOnnxManager.isReady()) {
    const layaDecision = await layaOnnxManager.classify(game, playerMessage, {
      timeoutMs: config.timeoutMs,
    })
    if (layaDecision) {
      return layaDecision
    }
  } else if (allowLaya) {
    // Kích hoạt nạp ngầm chạy sau lưng, hoàn toàn không chặn UI luồng chính
    void layaOnnxManager.lazyLoad()
  }

  const envKey = typeof process !== 'undefined' && process.env ? process.env.TYPESAFE_API_KEY : undefined
  const apiKey = config.apiKey ?? envKey ?? ''
  const endpoint = config.endpoint ?? DEFAULT_ENDPOINT
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS

  const system = activeSystem(game)
  const availableQuests = systemQuestsFor(game).map((q) => ({
    id: q.id,
    name: q.nameVi,
    difficulty: q.difficulty ?? 1,
  }))
  const questIdOptions = [...availableQuests.map((q) => q.id), 'none']

  if (!apiKey) {
    return fallbackRuleBasedClassifier(playerMessage, questIdOptions, Date.now() - startTime)
  }

  const payload = {
    model: 'jev-latest',
    state: {
      system: system ? { id: system.id, nameVi: system.nameVi, personalityVi: system.personalityVi } : null,
      player: {
        stage: game.player.stage,
        gold: game.player.gold,
        hp: game.player.hp,
        qi: game.player.qi,
      },
      availableQuests,
      playerMessage: playerMessage.trim().slice(0, 300),
    },
    questions: {
      intent: {
        type: 'choice',
        options: [
          'request_quest',
          'chat_general',
          'inquire_status',
          'complain',
          'defiance_mockery',
          'accept_current_quest',
        ],
        instructions: 'Classify the player core intent toward The System.',
      },
      selectedQuestId: {
        type: 'choice',
        options: questIdOptions,
        instructions: 'Select matching quest ID from availableQuests if player wants a quest, else none.',
      },
      obedienceScore: {
        type: 'score',
        min: 1,
        max: 5,
        instructions: 'Rate respect level (1 = insolent, 5 = reverent).',
      },
      isHostile: {
        type: 'noul',
        instructions: 'Is player defying, insulting, or mocking the System?',
      },
    },
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      return fallbackRuleBasedClassifier(playerMessage, questIdOptions, Date.now() - startTime)
    }

    const json: unknown = await res.json()
    const parsed = JevResponseSchema.parse(json)
    const selectedQId = parsed.answers.selectedQuestId.value

    return {
      intent: parsed.answers.intent.value,
      questId: selectedQId !== 'none' && questIdOptions.includes(selectedQId) ? selectedQId : undefined,
      obedienceScore: parsed.answers.obedienceScore.value,
      isHostile: parsed.answers.isHostile.value,
      latencyMs: Date.now() - startTime,
    }
  } catch {
    clearTimeout(timeoutId)
    return fallbackRuleBasedClassifier(playerMessage, questIdOptions, Date.now() - startTime)
  }
}

/**
 * Deterministic Rule-based Fallback (dự phòng an toàn khi offline/timeout)
 */
function fallbackRuleBasedClassifier(
  message: string,
  availableQuestIds: string[],
  elapsedMs: number
): SystemFastDecision {
  const lower = message.toLowerCase()
  const isQuest = /nhiệm vụ|việc gì|làm gì|kiếm tiền|quest|task/.test(lower)
  const isHostile = /cút|ngu|phế|vô dụng|chó|đồ khốn|hệ thống rác/.test(lower)

  return {
    intent: isHostile ? 'defiance_mockery' : isQuest ? 'request_quest' : 'chat_general',
    questId: isQuest && availableQuestIds[0] !== 'none' ? availableQuestIds[0] : undefined,
    obedienceScore: isHostile ? 1 : 3,
    isHostile,
    latencyMs: elapsedMs,
  }
}
