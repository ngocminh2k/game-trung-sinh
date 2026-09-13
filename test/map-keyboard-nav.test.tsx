// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { newGame } from '../src/engine'
import type { Action } from '../src/engine'
import { GameScreen } from '../src/ui/GameScreen'

afterEach(() => cleanup())

// The 49-cell grid is gone (pr/4 illustrated map): travel is pin-click only and
// each region cell renders as a .map-pin button keyed by data-pin-id="x,y".
// Movement no longer dispatches on WASD/arrows — keyboard support is roving
// focus between pins (GameScreen.handleCellKeyDown) plus Escape/`i`.
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

function pins(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('.world-map .map-pin')]
}

describe('P0-2: map keyboard navigation', () => {
  it('renders every map pin keyboard-reachable for roving focus', () => {
    renderWithSpy(() => undefined)

    const cells = pins()
    expect(cells.length).toBe(49)
    // <button>s are natively focusable; nothing opts out of the tab order.
    expect(cells.filter((c) => c.getAttribute('tabindex') === '-1')).toHaveLength(0)
    // Player pin stays visually distinguishable.
    expect(cells.filter((c) => c.getAttribute('data-visited') === 'true')).toHaveLength(1)
  })

  it('arrow keys move focus to the adjacent pin (not the player-move action)', () => {
    const onAction = vi.fn()
    renderWithSpy(onAction)

    const byCoord = (x: number, y: number) =>
      document.querySelector<HTMLElement>(`.map-pin[data-pin-id="${String(x)},${String(y)}"]`)
    expect(byCoord(0, 0)).not.toBeNull()

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

    // Focus traversal never dispatches a move.
    expect(onAction).not.toHaveBeenCalled()
  })

  it('marks every map pin as an accessible button with a localized aria-label', () => {
    renderWithSpy(() => undefined)

    const cells = pins()
    expect(cells.length).toBeGreaterThan(0)
    for (const cell of cells) {
      expect(cell.tagName).toBe('BUTTON')
      expect((cell.getAttribute('aria-label') ?? '').length).toBeGreaterThan(0)
    }
  })

  it('does not dispatch move actions on arrow-key press at the window level', () => {
    // Movement was removed by request (2026-09-08): travelTo replayed whole
    // paths against per-action gates and silently stopped mid-route. The only
    // window keydown handlers left are Escape/`i` and the 1-3 story choices.
    const onAction = vi.fn()
    renderWithSpy(onAction)

    for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) {
      fireEvent.keyDown(window, { key })
    }
    expect(onAction).not.toHaveBeenCalled()
  })

  it('does not dispatch move actions on WASD keys', () => {
    const onAction = vi.fn()
    renderWithSpy(onAction)

    for (const key of ['w', 'a', 's', 'd']) {
      fireEvent.keyDown(window, { key })
    }
    expect(onAction).not.toHaveBeenCalled()
  })

  it('ignores keys while typing in the free-text input', () => {
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

    const input = screen.getByLabelText('Viết hành động khác') as HTMLInputElement
    input.focus()

    const before = onAction.mock.calls.length
    fireEvent.keyDown(input, { key: 'ArrowUp' })
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
