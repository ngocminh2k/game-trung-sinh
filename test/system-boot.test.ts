import { describe, expect, it } from 'vitest'
import { newGame } from '../src/engine/constants'
import { applyAction } from '../src/engine/reducer'
import { canChooseSystem, activeSystem } from '../src/engine/system-runtime'

describe('S05 System Boot & Reducer Wiring', () => {
  it('choosing a System sets systemId once', () => {
    let state = newGame('test-seed-boot')
    expect(state.systemId).toBeNull()
    expect(canChooseSystem(state, 'sys_battle')).toBe(true)
    expect(canChooseSystem(state, 'sys_unknown')).toBe(false)

    // Advance story to system selection
    const res1 = applyAction(state, { kind: 'story_choice', choiceId: 'accept_system_mercy' })
    expect(res1.state.flags.story_scene).toBe('scene_system_selection')
    state = res1.state

    // Pick Battle System
    const res2 = applyAction(state, { kind: 'story_choice', choiceId: 'pick_sys_battle' })
    expect(res2.state.systemId).toBe('sys_battle')
    expect(activeSystem(res2.state)?.id).toBe('sys_battle')
    expect(res2.events.some((e) => e.type === 'SYSTEM_CHOSEN' && e.systemId === 'sys_battle')).toBe(true)
    state = res2.state

    // Second System choice fails hard-lock
    const res3 = applyAction(state, { kind: 'story_choice', choiceId: 'pick_sys_alchemy' })
    expect(res3.events).toContainEqual({ type: 'ERROR', code: 'STORY_CHOICE_UNAVAILABLE' })
    expect(res3.state.systemId).toBe('sys_battle')
  })

  it('refusing system keeps systemId null forever', () => {
    const state = newGame('test-seed-refuse')
    const res1 = applyAction(state, { kind: 'story_choice', choiceId: 'refuse_system' })
    expect(res1.state.systemId).toBeNull()
    expect(res1.state.flags.system_refused).toBe(true)
    expect(res1.events.some((e) => e.type === 'SYSTEM_CHOSEN')).toBe(false)
  })

  it('accepts and turns in system quests from panel without location gate', () => {
    let state = newGame('test-seed-quest')
    state = { ...state, systemId: 'sys_battle', inventory: { beast_fang: 2 } }

    const acceptRes = applyAction(state, { kind: 'system_accept_quest', questId: 'q_sys_battle_01' })
    expect(acceptRes.state.quests['q_sys_battle_01']?.status).toBe('active')
    state = acceptRes.state

    const turnInRes = applyAction(state, { kind: 'system_turn_in_quest', questId: 'q_sys_battle_01' })
    expect(turnInRes.state.quests['q_sys_battle_01']?.status).toBe('completed')
    expect(turnInRes.state.player.gold).toBe(state.player.gold + 45)
    expect(turnInRes.state.player.spiritStones).toBe((state.player.spiritStones ?? 0) + 1)
  })
})
