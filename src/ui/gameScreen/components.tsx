import type { Locale, EquipmentState, AttributeName, Attrs } from '../../engine'
import { ATTRIBUTE_MAX } from '../../engine'
import { getEquipmentByItem, getItem } from '../../content'
import { REALM_STAGES } from './constants'
import { localized, word } from './helpers'
import type { KeyboardEvent, RefObject } from 'react'

function InkCorner({ corner }: { corner: 'top-left' | 'top-right' | 'bottom-left' }): JSX.Element {
  return <svg aria-hidden="true" className={`ink-corner ink-corner--${corner}`} data-testid="ink-corner" viewBox="0 0 72 52">
    <path d="M3 45C16 40 13 24 29 24c13 0 12-15 37-18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
    <path d="M7 49c14-2 15-12 24-16 8-3 20-2 35-22" fill="none" opacity=".55" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" />
    <path d="M49 8c8 1 14 0 20-5" fill="none" opacity=".36" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
  </svg>
}

interface MeterProps {
  className?: string
  label: string
  value: number
  max: number
  tone: 'red' | 'jade' | 'gold'
  delta?: number
  deltaTestid?: string
  low?: boolean
}

function Meter({ className = '', label, value, max, tone, delta = 0, deltaTestid, low = false }: MeterProps) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={`meter ${className} ${delta !== 0 ? (delta > 0 ? 'delta-up' : 'delta-down') : ''}`} data-low-hp-for-train={low ? 'true' : undefined} role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-valuetext={`${label} ${value} of ${max} (${percent}%)`}>
      <div>
        <span>{label}</span>
        {delta !== 0 && deltaTestid !== undefined && (
          <em className="meter-delta" data-testid={deltaTestid} data-direction={delta > 0 ? 'up' : 'down'}>
            {delta > 0 ? `+${String(delta)}` : String(delta)}
          </em>
        )}
        <strong>{value}/{max}</strong>
      </div>
      <span className={`meter-track ${tone}`}><i style={{ width: `${percent}%` }} /></span>
    </div>
  )
}

interface RealmLadderProps {
  stage: number
  locale: Locale
}

// The realm ladder is the genre's signature progress read: six seals from
// mortal breathing to ascension, the current rung lit like a fresh stamp.
function RealmLadder({ stage, locale }: RealmLadderProps) {
  return (
    <div className="realm-ladder" role="img" aria-label={word(locale, 'Thang cảnh giới tu luyện', 'Cultivation realm ladder')} data-testid="realm-ladder">
      {REALM_STAGES.map((entry, index) => {
        const reached = index <= stage
        const current = index === stage
        return (
          <span className={`realm-rung ${reached ? 'is-reached' : ''} ${current ? 'is-current' : ''}`} key={entry.en} title={`${locale === 'vi' ? entry.vi : entry.en}${current ? ` · ${word(locale, 'hiện tại', 'current')}` : ''}`}>
            <i aria-hidden="true">{entry.seal}</i>
            <em>{locale === 'vi' ? entry.vi : entry.en}</em>
          </span>
        )
      })}
    </div>
  )
}

interface ChapterProgressProps {
  current: number
  total: number
  locale: Locale
}

function ChapterProgress({ current, total, locale }: ChapterProgressProps) {
  return (
    <span className="chapter-progress" aria-label={word(locale, `Chương ${String(current)} trên ${String(total)}`, `Chapter ${String(current)} of ${String(total)}`)}>
      {Array.from({ length: total }, (_, index) => (
        <i className={index < current ? 'is-lit' : ''} key={index} />
      ))}
      <em>{word(locale, `${String(current)}/${String(total)}`, `${String(current)}/${String(total)}`)}</em>
    </span>
  )
}

interface HoiDotsProps {
  current: number
  total: number
  locale: Locale
  onOpenCodex?: () => void
}

// Hồi I-VI micro-dots: filled = past, ringed = current, dim = future.
// Counts up to six so the banner stays a quiet six-stamp read even when the
// chronicle has more chapters behind it.
function HoiDots({ current, total, locale, onOpenCodex }: HoiDotsProps) {
  const capped = Math.min(total, 6)
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const interactive = onOpenCodex !== undefined
  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (!interactive) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpenCodex()
    }
  }
  return (
    <span
      aria-label={interactive
        ? `${word(locale, `Hồi tiến trình ${String(Math.min(current, capped))} trên ${String(capped)}`, `Hồi progress ${String(Math.min(current, capped))} of ${String(capped)}`)}. ${word(locale, 'Nhấn Enter để xem chi tiết', 'Press Enter to see details')}`
        : word(locale, `Hồi tiến trình ${String(Math.min(current, capped))} trên ${String(capped)}`, `Hồi progress ${String(Math.min(current, capped))} of ${String(capped)}`)}
      className={`hoi-dots ${reduced ? 'is-reduced' : ''}`}
      onKeyDown={handleKeyDown}
      role={interactive ? 'button' : 'img'}
      tabIndex={interactive ? 0 : -1}
    >
      {Array.from({ length: capped }, (_, index) => {
        const isPast = index + 1 < current
        const isCurrent = index + 1 === current
        return <i aria-hidden="true" className={isPast ? 'is-past' : isCurrent ? 'is-current' : 'is-future'} data-state={isPast ? 'past' : isCurrent ? 'current' : 'future'} key={index} />
      })}
    </span>
  )
}

export { ChapterProgress, HoiDots, InkCorner, Meter, RealmLadder }
export type { ChapterProgressProps, HoiDotsProps, MeterProps, RealmLadderProps }

interface AttributeAllocationProps {
  attrs: Attrs
  headingRef: RefObject<HTMLHeadingElement>
  locale: Locale
  points: number
  onAllocate: (attribute: AttributeName) => void
}

function AttributeAllocation({ attrs, headingRef, locale, points, onAllocate }: AttributeAllocationProps) {
  const options: ReadonlyArray<{ attribute: AttributeName; vi: string; en: string }> = [
    { attribute: 'body', vi: 'Thân', en: 'Body' },
    { attribute: 'mind', vi: 'Tâm', en: 'Mind' },
    { attribute: 'charm', vi: 'Mị', en: 'Charm' },
    { attribute: 'luck', vi: 'Vận', en: 'Luck' },
  ]
  return <section aria-label={word(locale, 'Phân bổ thuộc tính', 'Allocate attribute points')} className="attribute-allocation" role="region">
    <h3 ref={headingRef} tabIndex={-1}>{word(locale, 'Phân bổ thuộc tính', 'Allocate attribute points')}</h3>
    <p role="status">{word(locale, `Còn ${String(points)} điểm`, `${String(points)} points remaining`)}</p>
    <div>
      {options.map(({ attribute, vi, en }) => {
        const name = word(locale, vi, en)
        const value = attrs[attribute]
        const capped = value >= ATTRIBUTE_MAX
        return <button
          aria-label={word(locale, `Tăng ${name} (${String(value)}/${String(ATTRIBUTE_MAX)}), tốn 1 điểm`, `Increase ${name} (${String(value)}/${String(ATTRIBUTE_MAX)}), costs 1 point`)}
          disabled={capped}
          key={attribute}
          onClick={() => onAllocate(attribute)}
          type="button"
        >{name} · {value}/{ATTRIBUTE_MAX} · +1</button>
      })}
    </div>
  </section>
}

function EquipmentSummary({ equipment, locale }: { equipment: EquipmentState; locale: Locale }) {
  const slots: ReadonlyArray<{ slot: keyof EquipmentState; vi: string; en: string }> = [
    { slot: 'weapon', vi: 'Vũ khí', en: 'Weapon' },
    { slot: 'robe', vi: 'Pháp bào', en: 'Robe' },
    { slot: 'accessory', vi: 'Phụ kiện', en: 'Accessory' },
  ]
  return <section aria-label={word(locale, 'Trang bị đang dùng', 'Equipped items')} className="equipment-summary">
    <h3>{word(locale, 'Trang bị đang dùng', 'Equipped items')}</h3>
    <dl>{slots.map(({ slot, vi, en }) => {
      const itemId = equipment[slot]
      const def = itemId === null ? undefined : getEquipmentByItem(itemId)
      const name = itemId === null ? word(locale, 'Trống', 'Empty') : localized(locale, def ?? getItem(itemId)!)
      const bonus = def === undefined ? '' : `Công +${String(def.attackBonus)} / Thủ +${String(def.defenseBonus)} / Khí +${String(def.qiBonus)}`
      const tooltip = def === undefined ? name : `${name} — ${word(locale, def.descVi, def.descEn)} · ${bonus}`
      return <div key={slot}><dt>{word(locale, vi, en)}</dt><dd title={tooltip}>{name}{def === undefined ? null : <><br /><span className="equipment-bonus">{bonus}</span></>}</dd></div>
    })}</dl>
  </section>
}

export { AttributeAllocation, EquipmentSummary }
export type { AttributeAllocationProps }
