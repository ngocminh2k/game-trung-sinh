import { describe, expect, it } from 'vitest'
import { validateAllContent } from '../src/content'
import { SYSTEM_QUESTS } from '../src/content/system-quests'
import { newGame } from '../src/engine/constants'
import { canAcceptQuest, canCompleteQuest, isQuestUnlocked } from '../src/engine/quests'

describe('S04 System Quest Engine', () => {
  it('validates the merged system quest registry', () => {
    expect(validateAllContent()).toEqual({ ok: true, errors: [] })
  })

  it('only unlocks a System quest for its selected System', () => {
    const quest = SYSTEM_QUESTS[0]!
    const state = newGame('system-gate')
    expect(isQuestUnlocked(state, quest.id)).toBe(false)
    expect(isQuestUnlocked({ ...state, systemId: quest.requiredSystemId }, quest.id)).toBe(true)
  })

  it('accepts and completes matching System quests without a location or NPC', () => {
    const quest = SYSTEM_QUESTS[0]!
    const state = {
      ...newGame('system-location-free'),
      systemId: quest.requiredSystemId,
      inventory: { beast_fang: 1 },
      player: { ...newGame('system-location-free').player, locationId: 'cave' },
      quests: { [quest.id]: { status: 'active' as const, step: 0 } },
    }

    expect(canAcceptQuest({ ...state, quests: {} }, quest.id).ok).toBe(true)
    expect(canCompleteQuest(state, quest.id).ok).toBe(true)
  })
})
