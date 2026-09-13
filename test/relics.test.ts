import { describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import type { GameState } from '../src/engine'
import { chooseInheritedRelic } from '../src/engine/relics'

function stripped(): GameState {
  const s = newGame('relic-fixture')
  s.equipment = { weapon: null, robe: null, accessory: null }
  s.inventory = { spirit_herb: 1 }
  return s
}

describe('chooseInheritedRelic (issue #14 — AC2)', () => {
  it('returns the strongest equipped item when an accessory is the best owned', () => {
    const s = newGame('relic-accessory')
    s.equipment.accessory = 'jade_charm' // def 1, qi 5 => power 6
    expect(chooseInheritedRelic(s)).toBe('jade_charm')
  })

  it('prefers a higher-power inventory item over the default starting gear', () => {
    const s = newGame('relic-inventory')
    s.inventory = { spirit_herb: 1, cloudpiercer_spear: 1 } // atk 7, def 1 => power 8
    expect(chooseInheritedRelic(s)).toBe('cloudpiercer_spear')
  })

  it('returns null when the player owns nothing equippable', () => {
    const s = stripped()
    expect(chooseInheritedRelic(s)).toBeNull()
  })

  it('falls back to a starting relic so a fresh run still inherits ≥1 relic', () => {
    const s = newGame('relic-default')
    // Only default gear owned — wooden_staff (power 2) beats tattered_robe (power 1).
    expect(chooseInheritedRelic(s)).toBe('wooden_staff')
  })
})
