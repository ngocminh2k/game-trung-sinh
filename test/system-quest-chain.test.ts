// U2 — systemQuestsFor() hides chain-locked system quests.
// Unit describe is content-agnostic (passes with old AND new content once the
// filter exists); integration + chain-walk describes need U1 content.
import { afterEach, describe, expect, it } from 'vitest'
import { FLAG_QUEST_DONE } from '../src/content/flag-keys'
import { SYSTEM_QUESTS } from '../src/content/system-quests'
import { applyAction, newGame, systemQuestsFor } from '../src/engine'
import { canAcceptQuest, canCompleteQuest } from '../src/engine/quests'
import type { QuestDef } from '../src/engine/content-types'
import type { GameState } from '../src/engine/types'

// FLAG_QUEST_DONE already carries its own leading underscore, so the authored
// key is `quest_<fullQuestId>_done` (the "double prefix" is quest_ + q_).
const questDoneFlag = (questId: string): string => `quest_${questId}${FLAG_QUEST_DONE}`

/** Fresh run with the System already picked (boot-menu path, no applyAction needed). */
function pickedState(systemId: string): GameState {
  return newGame('system-quest-chain', { systemId })
}

function poolOf(systemId: string) {
  return SYSTEM_QUESTS.filter((def) => def.requiredSystemId === systemId)
}

const visibleIds = (state: GameState): string[] => systemQuestsFor(state).map((def) => def.id)

describe('systemQuestsFor flag filter (unit)', () => {
  const pool = poolOf('sys_battle')

  // Synthetic def so this test is RED purely because the filter is missing,
  // independent of whether U1 content flags have landed yet.
  const probe: QuestDef = {
    ...pool[0]!,
    id: 'q_sys_probe_99',
    requiredFlags: ['quest_q_sys_battle_98_done'],
  }
  afterEach(() => {
    const i = SYSTEM_QUESTS.indexOf(probe)
    if (i >= 0) SYSTEM_QUESTS.splice(i, 1)
  })

  it('hides a never-touched pool quest whose requiredFlags are unmet', () => {
    SYSTEM_QUESTS.push(probe)
    expect(visibleIds(pickedState('sys_battle'))).not.toContain(probe.id)
  })

  it('shows that quest once its flag is set, and once it is in state.quests', () => {
    SYSTEM_QUESTS.push(probe)
    const base = pickedState('sys_battle')
    expect(visibleIds({ ...base, flags: { ...base.flags, quest_q_sys_battle_98_done: true } })).toContain(probe.id)
    expect(visibleIds({ ...base, quests: { [probe.id]: { status: 'active', step: 0 } } })).toContain(probe.id)
  })

  it('never offers a quest that is absent from state.quests with unmet requiredFlags', () => {
    const state = pickedState('sys_battle')
    // Dynamic so it is vacuous until content flags exist, and strict afterwards.
    const gated = pool.filter((def) => def.requiredFlags.length > 0 && state.quests[def.id] === undefined)
    const ids = visibleIds(state)
    for (const def of gated) expect(ids).not.toContain(def.id)
  })

  it('keeps a quest injected into state.quests even though its flags are unmet', () => {
    // Every pool member (incl. a mid/late-chain id) must survive being touched.
    for (const def of pool) {
      const state: GameState = {
        ...pickedState('sys_battle'),
        quests: { [def.id]: { status: 'active', step: 0 } },
      }
      expect(visibleIds(state)).toContain(def.id)
    }
  })

  it('includes a def whose requiredFlags are empty even on a fresh state', () => {
    const state = pickedState('sys_battle')
    const head = pool.find((def) => def.requiredFlags.length === 0)
    expect(head).toBeDefined()
    expect(visibleIds(state)).toContain(head!.id)
  })

  it('quest_q_sys_battle_01_done unlocks exactly q_sys_battle_02 in the battle view', () => {
    // needs U1 content; integration-verified
    const state: GameState = {
      ...pickedState('sys_battle'),
      flags: { ...pickedState('sys_battle').flags, quest_q_sys_battle_01_done: true },
    }
    const ids = visibleIds(state)
    expect(ids).toContain('q_sys_battle_01')
    expect(ids).toContain('q_sys_battle_02')
    expect(ids).not.toContain('q_sys_battle_03')
    expect(ids).not.toContain('q_sys_battle_04')
    expect(ids).not.toContain('q_sys_battle_05')
    expect(ids).not.toContain('q_sys_battle_06')
  })
})

describe('structural chain walk', () => {
  // Derived from the locked design table (docs/agent-work/active/system-quest-chain-ramp.md U1).
  const chains: Record<string, string[]> = {
    battle: ['q_sys_battle_01', 'q_sys_battle_02', 'q_sys_battle_03', 'q_sys_battle_05', 'q_sys_battle_04', 'q_sys_battle_06'],
    alchemy: ['q_sys_alchemy_01', 'q_sys_alchemy_02', 'q_sys_alchemy_03', 'q_sys_alchemy_06', 'q_sys_alchemy_04', 'q_sys_alchemy_05'],
    assassin: ['q_sys_assassin_01', 'q_sys_assassin_02', 'q_sys_assassin_03', 'q_sys_assassin_04', 'q_sys_assassin_06', 'q_sys_assassin_05'],
    void: ['q_sys_void_01', 'q_sys_void_02', 'q_sys_void_03', 'q_sys_void_05', 'q_sys_void_04', 'q_sys_void_06'],
    merchant: ['q_sys_merchant_01', 'q_sys_merchant_02', 'q_sys_merchant_03', 'q_sys_merchant_04', 'q_sys_merchant_05', 'q_sys_merchant_06'],
    lottery: ['q_sys_lottery_01', 'q_sys_lottery_02', 'q_sys_lottery_03', 'q_sys_lottery_04', 'q_sys_lottery_05', 'q_sys_lottery_06'],
    explorer: ['q_sys_explorer_01', 'q_sys_explorer_02', 'q_sys_explorer_03', 'q_sys_explorer_04', 'q_sys_explorer_05', 'q_sys_explorer_06'],
    healer: ['q_sys_healer_01', 'q_sys_healer_02', 'q_sys_healer_03', 'q_sys_healer_04', 'q_sys_healer_05', 'q_sys_healer_06'],
    artisan: ['q_sys_artisan_01', 'q_sys_artisan_02', 'q_sys_artisan_03', 'q_sys_artisan_04', 'q_sys_artisan_05', 'q_sys_artisan_06'],
    scholar: ['q_sys_scholar_01', 'q_sys_scholar_02', 'q_sys_scholar_03', 'q_sys_scholar_04', 'q_sys_scholar_05', 'q_sys_scholar_06'],
  }

  it('each pool walks one chain over its 6 quests with pred-done flag gating', () => {
    for (const [systemId, chain] of Object.entries(chains)) {
      const defs = poolOf(`sys_${systemId}`)
      expect(defs.map((def) => def.id).sort()).toEqual([...chain].sort())
      const byId = new Map(defs.map((def) => [def.id, def]))

      // Head: no prerequisite flags.
      expect(byId.get(chain[0]!)!.requiredFlags).toEqual([])

      for (let i = 1; i < chain.length; i++) {
        const cur = byId.get(chain[i]!)!
        const pred = chain[i - 1]!
        // Double prefix is intentional: reducer.ts:1851 writes quest_<fullId>_done.
        expect(cur.requiredFlags).toEqual([questDoneFlag(pred)])
        expect(byId.get(pred)!.nextQuestId).toBe(cur.id)
      }
      expect(byId.get(chain[chain.length - 1]!)!.nextQuestId).toBeUndefined()

      // Difficulty never decreases along the chain.
      const diffs = chain.map((id) => byId.get(id)!.difficulty ?? 0)
      for (let i = 1; i < diffs.length; i++) expect(diffs[i]!).toBeGreaterThanOrEqual(diffs[i - 1]!)
    }
  })
})

describe('chain behavior scenarios (integration, needs U1 content)', () => {
  it('fresh sys_battle pick offers only the chain head and refuses _02', () => {
    const state = pickedState('sys_battle')
    expect(visibleIds(state)).toEqual(['q_sys_battle_01'])
    expect(canAcceptQuest(state, 'q_sys_battle_02').ok).toBe(false)
  })

  it('_01_done surfaces _02 (acceptable) while _03 stays hidden', () => {
    const base = pickedState('sys_battle')
    const state: GameState = { ...base, flags: { ...base.flags, [questDoneFlag('q_sys_battle_01')]: true } }
    const ids = visibleIds(state)
    expect(ids).toContain('q_sys_battle_02')
    expect(ids).not.toContain('q_sys_battle_03')
    expect(canAcceptQuest(state, 'q_sys_battle_02').ok).toBe(true)
    expect(canAcceptQuest(state, 'q_sys_battle_03').ok).toBe(false)
  })

  it('an active _02 stays listed even when its flags look unmet', () => {
    const base = pickedState('sys_battle')
    const state: GameState = { ...base, quests: { q_sys_battle_02: { status: 'active', step: 0 } } }
    expect(visibleIds(state)).toContain('q_sys_battle_02')
  })

  // Real reducer round-trip: accept _01 -> turn in _01 -> _02 unlocks and is
  // ACCEPTABLE through the same doAcceptQuest gate the UI uses. The scenarios
  // above hand-build the done-flag; THIS one proves the flag doCompleteQuest
  // actually writes is the flag content requires. A one-character drift in
  // either string (`quest_<id>__done` vs `quest_<id>_done`) silently deadlocks
  // every chain in-game while every synthetic test stays green.
  it('completing _01 via the reducer unlocks AND accepts _02 end-to-end', () => {
    let game = pickedState('sys_battle')
    game = applyAction(game, { kind: 'system_accept_quest', questId: 'q_sys_battle_01' }).state
    expect(game.quests.q_sys_battle_01?.status).toBe('active')

    // Turn-in needs 1 beast_fang; grant it the way an item pickup would.
    const armed: GameState = { ...game, inventory: { ...game.inventory, beast_fang: 1 } }
    game = applyAction(armed, { kind: 'system_turn_in_quest', questId: 'q_sys_battle_01' }).state

    expect(game.quests.q_sys_battle_01?.status).toBe('completed')
    // The EXACT flag string content gates on — reducer and content must agree.
    expect(game.flags['quest_q_sys_battle_01_done']).toBe(true)
    expect(game.flags['quest_q_sys_battle_01__done']).toBeUndefined()

    expect(visibleIds(game)).toContain('q_sys_battle_02')
    // applyAction swallows a rejected action into an ERROR event and returns
    // state unchanged, so the real contract to assert is: after the accept,
    // _02 is actually 'active' (a refusal would leave it absent/'available').
    const after = applyAction(game, { kind: 'system_accept_quest', questId: 'q_sys_battle_02' })
    expect(after.events.some((e) => e.type === 'ERROR'), 'no ERROR event').toBe(false)
    expect(after.state.quests.q_sys_battle_02?.status).toBe('active')
  })

  // Legacy-save deadlock: a save made before deadlineDays existed can hold an
  // EXPIRED active system quest (quest_<id>_expires_day in flags). With no
  // abandon path, turn-in stays refused forever -> its _done flag never lands
  // -> the whole chain behind it is dead. Expiry must only bind when the
  // quest type still has a deadline.
  it('an expired system quest from a legacy save can still be turned in', () => {
    const base = pickedState('sys_battle')
    const legacy: GameState = {
      ...base,
      day: base.day + 30,
      flags: { ...base.flags, quest_q_sys_battle_01_expires_day: base.day },
      quests: { q_sys_battle_01: { status: 'active', step: 0 } },
      inventory: { ...base.inventory, beast_fang: 1 },
    }
    expect(canCompleteQuest(legacy, 'q_sys_battle_01').ok).toBe(true)
    expect(applyAction(legacy, { kind: 'system_turn_in_quest', questId: 'q_sys_battle_01' }).state
      .flags['quest_q_sys_battle_01_done']).toBe(true)
  })
})
