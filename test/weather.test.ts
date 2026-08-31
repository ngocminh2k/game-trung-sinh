import { describe, expect, it } from 'vitest'
import { seasonFor, weatherFor, WEATHER_EFFECTS } from '../src/engine/weather'

const SEED = 'ink-and-jade'

describe('seasonFor', () => {
  it('follows the 28-day cycle: 1-7 xuan, 8-14 ha, 15-21 thu, 22-28 dong', () => {
    expect(seasonFor(1)).toBe('xuan')
    expect(seasonFor(7)).toBe('xuan')
    expect(seasonFor(8)).toBe('ha')
    expect(seasonFor(14)).toBe('ha')
    expect(seasonFor(15)).toBe('thu')
    expect(seasonFor(21)).toBe('thu')
    expect(seasonFor(22)).toBe('dong')
    expect(seasonFor(28)).toBe('dong')
  })

  it('wraps every 28 days', () => {
    expect(seasonFor(29)).toBe('xuan')
    expect(seasonFor(35)).toBe('xuan')
    expect(seasonFor(36)).toBe('ha')
    expect(seasonFor(37)).toBe('ha')
    expect(seasonFor(43)).toBe('thu')
    expect(seasonFor(56)).toBe('dong')
    expect(seasonFor(57)).toBe('xuan')
  })
})

describe('weatherFor determinism', () => {
  it('same seed+day always yields the same result', () => {
    for (let day = 1; day <= 28; day++) {
      const a = weatherFor(SEED, day)
      const b = weatherFor(SEED, day)
      expect(a).toEqual(b)
    }
    expect(weatherFor('other-seed', 12)).toEqual(weatherFor('other-seed', 12))
  })

  it('28 days of one seed produce at least 3 different kinds', () => {
    const kinds = new Set<ReturnType<typeof weatherFor>['kind']>()
    for (let day = 1; day <= 28; day++) {
      kinds.add(weatherFor(SEED, day).kind)
    }
    expect(kinds.size).toBeGreaterThanOrEqual(3)
  })

  it('never consumes Math.random — repeated calls stay identical', () => {
    const first = weatherFor('stable-seed', 100)
    for (let i = 0; i < 10; i++) {
      expect(weatherFor('stable-seed', 100)).toEqual(first)
    }
  })
})

describe('WEATHER_EFFECTS', () => {
  it('has exactly 16 unique ids in season_kind format', () => {
    const ids = Object.keys(WEATHER_EFFECTS)
    expect(ids.length).toBe(16)
    expect(new Set(ids).size).toBe(16)
    for (const id of ids) {
      expect(id).toMatch(/^(xuan|ha|thu|dong)_(quang|mua|suong|bao)$/)
    }
    for (const season of ['xuan', 'ha', 'thu', 'dong'] as const) {
      for (const kind of ['quang', 'mua', 'suong', 'bao'] as const) {
        expect(WEATHER_EFFECTS[`${season}_${kind}`]).toBeDefined()
      }
    }
  })

  it('weatherFor ids always resolve in WEATHER_EFFECTS', () => {
    for (let day = 1; day <= 56; day++) {
      const w = weatherFor(SEED, day)
      expect(WEATHER_EFFECTS[w.id]).toBeDefined()
      expect(w.id).toBe(`${w.season}_${w.kind}`)
    }
  })
})
