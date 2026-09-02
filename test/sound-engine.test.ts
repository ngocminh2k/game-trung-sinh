import { describe, expect, it, beforeEach } from 'vitest'
import { soundEngine } from '../src/ui/audio/soundEngine'

describe('Xianxia Sound Engine', () => {
  beforeEach(() => {
    // Reset mute state
    if (soundEngine.isMuted()) {
      soundEngine.toggleMute()
    }
  })

  it('manages volume and mute settings cleanly', () => {
    expect(soundEngine.isMuted()).toBe(false)
    const muted = soundEngine.toggleMute()
    expect(muted).toBe(true)
    expect(soundEngine.isMuted()).toBe(true)

    soundEngine.toggleMute()
    expect(soundEngine.isMuted()).toBe(false)

    soundEngine.setMasterVolume(0.5)
    soundEngine.setSfxVolume(0.7)
    soundEngine.setBgmVolume(0.3)

    const settings = soundEngine.getSettings()
    expect(settings.masterVolume).toBe(0.5)
    expect(settings.sfxVolume).toBe(0.7)
    expect(settings.bgmVolume).toBe(0.3)
  })

  it('safely handles sound effect calls in headless environments without throwing', () => {
    expect(() => {
      soundEngine.play('bell')
      soundEngine.play('cultivate')
      soundEngine.play('breakthrough')
      soundEngine.play('sword_strike')
      soundEngine.play('sword_defend')
      soundEngine.play('stamp')
      soundEngine.play('pill')
      soundEngine.play('page_turn')
      soundEngine.play('step')
      soundEngine.play('thunder')
      soundEngine.play('click')
    }).not.toThrow()
  })

  it('safely switches ambient themes without throwing', () => {
    expect(() => {
      soundEngine.setAmbientTheme('village')
      soundEngine.setAmbientTheme('sect')
      soundEngine.setAmbientTheme('combat')
      soundEngine.setAmbientTheme('silence')
    }).not.toThrow()
  })
})
