import { describe, expect, it } from 'vitest'
import { BEASTS } from '../src/content/beasts'
import { canTame, companionBuff, COMPANION_EXTRA_ACTION } from '../src/engine/companion'
import type { GameState } from '../src/engine/types'

describe('companion beasts', () => {
  it('has exactly 36 beasts (12 species × 3 tiers)', () => {
    expect(BEASTS).toHaveLength(36)
  })

  it('has unique ids', () => {
    expect(new Set(BEASTS.map((b) => b.id)).size).toBe(36)
  })

  it('has requiredBait that exists in item contracts', () => {
    const baits = new Set([
      'bait_white_tiger', 'bait_grey_wolf', 'bait_crane_spirit', 'bait_fox_spirit',
      'bait_dragon_serpent', 'bait_baby_qilin', 'bait_frost_boar', 'bait_blaze_hound',
      'bait_bee_queen', 'bait_peach_spirit', 'bait_turtle_imp', 'bait_storm_bird',
    ])
    for (const b of BEASTS) {
      expect(baits.has(b.requiredBait)).toBe(true)
    }
  })

  it('uses valid location ids', () => {
    const locations = new Set([
      'village', 'market', 'sect', 'herb_field', 'misty_forest', 'sealed_cave',
      'cursed_rift', 'cloud_peak', 'thousand_herbs_valley', 'blackwind_dunes',
      'frozen_peak', 'wandering_market', 'moon_lake', 'bone_ash_ruins',
      'spirit_beast_ridge', 'azure_pavilion',
    ])
    for (const b of BEASTS) {
      expect(locations.has(b.locationId)).toBe(true)
    }
  })

  it('has minLuck 3/5/7 for thuong/dac_biet/boss tiers', () => {
    for (const b of BEASTS) {
      expect(b.minLuck).toBe(b.tier === 'thuong' ? 3 : b.tier === 'dac_biet' ? 5 : 7)
    }
  })

  it('has bilingual species and desc fields', () => {
    for (const b of BEASTS) {
      expect(b.speciesVi).toBeTruthy()
      expect(b.speciesEn).toBeTruthy()
      expect(b.descVi).toBeTruthy()
      expect(b.descEn).toBeTruthy()
    }
  })

  it('has valid buff kind', () => {
    for (const b of BEASTS) {
      expect(['attack', 'defense', 'heal', 'qi', 'dodge']).toContain(b.buff.kind)
      expect(b.buff.value).toBeGreaterThan(0)
    }
  })

  describe('canTame', () => {
    function makeState(overrides?: Partial<GameState>): GameState {
      return {
        version: 1, seed: 'test', rng: 0, day: 1,
        player: { hp: 100, qi: 100, gold: 0, silver: 0, spiritStones: 0, attrs: { body: 3, mind: 3, charm: 3, luck: 5 }, stage: 0, realmLevel: 1, progress: 0, pendingAttributePoints: 0, posX: 2, posY: 2, locationId: 'village', alive: true },
        spiritRoot: { kind: 'defective', elementVi: 'Mộc', elementEn: 'Wood', efficiency: 0.5 }, inventory: { bait_white_tiger: 1 }, storage: {}, flags: {}, quests: {}, achievements: [], talents: [], techniques: {}, equipment: { weapon: null, robe: null, accessory: null }, encounter: null, lastLotteryDay: null, corrections: 0, terminal: false, endingId: null,
        ...overrides,
      }
    }

    it('returns true when luck >= minLuck and bait is available', () => {
      const state = makeState({ player: { ...makeState().player, attrs: { ...makeState().player.attrs, luck: 5 } }, inventory: { bait_white_tiger: 1 } })
      const beast = BEASTS.find((b) => b.id === 'beast_bach_ho_dac_biet')!
      expect(canTame(state, beast)).toBe(true)
    })

    it('returns false when luck is below minLuck', () => {
      const state = makeState({ player: { ...makeState().player, attrs: { ...makeState().player.attrs, luck: 2 } } })
      const beast = BEASTS[0]! // minLuck 3
      expect(canTame(state, beast)).toBe(false)
    })

    it('returns false when bait is missing from inventory', () => {
      const state = makeState({ inventory: {} })
      const beast = BEASTS[0]!
      expect(canTame(state, beast)).toBe(false)
    })
  })

  describe('companionBuff', () => {
    it('returns null when companionId is null/undefined', () => {
      expect(companionBuff(null, BEASTS)).toBeNull()
      expect(companionBuff(undefined, BEASTS)).toBeNull()
    })

    it('returns correct buff for a known beast', () => {
      const buff = companionBuff('beast_bach_ho_boss', BEASTS)
      expect(buff).toEqual({ kind: 'attack', value: 10 })
    })

    it('returns null for unknown beast id', () => {
      expect(companionBuff('not_a_beast', BEASTS)).toBeNull()
    })
  })

  it('COMPANION_EXTRA_ACTION is defined', () => {
    expect(COMPANION_EXTRA_ACTION).toBe(1)
  })
})