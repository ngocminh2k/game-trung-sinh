import { describe, expect, it } from 'vitest'
import { STORAGE_CAPACITY, applyAction, newGame, storageUnitsUsed } from '../src/engine'
import type { Action, ErrorCode, GameEvent, GameState } from '../src/engine'
import { navTo } from './test-utils'

const SEED = 'fuzz-invariants'

function mulberry(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let x = Math.imul(s ^ (s >>> 15), s | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function hasErrorCode(events: readonly GameEvent[], code: ErrorCode): boolean {
  return events.some((e) => e.type === 'ERROR' && e.code === code)
}

function assertInvariants(state: GameState): void {
  expect(state.player.gold).toBeGreaterThanOrEqual(0)
  expect(state.player.hp).toBeGreaterThanOrEqual(0)
  expect(state.player.hp).toBeLessThanOrEqual(100)
  expect(state.player.qi).toBeGreaterThanOrEqual(0)
  expect(state.player.qi).toBeLessThanOrEqual(60)
  for (const count of Object.values(state.inventory)) {
    expect(count).toBeGreaterThanOrEqual(0)
    expect(Number.isInteger(count)).toBe(true)
  }
  for (const count of Object.values(state.storage)) {
    expect(count).toBeGreaterThanOrEqual(0)
    expect(Number.isInteger(count)).toBe(true)
  }
  expect(storageUnitsUsed(state)).toBeLessThanOrEqual(STORAGE_CAPACITY)
  expect(state.corrections).toBeGreaterThanOrEqual(0)
  expect(state.corrections).toBeLessThanOrEqual(100000)
  for (const quest of Object.values(state.quests)) {
    expect(['available', 'active', 'completed']).toContain(quest.status)
  }
}

const GARBAGE = ['xyzzy qwerty flurb', 'zzzzz', 'aaaa bbbb cccc']

describe('invariant fuzz', () => {
  it('random action streams never break resource invariants or corrections bound', () => {
    const rand = mulberry(SEED.length * 7919 + 13)
    let state = newGame(SEED)
    const visited = new Set<string>()
    const hits = { arena: 0, combat: 0, coerce: 0 }
    for (let step = 0; step < 400; step++) {
      if (state.terminal) break
      // Unspent attribute points freeze every other action, so the fuzz
      // spends them first (also covering allocate_attribute itself).
      if (state.player.pendingAttributePoints > 0) {
        const attrs = ['body', 'mind', 'charm', 'luck'] as const
        state = applyAction(state, { kind: 'allocate_attribute', attribute: attrs[Math.floor(rand() * 3)] ?? 'body' }).state
        assertInvariants(state)
        continue
      }
      // A pure random walk from the village center almost never lands on the
      // sect/market exit cells, which would make every location-gated branch
      // below vacuous. Every ~40 steps, take a deterministic BFS route to a
      // new hub so arena, coercion, and market bands actually fire.
      if (step % 40 === 39 && state.encounter === null) {
        const hub = ['sect', 'market', 'herb_field'][Math.floor(rand() * 3)] ?? 'sect'
        state = navTo(state, hub)
      }
      const roll = rand()
      const at = state.player.locationId
      visited.add(at)
      let action: Action
      if (roll < 0.3) {
        const dirs = ['north', 'south', 'east', 'west'] as const
        action = { kind: 'move', direction: dirs[Math.floor(rand() * 4)] ?? 'north' }
      } else if (roll < 0.4) {
        action = { kind: 'train' }
      } else if (roll < 0.5) {
        action = { kind: 'rest' }
      } else if (roll < 0.6 && at === 'herb_field') {
        action = { kind: 'gather' }
      } else if (roll < 0.68 && at === 'market') {
        action = { kind: 'buy', itemId: rand() < 0.5 ? 'pill_hp' : 'jade_charm' }
      } else if (roll < 0.76 && at === 'market') {
        action = { kind: 'sell', itemId: rand() < 0.5 ? 'spirit_herb' : 'pill_qi' }
      } else if (roll < 0.82 && at === 'sect') {
        action =
          rand() < 0.5
            ? { kind: 'store', itemId: 'spirit_herb', qty: 1 + Math.floor(rand() * 3) }
            : { kind: 'withdraw', itemId: 'spirit_herb', qty: 1 + Math.floor(rand() * 3) }
      } else if (roll < 0.88 && at === 'market') {
        action = { kind: 'draw_lottery' }
      } else if (roll < 0.9 && state.encounter !== null) {
        // In a fight you can only fight — attack/defend/retreat. This covers
        // wild encounters AND Lôi Đài floors opened below.
        const combat = rand()
        action =
          combat < 0.6
            ? { kind: 'combat_attack', techniqueId: combat < 0.3 ? 'basic_staff_form' : undefined }
            : combat < 0.85
              ? { kind: 'combat_defend' }
              : { kind: 'combat_retreat' }
        hits.combat += 1
      } else if (roll < 0.92 && at === 'sect') {
        // arena_challenge creates an encounter; the combat branch above then
        // drives it to a conclusion (win, loss, or flight).
        action = { kind: 'arena_challenge' }
        hits.arena += 1
      } else if (roll < 0.94 && (at === 'sect' || at === 'market')) {
        // coerce_npc is the other new resource-creating action: plunder adds
        // gold+items once, back_off spends a day and adds affection once.
        action = {
          kind: 'coerce_npc',
          npcId: at === 'market' ? 'n_merchant_bao' : 'n_keeper_anh',
          approach: rand() < 0.5 ? 'plunder' : 'back_off',
        }
        hits.coerce += 1
      } else if (roll < 0.97) {
        action = { kind: 'free_text', raw: GARBAGE[Math.floor(rand() * GARBAGE.length)] ?? 'zzz' }
      } else {
        action = { kind: 'talk', npcId: 'n_elder_meihua' }
      }
      const result = applyAction(state, action)
      state = result.state
      assertInvariants(state)
      if (state.terminal) {
        const again = applyAction(state, { kind: 'rest' })
        expect(JSON.stringify(again.state)).toBe(JSON.stringify(state))
        expect(hasErrorCode(again.events, 'TERMINAL')).toBe(true)
        break
      }
    }
    // A green fuzz run that never touched the new actions would be worthless.
    expect(visited.has('sect'), 'fuzz never reached the sect').toBe(true)
    expect(visited.has('market'), 'fuzz never reached the market').toBe(true)
    expect(hits.arena, 'fuzz never issued arena_challenge').toBeGreaterThan(0)
    expect(hits.coerce, 'fuzz never issued coerce_npc').toBeGreaterThan(0)
    expect(hits.combat, 'fuzz never issued a combat action').toBeGreaterThan(0)
  })
})

describe('storage conservation', () => {
  it('store then withdraw conserves per-item totals', () => {
    let state = newGame('storage-cons')
    state = navTo(state, 'herb_field')
    state = applyAction(state, { kind: 'gather' }).state
    state = navTo(state, 'sect')
    const totalBefore =
      (state.inventory['spirit_herb'] ?? 0) + (state.storage['spirit_herb'] ?? 0)
    expect(totalBefore).toBeGreaterThanOrEqual(1)

    state = applyAction(state, { kind: 'store', itemId: 'spirit_herb', qty: 1 }).state
    expect(
      (state.inventory['spirit_herb'] ?? 0) + (state.storage['spirit_herb'] ?? 0),
    ).toBe(totalBefore)
    expect(storageUnitsUsed(state)).toBe(1)

    state = applyAction(state, { kind: 'withdraw', itemId: 'spirit_herb', qty: 1 }).state
    expect(state.inventory['spirit_herb'] ?? 0).toBe(totalBefore)
    expect(storageUnitsUsed(state)).toBe(0)
  })

  it('storing beyond capacity is rejected with no state change', () => {
    let state = newGame('storage-cap')
    state = navTo(state, 'sect')
    const snapshot = JSON.stringify(state)
    const result = applyAction(state, {
      kind: 'store',
      itemId: 'spirit_herb',
      qty: STORAGE_CAPACITY + 10,
    })
    expect(hasErrorCode(result.events, 'STORAGE_FULL') || result.events.some((e) => e.type === 'ERROR')).toBe(true)
    expect(JSON.stringify(result.state)).toBe(snapshot)
  })

  it('storage operations outside the sect are rejected', () => {
    const state = newGame('storage-loc')
    const result = applyAction(state, { kind: 'store', itemId: 'spirit_herb', qty: 1 })
    expect(hasErrorCode(result.events, 'NOT_AT_LOCATION')).toBe(true)
  })

  it('withdrawing an absent item is rejected', () => {
    let state = newGame('storage-empty')
    state = navTo(state, 'sect')
    const snapshot = JSON.stringify(state)
    const result = applyAction(state, { kind: 'withdraw', itemId: 'pill_hp', qty: 1 })
    expect(result.events.some((e) => e.type === 'ERROR')).toBe(true)
    expect(JSON.stringify(result.state)).toBe(snapshot)
  })
})
