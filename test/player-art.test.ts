import { describe, expect, it } from 'vitest'
import { PLAYER_ACTION_KEYS, playerArtFor } from '../src/ui/playerArt'

describe('player action art registry', () => {
  it('exposes a stable raster asset for every supported action pose', () => {
    expect(PLAYER_ACTION_KEYS).toEqual([
      'idle',
      'move',
      'talk',
      'gather',
      'cultivate',
      'rest',
      'use-item',
      'combat-attack',
      'combat-defend',
      'hurt',
      'death',
    ])

    for (const action of PLAYER_ACTION_KEYS) {
      expect(playerArtFor(action)).toMatch(/\.png$/)
    }
  })
})
