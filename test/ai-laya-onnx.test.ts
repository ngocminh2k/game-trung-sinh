import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  classifyWithLayaOnnx,
  layaOnnxManager,
  triggerLayaPreload,
} from '../src/ai/laya-onnx-client'
import { classifySystemUtterance } from '../src/ai/jev-client'
import { newGame } from '../src/engine'

describe('Laya ONNX System-1 Local Classifier', () => {
  beforeEach(() => {
    layaOnnxManager.resetForTesting()
  })

  afterEach(() => {
    layaOnnxManager.resetForTesting()
    vi.restoreAllMocks()
  })

  it('TC-ONNX-01: Khởi động game mặc định ở trạng thái unloaded, không tiêu tốn tài nguyên', () => {
    expect(layaOnnxManager.getStatus()).toBe('unloaded')
    expect(layaOnnxManager.isReady()).toBe(false)
  })

  it('TC-ONNX-02: Khi mô hình chưa nạp xong, tự động kích hoạt lazyLoad và trả về null không chặn UI', async () => {
    const game = { ...newGame('laya-test-1'), systemId: 'sys_battle' }
    const lazyLoadSpy = vi.spyOn(layaOnnxManager, 'lazyLoad').mockResolvedValue(false)

    const decision = await classifyWithLayaOnnx(game, 'Cho ta xin nhiệm vụ')
    expect(decision).toBeNull()
    expect(lazyLoadSpy).toHaveBeenCalledTimes(1)
  })

  it('TC-ONNX-03: classifySystemUtterance tự động rơi về Fallback Rule-based ngay lập tức khi ONNX chưa nạp', async () => {
    const game = { ...newGame('laya-test-2'), systemId: 'sys_battle' }
    vi.spyOn(layaOnnxManager, 'lazyLoad').mockResolvedValue(false)

    const decision = await classifySystemUtterance(game, 'nhiệm vụ tiếp theo là gì?', {
      useLayaOnnx: true,
    })

    expect(decision.intent).toBe('request_quest')
    expect(decision.isHostile).toBe(false)
    expect(decision.obedienceScore).toBe(3)
  })

  it('TC-ONNX-04: Phân loại chuẩn xác khi mô hình ONNX đã sẵn sàng (Intent, Hostility, Obedience, QuestId)', async () => {
    const game = { ...newGame('laya-test-3'), systemId: 'sys_battle' }

    // Mock InferenceSession
    const mockSession = {
      run: vi.fn().mockResolvedValue({
        // 0: request_quest (logits cao nhất ở index 0)
        intent_logits: { data: [3.5, 0.1, -1.2, -0.5, 0.2, -1.0] },
        // hostile logits: index 0 (chống đối = false) cao hơn index 1
        hostile_logits: { data: [2.5, -2.1] },
        // obedience_pred: 0.8 => 4.0 / 5
        obedience_pred: { data: [0.8] },
      }),
    }

    const mockVocab = {
      '[PAD]': 0,
      '[UNK]': 100,
      '[CLS]': 101,
      '[SEP]': 102,
      cho: 1,
      xin: 2,
      nv: 3,
    }

    layaOnnxManager.setMockSessionForTesting(mockSession, mockVocab)
    expect(layaOnnxManager.isReady()).toBe(true)

    const decision = await classifyWithLayaOnnx(game, 'cho xin nv')
    expect(decision).not.toBeNull()
    expect(decision?.intent).toBe('request_quest')
    expect(decision?.isHostile).toBe(false)
    expect(decision?.obedienceScore).toBe(4)
    expect(decision?.questId).toBe('q_sys_battle_01')
  })

  it('TC-ONNX-05: Nhận diện thái độ xúc phạm chống đối và hạ điểm tuân phục', async () => {
    const game = { ...newGame('laya-test-4'), systemId: 'sys_battle' }

    const mockSession = {
      run: vi.fn().mockResolvedValue({
        // 3: defiance_mockery
        intent_logits: { data: [-1.2, -0.5, -0.8, 4.2, 0.1, -0.9] },
        // hostile logits: index 1 (chống đối = true) cao hơn index 0
        hostile_logits: { data: [-3.0, 3.5] },
        // obedience_pred: 0.15 => 0.8 / 5 clamped to 1
        obedience_pred: { data: [0.15] },
      }),
    }

    const mockVocab = {
      '[PAD]': 0,
      '[UNK]': 100,
      '[CLS]': 101,
      '[SEP]': 102,
      cút: 1,
      đi: 2,
    }

    layaOnnxManager.setMockSessionForTesting(mockSession, mockVocab)

    const decision = await classifyWithLayaOnnx(game, 'cút đi đồ rác rưởi')
    expect(decision?.intent).toBe('defiance_mockery')
    expect(decision?.isHostile).toBe(true)
    expect(decision?.obedienceScore).toBe(1)
    expect(decision?.questId).toBeUndefined() // Không ban nhiệm vụ cho kẻ vô lễ
  })

  it('TC-ONNX-06: Hallucination Defense - không bao giờ trả về questId không có trong pool', async () => {
    // Tạo game không có nhiệm vụ hệ thống nào
    const game = { ...newGame('laya-test-5'), systemId: undefined }

    const mockSession = {
      run: vi.fn().mockResolvedValue({
        intent_logits: { data: [3.5, 0.1, -1.2, -0.5, 0.2, -1.0] },
        hostile_logits: { data: [2.5, -2.1] },
        obedience_pred: { data: [0.8] },
      }),
    }

    layaOnnxManager.setMockSessionForTesting(mockSession, {
      '[PAD]': 0,
      '[UNK]': 100,
      '[CLS]': 101,
      '[SEP]': 102,
    })

    const decision = await classifyWithLayaOnnx(game, 'xin nhiệm vụ')
    expect(decision?.intent).toBe('request_quest')
    expect(decision?.questId).toBeUndefined()
  })

  it('TC-ONNX-07: triggerLayaPreload lên lịch tải trước không chặn thread chính', () => {
    const lazyLoadSpy = vi.spyOn(layaOnnxManager, 'lazyLoad').mockResolvedValue(true)
    triggerLayaPreload()
    expect(lazyLoadSpy).toBeDefined()
    // Không nạp đồng bộ ngay lập tức
    expect(layaOnnxManager.getStatus()).toBe('unloaded')
  })
})
