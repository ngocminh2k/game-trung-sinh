import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildSystemPayload, requestSystemReply } from '../src/ai/system'
import { newGame } from '../src/engine'

describe('S06 System AI boundary', () => {
  beforeEach(() => vi.stubEnv('VITE_AI_NARRATION_ENABLED', 'true'))
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('builds a bounded payload from the selected System quest pool only', () => {
    const game = { ...newGame('system-ai'), systemId: 'sys_battle' }
    const payload = buildSystemPayload(game, '  hello\n system  ', 'en')

    expect(payload).toMatchObject({
      mode: 'chat',
      locale: 'en',
      system: { id: 'sys_battle' },
      playerMessage: 'hello system',
    })
    expect(payload?.questPool).toHaveLength(6)
    expect(payload?.questPool.every((quest) => quest.id.startsWith('q_sys_battle_'))).toBe(true)
  })

  it('accepts a reply offering only a pooled quest and sanitizes text', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ kind: 'offer_quest', questId: 'q_sys_battle_01', textVi: '  Nhiệm vụ\nđã tải. ', textEn: ' Quest\nloaded.  ' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(requestSystemReply({ ...newGame('system-ai-reply'), systemId: 'sys_battle' }, 'offer', 'en'))
      .resolves.toEqual({ kind: 'offer_quest', questId: 'q_sys_battle_01', textVi: 'Nhiệm vụ đã tải.', textEn: 'Quest loaded.' })
  })

  it('rejects unavailable, invalid, and disabled replies deterministically', async () => {
    const game = { ...newGame('system-ai-reject'), systemId: 'sys_battle' }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ kind: 'offer_quest', questId: 'q_sys_void_01', textVi: 'No.', textEn: 'No.' }),
    })
    vi.stubGlobal('fetch', fetchMock)
    await expect(requestSystemReply(game, 'offer', 'en')).resolves.toBeNull()

    vi.stubEnv('VITE_AI_NARRATION_ENABLED', 'false')
    await expect(requestSystemReply(game, 'offer', 'en')).resolves.toBeNull()
    expect(fetchMock).toHaveBeenCalledOnce()
  })
})
