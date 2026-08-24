import { LOTTERY_COST, LOTTERY_GRAND_GOLD, LOTTERY_MAJOR_GOLD, LOTTERY_MINOR_GOLD, LOTTERY_ROLL_MAX } from './constants'
import { nextInt } from './rng'
import type { GameEvent } from './types'

export type LotteryTier = 'grand' | 'major' | 'minor' | 'herb' | 'none'

export interface LotteryOutcome {
  tier: LotteryTier
  goldDelta: number
  itemId?: string
  rng: number
}

export function rollLottery(rng: number): LotteryOutcome {
  const [roll, next] = nextInt(rng, 0, LOTTERY_ROLL_MAX - 1)
  if (roll === 0) {
    return { tier: 'grand', goldDelta: LOTTERY_GRAND_GOLD, rng: next }
  }
  if (roll <= 2) {
    return { tier: 'major', goldDelta: LOTTERY_MAJOR_GOLD, rng: next }
  }
  if (roll <= 5) {
    return { tier: 'minor', goldDelta: LOTTERY_MINOR_GOLD, rng: next }
  }
  if (roll <= 9) {
    return { tier: 'herb', goldDelta: 0, itemId: 'spirit_herb', rng: next }
  }
  return { tier: 'none', goldDelta: 0, rng: next }
}

export interface LotteryCheckOk {
  ok: true
}
export interface LotteryCheckErr {
  ok: false
  code: 'LOTTERY_ALREADY_DRAWN' | 'LOTTERY_NEED_GOLD' | 'NOT_AT_LOCATION'
}

export function checkLottery(state: {
  day: number
  lastLotteryDay: number | null
  player: { gold: number; locationId: string }
}, atLocationId: string): LotteryCheckOk | LotteryCheckErr {
  if (state.player.locationId !== atLocationId) return { ok: false, code: 'NOT_AT_LOCATION' }
  if (state.lastLotteryDay === state.day) return { ok: false, code: 'LOTTERY_ALREADY_DRAWN' }
  if (state.player.gold < LOTTERY_COST) return { ok: false, code: 'LOTTERY_NEED_GOLD' }
  return { ok: true }
}

export function drawEventFor(outcome: LotteryOutcome): GameEvent {
  const itemId = outcome.itemId
  if (itemId !== undefined) {
    return { type: 'DRAW_RESULT', tier: outcome.tier, goldDelta: 0, itemId }
  }
  return { type: 'DRAW_RESULT', tier: outcome.tier, goldDelta: outcome.goldDelta }
}
