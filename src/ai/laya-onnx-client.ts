/**
 * Laya ONNX System-1 Client
 * Mô hình phân loại phản xạ nhanh (System-1) cục bộ dành cho The System trong game-trung-sinh.
 *
 * Tính năng chính:
 * 1. Lazy-loading tuyệt đối: Không nạp model lúc khởi động game, không gây trễ boot dù 1ms.
 * 2. On-demand & Non-blocking: Tự động kích hoạt tải ngầm khi người chơi tương tác với Hệ Thống.
 * 3. Graceful Fallback: Nếu mô hình chưa tải xong hoặc lỗi, tự động rơi về Rule-based Classifier tức thì.
 * 4. Hallucination Defense: Ràng buộc questId 100% trong pool nhiệm vụ hợp lệ của GameState.
 */

import type { GameState } from '../engine'
import { systemQuestsFor } from '../engine'
import type { JevIntent, SystemFastDecision } from './jev-schemas'
import { tokenizeWordPiece } from './laya-tokenizer'

export type LayaModelStatus = 'unloaded' | 'loading' | 'ready' | 'error'

export interface LayaClientConfig {
  modelPath?: string
  vocabPath?: string
  timeoutMs?: number
}

const DEFAULT_MODEL_URL = '/models/trung_sinh_system1/model.onnx'
const DEFAULT_VOCAB_URL = '/models/trung_sinh_system1/vocab.json'
const DEFAULT_TIMEOUT_MS = 250

const LAYA_INTENT_MAP: Record<number, JevIntent> = {
  0: 'request_quest',
  1: 'request_quest', // beg_resource maps to quest/support request
  2: 'chat_general',  // inquire_dao maps to general dialogue
  3: 'defiance_mockery',
  4: 'complain',
  5: 'chat_general',
}

export const LAYA_DAO_MAP: Record<number, 'chinh_dao' | 'ma_dao' | 'tieu_dao' | 'trung_lap'> = {
  0: 'chinh_dao',
  1: 'ma_dao',
  2: 'tieu_dao',
  3: 'trung_lap',
}

interface OrtInferenceSession {
  run(feeds: Record<string, unknown>): Promise<Record<string, { data: ArrayLike<number> }>>
}

class LayaOnnxManager {
  private status: LayaModelStatus = 'unloaded'
  private session: OrtInferenceSession | null = null
  private vocab: Record<string, number> | null = null
  private loadPromise: Promise<boolean> | null = null

  getStatus(): LayaModelStatus {
    return this.status
  }

  isReady(): boolean {
    return this.status === 'ready' && this.session !== null && this.vocab !== null
  }

  /**
   * Kích hoạt nạp ngầm mô hình ONNX và từ điển một cách bất đồng bộ.
   * Hoàn toàn không chặn luồng chính (Main thread).
   */
  async lazyLoad(config: LayaClientConfig = {}): Promise<boolean> {
    if (this.status === 'ready') return true
    if (this.loadPromise) return this.loadPromise

    this.status = 'loading'
    this.loadPromise = this.internalLoad(config)
      .then((success) => {
        this.status = success ? 'ready' : 'error'
        this.loadPromise = null
        return success
      })
      .catch((err) => {
        // Ghi nhận cảnh báo nhẹ nhàng, không crash ứng dụng
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[Laya ONNX] Khởi tạo mô hình thất bại, tiếp tục với Fallback:', err)
        }
        this.status = 'error'
        this.loadPromise = null
        return false
      })

    return this.loadPromise
  }

  private async internalLoad(config: LayaClientConfig): Promise<boolean> {
    const isNode = typeof process !== 'undefined' && Boolean(process.versions?.node)

    // 1. Nạp từ điển Vocab
    let vocabData: Record<string, number> | null = null
    const vocabPath = config.vocabPath ?? DEFAULT_VOCAB_URL

    if (isNode) {
      try {
        const fsModName = 'node:fs/promises'
        const pathModName = 'node:path'
        const fs = await import(/* @vite-ignore */ fsModName)
        const path = await import(/* @vite-ignore */ pathModName)
        // Thử tìm trong public/ hoặc models/
        const candidates = [
          path.resolve(process.cwd(), 'public/models/trung_sinh_system1/vocab.json'),
          path.resolve(process.cwd(), 'models/trung_sinh_system1/vocab.json'),
        ]
        for (const candidate of candidates) {
          try {
            const raw = await fs.readFile(candidate, 'utf-8')
            vocabData = JSON.parse(raw) as Record<string, number>
            break
          } catch {
            // thử tiếp
          }
        }
      } catch {
        // Node fs không khả dụng
      }
    } else if (typeof fetch !== 'undefined') {
      try {
        const res = await fetch(vocabPath)
        if (res.ok) {
          vocabData = (await res.json()) as Record<string, number>
        }
      } catch {
        // fetch thất bại
      }
    }

    if (!vocabData) {
      return false
    }
    this.vocab = vocabData

    // 2. Nạp ONNX Runtime Web động (Dynamic Import để Vite tách chunk riêng biệt)
    const ort = await import('onnxruntime-web')

    // 3. Khởi tạo InferenceSession
    const modelPath = config.modelPath ?? DEFAULT_MODEL_URL
    let session: OrtInferenceSession | null = null

    if (isNode) {
      const fsModName = 'node:fs/promises'
      const pathModName = 'node:path'
      const fs = await import(/* @vite-ignore */ fsModName)
      const path = await import(/* @vite-ignore */ pathModName)
      const candidates = [
        path.resolve(process.cwd(), 'public/models/trung_sinh_system1/model.onnx'),
        path.resolve(process.cwd(), 'models/trung_sinh_system1/model.onnx'),
      ]
      for (const candidate of candidates) {
        try {
          const buffer = await fs.readFile(candidate)
          session = (await ort.InferenceSession.create(buffer, {
            executionProviders: ['cpu'],
          })) as unknown as OrtInferenceSession
          break
        } catch {
          // thử tiếp
        }
      }
    } else {
      session = (await ort.InferenceSession.create(modelPath, {
        executionProviders: ['wasm'],
      })) as unknown as OrtInferenceSession
    }

    if (!session) {
      return false
    }

    this.session = session
    return true
  }

  /**
   * Phân loại phản xạ nhanh tin nhắn người chơi bằng mô hình Laya ONNX.
   * Nếu mô hình chưa sẵn sàng, kích hoạt nạp ngầm và trả về null để caller dùng Fallback ngay lập tức.
   */
  async classify(
    game: GameState,
    playerMessage: string,
    config: LayaClientConfig = {},
  ): Promise<SystemFastDecision | null> {
    if (!this.isReady()) {
      // Kích hoạt nạp ngầm chạy sau lưng (fire-and-forget)
      void this.lazyLoad(config)
      return null
    }

    const startTime = Date.now()
    const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS

    try {
      const ort = await import('onnxruntime-web')
      const { inputIds, attentionMask } = tokenizeWordPiece(playerMessage, this.vocab!, 64)

      const inputTensor = new ort.Tensor('int64', inputIds, [1, 64])
      const maskTensor = new ort.Tensor('int64', attentionMask, [1, 64])

      // Thực thi suy luận với cơ chế Timeout an toàn
      const runPromise = this.session!.run({
        input_ids: inputTensor,
        attention_mask: maskTensor,
      })

      const timerPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), timeoutMs)
      })

      const outputs = await Promise.race([runPromise, timerPromise])
      if (!outputs) {
        return null // Bị timeout
      }

      const intentLogits = outputs.intent_logits?.data ?? []
      const hostileLogits = outputs.hostile_logits?.data ?? []
      const obediencePred = outputs.obedience_pred?.data ?? [0.6]

      // Phân tích intent
      let maxIntentIdx = 0
      let maxIntentVal = -Infinity
      for (let i = 0; i < 6; i++) {
        const val = Number(intentLogits[i] ?? -Infinity)
        if (val > maxIntentVal) {
          maxIntentVal = val
          maxIntentIdx = i
        }
      }
      const intent = LAYA_INTENT_MAP[maxIntentIdx] ?? 'chat_general'

      // Phân tích hostile
      const isHostile = Number(hostileLogits[1] ?? 0) > Number(hostileLogits[0] ?? 0)

      // Phân tích obedience (1 -> 5)
      const rawObedience = Number(obediencePred[0] ?? 0.6)
      const obedienceScore = Math.min(5, Math.max(1, Math.round(rawObedience * 5 * 10) / 10))

      // Hallucination Defense: Ràng buộc questId vào danh sách quest đang có
      const availableQuests = systemQuestsFor(game)
      let questId: string | undefined

      if (intent === 'request_quest' && !isHostile) {
        // Nếu người chơi hỏi nhiệm vụ, tự động gán nhiệm vụ khả dụng đầu tiên
        const firstQuest = availableQuests[0]
        if (firstQuest) {
          questId = firstQuest.id
        }
      }

      return {
        intent,
        questId,
        obedienceScore,
        isHostile,
        latencyMs: Date.now() - startTime,
      }
    } catch {
      return null
    }
  }

  /**
   * Phương thức kiểm thử nội bộ: Reset trạng thái
   */
  resetForTesting(): void {
    this.status = 'unloaded'
    this.session = null
    this.vocab = null
    this.loadPromise = null
  }

  /**
   * Phương thức kiểm thử nội bộ: Giả lập Session
   */
  setMockSessionForTesting(mockSession: OrtInferenceSession, mockVocab: Record<string, number>): void {
    this.session = mockSession
    this.vocab = mockVocab
    this.status = 'ready'
  }
}

// Khởi tạo Singleton quản lý Laya ONNX Runtime
export const layaOnnxManager = new LayaOnnxManager()

/**
 * Hàm phân loại chính gọi từ System AI
 */
export async function classifyWithLayaOnnx(
  game: GameState,
  message: string,
  config?: LayaClientConfig,
): Promise<SystemFastDecision | null> {
  return layaOnnxManager.classify(game, message, config)
}

/**
 * Tự động nạp trước trong lúc rảnh rỗi (idle preload) mà không gây lag game
 */
export function triggerLayaPreload(config?: LayaClientConfig): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    ;(window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
      void layaOnnxManager.lazyLoad(config)
    })
  } else {
    setTimeout(() => {
      void layaOnnxManager.lazyLoad(config)
    }, 4000)
  }
}
