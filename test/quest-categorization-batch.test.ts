import { describe, expect, it } from 'vitest'
import {
  applyAction,
  canAcceptQuest,
  canCompleteQuest,
  getQuestCategory,
  newGame,
  questCategoryLabel,
  questStatus,
  type QuestCategory,
} from '../src/engine'
import { getQuest } from '../src/content'
import type { GameState } from '../src/engine/types'

describe('C3-10: Quest Categorization & Batch Claim/Accept', () => {
  describe('Quest Categorization (Chính / Phụ / Tông Môn / Ẩn)', () => {
    it('categorizes main story quests correctly as main', () => {
      const qMain = getQuest('q_main_letter')
      expect(qMain).toBeDefined()
      if (qMain) {
        expect(getQuestCategory(qMain)).toBe('main')
      }

      const qMainRoute = getQuest('q_main_route_proof')
      expect(qMainRoute).toBeDefined()
      if (qMainRoute) {
        expect(getQuestCategory(qMainRoute)).toBe('main')
      }
    })

    it('categorizes side quests correctly as side', () => {
      const qHerb = getQuest('q_herb_delivery')
      expect(qHerb).toBeDefined()
      if (qHerb) {
        expect(getQuestCategory(qHerb)).toBe('side')
      }

      const qVil = getQuest('q_vil_01')
      expect(qVil).toBeDefined()
      if (qVil) {
        expect(getQuestCategory(qVil)).toBe('side')
      }
    })

    it('categorizes sect and system quests correctly as sect', () => {
      const qSec = getQuest('q_sec_01')
      expect(qSec).toBeDefined()
      if (qSec) {
        expect(getQuestCategory(qSec)).toBe('sect')
      }

      const qSys = getQuest('q_sys_battle_01')
      expect(qSys).toBeDefined()
      if (qSys) {
        expect(getQuestCategory(qSys)).toBe('sect')
      }
    })

    it('categorizes secret quests correctly as secret', () => {
      const qSecret = getQuest('q_secret_eighth_name')
      expect(qSecret).toBeDefined()
      if (qSecret) {
        expect(getQuestCategory(qSecret)).toBe('secret')
      }
    })

    it('provides bilingual category labels', () => {
      const categories: QuestCategory[] = ['main', 'side', 'sect', 'secret']
      for (const cat of categories) {
        const vi = questCategoryLabel(cat, 'vi')
        const en = questCategoryLabel(cat, 'en')
        expect(vi).toBeTruthy()
        expect(en).toBeTruthy()
        expect(vi).not.toBe(en)
      }

      expect(questCategoryLabel('main', 'vi')).toBe('Chính Tuyến')
      expect(questCategoryLabel('side', 'vi')).toBe('Phụ Tuyến')
      expect(questCategoryLabel('sect', 'vi')).toBe('Tông Môn')
      expect(questCategoryLabel('secret', 'vi')).toBe('Nhiệm Vụ Ẩn')
    })
  })

  describe('Batch Actions (accept_all_quests & claim_all_quests)', () => {
    function makeVillageState(): GameState {
      const base = newGame('test-batch-quests')
      return {
        ...base,
        day: 1,
        player: {
          ...base.player,
          locationId: 'village',
        },
      }
    }

    it('accept_all_quests accepts all available unlocked quests at the current location in 1-click', () => {
      const state = makeVillageState()
      // Initially, player is at village_square and several quests from Elder Meihua are available
      const qMain = getQuest('q_main_letter')
      const qHerb = getQuest('q_herb_delivery')
      expect(qMain).toBeDefined()
      expect(qHerb).toBeDefined()

      expect(questStatus(state, 'q_main_letter')).toBe('available')
      expect(questStatus(state, 'q_herb_delivery')).toBe('available')
      expect(canAcceptQuest(state, 'q_main_letter').ok).toBe(true)
      expect(canAcceptQuest(state, 'q_herb_delivery').ok).toBe(true)

      // Apply 1-click accept_all_quests
      const result = applyAction(state, { kind: 'accept_all_quests' })
      expect(result.events.some((e) => e.type === 'QUEST_ACCEPTED' && e.questId === 'q_main_letter')).toBe(true)
      expect(result.events.some((e) => e.type === 'QUEST_ACCEPTED' && e.questId === 'q_herb_delivery')).toBe(true)

      expect(questStatus(result.state, 'q_main_letter')).toBe('active')
      expect(questStatus(result.state, 'q_herb_delivery')).toBe('active')
    })

    it('accept_all_quests accepts specific subset when questIds are provided', () => {
      const state = makeVillageState()
      const result = applyAction(state, { kind: 'accept_all_quests', questIds: ['q_herb_delivery'] })

      expect(result.events.some((e) => e.type === 'QUEST_ACCEPTED' && e.questId === 'q_herb_delivery')).toBe(true)
      expect(result.events.some((e) => e.type === 'QUEST_ACCEPTED' && e.questId === 'q_main_letter')).toBe(false)
      expect(questStatus(result.state, 'q_herb_delivery')).toBe('active')
      expect(questStatus(result.state, 'q_main_letter')).toBe('available')
    })

    it('claim_all_quests completes all turn-in ready quests in 1-click and awards items/gold', () => {
      let state = makeVillageState()
      // Setup active quest q_herb_delivery with required items (3 spirit_herb)
      state = {
        ...state,
        inventory: { spirit_herb: 5 },
        quests: {
          q_herb_delivery: { status: 'active', step: 1 }, // step 1 is turnIn step
        },
      }

      expect(canCompleteQuest(state, 'q_herb_delivery').ok).toBe(true)
      const initialGold = state.player.gold

      // Apply 1-click claim_all_quests
      const result = applyAction(state, { kind: 'claim_all_quests' })
      expect(result.events.some((e) => e.type === 'QUEST_COMPLETED' && e.questId === 'q_herb_delivery')).toBe(true)
      expect(questStatus(result.state, 'q_herb_delivery')).toBe('completed')
      // Consumed 3 herbs
      expect(result.state.inventory['spirit_herb']).toBe(2)
      // Awarded gold
      expect(result.state.player.gold).toBeGreaterThan(initialGold)
    })

    it('claim_all_quests returns empty events gracefully if no quests are ready', () => {
      const state = makeVillageState()
      const result = applyAction(state, { kind: 'claim_all_quests' })
      expect(result.events.length).toBe(0)
      expect(result.state).toEqual(state)
    })
  })
})
