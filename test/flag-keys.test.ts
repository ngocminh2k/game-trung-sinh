import { describe, expect, it } from 'vitest'
import { FLAG_KEYS, type FlagKey } from '../src/content/flag-keys'

describe('FLAG_KEYS', () => {
  it('is a non-empty readonly tuple of unique string literals', () => {
    expect(FLAG_KEYS.length).toBeGreaterThan(0)
    const unique = new Set(FLAG_KEYS)
    expect(unique.size).toBe(FLAG_KEYS.length)
    for (const key of FLAG_KEYS) expect(typeof key).toBe('string')
  })

  it('includes the flags the reducer references by literal', () => {
    // The reducer was refactored to import these as named handles; if any of
    // them disappears here, the destructure silently becomes undefined and the
    // runtime flags break — this guard catches that at test time.
    const required: FlagKey[] = [
      'movedOnce',
      'night_deadline',
      'night_deadline_cleared',
      'night_forgotten',
      'village_silent',
      'storage_locked',
      'region_locked',
      'seen_cave',
      'story_bao_paid',
      'story_meihua_betrayed',
      'story_ha_bound',
      'crooked_circulation',
    ]
    for (const key of required) expect(FLAG_KEYS).toContain(key)
  })

  it('FlagKey type round-trips every member of FLAG_KEYS', () => {
    // Compile-time check: every entry in the tuple must also be assignable to
    // the derived FlagKey union. If a member is misnamed, TS fails to compile
    // this test file.
    const keys: FlagKey[] = [...FLAG_KEYS]
    expect(keys).toEqual([...FLAG_KEYS])
  })
})
