import { BEATS, BEAT_PREDICATE_IDS, type BeatPredicateId } from '../content'
import { MAX_STAGE } from './constants'
import type { BeatDef } from './content-types'
import { questStatus } from './quests'
import { flagNum } from './utils'
import type { GameState } from './types'

export type BeatPredicate = (state: GameState) => boolean

// Enemy ids live in content; keep this list in sync with ENEMIES. It is only
// used to detect "any defeated flag", so a stale id is harmless.
const ENEMY_IDS = ['mist_boar', 'seal_wraith', 'rift_hound'] as const

const PREDICATES: Record<BeatPredicateId, BeatPredicate> = {
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
  encounterVictory: (s) =>
    ENEMY_IDS.some((id) => s.flags[`defeated_${id}`] === true),
  lotteryPlayed: (s) => s.lastLotteryDay !== null,
  storageUsed: (s) => Object.values(s.storage).some((qty) => qty > 0),
  equippedAdvanced: (s) =>
    s.equipment.weapon !== null && s.equipment.weapon !== 'wooden_staff',
  talismanQuestActive: (s) => questStatus(s, 'q_talisman_order') === 'active',
  stageThreePlus: (s) => s.player.stage >= 3,
  stageFive: (s) => s.player.stage >= MAX_STAGE,
}

/** A content validator and future scenario packs can use this without
 * reaching into the reducer's private predicate table. */
export function isKnownBeatPredicate(predicate: string): predicate is BeatPredicateId {
  return BEAT_PREDICATE_IDS.includes(predicate as BeatPredicateId)
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
  // Deepest-milestone semantics: BEATS is ordered by story progression, and
  // predicates are cumulative milestones (movedOnce stays true forever). The
  // LAST matching beat is therefore the furthest chapter the player has
  // reached; first-match would pin the story to the earliest true milestone.
  let matched: BeatDef | undefined
  for (const beat of BEATS) {
    if (PREDICATES[beat.predicate](state)) matched = beat
  }
  return matched ?? FALLBACK_BEAT
}

// No-softlock guarantee: `rest` has no precondition (it heals, refills qi,
// and advances the day), so every non-terminal state has at least one legal
// action and forced convergence can never fail to act.
