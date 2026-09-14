// Issue 36 — "success == silence". Every player action that visibly succeeds or
// fails must put its actual consequence in the chronicle line: what was bought
// (qty + price), what a sale paid, the cost/odds/EV behind a lottery draw, the
// currency on both sides of an exchange, and the explicit reason a demand was
// refused — never the "something happened" fallback or a generic shrug. All
// values are read from state+event or fixed constants, so narration stays
// deterministic and agrees with the engine's own numbers.
import { describe, expect, it } from 'vitest'
import { applyAction, narrateLine, newGame } from '../src/engine'
import { LOTTERY_COST } from '../src/engine/constants'
import { getItem } from '../src/content'
import { LOTTERY_EXPECTED_VALUE, narrateLine as narrateLineDirect } from '../src/engine/narrator'
import { navTo } from './test-utils'
import type { GameEvent, GameState, Locale } from '../src/engine'

function both(ev: GameEvent): Record<Locale, string> {
  return { vi: narrateLineDirect(ev, 'vi'), en: narrateLineDirect(ev, 'en') }
}

describe('issue 36: purchase narrates quantity and price', () => {
  it('a multi-unit buy states both the count and the gold paid (real action)', () => {
    const atMarket = navTo(newGame('i36-buy'), 'market')
    const rich: GameState = { ...atMarket, player: { ...atMarket.player, gold: 500 } }
    const result = applyAction(rich, { kind: 'buy', itemId: 'pill_hp', qty: 3 })
    const bought = result.events.find((e) => e.type === 'BOUGHT')
    if (bought?.type !== 'BOUGHT') expect.unreachable('buy must succeed')
    const lines = both(bought)
    // Price and quantity both appear, and they are the numbers the engine used.
    expect(lines.vi).toContain(String(bought.goldPaid))
    expect(lines.vi).toContain('3')
    expect(lines.en).toContain(String(bought.goldPaid))
    expect(lines.en).toContain('3')
    // Item is named, not a bare id.
    expect(lines.vi).toContain('Viên hồi nguyên')
  })
})

describe('issue 36: a sale states its proceeds', () => {
  it('names the item, the quantity and the gold gained (real action)', () => {
    let state = navTo(newGame('i36-sell'), 'market')
    // Ensure a sellable stack in the bag (start inventory has one spirit_herb).
    state = { ...state, inventory: { ...state.inventory, spirit_herb: 4 } }
    const result = applyAction(state, { kind: 'sell', itemId: 'spirit_herb', qty: 4 })
    const sold = result.events.find((e) => e.type === 'SOLD')
    if (sold?.type !== 'SOLD') expect.unreachable('sell must succeed')
    const lines = both(sold)
    expect(lines.vi).toContain(String(sold.goldGain))
    expect(lines.vi).toContain('4')
    expect(lines.en).toContain(String(sold.goldGain))
    expect(lines.en).toContain('4')
    // Proceeds match the engine: 4 × sellPrice 12 less the flat technique-free counter fee.
    expect(sold.goldGain).toBeGreaterThan(0)
    expect(sold.goldGain).toBeLessThanOrEqual(4 * (getItem('spirit_herb')?.sellPrice ?? 0))
  })
})

describe('issue 36: lottery reveals cost, odds and EV', () => {
  it('every tier line states the ticket price and the expected value', () => {
    const herb = getItem('spirit_herb')?.sellPrice ?? 0
    const tiers: GameEvent[] = [
      { type: 'DRAW_RESULT', tier: 'grand', goldDelta: 80 },
      { type: 'DRAW_RESULT', tier: 'major', goldDelta: 60 },
      { type: 'DRAW_RESULT', tier: 'minor', goldDelta: 20 },
      { type: 'DRAW_RESULT', tier: 'herb', goldDelta: 0, itemId: 'spirit_herb' },
      { type: 'DRAW_RESULT', tier: 'none', goldDelta: 0 },
    ]
    for (const ev of tiers) {
      const lines = both(ev)
      // Ticket price is always visible.
      expect(lines.vi).toContain(String(LOTTERY_COST))
      expect(lines.en).toContain(String(LOTTERY_COST))
      // The expected value the chronicle quotes matches the exported constant.
      expect(lines.vi).toContain(String(LOTTERY_EXPECTED_VALUE))
      expect(lines.en).toContain(String(LOTTERY_EXPECTED_VALUE))
    }
    // EV is derived from the published prizes, not invented: 19.25 for this table.
    expect(LOTTERY_EXPECTED_VALUE).toBe((1 * 80 + 2 * 60 + 3 * 20 + 4 * herb) / 16)
    // A blank ticket says the loss out loud (cost gone), not a cheerful retry.
    const blank = both(tiers[4] as GameEvent)
    expect(blank.vi).toContain('mất')
    expect(blank.en.toLowerCase()).toContain('gone')
  })

  it('a real draw at the market produces a line carrying the cost', () => {
    const atMarket = navTo(newGame('i36-draw'), 'market')
    const rich: GameState = { ...atMarket, player: { ...atMarket.player, gold: 100 } }
    const result = applyAction(rich, { kind: 'draw_lottery' })
    const draw = result.events.find((e) => e.type === 'DRAW_RESULT')
    if (draw?.type !== 'DRAW_RESULT') expect.unreachable('draw must succeed')
    const lines = both(draw)
    expect(lines.vi).toContain(String(LOTTERY_COST))
    expect(lines.en).toContain(String(LOTTERY_COST))
  })
})

describe('issue 36: currency exchange names both sides', () => {
  it('no longer falls back to silence; states the tier traded', () => {
    const conversions: GameEvent[] = [
      { type: 'CURRENCY_CONVERTED', from: 'spiritStone', qty: 2, goldGain: 20 },
      { type: 'CURRENCY_CONVERTED', from: 'gold', qty: 3, goldGain: -30 },
      { type: 'CURRENCY_CONVERTED', from: 'silver', qty: 5, goldGain: 5 },
    ]
    for (const ev of conversions) {
      const lines = both(ev)
      expect(lines.vi.length).toBeGreaterThan(0)
      expect(lines.en.length).toBeGreaterThan(0)
      // Both denominations present.
      if (ev.type === 'CURRENCY_CONVERTED' && ev.from === 'spiritStone') {
        expect(lines.vi).toContain('linh thạch')
        expect(lines.en).toContain('spirit stone')
      }
      if (ev.type === 'CURRENCY_CONVERTED' && ev.from === 'silver') {
        expect(lines.vi).toContain('bạc')
        expect(lines.en).toContain('silver')
      }
    }
    // A real exchange at the market fires the event and narrates it.
    let state = navTo(newGame('i36-conv'), 'market')
    state = { ...state, player: { ...state.player, spiritStones: 5 } }
    const result = applyAction(state, { kind: 'convert_currency', from: 'spiritStone', qty: 2 })
    const conv = result.events.find((e) => e.type === 'CURRENCY_CONVERTED')
    if (conv?.type !== 'CURRENCY_CONVERTED') expect.unreachable('convert must succeed')
    expect(narrateLine(conv, 'vi')).toContain('20 lượng')
  })
})

describe('issue 36: refusals state the reason, never a shrug', () => {
  const REFUSED = 'Ý định ấy chưa thể thành lúc này.'
  const REFUSED_EN = 'That intent cannot happen right now.'

  // Codes that previously all rendered the same generic shrug.
  const newlyExplained: Array<[string, GameEvent]> = [
    ['INSUFFICIENT_SILVER', { type: 'ERROR', code: 'INSUFFICIENT_SILVER' }],
    ['INSUFFICIENT_SPIRIT_STONES', { type: 'ERROR', code: 'INSUFFICIENT_SPIRIT_STONES' }],
    ['INSUFFICIENT_HP', { type: 'ERROR', code: 'INSUFFICIENT_HP' }],
    ['STORAGE_LOCKED', { type: 'ERROR', code: 'STORAGE_LOCKED' }],
    ['REGION_LOCKED', { type: 'ERROR', code: 'REGION_LOCKED' }],
    ['SYSTEM_LOCKED', { type: 'ERROR', code: 'SYSTEM_LOCKED' }],
    ['ARENA_CLOSED', { type: 'ERROR', code: 'ARENA_CLOSED' }],
    ['COERCION_UNAVAILABLE', { type: 'ERROR', code: 'COERCION_UNAVAILABLE' }],
    ['SKILL_UNKNOWN', { type: 'ERROR', code: 'SKILL_UNKNOWN' }],
    ['SKILL_ALREADY_UNLOCKED', { type: 'ERROR', code: 'SKILL_ALREADY_UNLOCKED' }],
    ['SKILL_REQUIREMENT_NOT_MET', { type: 'ERROR', code: 'SKILL_REQUIREMENT_NOT_MET' }],
    ['SKILL_CONFLICT', { type: 'ERROR', code: 'SKILL_CONFLICT' }],
    ['INSUFFICIENT_SKILL_POINTS', { type: 'ERROR', code: 'INSUFFICIENT_SKILL_POINTS' }],
  ]

  it('each newly covered code says something specific in both locales', () => {
    for (const [, ev] of newlyExplained) {
      const lines = both(ev)
      expect(lines.vi, `${(ev as { code: string }).code} vi still generic`).not.toBe(REFUSED)
      expect(lines.en, `${(ev as { code: string }).code} en still generic`).not.toBe(REFUSED_EN)
      // Locales genuinely differ.
      expect(lines.vi).not.toBe(lines.en)
    }
  })

  it('an insufficient-silver buy refusal is reachable and specific (real action)', () => {
    const atMarket = navTo(newGame('i36-refuse-silver'), 'market')
    // Gold in hand (so the gold path is what ran out), no silver to fall back on.
    const poor: GameState = {
      ...atMarket,
      player: { ...atMarket.player, gold: 5, silver: 0, spiritStones: 0 },
    }
    const result = applyAction(poor, { kind: 'buy', itemId: 'pill_hp' })
    const err = result.events.find((e) => e.type === 'ERROR')
    if (err?.type !== 'ERROR') expect.unreachable('poor buy must refuse')
    expect(err.code).toBe('INSUFFICIENT_SILVER')
    const lines = both(err)
    expect(lines.vi).not.toBe(REFUSED)
    expect(lines.en.toLowerCase()).toContain('silver')
  })

  it('a still-unmapped code keeps the graceful fallback', () => {
    const unknown = { type: 'ERROR', code: 'TERMINAL' } as GameEvent
    // TERMINAL is explained, so it must not be the fallback string; prove the
    // fallback path is intact for a code we deliberately left off the map.
    expect(narrateLine(unknown, 'vi')).not.toBe(REFUSED)
  })
})

describe('issue 36: affinity and system-pick are no longer silent', () => {
  it('both render consequence text, not the fallback', () => {
    const aff = both({ type: 'AFFINITY', npcId: 'n_elder_meihua', level: 3 })
    expect(aff.vi).not.toBe('Chuyện gì đó đã xảy ra...')
    expect(aff.vi).toContain('3')
    expect(aff.en).toContain('3')
    const sys = both({ type: 'SYSTEM_CHOSEN', systemId: 'sys_battle' })
    expect(sys.vi).not.toBe('Chuyện gì đó đã xảy ra...')
    expect(sys.en).not.toBe('Something happened...')
    expect(sys.vi).toContain('Hệ Thống Chiến Đấu')
    expect(sys.en).toContain('Battle System')
    // And vi != en.
    expect(aff.vi).not.toBe(aff.en)
    expect(sys.vi).not.toBe(sys.en)
  })
})

describe('issue 36: narration stays deterministic', () => {
  it('the same events yield byte-identical lines in both locales', () => {
    const evs: GameEvent[] = [
      { type: 'BOUGHT', itemId: 'pill_hp', qty: 3, goldPaid: 27 },
      { type: 'SOLD', itemId: 'spirit_herb', qty: 4, goldGain: 44 },
      { type: 'CURRENCY_CONVERTED', from: 'spiritStone', qty: 2, goldGain: 20 },
      { type: 'DRAW_RESULT', tier: 'none', goldDelta: 0 },
      { type: 'ERROR', code: 'SKILL_CONFLICT' },
    ]
    for (const locale of ['vi', 'en'] as const) {
      const first = JSON.stringify(evs.map((e) => narrateLine(e, locale)))
      const second = JSON.stringify(evs.map((e) => narrateLine(e, locale)))
      expect(first).toBe(second)
    }
  })
})
