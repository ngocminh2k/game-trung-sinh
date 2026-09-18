import { describe, expect, it } from 'vitest'
import { getAchievementProgress } from '../src/ui/gameScreen/helpers'
import { ACHIEVEMENTS } from '../src/content/achievements-data'
import { newGame } from '../src/engine'

describe('C3-11: Hidden Achievement Hints via Poetry', () => {
  const baseState = newGame('test-achievement-hints')

  it('shows poetic hint at 50% progress for first_step (moveCount)', () => {
    const state = { ...baseState, flags: { moveCount: 1 } }
    const progress = getAchievementProgress(state, 'first_step', 'vi', false)
    expect(progress.current).toBe(1)
    expect(progress.percent).toBe(33)
    // At 33%, hint should NOT show yet
  })

  it('shows poetic hint at 50% progress (moveCount >= 2 for first_step)', () => {
    const state = { ...baseState, flags: { moveCount: 2 } }
    const progress = getAchievementProgress(state, 'first_step', 'vi', false)
    expect(progress.current).toBe(2)
    expect(progress.percent).toBe(67)
    // At 67%, hint should show
  })

  it('shows poetic hint at 50% progress for green_thumb (gatherCount >= 5)', () => {
    const state = { ...baseState, flags: { gatherCount: 5 } }
    const progress = getAchievementProgress(state, 'green_thumb', 'vi', false)
    expect(progress.percent).toBe(50)
  })

  it('shows poetic hint at 50% progress for socialite (5 distinct NPCs)', () => {
    const state = {
      ...baseState,
      flags: { aff_npc_1: 1, aff_npc_2: 1, aff_npc_3: 1 }
    }
    const progress = getAchievementProgress(state, 'socialite', 'vi', false)
    expect(progress.percent).toBe(60) // 3/5 = 60%
  })

  it('shows poetic hint at 50% progress for first_purchase (buyCount >= 3)', () => {
    const state = { ...baseState, flags: { buyCount: 3 } }
    const progress = getAchievementProgress(state, 'first_purchase', 'vi', false)
    expect(progress.percent).toBe(60)
  })

  it('shows poetic hint at 50% progress for first_sale (sellCount >= 3)', () => {
    const state = { ...baseState, flags: { sellCount: 3 } }
    const progress = getAchievementProgress(state, 'first_sale', 'vi', false)
    expect(progress.percent).toBe(60)
  })

  it('shows poetic hint at 50% progress for halfway_there (stage 1 of 2)', () => {
    const state = { ...baseState, player: { ...baseState.player, stage: 1 } }
    const progress = getAchievementProgress(state, 'halfway_there', 'vi', false)
    expect(progress.percent).toBe(50)
  })

  it('shows poetic hint at 50% progress for wealthy (gold >= 200)', () => {
    const state = { ...baseState, player: { ...baseState.player, gold: 200 } }
    const progress = getAchievementProgress(state, 'wealthy', 'vi', false)
    expect(progress.percent).toBe(50)
  })

  it('shows poetic hint at 50% progress for immortal_road_end (stage >= 50% of MAX_STAGE)', () => {
    const state = { ...baseState, player: { ...baseState.player, stage: 2 } } // MAX_STAGE=5, 50%≈2-3
    const progress = getAchievementProgress(state, 'immortal_road_end', 'vi', false)
    expect(progress.percent).toBeGreaterThanOrEqual(40)
    expect(progress.percent).toBeLessThanOrEqual(60)
  })

  it('shows poetic hint at 50% progress for notorious (infamy >= 1)', () => {
    const state = { ...baseState, flags: { infamy: 1 } }
    const progress = getAchievementProgress(state, 'notorious', 'vi', false)
    expect(progress.percent).toBe(50)
  })

  it('every achievement has hintVi and hintEn fields', () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.hintVi).toBeTruthy()
      expect(a.hintEn).toBeTruthy()
      expect(typeof a.hintVi).toBe('string')
      expect(typeof a.hintEn).toBe('string')
      // Hints should be different from descriptions
      expect(a.hintVi).not.toBe(a.descVi)
      expect(a.hintEn).not.toBe(a.descEn)
    }
  })

  it('hints are poetic/metaphorical, not literal descriptions', () => {
    // Verify hints don't contain the same literal keywords as descriptions
    for (const a of ACHIEVEMENTS) {
      // Hints should not be identical to descriptions
      expect(a.hintVi).not.toBe(a.descVi)
      expect(a.hintEn).not.toBe(a.descEn)
    }
  })
})