import { describe, expect, it } from 'vitest'
import { applyAction, newGame as engineNewGame } from '../src/engine'
import type { GameState } from '../src/engine'
import { newGame } from './test-utils'

/** test-utils newGame already completes boot with the Battle System active. */
function battleGame(seed: string): GameState {
  return newGame(seed)
}

/** Rootless run: mercy contract accepted, then every protocol refused (canon §3). */
function rootlessGame(seed: string): GameState {
  let game = applyAction(engineNewGame(seed), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
  game = applyAction(game, { kind: 'story_choice', choiceId: 'refuse_all' }).state
  return game
}

function lastQueued(state: GameState): { id: string; vars: Record<string, string | number> } | undefined {
  const queue = state.systemQueue ?? []
  return queue[queue.length - 1]
}

function transition(state: GameState, action: Parameters<typeof applyAction>[1]): { state: GameState; errored: boolean; code?: string } {
  const result = applyAction(state, action)
  const error = result.events.find((event) => event.type === 'ERROR')
  return { state: result.state, errored: error !== undefined, code: error?.type === 'ERROR' ? error.code : undefined }
}

describe('system notifications (T14 producers, canon §3)', () => {
  it('queues the quest-loaded announcement when a system quest is accepted', () => {
    const { state, errored } = transition(battleGame('sys-notify-accept'), { kind: 'system_accept_quest', questId: 'q_sys_battle_01' })
    expect(errored).toBe(false)
    const entry = lastQueued(state)
    expect(entry?.id).toBe('sys_quest_loaded')
    expect(entry?.vars.days).toBe(2)
    expect(String(entry?.vars.quest ?? '')).toContain('Chiến Đấu I')
    expect(String(entry?.vars.questEn ?? '')).toContain('Battle I')
    expect(entry?.vars.objective).toBe('Giao nanh thú cho Hệ Thống.')
    expect(entry?.vars.objectiveEn).toBe('Deliver beast fangs to the System.')
  })

  it('queues the reward announcement with the exact amounts on turn-in', () => {
    const accepted = transition(battleGame('sys-notify-reward'), { kind: 'system_accept_quest', questId: 'q_sys_battle_01' })
    expect(accepted.errored).toBe(false)
    const staged: GameState = { ...accepted.state, inventory: { ...accepted.state.inventory, beast_fang: 3 } }
    const done = transition(staged, { kind: 'system_turn_in_quest', questId: 'q_sys_battle_01' })
    expect(done.errored).toBe(false)
    const entry = lastQueued(done.state)
    expect(entry?.id).toBe('sys_reward')
    expect(String(entry?.vars.reward ?? '')).toContain('45 vàng')
    expect(String(entry?.vars.rewardEn ?? '')).toContain('45 gold')
    expect(done.state.player.gold).toBe(accepted.state.player.gold + 45)
    expect(done.state.player.spiritStones).toBe((accepted.state.player.spiritStones ?? 0) + 1)
  })

  it('queues the authored dodge when the host presses on the System origin', () => {
    const base = battleGame('sys-notify-doubt')
    const state = { ...base, flags: { ...base.flags, story_scene: 'scene_system_doubt' } }
    const result = transition(state, { kind: 'story_choice', choiceId: 'ask_system_origin' })
    expect(result.errored).toBe(false)
    expect(lastQueued(result.state)?.id).toBe('sys_dodge')
  })

  it('stays silent when the system is refused', () => {
    const refused = rootlessGame('sys-notify-refused')
    expect(refused.flags.system_refused).toBe(true)
    expect(refused.systemQueue ?? []).toEqual([])
    // Advancing the story must not conjure System notifications either.
    const advanced = transition(refused, { kind: 'story_choice', choiceId: 'study_letter' })
    expect(advanced.errored).toBe(false)
    expect(advanced.state.systemQueue ?? []).toEqual([])
  })
})

describe('three-layer currency exchange (T02 economy)', () => {
  it('exchanges spirit stones for gold at 1:10 at the market', () => {
    const base = battleGame('convert-ls')
    const state = { ...base, player: { ...base.player, locationId: 'market', gold: 0, silver: 0, spiritStones: 2 } }
    const result = transition(state, { kind: 'convert_currency', from: 'spiritStone', qty: 1 })
    expect(result.errored).toBe(false)
    expect(result.state.player.gold).toBe(10)
    expect(result.state.player.spiritStones).toBe(1)
  })

  it('exchanges silver for gold at 10:1 and rejects invalid conversions', () => {
    const base = battleGame('convert-silver')
    const state = { ...base, player: { ...base.player, locationId: 'market', gold: 0, silver: 25, spiritStones: 0 } }
    const ok = transition(state, { kind: 'convert_currency', from: 'silver', qty: 1 })
    expect(ok.errored).toBe(false)
    expect(ok.state.player.gold).toBe(1)
    expect(ok.state.player.silver).toBe(15)
    const badQty = transition(state, { kind: 'convert_currency', from: 'silver', qty: 0 })
    expect(badQty.code).toBe('INVALID_QTY')
    const poor = transition({ ...state, player: { ...state.player, silver: 5 } }, { kind: 'convert_currency', from: 'silver', qty: 1 })
    expect(poor.code).toBe('INSUFFICIENT_SILVER')
    const away = transition(base, { kind: 'convert_currency', from: 'silver', qty: 1 })
    expect(away.code).toBe('NOT_AT_LOCATION')
  })

  it('covers a gold shortfall from silver when buying at the market', () => {
    const base = battleGame('buy-silver')
    const state = { ...base, player: { ...base.player, locationId: 'market', gold: 0, silver: 400, stage: 2 } }
    const result = transition(state, { kind: 'buy', itemId: 'pill_qi' })
    expect(result.errored).toBe(false)
    expect(result.state.player.gold).toBe(0)
    expect(result.state.player.silver ?? 0).toBeLessThan(400)
    expect(result.state.inventory['pill_qi']).toBe(1)
  })

  it('still rejects a buy neither currency can cover', () => {
    const base = battleGame('buy-broke')
    const state = { ...base, player: { ...base.player, locationId: 'market', gold: 0, silver: 10, stage: 2 } }
    const result = transition(state, { kind: 'buy', itemId: 'pill_qi' })
    expect(result.code).toBe('INSUFFICIENT_GOLD')
  })
})
