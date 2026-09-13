import { describe, expect, it } from 'vitest'
import {
  DEFAULT_GLOBAL_PROFILE,
  GLOBAL_PROFILE_VERSION,
  mergeGlobalProfile,
  parseGlobalProfile,
  recordTerminal,
} from '../src/engine/globalProfile'

describe('GlobalProfile', () => {
  it('has valid default structure', () => {
    expect(DEFAULT_GLOBAL_PROFILE.version).toBe(GLOBAL_PROFILE_VERSION)
    expect(DEFAULT_GLOBAL_PROFILE.unlockedEndingIds).toEqual([])
    expect(DEFAULT_GLOBAL_PROFILE.unlockedAchievementIds).toEqual([])
    expect(DEFAULT_GLOBAL_PROFILE.highestNgPlusLevel).toBe(0)
    expect(DEFAULT_GLOBAL_PROFILE.totalRuns).toBe(0)
    expect(DEFAULT_GLOBAL_PROFILE.inheritedRelicId).toBeNull()
  })

  it('parses valid raw profile safely', () => {
    const raw = {
      version: 1,
      unlockedEndingIds: ['peace_ending', 'wealth_ending'],
      unlockedAchievementIds: ['first_step'],
      highestNgPlusLevel: 2,
      totalRuns: 5,
      inheritedRelicId: 'spirit_pendant',
    }
    const parsed = parseGlobalProfile(raw)
    expect(parsed.unlockedEndingIds).toEqual(['peace_ending', 'wealth_ending'])
    expect(parsed.highestNgPlusLevel).toBe(2)
    expect(parsed.inheritedRelicId).toBe('spirit_pendant')
  })

  it('falls back to default on corrupt or invalid input', () => {
    expect(parseGlobalProfile(null)).toEqual(DEFAULT_GLOBAL_PROFILE)
    expect(parseGlobalProfile(undefined)).toEqual(DEFAULT_GLOBAL_PROFILE)
    expect(parseGlobalProfile('not-an-object')).toEqual(DEFAULT_GLOBAL_PROFILE)
    expect(parseGlobalProfile({ version: 999 })).toEqual(DEFAULT_GLOBAL_PROFILE)
    expect(parseGlobalProfile({ unlockedEndingIds: 'not-an-array' })).toEqual(DEFAULT_GLOBAL_PROFILE)
  })

  it('deduplicates and sorts ending and achievement IDs on parse', () => {
    const raw = {
      version: 1,
      unlockedEndingIds: ['wealth_ending', 'peace_ending', 'wealth_ending'],
      unlockedAchievementIds: ['quest_done', 'first_step', 'quest_done'],
      highestNgPlusLevel: 0,
      totalRuns: 1,
      inheritedRelicId: null,
    }
    const parsed = parseGlobalProfile(raw)
    expect(parsed.unlockedEndingIds).toEqual(['peace_ending', 'wealth_ending'])
    expect(parsed.unlockedAchievementIds).toEqual(['first_step', 'quest_done'])
  })

  it('merges new endings and achievements without losing existing ones', () => {
    const base = {
      ...DEFAULT_GLOBAL_PROFILE,
      unlockedEndingIds: ['ending_a'],
      unlockedAchievementIds: ['ach_1'],
    }
    const merged = mergeGlobalProfile(base, {
      endings: ['ending_b', 'ending_a'],
      achievements: ['ach_2'],
      ngPlus: 1,
    })
    expect(merged.unlockedEndingIds).toEqual(['ending_a', 'ending_b'])
    expect(merged.unlockedAchievementIds).toEqual(['ach_1', 'ach_2'])
    expect(merged.highestNgPlusLevel).toBe(1)
  })

  it('recordTerminal increments totalRuns and updates endings and ngPlus', () => {
    const base = DEFAULT_GLOBAL_PROFILE
    const updated = recordTerminal(base, 'tragic_death', ['first_step'], 1, 'wooden_sword')
    expect(updated.totalRuns).toBe(1)
    expect(updated.unlockedEndingIds).toEqual(['tragic_death'])
    expect(updated.unlockedAchievementIds).toEqual(['first_step'])
    expect(updated.highestNgPlusLevel).toBe(1)
    expect(updated.inheritedRelicId).toBe('wooden_sword')
  })

  it('recordTerminal handles null endingId gracefully', () => {
    const base = DEFAULT_GLOBAL_PROFILE
    const updated = recordTerminal(base, null, [], 0)
    expect(updated.totalRuns).toBe(1)
    expect(updated.unlockedEndingIds).toEqual([])
  })
})
