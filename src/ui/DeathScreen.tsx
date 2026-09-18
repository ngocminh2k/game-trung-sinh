import { useEffect, useRef, type CSSProperties, useState } from 'react'
import { describeDeath } from '../content/death-legacy'
import type { Locale } from '../engine'
import type { EndingDef } from '../engine/content-types'
import { t } from '../i18n'
import { ENDINGS, endingArchetype, type MajorEndingArchetype } from '../content/endings-data'

// Falling ashes / petals — fixed, deterministic spread (no RNG).
const PETALS = [
  { left: 4, delay: 0.0, dur: 9.0, drift: -30, scale: 1.0 },
  { left: 12, delay: 1.4, dur: 11.0, drift: 24, scale: 0.8 },
  { left: 20, delay: 0.6, dur: 8.0, drift: -18, scale: 1.2 },
  { left: 28, delay: 2.2, dur: 10.5, drift: 36, scale: 0.7 },
  { left: 36, delay: 0.9, dur: 9.6, drift: -24, scale: 1.0 },
  { left: 44, delay: 1.9, dur: 12.0, drift: 20, scale: 0.9 },
  { left: 52, delay: 0.3, dur: 8.4, drift: -36, scale: 1.1 },
  { left: 60, delay: 2.7, dur: 10.0, drift: 28, scale: 0.8 },
  { left: 68, delay: 1.1, dur: 9.2, drift: -20, scale: 1.0 },
  { left: 76, delay: 0.5, dur: 11.4, drift: 32, scale: 0.7 },
  { left: 84, delay: 2.0, dur: 8.8, drift: -28, scale: 1.2 },
  { left: 92, delay: 1.6, dur: 10.6, drift: 18, scale: 0.9 },
  { left: 16, delay: 3.1, dur: 9.8, drift: -22, scale: 0.8 },
  { left: 32, delay: 3.4, dur: 11.8, drift: 30, scale: 1.1 },
  { left: 48, delay: 2.4, dur: 8.6, drift: -34, scale: 0.9 },
  { left: 64, delay: 3.0, dur: 10.2, drift: 22, scale: 1.0 },
  { left: 80, delay: 2.9, dur: 9.4, drift: -16, scale: 0.8 },
  { left: 88, delay: 3.6, dur: 11.2, drift: 26, scale: 1.1 },
]

interface DeathScreenProps {
  locale: Locale
  ending: EndingDef
  /** Raw cause code from the dying run (e.g. 'combat:mist_boar'). Empty when
   *  the life closed without a recorded death (non-tragic endings). */
  cause: string
  onRestart: () => void
  onDismiss: () => void
  unlockedEndingIds?: readonly string[]
}

// Game-over: the ensō shatters, the soul-token cracks and fades, ashes fall.
// Shows the authored death epitaph, what killed this life and one tactical
// lesson, plus the legacy trait the next run inherits — Positive Failure.
export function DeathScreen({ locale, ending, cause, onRestart, onDismiss, unlockedEndingIds = [] }: DeathScreenProps) {
  const report = cause === '' ? null : describeDeath(cause, locale)
  const epitaph = locale === 'vi' ? ending.epitaphVi : ending.epitaphEn
  // Issue #40 round-6 review MEDIUM-2: this is role="dialog" aria-modal but
  // nothing moved focus here on mount, so keyboard/SR users stayed in the
  // (now also inert) world behind it. Land on the primary action.
  const restartRef = useRef<HTMLButtonElement | null>(null)
  const [showGallery, setShowGallery] = useState(false)
  useEffect(() => {
    restartRef.current?.focus()
  }, [])

  // Major ending archetypes for gallery cells
  const MAJOR_ARCHETYPES: MajorEndingArchetype[] = [
    'mortal_harmony',
    'sect_heir',
    'rift_darkness',
    'ascension',
    'rogue_wanderer',
    'tragic_fallen'
  ]

  const getGalleryCells = () => {
    return MAJOR_ARCHETYPES.map(archetype => {
      const endings = ENDINGS.filter(e => endingArchetype(e.id) === archetype)
      const unlockedEnding = endings.find(e => unlockedEndingIds.includes(e.id))
      const isUnlocked = !!unlockedEnding
      const representative = unlockedEnding ?? endings[0] ?? ENDINGS[0]!
      return {
        archetype,
        name: locale === 'vi' ? representative.nameVi : representative.nameEn,
        epitaph: locale === 'vi' ? representative.epitaphVi : representative.epitaphEn,
        isUnlocked,
        hint: isUnlocked ? undefined : locale === 'vi'
          ? 'Chưa mở khóa — tiếp tục tu hành'
          : 'Not yet unlocked — continue cultivation'
      }
    })
  }

  return (
    <div className="death-screen" role="dialog" aria-modal="true" aria-label={t(locale, 'ui.death.aria')}>
      <div className="death-vignette" aria-hidden="true" />

      <svg className="death-enso" viewBox="0 0 240 240" aria-hidden="true">
        <circle className="death-enso-ring" cx="120" cy="120" r="92" />
        <path className="death-enso-crack" d="M120 28 L 112 70 L 128 104 L 116 150 L 126 196" />
      </svg>

      <div className="death-petals" aria-hidden="true">
        {PETALS.map((petal, index) => (
          <span
            key={index}
            className="petal"
            style={{
              left: `${petal.left}%`,
              animationDelay: `${petal.delay}s`,
              animationDuration: `${petal.dur}s`,
              transform: `scale(${petal.scale})`,
              ['--drift' as string]: `${petal.drift}px`,
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="death-core">
        <svg className="death-token" viewBox="0 0 120 120" aria-hidden="true">
          <circle className="token-ring" cx="60" cy="60" r="44" />
          <text className="token-glyph" x="60" y="60" textAnchor="middle" dominantBaseline="central">你</text>
          <path className="token-crack" d="M60 16 L 54 44 L 66 70 L 56 96 L 64 120" />
        </svg>

        <h2 className="death-title">{t(locale, 'ui.death.title')}</h2>
        <p className="death-epitaph">{epitaph}</p>

        {report !== null && (
          <div className="death-lesson">
            <p className="death-cause">
              <span className="death-lesson-label">{t(locale, 'ui.death.cause')}</span>
              {report.subject !== '' ? `${report.subject} — ` : ''}
              {locale === 'vi' ? report.epitaphVi : report.epitaphEn}
            </p>
            <p className="death-hint">
              <span className="death-lesson-label">{t(locale, 'ui.death.hint')}</span>
              {locale === 'vi' ? report.hintVi : report.hintEn}
            </p>
            <p className="death-legacy">
              <span className="death-lesson-label">{t(locale, 'ui.death.legacy')}</span>
              {locale === 'vi' ? report.trait.nameVi : report.trait.nameEn}
              {' — '}
              {t(locale, 'ui.death.legacyPoints', { count: report.trait.attributePoints })}
            </p>
          </div>
        )}

        <div className="death-actions">
          <button ref={restartRef} type="button" className="death-restart" onClick={onRestart}>
            {t(locale, 'ui.death.restart')}
          </button>
          <button type="button" className="death-dismiss" onClick={onDismiss}>
            {t(locale, 'ui.death.dismiss')}
          </button>
          <button type="button" className="death-gallery-toggle" onClick={() => setShowGallery(!showGallery)}>
            {showGallery ? t(locale, 'ui.death.gallery.hide') : t(locale, 'ui.death.gallery.show')}
          </button>
        </div>
      </div>

      {showGallery && (
        <div className="death-gallery" role="region" aria-label={t(locale, 'ui.death.gallery.aria')}>
          <h3 className="death-gallery-title">{t(locale, 'ui.death.gallery.title')}</h3>
          <div className="death-gallery-grid">
            {getGalleryCells().map((cell) => (
              <div
                key={cell.archetype}
                className={`death-gallery-cell ${cell.isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="death-gallery-cell-name">{cell.name}</div>
                <div className="death-gallery-cell-epitaph">{cell.epitaph}</div>
                {!cell.isUnlocked && cell.hint && (
                  <div className="death-gallery-cell-hint">{cell.hint}</div>
                )}
                {cell.isUnlocked && (
                  <div className="death-gallery-cell-unlocked">
                    {t(locale, 'ui.death.gallery.unlocked')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
