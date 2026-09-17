import { describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import { endingFateCards, endingEpilogue } from '../src/ui/endingEpilogue'
import { endingArchetype } from '../src/content/endings-data'

describe('Dynamic Epilogue Fate Cards (C3-05 / C2-05)', () => {
  describe('endingArchetype mapping', () => {
    it('classifies 6 major ending archetypes and system endings', () => {
      expect(endingArchetype('quiet_harmony')).toBe('mortal_harmony')
      expect(endingArchetype('forgiven_enemy')).toBe('mortal_harmony')
      expect(endingArchetype('iron_lantern')).toBe('mortal_harmony')

      expect(endingArchetype('jade_heir')).toBe('sect_heir')
      expect(endingArchetype('keeper_of_names')).toBe('sect_heir')

      expect(endingArchetype('rift_kingdom')).toBe('rift_darkness')
      expect(endingArchetype('city_of_ghosts')).toBe('rift_darkness')

      expect(endingArchetype('nameless_ascension')).toBe('ascension')
      expect(endingArchetype('rootless_star')).toBe('ascension')

      expect(endingArchetype('blank_page')).toBe('rogue_wanderer')
      expect(endingArchetype('borrowed_face')).toBe('rogue_wanderer')

      expect(endingArchetype('tragic_death')).toBe('tragic_fallen')

      expect(endingArchetype('system_battle_end')).toBe('system_destiny')
      expect(endingArchetype('system_void_end')).toBe('system_destiny')
      expect(endingArchetype('unknown_ending')).toBe('mortal_harmony')
    })
  })

  describe('endingFateCards structure', () => {
    it('returns 5 structured fate cards with categories, titles and content', () => {
      const base = newGame('test-cards')
      const game = {
        ...base,
        endingId: 'quiet_harmony',
        flags: {
          ...base.flags,
          story_meihua_trusted: true,
          story_ha_free: true,
          story_khoa_trusted: true,
          story_meihua_companion: true,
        },
      }

      const cardsVi = endingFateCards(game, 'vi')
      expect(cardsVi).toHaveLength(5)

      const categories = cardsVi.map((c) => c.category)
      expect(categories).toEqual(['hero', 'village', 'sect', 'companion', 'world'])

      cardsVi.forEach((card) => {
        expect(card.id).toBeTruthy()
        expect(card.title).toBeTruthy()
        expect(card.content).toBeTruthy()
      })

      const cardsEn = endingFateCards(game, 'en')
      expect(cardsEn).toHaveLength(5)
      expect(cardsEn[0]?.title).not.toBe(cardsVi[0]?.title)
      expect(cardsEn[0]?.content).not.toBe(cardsVi[0]?.content)
    })
  })

  describe('System endings dedicated hero cards', () => {
    it('provides bespoke hero fate content for system endings instead of fallback', () => {
      const base = newGame('test-sys-cards')
      const gameBattle = { ...base, endingId: 'system_battle_end' }
      const cardsBattle = endingFateCards(gameBattle, 'vi')
      expect(cardsBattle[0]?.content).toContain('Chiến Đấu')

      const gameVoid = { ...base, endingId: 'system_void_end' }
      const cardsVoid = endingFateCards(gameVoid, 'vi')
      expect(cardsVoid[0]?.content).toContain('Hư Vô')
    })
  })

  describe('Village & Meihua fate card dynamism', () => {
    it('adapts village fate card across different story choices', () => {
      const base = newGame('village-test')

      // Case 1: Trusted Meihua + freed Ha
      const g1 = { ...base, endingId: 'quiet_harmony', flags: { ...base.flags, story_meihua_trusted: true, story_ha_free: true } }
      const c1 = endingFateCards(g1, 'vi').find((c) => c.category === 'village')!
      expect(c1.content).toContain('Hà')
      expect(c1.content).toContain('trâm ngọc')

      // Case 2: Trusted Meihua but Ha bound
      const g2 = { ...base, endingId: 'quiet_harmony', flags: { ...base.flags, story_meihua_trusted: true, story_ha_free: false } }
      const c2 = endingFateCards(g2, 'vi').find((c) => c.category === 'village')!
      expect(c2.content).toContain('bữa cơm')

      // Case 3: Meihua untrusted
      const g3 = { ...base, endingId: 'quiet_harmony', flags: { ...base.flags, story_meihua_trusted: false } }
      const c3 = endingFateCards(g3, 'vi').find((c) => c.category === 'village')!
      expect(c3.content).toContain('tha thứ')
    })
  })

  describe('Sect & Rival fate card dynamism', () => {
    it('adapts sect fate card according to Khoa and Vo outcomes', () => {
      const base = newGame('sect-test')

      // Case 1: Khoa trusted
      const g1 = { ...base, endingId: 'quiet_harmony', flags: { ...base.flags, story_khoa_trusted: true } }
      const c1 = endingFateCards(g1, 'vi').find((c) => c.category === 'sect')!
      expect(c1.content).toContain('Khoa')
      expect(c1.content).toContain('Võ')

      // Case 2: Vo exposed, Khoa not trusted
      const g2 = { ...base, endingId: 'quiet_harmony', flags: { ...base.flags, story_khoa_trusted: false, story_vo_exposed: true } }
      const c2 = endingFateCards(g2, 'vi').find((c) => c.category === 'sect')!
      expect(c2.content).toContain('cúi đầu')

      // Case 3: Neither
      const g3 = { ...base, endingId: 'quiet_harmony', flags: { ...base.flags, story_khoa_trusted: false, story_vo_exposed: false } }
      const c3 = endingFateCards(g3, 'vi').find((c) => c.category === 'sect')!
      expect(c3.content).toContain('xét xử')
    })
  })

  describe('Companion fate card dynamism', () => {
    it('adapts companion echo card to active companion', () => {
      const base = newGame('comp-test')

      const gMeihua = { ...base, endingId: 'quiet_harmony', flags: { ...base.flags, story_meihua_companion: true } }
      expect(endingFateCards(gMeihua, 'vi').find((c) => c.category === 'companion')!.content).toContain('dây đỏ')

      const gBao = { ...base, endingId: 'quiet_harmony', flags: { ...base.flags, story_bao_companion: true } }
      expect(endingFateCards(gBao, 'vi').find((c) => c.category === 'companion')!.content).toContain('Bảo')

      const gNgo = { ...base, endingId: 'quiet_harmony', flags: { ...base.flags, story_ngo_companion: true } }
      expect(endingFateCards(gNgo, 'vi').find((c) => c.category === 'companion')!.content).toContain('Ngô')

      const gSolo = { ...base, endingId: 'quiet_harmony', flags: { ...base.flags } }
      expect(endingFateCards(gSolo, 'vi').find((c) => c.category === 'companion')!.content).toContain('dấu chân')
    })
  })

  describe('endingEpilogue backward compatibility', () => {
    it('returns an array of 5 paragraphs matching card content', () => {
      const base = newGame('compat-test')
      const game = {
        ...base,
        endingId: 'nameless_ascension',
        flags: {
          ...base.flags,
          story_meihua_trusted: true,
          story_ha_free: true,
          story_khoa_trusted: true,
          story_meihua_companion: true,
        },
      }

      const paragraphs = endingEpilogue(game, 'vi')
      const cards = endingFateCards(game, 'vi')

      expect(paragraphs).toHaveLength(5)
      expect(paragraphs).toEqual(cards.map((c) => c.content))
    })
  })
})

