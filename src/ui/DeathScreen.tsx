import type { CSSProperties } from 'react'
import type { Locale } from '../engine'
import type { EndingDef } from '../engine/content-types'
import { t } from '../i18n'

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
  onRestart: () => void
  onDismiss: () => void
}

// Game-over: the ensō shatters, the soul-token cracks and fades, ashes fall.
// Shows the authored death epitaph and offers rebirth (restart) or stepping back.
export function DeathScreen({ locale, ending, onRestart, onDismiss }: DeathScreenProps) {
  const epitaph = locale === 'vi' ? ending.epitaphVi : ending.epitaphEn

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

        <div className="death-actions">
          <button type="button" className="death-restart" onClick={onRestart}>
            {t(locale, 'ui.death.restart')}
          </button>
          <button type="button" className="death-dismiss" onClick={onDismiss}>
            {t(locale, 'ui.death.dismiss')}
          </button>
        </div>
      </div>
    </div>
  )
}
