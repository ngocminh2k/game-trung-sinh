import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { classifySystemUtterance } from '../src/ai/jev-client'
import { fastClassifySystem, requestSystemReply } from '../src/ai/system'
import { newGame } from '../src/engine'

describe('JEV System One AI Classifier Integration', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_AI_NARRATION_ENABLED', 'true')
    vi.stubEnv('TYPESAFE_API_KEY', 'test_key_xyz')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('TC-01: Phân loại đúng intent và chỉ chọn questId có trong danh sách pool hợp lệ', async () => {
    const game = { ...newGame('jev-test-1'), systemId: 'sys_battle' }

    const mockJevResponse = {
      id: 'jev_123',
      model: 'jev-latest',
      answers: {
        intent: { value: 'request_quest', confidence: 0.98 },
        selectedQuestId: { value: 'q_sys_battle_01', confidence: 0.95 },
        obedienceScore: { value: 4 },
        isHostile: { value: false, probability: 0.01 },
      },
    }

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockJevResponse,
    })
    vi.stubGlobal('fetch', fetchMock)

    const decision = await classifySystemUtterance(game, 'Cho ta xin nhiệm vụ mới')

    expect(decision.intent).toBe('request_quest')
    expect(decision.questId).toBe('q_sys_battle_01')
    expect(decision.isHostile).toBe(false)
    expect(decision.obedienceScore).toBe(4)

    const firstCall = fetchMock.mock.calls[0]
    expect(firstCall).toBeDefined()
    const requestBody = JSON.parse(String(firstCall?.[1]?.body ?? '{}'))
    expect(requestBody.questions.selectedQuestId.options).toContain('q_sys_battle_01')
    expect(requestBody.questions.selectedQuestId.options).toContain('none')
  })

  it('TC-02: Nếu Jev trả về questId không có trong pool, tự động chuyển thành undefined', async () => {
    const game = { ...newGame('jev-test-2'), systemId: 'sys_battle' }

    const mockHallucinatedResponse = {
      id: 'jev_124',
      model: 'jev-latest',
      answers: {
        intent: { value: 'request_quest', confidence: 0.9 },
        selectedQuestId: { value: 'q_sys_hacked_alien_quest', confidence: 0.88 },
        obedienceScore: { value: 3 },
        isHostile: { value: false, probability: 0.05 },
      },
    }

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockHallucinatedResponse,
    }))

    const decision = await classifySystemUtterance(game, 'Có quest lạ không?')
    expect(decision.questId).toBeUndefined()
  })

  it('TC-03: Nhận diện người chơi xúc phạm Hệ Thống và kích hoạt cờ isHostile', async () => {
    const game = { ...newGame('jev-test-3'), systemId: 'sys_battle' }

    const mockHostileResponse = {
      id: 'jev_125',
      model: 'jev-latest',
      answers: {
        intent: { value: 'defiance_mockery', confidence: 0.99 },
        selectedQuestId: { value: 'none', confidence: 0.99 },
        obedienceScore: { value: 1 },
        isHostile: { value: true, probability: 0.98 },
      },
    }

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockHostileResponse,
    }))

    const decision = await classifySystemUtterance(game, 'Hệ thống rác rưởi, cút đi!')
    expect(decision.intent).toBe('defiance_mockery')
    expect(decision.isHostile).toBe(true)
    expect(decision.obedienceScore).toBe(1)
  })

  it('TC-04: Tự động rơi về Fallback Rule-based an toàn khi fetch bị lỗi hoặc timeout', async () => {
    const game = { ...newGame('jev-test-4'), systemId: 'sys_battle' }

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network disconnected')))

    const decision = await classifySystemUtterance(game, 'Ta muốn xin nhiệm vụ kiếm linh thạch')

    expect(decision.intent).toBe('request_quest')
    expect(decision.questId).toBe('q_sys_battle_01')
    expect(decision.isHostile).toBe(false)
  })

  it('TC-05: Chạy chế độ Offline Fallback hoàn toàn nếu không truyền API Key', async () => {
    vi.stubEnv('TYPESAFE_API_KEY', '')
    const game = { ...newGame('jev-test-5'), systemId: 'sys_battle' }
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    const decision = await classifySystemUtterance(game, 'Ngươi thật vô dụng', { apiKey: '' })
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(decision.intent).toBe('defiance_mockery')
    expect(decision.isHostile).toBe(true)
  })

  it('TC-06: Kiểm thử luồng 2-tier pipeline đầu-cuối kết hợp fastClassifySystem và requestSystemReply', async () => {
    const game = { ...newGame('jev-test-6'), systemId: 'sys_battle' }

    const mockJevResponse = {
      id: 'jev_tc06',
      model: 'jev-latest',
      answers: {
        intent: { value: 'request_quest', confidence: 0.96 },
        selectedQuestId: { value: 'q_sys_battle_01', confidence: 0.94 },
        obedienceScore: { value: 4 },
        isHostile: { value: false, probability: 0.02 },
      },
    }

    const mockNarrateResponse = {
      kind: 'offer_quest',
      questId: 'q_sys_battle_01',
      textVi: '【Hệ Thống Chiến Đấu】: Ký chủ hãy nhận lấy thử thách đầu tiên!',
      textEn: '[Combat System]: Host, accept your first trial!',
    }

    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('systemone')) {
        return {
          ok: true,
          json: async () => mockJevResponse,
        }
      }
      return {
        ok: true,
        json: async () => mockNarrateResponse,
      }
    })
    vi.stubGlobal('fetch', fetchMock)

    // Tier 1 Fast reflex classification directly via fastClassifySystem
    const fastDecision = await fastClassifySystem(game, 'Cho ta xin nhiệm vụ mới')
    expect(fastDecision.intent).toBe('request_quest')
    expect(fastDecision.questId).toBe('q_sys_battle_01')
    expect(fastDecision.isHostile).toBe(false)
    expect(fastDecision.obedienceScore).toBe(4)

    // Tier 2 End-to-end reply via requestSystemReply
    const reply = await requestSystemReply(game, 'Cho ta xin nhiệm vụ mới', 'vi')
    expect(reply).not.toBeNull()
    expect(reply?.kind).toBe('offer_quest')
    expect(reply?.questId).toBe('q_sys_battle_01')
    expect(reply?.textVi).toBe('【Hệ Thống Chiến Đấu】: Ký chủ hãy nhận lấy thử thách đầu tiên!')
    expect(reply?.textEn).toBe('[Combat System]: Host, accept your first trial!')

    // Verify both Tier 1 (Jev) and Tier 2 (/api/narrate) were invoked
    const calls = fetchMock.mock.calls
    expect(calls.some(([url]) => typeof url === 'string' && url.includes('systemone'))).toBe(true)
    expect(calls.some(([url]) => url === '/api/narrate')).toBe(true)

    // Verify Tier 2 received fastDecision in payload
    const narrateCall = calls.find(([url]) => url === '/api/narrate')
    expect(narrateCall).toBeDefined()
    const narrateBody = JSON.parse(String(narrateCall?.[1]?.body ?? '{}'))
    expect(narrateBody.mode).toBe('offer_quest')
    expect(narrateBody.fastDecision?.intent).toBe('request_quest')
    expect(narrateBody.fastDecision?.questId).toBe('q_sys_battle_01')
  })

  it('TC-07: Suy giảm êm dịu khi /api/narrate thất bại hoặc timeout, trả về SystemReply tất định với khẩu khí hệ thống', async () => {
    const game = { ...newGame('jev-test-7'), systemId: 'sys_battle' }

    // Case A: /api/narrate returns HTTP 500 error after valid Jev Tier 1
    const mockJevResponse = {
      id: 'jev_tc07',
      model: 'jev-latest',
      answers: {
        intent: { value: 'request_quest', confidence: 0.95 },
        selectedQuestId: { value: 'q_sys_battle_01', confidence: 0.92 },
        obedienceScore: { value: 4 },
        isHostile: { value: false, probability: 0.01 },
      },
    }

    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('systemone')) {
        return {
          ok: true,
          json: async () => mockJevResponse,
        }
      }
      return {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'LLM backend down' }),
      }
    }))

    const replyOn500 = await requestSystemReply(game, 'Ban bố nhiệm vụ cho ta', 'vi')
    expect(replyOn500).not.toBeNull()
    expect(replyOn500?.kind).toBe('offer_quest')
    expect(replyOn500?.questId).toBe('q_sys_battle_01')
    expect(replyOn500?.textVi).toContain('【Hệ Thống Chiến Đấu】: Ký chủ yêu cầu nhiệm vụ. Ban bố: [【Chiến Đấu I】 Thử Thách Máu]')
    expect(replyOn500?.textEn).toContain('[Battle System]: Host requested a task. Issued:')

    // Case B: /api/narrate throws network abort/timeout error
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('systemone')) {
        return {
          ok: true,
          json: async () => mockJevResponse,
        }
      }
      throw new DOMException('The operation was aborted.', 'AbortError')
    }))

    const replyOnTimeout = await requestSystemReply(game, 'Ban bố nhiệm vụ cho ta', 'vi')
    expect(replyOnTimeout).not.toBeNull()
    expect(replyOnTimeout?.kind).toBe('offer_quest')
    expect(replyOnTimeout?.questId).toBe('q_sys_battle_01')
    expect(replyOnTimeout?.textVi).toBeTruthy()
    expect(replyOnTimeout?.textVi).toContain('【Hệ Thống Chiến Đấu】')

    // Case C: General chat fallback when offline/failing preserves authentic system personality
    const mockJevChatResponse = {
      id: 'jev_tc07_chat',
      model: 'jev-latest',
      answers: {
        intent: { value: 'chat_general', confidence: 0.95 },
        selectedQuestId: { value: 'none', confidence: 0.95 },
        obedienceScore: { value: 3 },
        isHostile: { value: false, probability: 0.01 },
      },
    }
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('systemone')) {
        return {
          ok: true,
          json: async () => mockJevChatResponse,
        }
      }
      throw new Error('LLM offline')
    }))

    const chatReply = await requestSystemReply(game, 'Ngươi là ai?', 'vi')
    expect(chatReply).not.toBeNull()
    expect(chatReply?.kind).toBe('chat')
    expect(chatReply?.textVi).toContain('【Hệ Thống Chiến Đấu】')
    expect(chatReply?.textVi.length).toBeGreaterThan(0)
    expect(chatReply?.textEn.length).toBeGreaterThan(0)
  })
})

