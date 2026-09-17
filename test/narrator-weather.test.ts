import { describe, expect, it } from 'vitest'
import {
  WEATHER_NARRATIONS,
  BLOOD_MOON_NARRATIONS,
  getWeatherNarration,
} from '../src/content/narrator-weather'
import { narrateLine } from '../src/engine'
import type { Season, WeatherKind } from '../src/engine/weather'
import type { GameEvent } from '../src/engine'

describe('C3-09 / C2-09: Narrator Weather Expansion (4 Seasons × Conditions)', () => {
  const seasons: Season[] = ['xuan', 'ha', 'thu', 'dong']
  const kinds: WeatherKind[] = ['quang', 'mua', 'suong', 'bao']

  it('provides at least 40+ total unique literary lines across all combinations', () => {
    let totalViLines = 0
    let totalEnLines = 0

    for (const season of seasons) {
      for (const kind of kinds) {
        const entry = WEATHER_NARRATIONS[`${season}_${kind}`]
        expect(entry, `missing entry for ${season}_${kind}`).toBeDefined()
        if (entry) {
          expect(entry.vi.length).toBeGreaterThanOrEqual(2)
          expect(entry.en.length).toBeGreaterThanOrEqual(2)
          expect(entry.vi.length).toBe(entry.en.length)
          totalViLines += entry.vi.length
          totalEnLines += entry.en.length
        }
      }
    }

    // Include Blood Moon variations
    expect(BLOOD_MOON_NARRATIONS.vi.length).toBeGreaterThanOrEqual(4)
    expect(BLOOD_MOON_NARRATIONS.en.length).toBeGreaterThanOrEqual(4)
    totalViLines += BLOOD_MOON_NARRATIONS.vi.length
    totalEnLines += BLOOD_MOON_NARRATIONS.en.length

    // Must exceed the 40+ line requirement of ticket C2-09
    expect(totalViLines).toBeGreaterThanOrEqual(40)
    expect(totalEnLines).toBeGreaterThanOrEqual(40)
  })

  it('rotates narration lines deterministically across days without consecutive duplicate texts', () => {
    const day1Desc = getWeatherNarration({ season: 'xuan', kind: 'mua' }, 'vi', 1)
    const day2Desc = getWeatherNarration({ season: 'xuan', kind: 'mua' }, 'vi', 2)
    const day3Desc = getWeatherNarration({ season: 'xuan', kind: 'mua' }, 'vi', 3)

    expect(day1Desc).not.toBe(day2Desc)
    expect(day2Desc).not.toBe(day3Desc)
    // Same day yields exact same line (pure determinism)
    expect(getWeatherNarration({ season: 'xuan', kind: 'mua' }, 'vi', 1)).toBe(day1Desc)
  })

  it('voices Blood Moon on Day 15 with ominous lunar narration', () => {
    // Day 15 is Blood Moon in the 28-day cycle
    const bloodMoonVi = getWeatherNarration({ season: 'thu', kind: 'quang' }, 'vi', 15)
    const bloodMoonEn = getWeatherNarration({ season: 'thu', kind: 'quang' }, 'en', 15)

    expect(bloodMoonVi).toMatch(/máu|Huyết Nguyệt/i)
    expect(bloodMoonEn).toMatch(/blood/i)
  })

  it('integrates seamlessly with DAY_PASSED event in narrateLine', () => {
    const evDay1: GameEvent = {
      type: 'DAY_PASSED',
      day: 1,
      weather: { season: 'xuan', kind: 'quang', id: 'xuan_quang' },
    }
    const lineVi = narrateLine(evDay1, 'vi')
    const lineEn = narrateLine(evDay1, 'en')

    expect(lineVi).toContain('Trời sang ngày 1.')
    expect(lineVi.length).toBeGreaterThan('Trời sang ngày 1. Trời quang đãng, gió mát.'.length)
    expect(lineEn).toContain('Day 1 dawns.')

    // Day 15 Blood Moon in DAY_PASSED
    const evDay15: GameEvent = {
      type: 'DAY_PASSED',
      day: 15,
      weather: { season: 'thu', kind: 'quang', id: 'thu_quang' },
    }
    const bloodLineVi = narrateLine(evDay15, 'vi')
    const bloodLineEn = narrateLine(evDay15, 'en')

    expect(bloodLineVi).toMatch(/máu|Huyết Nguyệt/i)
    expect(bloodLineEn).toMatch(/blood/i)
  })
})
