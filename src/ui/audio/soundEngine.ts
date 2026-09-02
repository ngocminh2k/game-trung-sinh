/**
 * Xianxia Audio Engine — Mực & Ngọc (Ink & Jade)
 *
 * Plays authentic recorded Xianxia SFX and background music (BGM),
 * with fallback procedural synthesis for zero latency and offline resilience.
 *
 * Safe for SSR / headless test environments (Vitest/Playwright).
 */

import bgmTrack from '../../assets/audio/BGM.mp3'
import bellAudio from '../../assets/audio/bell.mp3'
import cultivateAudio from '../../assets/audio/cultivate.wav'
import breakthroughAudio from '../../assets/audio/breakthrough.mp3'
import swordStrikeAudio from '../../assets/audio/sword-strike.ogg'
import swordDefendAudio from '../../assets/audio/sword-defend.mp3'
import stampAudio from '../../assets/audio/stamp.mp3'
import pillAudio from '../../assets/audio/pill.ogg'
import pageTurnAudio from '../../assets/audio/page-turn.mp3'
import stepAudio from '../../assets/audio/step.ogg'
import thunderAudio from '../../assets/audio/thunder.ogg'

export type SoundEffect =
  | 'bell'
  | 'cultivate'
  | 'breakthrough'
  | 'sword_strike'
  | 'sword_defend'
  | 'stamp'
  | 'pill'
  | 'page_turn'
  | 'step'
  | 'thunder'
  | 'click'

export type AmbientTheme = 'village' | 'sect' | 'dungeon' | 'combat' | 'silence'

export interface AudioSettings {
  muted: boolean
  masterVolume: number
  sfxVolume: number
  bgmVolume: number
}

const STORAGE_KEY = 'phe_can_ky_audio_settings'

const SFX_MAP: Record<SoundEffect, string | null> = {
  bell: bellAudio,
  cultivate: cultivateAudio,
  breakthrough: breakthroughAudio,
  sword_strike: swordStrikeAudio,
  sword_defend: swordDefendAudio,
  stamp: stampAudio,
  pill: pillAudio,
  page_turn: pageTurnAudio,
  step: stepAudio,
  thunder: thunderAudio,
  click: null,
}

class SoundEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private bgmGain: GainNode | null = null
  private currentTheme: AmbientTheme = 'silence'
  private ambientInterval: number | null = null
  private bgmElement: HTMLAudioElement | null = null

  private settings: AudioSettings = {
    muted: false,
    masterVolume: 0.8,
    sfxVolume: 0.9,
    bgmVolume: 0.45,
  }

  constructor() {
    this.loadSettings()
    this.initBgmElement()
  }

  public getSettings(): Readonly<AudioSettings> {
    return { ...this.settings }
  }

  public isMuted(): boolean {
    return this.settings.muted
  }

  public toggleMute(): boolean {
    this.settings.muted = !this.settings.muted
    this.saveSettings()
    this.applyVolumes()
    return this.settings.muted
  }

  public setMasterVolume(vol: number): void {
    this.settings.masterVolume = Math.max(0, Math.min(1, vol))
    this.saveSettings()
    this.applyVolumes()
  }

  public setSfxVolume(vol: number): void {
    this.settings.sfxVolume = Math.max(0, Math.min(1, vol))
    this.saveSettings()
    this.applyVolumes()
  }

  public setBgmVolume(vol: number): void {
    this.settings.bgmVolume = Math.max(0, Math.min(1, vol))
    this.saveSettings()
    this.applyVolumes()
  }

  private loadSettings(): void {
    if (typeof window === 'undefined' || !window.localStorage) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (typeof parsed.muted === 'boolean') this.settings.muted = parsed.muted
        if (typeof parsed.masterVolume === 'number') this.settings.masterVolume = parsed.masterVolume
        if (typeof parsed.sfxVolume === 'number') this.settings.sfxVolume = parsed.sfxVolume
        if (typeof parsed.bgmVolume === 'number') this.settings.bgmVolume = parsed.bgmVolume
      }
    } catch {
      // Ignore localStorage parse errors
    }
  }

  private saveSettings(): void {
    if (typeof window === 'undefined' || !window.localStorage) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings))
    } catch {
      // Ignore storage write errors
    }
  }

  private initBgmElement(): void {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return
    try {
      this.bgmElement = new Audio(bgmTrack)
      this.bgmElement.loop = true
      this.applyVolumes()
    } catch {
      // Ignore audio constructor errors
    }
  }

  private initAudio(): boolean {
    if (typeof window === 'undefined') return false
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume()
      }
      return true
    }

    const AudioContextClass =
      window.AudioContext ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitAudioContext
    if (!AudioContextClass) return false

    try {
      this.ctx = new AudioContextClass()
      this.masterGain = this.ctx.createGain()
      this.sfxGain = this.ctx.createGain()
      this.bgmGain = this.ctx.createGain()

      this.sfxGain.connect(this.masterGain)
      this.bgmGain.connect(this.masterGain)
      this.masterGain.connect(this.ctx.destination)

      this.applyVolumes()
      return true
    } catch {
      return false
    }
  }

  private applyVolumes(): void {
    const effectiveBgmVol = this.settings.muted ? 0 : this.settings.masterVolume * this.settings.bgmVolume
    if (this.bgmElement) {
      this.bgmElement.volume = effectiveBgmVol
    }

    if (!this.masterGain || !this.sfxGain || !this.bgmGain) return
    const master = this.settings.muted ? 0 : this.settings.masterVolume
    this.masterGain.gain.setValueAtTime(master, this.ctx?.currentTime ?? 0)
    this.sfxGain.gain.setValueAtTime(this.settings.sfxVolume, this.ctx?.currentTime ?? 0)
    this.bgmGain.gain.setValueAtTime(this.settings.bgmVolume, this.ctx?.currentTime ?? 0)
  }

  /**
   * Plays an authentic recorded sound effect or procedural fallback
   */
  public play(sfx: SoundEffect): void {
    if (this.settings.muted) return

    const src = SFX_MAP[sfx]
    if (src && typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      try {
        const audio = new Audio(src)
        const vol = (this.settings.masterVolume * this.settings.sfxVolume)
        audio.volume = Math.max(0, Math.min(1, vol))
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay blocked: fallback to procedural audio
            this.playProcedural(sfx)
          })
        }
        return
      } catch {
        // Fall back to procedural synthesis
      }
    }

    this.playProcedural(sfx)
  }

  private playProcedural(sfx: SoundEffect): void {
    if (this.settings.muted) return
    if (!this.initAudio() || !this.ctx || !this.sfxGain) return

    const now = this.ctx.currentTime

    switch (sfx) {
      case 'click':
      case 'step': {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(140, now)
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.08)
        gain.gain.setValueAtTime(0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
        osc.connect(gain)
        gain.connect(this.sfxGain)
        osc.start(now)
        osc.stop(now + 0.08)
        break
      }
      case 'page_turn': {
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.15)
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp((-4 * i) / bufferSize)
        }
        const noise = this.ctx.createBufferSource()
        noise.buffer = buffer
        const filter = this.ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(800, now)
        filter.Q.setValueAtTime(1.5, now)
        const gain = this.ctx.createGain()
        gain.gain.setValueAtTime(0.4, now)
        gain.gain.linearRampToValueAtTime(0.001, now + 0.15)
        noise.connect(filter)
        filter.connect(gain)
        gain.connect(this.sfxGain)
        noise.start(now)
        break
      }
      case 'bell':
      case 'cultivate': {
        const baseFreq = sfx === 'cultivate' ? 220 : 523.25
        const osc1 = this.ctx.createOscillator()
        const osc2 = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc1.type = 'sine'
        osc2.type = 'sine'
        osc1.frequency.setValueAtTime(baseFreq, now)
        osc2.frequency.setValueAtTime(baseFreq * 2.76, now)
        gain.gain.setValueAtTime(0.5, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + (sfx === 'cultivate' ? 1.5 : 2.2))
        osc1.connect(gain)
        osc2.connect(gain)
        gain.connect(this.sfxGain)
        osc1.start(now)
        osc2.start(now)
        osc1.stop(now + 2.5)
        osc2.stop(now + 2.5)
        break
      }
      case 'breakthrough': {
        const freqs = [523.25, 659.25, 783.99, 880.0, 1046.5]
        freqs.forEach((freq, idx) => {
          if (!this.ctx || !this.sfxGain) return
          const osc = this.ctx.createOscillator()
          const gain = this.ctx.createGain()
          const start = now + idx * 0.09
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, start)
          gain.gain.setValueAtTime(0, start)
          gain.gain.linearRampToValueAtTime(0.35, start + 0.02)
          gain.gain.exponentialRampToValueAtTime(0.001, start + 1.2)
          osc.connect(gain)
          gain.connect(this.sfxGain)
          osc.start(start)
          osc.stop(start + 1.2)
        })
        break
      }
      case 'sword_strike': {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(1400, now)
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.18)
        gain.gain.setValueAtTime(0.6, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
        osc.connect(gain)
        gain.connect(this.sfxGain)
        osc.start(now)
        osc.stop(now + 0.22)
        break
      }
      case 'sword_defend': {
        const osc1 = this.ctx.createOscillator()
        const osc2 = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc1.type = 'sine'
        osc2.type = 'sine'
        osc1.frequency.setValueAtTime(920, now)
        osc2.frequency.setValueAtTime(1380, now)
        gain.gain.setValueAtTime(0.7, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
        osc1.connect(gain)
        osc2.connect(gain)
        gain.connect(this.sfxGain)
        osc1.start(now)
        osc2.start(now)
        osc1.stop(now + 0.6)
        osc2.stop(now + 0.6)
        break
      }
      case 'stamp': {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(110, now)
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.25)
        gain.gain.setValueAtTime(0.8, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
        osc.connect(gain)
        gain.connect(this.sfxGain)
        osc.start(now)
        osc.stop(now + 0.3)
        break
      }
      case 'pill': {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(320, now)
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.15)
        gain.gain.setValueAtTime(0.4, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
        osc.connect(gain)
        gain.connect(this.sfxGain)
        osc.start(now)
        osc.stop(now + 0.2)
        break
      }
      case 'thunder': {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(65, now)
        osc.frequency.linearRampToValueAtTime(35, now + 1.2)
        gain.gain.setValueAtTime(0.6, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2)
        osc.connect(gain)
        gain.connect(this.sfxGain)
        osc.start(now)
        osc.stop(now + 1.2)
        break
      }
    }
  }

  /**
   * Sets ambient background theme, streaming BGM track or procedural background harmonies
   */
  public setAmbientTheme(theme: AmbientTheme): void {
    if (this.currentTheme === theme) return
    this.currentTheme = theme

    if (this.ambientInterval) {
      clearInterval(this.ambientInterval)
      this.ambientInterval = null
    }

    if (theme === 'silence' || this.settings.muted) {
      if (this.bgmElement) {
        this.bgmElement.pause()
      }
      return
    }

    // Attempt streaming the BGM music track
    if (this.bgmElement) {
      this.applyVolumes()
      const playPromise = this.bgmElement.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay restricted until user gesture: fallback to pentatonic harmonies
          this.startPentatonicBgm()
        })
      }
      return
    }

    this.startPentatonicBgm()
  }

  private startPentatonicBgm(): void {
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]

    const playAmbientNote = (): void => {
      if (this.settings.muted || !this.initAudio() || !this.ctx || !this.bgmGain) return
      const now = this.ctx.currentTime
      const note = scale[Math.floor(Math.random() * scale.length)] ?? 261.63
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(note, now)
      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.12, now + 0.8)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5)
      osc.connect(gain)
      gain.connect(this.bgmGain)
      osc.start(now)
      osc.stop(now + 3.6)
    }

    if (typeof globalThis !== 'undefined' && typeof globalThis.setInterval === 'function') {
      this.ambientInterval = globalThis.setInterval(playAmbientNote, 4500) as unknown as number
    }
    playAmbientNote()
  }
}

export const soundEngine = new SoundEngine()
