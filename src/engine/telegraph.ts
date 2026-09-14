// Issue #37 — telegraph danger BEFORE it bites. The reducer rolls step damage
// (danger * 10 + 0..6, times difficulty/time-of-day/weather); the player could
// never see that coming, and the AI playtest died "to invisible step damage".
// This module re-derives the SAME numbers from state as a prediction. It is
// pure read-only — no rng consumption, no state writes — so determinism of the
// engine is untouched. `ponytail:` the ceiling: it mirrors doMove's formula,
// so if doMove's damage math changes, change it here too (the unit test pins
// both paths to one fixture to catch drift).
import { getLocation, getQuest, locationDanger } from '../content'
import { HIGH_DANGER_LEVEL, ITEM_TALISMAN, damageMultiplier } from './constants'
import type { GameState } from './types'
import { TIME_MODS, currentTimeOfDay } from './time'
import { flagNum } from './utils'
import { WEATHER_EFFECTS, weatherFor } from './weather'

export interface TravelRisk {
  /** Expected HP cost range of entering the zone, current modifiers applied. */
  readonly min: number
  readonly max: number
  /** true when the warding talisman would absorb the hit instead. */
  readonly warded: boolean
  /** Weather is multiplying the tax today (mist 1.2x, storm 1.5x). */
  readonly weatherAmplified: boolean
  /** 0 when no danger; used by UI to decide whether to render the estimate. */
  readonly danger: number
  /** Region entry already rolled today (doMove's once/day/zone throttle). */
  readonly freeToday: boolean
}

/**
 * Predicted cost of crossing INTO the location on `day`/weather of `state`.
 * Mirrors doMove: damage = round((danger*10 + 0..6) * difficulty * timeMod * travelCostMod).
 * Same-location lookups model authored danger nodes, which always roll.
 */
export function travelRisk(state: GameState, locationId: string): TravelRisk {
  const danger = locationDanger(locationId)
  if (danger <= 0) return { min: 0, max: 0, warded: false, weatherAmplified: false, danger: 0, freeToday: false }
  // `ponytail:` the entering-region model mirrors doMove's throttle, which keys
  // off the authored `exitTo` crossing — i.e. it assumes authored data never
  // has an in-region exitTo self-loop. If content ever authors one, both sides
  // need the same fix; the unit test walks real authored paths to catch drift.
  const enteringRegion = locationId !== state.player.locationId
  const freeToday = enteringRegion && flagNum(state.flags, `danger_tick_${locationId}`) === state.day
  if (freeToday) return { min: 0, max: 0, warded: false, weatherAmplified: false, danger, freeToday: true }
  const timeDamageMod = TIME_MODS[currentTimeOfDay(state)].dangerDamage
  const weatherMod = WEATHER_EFFECTS[weatherFor(state.seed, state.day).id]?.travelCostMod ?? 1
  const diffMod = damageMultiplier(state.difficulty ?? 'balanced')
  // Round-5 review (CRITICAL): multiply in doMove's EXACT operand order —
  // ((rolled * diff) * time) * weather. Pre-factoring `diff * time * weather`
  // into a scale is not float-associative: hard+Sáng+Sương gave round(13.5)=14
  // here vs round(10*1.34999…)=13, an under-promise of the minimum hit.
  const min = Math.max(1, Math.round(danger * 10 * diffMod * timeDamageMod * weatherMod))
  const max = Math.max(min, Math.round((danger * 10 + 6) * diffMod * timeDamageMod * weatherMod))
  const warded = danger >= HIGH_DANGER_LEVEL && (state.inventory[ITEM_TALISMAN] ?? 0) > 0
  return { min, max, warded, weatherAmplified: weatherMod > 1, danger, freeToday: false }
}

/** Bilingual tooltip line, e.g. "⚠ entering: −9..−23 HP · mist doubles the tax". */
export function travelRiskLabel(risk: TravelRisk, locale: 'vi' | 'en'): string {
  if (risk.danger <= 0) return ''
  if (risk.freeToday) return locale === 'vi' ? '⚠ đã vào vùng này hôm nay — miễn sát thương' : '⚠ already entered today — no damage'
  const range = locale === 'vi' ? `bước vào −${String(risk.min)}..−${String(risk.max)} HP` : `entering −${String(risk.min)}..−${String(risk.max)} HP`
  const amp = locale === 'vi' ? ' · thời tiết đang tăng sát thương' : ' · weather is amplifying it'
  const ward = risk.warded ? (locale === 'vi' ? ' · bùa hộ thân sẽ đỡ' : ' · a talisman absorbs it') : ''
  return `⚠ ${range}${risk.weatherAmplified ? amp : ''}${ward}`
}

/**
 * Issue #38 — "where am I" line prepended to the chronicle when a save is
 * resumed (p18 churned because context was lost between sessions). Built
 * from state alone: day, place, realm, and the one thing in flight.
 */
export function resumeContextLine(state: GameState, locale: 'vi' | 'en'): string {
  const loc = getLocation(state.player.locationId)
  const place = loc === undefined ? state.player.locationId : (locale === 'vi' ? loc.nameVi : loc.nameEn)
  const stage = locale === 'vi' ? `tầng ${String(state.player.stage)}` : `stage ${String(state.player.stage)}`
  const activeQuest = Object.entries(state.quests).find(([, rt]) => rt.status === 'active')
  const questDef = activeQuest === undefined ? undefined : getQuest(activeQuest[0])
  const questName = questDef === undefined ? activeQuest?.[0] : (locale === 'vi' ? questDef.nameVi : questDef.nameEn)
  const goal = activeQuest === undefined || questName === undefined
    ? (locale === 'vi' ? 'chưa có nhiệm vụ — thử nói chuyện với mọi người' : 'no quest in flight — try talking to someone')
    : (locale === 'vi' ? `đang làm: ${questName}` : `in progress: ${questName}`)
  return locale === 'vi'
    ? `— Hồi tưởng: Ngày ${String(state.day)} · đang ở ${place} · ${stage} · ${goal}.`
    : `— Where you left off: Day ${String(state.day)} · ${place} · ${stage} · ${goal}.`
}
