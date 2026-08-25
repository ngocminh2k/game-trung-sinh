// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App, { visualActionFor } from '../src/App'
import { newGame } from '../src/engine'
import type { Action } from '../src/engine'
import { GameScreen } from '../src/ui/GameScreen'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  window.localStorage.clear()
})

function renderScreen(actionKind: Action['kind'] | null = null) {
  return render(
    <GameScreen
      actionKind={actionKind}
      actionNonce={1}
      chronicle={[]}
      game={newGame('player-art-ui')}
      locale="vi"
      onAction={() => undefined}
      onLocaleChange={() => undefined}
    />,
  )
}

describe('player action artwork', () => {
  it.each([
    [null, 'idle'],
    ['move', 'move'],
    ['talk', 'talk'],
    ['gather', 'gather'],
    ['train', 'cultivate'],
    ['rest', 'rest'],
    ['use_item', 'use-item'],
    ['combat_attack', 'combat-attack'],
    ['combat_defend', 'combat-defend'],
  ] as const)('maps %s to the %s illustrated player pose', (actionKind, pose) => {
    renderScreen(actionKind)

    const art = screen.getByTestId('player-action-art')
    expect(art.dataset.pose).toBe(pose)
    expect(art.querySelector('img')?.getAttribute('src')).toMatch(/\.png$/)
  })

  it('uses hurt after a non-combat damage update and death only after lethal terminal state', () => {
    vi.useFakeTimers()
    const initial = newGame('player-art-damage')
    const { rerender } = render(
      <GameScreen actionNonce={0} chronicle={[]} game={initial} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />,
    )

    rerender(
      <GameScreen
        actionKind="move"
        actionNonce={1}
        chronicle={[]}
        game={{ ...initial, player: { ...initial.player, hp: initial.player.hp - 8 } }}
        locale="vi"
        onAction={() => undefined}
        onLocaleChange={() => undefined}
      />,
    )
    expect(screen.getByTestId('player-action-art').dataset.pose).toBe('move')
    act(() => vi.advanceTimersByTime(220))
    expect(screen.getByTestId('player-action-art').dataset.pose).toBe('hurt')

    rerender(
      <GameScreen
        actionNonce={2}
        chronicle={[]}
        game={{ ...initial, terminal: true, player: { ...initial.player, alive: false, hp: 0 } }}
        locale="vi"
        onAction={() => undefined}
        onLocaleChange={() => undefined}
      />,
    )
    expect(screen.getByTestId('player-action-art').dataset.pose).toBe('death')
  })

  it('shows a combat action before its delayed retaliation hurt feedback', () => {
    vi.useFakeTimers()
    const initial = newGame('player-art-retaliation')
    const { rerender } = render(
      <GameScreen actionNonce={0} chronicle={[]} game={initial} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />,
    )

    rerender(
      <GameScreen
        actionKind="combat_attack"
        actionNonce={1}
        chronicle={[]}
        game={{ ...initial, player: { ...initial.player, hp: initial.player.hp - 6 } }}
        locale="vi"
        onAction={() => undefined}
        onLocaleChange={() => undefined}
      />,
    )
    expect(screen.getByTestId('player-action-art').dataset.pose).toBe('combat-attack')

    act(() => vi.advanceTimersByTime(420))
    expect(screen.getByTestId('player-action-art').dataset.pose).toBe('hurt')
  })

  it('keeps use-item visible before retaliation hurt during an active encounter', () => {
    vi.useFakeTimers()
    const initial = newGame('player-art-item-retaliation')
    const { rerender } = render(
      <GameScreen actionNonce={0} chronicle={[]} game={initial} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />,
    )

    rerender(
      <GameScreen
        actionKind="use_item"
        actionNonce={1}
        chronicle={[]}
        game={{
          ...initial,
          encounter: { enemyId: 'e_training_dummy', hp: 8, maxHp: 8, guard: 0 },
          player: { ...initial.player, hp: initial.player.hp - 6 },
        }}
        locale="vi"
        onAction={() => undefined}
        onLocaleChange={() => undefined}
      />,
    )
    expect(screen.getByTestId('player-action-art').dataset.pose).toBe('use-item')

    act(() => vi.advanceTimersByTime(420))
    expect(screen.getByTestId('player-action-art').dataset.pose).toBe('hurt')
  })

  it('remounts the same pose when a new actionNonce replays it', () => {
    const game = newGame('player-art-replay')
    const { rerender } = render(
      <GameScreen actionKind="move" actionNonce={1} chronicle={[]} game={game} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />,
    )
    const firstImage = screen.getByTestId('player-action-art').querySelector('img')

    rerender(
      <GameScreen actionKind="move" actionNonce={2} chronicle={[]} game={game} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />,
    )
    const secondImage = screen.getByTestId('player-action-art').querySelector('img')

    expect(secondImage).not.toBe(firstImage)
    expect(secondImage?.getAttribute('src')).toMatch(/move\.png$/)
  })

  it('uses the reducer-resolved action for a free-text command pose', () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Viết hành động khác'), { target: { value: 'tu luyện' } })
    fireEvent.click(screen.getByRole('button', { name: 'Thử vận' }))

    expect(screen.getByTestId('player-action-art').dataset.pose).toBe('cultivate')
  })

  it('keeps a free-text guard pose when the enemy counterattacks afterward', () => {
    expect(visualActionFor(
      { kind: 'free_text', raw: 'phòng thủ' },
      [
        { type: 'COMBAT_GUARDED', amount: 4 },
        { type: 'COMBAT_HIT', actor: 'enemy', amount: 3, enemyId: 'e_training_dummy' },
      ],
    )).toBe('combat_defend')
  })
})
