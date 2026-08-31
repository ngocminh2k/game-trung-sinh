import { describe, expect, it } from 'vitest'
import {
  BASIC_STRIKE_QI_COST,
  RETREAT_HP_COST,
  RETREAT_PROGRESS_COST,
  applyAction,
  newGame,
  parseFreeText,
  techniqueQiCost,
} from '../src/engine'
import type { GameState } from '../src/engine'
import { navTo } from './test-utils'

function encounterAtMistyForest(): GameState {
  let state = navTo(newGame('agency-combat'), 'misty_forest')
  state = applyAction(state, { kind: 'start_encounter' }).state
  return state
}

describe('encounter decision layer (design review 2026-08, Phase 1)', () => {
  it('charges a cheap qi price for the basic strike and leaves no guard', () => {
    const state = encounterAtMistyForest()
    const qiBefore = state.player.qi
    const result = applyAction(state, { kind: 'combat_attack' })
    expect(result.events.some((e) => e.type === 'QI_SPENT' && e.amount === BASIC_STRIKE_QI_COST)).toBe(true)
    expect(result.state.player.qi).toBe(qiBefore - BASIC_STRIKE_QI_COST)
    expect(result.events.some((e) => e.type === 'COMBAT_HIT' && e.actor === 'player')).toBe(true)
  })

  it('rejects any strike the player cannot pay for, but defend stays free', () => {
    let state = encounterAtMistyForest()
    state = { ...state, player: { ...state.player, qi: 0 } }
    const broke = applyAction(state, { kind: 'combat_attack' })
    expect(broke.events).toEqual([{ type: 'ERROR', code: 'INSUFFICIENT_QI' }])
    const defended = applyAction(state, { kind: 'combat_defend' })
    expect(defended.events.some((e) => e.type === 'COMBAT_GUARDED')).toBe(true)
    expect(defended.events.some((e) => e.type === 'QI_SPENT')).toBe(false)
  })

  it('a named technique costs more qi and softens the enemy reply via guard', () => {
    // Same seed, same rng positions: the only difference is the decision, so
    // the hp comparison isolates the guard effect of the technique strike.
    const basic = applyAction(encounterAtMistyForest(), { kind: 'combat_attack' }).state
    const technique = applyAction(encounterAtMistyForest(), {
      kind: 'combat_attack',
      techniqueId: 'basic_staff_form',
    }).state
    const cost = techniqueQiCost(2, 1)
    expect(cost).toBeGreaterThan(BASIC_STRIKE_QI_COST)
    expect(technique.player.qi).toBe(basic.player.qi - (cost - BASIC_STRIKE_QI_COST))
    const basicLoss = 100 - basic.player.hp
    const techniqueLoss = 100 - technique.player.hp
    expect(techniqueLoss).toBeLessThan(basicLoss)
    // The technique's guard absorbed the reply and was then consumed.
    expect(technique.encounter?.guard).toBe(0)
  })

  it('rejects techniques the player does not actually know, without touching the fight', () => {
    const state = encounterAtMistyForest()
    const snapshot = JSON.stringify(state)
    const unknown = applyAction(state, { kind: 'combat_attack', techniqueId: 'no_such_form' })
    expect(unknown.events).toEqual([{ type: 'ERROR', code: 'ITEM_UNAVAILABLE' }])
    const unlearned = applyAction(state, { kind: 'combat_attack', techniqueId: 'rift_step' })
    expect(unlearned.events).toEqual([{ type: 'ERROR', code: 'ITEM_UNAVAILABLE' }])
    expect(JSON.stringify(unknown.state)).toBe(snapshot)
    expect(JSON.stringify(unlearned.state)).toBe(snapshot)
  })

  it('worn gear moves both sides of the exchange — attack bonus lands, defense bonus absorbs', () => {
    const base = encounterAtMistyForest()
    const geared = {
      ...base,
      inventory: { ...base.inventory, bamboo_saber: 1, mistweave_vest: 1 },
      equipment: { ...base.equipment, weapon: 'bamboo_saber', robe: 'mistweave_vest' },
    }
    // Same seed, same rng positions: the only difference is the bonus math.
    const plainEnemyHp = applyAction(base, { kind: 'combat_attack' }).state.encounter?.hp ?? 0
    const gearedEnemyHp = applyAction(geared, { kind: 'combat_attack' }).state.encounter?.hp ?? 0
    expect(gearedEnemyHp).toBeLessThan(plainEnemyHp)
    const plainSelfHp = applyAction(base, { kind: 'combat_attack' }).state.player.hp
    const gearedSelfHp = applyAction(geared, { kind: 'combat_attack' }).state.player.hp
    expect(gearedSelfHp).toBeGreaterThan(plainSelfHp)
  })

  it('retreat always ends the fight, but costs hp, progress, and the rewards', () => {
    let state = encounterAtMistyForest()
    state = { ...state, player: { ...state.player, progress: 10 } }
    const hpBefore = state.player.hp
    const dayBefore = state.day
    const result = applyAction(state, { kind: 'combat_retreat' })
    expect(result.events).toEqual([
      { type: 'COMBAT_RETREATED', enemyId: 'mist_boar', hpCost: RETREAT_HP_COST, progressCost: RETREAT_PROGRESS_COST },
    ])
    expect(result.state.encounter).toBeNull()
    expect(result.state.player.hp).toBe(hpBefore - RETREAT_HP_COST)
    expect(result.state.player.progress).toBe(10 - RETREAT_PROGRESS_COST)
    expect(result.state.flags['retreated_mist_boar']).toBe(true)
    expect(result.state.day).toBe(dayBefore) // in-fight turns are not days
  })

  it('a dying player can always crawl away — retreat never kills', () => {
    const state = { ...encounterAtMistyForest(), player: { ...encounterAtMistyForest().player, hp: 1 } }
    const result = applyAction(state, { kind: 'combat_retreat' })
    expect(result.state.player.hp).toBe(1)
    expect(result.state.player.alive).toBe(true)
    expect(result.events[0]).toMatchObject({ type: 'COMBAT_RETREATED', hpCost: 0 })
  })

  it('rejects retreat outside an encounter', () => {
    const result = applyAction(newGame('retreat-nowhere'), { kind: 'combat_retreat' })
    expect(result.events).toEqual([{ type: 'ERROR', code: 'NOT_AT_LOCATION' }])
  })

  it('understands retreat in free text, in both languages', () => {
    expect(parseFreeText('rút lui')).toEqual({ ok: true, action: { kind: 'combat_retreat' } })
    expect(parseFreeText('run away')).toEqual({ ok: true, action: { kind: 'combat_retreat' } })
    expect(parseFreeText('bo chay')).toEqual({ ok: true, action: { kind: 'combat_retreat' } })
  })

  it('keeps the whole layer deterministic — same seed, same decisions, same outcome', () => {
    const script = [
      { kind: 'start_encounter' },
      { kind: 'combat_attack' },
      { kind: 'combat_attack', techniqueId: 'basic_staff_form' },
      { kind: 'combat_defend' },
    ] as const
    const play = (seed: string) => {
      let s = navTo(newGame(seed), 'misty_forest')
      for (const action of script) s = applyAction(s, { ...action }).state
      return JSON.stringify(s)
    }
    expect(play('agency-determinism')).toBe(play('agency-determinism'))
    expect(play('agency-determinism-2')).not.toBe(play('agency-determinism'))
  })
})
