// Weather: pure deterministic function of (seed, day).
// Intentionally does NOT consume state.rng (see docs/plans/expansion-x20/tasks/T05-weather.md):
// weather must never disturb the determinism of other actions.

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
