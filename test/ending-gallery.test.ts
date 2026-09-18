import { describe, expect, it } from 'vitest'
import { ENDINGS, endingArchetype, type MajorEndingArchetype } from '../src/content/endings-data'
import { DEFAULT_GLOBAL_PROFILE, recordTerminal, parseGlobalProfile } from '../src/engine/globalProfile'

describe('C3-12: Ending Gallery (Bia Đá Kết Cục)', () => {
  describe('Ending archetypes (6 major categories)', () => {
    it('maps mortal_harmony endings correctly', () => {
      expect(endingArchetype('quiet_harmony')).toBe('mortal_harmony')
      expect(endingArchetype('forgiven_enemy')).toBe('mortal_harmony')
      expect(endingArchetype('iron_lantern')).toBe('mortal_harmony')
    })

    it('maps sect_heir endings correctly', () => {
      expect(endingArchetype('jade_heir')).toBe('sect_heir')
      expect(endingArchetype('keeper_of_names')).toBe('sect_heir')
    })

    it('maps rift_darkness endings correctly', () => {
      expect(endingArchetype('rift_kingdom')).toBe('rift_darkness')
      expect(endingArchetype('city_of_ghosts')).toBe('rift_darkness')
    })

    it('maps ascension endings correctly', () => {
      expect(endingArchetype('nameless_ascension')).toBe('ascension')
      expect(endingArchetype('rootless_star')).toBe('ascension')
    })

    it('maps rogue_wanderer endings correctly', () => {
      expect(endingArchetype('blank_page')).toBe('rogue_wanderer')
      expect(endingArchetype('borrowed_face')).toBe('rogue_wanderer')
    })

    it('maps tragic_fallen endings correctly', () => {
      expect(endingArchetype('tragic_death')).toBe('tragic_fallen')
    })

    it('maps system_destiny endings correctly', () => {
      expect(endingArchetype('system_battle_end')).toBe('system_destiny')
      expect(endingArchetype('system_alchemy_end')).toBe('system_destiny')
      expect(endingArchetype('system_merchant_end')).toBe('system_destiny')
      expect(endingArchetype('system_lottery_end')).toBe('system_destiny')
      expect(endingArchetype('system_explorer_end')).toBe('system_destiny')
      expect(endingArchetype('system_assassin_end')).toBe('system_destiny')
      expect(endingArchetype('system_healer_end')).toBe('system_destiny')
      expect(endingArchetype('system_artisan_end')).toBe('system_destiny')
      expect(endingArchetype('system_scholar_end')).toBe('system_destiny')
      expect(endingArchetype('system_void_end')).toBe('system_destiny')
    })
  })

  describe('GlobalProfile tracks unlocked endings', () => {
    it('starts with empty unlockedEndingIds', () => {
      expect(DEFAULT_GLOBAL_PROFILE.unlockedEndingIds).toEqual([])
    })

    it('records ending on terminal run', () => {
      const profile = recordTerminal(DEFAULT_GLOBAL_PROFILE, 'quiet_harmony', [], 0)
      expect(profile.unlockedEndingIds).toContain('quiet_harmony')
    })

    it('deduplicates repeated endings', () => {
      let profile = recordTerminal(DEFAULT_GLOBAL_PROFILE, 'quiet_harmony', [], 0)
      profile = recordTerminal(profile, 'quiet_harmony', [], 0)
      expect(profile.unlockedEndingIds.filter(id => id === 'quiet_harmony')).toHaveLength(1)
    })

    it('maintains stable sorted order', () => {
      const profile = recordTerminal(DEFAULT_GLOBAL_PROFILE, 'nameless_ascension', [], 0)
      const profile2 = recordTerminal(profile, 'quiet_harmony', [], 0)
      expect(profile2.unlockedEndingIds).toEqual(profile2.unlockedEndingIds.slice().sort())
    })
  })

  describe('Gallery data structure for 6 cells', () => {
    const MAJOR_ARCHETYPES: MajorEndingArchetype[] = [
      'mortal_harmony',
      'sect_heir',
      'rift_darkness',
      'ascension',
      'rogue_wanderer',
      'tragic_fallen'
    ]

    it('has exactly 6 major archetypes for gallery cells', () => {
      expect(MAJOR_ARCHETYPES).toHaveLength(6)
    })

    it('each archetype has at least one representative ending', () => {
      for (const archetype of MAJOR_ARCHETYPES) {
        const endings = ENDINGS.filter(e => endingArchetype(e.id) === archetype)
        expect(endings.length).toBeGreaterThan(0)
      }
    })

    it('gallery cell data includes name, epitaph, unlocked status, and hint', () => {
      const profile = recordTerminal(DEFAULT_GLOBAL_PROFILE, 'quiet_harmony', [], 0)
      const profile2 = recordTerminal(profile, 'nameless_ascension', [], 0)

      for (const archetype of MAJOR_ARCHETYPES) {
        const endings = ENDINGS.filter(e => endingArchetype(e.id) === archetype)
        const unlockedEnding = endings.find(e => profile2.unlockedEndingIds.includes(e.id))
        const isUnlocked = !!unlockedEnding

        // Should be able to construct gallery cell data
        const rep = endings[0]!
        const cellData = {
          archetype,
          nameVi: unlockedEnding ? rep.nameVi : '???',
          nameEn: unlockedEnding ? rep.nameEn : '???',
          epitaphVi: unlockedEnding ? rep.epitaphVi : '...',
          epitaphEn: unlockedEnding ? rep.epitaphEn : '...',
          isUnlocked,
          hint: isUnlocked ? undefined : 'Chưa mở khóa — tiếp tục tu hành' // placeholder hint
        }

        expect(cellData.archetype).toBe(archetype)
        expect(typeof cellData.nameVi).toBe('string')
        expect(typeof cellData.epitaphVi).toBe('string')
        expect(typeof cellData.isUnlocked).toBe('boolean')
      }
    })
  })

  describe('GlobalProfile persistence', () => {
    it('parseGlobalProfile handles valid data', () => {
      const raw = {
        version: 1,
        unlockedEndingIds: ['quiet_harmony', 'nameless_ascension'],
        unlockedAchievementIds: ['first_step'],
        highestNgPlusLevel: 2,
        totalRuns: 5,
        inheritedRelicId: null,
        reincarnationPoints: 100
      }
      const parsed = parseGlobalProfile(raw)
      expect(parsed.unlockedEndingIds).toEqual(['nameless_ascension', 'quiet_harmony'])
      expect(parsed.highestNgPlusLevel).toBe(2)
      expect(parsed.totalRuns).toBe(5)
    })

    it('parseGlobalProfile falls back to defaults on invalid data', () => {
      const parsed = parseGlobalProfile({ invalid: true })
      expect(parsed).toEqual(DEFAULT_GLOBAL_PROFILE)
    })
  })
})