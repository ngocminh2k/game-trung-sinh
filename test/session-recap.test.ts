import { describe, expect, it } from 'vitest'
import { newGame, type GameState } from '../src/engine'
import {
  deriveSystemAdvice,
  generateSessionRecap,
  formatAwayDuration,
} from '../src/engine/sessionRecap'

describe('C3-17: System Assistant & Session Recap (Engine Unit Tests)', () => {
  it('formats away duration accurately in both Vietnamese and English', () => {
    // Just now (< 1 min)
    expect(formatAwayDuration(30 * 1000, 'vi')).toBe('Vừa mới đây')
    expect(formatAwayDuration(30 * 1000, 'en')).toBe('Just now')

    // Minutes (< 1 hr)
    expect(formatAwayDuration(15 * 60 * 1000, 'vi')).toBe('15 phút')
    expect(formatAwayDuration(15 * 60 * 1000, 'en')).toBe('15 mins')

    // Hours and minutes (< 24 hrs)
    expect(formatAwayDuration(2.5 * 60 * 60 * 1000, 'vi')).toBe('2 giờ 30 phút')
    expect(formatAwayDuration(2.5 * 60 * 60 * 1000, 'en')).toBe('2 hours 30 mins')

    // Days and hours (>= 24 hrs)
    expect(formatAwayDuration(50 * 60 * 60 * 1000, 'vi')).toBe('2 ngày 2 giờ')
    expect(formatAwayDuration(50 * 60 * 60 * 1000, 'en')).toBe('2 days 2 hours')
  })

  it('prioritizes pending attribute points as critical advice', () => {
    const game: GameState = {
      ...newGame('recap_attr_1'),
      player: {
        ...newGame('recap_attr_1').player,
        pendingAttributePoints: 3,
      },
    }

    const advice = deriveSystemAdvice(game, 'vi')
    expect(advice.priority).toBe('critical')
    expect(advice.tag).toBe('attribute')
    expect(advice.headlineVi).toContain('Phân bổ điểm tiềm năng')
    expect(advice.detailVi).toContain('3 điểm')
    expect(advice.actionSuggestion).toBe('allocate_attribute')

    const adviceEn = deriveSystemAdvice(game, 'en')
    expect(adviceEn.headlineEn).toContain('Attribute Points')
  })

  it('prioritizes critically low health (<30% HP) over normal progression', () => {
    const game: GameState = {
      ...newGame('recap_hp_1'),
      player: {
        ...newGame('recap_hp_1').player,
        hp: 20, // Max HP is 100, so 20%
        pendingAttributePoints: 0,
      },
    }

    const advice = deriveSystemAdvice(game, 'vi')
    expect(advice.priority).toBe('urgent')
    expect(advice.tag).toBe('health')
    expect(advice.headlineVi).toContain('Khí huyết suy kiệt')
    expect(advice.actionSuggestion).toBe('rest')
  })

  it('prioritizes active combat encounters', () => {
    const base = newGame('recap_combat_1')
    const game: GameState = {
      ...base,
      player: {
        ...base.player,
        hp: 90,
        pendingAttributePoints: 0,
      },
      encounter: {
        enemyId: 'mist_boar',
        hp: 40,
        maxHp: 50,
        guard: 0,
      },
    }

    const advice = deriveSystemAdvice(game, 'vi')
    expect(advice.priority).toBe('urgent')
    expect(advice.tag).toBe('danger')
    expect(advice.headlineVi).toContain('Đang trong giao chiến')
    expect(advice.actionSuggestion).toBe('combat')
  })

  it('advises breakthrough when ready', () => {
    const base = newGame('recap_breakthrough_1')
    const game: GameState = {
      ...base,
      player: {
        ...base.player,
        hp: 95,
        qi: 40,
        progress: 120, // Enough for breakthrough
        pendingAttributePoints: 0,
      },
    }

    const advice = deriveSystemAdvice(game, 'vi')
    expect(advice.priority).toBe('recommended')
    expect(advice.tag).toBe('breakthrough')
    expect(advice.headlineVi).toContain('Đột Phá')
    expect(advice.actionSuggestion).toBe('train')
  })

  it('advises active quest step when quest is in progress', () => {
    const base = newGame('recap_quest_1')
    const game: GameState = {
      ...base,
      player: {
        ...base.player,
        hp: 100,
        pendingAttributePoints: 0,
      },
      quests: {
        q_main_letter: {
          status: 'active',
          step: 0,
        },
      },
    }

    const advice = deriveSystemAdvice(game, 'vi')
    expect(advice.tag).toBe('quest')
    expect(advice.detailVi).toBeTruthy()
    expect(advice.headlineVi).toContain('Nhiệm vụ')
  })

  it('generates a comprehensive SessionRecap data model', () => {
    const base = newGame('recap_gen_1')
    const now = 1770000000000
    const twoHoursAgo = now - 2 * 60 * 60 * 1000

    const game: GameState = {
      ...base,
      player: {
        ...base.player,
        hp: 85,
        qi: 30,
        stage: 1,
        silver: 150,
        gold: 10,
        spiritStones: 2,
        pendingAttributePoints: 0,
      },
    }

    const recap = generateSessionRecap(game, 'vi', twoHoursAgo, now)
    expect(recap.awayDurationMs).toBe(2 * 60 * 60 * 1000)
    expect(recap.awayFormattedVi).toBe('2 giờ')
    expect(recap.locationNameVi).toBeTruthy()
    expect(recap.statusSummary.hp).toBe(85)
    expect(recap.statusSummary.maxHp).toBe(130)
    expect(recap.statusSummary.stage).toBe(1)
    expect(recap.statusSummary.silver).toBe(150)
    expect(recap.primaryAdvice).toBeTruthy()
    expect(recap.suggestedActionsVi.length).toBeGreaterThan(0)
  })
})
