import { describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import { endingEpilogue } from '../src/ui/endingEpilogue'

describe('ending epilogue', () => {
  it('reflects named relationship choices and route companions in four bilingual paragraphs', () => {
    const base = newGame('epilogue')
    const game = { ...base, endingId: 'forgiven_enemy', flags: { ...base.flags, story_meihua_trusted: true, story_ha_free: true, story_khoa_trusted: true, story_meihua_companion: true } }
    const vi = endingEpilogue(game, 'vi')
    const en = endingEpilogue(game, 'en')
    expect(vi).toHaveLength(4)
    expect(en).toHaveLength(4)
    expect(vi.join(' ')).toContain('Hà')
    expect(vi.join(' ')).toContain('Khoa')
    expect(en.join(' ')).toContain('Khoa')
  })
})
