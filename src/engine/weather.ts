export const LUNAR_MONTH_DAYS = 28

export const THIEN_CAN_VI = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'] as const
export const THIEN_CAN_EN = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'] as const
export const DIA_CHI_VI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tị', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'] as const
export const DIA_CHI_EN = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'] as const

export const SEASON_NAMES_VI: Record<Season, string> = {
  xuan: 'Mùa Xuân',
  ha: 'Mùa Hạ',
  thu: 'Mùa Thu',
  dong: 'Mùa Đông',
}

export const SEASON_NAMES_EN: Record<Season, string> = {
  xuan: 'Spring',
  ha: 'Summer',
  thu: 'Autumn',
  dong: 'Winter',
}

export const WEATHER_NAMES_VI: Record<WeatherKind, string> = {
  quang: 'Trời Quang',
  mua: 'Mưa Phùn',
  suong: 'Sương Mù',
  bao: 'Giông Bão',
}

export const WEATHER_NAMES_EN: Record<WeatherKind, string> = {
  quang: 'Clear Sky',
  mua: 'Drizzle',
  suong: 'Dense Mist',
  bao: 'Tempest',
}

export const WEATHER_ICONS: Record<WeatherKind, string> = {
  quang: '☀️',
  mua: '🌧',
  suong: '🌫',
  bao: '⚡',
}

export type LunarPhaseId =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'blood_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent'

export interface LunarPhase {
  id: LunarPhaseId
  icon: string
  vi: string
  en: string
}

export interface DayForecast {
  day: number
  lunarDay: number
  lunarMonth: number
  canChi: { vi: string; en: string }
  phase: LunarPhase
  season: Season
  seasonVi: string
  seasonEn: string
  weather: WeatherState
  weatherVi: string
  weatherEn: string
  isBloodMoon: boolean
  effects: WeatherEffect
}

export function getCanChiOfDay(day: number): { vi: string; en: string } {
  const d = Math.max(1, Math.floor(day))
  const canIndex = (d - 1) % 10
  const chiIndex = (d - 1) % 12
  return {
    vi: `${THIEN_CAN_VI[canIndex]} ${DIA_CHI_VI[chiIndex]}`,
    en: `${THIEN_CAN_EN[canIndex]}-${DIA_CHI_EN[chiIndex]}`,
  }
}

export function getLunarDate(day: number): { lunarDay: number; lunarMonth: number } {
  const d = Math.max(1, Math.floor(day))
  const lunarDay = ((((d - 1) % LUNAR_MONTH_DAYS) + LUNAR_MONTH_DAYS) % LUNAR_MONTH_DAYS) + 1
  const lunarMonth = Math.floor((d - 1) / LUNAR_MONTH_DAYS) + 1
  return { lunarDay, lunarMonth }
}

export function getLunarPhase(day: number): LunarPhase {
  const { lunarDay } = getLunarDate(day)
  if (lunarDay === 1) {
    return { id: 'new_moon', icon: '🌑', vi: 'Trăng Non (Sóc)', en: 'New Moon' }
  }
  if (lunarDay > 1 && lunarDay < 7) {
    return { id: 'waxing_crescent', icon: '🌒', vi: 'Trăng Lưỡi Liềm Đầu Tháng', en: 'Waxing Crescent' }
  }
  if (lunarDay === 7) {
    return { id: 'first_quarter', icon: '🌓', vi: 'Thượng Huyền Nguyệt', en: 'First Quarter' }
  }
  if (lunarDay > 7 && lunarDay < 14) {
    return { id: 'waxing_gibbous', icon: '🌔', vi: 'Trăng Trương Huyền', en: 'Waxing Gibbous' }
  }
  if (lunarDay === 14) {
    return { id: 'full_moon', icon: '🌕', vi: 'Trăng Tròn (Vọng)', en: 'Full Moon' }
  }
  if (lunarDay === 15) {
    return { id: 'blood_moon', icon: '🌕', vi: 'Huyết Nguyệt (Đêm Trăng Máu)', en: 'Blood Moon' }
  }
  if (lunarDay > 15 && lunarDay < 21) {
    return { id: 'waning_gibbous', icon: '🌖', vi: 'Trăng Khuyết Dần', en: 'Waning Gibbous' }
  }
  if (lunarDay === 21) {
    return { id: 'last_quarter', icon: '🌗', vi: 'Hạ Huyền Nguyệt', en: 'Last Quarter' }
  }
  return { id: 'waning_crescent', icon: '🌘', vi: 'Trăng Tàn (Hối)', en: 'Waning Crescent' }
}

export function getWeatherForecast(
  seed: string,
  currentDay: number,
  count: number = 7,
): DayForecast[] {
  const startDay = Math.max(1, Math.floor(currentDay))
  const forecast: DayForecast[] = []
  for (let i = 0; i < count; i++) {
    const d = startDay + i
    const { lunarDay, lunarMonth } = getLunarDate(d)
    const canChi = getCanChiOfDay(d)
    const phase = getLunarPhase(d)
    const weather = weatherFor(seed, d)
    const bloodMoon = isBloodMoon(d)
    const effects = WEATHER_EFFECTS[weather.id] ?? {
      herbPriceMod: 1,
      bossPowerMod: 1,
      travelCostMod: 1,
      hiddenNpcChance: 0,
    }
    forecast.push({
      day: d,
      lunarDay,
      lunarMonth,
      canChi,
      phase,
      season: weather.season,
      seasonVi: SEASON_NAMES_VI[weather.season],
      seasonEn: SEASON_NAMES_EN[weather.season],
      weather,
      weatherVi: WEATHER_NAMES_VI[weather.kind],
      weatherEn: WEATHER_NAMES_EN[weather.kind],
      isBloodMoon: bloodMoon,
      effects,
    })
  }
  return forecast
}

// Weather: pure deterministic function of (seed, day).
// Intentionally does NOT consume state.rng (see docs/plans/expansion-x20/tasks/T05-weather.md):
// weather must never disturb the determinism of other actions.

import type { Element } from './content-types'

export type Season = 'xuan' | 'ha' | 'thu' | 'dong'
export type WeatherKind = 'quang' | 'mua' | 'suong' | 'bao'

export interface WeatherState {
  season: Season
  kind: WeatherKind
  id: string
}

export interface WeatherEffect {
  herbPriceMod: number
  bossPowerMod: number
  travelCostMod: number
  hiddenNpcChance: number
}

const SEASONS: readonly Season[] = ['xuan', 'ha', 'thu', 'dong']

const WEATHER_KINDS: readonly WeatherKind[] = ['quang', 'mua', 'suong', 'bao']

// Fixed probability table: quang 55%, mua 20%, suong 15%, bao 10%.
const KIND_THRESHOLDS: readonly { kind: WeatherKind; upper: number }[] = [
  { kind: 'quang', upper: 0.55 },
  { kind: 'mua', upper: 0.75 },
  { kind: 'suong', upper: 0.9 },
  { kind: 'bao', upper: 1 },
]

/** FNV-1a 32-bit hash — deterministic across platforms. */
function fnv1a(text: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash >>> 0
}

/** Murmur3-style avalanche finalizer: spreads structured FNV outputs uniformly. */
function avalanche(x: number): number {
  let h = x >>> 0
  h ^= h >>> 16
  h = Math.imul(h, 0x7feb352d) >>> 0
  h ^= h >>> 15
  h = Math.imul(h, 0x846ca68b) >>> 0
  h ^= h >>> 16
  return h >>> 0
}

/** Season for a game day: 28-day cycle — day 1-7 xuan, 8-14 ha, 15-21 thu, 22-28 dong. */
export function seasonFor(day: number): Season {
  const dayInCycle = ((((day - 1) % 28) + 28) % 28) + 1
  const index = Math.min(3, Math.floor((dayInCycle - 1) / 7))
  return SEASONS[index] ?? 'xuan'
}

function kindFor(hash: number): WeatherKind {
  const roll = hash / 0x100000000
  for (const entry of KIND_THRESHOLDS) {
    if (roll < entry.upper) return entry.kind
  }
  return 'bao'
}

/**
 * Weather for a (seed, day) pair. Pure: same inputs always yield the same
 * WeatherState, independent of any rng stream.
 */
export function weatherFor(seed: string, day: number): WeatherState {
  const hash = avalanche(fnv1a(`${seed}:${day}`))
  const season = seasonFor(day)
  const kind = kindFor(hash)
  return { season, kind, id: `${season}_${kind}` }
}

/**
 * Gameplay effect lookup per `${season}_${kind}` id (16 entries).
 * Engine systems (T12) consult this table; weather module itself stays data-only.
 * Suggested values: quang 1/1/1/0; mua 0.8/1/1/0.1; suong 1/1.3/1.2/0.2; bao 1.2/1.5/1.5/0.
 */
export const WEATHER_EFFECTS: Record<string, WeatherEffect> = Object.fromEntries(
  SEASONS.flatMap((season) =>
    WEATHER_KINDS.map((kind) => {
      const effects: Record<WeatherKind, WeatherEffect> = {
        quang: { herbPriceMod: 1, bossPowerMod: 1, travelCostMod: 1, hiddenNpcChance: 0 },
        mua: { herbPriceMod: 0.8, bossPowerMod: 1, travelCostMod: 1, hiddenNpcChance: 0.1 },
        suong: { herbPriceMod: 1, bossPowerMod: 1.3, travelCostMod: 1.2, hiddenNpcChance: 0.2 },
        bao: { herbPriceMod: 1.2, bossPowerMod: 1.5, travelCostMod: 1.5, hiddenNpcChance: 0 },
      }
      return [`${season}_${kind}`, effects[kind]]
    }),
  ),
)

/**
 * Astronomical Lunar Cycle: Day 15 of every 28-day cycle is Blood Moon (Đêm Trăng Máu).
 * Pure deterministic modulo arithmetic.
 */
export function isBloodMoon(day: number): boolean {
  const dayInCycle = ((((day - 1) % 28) + 28) % 28) + 1
  return dayInCycle === 15
}

/**
 * Blood Moon grants +30% combat damage multiplier (1.30) to both player and enemies.
 */
export function bloodMoonDamageModifier(day: number): number {
  return isBloodMoon(day) ? 1.3 : 1.0
}

/**
 * Ngũ Hành × Thời Tiết Combat Matrix:
 * - Rain (mua): Water +25%, Fire -20%, Wood +5%
 * - Clear (quang): Fire +15%, Water -10%
 * - Storm (bao): Metal +25%, Water +15%, Wood -10%
 * - Mist (suong): Wood +15%, Fire -10%
 * Neutral matches return 1.0.
 */
export function elementWeatherModifier(element: Element, weatherKind: WeatherKind): number {
  switch (weatherKind) {
    case 'mua':
      if (element === 'Thủy') return 1.25
      if (element === 'Hỏa') return 0.8
      if (element === 'Mộc') return 1.05
      return 1.0
    case 'quang':
      if (element === 'Hỏa') return 1.15
      if (element === 'Thủy') return 0.9
      return 1.0
    case 'bao':
      if (element === 'Kim') return 1.25
      if (element === 'Thủy') return 1.15
      if (element === 'Mộc') return 0.9
      return 1.0
    case 'suong':
      if (element === 'Mộc') return 1.15
      if (element === 'Hỏa') return 0.9
      return 1.0
    default:
      return 1.0
  }
}

/**
 * Environmental evasion: Mist (suong) grants +15% dodge chance.
 */
export function weatherDodgeBonus(weatherKind: WeatherKind): number {
  return weatherKind === 'suong' ? 0.15 : 0
}

/**
 * Resolves player element affinity from spiritRoot description. Defaults to 'Mộc'.
 */
export function getPlayerElement(state: { spiritRoot?: { elementVi?: string } }): Element {
  const vi = state.spiritRoot?.elementVi ?? ''
  if (vi.includes('Kim')) return 'Kim'
  if (vi.includes('Thủy')) return 'Thủy'
  if (vi.includes('Hỏa')) return 'Hỏa'
  if (vi.includes('Thổ')) return 'Thổ'
  if (vi.includes('Mộc')) return 'Mộc'
  return 'Mộc'
}

/** C3-19: Canonical item IDs for weather mitigation gear */
export const WEATHER_ITEM_RAINCOAT = 'raincoat'
export const WEATHER_ITEM_SUN_GEM = 'sun_gem'
export const WEATHER_ITEM_FOG_TALISMAN = 'fog_talisman'

/**
 * Checks whether the player owns a weather counter-item either equipped in an equipment slot
 * (robe / accessory / weapon) or carried in their inventory bag.
 */
export function hasWeatherCounterItem(
  state: {
    equipment?: { robe?: string | null; accessory?: string | null; weapon?: string | null }
    inventory?: Record<string, number>
  } | null | undefined,
  itemId: string,
): boolean {
  if (!state) return false
  const eq = state.equipment
  if (eq && (eq.robe === itemId || eq.accessory === itemId || eq.weapon === itemId)) {
    return true
  }
  if (state.inventory && (state.inventory[itemId] ?? 0) > 0) {
    return true
  }
  return false
}

/**
 * Derives effective weather effects taking into account active counter-gear:
 * - Raincoat: clamps travelCostMod to 1.0 in rain (mua) and storm (bao).
 * - Fog Talisman: clamps travelCostMod and bossPowerMod to 1.0 in mist (suong).
 * - Sun Gem: clamps travelCostMod to 1.0 in clear sky (quang).
 */
export function getEffectiveWeatherEffects(
  state: {
    equipment?: { robe?: string | null; accessory?: string | null; weapon?: string | null }
    inventory?: Record<string, number>
  } | null | undefined,
  baseEffects: WeatherEffect,
  weatherKind: WeatherKind,
): WeatherEffect {
  const hasRaincoat = hasWeatherCounterItem(state, WEATHER_ITEM_RAINCOAT)
  const hasFogTalisman = hasWeatherCounterItem(state, WEATHER_ITEM_FOG_TALISMAN)
  const hasSunGem = hasWeatherCounterItem(state, WEATHER_ITEM_SUN_GEM)

  let travelCostMod = baseEffects.travelCostMod
  let bossPowerMod = baseEffects.bossPowerMod
  const herbPriceMod = baseEffects.herbPriceMod
  const hiddenNpcChance = baseEffects.hiddenNpcChance

  if ((weatherKind === 'mua' || weatherKind === 'bao') && hasRaincoat) {
    travelCostMod = Math.min(1.0, travelCostMod)
  }
  if (weatherKind === 'suong' && hasFogTalisman) {
    travelCostMod = Math.min(1.0, travelCostMod)
    bossPowerMod = Math.min(1.0, bossPowerMod)
  }
  if (weatherKind === 'quang' && hasSunGem) {
    travelCostMod = Math.min(1.0, travelCostMod)
  }

  return { travelCostMod, bossPowerMod, herbPriceMod, hiddenNpcChance }
}

/**
 * Returns the effective elemental weather combat modifier for an actor,
 * lifting elemental penalties back to 1.0 if the player holds the countering weather gear.
 */
export function getEffectiveElementModifier(
  state: {
    equipment?: { robe?: string | null; accessory?: string | null; weapon?: string | null }
    inventory?: Record<string, number>
  } | null | undefined,
  element: Element,
  weatherKind: WeatherKind,
): number {
  const raw = elementWeatherModifier(element, weatherKind)
  if (raw >= 1.0) return raw
  if ((weatherKind === 'mua' || weatherKind === 'bao') && hasWeatherCounterItem(state, WEATHER_ITEM_RAINCOAT)) {
    return 1.0
  }
  if (weatherKind === 'quang' && hasWeatherCounterItem(state, WEATHER_ITEM_SUN_GEM)) {
    return 1.0
  }
  if (weatherKind === 'suong' && hasWeatherCounterItem(state, WEATHER_ITEM_FOG_TALISMAN)) {
    return 1.0
  }
  return raw
}

/**
 * Returns the environmental dodge bonus. When enemies fight in mist, possessing
 * Fog Talisman strips their environmental evasion bonus (0.15 -> 0).
 */
export function getEffectiveWeatherDodgeBonus(
  state: {
    equipment?: { robe?: string | null; accessory?: string | null; weapon?: string | null }
    inventory?: Record<string, number>
  } | null | undefined,
  weatherKind: WeatherKind,
  actor: 'player' | 'enemy' = 'player',
): number {
  if (actor === 'enemy' && weatherKind === 'suong' && hasWeatherCounterItem(state, WEATHER_ITEM_FOG_TALISMAN)) {
    return 0
  }
  return weatherDodgeBonus(weatherKind)
}


