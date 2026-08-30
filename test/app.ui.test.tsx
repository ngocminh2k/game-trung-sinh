import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from '../src/App'

describe('browser game journey', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => cleanup())

  // Boot: the slot screen appears first; select slot 1, then dismiss the loading screen.
  const beginGame = () => {
    fireEvent.click(screen.getByTestId('save-slot-1'))
    fireEvent.click(screen.getByRole('button', { name: /nhấn|press/i }))
  }

  it('responds to keyboard travel, supports bilingual UI, and persists the run', async () => {
    const user = userEvent.setup()
    render(<App />)
    beginGame()

    expect(screen.getByTestId('location-label').textContent).toBe('Làng Thanh Mộc')
    expect(screen.getByAltText('Chân dung Cụ Mai Hoa')).toBeTruthy()
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    await waitFor(() => expect(screen.getByTestId('location-label').textContent).toBe('Chợ Vân Tập'))
    expect(screen.getByTestId('game-screen').className).toContain('action-move')
    expect(screen.getByTestId('player-map-marker').className).toContain('action-move')

    await user.click(screen.getByRole('button', { name: 'EN' }))
    expect(screen.getByRole('heading', { name: 'Local area map' })).toBeTruthy()

    // State is persisted in the slot system.
    await waitFor(() => expect(window.localStorage.getItem('phe-can-ky:slots')).toContain('market'))
  })

  it('submits a free-form action through the deterministic reducer', async () => {
    const user = userEvent.setup()
    render(<App />)
    beginGame()

    await user.type(screen.getByLabelText('Viết hành động khác'), 'nói chuyện với cụ Mai Hoa')
    await user.click(screen.getByRole('button', { name: 'Thử vận' }))

    expect(screen.getByLabelText('Biên niên ký').textContent).toContain('Mai Hoa')
  })
})
