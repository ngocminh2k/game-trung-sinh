import { describe, expect, it } from 'vitest'
import {
  GOLD_TO_SILVER,
  LS_TO_GOLD,
  canAffordCurrency,
  goldToSilver,
  goldToSpiritStones,
  silverToGold,
  spendCurrency,
} from '../src/engine/economy'
import { parseGameState } from '../src/engine/schema'

describe('three-tier economy', () => {
  it('uses the contracted exchange rates', () => {
    expect(LS_TO_GOLD).toBe(10)
    expect(GOLD_TO_SILVER).toBe(10)
    expect(goldToSilver(1)).toBe(10)
    expect(silverToGold(19)).toBe(1)
    expect(goldToSpiritStones(19)).toBe(1)
  })

  it('compares the total balance at fixed exchange rates', () => {
    const balance = { spiritStones: 1, gold: 2, silver: 5 }

    expect(canAffordCurrency(balance, { gold: 12, silver: 5 })).toBe(true)
    expect(canAffordCurrency(balance, { gold: 12, silver: 6 })).toBe(false)
  })

  it('makes change from higher tiers without producing negative balances', () => {
    const balance = spendCurrency(
      { spiritStones: 1, gold: 0, silver: 0 },
      { gold: 5, silver: 5 },
    )

    expect(balance).toEqual({ spiritStones: 0, gold: 4, silver: 5 })
    expect(Object.values(balance).every((value) => value >= 0)).toBe(true)
  })

  it('leaves the balance unchanged when the cost exceeds its total value', () => {
    const balance = { spiritStones: 0, gold: 1, silver: 0 }

    expect(spendCurrency(balance, { gold: 1, silver: 1 })).toEqual(balance)
  })

  it('rejects invalid prices without changing the balance', () => {
    const balance = { spiritStones: 0, gold: 1, silver: 0 }

    for (const price of [{ silver: -1 }, { silver: 0.5 }, { silver: Number.NaN }]) {
      expect(canAffordCurrency(balance, price)).toBe(false)
      expect(spendCurrency(balance, price)).toEqual(balance)
    }
  })

  it('rejects totals above the safe-integer range', () => {
    const balance = { spiritStones: 90_071_992_547_411, gold: 0, silver: 0 }
    const price = { spiritStones: 90_071_992_547_411, silver: 1 }

    expect(canAffordCurrency(balance, price)).toBe(false)
    expect(spendCurrency(balance, price)).toEqual(balance)
  })

  it('defaults expansion fields when parsing an old save', () => {
    const restored = parseGameState({
      version: 1,
      seed: 'pre-economy',
      rng: 1,
      day: 1,
      player: {
        hp: 100,
        qi: 60,
        gold: 60,
        attrs: { body: 3, mind: 4, charm: 3, luck: 2 },
        stage: 0,
        progress: 0,
        posX: 3,
        posY: 3,
        locationId: 'village',
        alive: true,
      },
      spiritRoot: { kind: 'defective', elementVi: 'Mộc', elementEn: 'Wood', efficiency: 0.5 },
      inventory: {},
      storage: {},
      flags: {},
      quests: {},
      achievements: [],
      lastLotteryDay: null,
      corrections: 0,
      terminal: false,
      endingId: null,
    })

    expect(restored.player.silver).toBe(0)
    expect(restored.player.spiritStones).toBe(0)
    expect(restored.rememberedNames).toEqual([])
    expect(restored.companionId).toBeNull()
    expect(restored.systemQueue).toEqual([])
  })
})
