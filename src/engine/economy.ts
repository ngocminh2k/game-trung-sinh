 /* Pure 3-tier economy helpers (T02). Rates are fixed by contract
 * (docs/plans/expansion-x20/contracts/item-ids.md): 1 Linh Thạch = 10 Vàng
 * = 100 Bạc. No Math.random, no Date.now, no console — deterministic only.
 */

/** 1 spirit stone (Linh Thạch) converts to this many gold. */
export const LS_TO_GOLD = 10
/** 1 gold converts to this many silver. */
export const GOLD_TO_SILVER = 10

export interface CurrencyBalance {
  gold: number
  silver: number
  spiritStones: number
}

export interface CurrencyPrice {
  gold?: number
  silver?: number
  spiritStones?: number
}

/** Returns the whole-gold equivalent of silver, rounded down. */
export function silverToGold(n: number): number {
  return Math.floor(n / GOLD_TO_SILVER)
}

/** Gold → silver (exact, ×10). */
export function goldToSilver(n: number): number {
  return n * GOLD_TO_SILVER
}

/** Returns the whole-spirit-stone equivalent of gold, rounded down. */
export function goldToSpiritStones(n: number): number {
  return Math.floor(n / LS_TO_GOLD)
}

function currencyInSilver(currency: CurrencyPrice): number | null {
  const spiritStones = currency.spiritStones ?? 0
  const gold = currency.gold ?? 0
  const silver = currency.silver ?? 0
  if (![spiritStones, gold, silver].every((amount) => Number.isSafeInteger(amount) && amount >= 0)) {
    return null
  }
  const total = spiritStones * LS_TO_GOLD * GOLD_TO_SILVER + gold * GOLD_TO_SILVER + silver
  return Number.isSafeInteger(total) ? total : null
}

/** Total purchasing power in silver — tier-agnostic affordability check. */
export function canAffordCurrency(p: CurrencyBalance, price: CurrencyPrice): boolean {
  const balance = currencyInSilver(p)
  const cost = currencyInSilver(price)
  return balance !== null && cost !== null && balance >= cost
}

/** Deduct a price at fixed exchange rates, returning canonical denominations.
 * Pure — returns the original balance when either amount is invalid or the price exceeds its value. */
export function spendCurrency(p: CurrencyBalance, price: CurrencyPrice): CurrencyBalance {
  const total = currencyInSilver(p)
  const cost = currencyInSilver(price)
  if (total === null || cost === null || cost > total) return { ...p }

  const remaining = total - cost
  const spiritStones = Math.floor(remaining / (LS_TO_GOLD * GOLD_TO_SILVER))
  const gold = Math.floor((remaining % (LS_TO_GOLD * GOLD_TO_SILVER)) / GOLD_TO_SILVER)
  const silver = remaining % GOLD_TO_SILVER

  return { gold, silver, spiritStones }
}

export const MARKET_TOLL_RATE = 0.15

export function calculateMarketToll(amount: number, isCrossRegional = true): number {
  if (!isCrossRegional || amount <= 0) return 0
  return Math.round(amount * MARKET_TOLL_RATE)
}

export function applyMarketToll(
  amount: number,
  isCrossRegional = true,
  mode: 'sell' | 'buy' = 'sell',
): { baseAmount: number; toll: number; netAmount: number } {
  const toll = calculateMarketToll(amount, isCrossRegional)
  const netAmount = mode === 'sell' ? Math.max(0, amount - toll) : amount + toll
  return { baseAmount: amount, toll, netAmount }
}

export function calculateArbitrage(
  buyPrice: number,
  sellPrice: number,
  crossRegionalBuy = false,
  crossRegionalSell = true,
): {
  grossProfit: number
  totalToll: number
  netProfit: number
  rawMarginPercent: number
  netMarginPercent: number
} {
  const grossProfit = sellPrice - buyPrice
  const rawMarginPercent = buyPrice > 0 ? ((sellPrice - buyPrice) / buyPrice) * 100 : 0
  const buyToll = calculateMarketToll(buyPrice, crossRegionalBuy)
  const sellToll = calculateMarketToll(sellPrice, crossRegionalSell)
  const totalToll = buyToll + sellToll
  const effectiveBuy = buyPrice + buyToll
  const effectiveSell = Math.max(0, sellPrice - sellToll)
  const netProfit = effectiveSell - effectiveBuy
  const netMarginPercent = effectiveBuy > 0 ? (netProfit / effectiveBuy) * 100 : 0
  return { grossProfit, totalToll, netProfit, rawMarginPercent, netMarginPercent }
}
