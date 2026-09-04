import { describe, expect, it } from 'vitest'
import { ENDINGS, SYSTEMS, TECHNIQUES } from '../src/content'
import { applyAction, evaluateEndingId, MAX_STAGE, newGame } from '../src/engine'
import type { GameState } from '../src/engine'

describe('system mechanical divergence (P1-1)', () => {
  it('every System defines a matching signature technique with system_<id>_signature id', () => {
    expect(SYSTEMS).toHaveLength(10)
    for (const system of SYSTEMS) {
      const expectedId = `system_${system.id.replace('sys_', '')}_signature`
      const technique = TECHNIQUES.find((entry) => entry.id === expectedId)
      expect(technique, `missing technique ${expectedId} for system ${system.id}`).toBeDefined()
    }
  })

  it('every System defines a matching ending with system_<id>_end id', () => {
    expect(SYSTEMS).toHaveLength(10)
    for (const system of SYSTEMS) {
      const expectedId = `system_${system.id.replace('sys_', '')}_end`
      const ending = ENDINGS.find((entry) => entry.id === expectedId)
      expect(ending, `missing ending ${expectedId} for system ${system.id}`).toBeDefined()
    }
  })

  it('doLearnTechnique rejects system_* techniques unless systemId matches', () => {
    // Battle system + wrong technique — must fail.
    const baseBattle = newGame('sys-div-battle', { systemId: 'sys_battle' })
    const mismatch = applyAction(baseBattle, { kind: 'learn_technique', techniqueId: 'system_alchemy_signature' })
    expect(mismatch.events.some((event) => event.type === 'ERROR' && event.code === 'ITEM_UNAVAILABLE')).toBe(true)
    // Battle system + matching technique with NO source item — fails for the
    // (correct) source-missing reason, proving the gate ran past the system check.
    const matchingButNoItem = applyAction(baseBattle, { kind: 'learn_technique', techniqueId: 'system_battle_signature' })
    expect(matchingButNoItem.events.some((event) => event.type === 'ERROR')).toBe(true)
    expect(matchingButNoItem.events.some((event) => event.type === 'TECHNIQUE_LEARNED')).toBe(false)
  })

  it('doLearnTechnique accepts a matching system technique once the source item is held', () => {
    const base: GameState = {
      ...newGame('sys-div-accept', { systemId: 'sys_battle' }),
      // Stage 2 is required by the technique; force it directly so we don't
      // have to grind past the deadline to validate the gate.
      player: { ...newGame('sys-div-accept', { systemId: 'sys_battle' }).player, stage: 2 },
      inventory: { beast_fang: 1 },
    }
    const result = applyAction(base, { kind: 'learn_technique', techniqueId: 'system_battle_signature' })
    expect(result.events.some((event) => event.type === 'TECHNIQUE_LEARNED')).toBe(true)
    expect(result.state.techniques['system_battle_signature']).toBe(1)
  })

  it('evaluateEndingId fires the matching system_*_end at max stage with the signature technique learned', () => {
    const base: GameState = {
      ...newGame('sys-div-ending', { systemId: 'sys_battle' }),
      player: { ...newGame('sys-div-ending', { systemId: 'sys_battle' }).player, stage: MAX_STAGE },
      techniques: { ...newGame('sys-div-ending', { systemId: 'sys_battle' }).techniques, system_battle_signature: 1 },
    }
    expect(evaluateEndingId(base)).toBe('system_battle_end')
  })

  it('evaluateEndingId stays null when the signature technique is not learned', () => {
    const base: GameState = {
      ...newGame('sys-div-no-tech', { systemId: 'sys_battle' }),
      player: { ...newGame('sys-div-no-tech', { systemId: 'sys_battle' }).player, stage: MAX_STAGE },
    }
    expect(evaluateEndingId(base)).toBeNull()
  })
})