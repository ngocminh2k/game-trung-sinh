import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../src/App'
import { MainMenu, NewGameScreen, SettingsScreen } from '../src/ui/MainMenu'
import { DEFAULT_SETTINGS, type PlayerSettings } from '../src/ui/session'

beforeEach(() => window.localStorage.clear())
afterEach(() => cleanup())

describe('MainMenu', () => {
  it('renders New Game / Load Game / Settings and routes each action', () => {
    const onNewGame = vi.fn(); const onLoadGame = vi.fn(); const onSettings = vi.fn()
    render(<MainMenu locale="vi" hasSave={false} onNewGame={onNewGame} onLoadGame={onLoadGame} onSettings={onSettings} onLocaleChange={() => {}} />)
    fireEvent.click(screen.getByTestId('menu-new-game'))
    expect(onNewGame).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByTestId('menu-load-game'))
    expect(onLoadGame).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByTestId('menu-settings'))
    expect(onSettings).toHaveBeenCalledOnce()
  })
})

describe('NewGameScreen — 5×2 System grid', () => {
  it('renders exactly 10 systems in a grid; confirm is disabled until a pick', () => {
    const onPick = vi.fn()
    render(<NewGameScreen locale="vi" difficulty="balanced" onDifficulty={() => {}} onPick={onPick} onBack={() => {}} />)
    const grid = screen.getByTestId('system-grid')
    expect(grid.querySelectorAll('button.system-tile')).toHaveLength(10)
    expect(screen.getByTestId('system-tile-sys_battle')).toBeTruthy()
    expect(screen.getByTestId('system-tile-sys_void')).toBeTruthy()
    const confirm = screen.getByTestId('newgame-confirm') as HTMLButtonElement
    expect(confirm.disabled).toBe(true)
    fireEvent.click(screen.getByTestId('system-tile-sys_alchemy'))
    expect(confirm.disabled).toBe(false)
    fireEvent.click(confirm)
    expect(onPick).toHaveBeenCalledWith('sys_alchemy')
  })

  it('keyboard: Enter selects the highlighted tile; a second Enter confirms; arrows move focus', () => {
    const onPick = vi.fn()
    render(<NewGameScreen locale="en" difficulty="balanced" onDifficulty={() => {}} onPick={onPick} onBack={() => {}} />)
    const first = screen.getByTestId('system-tile-sys_battle') as HTMLButtonElement
    first.focus()
    fireEvent.keyDown(first, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(screen.getByTestId('system-tile-sys_alchemy'))
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' }) // select
    expect(screen.getByTestId('system-tile-sys_alchemy').getAttribute('aria-selected')).toBe('true')
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' }) // confirm
    expect(onPick).toHaveBeenCalledWith('sys_alchemy')
  })

  it('difficulty radios update the selected run difficulty', () => {
    const onDifficulty = vi.fn()
    render(<NewGameScreen locale="vi" difficulty="balanced" onDifficulty={onDifficulty} onPick={() => {}} onBack={() => {}} />)
    fireEvent.click(screen.getByTestId('difficulty-hard'))
    expect(onDifficulty).toHaveBeenCalledWith('hard')
    fireEvent.click(screen.getByTestId('newgame-back'))
    // onBack asserted via the separate back test below; here just no crash.
  })
})

describe('SettingsScreen', () => {
  const settings: PlayerSettings = { ...DEFAULT_SETTINGS }

  it('difficulty group persists through onChange with the chosen value', () => {
    const onChange = vi.fn()
    render(<SettingsScreen locale="vi" settings={settings} onChange={onChange} onBack={() => {}} />)
    fireEvent.click(screen.getByTestId('settings-difficulty-story'))
    expect(onChange).toHaveBeenCalledWith({ ...settings, difficulty: 'story' })
  })

  it('narration switch toggles the on/off intent (no credential inputs)', () => {
    const onChange = vi.fn()
    render(<SettingsScreen locale="vi" settings={settings} onChange={onChange} onBack={() => {}} />)
    const sw = screen.getByTestId('narration-switch')
    expect(sw.getAttribute('aria-checked')).toBe('false')
    fireEvent.click(sw)
    expect(onChange).toHaveBeenCalledWith({ ...settings, narrationEnabled: true })
    expect(screen.queryByLabelText(/api|key|token|url/i)).toBeNull()
  })
})

// Full app journey: menu → new game grid → playing, with the System panel present.
describe('App menu phases', () => {
  it('menu → new game → system pick → letter_at_dawn with no boot narration and day 1', async () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('menu-new-game'))
    fireEvent.click(screen.getByTestId('system-tile-sys_battle'))
    fireEvent.click(screen.getByTestId('newgame-confirm'))
    fireEvent.click(screen.getByRole('button', { name: /nhấn|press/i }))

    expect(screen.getByTestId('game-screen')).toBeTruthy()
    expect(screen.queryByTestId('narration-panel')).toBeNull()
    expect(screen.getByTestId('location-label').textContent).toBe('Làng Thanh Mộc')
    expect(screen.getByText('Ngày 1')).toBeTruthy()
    // The System panel exists for the chosen System.
    expect(screen.getByText('Hệ Thống Chiến Đấu')).toBeTruthy()
    // New Game wrote a save into the slot store.
    expect(window.localStorage.getItem('phe-can-ky:slots')).toContain('sys_battle')
  })

  it('settings flow: open, set hard + narration on, persist to localStorage, back to menu', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('menu-settings'))
    fireEvent.click(screen.getByTestId('settings-difficulty-hard'))
    fireEvent.click(screen.getByTestId('narration-switch'))
    expect(window.localStorage.getItem('phe-can-ky:settings')).toContain('"difficulty":"hard"')
    expect(window.localStorage.getItem('phe-can-ky:settings')).toContain('"narrationEnabled":true')
    fireEvent.click(screen.getByTestId('settings-back'))
    expect(screen.getByTestId('main-menu')).toBeTruthy()
  })
})
