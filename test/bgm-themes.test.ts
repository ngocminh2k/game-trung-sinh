import { describe, expect, it } from 'vitest'
import { soundEngine, THEME_BGM } from '../src/ui/audio/soundEngine'
import type { AmbientTheme } from '../src/ui/audio/soundEngine'

describe('BGM theme distinctness', () => {
  it('each theme has a distinct source (procedural vs file), volume, and mode', () => {
    const themes = Object.keys(THEME_BGM) as Exclude<AmbientTheme, 'silence'>[]

    // Collect signatures
    const signatures = new Set<string>()
    for (const t of themes) {
      const profile = THEME_BGM[t]
      signatures.add(`${profile.pro}:${profile.volume}:${profile.mode}:${profile.src}` as string)
    }
    // All 4 themes should have distinct signatures
    expect(signatures.size).toBe(4)

    // Explicit expectations per spec
    expect(THEME_BGM.village).toMatchObject({ pro: false, volume: 0.45, mode: 'pentatonic' })
    expect(THEME_BGM.sect).toMatchObject({   pro: true,  volume: 0.30, mode: 'drone' })
    expect(THEME_BGM.dungeon).toMatchObject({ pro: true,  volume: 0.40, mode: 'tension' })
    expect(THEME_BGM.combat).toMatchObject({ pro: true,  volume: 0.55, mode: 'intense' })
  })

  it('village uses real BGM stem file, others use procedural synthesis', () => {
    expect(THEME_BGM.village.pro).toBe(false)
    expect(THEME_BGM.sect.pro).toBe(true)
    expect(THEME_BGM.dungeon.pro).toBe(true)
    expect(THEME_BGM.combat.pro).toBe(true)
  })

  it('procedural themes do not route through SFX files for looping', () => {
    // sect/dungeon/combat src points must be SFX assets that don't loop —
    // the pro flag ensures we skip them
    expect(THEME_BGM.sect.src).not.toMatch(/BGM/)
    expect(THEME_BGM.dungeon.src).not.toMatch(/BGM/)
    expect(THEME_BGM.combat.src).not.toMatch(/BGM/)
  })

  it('setAmbientTheme switches without throwing for each distinct theme', () => {
    expect(() => {
      soundEngine.setAmbientTheme('village')
      soundEngine.setAmbientTheme('sect')
      soundEngine.setAmbientTheme('dungeon')
      soundEngine.setAmbientTheme('combat')
      soundEngine.setAmbientTheme('silence')
    }).not.toThrow()
  })
})

describe('BGM crossfade', () => {
  it('switches themes twice without throwing (drives gain ramps)', () => {
    // The crossfade path uses AudioContext scheduling; we cannot inspect the
    // ramp values without a browser AudioContext, so this test confirms the
    // API stays safe through repeated switches that exercise the ramp code.
    expect(() => {
      soundEngine.setAmbientTheme('village')
      soundEngine.setAmbientTheme('sect')
      soundEngine.setAmbientTheme('combat')
      soundEngine.setAmbientTheme('silence')
      soundEngine.setAmbientTheme('dungeon')
      soundEngine.setAmbientTheme('combat')
    }).not.toThrow()
  })

  it('playCombo triggers a non-throwing short overlay', () => {
    expect(() => {
      soundEngine.playCombo()
      soundEngine.playCombo()
    }).not.toThrow()
  })

  it('playCombo fires the bell-tree cluster 3 times in a row without throwing', () => {
    // Each call schedules a sawtooth sweep + 4 staggered bell-tree oscillators.
    // 3 rapid-fire calls must not throw, even though the AudioContext is
    // unavailable in the test env (the engine short-circuits safely).
    expect(() => {
      soundEngine.playCombo()
      soundEngine.playCombo()
      soundEngine.playCombo()
    }).not.toThrow()
  })
})
