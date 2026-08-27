import { useEffect, useState } from 'react'
import type { Locale } from '../engine'

// Drifting qi motes — fixed, deterministic positions (no RNG in UI either).
const MOTES = [
  { left: 10, size: 5, delay: 0.2, dur: 4.4 },
  { left: 18, size: 7, delay: 1.1, dur: 5.1 },
  { left: 27, size: 4, delay: 0.6, dur: 4.0 },
  { left: 35, size: 6, delay: 2.0, dur: 5.6 },
  { left: 44, size: 5, delay: 0.9, dur: 4.7 },
  { left: 52, size: 7, delay: 1.6, dur: 5.3 },
  { left: 60, size: 4, delay: 0.3, dur: 4.2 },
  { left: 68, size: 6, delay: 2.3, dur: 5.0 },
  { left: 76, size: 5, delay: 1.0, dur: 4.9 },
  { left: 84, size: 7, delay: 0.5, dur: 5.4 },
  { left: 90, size: 4, delay: 1.8, dur: 4.3 },
  { left: 22, size: 5, delay: 2.6, dur: 5.8 },
  { left: 48, size: 6, delay: 3.1, dur: 5.2 },
  { left: 72, size: 5, delay: 3.4, dur: 4.6 },
]

interface LoadingScreenProps {
  locale: Locale
  onDone: () => void
}

// Ink-wash rebirth intro: a brush-drawn ensō, the broken root mending in gold,
// and qi motes rising. Plays once, then reveals the game (skippable).
export function LoadingScreen({ locale, onDone }: LoadingScreenProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 2200)
    return () => window.clearTimeout(t)
  }, [])

  const finish = () => onDone()

  return (
    <div
      className="loading-screen"
      role="button"
      tabIndex={0}
      aria-label={locale === 'vi' ? 'Màn hình tải — nhấn để bắt đầu' : 'Loading — press to begin'}
      onClick={finish}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          finish()
        }
      }}
    >
      <div className="loading-wash" aria-hidden="true" />

      <div className="loading-stage">
        <svg className="enso" viewBox="0 0 220 220" aria-hidden="true">
          <circle className="enso-ring" cx="110" cy="110" r="84" />
          <circle className="enso-ring enso-ring-ghost" cx="110" cy="110" r="84" />
        </svg>
        <svg className="root" viewBox="0 0 120 170" aria-hidden="true">
          <path className="root-stem" d="M60 165 C 57 128, 65 104, 60 70 C 58 56, 60 46, 60 40" />
          <path className="root-heal" d="M60 165 C 57 128, 65 104, 60 70 C 58 56, 60 46, 60 40" />
          <path className="root-leaf" d="M60 92 C 42 90, 30 78, 34 66 C 50 70, 58 82, 60 92 Z" />
          <path className="root-leaf leaf-r" d="M60 84 C 78 82, 90 70, 86 58 C 70 62, 62 74, 60 84 Z" />
          <path className="root-tendril" d="M60 165 C 52 176, 44 180, 38 188" />
          <path className="root-tendril" d="M60 165 C 68 176, 76 180, 82 188" />
        </svg>
      </div>

      <div className="loading-motes" aria-hidden="true">
        {MOTES.map((mote, index) => (
          <span
            key={index}
            className="mote"
            style={{
              left: `${mote.left}%`,
              width: mote.size,
              height: mote.size,
              animationDelay: `${mote.delay}s`,
              animationDuration: `${mote.dur}s`,
            }}
          />
        ))}
      </div>

      <h1 className="loading-title">{locale === 'vi' ? 'Phế Căn Ký' : 'Tale of the Broken Root'}</h1>
      <p className="loading-subtitle">
        {locale === 'vi' ? 'Truyền kỳ trọng sinh · linh căn phế' : 'A Reborn-Cultivator Saga · The Broken Root'}
      </p>
      {ready && <p className="loading-hint">{locale === 'vi' ? 'Nhấn để bước vào' : 'Press to begin'}</p>}

      <div className="loading-progress" aria-hidden="true"><i /></div>
    </div>
  )
}
