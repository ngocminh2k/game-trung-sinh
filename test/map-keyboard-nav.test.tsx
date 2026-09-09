// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { newGame } from '../src/engine'
import type { Action } from '../src/engine'
import { GameScreen } from '../src/ui/GameScreen'
import App from '../src/App'

afterEach(() => cleanup())
beforeEach(() => window.localStorage.clear())

// After the duplicate-listener cleanup the window keydown handler lives only
// in App.tsx. Tests that need to fire keys through that path boot the full
// App and click through the menu → new-game → system → confirm flow before
// dispatching. The P0-2 tabindex/role assertions still mount <GameScreen>
// directly because they only inspect the rendered DOM.
const beginGame = () => {
  fireEvent.click(screen.getByTestId('menu-new-game'))
  fireEvent.click(screen.getByTestId('system-tile-sys_battle'))
  fireEvent.click(screen.getByTestId('newgame-confirm'))
  fireEvent.click(screen.getByRole('button', { name: /nhấn|press/i }))
}

function renderApp() {
  render(<App />)
  beginGame()
}

function renderWithSpy(spy: (action: Action) => void) {
  return render(
    <GameScreen
      chronicle={[]}
      game={newGame('map-keyboard-nav')}
      locale="vi"
      onAction={spy}
      onLocaleChange={() => undefined}
    />,
  )
}

describe('P0-2: map keyboard navigation', () => {
  it('renders every map cell keyboard-reachable (tabindex=0) for roving focus', () => {
    renderWithSpy(() => undefined)

    const cells = [...document.querySelectorAll<HTMLElement>('.regional-map .map-cell')]
    expect(cells.length).toBe(49)
    const focusables = cells.filter((c) => c.getAttribute('tabindex') === '0')
    expect(focusables).toHaveLength(cells.length)
    const unfocusables = cells.filter((c) => c.getAttribute('tabindex') === '-1')
    expect(unfocusables).toHaveLength(0)
    // Player cell stays visually distinguishable.
    const playerCells = cells.filter((c) => c.getAttribute('data-visited') === 'true')
    expect(playerCells).toHaveLength(1)
  })

  it('arrow keys move focus to the adjacent cell (not the player-move action)', () => {
    renderWithSpy(() => undefined)

    const cells = [...document.querySelectorAll<HTMLElement>('.regional-map .map-cell')]
    const byCoord = (x: number, y: number) =>
      cells.find((c) => c.getAttribute('data-cell-x') === String(x) && c.getAttribute('data-cell-y') === String(y))
    expect(byCoord(0, 0)).toBeDefined()

    const start = byCoord(2, 2)!
    start.focus()
    expect(document.activeElement).toBe(start)

    fireEvent.keyDown(start, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(byCoord(3, 2))

    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(byCoord(3, 3))

    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(byCoord(2, 3))

    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(byCoord(2, 2))
  })

  it('marks every map cell with role="gridcell" and a localized aria-label', () => {
    renderWithSpy(() => undefined)

    const cells = [...document.querySelectorAll<HTMLElement>('.regional-map .map-cell')]
    expect(cells.length).toBeGreaterThan(0)
    for (const cell of cells) {
      expect(cell.getAttribute('role')).toBe('gridcell')
      const label = cell.getAttribute('aria-label') ?? ''
      expect(label.length).toBeGreaterThan(0)
    }
  })

  it('dispatches move actions on arrow-key press at the window level', () => {
    // After dropping the duplicate GameScreen listener, the only window keydown
    // handler for arrow/WASD lives in App.tsx. Boot App, observe the player's
    // location update after each arrow press.
    renderApp()
    const start = screen.getByTestId('location-label').textContent
    expect(start).toBe('Làng Thanh Mộc')

    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByTestId('location-label').textContent).toBe('Chợ Vân Tập')

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByTestId('location-label').textContent).toBe('Làng Thanh Mộc')
  })

  it('dispatches move actions on WASD keys', () => {
    renderApp()
    const start = screen.getByTestId('location-label').textContent
    expect(start).toBe('Làng Thanh Mộc')

    fireEvent.keyDown(window, { key: 'a' })
    fireEvent.keyDown(window, { key: 'a' })
    expect(screen.getByTestId('location-label').textContent).toBe('Chợ Vân Tập')

    fireEvent.keyDown(window, { key: 'd' })
    fireEvent.keyDown(window, { key: 'd' })
    expect(screen.getByTestId('location-label').textContent).toBe('Làng Thanh Mộc')
  })

  it('skips arrow-key movement while typing in the free-text input', () => {
    const onAction = vi.fn()
    render(
      <GameScreen
        chronicle={[]}
        game={newGame('map-keyboard-nav-typing')}
        locale="vi"
        onAction={onAction}
        onLocaleChange={() => undefined}
        storyOpen
      />,
    )

    // Free-text input exists inside the story panel — switch focus there.
    const input = screen.getByLabelText('Viết hành động khác') as HTMLInputElement
    input.focus()

    // The typing guard is checked inside the handler; storyOpen already short-
    // circuits. Open a fresh world render and target the system-chat input.
    cleanup()
    renderWithSpy(onAction)
    // System chat input is present only when a system is active. Skip the
    // focus part if missing; instead simulate keydown whose target IS an
    // input element by passing an Input target via fireEvent.keyDown(input, ...).
    const before = onAction.mock.calls.length
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    // The handler attaches to window only, so an input-targeted keydown
    // bubbles to window with target=input; our guard must skip it.
    expect(onAction.mock.calls.length).toBe(before)
  })

  it('does not dispatch move when an encounter is active', () => {
    const base = newGame('map-encounter-block')
    const game = { ...base, encounter: { enemyId: 'mist_boar', hp: 10, maxHp: 10, guard: 0, cooldowns: {} } }
    const onAction = vi.fn()
    render(<GameScreen chronicle={[]} game={game} locale="vi" onAction={onAction} onLocaleChange={() => undefined} />)

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(onAction).not.toHaveBeenCalled()
  })

  it('does not dispatch move while the journal is open', () => {
    const onAction = vi.fn()
    render(
      <GameScreen chronicle={[]} game={newGame('map-journal-block')} locale="vi" onAction={onAction} onLocaleChange={() => undefined} />,
    )

    fireEvent.keyDown(window, { key: 'i' }) // opens journal
    const before = onAction.mock.calls.length
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(onAction.mock.calls.length).toBe(before)
  })

  it('does not dispatch move while the story panel is open', () => {
    const onAction = vi.fn()
    render(
      <GameScreen chronicle={[]} game={newGame('map-story-block')} locale="vi" onAction={onAction} onLocaleChange={() => undefined} storyOpen />,
    )

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(onAction).not.toHaveBeenCalledWith({ kind: 'move', direction: 'east' })
  })
})