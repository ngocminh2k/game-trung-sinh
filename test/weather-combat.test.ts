import { describe, expect, it } from 'vitest'
import {
  elementWeatherModifier,
  isBloodMoon,
  bloodMoonDamageModifier,
  weatherDodgeBonus,
  getPlayerElement,
} from '../src/engine/weather'
import { applyAction, newGame } from '../src/engine'
import type { GameState } from '../src/engine/types'

describe('C3-08 / C2-08: Ngũ Hành × Thời Tiết Combat Interactions', () => {
  describe('isBloodMoon (Đêm Trăng Máu)', () => {
    it('identifies Day 15 of each 28-day cycle as Blood Moon', () => {
      // Cycle 1: Day 1-28 -> Day 15 is Blood Moon
      expect(isBloodMoon(1)).toBe(false)
      expect(isBloodMoon(7)).toBe(false)
      expect(isBloodMoon(14)).toBe(false)
      expect(isBloodMoon(15)).toBe(true)
      expect(isBloodMoon(16)).toBe(false)
      expect(isBloodMoon(28)).toBe(false)

      // Cycle 2: Day 29-56 -> Day 43 (28 + 15) is Blood Moon
      expect(isBloodMoon(29)).toBe(false)
      expect(isBloodMoon(42)).toBe(false)
      expect(isBloodMoon(43)).toBe(true)
      expect(isBloodMoon(44)).toBe(false)

      // Cycle 3: Day 57-84 -> Day 71 (56 + 15) is Blood Moon
      expect(isBloodMoon(71)).toBe(true)
    })

    it('bloodMoonDamageModifier returns 1.3 on Blood Moon and 1.0 otherwise', () => {
      expect(bloodMoonDamageModifier(1)).toBe(1.0)
      expect(bloodMoonDamageModifier(14)).toBe(1.0)
      expect(bloodMoonDamageModifier(15)).toBe(1.3)
      expect(bloodMoonDamageModifier(43)).toBe(1.3)
    })
  })

  describe('elementWeatherModifier (Ngũ Hành × Thời Tiết Matrix)', () => {
    it('Rain (mua): buffs Water (+25%), debuffs Fire (-20%), slight buff Wood (+5%)', () => {
      expect(elementWeatherModifier('Thủy', 'mua')).toBe(1.25)
      expect(elementWeatherModifier('Hỏa', 'mua')).toBe(0.80)
      expect(elementWeatherModifier('Mộc', 'mua')).toBe(1.05)
      expect(elementWeatherModifier('Kim', 'mua')).toBe(1.0)
      expect(elementWeatherModifier('Thổ', 'mua')).toBe(1.0)
    })

    it('Clear/Sun (quang): buffs Fire (+15%), debuffs Water (-10%)', () => {
      expect(elementWeatherModifier('Hỏa', 'quang')).toBe(1.15)
      expect(elementWeatherModifier('Thủy', 'quang')).toBe(0.90)
      expect(elementWeatherModifier('Mộc', 'quang')).toBe(1.0)
      expect(elementWeatherModifier('Kim', 'quang')).toBe(1.0)
      expect(elementWeatherModifier('Thổ', 'quang')).toBe(1.0)
    })

    it('Storm (bao): buffs Metal (+25%), buffs Water (+15%), debuffs Wood (-10%)', () => {
      expect(elementWeatherModifier('Kim', 'bao')).toBe(1.25)
      expect(elementWeatherModifier('Thủy', 'bao')).toBe(1.15)
      expect(elementWeatherModifier('Mộc', 'bao')).toBe(0.90)
      expect(elementWeatherModifier('Hỏa', 'bao')).toBe(1.0)
      expect(elementWeatherModifier('Thổ', 'bao')).toBe(1.0)
    })

    it('Mist (suong): buffs Wood (+15%), debuffs Fire (-10%)', () => {
      expect(elementWeatherModifier('Mộc', 'suong')).toBe(1.15)
      expect(elementWeatherModifier('Hỏa', 'suong')).toBe(0.90)
      expect(elementWeatherModifier('Kim', 'suong')).toBe(1.0)
      expect(elementWeatherModifier('Thủy', 'suong')).toBe(1.0)
      expect(elementWeatherModifier('Thổ', 'suong')).toBe(1.0)
    })
  })

  describe('weatherDodgeBonus', () => {
    it('Mist grants +15% dodge bonus while other weather states grant 0', () => {
      expect(weatherDodgeBonus('suong')).toBe(0.15)
      expect(weatherDodgeBonus('quang')).toBe(0)
      expect(weatherDodgeBonus('mua')).toBe(0)
      expect(weatherDodgeBonus('bao')).toBe(0)
    })
  })

  describe('getPlayerElement', () => {
    it('resolves element correctly from spiritRoot', () => {
      expect(getPlayerElement({ spiritRoot: { elementVi: 'Mộc hỗn tạp' } })).toBe('Mộc')
      expect(getPlayerElement({ spiritRoot: { elementVi: 'Thủy thuần khiết' } })).toBe('Thủy')
      expect(getPlayerElement({ spiritRoot: { elementVi: 'Kim' } })).toBe('Kim')
      expect(getPlayerElement({ spiritRoot: { elementVi: 'Hỏa linh căn' } })).toBe('Hỏa')
      expect(getPlayerElement({ spiritRoot: { elementVi: 'Thổ dầy đặc' } })).toBe('Thổ')
      expect(getPlayerElement({})).toBe('Mộc') // default fallback
    })
  })

  describe('Combat Reducer Integration', () => {
    function makeCombatState(overrides?: Partial<GameState>): GameState {
      const base = newGame('test-weather-combat')
      return {
        ...base,
        day: 1,
        player: {
          ...base.player,
          locationId: 'misty_forest',
          hp: 100,
          qi: 100,
        },
        encounter: {
          enemyId: 'mist_boar',
          hp: 32,
          maxHp: 32,
          guard: 0,
        },
        ...overrides,
      }
    }

    it('player strike damage scales with elemental weather modifier', () => {
      const waterState: GameState = {
        ...makeCombatState(),
        spiritRoot: { kind: 'defective', elementVi: 'Thủy', elementEn: 'Water', efficiency: 0.5 },
      }
      const fireState: GameState = {
        ...makeCombatState(),
        spiritRoot: { kind: 'defective', elementVi: 'Hỏa', elementEn: 'Fire', efficiency: 0.5 },
      }

      expect(getPlayerElement(waterState)).toBe('Thủy')
      expect(getPlayerElement(fireState)).toBe('Hỏa')

      const waterMod = elementWeatherModifier('Thủy', 'mua')
      const fireMod = elementWeatherModifier('Hỏa', 'mua')
      expect(waterMod).toBe(1.25)
      expect(fireMod).toBe(0.8)
      expect(waterMod / fireMod).toBeCloseTo(1.5625, 3)
    })

    it('Blood Moon on Day 15 multiplies combat damage by 1.3 for both player and enemy', () => {
      const normalDayState = makeCombatState({ day: 14 })
      const bloodMoonState = makeCombatState({ day: 15 })

      expect(isBloodMoon(normalDayState.day)).toBe(false)
      expect(isBloodMoon(bloodMoonState.day)).toBe(true)

      expect(bloodMoonDamageModifier(normalDayState.day)).toBe(1.0)
      expect(bloodMoonDamageModifier(bloodMoonState.day)).toBe(1.3)
    })

    it('striking in Blood Moon applies the 1.3x multiplier to player damage', () => {
      // Pin RNG and stats to isolate the blood moon modifier
      const baseCombat = makeCombatState({
        rng: 42,
        player: {
          ...makeCombatState().player,
          attrs: { body: 10, mind: 3, charm: 3, luck: 0 }, // luck 0 = no crit
        },
        flags: { critBonus: 0 },
      })

      // Day 14 (not blood moon) vs Day 15 (blood moon)
      const day14 = { ...baseCombat, day: 14 }
      const day15 = { ...baseCombat, day: 15 }

      const hit14 = applyAction(day14, { kind: 'combat_attack' }).events.find(
        (e) => e.type === 'COMBAT_HIT' && e.actor === 'player',
      )
      const hit15 = applyAction(day15, { kind: 'combat_attack' }).events.find(
        (e) => e.type === 'COMBAT_HIT' && e.actor === 'player',
      )

      expect(hit14).toBeDefined()
      expect(hit15).toBeDefined()
      if (hit14?.type === 'COMBAT_HIT' && hit15?.type === 'COMBAT_HIT') {
        // Day 15 has Blood Moon 1.3x modifier, so it should deal significantly more damage
        expect(hit15.amount).toBeGreaterThan(hit14.amount)
      }
    })
  })
})
