import { useEffect, useRef, useState } from 'react'
import { SYSTEMS } from '../content/system-defs'
import type { GameDifficulty, Locale } from '../engine'
import { t } from '../i18n'
import type { PlayerSettings } from './session'

// ---------------------------------------------------------------------------
// Main menu — rice-paper title scene. New Game / Load Game / Settings.
// ---------------------------------------------------------------------------

export interface MainMenuProps {
  locale: Locale
  hasSave: boolean
  onNewGame: () => void
  onLoadGame: () => void
  onSettings: () => void
  onLocaleChange: (locale: Locale) => void
}

export function MainMenu({ locale, hasSave, onNewGame, onLoadGame, onSettings, onLocaleChange }: MainMenuProps) {
  const firstAction = useRef<HTMLButtonElement>(null)
  useEffect(() => { firstAction.current?.focus() }, [])

  return <main className="menu-screen" data-testid="main-menu" aria-labelledby="menu-title">
    <div className="menu-wash" aria-hidden="true" />
    <div className="menu-seal" aria-hidden="true">命</div>
    <section className="menu-panel">
      <p className="menu-kicker">{t(locale, 'ui.loading.subtitle')}</p>
      <h1 id="menu-title">{t(locale, 'common.appName')}</h1>
      <p className="menu-tagline">{t(locale, 'common.tagline')}</p>
      <div className="menu-actions">
        <button ref={firstAction} className="menu-action" data-testid="menu-new-game" onClick={onNewGame}>
          {t(locale, 'common.newGame')}
        </button>
        <button className="menu-action" data-testid="menu-load-game" onClick={onLoadGame}>
          {hasSave ? t(locale, 'common.continueGame') : t(locale, 'ui.saveSlots.title')}
        </button>
        <button className="menu-action" data-testid="menu-settings" onClick={onSettings}>
          {t(locale, 'common.settings')}
        </button>
      </div>
      <div className="menu-locale" role="group" aria-label="Language">
        <button aria-pressed={locale === 'vi'} onClick={() => onLocaleChange('vi')}>VI</button>
        <button aria-pressed={locale === 'en'} onClick={() => onLocaleChange('en')}>EN</button>
      </div>
    </section>
  </main>
}

// ---------------------------------------------------------------------------
// New Game — 5×2 System reliquary grid + run difficulty, before any save.
// ---------------------------------------------------------------------------

export interface NewGameScreenProps {
  locale: Locale
  difficulty: GameDifficulty
  onDifficulty: (difficulty: GameDifficulty) => void
  onPick: (systemId: string) => void
  onBack: () => void
}

const DIFFICULTIES: GameDifficulty[] = ['story', 'balanced', 'hard']

export function NewGameScreen({ locale, difficulty, onDifficulty, onPick, onBack }: NewGameScreenProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => {
    const first = gridRef.current?.querySelector<HTMLButtonElement>('button.system-tile')
    first?.focus()
  }, [])

  // Roving focus across the 5-column grid; arrows wrap both directions.
  const moveFocus = (current: HTMLButtonElement, offset: number) => {
    const buttons = [...gridRef.current?.querySelectorAll<HTMLButtonElement>('button.system-tile') ?? []]
    const index = buttons.indexOf(current)
    if (index >= 0) buttons[(index + offset + buttons.length) % buttons.length]?.focus()
  }

  return <main className="menu-screen menu-newgame" data-testid="new-game-screen" aria-labelledby="newgame-title">
    <div className="menu-wash" aria-hidden="true" />
    <section className="menu-panel menu-newgame-panel">
      <button className="menu-back" data-testid="newgame-back" onClick={onBack}>{t(locale, 'common.back')}</button>
      <h1 id="newgame-title">{t(locale, 'ui.newGame.title')}</h1>
      <p className="menu-tagline">{t(locale, 'ui.newGame.subtitle')}</p>

      <div className="system-grid" ref={gridRef} role="listbox" aria-label={t(locale, 'system.chooseOne')} data-testid="system-grid">
        {SYSTEMS.map((system) => {
          const name = locale === 'vi' ? system.nameVi : system.nameEn
          const persona = locale === 'vi' ? system.personalityVi : system.personalityEn
          const selected = picked === system.id
          return <button
            key={system.id}
            role="option"
            aria-selected={selected}
            className="system-tile"
            data-system-id={system.id}
            data-testid={`system-tile-${system.id}`}
            data-selected={selected}
            onClick={() => {
              if (selected) onPick(system.id)
              else setPicked(system.id)
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') { event.preventDefault(); moveFocus(event.currentTarget, 1) }
              if (event.key === 'ArrowLeft') { event.preventDefault(); moveFocus(event.currentTarget, -1) }
              if (event.key === 'ArrowDown') { event.preventDefault(); moveFocus(event.currentTarget, 5) }
              if (event.key === 'ArrowUp') { event.preventDefault(); moveFocus(event.currentTarget, -5) }
              if (event.key === 'Enter') {
                event.preventDefault()
                if (selected) onPick(system.id)
                else setPicked(system.id)
              }
              if (event.key === 'Escape') { event.preventDefault(); onBack() }
            }}
          >
            <span className="system-tile-order">{system.order}</span>
            <span className="system-tile-name">{name}</span>
            <span className="system-tile-persona">{persona}</span>
          </button>
        })}
      </div>

      <div className="newgame-footer">
        <div className="difficulty-group" role="radiogroup" aria-label={t(locale, 'system.difficulty')} data-testid="difficulty-group">
          <span className="difficulty-label">{t(locale, 'system.difficulty')}</span>
          {DIFFICULTIES.map((option) => (
            <button
              key={option}
              role="radio"
              aria-checked={difficulty === option}
              className="difficulty-option"
              data-testid={`difficulty-${option}`}
              onClick={() => onDifficulty(option)}
            >{t(locale, `ui.settings.difficulty.${option}`)}</button>
          ))}
        </div>
        <button
          className="menu-action menu-confirm"
          data-testid="newgame-confirm"
          disabled={picked === null}
          onClick={() => { if (picked !== null) onPick(picked) }}
        >{t(locale, 'ui.newGame.confirm')}</button>
      </div>
    </section>
  </main>
}

// ---------------------------------------------------------------------------
// Settings — device-local defaults + narration proxy intent (no secrets).
// ---------------------------------------------------------------------------

export interface SettingsScreenProps {
  locale: Locale
  settings: PlayerSettings
  onChange: (settings: PlayerSettings) => void
  onBack: () => void
}

export function SettingsScreen({ locale, settings, onChange, onBack }: SettingsScreenProps) {
  return <main className="menu-screen menu-settings" data-testid="settings-screen" aria-labelledby="settings-title">
    <div className="menu-wash" aria-hidden="true" />
    <section className="menu-panel menu-settings-panel">
      <button className="menu-back" data-testid="settings-back" onClick={onBack}>{t(locale, 'common.back')}</button>
      <h1 id="settings-title">{t(locale, 'common.settings')}</h1>

      <div className="settings-group">
        <h2>{t(locale, 'system.difficulty')}</h2>
        <p className="settings-hint">{t(locale, 'ui.settings.difficultyHint')}</p>
        <div className="difficulty-group" role="radiogroup" aria-label={t(locale, 'system.difficulty')}>
          {DIFFICULTIES.map((option) => (
            <button
              key={option}
              role="radio"
              aria-checked={settings.difficulty === option}
              className="difficulty-option"
              data-testid={`settings-difficulty-${option}`}
              onClick={() => onChange({ ...settings, difficulty: option })}
            >{t(locale, `ui.settings.difficulty.${option}`)}</button>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <h2>{t(locale, 'ui.settings.narrationTitle')}</h2>
        <p className="settings-hint">{t(locale, 'ui.settings.narrationHint')}</p>
        <button
          role="switch"
          aria-checked={settings.narrationEnabled}
          className="narration-switch"
          data-testid="narration-switch"
          onClick={() => onChange({ ...settings, narrationEnabled: !settings.narrationEnabled })}
        >
          <span className="narration-track" aria-hidden="true"><i /></span>
          {t(locale, settings.narrationEnabled ? 'ui.settings.narrationOn' : 'ui.settings.narrationOff')}
        </button>
      </div>

      <div className="settings-group">
        <h2>Language</h2>
        <div className="menu-locale" role="group" aria-label="Language">
          <button aria-pressed={locale === 'vi'} onClick={() => onChange({ ...settings, locale: 'vi' })}>VI</button>
          <button aria-pressed={locale === 'en'} onClick={() => onChange({ ...settings, locale: 'en' })}>EN</button>
        </div>
      </div>
    </section>
  </main>
}
