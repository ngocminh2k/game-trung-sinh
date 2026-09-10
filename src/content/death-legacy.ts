import type { Locale } from '../engine/types'
import { getEnemy } from './rpg'
import { getLocation } from './locations'

/** A death cause, reduced to its kind plus a readable subject, and the small
 *  inheritance a reborn run carries. Both live as content — the reducer never
 *  sees a prose string, the UI never re-derives a cause. */
export interface DeathReport {
  /** Stable classification: 'combat' | 'danger' | 'qi_deviation' | 'unknown'. */
  readonly kind: DeathKind
  /** Localized name of what killed the player, empty when there is no subject. */
  readonly subject: string
  readonly epitaphVi: string
  readonly epitaphEn: string
  /** One-line tactical advice — the "lesson learned" that makes the retry smarter. */
  readonly hintVi: string
  readonly hintEn: string
  /** The legacy trait this death gifts the next life. */
  readonly trait: LegacyTrait
}

/** A run's hard-won experience, condensed to one inherited attribute point —
 *  the player spends it at rebirth (body/mind/charm/luck), so the lesson of
 *  the last death becomes a deliberate choice in the next. */
export interface LegacyTrait {
  readonly nameVi: string
  readonly nameEn: string
  /** How many attribute points the reborn life starts with. */
  readonly attributePoints: number
}

// The reducer stores the raw cause code on the DEATH event; the death-ending
// flag mirrors it so the epitaph survives a save/reload. Prefixes classify it.
const DANGER_PREFIX = 'danger:'
const COMBAT_PREFIX = 'combat:'

export type DeathKind = 'combat' | 'danger' | 'qi_deviation' | 'unknown'

/** Pure classification of a cause code. Locale-free so the engine can reuse it
 *  to decide the inheritance a reborn life carries. */
export function deathKind(cause: string): DeathKind {
  if (cause.startsWith(COMBAT_PREFIX)) return 'combat'
  if (cause.startsWith(DANGER_PREFIX)) return 'danger'
  if (cause === 'qi_deviation') return 'qi_deviation'
  return 'unknown'
}

/** Maps a cause code to its kind, localized subject, epitaph/hint and trait.
 *  Unknown causes still produce a report — a death is never silent. */
export function describeDeath(cause: string, locale: Locale): DeathReport {
  const kind = deathKind(cause)
  let subject = ''
  if (kind === 'combat') {
    const enemy = getEnemy(cause.slice(COMBAT_PREFIX.length))
    if (enemy !== undefined) subject = locale === 'vi' ? enemy.nameVi : enemy.nameEn
  } else if (kind === 'danger') {
    const location = getLocation(cause.slice(DANGER_PREFIX.length))
    if (location !== undefined) subject = locale === 'vi' ? location.nameVi : location.nameEn
  }
  return { kind, subject, ...authored(kind), ...legacyFor(kind) }
}

function authored(kind: DeathKind): Pick<DeathReport, 'epitaphVi' | 'epitaphEn' | 'hintVi' | 'hintEn'> {
  switch (kind) {
    case 'combat':
      return {
        epitaphVi: 'Kiếp này gục ngã giữa giao tranh.',
        epitaphEn: 'This life fell in the thick of battle.',
        hintVi: 'Đừng ham đòn: giữ khí để thủ thế, hoặc lui bước khi huyết cạn.',
        hintEn: 'Do not trade blow for blow — guard, or retreat before your health runs dry.',
      }
    case 'danger':
      return {
        epitaphVi: 'Hiểm địa đã nuốt mất kiếp này.',
        epitaphEn: 'The deadly ground swallowed this life.',
        hintVi: 'Mang bùa hộ thân, hoặc đừng đặt chân vào hiểm địa khi huyết khí còn mỏng.',
        hintEn: 'Carry a warding talisman, or do not step into deadly ground on thin health.',
      }
    case 'qi_deviation':
      return {
        epitaphVi: 'Tẩu hỏa nhập ma — cưỡng cầu cảnh giới, trả giá bằng chính kiếp này.',
        epitaphEn: 'Qi deviation — you forced the breakthrough and this life paid for it.',
        hintVi: 'Tu luyện hao tổn huyết khí: nghỉ ngơi hồi phục trước khi ép cảnh giới.',
        hintEn: 'Cultivation drains blood-qi: rest to recover before pushing a realm.',
      }
    default:
      return {
        epitaphVi: 'Kiếp này đứt gánh giữa đường.',
        epitaphEn: 'This life was cut short on the road.',
        hintVi: 'Lắng nghe lời cảnh báo của giang hồ để không lặp lại sai lầm.',
        hintEn: 'Heed the warnings of the jianghu, and do not repeat the same mistake.',
      }
  }
}

// One point of hard-won experience per fallen life, inherited as a starting
// attribute point the player chooses how to spend (ponytail: per-kind caps and
// stacking rules come later if rebirth runs ever chain past a handful).
const LEGACY_ATTRIBUTE_POINTS = 1

const LEGACY_TRAITS: Record<DeathKind, Omit<LegacyTrait, 'attributePoints'>> = {
  combat: { nameVi: 'Trận Tiền Tương Bản', nameEn: 'Veteran’s Token' },
  qi_deviation: { nameVi: 'Dư Âm Cảnh Giới', nameEn: 'Echo of the Realm' },
  danger: { nameVi: 'Tàn Tích Hộ Thân', nameEn: 'Warden’s Remnant' },
  unknown: { nameVi: 'Chút Kiêu Hãnh Sống Sót', nameEn: 'Bare Survival' },
}

function legacyFor(kind: DeathKind): { trait: LegacyTrait } {
  return { trait: { ...LEGACY_TRAITS[kind], attributePoints: LEGACY_ATTRIBUTE_POINTS } }
}

/** The attribute points a life reborn from a fallen one inherits: one point for
 *  any recorded death, none for a life that never died (null/undefined/empty).
 *  The gift is deliberately flat across kinds — the kind decides the trait's
 *  name and the epitaph's lesson, not its size (see LEGACY_ATTRIBUTE_POINTS). */
export function legacyPointsFor(cause: string | null | undefined): number {
  if (cause === null || cause === undefined || cause === '') return 0
  return LEGACY_ATTRIBUTE_POINTS
}
