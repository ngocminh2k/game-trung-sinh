import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from '../src/App'

describe('browser game journey', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => cleanup())

  it('responds to keyboard travel, supports bilingual UI, and persists the run', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByText('Làng Thanh Mộc', { exact: true })).toBeTruthy()
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(await screen.findByText('Chợ Vân Tập', { exact: true })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'EN' }))
    expect(screen.getByRole('heading', { name: 'Journey map' })).toBeTruthy()

    await waitFor(() => expect(window.localStorage.getItem('phe-can-ky:save:v1')).toContain('market'))
  })

  it('submits a free-form action through the deterministic reducer', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Viết hành động khác'), 'nói chuyện với cụ Mai Hoa')
    await user.click(screen.getByRole('button', { name: 'Thử vận' }))

    expect(screen.getByLabelText('Biên niên ký').textContent).toContain('Mai Hoa')
  })
})
