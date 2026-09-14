// Issue #38 — returning to a save dropped every context (p18 kept reloading
// and re-orienting). resumeContextLine is the engine-side half of the fix:
// one chronicle line, built from state alone, in the save's own locale.
import { describe, expect, it } from 'vitest'
import { newGame, resumeContextLine } from '../src/engine'
import { getLocation, getQuest } from '../src/content'
import type { GameState } from '../src/engine'

function withActiveQuest(state: GameState, questId: string): GameState {
  return { ...state, quests: { [questId]: { status: 'active', step: 0 } } }
}

describe('resumeContextLine', () => {
  it('names day, place, stage and quest in Vietnamese', () => {
    const base = newGame('resume-vi')
    const state = withActiveQuest(base, 'q_main_letter')
    const line = resumeContextLine(state, 'vi')
    expect(line).toContain('Hồi tưởng')
    expect(line).toContain(`Ngày ${String(state.day)}`)
    expect(line).toContain(getLocation(state.player.locationId)?.nameVi ?? '')
    expect(line).toContain(`tầng ${String(state.player.stage)}`)
    expect(line).toContain(getQuest('q_main_letter')?.nameVi ?? '')
  })

  it('names the same facts in English', () => {
    const base = newGame('resume-en')
    const state = withActiveQuest(base, 'q_main_letter')
    const line = resumeContextLine(state, 'en')
    expect(line).toMatch(/Where you left off/)
    expect(line).toContain(`Day ${String(state.day)}`)
    expect(line).toContain(`stage ${String(state.player.stage)}`)
    expect(line).toContain(getQuest('q_main_letter')?.nameEn ?? '')
  })

  it('points at talking when no quest is in flight', () => {
    const state: GameState = { ...newGame('resume-noquest'), quests: {} }
    expect(resumeContextLine(state, 'vi')).toMatch(/chưa có nhiệm vụ/)
    expect(resumeContextLine(state, 'en')).toMatch(/no quest in flight/)
  })

  it('survives an unknown location id without throwing', () => {
    const base = newGame('resume-unknown')
    const state: GameState = { ...base, player: { ...base.player, locationId: 'nowhere_at_all' } }
    expect(resumeContextLine(state, 'en')).toContain('nowhere_at_all')
  })

  it('falls back to the raw quest id when the quest def is missing', () => {
    const state = withActiveQuest(newGame('resume-orphan'), 'q_ghost')
    expect(resumeContextLine(state, 'en')).toContain('q_ghost')
  })
})
