import { describe, expect, it } from 'vitest'
import { applyAction, newGame, parseFreeText } from '../src/engine'
import type { GameState } from '../src/engine'
import { ARENA_FLOOR_COUNT, arenaFloors, eligibleEnemiesAt, validateAllContent } from '../src/content'
import { navTo } from './test-utils'

// A save that can actually clear tower floors: boosted body/stage/hp. Qi is
// NOT buffed — MAX_QI is 60 and the state schema clamps it — so winFloor
// fights the honest way: technique while charged, basic strike when low,
// defend to bank the +5 qi that drips back every 3rd enemy turn. The engine
// is deterministic, so overkill here just guarantees the win lands without
// depending on the seed.
function atSect(seed: string): GameState {
  const arrived = navTo(newGame(seed), 'sect')
  return {
    ...arrived,
    player: {
      ...arrived.player,
      hp: 400,
      stage: 5,
      attrs: { ...arrived.player.attrs, body: 40 },
    },
  }
}

function winFloor(state: GameState, maxTurns = 60): { state: GameState; events: ReturnType<typeof applyAction>['events'] } {
  let s = state
  let events: ReturnType<typeof applyAction>['events'] = []
  let guard = 0
  while (s.encounter !== null && guard < maxTurns) {
    // Spend the qi budget top-down: technique (6) → basic strike (4) → defend
    // to bank regen. A dry fighter that refuses to defend would stall forever.
    const strike = s.player.qi >= 6
      ? ({ kind: 'combat_attack', techniqueId: 'basic_staff_form' } as const)
      : s.player.qi >= 4
        ? ({ kind: 'combat_attack' } as const)
        : ({ kind: 'combat_defend' } as const)
    const result = applyAction(s, strike)
    s = result.state
    events = result.events
    guard += 1
  }
  return { state: s, events }
}

describe('Lôi Đài — sect arena tower climb (Issue #19)', () => {
  it('starts floor 1 from the sect and follows the floor ladder in order', () => {
    const state = atSect('arena-ladder')
    const challenge = applyAction(state, { kind: 'arena_challenge' })
    expect(challenge.events.some((e) => e.type === 'ARENA_CHALLENGED' && e.floor === 1)).toBe(true)
    expect(challenge.state.encounter?.enemyId).toBe('arena_f1_neophyte')
    const { state: afterWin, events } = winFloor(challenge.state)
    expect(afterWin.encounter).toBeNull()
    expect(events.some((e) => e.type === 'ARENA_FLOOR_CLEARED' && e.floor === 1)).toBe(true)
    expect(afterWin.flags['arena_floor']).toBe(1)
    // Next challenge is floor 2's warden, not a rematch.
    const second = applyAction(afterWin, { kind: 'arena_challenge' })
    expect(second.events.some((e) => e.type === 'ARENA_CHALLENGED' && e.floor === 2)).toBe(true)
    expect(second.state.encounter?.enemyId).toBe('arena_f2_bristle')
  })

  it('refuses to open a fight away from the sect or mid-encounter', () => {
    const village = applyAction(newGame('arena-away'), { kind: 'arena_challenge' })
    expect(village.events).toEqual([{ type: 'ERROR', code: 'NOT_AT_LOCATION' }])
    const sect = atSect('arena-infight')
    const inFight = applyAction(applyAction(sect, { kind: 'arena_challenge' }).state, { kind: 'arena_challenge' })
    expect(inFight.events).toEqual([{ type: 'ERROR', code: 'ITEM_UNAVAILABLE' }])
  })

  it('arena floors never surface as wild sect encounters', () => {
    const sect = atSect('arena-wild')
    const wild = applyAction(sect, { kind: 'start_encounter' })
    // The sect has no wild enemies: only the tower ladder opens fights there.
    expect(wild.events).toEqual([{ type: 'ERROR', code: 'NOT_AT_LOCATION' }])
    expect(arenaFloors().every((floor) => floor.arena !== undefined)).toBe(true)
    expect(ARENA_FLOOR_COUNT).toBe(5)
  })

  it('retreat leaves the floor pointer untouched — no softlock, floor retryable', () => {
    const sect = atSect('arena-retreat')
    const challenge = applyAction(sect, { kind: 'arena_challenge' })
    const fled = applyAction(challenge.state, { kind: 'combat_retreat' }).state
    expect(fled.encounter).toBeNull()
    expect(fled.flags['arena_floor']).toBeUndefined()
    // The same floor 1 opponent is offered again after retreating.
    const retry = applyAction(fled, { kind: 'arena_challenge' })
    expect(retry.state.encounter?.enemyId).toBe('arena_f1_neophyte')
    expect(retry.events.some((e) => e.type === 'ARENA_CHALLENGED' && e.floor === 1)).toBe(true)
  })

  it('tops the tower once and announces it, then closes the ladder', () => {
    let state = atSect('arena-tower')
    let topped = 0
    for (let floor = 1; floor <= ARENA_FLOOR_COUNT; floor += 1) {
      const challenge = applyAction(state, { kind: 'arena_challenge' })
      const { state: after, events } = winFloor(challenge.state)
      expect(after.flags['arena_floor']).toBe(floor)
      if (events.some((e) => e.type === 'ARENA_TOWER_TOPPED')) topped += 1
      state = after
    }
    expect(state.flags['arena_floor']).toBe(ARENA_FLOOR_COUNT)
    expect(state.flags['arena_cleared']).toBe(true)
    expect(topped).toBe(1)
    const closed = applyAction(state, { kind: 'arena_challenge' })
    expect(closed.events).toEqual([{ type: 'ERROR', code: 'ARENA_CLOSED' }])
  })

  // HIGH-1: arena floors must not leak into the wild-spawn pool.
  it('eligibleEnemiesAt("sect", 5) never returns an arena enemy', () => {
    // Even at stage 5 (above all arena requiredStage caps), no arena floor
    // appears in the pool the reducer would pick a wild encounter from.
    const pool = eligibleEnemiesAt('sect', 5)
    for (const enemy of pool) expect(enemy.arena, `arena leak: ${enemy.id}`).toBeUndefined()
    // Sanity: the arena table is non-empty and all its entries carry a floor number.
    expect(arenaFloors().length).toBeGreaterThan(0)
  })

  it('understands the arena in free text, both languages', () => {
    expect(parseFreeText('len loi dai thach dau')).toEqual({ ok: true, action: { kind: 'arena_challenge' } })
    expect(parseFreeText('climb the tower')).toEqual({ ok: true, action: { kind: 'arena_challenge' } })
  })

  // MEDIUM-H: retreat verb wins over the bare "tower" keyword.
  it('retreat from the tower mid-fight stays a combat_retreat', () => {
    expect(parseFreeText('retreat from the tower')).toEqual({ ok: true, action: { kind: 'combat_retreat' } })
  })
})

describe('Cưỡng đoạt — resource coercion (Issue #19)', () => {
  it('plunder seizes fixed gold + items once, raising infamy and emptying goodwill', () => {
    const market = navTo(newGame('coerce-market'), 'market')
    const goldBefore = market.player.gold
    const herbsBefore = market.inventory['spirit_herb'] ?? 0
    const result = applyAction(market, { kind: 'coerce_npc', npcId: 'n_merchant_bao', approach: 'plunder' })
    const ev = result.events.find((e) => e.type === 'NPC_COERCED')
    expect(ev).toMatchObject({ npcId: 'n_merchant_bao', approach: 'plunder', gold: 90, itemIds: ['spirit_herb', 'plum_qi_wine'] })
    expect(result.state.player.gold).toBe(goldBefore + 90)
    expect(result.state.inventory['spirit_herb'] ?? 0).toBe(herbsBefore + 2)
    expect(result.state.flags['coerced_n_merchant_bao']).toBe(true)
    expect(result.state.flags['infamy']).toBe(1)
    // Affection is emptied: the frightened trader no longer owes goodwill.
    expect(result.state.affection?.['n_merchant_bao']).toBe(0)
    expect(result.state.flags['aff_n_merchant_bao']).toBe(0)
  })

  it('a second plunder of the same NPC yields nothing — no farming', () => {
    let state = navTo(newGame('coerce-twice'), 'market')
    state = applyAction(state, { kind: 'coerce_npc', npcId: 'n_merchant_bao', approach: 'plunder' }).state
    const gold = state.player.gold
    const herbs = state.inventory['spirit_herb'] ?? 0
    const again = applyAction(state, { kind: 'coerce_npc', npcId: 'n_merchant_bao', approach: 'plunder' })
    expect(again.events.some((e) => e.type === 'NPC_COERCED' && e.gold === 0 && e.itemIds.length === 0)).toBe(true)
    expect(again.state.player.gold).toBe(gold)
    expect(again.state.inventory['spirit_herb'] ?? 0).toBe(herbs)
    expect(again.state.flags['infamy']).toBe(1)
  })

  it('backing off costs a day and repairs the relationship instead', () => {
    const market = navTo(newGame('coerce-backoff'), 'market')
    const dayBefore = market.day
    const result = applyAction(market, { kind: 'coerce_npc', npcId: 'n_merchant_bao', approach: 'back_off' })
    expect(result.events.some((e) => e.type === 'NPC_COERCED' && e.approach === 'back_off' && e.aff === 2)).toBe(true)
    expect(result.state.day).toBe(dayBefore + 1)
    expect(result.state.player.gold).toBe(market.player.gold)
    expect(result.state.affection?.['n_merchant_bao']).toBe(2)
    // Restraint leaves no plunder mark, so the choice stays open.
    expect(result.state.flags['coerced_n_merchant_bao']).toBeUndefined()
    expect(result.state.flags['infamy']).toBeUndefined()
  })

  // HIGH-2: the mercy is one-shot — repeating back_off cannot farm affection.
  it('a second back-off buys nothing — the grace was already spent', () => {
    let state = navTo(newGame('coerce-backoff-twice'), 'market')
    state = applyAction(state, { kind: 'coerce_npc', npcId: 'n_merchant_bao', approach: 'back_off' }).state
    const dayBefore = state.day
    const again = applyAction(state, { kind: 'coerce_npc', npcId: 'n_merchant_bao', approach: 'back_off' })
    expect(again.events.some((e) => e.type === 'NPC_COERCED' && e.approach === 'back_off' && e.aff === 0)).toBe(true)
    expect(again.state.affection?.['n_merchant_bao']).toBe(2)
    expect(again.state.flags['aff_n_merchant_bao']).toBe(2)
    // The day is still spent — hesitation has a cost even when it earns nothing.
    expect(again.state.day).toBe(dayBefore + 1)
  })

  it('plunder after a back-off still works — the two one-shots are independent', () => {
    let state = navTo(newGame('coerce-then-plunder'), 'market')
    state = applyAction(state, { kind: 'coerce_npc', npcId: 'n_merchant_bao', approach: 'back_off' }).state
    const plundered = applyAction(state, { kind: 'coerce_npc', npcId: 'n_merchant_bao', approach: 'plunder' })
    expect(plundered.events.some((e) => e.type === 'NPC_COERCED' && e.approach === 'plunder' && e.gold === 90)).toBe(true)
    // The mercy is wiped out by the theft.
    expect(plundered.state.affection?.['n_merchant_bao']).toBe(0)
    expect(plundered.state.flags['backoff_n_merchant_bao']).toBe(true)
  })

  it('rejects coercion of the wrong NPC, at the wrong place, or mid-encounter', () => {
    const village = newGame('coerce-guards')
    // Unknown NPC id.
    expect(applyAction(village, { kind: 'coerce_npc', npcId: 'n_nobody', approach: 'plunder' }).events)
      .toEqual([{ type: 'ERROR', code: 'NPC_UNKNOWN' }])
    // Known NPC, but not a defined coercion target — its own error code, not
    // a misleading "wrong location".
    expect(applyAction(village, { kind: 'coerce_npc', npcId: 'n_tea_ma', approach: 'plunder' }).events)
      .toEqual([{ type: 'ERROR', code: 'COERCION_UNAVAILABLE' }])
    // Right NPC, wrong location.
    expect(applyAction(newGame('coerce-away'), { kind: 'coerce_npc', npcId: 'n_merchant_bao', approach: 'plunder' }).events)
      .toEqual([{ type: 'ERROR', code: 'NPC_NOT_HERE' }])
    // Mid-encounter the pressure valve is combat, not threats.
    const sect = atSect('coerce-infight')
    const inFight = applyAction(applyAction(sect, { kind: 'arena_challenge' }).state, { kind: 'coerce_npc', npcId: 'n_keeper_anh', approach: 'plunder' })
    expect(inFight.events).toEqual([{ type: 'ERROR', code: 'ITEM_UNAVAILABLE' }])
  })

  it('understands coercion in free text, both languages, with both approaches', () => {
    expect(parseFreeText('uy hiep thuong nhan Bao lay hang')).toEqual({ ok: true, action: { kind: 'coerce_npc', npcId: 'n_merchant_bao', approach: 'plunder' } })
    expect(parseFreeText('intimidate merchant bao')).toEqual({ ok: true, action: { kind: 'coerce_npc', npcId: 'n_merchant_bao', approach: 'plunder' } })
    expect(parseFreeText('uy hiep Bao nhung rut lui khong lay gi')).toEqual({ ok: true, action: { kind: 'coerce_npc', npcId: 'n_merchant_bao', approach: 'back_off' } })
    // A pressure verb with no recognizable victim fails the parse. Tokens
    // here are chosen to collide with no NPC name or alias in the content.
    expect(parseFreeText('cuong doat ke an danh').ok).toBe(false)
  })

  // MEDIUM-A: the previously write-only arena_cleared / infamy flags must
  // actually unlock achievements — a Killer who tops the tower and plunders
  // both victims should earn both new medals.
  it('unlocks arena_champion and notorious as the flags are set', () => {
    let state = atSect('killer-achieve')
    for (let floor = 1; floor <= ARENA_FLOOR_COUNT; floor += 1) {
      const challenge = applyAction(state, { kind: 'arena_challenge' })
      state = winFloor(challenge.state).state
    }
    expect(state.flags['arena_cleared']).toBe(true)
    expect(state.achievements).toContain('arena_champion')
    // Now plunder both coercion targets — infamy reaches 2, the notorious mark.
    state = navTo(state, 'market')
    state = applyAction(state, { kind: 'coerce_npc', npcId: 'n_merchant_bao', approach: 'plunder' }).state
    state = navTo(state, 'sect')
    state = applyAction(state, { kind: 'coerce_npc', npcId: 'n_keeper_anh', approach: 'plunder' }).state
    expect(state.flags['infamy']).toBe(2)
    expect(state.achievements).toContain('notorious')
  })

  // MEDIUM-I + MEDIUM-B: the new dup-floor and CoercionDefSchema checks run
  // inside validateAllContent(). content.test.ts already asserts it is clean;
  // re-asserting here keeps the Issue #19 validators wired to a live green run.
  it('shipped content passes the new arena/coercion validators', () => {
    const report = validateAllContent()
    expect(report.errors).toEqual([])
    expect(report.ok).toBe(true)
  })
})
