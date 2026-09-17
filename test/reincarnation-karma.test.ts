import { describe, expect, it } from 'vitest'
import { newGame } from '../src/engine/constants'
import { countCompletedQuests } from '../src/engine/quests'
import { evaluateReincarnationKarma } from '../src/engine/endings'
import {
  DEFAULT_GLOBAL_PROFILE,
  parseGlobalProfile,
  recordTerminal,
} from '../src/engine/globalProfile'
import { FLAG_ARENA_CLEARED } from '../src/content/flag-keys'

describe('C3-02 / C2-02: Reincarnation Karma Milestones (Anti-Exploit)', () => {
  it('seals the day 5 exploit: resting to day 5 (or day 50) with 0 milestones awards 0 points', () => {
    let state = newGame('exploit-test')
    state = { ...state, day: 5 } // Simulated day 5
    expect(state.day).toBe(5)

    const karma = evaluateReincarnationKarma(state)
    expect(karma.total).toBe(0)
    expect(karma.quests).toBe(0)
    expect(karma.realm).toBe(0)
    expect(karma.majorEvents).toBe(0)

    // Even surviving to day 50 with no progress still yields 0 points
    state = { ...state, day: 50 }
    expect(evaluateReincarnationKarma(state).total).toBe(0)
  })

  it('awards 30 points only when completing at least 3 quests (0 points for <3)', () => {
    let state = newGame('quest-milestone')

    // 0 quests
    expect(countCompletedQuests(state)).toBe(0)
    expect(evaluateReincarnationKarma(state).quests).toBe(0)

    // 1 quest completed
    state = {
      ...state,
      quests: { q_herb_delivery: { status: 'completed' } },
      flags: { quest_q_herb_delivery_done: true },
    }
    expect(countCompletedQuests(state)).toBe(1)
    expect(evaluateReincarnationKarma(state).quests).toBe(0)

    // 2 quests completed
    state = {
      ...state,
      quests: {
        ...state.quests,
        q_herb_intro: { status: 'completed' },
      },
      flags: {
        ...state.flags,
        quest_q_herb_intro_done: true,
      },
    }
    expect(countCompletedQuests(state)).toBe(2)
    expect(evaluateReincarnationKarma(state).quests).toBe(0)

    // 3 quests completed -> Milestones achieved: 30 points
    state = {
      ...state,
      quests: {
        ...state.quests,
        q_bounty_boar: { status: 'completed' },
      },
      flags: {
        ...state.flags,
        quest_q_bounty_boar_done: true,
      },
    }
    expect(countCompletedQuests(state)).toBe(3)
    const karma = evaluateReincarnationKarma(state)
    expect(karma.quests).toBe(30)
    expect(karma.total).toBe(30)
  })

  it('awards 30 points for reaching Luyện Khí tầng 3+ (0 points for stage 0 or stage 1 level 1-2)', () => {
    let state = newGame('realm-milestone')

    // Phàm nhân (stage 0)
    expect(state.player.stage).toBe(0)
    expect(evaluateReincarnationKarma(state).realm).toBe(0)

    // Luyện Khí tầng 1 (stage 1, realmLevel 1)
    state = {
      ...state,
      player: { ...state.player, stage: 1, realmLevel: 1 },
    }
    expect(evaluateReincarnationKarma(state).realm).toBe(0)

    // Luyện Khí tầng 2 (stage 1, realmLevel 2)
    state = {
      ...state,
      player: { ...state.player, stage: 1, realmLevel: 2 },
    }
    expect(evaluateReincarnationKarma(state).realm).toBe(0)

    // Luyện Khí tầng 3 (stage 1, realmLevel 3) -> Milestone achieved: 30 points
    state = {
      ...state,
      player: { ...state.player, stage: 1, realmLevel: 3 },
    }
    expect(evaluateReincarnationKarma(state).realm).toBe(30)

    // Trúc Cơ (stage 2, realmLevel 1) -> Also qualifies for milestone: 30 points
    state = {
      ...state,
      player: { ...state.player, stage: 2, realmLevel: 1 },
    }
    expect(evaluateReincarnationKarma(state).realm).toBe(30)
  })

  it('awards 50 points for major events or non-tragic endings', () => {
    let state = newGame('event-milestone')

    // Tragic death without major events: 0 event points
    state = { ...state, player: { ...state.player, alive: false }, endingId: 'tragic_death' }
    expect(evaluateReincarnationKarma(state).majorEvents).toBe(0)

    // Reaching non-tragic ending: 50 points
    state = { ...state, endingId: 'peace_ending' }
    expect(evaluateReincarnationKarma(state).majorEvents).toBe(50)

    // Alternatively, clearing the arena or visiting warded cave in tragic death: 50 points
    state = {
      ...state,
      endingId: 'tragic_death',
      flags: { [FLAG_ARENA_CLEARED]: true },
    }
    expect(evaluateReincarnationKarma(state).majorEvents).toBe(50)

    state = {
      ...state,
      flags: { visitedCaveWarded: true },
    }
    expect(evaluateReincarnationKarma(state).majorEvents).toBe(50)
  })

  it('sums all milestones correctly for an accomplished cultivator', () => {
    let state = newGame('master-run')
    state = {
      ...state,
      day: 25,
      player: { ...state.player, stage: 2, realmLevel: 2 }, // 30 pts (realm)
      quests: {
        q1: { status: 'completed' },
        q2: { status: 'completed' },
        q3: { status: 'completed' },
      },
      flags: {
        quest_q1_done: true,
        quest_q2_done: true,
        quest_q3_done: true,
        story_ending: 'sect_master', // 50 pts (major event/ending)
      },
      endingId: 'sect_master',
    }

    const karma = evaluateReincarnationKarma(state)
    expect(karma.quests).toBe(30)
    expect(karma.realm).toBe(30)
    expect(karma.majorEvents).toBe(50)
    expect(karma.total).toBe(110)
  })

  it('recordTerminal accumulates reincarnationPoints into GlobalProfile', () => {
    const profile = { ...DEFAULT_GLOBAL_PROFILE }
    expect(profile.reincarnationPoints).toBe(0)

    // Run 1 finishes with 30 karma
    const after1 = recordTerminal(profile, 'tragic_death', [], 1, null, 30)
    expect(after1.reincarnationPoints).toBe(30)
    expect(after1.totalRuns).toBe(1)

    // Run 2 finishes with 50 karma -> accumulated to 80
    const after2 = recordTerminal(after1, 'peace_ending', [], 2, null, 50)
    expect(after2.reincarnationPoints).toBe(80)
    expect(after2.totalRuns).toBe(2)
  })

  it('parses legacy profile safely with default reincarnationPoints = 0', () => {
    const legacyRaw = {
      version: 1,
      unlockedEndingIds: ['peace_ending'],
      unlockedAchievementIds: [],
      highestNgPlusLevel: 1,
      totalRuns: 2,
      inheritedRelicId: null,
      // no reincarnationPoints field
    }
    const parsed = parseGlobalProfile(legacyRaw)
    expect(parsed.reincarnationPoints).toBe(0)
  })
})
