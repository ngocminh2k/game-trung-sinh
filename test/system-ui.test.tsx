// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { newGame } from '../src/engine'
import { GameScreen } from '../src/ui/GameScreen'

vi.mock('../src/ai/system', () => ({
  requestSystemReply: vi.fn().mockResolvedValue({
    kind: 'offer_quest',
    textVi: 'Đề nghị',
    textEn: 'Quest offer',
    questId: 'q_sys_battle_01',
  }),
}))

afterEach(() => cleanup())

describe('S07 System UI', () => {
  it('renders the selected System pool and dispatches its panel actions', () => {
    const onAction = vi.fn()
    render(
      <GameScreen
        game={{ ...newGame('system-ui'), systemId: 'sys_battle' }}
        locale="en"
        chronicle={[]}
        onAction={onAction}
        onLocaleChange={() => undefined}
      />,
    )

    expect(screen.getByTestId('system-panel').textContent).toContain('【Battle System】')
    expect(screen.getAllByText(/Difficulty/)).toHaveLength(6)
    fireEvent.click(screen.getAllByRole('button', { name: 'Accept quest' })[0]!)
    expect(onAction).toHaveBeenCalledWith({ kind: 'system_accept_quest', questId: 'q_sys_battle_01' })
  })

  it('clears a chat-offered quest after accepting it', async () => {
    const onAction = vi.fn()
    render(
      <GameScreen
        game={{ ...newGame('system-offer'), systemId: 'sys_battle' }}
        locale="en"
        chronicle={[]}
        onAction={onAction}
        onLocaleChange={() => undefined}
      />,
    )

    fireEvent.change(screen.getByRole('textbox', { name: 'Battle System' }), { target: { value: 'offer' } })
    fireEvent.click(screen.getByRole('button', { name: 'Talk' }))
    await waitFor(() => expect(screen.getByText('Quest offer')).toBeTruthy())
    fireEvent.click(screen.getByText('Quest offer').querySelector('button')!)
    expect(onAction).toHaveBeenCalledWith({ kind: 'system_accept_quest', questId: 'q_sys_battle_01' })
    expect(screen.queryByText('Quest offer')).toBeNull()
  })

  it('does not render System UI for the rootless branch', () => {
    const base = newGame('system-rootless')
    render(
      <GameScreen
        game={{ ...base, flags: { ...base.flags, system_refused: true } }}
        locale="en"
        chronicle={[]}
        onAction={() => undefined}
        onLocaleChange={() => undefined}
      />,
    )

    expect(screen.queryByTestId('system-panel')).toBeNull()
  })
})
