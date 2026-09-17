import { describe, expect, it } from 'vitest'
import { SYSTEMS, systemById } from '../src/content/system-defs'
import {
  calculateSystemCombatDamageBonus,
  calculateSystemCultivationBonus,
  calculateSystemDangerDamageReduction,
  calculateSystemRestHealBonus,
  calculateSystemShopDiscount,
  isVoidDemonGodActive,
  systemMechanismText,
  systemPassiveBonus,
} from '../src/engine/system-runtime'

describe('C3-03 / C2-03: System Mechanism & Thần Ma Điểm Hóa Clarification', () => {
  it('every System defines bilingual mechanismVi and mechanismEn explaining concrete gameplay effects', () => {
    expect(SYSTEMS).toHaveLength(10)
    for (const system of SYSTEMS) {
      expect(system.mechanismVi, `${system.id} missing mechanismVi`).toBeDefined()
      expect(system.mechanismVi.length).toBeGreaterThan(15)
      expect(system.mechanismEn, `${system.id} missing mechanismEn`).toBeDefined()
      expect(system.mechanismEn.length).toBeGreaterThan(15)
    }
  })

  it('sys_void explicitly identifies as Thần Ma Điểm Hóa with concrete demon-god protection mechanic', () => {
    const voidSys = systemById('sys_void')
    expect(voidSys).toBeDefined()
    expect(voidSys!.aliasVi).toContain('Thần Ma Điểm Hóa')
    expect(voidSys!.mechanismVi).toContain('Thần Ma')
    expect(voidSys!.mechanismVi).toMatch(/30%|giảm.*sát thương|linh thạch/i)
  })

  it('systemPassiveBonus returns distinct, measurable numeric bonuses for all 10 systems', () => {
    const battleBonus = systemPassiveBonus('sys_battle')
    expect(battleBonus.combatDamageBonus).toBeGreaterThan(0)

    const alchemyBonus = systemPassiveBonus('sys_alchemy')
    expect(alchemyBonus.alchemyEfficiencyBonus).toBeGreaterThan(0)

    const merchantBonus = systemPassiveBonus('sys_merchant')
    expect(merchantBonus.shopDiscountPercent).toBeGreaterThan(0)

    const lotteryBonus = systemPassiveBonus('sys_lottery')
    expect(lotteryBonus.lotteryLuckBonus).toBeGreaterThan(0)

    const explorerBonus = systemPassiveBonus('sys_explorer')
    expect(explorerBonus.dangerDamageReduction).toBeGreaterThan(0)

    const assassinBonus = systemPassiveBonus('sys_assassin')
    expect(assassinBonus.critChanceBonus).toBeGreaterThan(0)

    const healerBonus = systemPassiveBonus('sys_healer')
    expect(healerBonus.hpRestHealBonus).toBeGreaterThan(0)

    const artisanBonus = systemPassiveBonus('sys_artisan')
    expect(artisanBonus.equipmentBonus).toBeGreaterThan(0)

    const scholarBonus = systemPassiveBonus('sys_scholar')
    expect(scholarBonus.cultivationBonus).toBeGreaterThan(0)

    const voidBonus = systemPassiveBonus('sys_void')
    expect(voidBonus.demonGodShield).toBe(true)
    expect(voidBonus.spiritStoneYieldBonus).toBeGreaterThan(0)
  })

  it('systemMechanismText formats localized description accurately', () => {
    const viText = systemMechanismText('sys_void', 'vi')
    expect(viText).toContain('Thần Ma')

    const enText = systemMechanismText('sys_void', 'en')
    expect(enText).toContain('Demon God')

    // Null or invalid systemId returns empty string
    expect(systemMechanismText(null)).toBe('')
    expect(systemMechanismText('invalid_sys')).toBe('')
  })

  it('runtime helpers accurately compute modifiers based on state.systemId', () => {
    // Battle bonus
    expect(calculateSystemCombatDamageBonus({ systemId: 'sys_battle' })).toBe(15)
    expect(calculateSystemCombatDamageBonus({ systemId: 'sys_merchant' })).toBe(0)

    // Danger reduction
    expect(calculateSystemDangerDamageReduction({ systemId: 'sys_explorer' })).toBe(20)
    expect(calculateSystemDangerDamageReduction({ systemId: 'sys_battle' })).toBe(0)

    // Rest heal
    expect(calculateSystemRestHealBonus({ systemId: 'sys_healer' })).toBe(15)
    expect(calculateSystemRestHealBonus({ systemId: null })).toBe(0)

    // Shop discount
    expect(calculateSystemShopDiscount({ systemId: 'sys_merchant' })).toBe(10)
    expect(calculateSystemShopDiscount({ systemId: undefined })).toBe(0)

    // Cultivation bonus
    expect(calculateSystemCultivationBonus({ systemId: 'sys_scholar' })).toBe(15)
    expect(calculateSystemCultivationBonus({ systemId: 'sys_healer' })).toBe(0)

    // Thần Ma Điểm Hóa active check
    expect(isVoidDemonGodActive({ systemId: 'sys_void' })).toBe(true)
    expect(isVoidDemonGodActive({ systemId: 'sys_battle' })).toBe(false)
  })
})
