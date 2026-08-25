// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { newGame } from '../src/engine'
import type { Action } from '../src/engine'
import { GameScreen } from '../src/ui/GameScreen'

afterEach(() => cleanup())

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
    vi.useRealTimers()
  })
})
