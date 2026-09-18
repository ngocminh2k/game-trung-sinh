import { describe, expect, it } from 'vitest'
import { BEASTS } from '../src/content/beasts'
import {
  canTame,
  companionBuff,
  COMPANION_EXTRA_ACTION,
  calculateCompanionHeal,
  companionHealAmount,
  TIEU_THAO_COMPANION_ID,
} from '../src/engine/companion'
import { applyAction } from '../src/engine'
import { playerMaxHp } from '../src/engine/stats'
import type { GameState } from '../src/engine/types'

describe('companion beasts', () => {
  it('defines COMPANION_EXTRA_ACTION as 1', () => {
    expect(COMPANION_EXTRA_ACTION).toBe(1)
  })

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
        version: 2, seed: 'test', rng: 0, day: 1,
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

  describe('C3-07 / C2-07: Companion Healing Scaling (% Max HP)', () => {
    it('recognizes TIEU_THAO_COMPANION_ID and returns 30% heal buff', () => {
      expect(TIEU_THAO_COMPANION_ID).toBe('companion_tieu_thao')
      expect(companionBuff('companion_tieu_thao', BEASTS)).toEqual({ kind: 'heal', value: 30 })
      expect(companionBuff('tieu_thao', BEASTS)).toEqual({ kind: 'heal', value: 30 })
      expect(companionBuff('beast_tieu_thao', BEASTS)).toEqual({ kind: 'heal', value: 30 })
    })

    it('calculateCompanionHeal returns 0 for non-heal buffs or empty input', () => {
      expect(calculateCompanionHeal(null, 100)).toBe(0)
      expect(calculateCompanionHeal(undefined, 100)).toBe(0)
      expect(calculateCompanionHeal({ kind: 'attack', value: 10 }, 100)).toBe(0)
      expect(calculateCompanionHeal({ kind: 'dodge', value: 10 }, 100)).toBe(0)
      expect(calculateCompanionHeal({ kind: 'heal', value: 0 }, 100)).toBe(0)
    })

    it('scales healing proportionally with player Max HP across early, mid, and late game', () => {
      const tieuThaoBuff = { kind: 'heal', value: 30 }

      // Early game: Max HP = 100 -> heals 30 HP
      expect(calculateCompanionHeal(tieuThaoBuff, 100)).toBe(30)

      // Mid game: Max HP = 200 -> heals 60 HP (2x scaling)
      expect(calculateCompanionHeal(tieuThaoBuff, 200)).toBe(60)

      // Late game: Max HP = 350 -> heals 105 HP (3.5x scaling, not flat 30!)
      expect(calculateCompanionHeal(tieuThaoBuff, 350)).toBe(105)

      // Endgame: Max HP = 500 -> heals 150 HP
      expect(calculateCompanionHeal(tieuThaoBuff, 500)).toBe(150)
    })

    it('enforces floor guarantee so debuffed or low Max HP never heals less than base value', () => {
      const tieuThaoBuff = { kind: 'heal', value: 30 }
      // If maxHp = 50, 30% of 50 = 15, but floor guarantee maintains 30
      expect(calculateCompanionHeal(tieuThaoBuff, 50)).toBe(30)
    })

    it('scales spirit beast heal buffs (% Max HP)', () => {
      // Hạc Linh Boss: 10% heal
      const hacLinhBoss = companionBuff('beast_hac_linh_boss', BEASTS)
      expect(hacLinhBoss).toEqual({ kind: 'heal', value: 10 })
      expect(calculateCompanionHeal(hacLinhBoss, 100)).toBe(10)
      expect(calculateCompanionHeal(hacLinhBoss, 250)).toBe(25)
      expect(calculateCompanionHeal(hacLinhBoss, 400)).toBe(40)
    })

    it('companionHealAmount helper computes heal directly from companionId', () => {
      expect(companionHealAmount('companion_tieu_thao', BEASTS, 100)).toBe(30)
      expect(companionHealAmount('companion_tieu_thao', BEASTS, 300)).toBe(90)
      expect(companionHealAmount('beast_bach_ho_boss', BEASTS, 300)).toBe(0) // attack buff
      expect(companionHealAmount(null, BEASTS, 300)).toBe(0)
    })

    it('playerMaxHp scales with player cultivation stage and body attribute', () => {
      // Starting baseline: stage 0, body 3
      const early = { player: { stage: 0, attrs: { body: 3 } } }
      expect(playerMaxHp(early)).toBe(100)

      // Stage 1 (Trúc Cơ) + body 5: 100 + 30 + (5-3)*2 = 134
      const mid = { player: { stage: 1, attrs: { body: 5 } } }
      expect(playerMaxHp(mid)).toBe(134)

      // Stage 3 (Nguyên Anh) + body 20: 100 + 90 + (20-3)*2 = 224
      const late = { player: { stage: 3, attrs: { body: 20 } } }
      expect(playerMaxHp(late)).toBe(224)
    })

    describe('Reducer integration with companion healing scaling', () => {
      function makeTestState(overrides?: Partial<GameState>): GameState {
        return {
          version: 2, seed: 'test', rng: 0, day: 1,
          player: { hp: 40, qi: 60, gold: 0, silver: 0, spiritStones: 0, attrs: { body: 3, mind: 3, charm: 3, luck: 5 }, stage: 0, realmLevel: 1, progress: 0, pendingAttributePoints: 0, posX: 2, posY: 2, locationId: 'village', alive: true },
          spiritRoot: { kind: 'defective', elementVi: 'Mộc', elementEn: 'Wood', efficiency: 0.5 }, inventory: {}, storage: {}, flags: {}, quests: {}, achievements: [], talents: [], techniques: {}, equipment: { weapon: null, robe: null, accessory: null }, encounter: null, lastLotteryDay: null, corrections: 0, terminal: false, endingId: null,
          ...overrides,
        }
      }

      it('resting without companion heals standard 30 HP', () => {
        const state = makeTestState({ player: { ...makeTestState().player, hp: 40 } })
        const res = applyAction(state, { kind: 'rest' })
        expect(res.events.some((e) => e.type === 'ERROR')).toBe(false)
        expect(res.state.player.hp).toBe(70) // 40 + 30
      })

      it('resting with Tiểu Thảo at stage 0 (Max HP 100) adds 30 HP bonus heal', () => {
        const state = makeTestState({
          companionId: 'companion_tieu_thao',
          player: { ...makeTestState().player, hp: 20, stage: 0, attrs: { body: 3, mind: 3, charm: 3, luck: 5 } },
        })
        const res = applyAction(state, { kind: 'rest' })
        expect(res.events.some((e) => e.type === 'ERROR')).toBe(false)
        expect(res.state.player.hp).toBe(80)
      })

      it('resting with Tiểu Thảo in late-game scales with higher Max HP', () => {
        // Stage 2, body 13 -> Max HP = 100 + 60 + 20 = 180
        // Tiểu Thảo 30% of 180 = 54 HP bonus heal!
        // Total rest heal = 30 + 54 = 84 HP
        const state = makeTestState({
          companionId: 'companion_tieu_thao',
          player: { ...makeTestState().player, hp: 50, stage: 2, attrs: { body: 13, mind: 3, charm: 3, luck: 5 } },
        })
        const res = applyAction(state, { kind: 'rest' })
        expect(res.events.some((e) => e.type === 'ERROR')).toBe(false)
        expect(res.state.player.hp).toBe(134) // 50 + 84
      })
    })
  })
})