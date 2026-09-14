import { describe, expect, it } from 'vitest'
import { applyAction, narrateLine, newGame, readDeathCause, validateGameState } from '../src/engine'
import { TIME_SLOTS } from '../src/engine'
import type { GameState } from '../src/engine'
import { deathKind, describeDeath, legacyPointsFor } from '../src/content/death-legacy'
import { navTo } from './test-utils'

function exposeToDangerNode(state: GameState): GameState {
  state = navTo(state, 'spirit_beast_ridge')
  let guard = 0
  // 2026-09 clock: the once-per-day throttle only protects repeated REGION
  // border crossings. Authored DANGER NODES stay hazardous on every visit, so
  // stepping onto the claw-stone and back is a deterministic death vector.
  while (state.player.alive && guard < 30) {
    const out = applyAction(state, { kind: 'move', direction: 'north' })
    state = out.state
    if (!state.player.alive) break
    state = applyAction(state, { kind: 'move', direction: 'south' }).state
    guard += 1
  }
  return state
}

function walkIntoRift(state: GameState): GameState {
  state = navTo(state, 'cursed_rift')
  // 2026-09 clock: an authored DANGER NODE is lethal on every visit, and the
  // east exit now crosses into sealed_cave. Lower HP under the rift-heart's
  // damage floor and take the single west step onto it — the death stamps
  // danger:cursed_rift deterministically.
  state = { ...state, player: { ...state.player, hp: 5 } }
  return applyAction(state, { kind: 'move', direction: 'west' }).state
}

describe('one-life terminal condition', () => {
  it('repeated danger exposure kills and locks the game', () => {
    let state = newGame('terminal-death')
    state = navTo(state, 'market')
    expect(state.player.alive).toBe(true)
    state = exposeToDangerNode(state)
    expect(state.player.alive).toBe(false)
    expect(state.player.hp).toBe(0)
    expect(state.terminal).toBe(true)
    expect(state.endingId).toBe('tragic_death')
  })

  it('every action after death returns TERMINAL and leaves state untouched', () => {
    let state = newGame('terminal-lock')
    state = exposeToDangerNode(state)
    expect(state.terminal).toBe(true)
    const snapshot = JSON.stringify(state)
    for (const action of [
      { kind: 'rest' },
      { kind: 'train' },
      { kind: 'move', direction: 'west' },
      { kind: 'draw_lottery' },
      { kind: 'free_text', raw: 'rest' },
    ] as const) {
      const result = applyAction(state, action)
      expect(
        result.events.some((e) => e.type === 'ERROR' && e.code === 'TERMINAL'),
      ).toBe(true)
      expect(JSON.stringify(result.state)).toBe(snapshot)
    }
  })

  it('restart from death begins a fresh life', () => {
    let state = newGame('terminal-restart')
    state = exposeToDangerNode(state)
    expect(state.terminal).toBe(true)
    const result = applyAction(state, { kind: 'restart', seed: 'fresh-life' })
    expect(result.events.some((e) => e.type === 'GAME_STARTED')).toBe(true)
    expect(result.state.terminal).toBe(false)
    expect(result.state.endingId).toBeNull()
    expect(result.state.seed).toBe('fresh-life')
    expect(result.state.player.alive).toBe(true)
  })
})

// Issue #18 — Positive Failure: death teaches, it does not erase.
describe('positive failure: death cause and legacy inheritance', () => {
  it('a danger death stamps its cause code on the dying state', () => {
    let state = newGame('cause-recorded')
    state = walkIntoRift(state)
    expect(state.player.alive).toBe(false)
    expect(typeof state.flags.death_cause).toBe('string')
    expect(String(state.flags.death_cause).startsWith('danger:')).toBe(true)
  })

  it('the reborn run inherits one attribute point from the fallen one', () => {
    let state = newGame('cause-restart')
    state = walkIntoRift(state)
    const result = applyAction(state, { kind: 'restart', seed: 'reborn-life' })
    expect(result.state.player.pendingAttributePoints).toBe(1)
    expect(result.state.flags.death_cause).toBeUndefined()
  })

  it('the legacy point must be spent before the new life can act', () => {
    let state = newGame('cause-gate')
    state = walkIntoRift(state)
    const reborn = applyAction(state, { kind: 'restart', seed: 'gated-life' }).state
    const blocked = applyAction(reborn, { kind: 'rest' })
    expect(blocked.events.some((e) => e.type === 'ERROR' && e.code === 'ATTRIBUTE_ALLOCATION_REQUIRED')).toBe(true)
    const spent = applyAction(reborn, { kind: 'allocate_attribute', attribute: 'body' })
    expect(spent.events.some((e) => e.type === 'ATTRIBUTE_ALLOCATED')).toBe(true)
    expect(spent.state.player.pendingAttributePoints).toBe(0)
    expect(spent.state.player.attrs.body).toBe(reborn.player.attrs.body + 1)
    expect(applyAction(spent.state, { kind: 'rest' }).events.some((e) => e.type === 'ERROR')).toBe(false)
  })

  it('a life that never died inherits nothing', () => {
    expect(newGame('clean-start').player.pendingAttributePoints).toBe(0)
    expect(legacyPointsFor(null)).toBe(0)
    expect(legacyPointsFor(undefined)).toBe(0)
    expect(legacyPointsFor('')).toBe(0)
  })

  it('a combat death stamps the enemy cause code', () => {
    let state = navTo(newGame('cause-combat'), 'misty_forest')
    state = applyAction(state, { kind: 'start_encounter' }).state
    expect(state.encounter?.enemyId).toBe('mist_boar')
    // Craft a near-death so the enemy's minimum-1 reply is guaranteed lethal.
    state = { ...state, player: { ...state.player, hp: 1 } }
    const result = applyAction(state, { kind: 'combat_defend' })
    expect(result.state.player.alive).toBe(false)
    expect(readDeathCause(result.state)).toBe('combat:mist_boar')
    // The narrator names the beast, never leaks the raw code, in both locales.
    const death = result.events.find((e) => e.type === 'DEATH')
    expect(death).toBeDefined()
    expect(narrateLine(death!, 'vi')).toContain('Trư Nha Sương')
    expect(narrateLine(death!, 'en')).toContain('Mist-Tusk Boar')
    expect(narrateLine(death!, 'vi')).not.toContain('combat:')
  })

  it('training no longer kills by dice variance (Issue #10)', () => {
    // Pre-#10, a healthy-looking HP pool could still hit 0 from the -6±2 drain.
    // The four-slot clock moves the exact rejection gate per slot (hpCost +
    // range + 1, from 7 at sáng to 14 at tối), so the test asserts the
    // slot-independent invariant: near-empty HP is refused, never fatal.
    for (const slot of TIME_SLOTS) {
      const base = { ...newGame('qi-probe-1'), timeOfDay: slot }
      const result = applyAction({ ...base, player: { ...base.player, hp: 1, qi: 10 } }, { kind: 'train' })
      expect(result.state.player.alive).toBe(true)
      expect(result.events).toContainEqual({ type: 'ERROR', code: 'INSUFFICIENT_HP' })
    }
    // qi_deviation remains a live, classifiable death cause (see below); #10
    // only removes training's ability to reach it, not its narration/legacy.
    expect(deathKind('qi_deviation')).toBe('qi_deviation')
  })

  it('the cause survives a save/reload roundtrip and reaches DeathScreen', () => {
    let state = newGame('cause-roundtrip')
    state = walkIntoRift(state)
    expect(state.player.alive).toBe(false)
    const reloaded = validateGameState(JSON.parse(JSON.stringify(state)))
    const cause = readDeathCause(reloaded)
    expect(cause).toBeTruthy()
    expect(String(cause).startsWith('danger:')).toBe(true)
    expect(describeDeath(String(cause), 'vi').subject).toBe('Khe Hở Nguyền Rủa')
  })

  it('each cause kind yields a localized report with a hint and a trait', () => {
    expect(deathKind('combat:mist_boar')).toBe('combat')
    expect(deathKind('danger:cursed_rift')).toBe('danger')
    expect(deathKind('qi_deviation')).toBe('qi_deviation')
    expect(deathKind('mystery')).toBe('unknown')

    const combat = describeDeath('combat:mist_boar', 'vi')
    expect(combat.subject.length).toBeGreaterThan(0)
    expect(combat.hintVi.length).toBeGreaterThan(0)
    expect(combat.hintEn.length).toBeGreaterThan(0)
    expect(combat.trait.attributePoints).toBe(1)

    const en = describeDeath('qi_deviation', 'en')
    expect(en.subject).toBe('')
    expect(en.hintEn).not.toBe(en.hintVi)
  })
})
