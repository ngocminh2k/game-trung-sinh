import { describe, expect, it } from 'vitest'
import {
  getCanChiOfDay,
  getLunarDate,
  getLunarPhase,
  getWeatherForecast,
  isBloodMoon,
  LUNAR_MONTH_DAYS,
  SEASON_NAMES_EN,
  SEASON_NAMES_VI,
  WEATHER_NAMES_EN,
  WEATHER_NAMES_VI,
} from '../src/engine/weather'

describe('C3-15: Lịch Âm & Dự Báo Thời Tiết 7 Ngày (Lunar Calendar & Forecast)', () => {
  describe('Can Chi (Heavenly Stems & Earthly Branches)', () => {
    it('calculates Day 1 as Giáp Tý / Jia-Zi', () => {
      const canChi = getCanChiOfDay(1)
      expect(canChi.vi).toBe('Giáp Tý')
      expect(canChi.en).toBe('Jia-Zi')
    })

    it('calculates Day 2 as Ất Sửu / Yi-Chou', () => {
      const canChi = getCanChiOfDay(2)
      expect(canChi.vi).toBe('Ất Sửu')
      expect(canChi.en).toBe('Yi-Chou')
    })

    it('calculates Day 11 as Giáp Tuất (Can wraps at 10, Chi at 12)', () => {
      const canChi = getCanChiOfDay(11)
      expect(canChi.vi).toBe('Giáp Tuất')
      expect(canChi.en).toBe('Jia-Xu')
    })

    it('calculates Day 60 as Quý Hợi and Day 61 wraps cleanly back to Giáp Tý', () => {
      const day60 = getCanChiOfDay(60)
      expect(day60.vi).toBe('Quý Hợi')
      expect(day60.en).toBe('Gui-Hai')

      const day61 = getCanChiOfDay(61)
      expect(day61.vi).toBe('Giáp Tý')
      expect(day61.en).toBe('Jia-Zi')
    })
  })

  describe('Lunar Date Calculation (28-day Xianxia Astronomical Cycle)', () => {
    it('defines LUNAR_MONTH_DAYS as 28', () => {
      expect(LUNAR_MONTH_DAYS).toBe(28)
    })

    it('maps Day 1 to Lunar Day 1, Month 1', () => {
      const date = getLunarDate(1)
      expect(date.lunarDay).toBe(1)
      expect(date.lunarMonth).toBe(1)
    })

    it('maps Day 15 to Lunar Day 15, Month 1 (Blood Moon day)', () => {
      const date = getLunarDate(15)
      expect(date.lunarDay).toBe(15)
      expect(date.lunarMonth).toBe(1)
      expect(isBloodMoon(15)).toBe(true)
    })

    it('maps Day 28 to Lunar Day 28, Month 1', () => {
      const date = getLunarDate(28)
      expect(date.lunarDay).toBe(28)
      expect(date.lunarMonth).toBe(1)
    })

    it('maps Day 29 to Lunar Day 1, Month 2 (New Month)', () => {
      const date = getLunarDate(29)
      expect(date.lunarDay).toBe(1)
      expect(date.lunarMonth).toBe(2)
    })

    it('handles negative or zero day safely by clamping to day 1', () => {
      const date0 = getLunarDate(0)
      expect(date0.lunarDay).toBe(1)
      expect(date0.lunarMonth).toBe(1)
    })
  })

  describe('Lunar Phases (Tuần Trăng)', () => {
    it('identifies Day 1 as Sóc / New Moon', () => {
      const phase = getLunarPhase(1)
      expect(phase.id).toBe('new_moon')
      expect(phase.icon).toBe('🌑')
      expect(phase.vi).toContain('Sóc')
    })

    it('identifies Day 7 as Thượng Huyền / First Quarter', () => {
      const phase = getLunarPhase(7)
      expect(phase.id).toBe('first_quarter')
      expect(phase.icon).toBe('🌓')
    })

    it('identifies Day 15 as Huyết Nguyệt / Blood Moon', () => {
      const phase = getLunarPhase(15)
      expect(phase.id).toBe('blood_moon')
      expect(phase.icon).toBe('🌕')
      expect(phase.vi).toContain('Huyết Nguyệt')
    })

    it('identifies Day 21 as Hạ Huyền / Last Quarter', () => {
      const phase = getLunarPhase(21)
      expect(phase.id).toBe('last_quarter')
      expect(phase.icon).toBe('🌗')
    })

    it('identifies waxing and waning intermediate phases', () => {
      expect(getLunarPhase(4).id).toBe('waxing_crescent')
      expect(getLunarPhase(10).id).toBe('waxing_gibbous')
      expect(getLunarPhase(18).id).toBe('waning_gibbous')
      expect(getLunarPhase(25).id).toBe('waning_crescent')
    })
  })

  describe('7-Day Weather Forecast (Dự Báo Thiên Tượng)', () => {
    const seed = 'test_seed_42'

    it('generates exactly 7 days of forecast by default', () => {
      const forecast = getWeatherForecast(seed, 1)
      expect(forecast).toHaveLength(7)
      expect(forecast[0]?.day).toBe(1)
      expect(forecast[6]?.day).toBe(7)
    })

    it('is completely deterministic for same seed and day', () => {
      const f1 = getWeatherForecast(seed, 10)
      const f2 = getWeatherForecast(seed, 10)
      expect(f1).toEqual(f2)
    })

    it('includes full astronomical and meteorological metadata for each day', () => {
      const forecast = getWeatherForecast(seed, 12, 7)
      for (const entry of forecast) {
        expect(entry.day).toBeGreaterThanOrEqual(12)
        expect(entry.lunarDay).toBeGreaterThanOrEqual(1)
        expect(entry.lunarDay).toBeLessThanOrEqual(28)
        expect(entry.canChi.vi).toBeTruthy()
        expect(entry.canChi.en).toBeTruthy()
        expect(entry.phase.icon).toBeTruthy()
        expect(entry.weather.kind).toBeTruthy()
        expect(entry.seasonVi).toBeTruthy()
        expect(entry.seasonEn).toBeTruthy()
        expect(entry.weatherVi).toBeTruthy()
        expect(entry.weatherEn).toBeTruthy()
        expect(entry.effects).toHaveProperty('herbPriceMod')
      }
    })

    it('accurately flags Day 15 as Blood Moon in forecast', () => {
      const forecast = getWeatherForecast(seed, 14, 3)
      // day 14: not blood moon
      expect(forecast[0]?.day).toBe(14)
      expect(forecast[0]?.isBloodMoon).toBe(false)
      // day 15: Blood Moon!
      expect(forecast[1]?.day).toBe(15)
      expect(forecast[1]?.isBloodMoon).toBe(true)
      expect(forecast[1]?.phase.id).toBe('blood_moon')
      // day 16: not blood moon
      expect(forecast[2]?.day).toBe(16)
      expect(forecast[2]?.isBloodMoon).toBe(false)
    })
  })

  describe('Bilingual Dictionaries for Weather and Seasons', () => {
    it('has all 4 seasons in VI and EN', () => {
      expect(SEASON_NAMES_VI.xuan).toBe('Mùa Xuân')
      expect(SEASON_NAMES_VI.ha).toBe('Mùa Hạ')
      expect(SEASON_NAMES_VI.thu).toBe('Mùa Thu')
      expect(SEASON_NAMES_VI.dong).toBe('Mùa Đông')

      expect(SEASON_NAMES_EN.xuan).toBe('Spring')
      expect(SEASON_NAMES_EN.ha).toBe('Summer')
      expect(SEASON_NAMES_EN.thu).toBe('Autumn')
      expect(SEASON_NAMES_EN.dong).toBe('Winter')
    })

    it('has all 4 weather kinds in VI and EN', () => {
      expect(WEATHER_NAMES_VI.quang).toBe('Trời Quang')
      expect(WEATHER_NAMES_VI.mua).toBe('Mưa Phùn')
      expect(WEATHER_NAMES_VI.suong).toBe('Sương Mù')
      expect(WEATHER_NAMES_VI.bao).toBe('Giông Bão')

      expect(WEATHER_NAMES_EN.quang).toBe('Clear Sky')
      expect(WEATHER_NAMES_EN.mua).toBe('Drizzle')
      expect(WEATHER_NAMES_EN.suong).toBe('Dense Mist')
      expect(WEATHER_NAMES_EN.bao).toBe('Tempest')
    })
  })
})
