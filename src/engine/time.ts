import type { GameEvent, GameState, TimeOfDay } from './types'

// Four-slot day clock (design-review addendum 2026-09): a day has four beats —
// Sáng / Trưa / Chiều / Tối. A deliberate outing spends 1 slot (a quarter of
// a day) instead of a whole day, so gathering, training and shopping no longer
// each consume a full calendar day. The clock is a pure deterministic function
// of state: only reducer actions may advance it (engine lint bans
// Date.now/Math.random), and in-game time stays `state.day` + `state.timeOfDay`.

export const TIME_SLOTS: readonly TimeOfDay[] = ['sang', 'trua', 'chieu', 'toi']

export const TIME_OF_DAY_VI: Record<TimeOfDay, string> = {
  sang: 'Sáng',
  trua: 'Trưa',
  chieu: 'Chiều',
  toi: 'Tối',
}

export const TIME_OF_DAY_EN: Record<TimeOfDay, string> = {
  sang: 'Dawn',
  trua: 'Noon',
  chieu: 'Dusk',
  toi: 'Night',
}

export interface TimeMods {
  /** Tu luyện progress multiplier. */
  trainProgress: number
  /** Tu luyện HP cost multiplier. */
  trainHpCost: number
  /** Tu luyện oscillation variance multiplier (base range 0..2). */
  trainRisk: number
  /** Há i linh thảo yield multiplier. */
  gatherYield: number
  /** Damage when entering a danger zone (rừng/núi). */
  dangerDamage: number
  /** Buy price multiplier at the market. */
  shopPrice: number
}

const NEUTRAL: TimeMods = {
  trainProgress: 1,
  trainHpCost: 1,
  trainRisk: 1,
  gatherYield: 1,
  dangerDamage: 1,
  shopPrice: 1,
}

/**
 * Per-slot buff/debuff table, keyed by `TimeOfDay` slug. The same activity has
 * a different face in each beat: the morning is calm and safe for gathering,
 * noon is the neutral reference, the afternoon (chiều) stirs the chợ into a
 * bargain, and the night (tối) surges cultivation at a real cost.
 */
export const TIME_MODS: Record<TimeOfDay, TimeMods> = {
  sang: { trainProgress: 0.9, trainHpCost: 0.75, trainRisk: 0.5, gatherYield: 1.25, dangerDamage: 0.75, shopPrice: 1 },
  trua: NEUTRAL,
  chieu: { trainProgress: 1.1, trainHpCost: 1, trainRisk: 1, gatherYield: 1, dangerDamage: 1.1, shopPrice: 0.9 },
  toi: { trainProgress: 1.25, trainHpCost: 1.5, trainRisk: 2, gatherYield: 1.3, dangerDamage: 1.25, shopPrice: 1 },
}

/** Old saves predate the clock; they safely read as the start of a day. */
export function currentTimeOfDay(state: GameState): TimeOfDay {
  return state.timeOfDay ?? 'sang'
}

/**
 * Advance the clock by whole slots, rolling `DAY_PASSED` when a beat wraps
 * past Tối into the next dawn. Pushes `TIME_ADVANCED` whenever the beat
 * changes. Pure: consumes nothing but the passed event array, so the rng
 * stream is never disturbed (determinism contract).
 */
export function advanceTime(state: GameState, slots: number, events: GameEvent[]): GameState {
  const from = currentTimeOfDay(state)
  let index = TIME_SLOTS.indexOf(from)
  let day = state.day
  for (let i = 0; i < slots; i += 1) {
    index += 1
    if (index >= TIME_SLOTS.length) {
      index = 0
      day += 1
    }
  }
  const timeOfDay = TIME_SLOTS[index] ?? 'sang'
  if (day !== state.day) events.push({ type: 'DAY_PASSED', day })
  if (timeOfDay !== from) events.push({ type: 'TIME_ADVANCED', timeOfDay, day })
  return { ...state, day, timeOfDay }
}

/** Sleeping through the night: dawn of the next day (HP/qi refill stays in the reducer). */
export function restToDawn(state: GameState, events: GameEvent[]): GameState {
  const day = state.day + 1
  events.push({ type: 'DAY_PASSED', day })
  return { ...state, day, timeOfDay: 'sang' }
}