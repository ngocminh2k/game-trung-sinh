import { describe, expect, it } from 'vitest'
import {
  MARKET_TOLL_RATE,
  calculateMarketToll,
  applyMarketToll,
  calculateArbitrage,
} from '../src/engine/economy'
import {
  isCrossRegionalShop,
  effectiveTradePrice,
  marketTollForTrade,
} from '../src/engine/shopStock'

describe('Market Toll & Cross-Regional Arbitrage Prevention (C3-04 / C2-04)', () => {
  it('defines 15% market toll rate constant', () => {
    expect(MARKET_TOLL_RATE).toBe(0.15)
  })

  describe('calculateMarketToll', () => {
    it('returns 0 when trade is not cross-regional', () => {
      expect(calculateMarketToll(100, false)).toBe(0)
      expect(calculateMarketToll(35, false)).toBe(0)
    })

    it('returns 0 for zero or negative values', () => {
      expect(calculateMarketToll(0, true)).toBe(0)
      expect(calculateMarketToll(-50, true)).toBe(0)
    })

    it('calculates 15% toll on positive integer values', () => {
      // 100 * 0.15 = 15
      expect(calculateMarketToll(100, true)).toBe(15)
      // 35 * 0.15 = 5.25 -> rounded to 5
      expect(calculateMarketToll(35, true)).toBe(5)
      // 20 * 0.15 = 3
      expect(calculateMarketToll(20, true)).toBe(3)
      // 10 * 0.15 = 1.5 -> rounded to 2
      expect(calculateMarketToll(10, true)).toBe(2)
      // 1 * 0.15 = 0.15 -> rounded to 0
      expect(calculateMarketToll(1, true)).toBe(0)
    })
  })

  describe('applyMarketToll', () => {
    it('applies toll deduction on sales (net = base - toll)', () => {
      const result = applyMarketToll(35, true, 'sell')
      expect(result.baseAmount).toBe(35)
      expect(result.toll).toBe(5)
      expect(result.netAmount).toBe(30)
    })

    it('applies toll surcharge on purchases (net = base + toll)', () => {
      const result = applyMarketToll(20, true, 'buy')
      expect(result.baseAmount).toBe(20)
      expect(result.toll).toBe(3)
      expect(result.netAmount).toBe(23)
    })

    it('returns base amount when isCrossRegional is false', () => {
      const sell = applyMarketToll(35, false, 'sell')
      expect(sell.toll).toBe(0)
      expect(sell.netAmount).toBe(35)

      const buy = applyMarketToll(20, false, 'buy')
      expect(buy.toll).toBe(0)
      expect(buy.netAmount).toBe(20)
    })
  })

  describe('calculateArbitrage (Village 2 Bạc -> Market 3.5 Bạc)', () => {
    it('suppresses raw 75% arbitrage margin down below exploit threshold', () => {
      // Village buy at 20 Bạc (2 Silver), Market sell at 35 Bạc (3.5 Silver)
      // Raw: (35 - 20) / 20 = 75% margin, 15 Bạc profit per unit
      const res = calculateArbitrage(20, 35, false, true)

      expect(res.rawMarginPercent).toBe(75)
      expect(res.grossProfit).toBe(15)
      // Cross-regional sell toll: 15% of 35 = 5 Bạc
      expect(res.totalToll).toBe(5)
      // Net profit: 30 - 20 = 10 Bạc (drop from 15 to 10)
      expect(res.netProfit).toBe(10)
      expect(res.netMarginPercent).toBe(50)
      // Net profit is strictly less than raw gross profit
      expect(res.netProfit).toBeLessThan(res.grossProfit)
    })

    it('handles two-way cross-regional toll when buying and selling across regions', () => {
      const res = calculateArbitrage(20, 35, true, true)
      // Buy cost with toll: 20 + 3 = 23
      // Sell net with toll: 35 - 5 = 30
      // Net profit: 30 - 23 = 7 Bạc
      expect(res.totalToll).toBe(8)
      expect(res.netProfit).toBe(7)
      expect(res.netMarginPercent).toBeCloseTo(30.43, 1)
    })
  })

  describe('shopStock regional helpers', () => {
    it('identifies cross-regional shops based on player and NPC location', () => {
      // n_farmer_tu is in 'village'
      expect(isCrossRegionalShop('village', 'n_farmer_tu')).toBe(false)
      expect(isCrossRegionalShop('market', 'n_farmer_tu')).toBe(true)

      // n_merchant_bao is in 'market'
      expect(isCrossRegionalShop('market', 'n_merchant_bao')).toBe(false)
      expect(isCrossRegionalShop('village', 'n_merchant_bao')).toBe(true)
    })

    it('computes effective trade prices using shopStock helpers', () => {
      expect(effectiveTradePrice(100, false, 'sell')).toBe(100)
      expect(effectiveTradePrice(100, true, 'sell')).toBe(85)
      expect(effectiveTradePrice(100, true, 'buy')).toBe(115)

      expect(marketTollForTrade(100, true)).toBe(15)
      expect(marketTollForTrade(100, false)).toBe(0)
    })
  })
})
