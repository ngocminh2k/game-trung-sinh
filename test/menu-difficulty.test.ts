import { describe, expect, it } from 'vitest'
import { applyAction, damageMultiplier, validateGameState } from '../src/engine'
import { newGame } from '../src/engine/constants'

// Enemy/danger damage scales centrally by difficulty; 'balanced' must stay
// byte-identical to the pre-menu rules so every existing save replays exactly.
describe('difficulty (menu feature)', () => {
  it('defaults to balanced and keeps old saves valid via the schema default', () => {
    const game = newGame('diff-default')
    expect(game.difficulty).toBe('balanced')
    expect(game.systemId).toBeNull()

    const legacy = validateGameState({ ...newGame('diff-legacy'), difficulty: undefined })
    expect(legacy.difficulty).toBe('balanced')
  })

  it('story softens and hard sharpens the multiplier around balanced=1', () => {
    expect(damageMultiplier('balanced')).toBe(1)
    expect(damageMultiplier('story')).toBeLessThan(1)
    expect(damageMultiplier('hard')).toBeGreaterThan(1)
  })

  it('scales enemy strike damage deterministically without touching RNG', () => {
    const base = newGame('diff-combat', { difficulty: 'balanced' })
    const boot = (difficulty: 'story' | 'balanced' | 'hard') => ({
      ...newGame('diff-combat', { difficulty }),
      player: { ...base.player, locationId: 'misty_forest' },
      encounter: { enemyId: 'mist_boar', hp: 32, maxHp: 32, guard: 0 },
    })
    const strike = (difficulty: 'story' | 'balanced' | 'hard') =>
      applyAction(boot(difficulty), { kind: 'combat_attack' }).events
        .find((event) => event.type === 'COMBAT_HIT' && event.actor === 'enemy')

    const balanced = strike('balanced')?.type === 'COMBAT_HIT'
      ? (strike('balanced') as { amount: number }).amount
      : 0
    const story = strike('story')?.type === 'COMBAT_HIT'
      ? (strike('story') as { amount: number }).amount
      : 0
    const hard = strike('hard')?.type === 'COMBAT_HIT'
      ? (strike('hard') as { amount: number }).amount
      : 0
    // Same seed → same variance roll; only the multiplier differs.
    expect(story).toBeLessThanOrEqual(balanced)
    expect(hard).toBeGreaterThanOrEqual(balanced)
    expect(hard).toBeGreaterThan(story)
  })

  it('newGame options write systemId and the first scene without spending days', () => {
    const game = newGame('diff-menu-run', { systemId: 'sys_healer', difficulty: 'hard', storyScene: 'letter_at_dawn' })
    expect(game.systemId).toBe('sys_healer')
    expect(game.difficulty).toBe('hard')
    expect(game.flags.story_scene).toBe('letter_at_dawn')
    expect(game.day).toBe(1)
    // No boot-story actions exist in this run: the System contract is already signed.
    expect(game.flags.system_refused).toBeUndefined()
  })
})

// Device-local preferences: no credentials, safe parse, round-trip.
import { DEFAULT_SETTINGS, SETTINGS_KEY, loadSettings, saveSettings, type SessionStorage } from '../src/ui/session'

function memoryStorage(initial: Record<string, string> = {}): SessionStorage {
  const store = { ...initial }
  return {
    get: (key) => store[key],
    set: (key, value) => { store[key] = value },
    remove: (key) => { delete store[key] },
  }
}

describe('player settings (device-local)', () => {
  it('round-trips and falls back to defaults on missing/corrupt data', () => {
    const storage = memoryStorage()
    expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS)

    saveSettings(storage, { difficulty: 'hard', narrationEnabled: true, locale: 'en' })
    expect(loadSettings(storage)).toEqual({ difficulty: 'hard', narrationEnabled: true, locale: 'en' })

    const corrupt = memoryStorage({ [SETTINGS_KEY]: '{not json' })
    expect(loadSettings(corrupt)).toEqual(DEFAULT_SETTINGS)
    const partial = memoryStorage({ [SETTINGS_KEY]: JSON.stringify({ difficulty: 'story' }) })
    expect(loadSettings(partial)).toEqual({ difficulty: 'story', narrationEnabled: false, locale: 'vi' })
  })

  it('never persists secrets — only the on/off proxy intent', () => {
    const storage = memoryStorage()
    saveSettings(storage, { difficulty: 'balanced', narrationEnabled: true, locale: 'vi' })
    const raw = storage.get(SETTINGS_KEY) ?? ''
    expect(raw).not.toMatch(/AI_API_KEY|AI_BASE_URL|AI_MODEL|apiKey|sk-/)
  })
})
