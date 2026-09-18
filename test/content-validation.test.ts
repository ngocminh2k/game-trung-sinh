import { describe, expect, it } from 'vitest'
import { QUESTS, SYSTEMS, validateAllContent, validateSystemQuestChains } from '../src/content'
import type { QuestDef } from '../src/engine/content-types'

/** Full real content, real pool list — the production wiring. */
const realSystemIds = SYSTEMS.map((system) => system.id)

/**
 * Chain fixtures are authored against a single pool so that the pool-head check
 * has something to count. `systemIds` limits the universe to sys_battle.
 */
const BATTLE_POOL = ['sys_battle']

const sysQuest = (id: string, over: Partial<QuestDef> = {}): QuestDef => ({
  id,
  giverNpcId: null,
  nameVi: id,
  nameEn: id,
  descVi: id,
  descEn: id,
  requiredSystemId: 'sys_battle',
  difficulty: 1,
  steps: [{ id: 't1', descVi: 'nộp', descEn: 'turn in', isTurnInStep: true }],
  requiredItems: {},
  requiredFlags: [],
  rewardGold: 45,
  rewardItems: {},
  aliases: [id],
  ...over,
})

const mentions = (errors: string[], needle: string): boolean =>
  errors.some((error) => error.includes(needle))

describe('system quest chain validation — real content', () => {
  it('accepts the shipped q_sys_ chains', () => {
    expect(validateSystemQuestChains(QUESTS, realSystemIds)).toEqual([])
  })

  it('surfaces no chain errors through validateAllContent', () => {
    const report = validateAllContent()
    expect(report.errors.filter((error) => error.includes('SYSTEM_CHAIN'))).toEqual([])
  })

  it('has exactly one head per pool, so the report is not vacuous', () => {
    const heads = QUESTS.filter(
      (q) => q.id.startsWith('q_sys_') && q.requiredFlags.length === 0,
    )
    expect(heads.map((q) => q.id)).toHaveLength(SYSTEMS.length)
  })
})

describe('check 1 — done-flag format', () => {
  it('flags a typo that drops the inner q_ prefix (the silent-deadlock trap)', () => {
    const errors = validateSystemQuestChains(
      [
        sysQuest('q_sys_battle_01', { nextQuestId: 'q_sys_battle_02' }),
        sysQuest('q_sys_battle_02', { requiredFlags: ['quest_sys_battle_01_done'] }),
      ],
      BATTLE_POOL,
    )
    expect(mentions(errors, 'q_sys_battle_02')).toBe(true)
    expect(mentions(errors, 'quest_sys_battle_01_done')).toBe(true)
  })

  it('flags a bare _done token and a non-chain flag', () => {
    const errors = validateSystemQuestChains(
      [
        sysQuest('q_sys_battle_01', { nextQuestId: 'q_sys_battle_03' }),
        sysQuest('q_sys_battle_02', { requiredFlags: ['_done'] }),
        sysQuest('q_sys_battle_03', { requiredFlags: ['realm_reached'] }),
      ],
      BATTLE_POOL,
    )
    expect(mentions(errors, "'_done'")).toBe(true)
    expect(mentions(errors, "'realm_reached'")).toBe(true)
  })

  it('accepts the exact real flag name', () => {
    const errors = validateSystemQuestChains(
      [
        sysQuest('q_sys_battle_01', { nextQuestId: 'q_sys_battle_02' }),
        sysQuest('q_sys_battle_02', { requiredFlags: ['quest_q_sys_battle_01_done'] }),
        sysQuest('q_sys_battle_03'),
      ],
      BATTLE_POOL,
    )
    expect(errors.filter((error) => mentions([error], 'requiredFlags'))).toEqual([])
  })
})

describe('check 2 — nextQuestId agrees bidirectionally', () => {
  const linked = (targetFlags: string[]): QuestDef[] => [
    sysQuest('q_sys_battle_01', { nextQuestId: 'q_sys_battle_02' }),
    sysQuest('q_sys_battle_02', { requiredFlags: targetFlags }),
  ]

  it('accepts a mutual link', () => {
    expect(
      validateSystemQuestChains(linked(['quest_q_sys_battle_01_done']), BATTLE_POOL),
    ).toEqual([])
  })

  it('flags a one-way link: successor has no gate at all', () => {
    const errors = validateSystemQuestChains(linked([]), BATTLE_POOL)
    expect(mentions(errors, 'q_sys_battle_01')).toBe(true)
    expect(mentions(errors, 'quest_q_sys_battle_01_done')).toBe(true)
  })

  it('flags a one-way link: successor gated on the wrong predecessor', () => {
    const errors = validateSystemQuestChains(linked(['quest_q_sys_battle_99_done']), BATTLE_POOL)
    expect(mentions(errors, 'not exactly')).toBe(true)
  })

  it('flags a successor with extra gates beyond the chain link', () => {
    const errors = validateSystemQuestChains(
      linked(['quest_q_sys_battle_01_done', 'quest_q_sys_battle_05_done']),
      BATTLE_POOL,
    )
    expect(mentions(errors, 'not exactly')).toBe(true)
  })

  it('flags a nextQuestId that points at a non-system quest', () => {
    const errors = validateSystemQuestChains(
      [
        sysQuest('q_sys_battle_01', { nextQuestId: 'q_village_intro' }),
        sysQuest('q_sys_battle_02'),
      ],
      BATTLE_POOL,
    )
    expect(mentions(errors, 'q_village_intro')).toBe(true)
  })

  it('flags a nextQuestId that crosses pools', () => {
    const errors = validateSystemQuestChains(
      [
        sysQuest('q_sys_battle_01', { nextQuestId: 'q_sys_alchemy_02' }),
        sysQuest('q_sys_battle_02'),
        sysQuest('q_sys_alchemy_02', {
          requiredSystemId: 'sys_alchemy',
          requiredFlags: ['quest_q_sys_battle_01_done'],
        }),
      ],
      ['sys_battle', 'sys_alchemy'],
    )
    expect(mentions(errors, 'outside pool')).toBe(true)
  })
})

describe('check 3 — pool head integrity', () => {
  it('flags a chained pool with two heads (branch appears, chain start is ambiguous)', () => {
    const errors = validateSystemQuestChains(
      [
        sysQuest('q_sys_battle_01'),
        sysQuest('q_sys_battle_02', { requiredFlags: ['quest_q_sys_battle_01_done'] }),
        sysQuest('q_sys_battle_03'),
      ],
      BATTLE_POOL,
    )
    expect(mentions(errors, 'exactly one head')).toBe(true)
    expect(mentions(errors, 'found 2')).toBe(true)
  })

  it('accepts a fully flat pool: pre-migration content is not corruption', () => {
    expect(validateSystemQuestChains([sysQuest('q_sys_battle_01'), sysQuest('q_sys_battle_02')], BATTLE_POOL)).toEqual([])
  })

  it('flags a pool with no head (nothing can ever unlock)', () => {
    const errors = validateSystemQuestChains(
      [
        sysQuest('q_sys_battle_01', { requiredFlags: ['quest_q_sys_battle_02_done'] }),
        sysQuest('q_sys_battle_02', { requiredFlags: ['quest_q_sys_battle_01_done'] }),
      ],
      BATTLE_POOL,
    )
    expect(mentions(errors, 'found 0')).toBe(true)
  })

  it('flags a pool that has no quests at all', () => {
    const errors = validateSystemQuestChains([sysQuest('q_sys_battle_01')], ['sys_battle', 'sys_void'])
    expect(mentions(errors, 'pool sys_void')).toBe(true)
  })

  it('flags a gate on a quest from another pool', () => {
    const errors = validateSystemQuestChains(
      [
        sysQuest('q_sys_battle_01'),
        sysQuest('q_sys_battle_02', { requiredFlags: ['quest_q_sys_void_01_done'] }),
      ],
      ['sys_battle', 'sys_void'],
    )
    expect(mentions(errors, 'outside its own pool')).toBe(true)
  })

  it('flags a q_sys_ id that belongs to no known pool', () => {
    const errors = validateSystemQuestChains([sysQuest('q_sys_dragon_01')], BATTLE_POOL)
    expect(mentions(errors, 'no known system pool')).toBe(true)
  })
})

describe('check 4 — chain quests carry no deadline', () => {
  it('flags deadlineDays on a system quest (expiry has no abandon path)', () => {
    const errors = validateSystemQuestChains(
      [
        sysQuest('q_sys_battle_01', { nextQuestId: 'q_sys_battle_02' }),
        sysQuest('q_sys_battle_02', {
          requiredFlags: ['quest_q_sys_battle_01_done'],
          deadlineDays: 3,
        }),
      ],
      BATTLE_POOL,
    )
    expect(errors).toHaveLength(1)
    expect(mentions(errors, 'deadlineDays')).toBe(true)
  })

  it('leaves world-quest deadlines alone', () => {
    expect(
      validateSystemQuestChains([sysQuest('q_sys_battle_01'), sysQuest('q_sys_battle_02', { requiredFlags: ['quest_q_sys_battle_01_done'] })], BATTLE_POOL),
    ).toEqual([])
  })
})
