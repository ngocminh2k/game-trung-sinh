import { describe, expect, it } from 'vitest'
import { newGame, applyAction } from '../src/engine'
import {
  OUTFITS,
  TITLES,
  OUTFIT_TITLE_SYNERGIES,
  getOutfit,
  getTitle,
  getOutfitTitleSynergy,
  canBuyOutfit,
  buyOutfit,
  equipOutfit,
  equipTitle,
  getActiveSynergy,
  isTitleUnlocked,
  getUnlockedTitles,
  calculateSynergyCharmBonus,
  calculateSynergyShopDiscount,
  calculateSynergyTravelReduction,
  isZeroCombatStatsGuaranteed,
} from '../src/engine/outfits'
import type { GameState } from '../src/engine/types'

describe('C3-16: Outfits & Titles (Tương tác Ngoại Trang × Danh Hiệu - E4 Invariant)', () => {
  describe('Content Catalog & E4 Invariant (Zero Combat Stats)', () => {
    it('has at least 4 canonical outfits with bilingual content and in-game pricing', () => {
      expect(OUTFITS.length).toBeGreaterThanOrEqual(4)
      for (const outfit of OUTFITS) {
        expect(outfit.id).toMatch(/^outfit_/)
        expect(outfit.nameVi.length).toBeGreaterThan(0)
        expect(outfit.nameEn.length).toBeGreaterThan(0)
        expect(outfit.descVi.length).toBeGreaterThan(0)
        expect(outfit.descEn.length).toBeGreaterThan(0)
        expect(outfit.visualTag.length).toBeGreaterThan(0)
        expect(outfit.price.amount).toBeGreaterThan(0)
        expect(['silver', 'gold', 'spiritStones']).toContain(outfit.price.currency)
        expect(outfit.synergyTitleId).toBeTruthy()
      }
    })

    it('has at least 5 canonical titles with bilingual content and requirements', () => {
      expect(TITLES.length).toBeGreaterThanOrEqual(5)
      for (const title of TITLES) {
        expect(title.id).toMatch(/^title_/)
        expect(title.nameVi.length).toBeGreaterThan(0)
        expect(title.nameEn.length).toBeGreaterThan(0)
        expect(title.descVi.length).toBeGreaterThan(0)
        expect(title.descEn.length).toBeGreaterThan(0)
        expect(title.prefixVi.length).toBeGreaterThan(0)
        expect(title.prefixEn.length).toBeGreaterThan(0)
      }
    })

    it('strictly satisfies E4 rule: all outfits and titles have ZERO combat stats', () => {
      expect(isZeroCombatStatsGuaranteed()).toBe(true)

      for (const outfit of OUTFITS) {
        expect(outfit.combatStats.attack).toBe(0)
        expect(outfit.combatStats.defense).toBe(0)
        expect(outfit.combatStats.hp).toBe(0)
        expect(outfit.combatStats.crit).toBe(0)
      }

      for (const title of TITLES) {
        expect(title.combatStats.attack).toBe(0)
        expect(title.combatStats.defense).toBe(0)
        expect(title.combatStats.hp).toBe(0)
        expect(title.combatStats.crit).toBe(0)
      }

      for (const syn of OUTFIT_TITLE_SYNERGIES) {
        expect(syn.buffs.combatAttackBonus).toBe(0)
        expect(syn.buffs.combatDefenseBonus).toBe(0)
        expect(syn.buffs.combatHpBonus).toBe(0)
        expect(syn.buffs.combatCritBonus).toBe(0)
      }
    })

    it('defines resonant synergies linking outfits and matching titles', () => {
      expect(OUTFIT_TITLE_SYNERGIES.length).toBeGreaterThanOrEqual(4)
      for (const syn of OUTFIT_TITLE_SYNERGIES) {
        expect(getOutfit(syn.outfitId)).toBeDefined()
        expect(getTitle(syn.titleId)).toBeDefined()
        expect(syn.nameVi.length).toBeGreaterThan(0)
        expect(syn.nameEn.length).toBeGreaterThan(0)
        expect(syn.flavorVi.length).toBeGreaterThan(0)
        expect(syn.flavorEn.length).toBeGreaterThan(0)
        expect(syn.buffs.visualAura).toBeTruthy()
      }
    })
  })

  describe('Purchasing Outfits with In-game Currency', () => {
    it('allows purchasing early-game outfit_bamboo_scholar with 50 Silver', () => {
      const state = newGame('test_outfit_buy')
      // Ensure player has 50 Silver
      const stateWithSilver: GameState = {
        ...state,
        player: { ...state.player, silver: 100 },
        unlockedOutfits: [],
      }

      const afford = canBuyOutfit(stateWithSilver, 'outfit_bamboo_scholar')
      expect(afford.ok).toBe(true)

      const result = buyOutfit(stateWithSilver, 'outfit_bamboo_scholar')
      expect('state' in result).toBe(true)
      if ('state' in result) {
        expect(result.state.unlockedOutfits).toContain('outfit_bamboo_scholar')
        expect(result.state.player.silver).toBe(50) // 100 - 50 = 50
        expect(result.event.type).toBe('OUTFIT_BOUGHT')
      }
    })

    it('rejects purchase if player has insufficient funds', () => {
      const state = newGame('test_outfit_poor')
      const brokeState: GameState = {
        ...state,
        player: { ...state.player, silver: 10, gold: 0, spiritStones: 0 },
        unlockedOutfits: [],
      }

      const afford = canBuyOutfit(brokeState, 'outfit_bamboo_scholar')
      expect(afford.ok).toBe(false)
      expect(afford.reason).toContain('INSUFFICIENT')

      const result = buyOutfit(brokeState, 'outfit_bamboo_scholar')
      expect('error' in result).toBe(true)
    })

    it('rejects purchase if outfit is already owned', () => {
      const state = newGame('test_outfit_owned')
      const ownedState: GameState = {
        ...state,
        player: { ...state.player, silver: 500 },
        unlockedOutfits: ['outfit_bamboo_scholar'],
      }

      const afford = canBuyOutfit(ownedState, 'outfit_bamboo_scholar')
      expect(afford.ok).toBe(false)
      expect(afford.reason).toContain('ALREADY_OWNED')
    })
  })

  describe('Title Unlocking Mechanics', () => {
    it('unlocks title_novice by default', () => {
      const state = newGame('test_novice')
      expect(isTitleUnlocked(state, 'title_novice')).toBe(true)
      expect(getUnlockedTitles(state)).toContain('title_novice')
    })

    it('unlocks title_herb_master when green_thumb achievement is earned or 10 herbs collected', () => {
      const state = newGame('test_herb')
      expect(isTitleUnlocked(state, 'title_herb_master')).toBe(false)

      const achievedState: GameState = {
        ...state,
        achievements: ['green_thumb'],
      }
      expect(isTitleUnlocked(achievedState, 'title_herb_master')).toBe(true)
      expect(getUnlockedTitles(achievedState)).toContain('title_herb_master')
    })

    it('unlocks title_fate_defier when stage >= 3 or Luyện Khí Tầng 3 reached', () => {
      const state = newGame('test_stage')
      expect(isTitleUnlocked(state, 'title_fate_defier')).toBe(false)

      const highStageState: GameState = {
        ...state,
        player: { ...state.player, stage: 3 },
      }
      expect(isTitleUnlocked(highStageState, 'title_fate_defier')).toBe(true)
    })
  })

  describe('Equipping & Synergy Interaction (Tương tác Ngoại Trang × Danh Hiệu)', () => {
    it('equips owned outfit and unlocked title', () => {
      const state: GameState = {
        ...newGame('test_equip'),
        unlockedOutfits: ['outfit_bamboo_scholar'],
        unlockedTitles: ['title_novice'],
      }

      const r1 = equipOutfit(state, 'outfit_bamboo_scholar')
      expect(r1.state.activeOutfitId).toBe('outfit_bamboo_scholar')

      const r2 = equipTitle(r1.state, 'title_novice')
      expect(r2.state.activeTitleId).toBe('title_novice')
    })

    it('detects synergy when matching outfit and title are both equipped', () => {
      // outfit_bamboo_scholar + title_novice resonate
      const synergy = getOutfitTitleSynergy('outfit_bamboo_scholar', 'title_novice')
      expect(synergy).not.toBeNull()
      expect(synergy?.id).toBe('synergy_bamboo_novice')
      expect(synergy?.buffs.charmBonus).toBeGreaterThan(0)
      expect(synergy?.buffs.travelStaminaReductionPct).toBeGreaterThan(0)
      expect(synergy?.buffs.visualAura).toBe('ink_drift')
    })

    it('does not trigger synergy when mismatched outfit and title are equipped', () => {
      const synergy = getOutfitTitleSynergy('outfit_bamboo_scholar', 'title_fate_defier')
      expect(synergy).toBeNull()
    })

    it('computes active synergy buffs on GameState', () => {
      const state: GameState = {
        ...newGame('test_synergy_state'),
        activeOutfitId: 'outfit_bamboo_scholar',
        activeTitleId: 'title_novice',
      }

      const active = getActiveSynergy(state)
      expect(active).not.toBeNull()
      expect(active?.id).toBe('synergy_bamboo_novice')

      expect(calculateSynergyCharmBonus(state)).toBe(active?.buffs.charmBonus)
      expect(calculateSynergyShopDiscount(state)).toBe(active?.buffs.shopDiscountPct)
      expect(calculateSynergyTravelReduction(state)).toBe(active?.buffs.travelStaminaReductionPct)
    })

    it('returns 0 bonuses when no synergy is active', () => {
      const state: GameState = {
        ...newGame('test_no_synergy'),
        activeOutfitId: null,
        activeTitleId: null,
      }

      expect(getActiveSynergy(state)).toBeNull()
      expect(calculateSynergyCharmBonus(state)).toBe(0)
      expect(calculateSynergyShopDiscount(state)).toBe(0)
      expect(calculateSynergyTravelReduction(state)).toBe(0)
    })
  })

  describe('Integration with Reducer Actions', () => {
    it('handles buy_outfit action via applyAction', () => {
      let state = newGame('test_reducer_buy')
      state = { ...state, player: { ...state.player, silver: 200 } }

      const result = applyAction(state, { kind: 'buy_outfit', outfitId: 'outfit_bamboo_scholar' })
      expect(result.state.unlockedOutfits).toContain('outfit_bamboo_scholar')
      expect(result.state.player.silver).toBe(150)
      expect(result.events.some((e) => e.type === 'OUTFIT_BOUGHT')).toBe(true)
    })

    it('handles equip_outfit and equip_title actions via applyAction', () => {
      let state = newGame('test_reducer_equip')
      state = {
        ...state,
        unlockedOutfits: ['outfit_bamboo_scholar'],
        unlockedTitles: ['title_novice'],
      }

      const r1 = applyAction(state, { kind: 'equip_outfit', outfitId: 'outfit_bamboo_scholar' })
      expect(r1.state.activeOutfitId).toBe('outfit_bamboo_scholar')

      const r2 = applyAction(r1.state, { kind: 'equip_title', titleId: 'title_novice' })
      expect(r2.state.activeTitleId).toBe('title_novice')
      // Emitted synergy event
      expect(r2.events.some((e) => e.type === 'OUTFIT_TITLE_SYNERGY')).toBe(true)
    })

    it('allows unequipping outfit or title with null', () => {
      let state = newGame('test_reducer_unequip')
      state = {
        ...state,
        activeOutfitId: 'outfit_bamboo_scholar',
        activeTitleId: 'title_novice',
      }

      const r1 = applyAction(state, { kind: 'equip_outfit', outfitId: null })
      expect(r1.state.activeOutfitId).toBeNull()

      const r2 = applyAction(r1.state, { kind: 'equip_title', titleId: null })
      expect(r2.state.activeTitleId).toBeNull()
    })
  })
})
