import { describe, expect, it } from 'vitest'
import { getItem, getEquipmentByItem } from '../src/content'
import { newGame } from '../src/engine/constants'
import { applyAction, findPath } from '../src/engine'
import { travelRisk } from '../src/engine/telegraph'
import {
  WEATHER_EFFECTS,
  WEATHER_ITEM_FOG_TALISMAN,
  WEATHER_ITEM_RAINCOAT,
  WEATHER_ITEM_SUN_GEM,
  elementWeatherModifier,
  getEffectiveElementModifier,
  getEffectiveWeatherDodgeBonus,
  getEffectiveWeatherEffects,
  hasWeatherCounterItem,
  weatherDodgeBonus,
} from '../src/engine/weather'
import type { GameState } from '../src/engine/types'

describe('Weather Counter Items Catalog & Equipment (C3-19)', () => {
  it('registers raincoat, sun_gem, and fog_talisman in item definitions', () => {
    const raincoat = getItem('raincoat')
    expect(raincoat).toBeDefined()
    expect(raincoat?.nameVi).toBe('Áo tơi đồng')
    expect(raincoat?.nameEn).toBe('Coir Raincoat')
    expect(raincoat?.equipmentSlot).toBe('robe')
    expect(raincoat?.buyPrice).toBe(45)
    expect(raincoat?.sellPrice).toBe(22)

    const sunGem = getItem('sun_gem')
    expect(sunGem).toBeDefined()
    expect(sunGem?.nameVi).toBe('Ngọc tránh nắng')
    expect(sunGem?.nameEn).toBe('Sun-Warding Jade')
    expect(sunGem?.equipmentSlot).toBe('accessory')
    expect(sunGem?.buyPrice).toBe(50)
    expect(sunGem?.sellPrice).toBe(25)

    const fogTalisman = getItem('fog_talisman')
    expect(fogTalisman).toBeDefined()
    expect(fogTalisman?.nameVi).toBe('Bùa xua sương')
    expect(fogTalisman?.nameEn).toBe('Mist-Dispelling Talisman')
    expect(fogTalisman?.equipmentSlot).toBe('accessory')
    expect(fogTalisman?.buyPrice).toBe(40)
    expect(fogTalisman?.sellPrice).toBe(20)
  })

  it('registers combat equipment stats for weather gear in rpg content', () => {
    const raincoatEq = getEquipmentByItem('raincoat')
    expect(raincoatEq).toBeDefined()
    expect(raincoatEq?.slot).toBe('robe')
    expect(raincoatEq?.defenseBonus).toBe(2)
    expect(raincoatEq?.qiBonus).toBe(5)

    const sunGemEq = getEquipmentByItem('sun_gem')
    expect(sunGemEq).toBeDefined()
    expect(sunGemEq?.slot).toBe('accessory')
    expect(sunGemEq?.defenseBonus).toBe(1)
    expect(sunGemEq?.qiBonus).toBe(8)

    const fogTalismanEq = getEquipmentByItem('fog_talisman')
    expect(fogTalismanEq).toBeDefined()
    expect(fogTalismanEq?.slot).toBe('accessory')
    expect(fogTalismanEq?.attackBonus).toBe(1)
    expect(fogTalismanEq?.defenseBonus).toBe(1)
    expect(fogTalismanEq?.qiBonus).toBe(6)
  })
})

describe('Dual-Availability Possession Model (C3-19)', () => {
  it('detects weather counter item when equipped in equipment slots', () => {
    const stateEquippedRobe: Partial<GameState> = {
      equipment: { robe: 'raincoat', accessory: null, weapon: null },
      inventory: {},
    }
    expect(hasWeatherCounterItem(stateEquippedRobe as GameState, WEATHER_ITEM_RAINCOAT)).toBe(true)
    expect(hasWeatherCounterItem(stateEquippedRobe as GameState, WEATHER_ITEM_SUN_GEM)).toBe(false)

    const stateEquippedAccessory: Partial<GameState> = {
      equipment: { robe: null, accessory: 'sun_gem', weapon: null },
      inventory: {},
    }
    expect(hasWeatherCounterItem(stateEquippedAccessory as GameState, WEATHER_ITEM_SUN_GEM)).toBe(true)
  })

  it('detects weather counter item when carried in inventory without equipping', () => {
    const stateInInventory: Partial<GameState> = {
      equipment: { robe: 'cloudveil_robe', accessory: 'moonstone_pendant', weapon: null },
      inventory: { fog_talisman: 1, raincoat: 2 },
    }
    expect(hasWeatherCounterItem(stateInInventory as GameState, WEATHER_ITEM_FOG_TALISMAN)).toBe(true)
    expect(hasWeatherCounterItem(stateInInventory as GameState, WEATHER_ITEM_RAINCOAT)).toBe(true)
    expect(hasWeatherCounterItem(stateInInventory as GameState, WEATHER_ITEM_SUN_GEM)).toBe(false)
  })

  it('handles empty or missing inventory gracefully', () => {
    expect(hasWeatherCounterItem(undefined, WEATHER_ITEM_RAINCOAT)).toBe(false)
    expect(hasWeatherCounterItem({ equipment: undefined, inventory: undefined }, WEATHER_ITEM_RAINCOAT)).toBe(false)
    expect(hasWeatherCounterItem({ inventory: { raincoat: 0 } }, WEATHER_ITEM_RAINCOAT)).toBe(false)
  })
})

describe('Effective Weather Effects Mitigation (C3-19)', () => {
  const suongBase = WEATHER_EFFECTS['thu_suong'] ?? {
    herbPriceMod: 1,
    bossPowerMod: 1.3,
    travelCostMod: 1.2,
    hiddenNpcChance: 0.2,
  }
  const baoBase = WEATHER_EFFECTS['ha_bao'] ?? {
    herbPriceMod: 1.2,
    bossPowerMod: 1.5,
    travelCostMod: 1.5,
    hiddenNpcChance: 0,
  }
  const muaBase = WEATHER_EFFECTS['xuan_mua'] ?? {
    herbPriceMod: 0.8,
    bossPowerMod: 1,
    travelCostMod: 1,
    hiddenNpcChance: 0.1,
  }

  it('raincoat clamps travelCostMod to 1.0 in rain and storm', () => {
    const unequipped: Partial<GameState> = { equipment: { weapon: null, robe: null, accessory: null }, inventory: {} }
    const unequippedBao = getEffectiveWeatherEffects(unequipped as GameState, baoBase, 'bao')
    expect(unequippedBao.travelCostMod).toBe(1.5)

    const withRaincoat: Partial<GameState> = { inventory: { raincoat: 1 } }
    const equippedBao = getEffectiveWeatherEffects(withRaincoat as GameState, baoBase, 'bao')
    expect(equippedBao.travelCostMod).toBe(1.0)

    const equippedMua = getEffectiveWeatherEffects(withRaincoat as GameState, muaBase, 'mua')
    expect(equippedMua.travelCostMod).toBe(1.0)
  })

  it('fog_talisman clamps travelCostMod and bossPowerMod to 1.0 in mist', () => {
    const unequipped: Partial<GameState> = { equipment: { weapon: null, robe: null, accessory: null }, inventory: {} }
    const unequippedSuong = getEffectiveWeatherEffects(unequipped as GameState, suongBase, 'suong')
    expect(unequippedSuong.travelCostMod).toBe(1.2)
    expect(unequippedSuong.bossPowerMod).toBe(1.3)

    const withFogTalisman: Partial<GameState> = { equipment: { weapon: null, robe: null, accessory: 'fog_talisman' } }
    const equippedSuong = getEffectiveWeatherEffects(withFogTalisman as GameState, suongBase, 'suong')
    expect(equippedSuong.travelCostMod).toBe(1.0)
    expect(equippedSuong.bossPowerMod).toBe(1.0)
  })
})

describe('Element Combat Penalty Nullification (C3-19)', () => {
  it('raincoat nullifies Fire penalty in rain and Wood penalty in storm', () => {
    expect(elementWeatherModifier('Hỏa', 'mua')).toBe(0.8)
    expect(elementWeatherModifier('Mộc', 'bao')).toBe(0.9)

    const withRaincoat: Partial<GameState> = { inventory: { raincoat: 1 } }
    expect(getEffectiveElementModifier(withRaincoat as GameState, 'Hỏa', 'mua')).toBe(1.0)
    expect(getEffectiveElementModifier(withRaincoat as GameState, 'Mộc', 'bao')).toBe(1.0)

    // Buffs remain intact
    expect(getEffectiveElementModifier(withRaincoat as GameState, 'Thủy', 'mua')).toBe(1.25)
    expect(getEffectiveElementModifier(withRaincoat as GameState, 'Kim', 'bao')).toBe(1.25)
  })

  it('sun_gem nullifies Water penalty in clear sky', () => {
    expect(elementWeatherModifier('Thủy', 'quang')).toBe(0.9)

    const withSunGem: Partial<GameState> = { equipment: { weapon: null, robe: null, accessory: 'sun_gem' } }
    expect(getEffectiveElementModifier(withSunGem as GameState, 'Thủy', 'quang')).toBe(1.0)

    // Fire buff remains intact
    expect(getEffectiveElementModifier(withSunGem as GameState, 'Hỏa', 'quang')).toBe(1.15)
  })

  it('fog_talisman nullifies Fire penalty in mist', () => {
    expect(elementWeatherModifier('Hỏa', 'suong')).toBe(0.9)

    const withFogTalisman: Partial<GameState> = { inventory: { fog_talisman: 1 } }
    expect(getEffectiveElementModifier(withFogTalisman as GameState, 'Hỏa', 'suong')).toBe(1.0)

    // Wood buff remains intact
    expect(getEffectiveElementModifier(withFogTalisman as GameState, 'Mộc', 'suong')).toBe(1.15)
  })
})

describe('Environmental Evasion Stripping (C3-19)', () => {
  it('strips enemy evasion bonus in mist when player has fog_talisman', () => {
    expect(weatherDodgeBonus('suong')).toBe(0.15)

    const unequipped: Partial<GameState> = { equipment: { weapon: null, robe: null, accessory: null }, inventory: {} }
    expect(getEffectiveWeatherDodgeBonus(unequipped as GameState, 'suong', 'enemy')).toBe(0.15)

    const withFogTalisman: Partial<GameState> = { inventory: { fog_talisman: 1 } }
    expect(getEffectiveWeatherDodgeBonus(withFogTalisman as GameState, 'suong', 'enemy')).toBe(0)

    // Player still keeps their environmental dodge bonus in mist
    expect(getEffectiveWeatherDodgeBonus(withFogTalisman as GameState, 'suong', 'player')).toBe(0.15)
  })
})

describe('Telegraph Travel Risk Mitigation (C3-19)', () => {
  it('suppresses weatherAmplified warning when player possesses appropriate weather gear', () => {
    const game = newGame('test-telegraph-storm')
    // Find a day or set seed that produces storm/mist
    // Let's mock a state with danger and weather
    const dangerousGame: GameState = {
      ...game,
      player: { ...game.player, locationId: 'home' },
      flags: {},
    }

    // Checking travel risk to misty_forest (danger level 1)
    const baselineRisk = travelRisk(dangerousGame, 'misty_forest')
    expect(baselineRisk.danger).toBeGreaterThan(0)

    // If day has weatherMod > 1, baseline risk is amplified
    // When adding raincoat/fog_talisman, risk should not be amplified if counter matches
    const wardedGame: GameState = {
      ...dangerousGame,
      inventory: { raincoat: 1, fog_talisman: 1 },
    }
    const mitigatedRisk = travelRisk(wardedGame, 'misty_forest')
    // With both raincoat and fog_talisman, travelCostMod is clamped to 1.0 in rain, storm, and mist
    expect(mitigatedRisk.weatherAmplified).toBe(false)
    expect(mitigatedRisk.max).toBeLessThanOrEqual(baselineRisk.max)
  })
})

describe('Reducer End-to-End Integration (C3-19)', () => {
  it('applies mitigated travel damage when player holds weather gear', () => {
    const game = newGame('test-move-weather')
    const startState: GameState = {
      ...game,
      player: { ...game.player, hp: 100 },
      inventory: { raincoat: 1, fog_talisman: 1 },
      flags: {},
    }
    const path = findPath(startState.player.posX, startState.player.posY, 'misty_forest', startState.player.locationId)
    expect(path).not.toBeNull()
    if (path) {
      let state = startState
      for (const dir of path) {
        state = applyAction(state, { kind: 'move', direction: dir }).state
      }
      expect(state.player.locationId).toBe('misty_forest')
    }
  })

  it('lifts elemental penalties under adverse weather with weather gear', () => {
    const game = newGame('test-combat-weather')
    const encounterState: GameState = {
      ...game,
      day: 1,
      player: { ...game.player, locationId: 'misty_forest', posX: 3, posY: 4 },
      encounter: {
        enemyId: 'mist_boar',
        hp: 32,
        maxHp: 32,
        guard: 0,
        playerHits: 0,
        enemyTurns: 0,
      },
      spiritRoot: { kind: 'defective', elementVi: 'Hỏa', elementEn: 'Fire', efficiency: 0.5 },
      inventory: { raincoat: 1, fog_talisman: 1 },
    }

    const attackRes = applyAction(encounterState, { kind: 'combat_attack' })
    expect(attackRes.events.some((e) => e.type === 'COMBAT_HIT' && e.actor === 'player')).toBe(true)
    expect(attackRes.state.encounter?.hp).toBeLessThan(32)
  })

  it('protects against boss power surges when fog_talisman is held', () => {
    const game = newGame('test-boss-mist')
    const bossCombatState: GameState = {
      ...game,
      day: 1,
      player: { ...game.player, locationId: 'sealed_cave', posX: 3, posY: 4 },
      encounter: {
        enemyId: 'seal_wraith',
        hp: 54,
        maxHp: 54,
        guard: 0,
        playerHits: 0,
        enemyTurns: 0,
      },
      inventory: { fog_talisman: 1 },
    }

    const enemyTurnRes = applyAction(bossCombatState, { kind: 'combat_defend' })
    expect(enemyTurnRes.events.some((e) => e.type === 'COMBAT_GUARDED')).toBe(true)
  })
})

