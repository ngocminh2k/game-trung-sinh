// T13 — save compatibility. A pre-x20 save that omits every new expansion
// field (silver, spiritStones, rememberedNames, companionId, systemQueue)
// still parses through validateGameState and receives safe defaults.
// NOTE: systemId is intentionally excluded — it is an S02 system-layer
// field (docs/plans/system-layer/tasks/S02-state-schema.md) that ships
// after T13 and does not exist in the current schema yet.
import { describe, expect, it } from 'vitest'
import { validateGameState } from '../src/engine'
import { GAME_STATE_VERSION } from '../src/engine/constants'

const LEGACY_SAVE = {
  version: 1,
  seed: 'pre-x20',
  rng: 1,
  day: 4,
  player: {
    hp: 90,
    qi: 60,
    gold: 60,
    attrs: { body: 3, mind: 4, charm: 3, luck: 2 },
    stage: 0,
    progress: 0,
    posX: 3,
    posY: 3,
    locationId: 'village',
    alive: true,
  },
  spiritRoot: { kind: 'defective' as const, elementVi: 'Mộc', elementEn: 'Wood', efficiency: 0.5 },
  inventory: { spirit_herb: 1 },
  storage: {},
  flags: {},
  quests: {},
  achievements: [],
  lastLotteryDay: null,
  corrections: 0,
  terminal: false,
  endingId: null,
}

describe('save compatibility (T13)', () => {
  it('pins the game-state version to 1', () => {
    expect(GAME_STATE_VERSION).toBe(1)
  })

  it('gives pre-x20 saves safe defaults for every new expansion field', () => {
    const restored = validateGameState(LEGACY_SAVE)
    expect(restored.player.silver).toBe(0)
    expect(restored.player.spiritStones).toBe(0)
    expect(restored.rememberedNames).toEqual([])
    expect(restored.companionId).toBeNull()
    expect(restored.systemQueue).toEqual([])
  })

  it('keeps the legacy save data intact through the migration', () => {
    const restored = validateGameState(LEGACY_SAVE)
    expect(restored.version).toBe(1)
    expect(restored.seed).toBe('pre-x20')
    expect(restored.day).toBe(4)
    expect(restored.player.hp).toBe(90)
    expect(restored.player.gold).toBe(60)
    expect(restored.player.locationId).toBe('village')
    expect(restored.inventory.spirit_herb).toBe(1)
  })
})