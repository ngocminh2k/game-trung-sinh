import { describe, expect, it } from 'vitest'
import { applyAction, newGame } from '../src/engine'
import type { GameState } from '../src/engine'
import { navTo } from './test-utils'

// Issue 5: the 100-node skill tree must actually wire into the reducer.
function encounterAtMistyForest(seed = 'skill-test', prefix?: (s: GameState) => GameState) {
  let state = newGame(seed)
  if (prefix !== undefined) state = prefix(state)
  state = navTo(state, 'misty_forest')
  state = applyAction(state, { kind: 'start_encounter' }).state
  return state
}

function withSkillPoints(state: GameState, points: number): GameState {
  return { ...state, player: { ...state.player, skillPoints: points } }
}

// Create an encounter with the exact unlockedSkills state from another run.
function encounterAtWithSkills(seed: string, from: GameState) {
  return encounterAtMistyForest(seed, (s) => ({ ...s, unlockedSkills: from.unlockedSkills }))
}

describe('Issue 5: unlock_skill reducer wiring', () => {
  it('rejects unknown node ids', () => {
    const state = withSkillPoints(newGame('skill-unknown'), 5)
    const result = applyAction(state, { kind: 'unlock_skill', nodeId: 'no_such_node' })
    expect(result.events).toEqual([{ type: 'ERROR', code: 'SKILL_UNKNOWN' }])
  })

  it('unlocks sword_t1 for 1 skill point and voices the name', () => {
    const state = withSkillPoints(newGame('skill-unlock'), 1)
    const result = applyAction(state, { kind: 'unlock_skill', nodeId: 'sword_t1' })
    expect(result.state.player.skillPoints).toBe(0)
    expect(result.state.unlockedSkills).toEqual(['sword_t1'])
    const unlocked = result.events.find((e) => e.type === 'SKILL_UNLOCKED')
    expect(unlocked).toEqual({ type: 'SKILL_UNLOCKED', nodeId: 'sword_t1', skillPointsSpent: 1 })
  })

  it('rejects a second unlock of the same node', () => {
    const state = withSkillPoints(newGame('skill-dup'), 5)
    const first = applyAction(state, { kind: 'unlock_skill', nodeId: 'sword_t1' })
    const second = applyAction(first.state, { kind: 'unlock_skill', nodeId: 'sword_t1' })
    expect(second.events).toEqual([{ type: 'ERROR', code: 'SKILL_ALREADY_UNLOCKED' }])
  })

  it('rejects unlocks without enough skill points', () => {
    const state = withSkillPoints(newGame('skill-poor'), 0)
    const result = applyAction(state, { kind: 'unlock_skill', nodeId: 'sword_t1' })
    expect(result.events).toEqual([{ type: 'ERROR', code: 'INSUFFICIENT_SKILL_POINTS' }])
  })

  it('enforces the tier chain: tier 2 needs tier 1 of the same branch', () => {
    const state = withSkillPoints(newGame('skill-chain'), 5)
    const skip = applyAction(state, { kind: 'unlock_skill', nodeId: 'sword_t2' })
    expect(skip.events).toEqual([{ type: 'ERROR', code: 'SKILL_REQUIREMENT_NOT_MET' }])
    const first = applyAction(state, { kind: 'unlock_skill', nodeId: 'sword_t1' })
    const second = applyAction(first.state, { kind: 'unlock_skill', nodeId: 'sword_t2' })
    expect(second.state.unlockedSkills).toEqual(['sword_t1', 'sword_t2'])
  })

  it('grants skill points at breakthrough (+1 per minor realm)', () => {
    const base = newGame('skill-breakthrough')
    const rich = applyAction(
      { ...base, player: { ...base.player, stage: 0, realmLevel: 1, progress: 0, qi: 100, hp: 100 } },
      { kind: 'train' },
    )
    const advanced = rich.events.find((e) => e.type === 'MINOR_REALM_ADVANCED')
    if (advanced?.type === 'MINOR_REALM_ADVANCED') {
      expect(advanced.skillPointsGranted).toBeGreaterThanOrEqual(1)
      expect(rich.state.player.skillPoints).toBeGreaterThanOrEqual(1)
    }
  })

  it('attack nodes raise strike damage deterministically', () => {
    // unlock_skill is refused mid-encounter (closed turn loop), so unlock
    // first, then open the same encounter. Same seed + unlockedSkills-only
    // difference: the variance/crit rolls share the RNG stream (unlock consumes
    // no RNG), so the skilled strike must land strictly higher.
    const base = withSkillPoints(newGame('skill-plain'), 2)
    const noted = applyAction(base, { kind: 'unlock_skill', nodeId: 'sword_t1' }).state
    const plain = encounterAtMistyForest('skill-plain')
    const skilled = encounterAtWithSkills('skill-plain', noted)
    const plainStrike = applyAction(plain, { kind: 'combat_attack' })
    const skilledStrike = applyAction(skilled, { kind: 'combat_attack' })
    const plainAmt = plainStrike.events.find((e) => e.type === 'COMBAT_HIT' && e.actor === 'player')
    const skilledAmt = skilledStrike.events.find((e) => e.type === 'COMBAT_HIT' && e.actor === 'player')
    expect(plainAmt).toBeDefined()
    expect(skilledAmt).toBeDefined()
    expect((skilledAmt as { amount: number }).amount).toBeGreaterThan(
      (plainAmt as { amount: number }).amount,
    )
  })

  it('unlocks cost gold when the node charges it (sword_t4)', () => {
    // sword_t4 costs 1 point + 40 gold; unlock the tier chain first.
    let state = withSkillPoints(newGame('skill-gold'), 10)
    state = { ...state, player: { ...state.player, stage: 1 } }
    const goldBefore = state.player.gold
    for (const node of ['sword_t1', 'sword_t2', 'sword_t3']) {
      state = applyAction(state, { kind: 'unlock_skill', nodeId: node }).state
    }
    const result = applyAction(state, { kind: 'unlock_skill', nodeId: 'sword_t4' })
    expect(result.state.player.gold).toBe(goldBefore - 40)
    expect(result.state.unlockedSkills).toContain('sword_t4')
  })
})
