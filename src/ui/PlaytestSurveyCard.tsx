import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { Locale } from '../engine'
import type { GameState } from '../engine'
import { t } from '../i18n'
import { PLAYTEST_NOTE_MAX, type PlaytestSurvey } from './playtest'

interface Props {
  game: GameState
  locale: Locale
  runId: string
  onSubmit: (survey: PlaytestSurvey) => void
}

// Issue #20 — the short post-ending survey from docs/testing/playtest-protocol.md.
// Three Likert rows + one optional note, dismissible, never blocking restart.
export function PlaytestSurveyCard({ game, locale, runId, onSubmit }: Props) {
  const [clarity, setClarity] = useState(3)
  const [agency, setAgency] = useState(3)
  const [pressure, setPressure] = useState(3)
  const [note, setNote] = useState('')
  const [dismissed, setDismissed] = useState(false)
  const [sent, setSent] = useState(false)

  if (dismissed) return null

  const rows: { key: string; label: string; value: number; set: (n: number) => void }[] = [
    { key: 'clarity', label: t(locale, 'ui.playtest.clarity'), value: clarity, set: setClarity },
    { key: 'agency', label: t(locale, 'ui.playtest.agency'), value: agency, set: setAgency },
    { key: 'pressure', label: t(locale, 'ui.playtest.pressure'), value: pressure, set: setPressure },
  ]

  const submit = () => {
    onSubmit({ version: 1, runId, day: game.day, endingId: game.endingId, clarity, agency, pressure, note })
    setSent(true)
  }

  const content = sent ? (
    <div className="playtest-card-portal">
      <p className="playtest-thanks" role="status">{t(locale, 'ui.playtest.thanks')}</p>
    </div>
  ) : (
    <div className="playtest-card-portal" role="region" aria-label={t(locale, 'ui.playtest.title')}>
      <section className="playtest-card">
        <h3>{t(locale, 'ui.playtest.title')}</h3>
        {rows.map((row) => (
          <label key={row.key} className="playtest-row">
            <span>{row.label}</span>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={row.value}
              onChange={(event) => row.set(Number(event.target.value))}
            />
            <output>{row.value}</output>
          </label>
        ))}
        <label className="playtest-row playtest-note">
          <span>{t(locale, 'ui.playtest.freeTextLabel')}</span>
          <textarea
            rows={2}
            maxLength={PLAYTEST_NOTE_MAX}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        <div className="playtest-actions">
          <button type="button" className="playtest-submit" onClick={submit}>{t(locale, 'ui.playtest.submit')}</button>
          <button type="button" className="playtest-skip" onClick={() => setDismissed(true)}>{t(locale, 'ui.playtest.skip')}</button>
        </div>
      </section>
    </div>
  )

  // Portal to document.body so the survey floats above .game-shell's overflow:hidden
  // and above .death-screen (z-index 9999). Falls back to inline render when SSR / no document.
  if (typeof document === 'undefined') return content
  return createPortal(content, document.body)
}
