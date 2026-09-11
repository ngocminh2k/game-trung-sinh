import { describe, expect, it } from 'vitest'
import { GAME_STATE_VERSION } from '../src/engine/constants'
import { newGame } from '../src/engine'
import { loadSession, saveSession } from '../src/ui/session'

describe('browser game session', () => {
  it('round-trips the deterministic state and the chosen language', () => {
    const storage = new Map<string, string>()
    const game = newGame('ui-save-seed')

    saveSession(storage, { game, locale: 'en', chronicle: ['A new tale begins.'] })

    // The schema parser fills migration-safe expansion defaults that newGame
    // intentionally omits, so the round-trip is compared field-by-field.
    const loaded = loadSession(storage)
    expect(loaded).not.toBeNull()
    expect(loaded!.locale).toBe('en')
    expect(loaded!.chronicle).toEqual(['A new tale begins.'])
    // The schema parser fills migration-safe defaults (spiritStones/poison/
    // skillPoints) that newGame omits, so compare the authored fields plus the
    // safe defaults. silver is now authored by newGame (START_SILVER).
    const p = loaded!.game.player
    expect({ ...p, spiritStones: undefined, poison: undefined, skillPoints: undefined }).toEqual(game.player)
    expect(p.silver).toBe(20)
    expect(p.spiritStones).toBe(0)
    expect(loaded!.game.rng).toBe(game.rng)
    expect(loaded!.game.day).toBe(game.day)
  })

  it('rejects malformed or stale saved data instead of letting it corrupt a run', () => {
    const storage = new Map<string, string>([['phe-can-ky:save:v1', '{not-json']])

    expect(loadSession(storage)).toBeNull()
  })

  // Issue 8: a pre-v1 save (no `version`, none of the optional expansion
  // fields) must load through the real browser path, not be dropped by
  // parseSession's catch. migrate() walks it to GAME_STATE_VERSION and the
  // schema fills defaults, so an old character resumes exactly where it was.
  it('migrates a legacy v0 save end-to-end instead of returning null', () => {
    const v0Game = {
      seed: 'legacy-hero',
      rng: 4242,
      day: 12,
      player: { hp: 80, qi: 40, gold: 250, attrs: { body: 5, mind: 6, charm: 4, luck: 3 }, stage: 2, realmLevel: 3, progress: 55, pendingAttributePoints: 1, posX: 2, posY: 4, locationId: 'market', alive: true },
      spiritRoot: { kind: 'defective', elementVi: 'Mộc', elementEn: 'Wood', efficiency: 0.5 },
      inventory: { herb_hong_silk: 3 },
      storage: {},
      flags: {},
      quests: {},
      achievements: [],
      talents: [],
      techniques: {},
      equipment: { weapon: 'wooden_staff', robe: null, accessory: null },
      encounter: null,
      lastLotteryDay: null,
      corrections: 0,
      terminal: false,
      endingId: null,
    }
    const storage = new Map<string, string>([
      ['phe-can-ky:save:v1', JSON.stringify({ game: v0Game, locale: 'vi', chronicle: ['Chương cũ.'] })],
    ])

    const loaded = loadSession(storage)
    expect(loaded).not.toBeNull()
    // Chain ran: the version-less payload is now at the current version.
    expect(loaded!.game.version).toBe(GAME_STATE_VERSION)
    // Authored fields survived the migration untouched.
    expect(loaded!.game.seed).toBe('legacy-hero')
    expect(loaded!.game.day).toBe(12)
    expect(loaded!.game.player.gold).toBe(250)
    expect(loaded!.game.player.locationId).toBe('market')
    expect(loaded!.game.player.posY).toBe(4)
    // Schema filled every expansion default a v0 save never had.
    expect(loaded!.game.player.silver).toBe(0)
    expect(loaded!.game.player.spiritStones).toBe(0)
    expect(loaded!.game.companionId).toBeNull()
    expect(loaded!.game.unlockedSkills).toEqual([])
    expect(loaded!.game.rememberedNames).toEqual([])
  })
})
