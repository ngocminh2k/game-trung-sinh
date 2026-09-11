// Issue 7 — wire the NPC shop prices (shops.ts) into the buy/sell flow, make
// Linh Thạch ↔ vàng exchange two-way so the top tier becomes a real sink, and
// give new players a silver income so the priceSilver stall tier circulates.
// These drive the actual reducer actions (runtime), not just the pure helpers.
import { describe, expect, it } from 'vitest'
import { applyAction, newGame } from '../src/engine'
import { marketPriceFor } from '../src/engine/shopStock'
import { START_SILVER } from '../src/engine/constants'
import { navTo } from './test-utils'
import type { GameState } from '../src/engine'

describe('Issue 7: market buys price from the NPC stalls', () => {
  it('charges the cheapest gold-normalised stall price, not item.buyPrice', () => {
    // pill_hp: static buyPrice 35, but stalls list it at 9 gold.
    const shop = marketPriceFor('pill_hp')
    expect(shop).not.toBeNull()
    expect(shop!.tier).toBe('gold')
    const atMarket = navTo(newGame('i7-buy-hp'), 'market')
    const rich: GameState = { ...atMarket, player: { ...atMarket.player, gold: 200 } }
    const result = applyAction(rich, { kind: 'buy', itemId: 'pill_hp' })
    const bought = result.events.find((e) => e.type === 'BOUGHT')
    if (bought?.type !== 'BOUGHT') expect.unreachable('buy must succeed')
    expect(bought.goldPaid).toBe(shop!.price)
    expect(result.state.player.gold).toBe(200 - shop!.price)
  })

  it('falls back to the static buyPrice when an item has no stall entry', () => {
    // Moon-moss appears in ~how many stalls? Use a ward that is buyable by
    // static price but absent from shops (warding_talisman is buyPrice 40,
    // no shop entry). Buy must still resolve to item.buyPrice.
    const atMarket = navTo(newGame('i7-buy-ward'), 'market')
    const rich: GameState = { ...atMarket, player: { ...atMarket.player, gold: 200 } }
    const result = applyAction(rich, { kind: 'buy', itemId: 'warding_talisman' })
    const bought = result.events.find((e) => e.type === 'BOUGHT')
    if (bought?.type !== 'BOUGHT') expect.unreachable('ward buy must succeed')
    expect(bought.goldPaid).toBe(40)
  })

  it('rejects quest-only items that have neither a stall nor a static price', () => {
    // old_manual is a quest reward, not salable/buyable goods; buying must error.
    let state = navTo(newGame('i7-buy-manual'), 'market')
    state = { ...state, player: { ...state.player, stage: 3, gold: 999 } }
    const result = applyAction(state, { kind: 'buy', itemId: 'old_manual' })
    expect(result.events.some((e) => e.type === 'ERROR' && e.code === 'ITEM_UNAVAILABLE')).toBe(true)
  })
})

describe('Issue 7: Linh Thạch ↔ vàng exchange is two-way (no arbitrage)', () => {
  it('burns gold to buy a spirit stone back (the late-game sink)', () => {
    let state = navTo(newGame('i7-conv-gold->ls'), 'market')
    state = { ...state, player: { ...state.player, gold: 100, spiritStones: 0 } }
    const result = applyAction(state, { kind: 'convert_currency', from: 'gold', qty: 1 })
    const conv = result.events.find((e) => e.type === 'CURRENCY_CONVERTED')
    if (conv?.type !== 'CURRENCY_CONVERTED') expect.unreachable('conversion must succeed')
    expect(conv.from).toBe('gold')
    expect(result.state.player.gold).toBe(90)
    expect(result.state.player.spiritStones).toBe(1)
  })

  it('rejects gold-to-stone when gold is short', () => {
    let state = navTo(newGame('i7-conv-gold-poor'), 'market')
    state = { ...state, player: { ...state.player, gold: 5 } }
    const result = applyAction(state, { kind: 'convert_currency', from: 'gold', qty: 1 })
    expect(result.events.some((e) => e.type === 'ERROR' && e.code === 'INSUFFICIENT_GOLD')).toBe(true)
  })
})

describe('Issue 7: a new player can earn silver', () => {
  it('starts with walking-around silver (priceSilver tier circulates)', () => {
    const game = newGame('i7-silver')
    expect(game.player.silver).toBe(START_SILVER)
    expect(START_SILVER).toBeGreaterThan(0)
  })

  it('buying a silver-priced stall good spends silver, not gold', () => {
    // moon_moss is cheapest in a priceSilver stall (tier resolves to 'silver').
    const offer = marketPriceFor('moon_moss')
    expect(offer).not.toBeNull()
    expect(offer!.tier).toBe('silver')
    let state = navTo(newGame('i7-buy-silver'), 'market')
    state = { ...state, player: { ...state.player, gold: 200, silver: 200 } }
    const result = applyAction(state, { kind: 'buy', itemId: 'moon_moss' })
    const bought = result.events.find((e) => e.type === 'BOUGHT')
    if (bought?.type !== 'BOUGHT') expect.unreachable('silver buy must succeed')
    expect(result.state.player.silver).toBe(200 - offer!.price)
    expect(result.state.player.gold).toBe(200)
  })
})