import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from '../src/App'

describe('browser game journey', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => cleanup())

  // The app opens on the ink-wash loading screen; dismiss it to reach the game.
  const beginGame = () => fireEvent.click(screen.getByRole('button', { name: /tải|loading/i }))

  it('responds to keyboard travel, supports bilingual UI, and persists the run', async () => {
    const user = userEvent.setup()
    render(<App />)
    beginGame()

    expect(screen.getByTestId('location-label').textContent).toBe('Làng Thanh Mộc')
    expect(screen.getByAltText('Chân dung Cụ Mai Hoa')).toBeTruthy()
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    await waitFor(() => expect(screen.getByTestId('location-label').textContent).toBe('Chợ Vân Tập'))
    expect(screen.getByTestId('game-screen').className).toContain('action-move')
    expect(screen.getByTestId('player-map-marker').className).toContain('action-move')

    await user.click(screen.getByRole('button', { name: 'EN' }))
    expect(screen.getByRole('heading', { name: 'Local area map' })).toBeTruthy()

    await waitFor(() => expect(window.localStorage.getItem('phe-can-ky:save:v1')).toContain('market'))
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
