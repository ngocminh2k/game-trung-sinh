// Issue #39 (p1-high): gifts are answered per NPC and the ♥ counter is real.
// Playtest p09/p12: NPCs all repeated one canned chain and the rapport number
// never moved, so the whole social loop read as decoration.
//
// Acceptance covered here:
//  AC1 — a gift consumes the item, moves affinity, and the number is visible
//        in the event and in the chronicle line (vi + en).
//  AC2 — two NPCs react to the SAME gift with two different authored lines.
//  AC3 — no shared fallback chain: every NPC in NPCS has their own reaction
//        in BOTH locales, and no two reactions are the same string.
import { describe, expect, it } from 'vitest'
import { applyAction, getAffection, narrateLine, newGame } from '../src/engine'
import { parseFreeText } from '../src/engine/corrections'
import { getItem, NPCS } from '../src/content'
import { NPC_GIFT_RESPONSES, giftReactionFor } from '../src/content/npc-gifts'
import type { GameState } from '../src/engine/types'
import { navTo } from './test-utils'

// Real content handles (verified sellPrice): robe 2 → +1, pill_qi 15 → +1,
// cloudwalk 105 → +3, evidence null → refused, cleaver 140 → +3 (unowned).
const CHEAP_ITEM = 'tattered_robe' // newGame carries one
const FINE_ITEM = 'cloudwalk_manual'
const JUNK_ITEM = 'evidence_route_mercy' // sellPrice null
const MID_ITEM = 'pill_qi'
const UNOWNED_ITEM = 'peak_cleaver_manual'

function villageState(seed: string): GameState {
  const s = newGame(seed)
  return { ...s, inventory: { ...s.inventory, [FINE_ITEM]: 1, [JUNK_ITEM]: 1 } }
}

function errorOf(result: { events: Array<{ type: string; code?: string }> }): string | undefined {
  const ev = result.events.find((e) => e.type === 'ERROR')
  return ev?.code
}

describe('issue 39 AC1: a gift moves a number the player can see', () => {
  it('consumes the item, raises affinity by the item tier, and emits GIFTED', () => {
    const state = villageState('i39-gift')
    const result = applyAction(state, { kind: 'gift', npcId: 'n_elder_meihua', itemId: FINE_ITEM })
    const gifted = result.events.find((e) => e.type === 'GIFTED')
    if (gifted?.type !== 'GIFTED') expect.unreachable(`gift must succeed, got ${errorOf(result)}`)
    expect(gifted.delta).toBe(3)
    expect(gifted.total).toBe(3)
    expect(getAffection(result.state, 'n_elder_meihua')).toBe(3)
    // The item is gone from the pack — gifts cost something.
    expect(result.state.inventory[FINE_ITEM] ?? 0).toBe(0)
    // The chronicle line states the visible numbers in both locales.
    const vi = narrateLine(gifted, 'vi')
    const en = narrateLine(gifted, 'en')
    expect(vi).toContain('+3')
    expect(vi).toContain(getItem(FINE_ITEM)?.nameVi ?? '')
    expect(vi).toContain('Cụ Mai Hoa')
    expect(en).toContain('+3')
    expect(en).toContain('Cloudwalk')
    expect(en).toContain('Meihua')
  })

  it('a small gift swings +1 and crossing 3 fires the AFFINITY milestone', () => {
    const base = villageState('i39-gate')
    const state: GameState = {
      ...base,
      inventory: { ...base.inventory, [MID_ITEM]: 2 },
      flags: { ...base.flags, aff_n_elder_meihua: 2 },
    }
    const result = applyAction(state, { kind: 'gift', npcId: 'n_elder_meihua', itemId: MID_ITEM })
    const gifted = result.events.find((e) => e.type === 'GIFTED')
    if (gifted?.type !== 'GIFTED') expect.unreachable('gift must succeed')
    expect(gifted.delta).toBe(1)
    expect(gifted.total).toBe(3)
    expect(result.events.some((e) => e.type === 'AFFINITY' && e.level === 3)).toBe(true)
    expect(result.state.flags.aff_gate_n_elder_meihua).toBe(true)
    // Gifting is not talking — the talk telemetry stays untouched.
    expect(result.state.flags.talkCount).toBeUndefined()
  })

  it('an item without market value is refused, not shrugged at', () => {
    const result = applyAction(villageState('i39-junk'), { kind: 'gift', npcId: 'n_elder_meihua', itemId: JUNK_ITEM })
    // Evidence is a document, not a gift — same refusal code the shop uses for
    // unsellable goods; no new error codes needed.
    expect(errorOf(result)).toBe('ITEM_UNAVAILABLE')
  })

  it('a gift you do not own fails without touching affinity', () => {
    const state = villageState('i39-poor')
    const result = applyAction(state, { kind: 'gift', npcId: 'n_elder_meihua', itemId: UNOWNED_ITEM })
    expect(errorOf(result)).toBe('NO_ITEM')
    expect(getAffection(result.state, 'n_elder_meihua')).toBe(0)
  })

  it('a gift across towns is refused as NPC_NOT_HERE', () => {
    const state = navTo(villageState('i39-far'), 'market')
    const result = applyAction(state, { kind: 'gift', npcId: 'n_elder_meihua', itemId: FINE_ITEM })
    expect(errorOf(result)).toBe('NPC_NOT_HERE')
  })

  it('the same seed and gift replay identically (determinism)', () => {
    const run = (): string => {
      const r = applyAction(villageState('i39-replay'), { kind: 'gift', npcId: 'n_elder_meihua', itemId: FINE_ITEM })
      return JSON.stringify(r.events)
    }
    expect(run()).toBe(run())
  })

  it('free text resolves both halves of the gift', () => {
    expect(parseFreeText('tặng quà cho cụ Mai Hoa: Vân Du Giản')).toEqual({
      ok: true,
      action: { kind: 'gift', npcId: 'n_elder_meihua', itemId: FINE_ITEM },
    })
    // "cloudwalk" is the alias that resolves uniquely — the bare word
    // "manual" belongs to old_manual earlier in the item table.
    expect(parseFreeText('gift cloudwalk to Elder Meihua')).toEqual({
      ok: true,
      action: { kind: 'gift', npcId: 'n_elder_meihua', itemId: FINE_ITEM },
    })
    // A bare "talk to" sentence must not be mis-read as a gift.
    const talk = parseFreeText('talk to Elder Meihua')
    expect(talk.ok).toBe(true)
    if (talk.ok) expect(talk.action.kind).toBe('talk')
    // A half-specified gift falls through instead of stealing the sentence.
    const graze = parseFreeText('gift to Elder Meihua')
    if (graze.ok) expect(graze.action.kind).not.toBe('gift')
  })
})

describe('issue 39 AC2: two NPCs, one gift, two reactions', () => {
  it('the same item handed to two NPCs produces two different authored lines', () => {
    const merchant = giftReactionFor('n_merchant_bao')
    const kid = giftReactionFor('n_kid_xiaobao')
    expect(merchant).toBeDefined()
    expect(kid).toBeDefined()
    if (merchant === undefined || kid === undefined) return
    expect(merchant.vi).not.toBe(kid.vi)
    expect(merchant.en).not.toBe(kid.en)
    // Both voice the actual gift — the item name is in the line, per locale.
    expect(merchant.vi).toContain('{item}')
    expect(kid.vi).toContain('{item}')
  })

  it('the engine emits the NPC’s own authored reaction through a real action', () => {
    let state = navTo(newGame('i39-two'), 'market')
    state = { ...state, inventory: { ...state.inventory, [CHEAP_ITEM]: 1 } }
    const result = applyAction(state, { kind: 'gift', npcId: 'n_merchant_bao', itemId: CHEAP_ITEM })
    const gifted = result.events.find((e) => e.type === 'GIFTED')
    if (gifted?.type !== 'GIFTED') expect.unreachable('gift to Bao must succeed')
    // Bao is a merchant: his line talks about a recorded debt, and the gift
    // itself is named — a canned chain answers neither.
    expect(gifted.lineVi).toContain('ghi món nợ')
    expect(gifted.lineEn).toContain('debt is recorded')
    expect(gifted.lineVi).toContain(getItem(CHEAP_ITEM)?.nameVi ?? '')
    expect(gifted.lineEn).toContain(getItem(CHEAP_ITEM)?.nameEn ?? '')
    // And it matches the authored table exactly, locale for locale.
    const authored = giftReactionFor('n_merchant_bao')
    expect(gifted.lineVi).toBe(authored?.vi.replace('{item}', getItem(CHEAP_ITEM)?.nameVi ?? ''))
  })
})

describe('issue 39 AC3: no shared fallback chain exists', () => {
  it('every NPC in the world has a gift reaction in both locales', () => {
    const missing = NPCS.filter((n) => {
      const r = giftReactionFor(n.id)
      return r === undefined || r.vi.length === 0 || r.en.length === 0
    }).map((n) => n.id)
    expect(missing).toEqual([])
  })

  it('no two NPCs share a reaction line (pairwise uniqueness, both locales)', () => {
    for (const locale of ['vi', 'en'] as const) {
      const seen = new Map<string, string>()
      for (const [id, r] of Object.entries(NPC_GIFT_RESPONSES)) {
        const clash = seen.get(r[locale])
        expect(clash, `${id} duplicates ${String(clash)} in ${locale}`).toBeUndefined()
        seen.set(r[locale], id)
      }
      expect(seen.size).toBe(NPCS.length)
    }
  })

  it('every reaction references the gift itself', () => {
    for (const [id, r] of Object.entries(NPC_GIFT_RESPONSES)) {
      expect(r.vi, id).toContain('{item}')
      expect(r.en, id).toContain('{item}')
    }
  })
})
