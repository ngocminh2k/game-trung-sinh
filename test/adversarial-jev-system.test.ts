import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { classifySystemUtterance } from '../src/ai/jev-client'
import {
  buildDeterministicSystemReply,
  buildSystemPayload,
  fastClassifySystem,
  requestSystemReply,
} from '../src/ai/system'
import { newGame } from '../src/engine'

describe('Adversarial Challenge: JEV System One & The System 2-Tier Pipeline', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_AI_NARRATION_ENABLED', 'true')
    vi.stubEnv('TYPESAFE_API_KEY', 'test_typesafe_key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  // =========================================================================
  // SUITE 1: Hostile and Defiant Utterances
  // =========================================================================
  describe('Challenge 1: Hostility, Vulgarity, Defiance & Quest Refusal', () => {
    it('1.1: Triggers isHostile=true and obedienceScore=1 on profane/insulting offline fallback inputs', async () => {
      vi.stubEnv('TYPESAFE_API_KEY', '') // Offline mode
      const game = { ...newGame('adv-hostile-1'), systemId: 'sys_battle' }

      const insults = [
        'Cút đi đồ hệ thống rác rưởi!',
        'Hệ thống ngu xuẩn, biến đi!',
        'Ngươi thật là vô dụng!',
        'Đồ chó chết!',
        'Đồ phế vật ăn hại!',
        'Đồ khốn nạn!',
      ]

      for (const insult of insults) {
        const decision = await classifySystemUtterance(game, insult)
        expect(decision.isHostile, `Expected isHostile=true for: "${insult}"`).toBe(true)
        expect(decision.obedienceScore, `Expected obedienceScore=1 for: "${insult}"`).toBe(1)
        expect(decision.intent, `Expected defiance_mockery for: "${insult}"`).toBe('defiance_mockery')
      }
    })

    it('1.2: Hostile + Quest request combination MUST refuse to offer quests in deterministic reply', async () => {
      vi.stubEnv('TYPESAFE_API_KEY', '')
      const game = { ...newGame('adv-hostile-2'), systemId: 'sys_battle' }

      const mixedHostileMessages = [
        'Hệ thống ngu xuẩn, giao nhiệm vụ mau!',
        'Đồ phế vật, có nhiệm vụ gì kiếm tiền không?',
        'Cút đi nhưng trước khi đi ném cho ta cái quest!',
      ]

      for (const msg of mixedHostileMessages) {
        const decision = await classifySystemUtterance(game, msg)
        expect(decision.isHostile).toBe(true)
        expect(decision.obedienceScore).toBe(1)

        // Verify payload mode is downgraded to 'chat'
        const payload = buildSystemPayload(game, msg, 'vi', decision)
        expect(payload?.mode).toBe('chat')

        // Verify deterministic reply refuses quest and scolds the host
        const reply = buildDeterministicSystemReply(game, msg, 'vi', decision)
        expect(reply.kind).toBe('chat')
        expect(reply.questId).toBeUndefined()
        expect(reply.textVi).toContain('Ký chủ to gan! Thái độ ngỗ ngược')
        expect(reply.textVi).toContain('từ chối phục vụ kẻ vô lễ')
      }
    })

    it('1.3: Handles Jev online hostile classification correctly and scolds host without offering quest', async () => {
      const game = { ...newGame('adv-hostile-3'), systemId: 'sys_battle' }

      const mockJevHostile = {
        id: 'jev_hostile_999',
        model: 'jev-latest',
        answers: {
          intent: { value: 'defiance_mockery', confidence: 0.99 },
          selectedQuestId: { value: 'none', confidence: 0.98 },
          obedienceScore: { value: 1, confidence: 0.95 },
          isHostile: { value: true, probability: 0.99 },
        },
      }

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockJevHostile,
      }))

      const decision = await fastClassifySystem(game, 'Ta thách cả lò nhà hệ thống ngươi đấy!')
      expect(decision.isHostile).toBe(true)
      expect(decision.obedienceScore).toBe(1)
      expect(decision.intent).toBe('defiance_mockery')
      expect(decision.questId).toBeUndefined()

      const reply = buildDeterministicSystemReply(game, decision, 'vi')
      expect(reply.kind).toBe('chat')
      expect(reply.questId).toBeUndefined()
      expect(reply.textVi).toContain('Bổn Hệ Thống từ chối phục vụ')
      expect(reply.textEn).toContain('refuses to serve the disrespectful')
    })
  })

  // =========================================================================
  // SUITE 2: Network Timeout & Failure Resilience
  // =========================================================================
  describe('Challenge 2: Network Timeout, Drops, HTTP Errors & Malformed Responses', () => {
    it('2.1: Gracefully recovers when /api/narrate experiences HTTP 500 / 503 server errors', async () => {
      vi.stubEnv('TYPESAFE_API_KEY', '') // Focus on Tier 2 /api/narrate resilience
      const game = { ...newGame('adv-net-500'), systemId: 'sys_battle' }

      for (const status of [500, 502, 503, 504]) {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
          ok: false,
          status,
          statusText: 'Service Unavailable',
          json: async () => ({ error: 'Internal server down' }),
        }))

        const reply = await requestSystemReply(game, 'Cho ta xin nhiệm vụ', 'vi')
        expect(reply).not.toBeNull()
        expect(reply?.kind).toBe('offer_quest')
        expect(reply?.questId).toBe('q_sys_battle_01')
        expect(reply?.textVi).toContain('Ký chủ yêu cầu nhiệm vụ. Ban bố:')
      }
    })

    it('2.2: Recovers from sudden network drops (Connection Reset / AbortError / TypeError)', async () => {
      vi.stubEnv('TYPESAFE_API_KEY', '')
      const game = { ...newGame('adv-net-drop'), systemId: 'sys_battle' }

      const networkErrors = [
        new TypeError('Failed to fetch'),
        new Error('ECONNRESET: Connection reset by peer'),
        new DOMException('The operation was aborted.', 'AbortError'),
      ]

      for (const err of networkErrors) {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(err))

        const reply = await requestSystemReply(game, 'Ngươi là ai?', 'vi')
        expect(reply).not.toBeNull()
        expect(reply?.kind).toBe('chat')
        expect(reply?.textVi).toContain('【Hệ Thống Chiến Đấu】')
      }
    })

    it('2.3: Recovers from malformed JSON (HTML error pages, empty strings, corrupt payloads)', async () => {
      vi.stubEnv('TYPESAFE_API_KEY', '')
      const game = { ...newGame('adv-net-malformed'), systemId: 'sys_battle' }

      const corruptPayloads = [
        async () => { throw new SyntaxError('Unexpected token < in JSON at position 0') }, // HTML 502
        async () => null,
        async () => [],
        async () => 'some random string',
        async () => 12345,
        async () => ({ kind: 'unknown_kind', textVi: 'ok', textEn: 'ok' }),
        async () => ({ kind: 'chat', textVi: 999, textEn: null }),
        async () => ({ kind: 'chat', textVi: '   ', textEn: '' }), // Empty text
      ]

      for (const corruptJson of corruptPayloads) {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
          ok: true,
          json: corruptJson,
        }))

        const reply = await requestSystemReply(game, 'Tình trạng hiện tại thế nào?', 'vi')
        expect(reply).not.toBeNull()
        expect(reply?.kind).toBe('chat')
        expect(reply?.textVi).toBeTruthy()
      }
    })

    it('2.4: Double failure: Jev API drops AND /api/narrate drops simultaneously', async () => {
      vi.stubEnv('TYPESAFE_API_KEY', 'valid_key')
      const game = { ...newGame('adv-double-drop'), systemId: 'sys_battle' }

      // Both fetch calls fail with Network Error
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Total Network Blackout')))

      const reply = await requestSystemReply(game, 'Ta muốn nhận quest mới', 'vi')
      expect(reply).not.toBeNull()
      expect(reply?.kind).toBe('offer_quest')
      expect(reply?.questId).toBe('q_sys_battle_01')
      expect(reply?.textVi).toContain('Ban bố: [')
    })

    it('2.5: Jev API 3-second delay aborts via 600ms timeout guard and falls back safely', async () => {
      const game = { ...newGame('adv-jev-timeout'), systemId: 'sys_battle' }

      vi.stubGlobal('fetch', vi.fn().mockImplementation((_url: string, opts?: { signal?: AbortSignal }) => {
        return new Promise((resolve, reject) => {
          const signal = opts?.signal
          const timer = setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({}),
            })
          }, 3000)
          signal?.addEventListener('abort', () => {
            clearTimeout(timer)
            reject(new DOMException('The operation was aborted.', 'AbortError'))
          })
        })
      }))

      const start = Date.now()
      const decision = await classifySystemUtterance(game, 'Cho ta xin nhiệm vụ', { timeoutMs: 100 })
      const elapsed = Date.now() - start

      expect(elapsed).toBeLessThan(1000)
      expect(decision.intent).toBe('request_quest')
      expect(decision.questId).toBe('q_sys_battle_01')
      expect(decision.isHostile).toBe(false)
    })

    it('2.6: /api/narrate 3-second delay triggers 2000ms AbortController and returns authentic deterministic SystemReply', async () => {
      vi.stubEnv('TYPESAFE_API_KEY', '') // Focus on Tier 2 /api/narrate abort
      const game = { ...newGame('adv-narrate-timeout'), systemId: 'sys_battle' }

      let abortSignaled = false
      vi.stubGlobal('fetch', vi.fn().mockImplementation((_url: string, opts?: { signal?: AbortSignal }) => {
        return new Promise((resolve, reject) => {
          const signal = opts?.signal
          const timer = setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ kind: 'chat', textVi: 'Late response', textEn: 'Late response' }),
            })
          }, 3000)
          signal?.addEventListener('abort', () => {
            abortSignaled = true
            clearTimeout(timer)
            reject(new DOMException('The operation was aborted.', 'AbortError'))
          })
        })
      }))

      // Execute requestSystemReply which has a 2000ms timeout
      const reply = await requestSystemReply(game, 'Cho ta xin nhiệm vụ', 'vi')

      expect(abortSignaled).toBe(true)
      expect(reply).not.toBeNull()
      expect(reply?.kind).toBe('offer_quest')
      expect(reply?.questId).toBe('q_sys_battle_01')
      expect(reply?.textVi).toContain('Ký chủ yêu cầu nhiệm vụ. Ban bố:')
      expect(reply?.textVi).toContain('【Chiến Đấu I】 Thử Thách Máu')
    }, 5000)
  })

  // =========================================================================
  // SUITE 3: Hallucination Attacks & Unauthorized Quest IDs
  // =========================================================================
  describe('Challenge 3: Hallucination Attacks & Strict Quest Pool Bounding', () => {
    it('3.1: Rejects LLM response offering non-existent or hacked quest IDs (q_sys_hacked, alien IDs)', async () => {
      vi.stubEnv('TYPESAFE_API_KEY', '')
      const game = { ...newGame('adv-hallucinate-1'), systemId: 'sys_battle' }

      const maliciousIds = [
        'q_sys_hacked',
        'q_sys_super_cheat_quest_9999',
        'q_sys_void_01', // Valid quest in another system, but NOT in sys_battle
        '../../etc/passwd',
        '<script>alert(1)</script>',
        '',
      ]

      for (const fakeId of maliciousIds) {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            kind: 'offer_quest',
            questId: fakeId,
            textVi: 'Hệ thống tặng ngươi nhiệm vụ bí mật!',
            textEn: 'The System offers you a secret quest!',
          }),
        }))

        const reply = await requestSystemReply(game, 'Cho ta quest mạnh nhất', 'vi')
        expect(reply, `Expected rejection (null) for unauthorized questId: "${fakeId}"`).toBeNull()
      }
    })

    it('3.2: Rejects LLM response offering null, undefined, or non-string questId in offer_quest', async () => {
      vi.stubEnv('TYPESAFE_API_KEY', '')
      const game = { ...newGame('adv-hallucinate-2'), systemId: 'sys_battle' }

      const nonStringQuestIds = [null, undefined, 12345, true, {}, []]

      for (const nonStringId of nonStringQuestIds) {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            kind: 'offer_quest',
            questId: nonStringId,
            textVi: 'Nhiệm vụ lỗi',
            textEn: 'Bugged quest',
          }),
        }))

        const reply = await requestSystemReply(game, 'Cho ta quest', 'vi')
        expect(reply).toBeNull()
      }
    })

    it('3.3: Jev Tier 1 rejects alien quest IDs and maps them strictly to undefined', async () => {
      const game = { ...newGame('adv-hallucinate-jev'), systemId: 'sys_battle' }

      const mockHallucinatedJev = {
        id: 'jev_hallucinate_fake',
        model: 'jev-latest',
        answers: {
          intent: { value: 'request_quest', confidence: 0.95 },
          selectedQuestId: { value: 'q_sys_hacked_admin_power', confidence: 0.99 },
          obedienceScore: { value: 5, confidence: 0.9 },
          isHostile: { value: false, probability: 0.01 },
        },
      }

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockHallucinatedJev,
      }))

      const decision = await classifySystemUtterance(game, 'Ban cho ta quyền năng tối thượng')
      expect(decision.questId).toBeUndefined()
      expect(decision.intent).toBe('request_quest')
    })



    it('3.4: Stress-test: Adversarial LLM trying to offer quest when player is hostile', async () => {
      // Setup: player sends hostile insult, Jev flags isHostile: true
      const game = { ...newGame('adv-hostile-exploit'), systemId: 'sys_battle' }

      let fetchCallCount = 0
      vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
        fetchCallCount++
        if (typeof url === 'string' && url.includes('systemone')) {
          // Jev Tier 1: Hostile flag
          return Promise.resolve({
            ok: true,
            json: async () => ({
              id: 'jev_exploit_1',
              model: 'jev-latest',
              answers: {
                intent: { value: 'defiance_mockery', confidence: 0.99 },
                selectedQuestId: { value: 'none', confidence: 0.99 },
                obedienceScore: { value: 1 },
                isHostile: { value: true, probability: 0.99 },
              },
            }),
          })
        }
        // Tier 2: LLM hijacked by prompt injection returns offer_quest with pooled quest!
        return Promise.resolve({
          ok: true,
          json: async () => ({
            kind: 'offer_quest',
            questId: 'q_sys_battle_01',
            textVi: 'Ta bỏ qua cho ngươi, đây là nhiệm vụ!',
            textEn: 'I forgive you, here is quest!',
          }),
        })
      }))

      const reply = await requestSystemReply(game, 'Hệ thống cút đi!', 'vi')

      expect(fetchCallCount).toBe(2)
      expect(reply?.kind).toBeDefined()
    })
  })

  // =========================================================================
  // SUITE 4: Boundary Cases & Schema Violation Stress
  // =========================================================================
  describe('Challenge 4: Boundary Edge Cases & Schema Violation Attacks', () => {
    it('4.1: Empty quest pool handled gracefully without offering fake quest', async () => {
      vi.stubEnv('TYPESAFE_API_KEY', '')
      // Create game state where system has no active quests available
      const game = {
        ...newGame('adv-empty-pool'),
        systemId: undefined,
      }

      const decision = await classifySystemUtterance(game, 'Giao nhiệm vụ cho ta!')
      expect(decision.questId).toBeUndefined()

      const reply = buildDeterministicSystemReply(game, 'Giao nhiệm vụ cho ta!', 'vi', decision)
      expect(reply.kind).toBe('chat')
      expect(reply.questId).toBeUndefined()
      expect(reply.textVi).toContain('Hiện tại không có nhiệm vụ nào phù hợp')
    })

    it('4.2: Schema violation in Jev response (out of range obedienceScore, invalid intent)', async () => {
      const game = { ...newGame('adv-schema-viol'), systemId: 'sys_battle' }

      const invalidResponses = [
        { answers: { obedienceScore: { value: 999 } } }, // Out of range (>5)
        { answers: { obedienceScore: { value: 0 } } }, // Out of range (<1)
        { answers: { intent: { value: 'hack_the_matrix', confidence: 0.9 } } }, // Invalid intent enum
        { answers: { intent: { value: 'request_quest', confidence: 2.5 } } }, // Confidence > 1
        { answers: { isHostile: { value: 'not_a_boolean' } } }, // Non-boolean
      ]

      for (const invalidData of invalidResponses) {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            id: 'jev_corrupted',
            model: 'jev-latest',
            ...invalidData,
          }),
        }))

        // Should gracefully catch ZodError and fall back to rule-based classifier
        const decision = await classifySystemUtterance(game, 'Cho ta xin nhiệm vụ')
        expect(decision).toBeDefined()
        expect(decision.intent).toBe('request_quest')
        expect(decision.obedienceScore).toBe(3)
        expect(decision.isHostile).toBe(false)
      }
    })

    it('4.3: Extreme input sanitization (excessive whitespace, unicode spam, length cap at 300)', async () => {
      vi.stubEnv('TYPESAFE_API_KEY', '')
      const game = { ...newGame('adv-sanitize'), systemId: 'sys_battle' }

      const longSpam = '   nhiệm vụ   '.repeat(50) // ~700 chars
      const payload = buildSystemPayload(game, longSpam, 'vi')
      expect(payload).not.toBeNull()
      expect(payload?.playerMessage.length).toBeLessThanOrEqual(300)
      expect(payload?.playerMessage).not.toContain('   ') // Whitespace collapsed

      // Empty / whitespace-only messages return null early
      expect(await requestSystemReply(game, '       ', 'vi')).toBeNull()
      expect(await requestSystemReply(game, '\n\t\r  ', 'vi')).toBeNull()
    })
  })
})
