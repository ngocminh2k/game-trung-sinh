import { describe, expect, it } from 'vitest'
import { newGame, validateGameState } from '../src/engine'
import { DEFAULT_GLOBAL_PROFILE, recordTerminal } from '../src/engine/globalProfile'

describe('newGame NG+ options (issue #14 — AC2)', () => {
  it('defaults to first life: ngPlusLevel 0, no inherited relic', () => {
    const s = newGame('ng-default')
    expect(s.ngPlusLevel).toBe(0)
    expect(s.inheritedRelicId).toBeNull()
  })

  it('stamps the cycle and seeds the relic into the starting inventory', () => {
    const s = newGame('ng-plus-1', { ngPlusLevel: 1, inheritedRelicId: 'jade_charm' })
    expect(s.ngPlusLevel).toBe(1)
    expect(s.inheritedRelicId).toBe('jade_charm')
    expect(s.inventory['jade_charm']).toBe(1)
    // Starting kit is untouched otherwise.
    expect(s.inventory['wooden_staff']).toBe(1)
    expect(s.inventory['tattered_robe']).toBe(1)
  })

  it('explicit null relic produces the plain starting kit', () => {
    const s = newGame('ng-plus-null', { ngPlusLevel: 2, inheritedRelicId: null })
    expect(s.ngPlusLevel).toBe(2)
    expect(s.inheritedRelicId).toBeNull()
    expect(Object.keys(s.inventory)).toHaveLength(4)
  })
})

describe('NG+ save migration', () => {
  it('a legacy save without NG+ fields parses into a first-life run', () => {
    const legacy = newGame('legacy-save')
    delete legacy.ngPlusLevel
    delete legacy.inheritedRelicId
    const parsed = validateGameState(legacy)
    expect(parsed.ngPlusLevel).toBe(0)
    expect(parsed.inheritedRelicId).toBeNull()
  })

  it('an NG+ save round-trips its cycle and relic', () => {
    const next = validateGameState(newGame('round-trip', { ngPlusLevel: 3, inheritedRelicId: 'spirit_ring' }))
    expect(next.ngPlusLevel).toBe(3)
    expect(next.inheritedRelicId).toBe('spirit_ring')
  })
})

describe('global profile records terminal runs', () => {
  it('recordTerminal stamps totals and relic without touching defaults', () => {
    const after = recordTerminal(
      { ...DEFAULT_GLOBAL_PROFILE },
      'ending_secluded_life',
      ['socialite'],
      2,
      'moonstone_pendant',
    )
    expect(after.totalRuns).toBe(1)
    expect(after.unlockedEndingIds).toEqual(['ending_secluded_life'])
    expect(after.unlockedAchievementIds).toEqual(['socialite'])
    expect(after.highestNgPlusLevel).toBe(2)
    expect(after.inheritedRelicId).toBe('moonstone_pendant')
  })
})
