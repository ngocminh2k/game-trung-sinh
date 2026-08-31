import { describe, expect, it } from 'vitest'
import { SUBLAYERS, sublayerFor, type Branch } from '../src/content/sublayers'

const BRANCHES: Branch[] = ['mercy', 'path', 'blade', 'rootless']

describe('SUBLAYERS data', () => {
  it('has exactly 12 sublayers', () => {
    expect(SUBLAYERS).toHaveLength(12)
  })

  it('has exactly 3 tiers per branch at minNames 0/100/200', () => {
    for (const branch of BRANCHES) {
      const tiers = SUBLAYERS.filter((sub) => sub.branch === branch)
      expect(tiers, branch).toHaveLength(3)
      expect(tiers.map((sub) => sub.minNames).sort((a, b) => a - b), branch).toEqual([0, 100, 200])
    }
  })

  it('gives the highest tier a requireFlag in every branch', () => {
    for (const branch of BRANCHES) {
      const top = SUBLAYERS.filter((sub) => sub.branch === branch).find((sub) => sub.minNames === 200)
      expect(top?.requireFlag, branch).toBeTruthy()
    }
  })

  it('has bilingual names and epilogues for every sublayer', () => {
    for (const sub of SUBLAYERS) {
      expect(sub.nameVi.trim().length, sub.id).toBeGreaterThan(0)
      expect(sub.nameEn.trim().length, sub.id).toBeGreaterThan(0)
      expect(sub.epilogueVi.trim().length, sub.id).toBeGreaterThan(0)
      expect(sub.epilogueEn.trim().length, sub.id).toBeGreaterThan(0)
    }
  })

  it('has unique ids', () => {
    expect(new Set(SUBLAYERS.map((sub) => sub.id)).size).toBe(12)
  })
})

describe('sublayerFor', () => {
  it('picks tier 0 at zero remembered names', () => {
    const sub = sublayerFor('mercy', 0, {})
    expect(sub.id).toBe('sublayer_mercy_0')
  })

  it('stays below a tier until minNames is reached', () => {
    expect(sublayerFor('path', 99, {}).id).toBe('sublayer_path_0')
    expect(sublayerFor('path', 100, {}).id).toBe('sublayer_path_100')
    expect(sublayerFor('path', 199, {}).id).toBe('sublayer_path_100')
  })

  it('requires the flag for the 200 tier and falls back without it', () => {
    expect(sublayerFor('rootless', 200, {}).id).toBe('sublayer_rootless_100')
    expect(sublayerFor('rootless', 200, { system_refused: false }).id).toBe('sublayer_rootless_100')
    expect(sublayerFor('rootless', 200, { system_refused: true }).id).toBe('sublayer_rootless_200')
    expect(sublayerFor('rootless', 500, { system_refused: 1 }).id).toBe('sublayer_rootless_200')
  })

  it('works for all four branches', () => {
    expect(sublayerFor('mercy', 250, { vow_kept: 'yes' }).id).toBe('sublayer_mercy_200')
    expect(sublayerFor('blade', 100, {}).id).toBe('sublayer_blade_100')
    expect(sublayerFor('blade', 250, { story_mirror_stolen: true }).id).toBe('sublayer_blade_200')
    expect(sublayerFor('path', 250, { story_names_recorded: true }).id).toBe('sublayer_path_200')
  })

  it('is pure: does not mutate flags and returns stable results', () => {
    const flags: Record<string, boolean | number | string> = { system_refused: true }
    const snapshot = { ...flags }
    const first = sublayerFor('rootless', 200, flags)
    const second = sublayerFor('rootless', 200, flags)
    expect(flags).toEqual(snapshot)
    expect(first).toBe(second)
  })
})