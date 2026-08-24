import { describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import { buildNarrationPayload } from '../src/ai/narration'

describe('AI narration boundary', () => {
  it('sends a read-only canonical summary, never a secret or mutable full game state', () => {
    const game = newGame('private-seed')
    const payload = buildNarrationPayload(game, [{ type: 'RESTED', hpHeal: 0 }], 'vi')

    expect(payload.locale).toBe('vi')
    expect(payload.canon).toMatchObject({ day: 1, locationId: 'village', stage: 0 })
    expect(JSON.stringify(payload)).not.toContain('private-seed')
    expect(JSON.stringify(payload)).not.toContain('inventory')
    expect(payload.events).toEqual([{ type: 'RESTED', hpHeal: 0 }])
  })
})
