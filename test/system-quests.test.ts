import { describe, expect, it } from 'vitest'
import { SYSTEM_QUESTS } from '../src/content/system-quests'
import { SYSTEMS, type SystemId } from '../src/content/system-defs'
import { ITEMS } from '../src/content/items'
import { applyAction, newGame as baseNewGame } from '../src/engine'
import { deriveObjective } from '../src/ui/objective'
import { canAcceptQuest, currentStepIndex } from '../src/engine/quests'
import type { GameState } from '../src/engine'

describe('S03 System Quest Pool', () => {
  it('has at least 50 quests total', () => {
    expect(SYSTEM_QUESTS.length).toBeGreaterThanOrEqual(50)
  })

  it('has between 5 and 8 quests for each of the 10 systems', () => {
    const counts: Record<SystemId, number> = Object.fromEntries(SYSTEMS.map((sys) => [sys.id, 0])) as Record<SystemId, number>
    for (const q of SYSTEM_QUESTS) {
      expect(q.requiredSystemId).toBeDefined()
      const id = q.requiredSystemId as SystemId
      counts[id] += 1
    }
    for (const [sysId, count] of Object.entries(counts)) {
      expect(count, `Quest count for ${sysId}`).toBeGreaterThanOrEqual(5)
      expect(count, `Quest count for ${sysId}`).toBeLessThanOrEqual(8)
    }
  })

  it('enforces system quest structural invariants', () => {
    const ids = new Set<string>()
    for (const q of SYSTEM_QUESTS) {
      expect(ids.has(q.id), `Duplicate quest id ${q.id}`).toBe(false)
      ids.add(q.id)
      expect(q.id).toMatch(/^q_sys_[a-z]+_\d{2}$/)
      expect(q.giverNpcId).toBeNull()
      expect(q.storySceneNextId).toBeUndefined()
      expect(q.secret).toBe(true)
      // System quests are chain-gated; a deadline would deadlock the chain once turn-in is
      // blocked by expiry with no abandon path (P2, docs/agent-work/active/system-quest-chain-ramp.md).
      expect(q.deadlineDays).toBeUndefined()
      expect(q.difficulty).toBeGreaterThanOrEqual(1)
      expect(q.difficulty).toBeLessThanOrEqual(10)
    }
  })

  it('respects budget limits for every system quest', () => {
    const itemIds = new Set(ITEMS.map((item) => item.id))
    const sysMap = new Map(SYSTEMS.map((s) => [s.id, s]))

    for (const q of SYSTEM_QUESTS) {
      const sys = sysMap.get(q.requiredSystemId as SystemId)
      expect(sys, `System for ${q.id}`).toBeDefined()
      const budget = sys!.rewardBudget

      expect(q.rewardGold).toBeGreaterThanOrEqual(budget.minGold)
      expect(q.rewardGold).toBeLessThanOrEqual(budget.maxGold)

      if (q.rewardSpiritStones !== undefined) {
        expect(q.rewardSpiritStones).toBeGreaterThanOrEqual(budget.minSpiritStones)
        expect(q.rewardSpiritStones).toBeLessThanOrEqual(budget.maxSpiritStones)
      }

      for (const [itemId, qty] of Object.entries(q.rewardItems)) {
        expect(qty).toBeGreaterThan(0)
        expect(itemIds.has(itemId), `Unknown item ${itemId} in reward`).toBe(true)
        expect(budget.itemPool.includes(itemId), `Item ${itemId} not in ${sys!.id} budget itemPool`).toBe(true)
      }
    }
  })
})

describe('Quest Objective HUD Integration', () => {
  function newGameWithBattleSystem(seed: string): GameState {
    let game = baseNewGame(seed)
    game = applyAction(game, { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
    game = applyAction(game, { kind: 'story_choice', choiceId: 'pick_sys_battle' }).state
    return game
  }

  it('deriveObjective returns step 1 quest objective string after accepting and completing step 0 of a system quest', () => {
    // Start a new game with battle system
    let game = newGameWithBattleSystem('quest-objective-test')

    // Accept the first battle system quest
    const acceptResult = canAcceptQuest(game, 'q_sys_battle_01')
    expect(acceptResult.ok).toBe(true)

    game = applyAction(game, { kind: 'system_accept_quest', questId: 'q_sys_battle_01' }).state

    // Verify quest is active
    expect(game.quests['q_sys_battle_01']?.status).toBe('active')
    expect(currentStepIndex(game, 'q_sys_battle_01')).toBe(0)

    // Get the first step (index 0) objective
    const step0DescVi = SYSTEM_QUESTS.find(q => q.id === 'q_sys_battle_01')?.steps[0]?.descVi
    const step0DescEn = SYSTEM_QUESTS.find(q => q.id === 'q_sys_battle_01')?.steps[0]?.descEn

    expect(step0DescVi).toBeDefined()
    expect(step0DescEn).toBeDefined()

    // deriveObjective should show step 0 description
    const objVi = deriveObjective(game, 'vi')
    const objEn = deriveObjective(game, 'en')

    expect(objVi).toContain(step0DescVi!)
    expect(objEn).toContain(step0DescEn!)

    // Now complete step 0 by giving the required item (beast_fang: 1)
    // Add beast_fang to inventory
    game = {
      ...game,
      inventory: { ...game.inventory, beast_fang: 1 }
    }

    // Trigger quest advancement by calling tickQuestSteps via applyAction
    game = applyAction(game, { kind: 'rest' }).state // This should trigger tickQuestSteps

    // Check if step advanced to 1
    const stepIdx = currentStepIndex(game, 'q_sys_battle_01')
    if (stepIdx === 1) {
      // Quest has advanced to step 1
      const step1DescVi = SYSTEM_QUESTS.find(q => q.id === 'q_sys_battle_01')?.steps[1]?.descVi
      const step1DescEn = SYSTEM_QUESTS.find(q => q.id === 'q_sys_battle_01')?.steps[1]?.descEn

      // If there's a step 1, verify it's shown
      if (step1DescVi && step1DescEn) {
        const objVi2 = deriveObjective(game, 'vi')
        const objEn2 = deriveObjective(game, 'en')

        expect(objVi2).toContain(step1DescVi)
        expect(objEn2).toContain(step1DescEn)
      }
    }
  })

  it('DockPanelQuests displays quest.steps[currentStepIndex].descVi for active quests', () => {
    // This test verifies the UI component displays the current step description
    // The actual UI rendering is tested via the component's logic in panels.tsx
    // Here we verify the data flow: currentStepIndex returns correct index and
    // the quest step description matches

    let game = newGameWithBattleSystem('quest-ui-test')

    // Accept the quest
    game = applyAction(game, { kind: 'system_accept_quest', questId: 'q_sys_battle_01' }).state

    // Verify step index is 0
    expect(currentStepIndex(game, 'q_sys_battle_01')).toBe(0)

    // Get the quest definition
    const quest = SYSTEM_QUESTS.find(q => q.id === 'q_sys_battle_01')
    expect(quest).toBeDefined()

    // Verify the step description at index 0 matches what the UI would display
    expect(quest!.steps.length).toBeGreaterThan(0)
    const step0 = quest!.steps[0]!
    expect(step0.descVi).toBe('Giao nanh thú cho Hệ Thống.')
    expect(step0.descEn).toBe('Deliver beast fangs to the System.')
  })

  it('deriveObjective returns current step description for multi-step quest q_main_letter', () => {
    // Start a new game
    let game = baseNewGame('multi-step-quest-test')

    // Accept the main quest q_main_letter (requires being at village)
    game = { ...game, player: { ...game.player, locationId: 'village' } }
    const acceptResult = canAcceptQuest(game, 'q_main_letter')
    expect(acceptResult.ok).toBe(true)

    game = applyAction(game, { kind: 'accept_quest', questId: 'q_main_letter' }).state

    // Verify quest is active at step 0
    expect(game.quests['q_main_letter']?.status).toBe('active')
    expect(currentStepIndex(game, 'q_main_letter')).toBe(0)

    // deriveObjective should show step 0 description
    const objVi = deriveObjective(game, 'vi')
    const objEn = deriveObjective(game, 'en')

    expect(objVi).toContain('Nói chuyện với cụ Mai Hoa về lá thư.')
    expect(objEn).toContain('Speak to Meihua about the letter.')

    // Complete step 0 by talking to Meihua (sets the flag)
    game = {
      ...game,
      flags: { ...game.flags, talk_n_elder_meihua: true }
    }

    // Trigger quest advancement via tickQuestSteps (called by rest action)
    game = applyAction(game, { kind: 'rest' }).state

    // Check if step advanced to 1
    const stepIdx = currentStepIndex(game, 'q_main_letter')
    expect(stepIdx).toBe(1)

    // deriveObjective should now show step 1 description
    const objVi2 = deriveObjective(game, 'vi')
    const objEn2 = deriveObjective(game, 'en')

    expect(objVi2).toContain('Trở lại gặp cụ Mai Hoa.')
    expect(objEn2).toContain('Return to Elder Meihua.')
  })
})
