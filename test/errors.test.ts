import { describe, expect, it } from 'vitest'
import { ERROR_CODES, applyAction, newGame } from '../src/engine'
import type { Action, GameState } from '../src/engine'
import { EN, VI, flattenDict, t } from '../src/i18n'
import { hasError, navTo } from './test-utils'

describe('error code localization coverage', () => {
  it('every ErrorCode maps to a real errors.* key in both vi and en', () => {
    const viKeys = new Set(flattenDict(VI))
    const enKeys = new Set(flattenDict(EN))
    expect(ERROR_CODES.length).toBeGreaterThan(0)
    for (const code of ERROR_CODES) {
      const key = `errors.${code}`
      expect(viKeys.has(key), `${key} missing in vi`).toBe(true)
      expect(enKeys.has(key), `${key} missing in en`).toBe(true)
      // And the dictionaries resolve them to actual copy, not the raw key.
      expect(t('vi', key), `vi:${key}`).not.toBe(key)
      expect(t('en', key), `en:${key}`).not.toBe(key)
      expect(t('vi', key).length).toBeGreaterThan(0)
      expect(t('en', key).length).toBeGreaterThan(0)
    }
  })
})

function patched(base: GameState, patch: Partial<GameState['player']>): GameState {
  return { ...base, player: { ...base.player, ...patch } }
}

describe('previously-uncovered error paths surface ERROR events with codes', () => {
  it('moving into impassable terrain is MOVE_BLOCKED', () => {
    let state = newGame('err-blocked')
    state = navTo(state, 'sect') // south of the sect is mountain
    const result = applyAction(state, { kind: 'move', direction: 'south' })
    expect(hasError(result.events, 'MOVE_BLOCKED')).toBe(true)
  })

  it('buying without gold is INSUFFICIENT_GOLD', () => {
    let state = patched(newGame('err-gold'), { gold: 0 })
    state = navTo(state, 'market')
    const result = applyAction(state, { kind: 'buy', itemId: 'pill_hp' })
    expect(hasError(result.events, 'INSUFFICIENT_GOLD')).toBe(true)
  })

  it('training without qi is INSUFFICIENT_QI', () => {
    const state = patched(newGame('err-qi'), { qi: 5 })
    const result = applyAction(state, { kind: 'train' })
    expect(hasError(result.events, 'INSUFFICIENT_QI')).toBe(true)
  })

  it('selling more than held is NO_ITEM', () => {
    let state = newGame('err-noitem')
    state = navTo(state, 'market')
    const first = applyAction(state, { kind: 'sell', itemId: 'spirit_herb' })
    expect(hasError(first.events, 'NO_ITEM')).toBe(false)
    const second = applyAction(first.state, { kind: 'sell', itemId: 'spirit_herb' })
    expect(hasError(second.events, 'NO_ITEM')).toBe(true)
  })

  it('using a non-consumable is ITEM_NOT_USABLE', () => {
    const result = applyAction(newGame('err-notusable'), {
      kind: 'use_item',
      itemId: 'warding_talisman',
    })
    expect(hasError(result.events, 'ITEM_NOT_USABLE')).toBe(true)
  })

  it('buying an unstocked item is ITEM_UNAVAILABLE', () => {
    let state = newGame('err-unavailable')
    state = navTo(state, 'market')
    const result = applyAction(state, { kind: 'buy', itemId: 'old_manual' })
    expect(hasError(result.events, 'ITEM_UNAVAILABLE')).toBe(true)
  })

  it('non-positive store quantity is INVALID_QTY', () => {
    let state = newGame('err-invalidqty')
    state = navTo(state, 'sect')
    const result = applyAction(state, { kind: 'store', itemId: 'spirit_herb', qty: 0 })
    expect(hasError(result.events, 'INVALID_QTY')).toBe(true)
  })

  it('withdrawing an item never stored is STORAGE_EMPTY', () => {
    let state = newGame('err-storageempty')
    state = navTo(state, 'sect')
    const result = applyAction(state, { kind: 'withdraw', itemId: 'pill_hp', qty: 1 })
    expect(hasError(result.events, 'STORAGE_EMPTY')).toBe(true)
  })

  it('unknown quest id is QUEST_UNKNOWN', () => {
    const result = applyAction(newGame('err-questunknown'), {
      kind: 'accept_quest',
      questId: 'q_does_not_exist',
    })
    expect(hasError(result.events, 'QUEST_UNKNOWN')).toBe(true)
  })

  it('completing an unaccepted quest is QUEST_WRONG_STATE', () => {
    const result = applyAction(newGame('err-queststate'), {
      kind: 'complete_quest',
      questId: 'q_herb_delivery',
    })
    expect(hasError(result.events, 'QUEST_WRONG_STATE')).toBe(true)
  })

  it('talking to an unknown npc is NPC_UNKNOWN; an absent one is NPC_NOT_HERE', () => {
    const unknown = applyAction(newGame('err-npcunknown'), {
      kind: 'talk',
      npcId: 'n_nobody',
    })
    expect(hasError(unknown.events, 'NPC_UNKNOWN')).toBe(true)

    const absent = applyAction(newGame('err-npchere'), {
      kind: 'talk',
      npcId: 'n_merchant_bao',
    })
    expect(absent.state.player.locationId).toBe('village')
    expect(hasError(absent.events, 'NPC_NOT_HERE')).toBe(true)
  })

  it('rejected actions leave the game state untouched', () => {
    let state = newGame('err-nochange')
    state = navTo(state, 'sect')
    const snapshot = JSON.stringify(state)
    const attempts: Action[] = [
      { kind: 'move', direction: 'south' },
      { kind: 'withdraw', itemId: 'pill_hp', qty: 1 },
      { kind: 'talk', npcId: 'n_merchant_bao' },
    ]
    for (const action of attempts) {
      const result = applyAction(state, action)
      expect(JSON.stringify(result.state)).toBe(snapshot)
    }
  })
})
