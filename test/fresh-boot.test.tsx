// @vitest-environment jsdom
// E2E BASELINE (round2-queue "STILL OPEN") — App.tsx auto-resumes the active
// slot on boot, so a menu-reaching spec never reaches the menu. `?fresh=1` must
// skip auto-resume and land on the menu WITHOUT touching the saved slot, so a
// later Load Game still resumes it.
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from '../src/App'
import { ACTIVE_SLOT_KEY, SLOTS_KEY } from '../src/ui/session'

/** Real boot path: menu → New Game → System pick → confirm → loading → play.
 *  Leaves a persisted slot 1 marked active, exactly like a human pressing F5. */
function playOnceAndUnmount(): void {
  render(<App />)
  fireEvent.click(screen.getByTestId('menu-new-game'))
  fireEvent.click(screen.getByTestId('system-tile-sys_battle'))
  fireEvent.click(screen.getByTestId('newgame-confirm'))
  fireEvent.click(screen.getByRole('button', { name: /nhấn|press/i }))
  expect(screen.getByTestId('game-screen')).toBeTruthy()
  cleanup()
}

/** jsdom keeps one URL per file; rewrite it before the component reads it. */
function atUrl(url: string): void {
  window.history.replaceState(null, '', url)
}

beforeEach(() => {
  window.localStorage.clear()
  atUrl('/')
})
afterEach(() => cleanup())

describe('?fresh=1 boot flag', () => {
  it('boots to the main menu even though an active slot exists', () => {
    playOnceAndUnmount()
    expect(window.localStorage.getItem(ACTIVE_SLOT_KEY)).toBe('1')

    atUrl('/?fresh=1')
    render(<App />)
    expect(screen.getByTestId('main-menu')).toBeTruthy()
    expect(screen.queryByTestId('game-screen')).toBeNull()
  })

  it('still boots straight into the run when the flag is absent', () => {
    playOnceAndUnmount()

    atUrl('/')
    render(<App />)
    // The auto-resume path: loading intro, then the run after the press.
    expect(screen.queryByTestId('main-menu')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /nhấn|press/i }))
    expect(screen.getByTestId('game-screen')).toBeTruthy()
  })

  it('leaves the slot and its resume marker untouched in storage', () => {
    playOnceAndUnmount()
    const slotsBefore = window.localStorage.getItem(SLOTS_KEY)
    expect(slotsBefore).not.toBeNull()

    atUrl('/?fresh=1')
    render(<App />)
    expect(screen.getByTestId('main-menu')).toBeTruthy()

    expect(window.localStorage.getItem(SLOTS_KEY)).toBe(slotsBefore)
    expect(window.localStorage.getItem(ACTIVE_SLOT_KEY)).toBe('1')
  })

  it('keeps manual Load Game working after a fresh boot', () => {
    playOnceAndUnmount()

    atUrl('/?fresh=1')
    render(<App />)
    fireEvent.click(screen.getByTestId('menu-load-game'))
    fireEvent.click(screen.getByTestId('save-slot-1'))
    fireEvent.click(screen.getByRole('button', { name: /nhấn|press/i }))
    expect(screen.getByTestId('game-screen')).toBeTruthy()
  })

  it('is also honoured when the query sits after the hash', () => {
    playOnceAndUnmount()

    atUrl('/#/run?fresh=1')
    render(<App />)
    expect(screen.getByTestId('main-menu')).toBeTruthy()
  })
})
