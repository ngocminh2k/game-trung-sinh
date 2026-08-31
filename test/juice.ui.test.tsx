// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { newGame } from '../src/engine'
import { GameScreen } from '../src/ui/GameScreen'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function renderAt(nonce: number, day: number, hp: number, qi: number, chronicle: string[] = []) {
  return render(
    <GameScreen actionNonce={nonce} chronicle={chronicle} game={{ ...newGame('juice'), day, player: { ...newGame('juice').player, hp, qi } }} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />,
  )
}

describe('game feel feedback (design review Phase 6)', () => {
  it('shows no delta chips and no day stamp on first render', () => {
    renderAt(0, 1, 80, 40)

    expect(screen.queryByTestId('hp-delta')).toBeNull()
    expect(screen.queryByTestId('qi-delta')).toBeNull()
    expect(screen.queryByTestId('day-stamp')).toBeNull()
  })

  it('flashes signed HP and Qi deltas on a change, then clears them', () => {
    vi.useFakeTimers()
    const base = newGame('juice-delta')
    const { rerender } = render(
      <GameScreen actionNonce={0} chronicle={[]} game={base} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />,
    )

    rerender(
      <GameScreen
        actionNonce={1}
        chronicle={[]}
        game={{ ...base, player: { ...base.player, hp: base.player.hp - 8, qi: base.player.qi + 5 } }}
        locale="vi"
        onAction={() => undefined}
        onLocaleChange={() => undefined}
      />,
    )

    const hpDelta = screen.getByTestId('hp-delta')
    const qiDelta = screen.getByTestId('qi-delta')
    expect(hpDelta.textContent).toBe('-8')
    expect(hpDelta.getAttribute('data-direction')).toBe('down')
    expect(qiDelta.textContent).toBe('+5')
    expect(qiDelta.getAttribute('data-direction')).toBe('up')
    expect(hpDelta.closest('.meter')?.className).toContain('delta-down')
    expect(qiDelta.closest('.meter')?.className).toContain('delta-up')

    act(() => vi.advanceTimersByTime(900))
    expect(screen.queryByTestId('hp-delta')).toBeNull()
    expect(screen.queryByTestId('qi-delta')).toBeNull()
  })

  it('stamps the day only when the day increases, echoing it once', () => {
    vi.useFakeTimers()
    const base = newGame('juice-day')
    const { rerender } = render(
      <GameScreen actionNonce={0} chronicle={[]} game={base} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />,
    )
    expect(screen.queryByTestId('day-stamp')).toBeNull()

    // A stat-only change must not stamp the day.
    rerender(
      <GameScreen actionNonce={1} chronicle={[]} game={{ ...base, player: { ...base.player, hp: base.player.hp - 4 } }} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />,
    )
    expect(screen.queryByTestId('day-stamp')).toBeNull()

    rerender(
      <GameScreen actionNonce={2} chronicle={[]} game={{ ...base, day: 4, player: { ...base.player, hp: base.player.hp - 4 } }} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />,
    )
    const stamp = screen.getByTestId('day-stamp')
    expect(stamp.textContent).toBe('Ngày 4')
    expect(stamp.getAttribute('role')).toBe('status')

    act(() => vi.advanceTimersByTime(1400))
    expect(screen.queryByTestId('day-stamp')).toBeNull()
  })

  it('marks the newest chronicle line for scroll/arrival when lines are added', () => {
    vi.useFakeTimers()
    const base = newGame('juice-chronicle')
    const first = render(
      <GameScreen actionNonce={0} chronicle={['Dòng mở đầu.']} game={base} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} storyOpen />,
    )
    expect(first.container.querySelector('.chronicle li.is-new')).toBeNull()

    first.rerender(
      <GameScreen actionNonce={1} chronicle={['Dòng mở đầu.', 'Hành động mới được ghi lại.']} game={base} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} storyOpen />,
    )
    const lines = first.container.querySelectorAll('.chronicle li')
    expect(lines).toHaveLength(2)
    expect(lines[1]?.className).toContain('is-new')
    expect(lines[0]?.className).not.toContain('is-new')

    act(() => vi.advanceTimersByTime(1600))
    expect(first.container.querySelector('.chronicle li.is-new')).toBeNull()
  })
})
