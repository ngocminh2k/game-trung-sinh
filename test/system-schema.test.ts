import { describe, expect, it } from 'vitest'
import { parseGameState } from '../src/engine/schema'
import { QUESTS } from '../src/content'
import { QuestDefSchema } from '../src/engine/schema'

const OLD_SAVE = {
  version: 1,
  seed: 'pre-system',
  rng: 1,
  day: 1,
  player: {
    hp: 100,
    qi: 60,
    gold: 60,
    attrs: { body: 3, mind: 4, charm: 3, luck: 2 },
    stage: 0,
    progress: 0,
    posX: 3,
    posY: 3,
    locationId: 'village',
    alive: true,
  },
  spiritRoot: { kind: 'defective', elementVi: 'Mộc', elementEn: 'Wood', efficiency: 0.5 },
  inventory: {},
  storage: {},
  flags: {},
  quests: {},
  achievements: [],
  lastLotteryDay: null,
  corrections: 0,
  terminal: false,
  endingId: null,
}

describe('S02 systemId save compat', () => {
  it('old save without systemId parses to null', () => {
    const restored = parseGameState(OLD_SAVE)
    expect(restored.systemId).toBeNull()
  })

  it('authored quests (non-null giverNpcId) still parse', () => {
    for (const quest of QUESTS) {
      if (quest.requiredSystemId !== undefined) continue
      expect(QuestDefSchema.safeParse(quest).success).toBe(true)
    }
  })

  it('system-style quest with null giver parses', () => {
    const def = {
      id: 'q_sys_battle_01',
      giverNpcId: null,
      nameVi: 'Thử',
      nameEn: 'Trial',
      descVi: 'd',
      descEn: 'd',
      steps: [{ id: 's1', descVi: 'd', descEn: 'd', isTurnInStep: true }],
      requiredItems: {},
      requiredFlags: [],
      rewardGold: 10,
      rewardItems: {},
      aliases: [],
      requiredSystemId: 'sys_battle',
      difficulty: 8,
    }
    const parsed = QuestDefSchema.safeParse(def)
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data.giverNpcId).toBeNull()
  })

  it('difficulty outside 1-10 is rejected', () => {
    const def = { difficulty: 11 }
    expect(QuestDefSchema.pick({ difficulty: true }).safeParse(def).success).toBe(false)
  })
})
