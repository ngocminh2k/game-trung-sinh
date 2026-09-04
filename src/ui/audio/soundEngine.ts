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

// Per-theme BGM profile. Each theme streams a distinct stem at a tuned gain.
type BgmMode = 'pentatonic' | 'drone' | 'tension' | 'intense'
interface ThemeBgm {
  src: string
  volume: number
  mode: BgmMode
}
// ponytail: sect/dungeon/combat lacked dedicated loop stems, so reuse SFX files
// caused abrupt audio. We mark these procedural so setAmbientTheme skips the file
// route. Add real BGM stem files and switch their `pro` flag to false.
export const THEME_BGM: Record<Exclude<AmbientTheme, 'silence'>, ThemeBgm & { pro: boolean }> = {
  village: { src: bgmTrack,         volume: 0.45, mode: 'pentatonic', pro: false },
  sect:    { src: bellAudio,        volume: 0.30, mode: 'drone',      pro: true  },
  dungeon: { src: cultivateAudio,   volume: 0.40, mode: 'tension',    pro: true  },
  combat:  { src: swordStrikeAudio, volume: 0.55, mode: 'intense',    pro: true  },
}

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
  /** Separate gain node so we can ramp it independently from the SFX/BGM
   *  bus. The combo overlay rides here while the regular BGM crossfades. */
  private comboGain: GainNode | null = null
  private currentTheme: AmbientTheme = 'silence'
  private ambientInterval: number | null = null
  private bgmElement: HTMLAudioElement | null = null
  /** Per-theme gain so crossfade ramps the active bus down and the new bus up
   *  without a click. Lazily created on the first ambient-theme switch. */
  private themeGains: Partial<Record<AmbientTheme, GainNode>> = {}

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
      this.comboGain = this.ctx.createGain()

      this.sfxGain.connect(this.masterGain)
      this.bgmGain.connect(this.masterGain)
      this.comboGain.connect(this.masterGain)
      this.masterGain.connect(this.ctx.destination)

      this.applyVolumes()
      return true
    } catch {
      return false
    }
  }

  private getOrCreateThemeGain(theme: AmbientTheme): GainNode | null {
    if (!this.ctx || !this.bgmGain) return null
    const existing = this.themeGains[theme]
    if (existing) return existing
    const gain = this.ctx.createGain()
    // New themes start at 0 so the crossfade ramp can drive them up cleanly.
    // The active theme's gain sits at 1 between switches.
    const target = this.currentTheme === theme ? 1 : 0
    gain.gain.setValueAtTime(target, this.ctx.currentTime)
    gain.connect(this.bgmGain)
    this.themeGains[theme] = gain
    return gain
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

    // Crossfade: ramp the outgoing theme's gain to 0, then start the new theme.
    // The two-second ramp matches the brief and prevents the click when an
    // ambient theme is replaced mid-loop.
    if (this.initAudio() && this.ctx) {
      const now = this.ctx.currentTime
      const fade = 2.0
      if (this.currentTheme !== 'silence') {
        const outGain = this.themeGains[this.currentTheme]
        if (outGain) {
          outGain.gain.cancelScheduledValues(now)
          outGain.gain.setValueAtTime(outGain.gain.value, now)
          outGain.gain.linearRampToValueAtTime(0, now + fade)
        }
      }
      if (theme !== 'silence') {
        const inGain = this.getOrCreateThemeGain(theme)
        if (inGain) {
          inGain.gain.cancelScheduledValues(now)
          inGain.gain.setValueAtTime(inGain.gain.value, now)
          inGain.gain.linearRampToValueAtTime(1, now + fade)
        }
      }
    }

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

    const profile = THEME_BGM[theme]

    // Procedural-only themes skip the (non-looping) SFX file path entirely
    if (profile.pro) {
      this.startProceduralBgm(theme, profile.mode)
      return
    }

    // Attempt streaming the BGM music track
    if (this.bgmElement) {
      this.bgmElement.src = profile.src
      this.bgmElement.volume = profile.volume * this.settings.masterVolume
      this.applyVolumes()
      const playPromise = this.bgmElement.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay restricted until user gesture: fallback to procedural harmonies
          this.startProceduralBgm(theme, profile.mode)
        })
      }
      return
    }

    this.startProceduralBgm(theme, profile.mode)
  }

  private startProceduralBgm(theme: AmbientTheme, mode: BgmMode): void {
    const playAmbientNote = (): void => {
      if (this.settings.muted || !this.initAudio() || !this.ctx || !this.bgmGain) return
      const now = this.ctx.currentTime
      // Voices route into this theme's gain node so the crossfade above can
      // ramp the whole layer without affecting other themes.
      const target = this.getOrCreateThemeGain(theme)
      if (!target) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.connect(gain)
      gain.connect(target)
      switch (mode) {
        case 'pentatonic': {
          const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]
          const note = scale[Math.floor(Math.random() * scale.length)] ?? 261.63
          osc.type = 'sine'
          osc.frequency.setValueAtTime(note, now)
          gain.gain.setValueAtTime(0.001, now)
          gain.gain.linearRampToValueAtTime(0.12, now + 0.8)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5)
          osc.start(now)
          osc.stop(now + 3.6)
          // Guqin/bell timbre: a slightly detuned triangle voice layered on
          // top of each pentatonic note gives the village drone its plucky,
          // string-and-bell character without any audio file.
          const pluck = this.ctx.createOscillator()
          const pluckGain = this.ctx.createGain()
          pluck.type = 'triangle'
          pluck.frequency.setValueAtTime(note, now)
          pluck.detune.setValueAtTime(7, now)
          pluckGain.gain.setValueAtTime(0.001, now)
          pluckGain.gain.linearRampToValueAtTime(0.06, now + 0.02)
          pluckGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2)
          pluck.connect(pluckGain)
          pluckGain.connect(target)
          pluck.start(now)
          pluck.stop(now + 1.3)
          // Bell shimmer: a triangle at the perfect-fifth harmonic, decays fast.
          const bell = this.ctx.createOscillator()
          const bellGain = this.ctx.createGain()
          bell.type = 'triangle'
          bell.frequency.setValueAtTime(note * 3, now)
          bell.detune.setValueAtTime(-3, now)
          bellGain.gain.setValueAtTime(0.001, now)
          bellGain.gain.linearRampToValueAtTime(0.04, now + 0.01)
          bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9)
          bell.connect(bellGain)
          bellGain.connect(target)
          bell.start(now)
          bell.stop(now + 1.0)
          break
        }
        case 'drone': {
          osc.type = 'sine'
          osc.frequency.setValueAtTime(130.81, now)
          gain.gain.setValueAtTime(0.001, now)
          gain.gain.linearRampToValueAtTime(0.18, now + 1.4)
          gain.gain.linearRampToValueAtTime(0.18, now + 5)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 5.4)
          osc.start(now)
          osc.stop(now + 5.5)
          // Third-harmonic over the sect drone: a quiet bell-like voice on
          // 3x the fundamental adds the resonant shimmer of a meditation hall.
          const harmonic = this.ctx.createOscillator()
          const harmonicGain = this.ctx.createGain()
          harmonic.type = 'sine'
          harmonic.frequency.setValueAtTime(130.81 * 3, now)
          harmonicGain.gain.setValueAtTime(0.001, now)
          harmonicGain.gain.linearRampToValueAtTime(0.05, now + 1.6)
          harmonicGain.gain.linearRampToValueAtTime(0.05, now + 4.8)
          harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + 5.4)
          harmonic.connect(harmonicGain)
          harmonicGain.connect(target)
          harmonic.start(now)
          harmonic.stop(now + 5.5)
          break
        }
        case 'tension': {
          const freqs = [82.41, 110.0, 146.83]
          const f = freqs[Math.floor(Math.random() * freqs.length)] ?? 82.41
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(f, now)
          gain.gain.setValueAtTime(0.001, now)
          gain.gain.linearRampToValueAtTime(0.14, now + 0.3)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6)
          osc.start(now)
          osc.stop(now + 1.7)
          // Subtle low-pass sweep: the dungeon tone starts open and tightens
          // through the decay so the air feels like it's closing in.
          const filter = this.ctx.createBiquadFilter()
          filter.type = 'lowpass'
          filter.frequency.setValueAtTime(1800, now)
          filter.frequency.exponentialRampToValueAtTime(280, now + 1.6)
          filter.Q.setValueAtTime(4, now)
          const filtered = this.ctx.createGain()
          filtered.gain.setValueAtTime(0.001, now)
          filtered.gain.linearRampToValueAtTime(0.09, now + 0.3)
          filtered.gain.exponentialRampToValueAtTime(0.001, now + 1.6)
          osc.connect(filter)
          filter.connect(filtered)
          filtered.connect(target)
          // Stone-foundation bass: a 40-60Hz triangle with slight detune gives
          // the dungeon a "weight underfoot" feel, like the cave is breathing.
          const bass = this.ctx.createOscillator()
          const bassGain = this.ctx.createGain()
          const bassFreq = 40 + Math.random() * 20
          bass.type = 'triangle'
          bass.frequency.setValueAtTime(bassFreq, now)
          bass.detune.setValueAtTime(6, now)
          bassGain.gain.setValueAtTime(0.001, now)
          bassGain.gain.linearRampToValueAtTime(0.08, now + 0.6)
          bassGain.gain.linearRampToValueAtTime(0.08, now + 1.2)
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6)
          bass.connect(bassGain)
          bassGain.connect(target)
          bass.start(now)
          bass.stop(now + 1.7)
          break
        }
        case 'intense': {
          // Tactical snap: 50ms white-noise burst shaped by a fast decay. Plays
          // at the start of each cycle so combat feels percussive, not just droning.
          const noiseSize = Math.floor(this.ctx.sampleRate * 0.05)
          const noiseBuf = this.ctx.createBuffer(1, noiseSize, this.ctx.sampleRate)
          const noiseData = noiseBuf.getChannelData(0)
          for (let i = 0; i < noiseSize; i++) noiseData[i] = (Math.random() * 2 - 1)
          const noise = this.ctx.createBufferSource()
          noise.buffer = noiseBuf
          const noiseGain = this.ctx.createGain()
          noiseGain.gain.setValueAtTime(0.35, now)
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
          const noiseHp = this.ctx.createBiquadFilter()
          noiseHp.type = 'highpass'
          noiseHp.frequency.setValueAtTime(800, now)
          noise.connect(noiseHp)
          noiseHp.connect(noiseGain)
          noiseGain.connect(target)
          noise.start(now)
          const f = 220 + Math.random() * 180
          osc.type = 'square'
          osc.frequency.setValueAtTime(f, now)
          gain.gain.setValueAtTime(0.001, now)
          gain.gain.linearRampToValueAtTime(0.2, now + 0.02)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
          osc.start(now)
          osc.stop(now + 0.2)
          // Treble crunch: a second square an octave above sharpens the bite
          // so combat hits feel percussive instead of muddy.
          const crunch = this.ctx.createOscillator()
          const crunchGain = this.ctx.createGain()
          crunch.type = 'square'
          crunch.frequency.setValueAtTime(f * 2, now)
          crunchGain.gain.setValueAtTime(0.001, now)
          crunchGain.gain.linearRampToValueAtTime(0.1, now + 0.01)
          crunchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)
          crunch.connect(crunchGain)
          crunchGain.connect(target)
          crunch.start(now)
          crunch.stop(now + 0.2)
          break
        }
      }
    }

    const intervalMs =
      mode === 'pentatonic' ? 4500 :
      mode === 'drone' ? 5200 :
      mode === 'tension' ? 1200 :
      280
    if (typeof globalThis !== 'undefined' && typeof globalThis.setInterval === 'function') {
      this.ambientInterval = globalThis.setInterval(playAmbientNote, intervalMs) as unknown as number
    }
    playAmbientNote()
  }

  /**
   * Combo overlay: rising sawtooth sweep + pentatonic bell-tree cluster played
   * on top of the active BGM when the player lands 3+ hits in a row. Routes
   * through comboGain so it never interferes with the ambient crossfade.
   */
  public playCombo(): void {
    if (this.settings.muted) return
    if (!this.initAudio() || !this.ctx || !this.comboGain) return
    const now = this.ctx.currentTime
    // Rising sweep — the "triumph accent" lead.
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(440, now)
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.5)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.linearRampToValueAtTime(0.25, now + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)
    osc.connect(gain)
    gain.connect(this.comboGain)
    osc.start(now)
    osc.stop(now + 0.55)
    // Bell-tree cluster: pentatonic ratios (3,5,7,9) of base, staggered 80ms
    // apart. Each voice attacks and decays within 200ms so the cluster reads
    // as a quick triumphant chime rather than a chord.
    const ratios = [3, 5, 7, 9]
    const base = 440
    for (let i = 0; i < ratios.length; i++) {
      const r = ratios[i] ?? 3
      const start = now + 0.05 + i * 0.08
      const bell = this.ctx.createOscillator()
      const bellGain = this.ctx.createGain()
      bell.type = 'sine'
      bell.frequency.setValueAtTime(base * r, start)
      bellGain.gain.setValueAtTime(0.0001, start)
      bellGain.gain.linearRampToValueAtTime(0.18, start + 0.005)
      bellGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2)
      bell.connect(bellGain)
      bellGain.connect(this.comboGain)
      bell.start(start)
      bell.stop(start + 0.22)
    }
  }
}

export const soundEngine = new SoundEngine()
