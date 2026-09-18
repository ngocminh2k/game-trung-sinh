import { describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import {
  DEFAULT_GLOBAL_PROFILE,
  parseGlobalProfile,
  type GlobalProfile,
  recordTerminal,
} from '../src/engine/globalProfile'
import {
  canBuryRelic,
  buryRelic,
  canUnearthRelic,
  unearthRelic,
} from '../src/engine/relics'
import {
  hasBuriedRelicAt,
  getBuriedRelicHint,
} from '../src/engine/map'

describe('C3-13: Chôn Giấu Di Vật (Buried Relic)', () => {
  describe('GlobalProfile BuriedRelic schema & persistence', () => {
    it('initializes with null buriedRelic by default', () => {
      expect(DEFAULT_GLOBAL_PROFILE.buriedRelic).toBeNull()
    })

    it('parses valid buriedRelic from profile json', () => {
      const raw = {
        version: 1,
        unlockedEndingIds: [],
        unlockedAchievementIds: [],
        highestNgPlusLevel: 1,
        totalRuns: 2,
        inheritedRelicId: null,
        reincarnationPoints: 50,
        buriedRelic: {
          itemId: 'cloudpiercer_spear',
          locationId: 'misty_forest',
          x: 3,
          y: 4,
        },
      }
      const profile = parseGlobalProfile(raw)
      expect(profile.buriedRelic).toEqual({
        itemId: 'cloudpiercer_spear',
        locationId: 'misty_forest',
        x: 3,
        y: 4,
      })
    })

    it('preserves buriedRelic through recordTerminal across reincarnations', () => {
      const initial: GlobalProfile = {
        ...DEFAULT_GLOBAL_PROFILE,
        buriedRelic: {
          itemId: 'jade_charm',
          locationId: 'village',
          x: 2,
          y: 1,
        },
      }
      const next = recordTerminal(initial, 'mortal_harmony', [], 1, null, 10)
      expect(next.buriedRelic).toEqual({
        itemId: 'jade_charm',
        locationId: 'village',
        x: 2,
        y: 1,
      })
      expect(next.totalRuns).toBe(1)
    })
  })

  describe('buryRelic mechanics (relics.ts)', () => {
    it('canBuryRelic returns true only if player owns the item and is alive', () => {
      const s = newGame('bury-test')
      s.inventory = { cloudpiercer_spear: 1 }
      expect(canBuryRelic(s, 'cloudpiercer_spear')).toBe(true)
      expect(canBuryRelic(s, 'non_existent_item')).toBe(false)

      s.player.alive = false
      expect(canBuryRelic(s, 'cloudpiercer_spear')).toBe(false)
    })

    it('buryRelic removes item from inventory and records coordinates in GlobalProfile', () => {
      const s = newGame('bury-exec')
      s.inventory = { cloudpiercer_spear: 1, spirit_herb: 5 }
      s.player.locationId = 'misty_forest'
      s.player.posX = 3
      s.player.posY = 5

      const result = buryRelic(s, DEFAULT_GLOBAL_PROFILE, 'cloudpiercer_spear')
      expect(result).not.toBeNull()
      if (!result) return

      // Inventory removed
      expect(result.state.inventory.cloudpiercer_spear).toBeUndefined()
      expect(result.state.inventory.spirit_herb).toBe(5)

      // Profile updated
      expect(result.profile.buriedRelic).toEqual({
        itemId: 'cloudpiercer_spear',
        locationId: 'misty_forest',
        x: 3,
        y: 5,
      })
    })

    it('buryRelic returns null if player does not own item', () => {
      const s = newGame('bury-fail')
      s.inventory = {}
      const result = buryRelic(s, DEFAULT_GLOBAL_PROFILE, 'cloudpiercer_spear')
      expect(result).toBeNull()
    })
  })

  describe('unearthRelic mechanics (relics.ts & map.ts)', () => {
    it('canUnearthRelic returns false if no relic buried', () => {
      const s = newGame('unearth-none')
      expect(canUnearthRelic(s, DEFAULT_GLOBAL_PROFILE)).toBe(false)
    })

    it('canUnearthRelic returns false if player is at wrong location or coordinates', () => {
      const s = newGame('unearth-wrong-pos')
      s.player.locationId = 'village'
      s.player.posX = 1
      s.player.posY = 1

      const profile: GlobalProfile = {
        ...DEFAULT_GLOBAL_PROFILE,
        buriedRelic: {
          itemId: 'cloudpiercer_spear',
          locationId: 'village',
          x: 2,
          y: 3,
        },
      }

      // Wrong coordinate
      expect(canUnearthRelic(s, profile)).toBe(false)

      // Wrong location
      s.player.posX = 2
      s.player.posY = 3
      s.player.locationId = 'misty_forest'
      expect(canUnearthRelic(s, profile)).toBe(false)

      // Exact match
      s.player.locationId = 'village'
      expect(canUnearthRelic(s, profile)).toBe(true)
    })

    it('unearthRelic adds item back to inventory and clears buriedRelic in profile', () => {
      const s = newGame('unearth-success')
      s.player.locationId = 'sealed_cave'
      s.player.posX = 4
      s.player.posY = 4
      s.inventory = {}

      const profile: GlobalProfile = {
        ...DEFAULT_GLOBAL_PROFILE,
        buriedRelic: {
          itemId: 'cloudpiercer_spear',
          locationId: 'sealed_cave',
          x: 4,
          y: 4,
        },
      }

      const res = unearthRelic(s, profile)
      expect(res).not.toBeNull()
      if (!res) return

      expect(res.unearthedItemId).toBe('cloudpiercer_spear')
      expect(res.state.inventory.cloudpiercer_spear).toBe(1)
      expect(res.profile.buriedRelic).toBeNull()
    })
  })

  describe('map spatial detection & hints (map.ts)', () => {
    const profile: GlobalProfile = {
      ...DEFAULT_GLOBAL_PROFILE,
      buriedRelic: {
        itemId: 'phoenix_feather',
        locationId: 'misty_forest',
        x: 5,
        y: 2,
      },
    }

    it('hasBuriedRelicAt detects exact cell', () => {
      expect(hasBuriedRelicAt(profile, 'misty_forest', 5, 2)).toBe(true)
      expect(hasBuriedRelicAt(profile, 'misty_forest', 5, 3)).toBe(false)
      expect(hasBuriedRelicAt(profile, 'village', 5, 2)).toBe(false)
      expect(hasBuriedRelicAt(null, 'misty_forest', 5, 2)).toBe(false)
    })

    it('getBuriedRelicHint provides distance when in same region', () => {
      const hintSame = getBuriedRelicHint(profile, 'misty_forest', 2, 2)
      expect(hintSame).not.toBeNull()
      expect(hintSame?.isSameLocation).toBe(true)
      expect(hintSame?.distance).toBe(3) // |5-2| + |2-2| = 3

      const hintDiff = getBuriedRelicHint(profile, 'village', 0, 0)
      expect(hintDiff).not.toBeNull()
      expect(hintDiff?.isSameLocation).toBe(false)
      expect(hintDiff?.locationId).toBe('misty_forest')

      expect(getBuriedRelicHint(null, 'village', 0, 0)).toBeNull()
    })
  })
})
