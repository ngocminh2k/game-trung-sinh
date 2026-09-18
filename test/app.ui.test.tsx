// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from '../src/App'

describe('browser game journey', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => cleanup())

  // Boot: main menu → New Game → pick a System on the 5×2 grid → dismiss loading.
  const beginGame = () => {
    fireEvent.click(screen.getByTestId('menu-new-game'))
    fireEvent.click(screen.getByTestId('system-tile-sys_battle'))
    fireEvent.click(screen.getByTestId('newgame-confirm'))
    fireEvent.click(screen.getByRole('button', { name: /nhấn|press/i }))
  }

  // The proto-shell map overlay (.map-overlay-label) and the legacy world-map
  // overlay share the map-current-cell testid; both carry the same "Ô x · y"
  // cell coordinates. Read the visible proto-shell one.
  const currentCellText = (): string =>
    screen.getAllByTestId('map-current-cell').find((el) => el.classList.contains('map-overlay-label'))?.textContent ?? ''

  it('responds to keyboard travel, supports bilingual UI, and persists the run', async () => {
    const user = userEvent.setup()
    render(<App />)
    beginGame()

    expect(screen.getByTestId('location-label').textContent).toBe('Làng Thanh Mộc')
    expect(screen.queryByTestId('narration-panel')).toBeNull()
    expect(screen.getByAltText('Chân dung Cụ Mai Hoa')).toBeTruthy()
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    await waitFor(() => expect(screen.getByTestId('location-label').textContent).toBe('Chợ Vân Tập'))
    expect(screen.getByTestId('game-screen').className).toContain('action-move')
    // player-map-marker became player-marker (rendered by both the proto map
    // and the legacy player-pin); the legacy pin carries the action-* class.
    expect(screen.getAllByTestId('player-marker').some((el) => el.className.includes('action-move'))).toBe(true)

    await user.click(screen.getByRole('button', { name: 'EN' }))
    expect(screen.getByRole('heading', { name: 'Local area map' })).toBeTruthy()

    // State is persisted in the slot system.
    await waitFor(() => expect(window.localStorage.getItem('phe-can-ky:slots')).toContain('market'))
  })

  it('handles NPC dialogue without modal lock and records to chronicle', async () => {
    const user = userEvent.setup()
    render(<App />)
    beginGame()

    await user.click(screen.getByRole('button', { name: 'Mở Hành trang và giang hồ' }))
    await user.click(screen.getByRole('tab', { name: /Người ở đây/ }))
    // Click the first NPC's "Nói chuyện" button in the People dock panel
    // Use aria-label since buttons have "Nói chuyện với [Name]" as accessible name
    const journal = screen.getByTestId('journal-screen')
    const talkButtons = within(journal).getAllByRole('button', { name: /Nói chuyện với/ })
    await user.click(talkButtons[0]!)

    // T-STORY-LOOP: Dialogue no longer traps player in global narration-panel
    expect(screen.queryByTestId('narration-panel')).toBeNull()
    expect(screen.getByTestId('game-screen').className).toContain('action-talk')

    // Chronicle records the dialogue
    await user.click(screen.getByRole('button', { name: 'Mở Hành trang và giang hồ' }))
    const chronicleTab = document.getElementById('dock-tab-chronicle')
    if (chronicleTab === null) throw new Error('dock-tab-chronicle missing')
    fireEvent.click(chronicleTab)
    await waitFor(() => expect(screen.getByTestId('chronicle-panel').textContent).toContain('Mai Hoa'))
  })

  it('blocks travel keys until an open dialogue is dismissed', async () => {
    const user = userEvent.setup()
    render(<App />)
    beginGame()

    const startCell = currentCellText()
    // Open dialogue with NPC on map
    const npcPin = screen.getAllByRole('button', { name: /Nói chuyện với Cụ Mai Hoa/ })[0]!
    await user.click(npcPin)
    expect(screen.getByRole('dialog')).toBeTruthy()

    // While dialogue is open, travel keys are blocked
    fireEvent.keyDown(window, { key: 'ArrowDown' })
    expect(currentCellText()).toBe(startCell)

    // Dismiss dialogue
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()

    // Travel keys work again
    fireEvent.keyDown(window, { key: 'ArrowDown' })
    await waitFor(() => expect(currentCellText()).not.toBe(startCell))
  })

  // Issue #17: reload (remount) resumes the active slot; exiting to menu ends auto-resume.
  it('auto-resumes the active save on remount and stops after returning to the menu', async () => {
    const first = render(<App />)
    beginGame()
    expect(screen.getByTestId('game-screen')).toBeTruthy()
    first.unmount()
    cleanup()

    render(<App />)
    expect(screen.queryByTestId('main-menu')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /nhấn|press/i }))
    expect(await screen.findByTestId('game-screen')).toBeTruthy()

    fireEvent.click(screen.getByTestId('game-exit-menu'))
    expect(screen.getByTestId('main-menu')).toBeTruthy()
    // The save itself survives the exit — Load Game still lists it.
    fireEvent.click(screen.getByTestId('menu-load-game'))
    expect(screen.getByText(/Tiếp tục|Continue/)).toBeTruthy()
  })

  it('submits a free-form action through the deterministic reducer', async () => {
    const user = userEvent.setup()
    render(<App />)
    beginGame()

    const commandInput = screen.getByLabelText(/Nhập mệnh lệnh|Command input/i)
    await user.type(commandInput, 'nói chuyện với cụ Mai Hoa')
    await user.click(screen.getByRole('button', { name: /Thử vận|Try/i }))

    // The redesign moved the chronicle feed into the journal dock and only
    // mounts the active tab's panel (the old aria-label 'Biên niên ký' was
    // dropped); activate its tab by id and assert the reducer's reply in the mounted panel.
    const chronicleTab = document.getElementById('dock-tab-chronicle')
    if (chronicleTab === null) throw new Error('dock-tab-chronicle missing')
    fireEvent.click(chronicleTab)
    await waitFor(() => expect(screen.getByTestId('chronicle-panel').textContent).toContain('Mai Hoa'))
    expect(screen.getByTestId('game-screen').className).toContain('action-talk')
  })
})
