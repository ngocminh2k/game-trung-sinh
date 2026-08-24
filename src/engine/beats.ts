import { BEATS } from '../content'
import type { BeatDef } from './content-types'
import { questStatus } from './quests'
import { flagNum } from './utils'
import type { GameState } from './types'

export type BeatPredicate = (state: GameState) => boolean

const PREDICATES: Record<string, BeatPredicate> = {
  freshArrival: (s) => s.flags['movedOnce'] !== true,
  movedOnce: (s) => s.flags['movedOnce'] === true,
  gatheredSome: (s) => flagNum(s.flags, 'gatherCount') >= 2,
  marketSeenOrSold: (s) =>
    flagNum(s.flags, 'sellCount') >= 1 || questStatus(s, 'q_herb_delivery') !== 'available',
  herbQuestDone: (s) => questStatus(s, 'q_herb_delivery') === 'completed',
  caveSeen: (s) => s.flags['seenCave'] === true || s.flags['visitedCaveWarded'] === true,
  stageTwoPlus: (s) => s.player.stage >= 2,
  tradeWinds: (s) => s.player.gold >= 250 || flagNum(s.flags, 'sellCount') >= 4,
  stageFourPlus: (s) => s.player.stage >= 4,
  always: () => true,
}

const FALLBACK_BEAT: BeatDef = {
  id: 'b_fallback',
  chapter: 5,
  predicate: 'always',
  titleVi: 'Khoảnh khắc lặng',
  titleEn: 'A Quiet Moment',
  textVi: 'Gió thổi qua giấy cửa sổ.',
  textEn: 'Wind breathes through paper windows.',
  suggested: [
    { kind: 'train' },
    { kind: 'rest' },
    { kind: 'draw_lottery' },
  ],
}

export function currentBeat(state: GameState): BeatDef {
  for (const beat of BEATS) {
    const predicate = PREDICATES[beat.predicate]
    if (predicate !== undefined && predicate(state)) return beat
  }
  return FALLBACK_BEAT
}

// No-softlock guarantee: `rest` has no precondition (it heals, refills qi,
// and advances the day), so every non-terminal state has at least one legal
// action and forced convergence can never fail to act.

