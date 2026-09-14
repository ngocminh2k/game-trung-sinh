// Issue #37 — "chết vì sát thương step vô hình" (p03 died in hang Phong Ấn to
// invisible step damage). Two halves are pinned here:
//   1. THE TAX IS REAL — doMove now applies WEATHER_EFFECTS.travelCostMod
//      (mist 1.2x / storm 1.5x). It was a dead data field before; the
//      prediction below must bracket every actual roll, both directions of
//      drift fail the test.
//   2. THE PREDICTION IS HONEST — travelRisk models the once/day/zone entry
//      throttle (a same-day return trip costs nothing) and says so.
import { describe, expect, it } from 'vitest'
import { ENEMIES } from '../src/content'
import {
  applyAction,
  damageRoll,
  damageMultiplier,
  findPath,
  newGame,
  travelRisk,
  travelRiskLabel,
  type Direction,
  type GameEvent,
  type GameState,
} from '../src/engine'
import { TIME_MODS, currentTimeOfDay } from '../src/engine/time'
import { WEATHER_EFFECTS, weatherFor } from '../src/engine/weather'

function walkTo(state: GameState, locationId: string): { state: GameState; events: GameEvent[] } {
  // Follow the authored local route one step at a time until the region line
  // is crossed (same helper shape as test/danger.test.ts). ACCUMULATE events
  // across steps (round-5 review): the entry hit can land on a mid-path step,
  // and last-step-only events let the bracket assertions below pass vacuously.
  const path = findPath(state.player.posX, state.player.posY, locationId, state.player.locationId)
  if (path === null) throw new Error(`no path to ${locationId}`)
  let s = state
  const events: GameEvent[] = []
  for (const dir of path as Direction[]) {
    const result = applyAction(s, { kind: 'move', direction: dir })
    s = result.state
    events.push(...result.events)
    if (s.player.locationId === locationId || s.terminal) break
  }
  return { state: s, events }
}

/** Independent re-derivation of doMove's entry-damage bounds. Same LEFT-TO-
 *  RIGHT chain as reducer.ts (rolled * diff) * time) * weather — pre-factoring
 *  the mods into one scale is float-associative and drifts ±1 at .5 boundaries
 *  (the exact CRITICAL a round-5 review caught: promise 13, cheapest hit 14). */
function expectedBounds(pre: GameState, danger: number): { min: number; max: number } {
  const diffMod = damageMultiplier(pre.difficulty ?? 'balanced')
  const timeMod = TIME_MODS[currentTimeOfDay(pre)].dangerDamage
  const weatherMod = WEATHER_EFFECTS[weatherFor(pre.seed, pre.day).id]?.travelCostMod ?? 1
  const chain = (rolled: number): number => Math.max(1, Math.round(((rolled * diffMod) * timeMod) * weatherMod))
  return {
    min: chain(danger * 10),
    max: Math.max(chain(danger * 10), chain(danger * 10 + 6)),
  }
}

describe('travelRisk brackets the damage doMove actually rolls', () => {
  const seeds = ['telegraph-a', 'telegraph-b', 'telegraph-c', 'danger-forest']

  for (const seed of seeds) {
    for (const day of [1, 9, 17, 25]) {
      it(`${seed} day ${String(day)}: every forest-entry hit lands inside the prediction`, () => {
        const base = { ...newGame(seed), day }
        const preRisk = travelRisk(base, 'misty_forest')
        if (preRisk.danger === 0) return
        const { state, events } = walkTo(base, 'misty_forest')
        const hits = events.filter((e) => e.type === 'DAMAGED' && (e as { source?: string }).source === 'misty_forest')
        // Fail-loud, not vacuous (round-5 review, finding 2): these walks must
        // produce an entry hit — zero hits means the mirror went untested.
        expect(hits.length, `${seed} day ${String(day)}: no forest-entry DAMAGED event`).toBeGreaterThan(0)
        for (const hit of hits) {
          const amount = (hit as { amount: number }).amount
          expect(amount).toBeGreaterThanOrEqual(preRisk.min)
          expect(amount).toBeLessThanOrEqual(preRisk.max)
        }
        // Cross-check against an independent re-derivation of the same math.
        const bounds = expectedBounds(base, preRisk.danger)
        expect(preRisk.min).toBe(bounds.min)
        expect(preRisk.max).toBe(bounds.max)
        if (!state.terminal) expect(state.player.locationId).toBe('misty_forest')
      })
    }
  }

  it('hard + Sáng + an amplifying weather promise an EXACT min, never a low promise', () => {
    // .5-boundary anchor for the float-associativity CRITICAL:
    // ((danger*10 * 1.5) * 0.75) * 1.2 rounds one way, (1.5*0.75*1.2) first
    // rounds the other. The old factored telegraph promised 13 where the
    // reducer's cheapest roll was 14.
    const findSuongDay = (seed: string): number => {
      for (let day = 1; day <= 60; day += 1) {
        if (WEATHER_EFFECTS[weatherFor(seed, day).id]?.travelCostMod === 1.2) return day
      }
      throw new Error(`no suong day within 60 for ${seed}`)
    }
    const day = findSuongDay('telegraph-assoc')
    const state: GameState = { ...newGame('telegraph-assoc', { difficulty: 'hard' }), day, timeOfDay: 'sang' }
    const risk = travelRisk(state, 'misty_forest')
    const diffMod = damageMultiplier('hard')
    const timeMod = TIME_MODS.sang.dangerDamage
    // The reducer's exact left-to-right chain at the minimum roll (+0):
    const reducerMin = Math.max(1, Math.round(((risk.danger * 10 * diffMod) * timeMod) * 1.2))
    // The factored form (pre-factoring mods into `scale`) — if floating math
    // ever stops disagreeing here, this guard stops testing anything, so pin
    // the divergence too rather than let it rot into a tautology.
    const factoredMin = Math.max(1, Math.round(risk.danger * 10 * (diffMod * timeMod * 1.2)))
    expect(risk.min).toBe(reducerMin)
    if (factoredMin !== reducerMin) {
      expect(risk.min, 'the factored form must NOT be what travelRisk returns').not.toBe(factoredMin)
    }
    // A promise must bracket EVERY possible roll, cheapest included.
    for (let roll = 0; roll <= 6; roll += 1) {
      const damage = Math.max(1, Math.round((((risk.danger * 10 + roll) * diffMod) * timeMod) * 1.2))
      expect(damage).toBeGreaterThanOrEqual(risk.min)
      expect(damage).toBeLessThanOrEqual(risk.max)
    }
  })

  it('the weather multiplier actually bites: amplified entry ≥ clear-weather entry', () => {
    // Find any (seed, day) where the cave weather amplifies, and compare the
    // predicted min against the same roll without weather — proves
    // travelCostMod is wired into doMove's scale chain, not just the telegraph.
    let amplifiedMin = 0
    let plainMin = 0
    for (let day = 1; day <= 60 && amplifiedMin === 0; day++) {
      const probe = { ...newGame('telegraph-weather'), day }
      const effects = WEATHER_EFFECTS[weatherFor(probe.seed, probe.day).id]
      if (effects !== undefined && effects.travelCostMod > 1) {
        amplifiedMin = travelRisk(probe, 'sealed_cave').min
        plainMin = Math.max(1, Math.round(2 * 10 * damageMultiplier('balanced') * TIME_MODS[currentTimeOfDay(probe)].dangerDamage))
      }
    }
    expect(amplifiedMin).toBeGreaterThan(0)
    expect(amplifiedMin).toBeGreaterThan(plainMin)
  })

  it('a same-day return trip is free and the label says so', () => {
    const base = newGame('telegraph-throttle')
    const there = walkTo(base, 'misty_forest')
    const back = walkTo(there.state, base.player.locationId)
    expect(back.events.filter((e) => e.type === 'DAMAGED')).toHaveLength(0)
    const risk = travelRisk(back.state, 'misty_forest')
    expect(risk.freeToday).toBe(true)
    expect(risk.min).toBe(0)
    expect(travelRiskLabel(risk, 'vi')).toMatch(/miễn sát thương/)
    expect(travelRiskLabel(risk, 'en')).toMatch(/no damage/)
  })

  it('danger nodes inside the current region always roll — no free pass', () => {
    const base = newGame('telegraph-node')
    // Standing INSIDE the danger region: the authored-node branch ignores the
    // day throttle, so travelRisk must still price the cell.
    const inForest = walkTo(base, 'misty_forest').state
    const risk = travelRisk(inForest, 'misty_forest')
    expect(risk.danger).toBeGreaterThan(0)
    expect(risk.freeToday).toBe(false)
    expect(risk.min).toBeGreaterThan(0)
  })

  it('a safe location produces no risk line at all', () => {
    const base = newGame('telegraph-safe')
    const safe = travelRisk(base, 'village')
    if (safe.danger > 0) return // authored data changed; the assertion below is a tripwire
    expect(travelRiskLabel(safe, 'vi')).toBe('')
    expect(travelRiskLabel(safe, 'en')).toBe('')
  })

  it('a talisman on high danger reads as warded', () => {
    const base = { ...newGame('telegraph-ward'), inventory: { warding_talisman: 1 } }
    const risk = travelRisk(base, 'sealed_cave')
    expect(risk.warded).toBe(true)
    expect(travelRiskLabel(risk, 'vi')).toMatch(/bùa hộ thân/)
    expect(travelRiskLabel(risk, 'en')).toMatch(/talisman/)
  })

  it('damageRoll upper edge equals the bracket max (formula anchor)', () => {
    // Pinning the raw roll keeps both doMove and travelRisk honest if either
    // stops using danger*10 + 0..6.
    const [rolled] = damageRoll(12345, 2)
    expect(rolled).toBeGreaterThanOrEqual(20)
    expect(rolled).toBeLessThanOrEqual(26)
  })
})

describe('out-of-tier encounters announce themselves before the first blow', () => {
  // Stage 0 inside sealed_cave: nothing there is eligible (seal_wraith and
  // cave_bear both require stage 2), so doStartEncounter takes its ponytail
  // fallback branch — the exact case that used to read as an unfair death.
  const atCave = (stage: number): GameState => {
    const base = newGame('telegraph-encounter')
    return { ...base, player: { ...base.player, stage, realmLevel: stage, locationId: 'sealed_cave' } }
  }

  it('the stage-0 cave fallback foe carries a WARNING naming the gap', () => {
    const result = applyAction(atCave(0), { kind: 'start_encounter' })
    const enemy = ENEMIES.find((e) => e.id === result.state.encounter?.enemyId)
    expect(result.state.encounter).not.toBeNull() // the fallback pool must fight
    expect(enemy).toBeDefined()
    expect((enemy?.requiredStage ?? 0)).toBeGreaterThan(0)
    const warning = result.events.find(
      (e) => e.type === 'WARNING' && /vượt xa cảnh giới|outclasses/.test(e.messageVi + e.messageEn),
    )
    expect(warning, `stage-0 fight vs ${enemy?.nameVi} must warn`).toBeDefined()
    expect((warning as { messageVi: string }).messageVi).toContain(enemy?.nameVi)
    expect((warning as { messageEn: string }).messageEn).toMatch(/retreat/i)
  })

  it('a fair-tier fight adds no tier warning', () => {
    const result = applyAction(atCave(9), { kind: 'start_encounter' })
    expect(result.state.encounter).not.toBeNull() // the fixture must actually fight
    const tierWarnings = result.events.filter((e) =>
      e.type === 'WARNING' && /vượt xa cảnh giới|outclasses/.test(e.messageVi + e.messageEn),
    )
    expect(tierWarnings).toHaveLength(0)
  })
})
