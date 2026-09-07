// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import { GameScreen } from '../src/ui/GameScreen'

afterEach(() => cleanup())

describe('P0-7: attribute allocation banner', () => {
  it('renders a sticky banner with the point count when pending > 0', () => {
    const base = newGame('alloc-banner')
    const game = { ...base, player: { ...base.player, pendingAttributePoints: 3 } }
    const { container } = render(
      <GameScreen chronicle={[]} game={game} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />,
    )
    const banner = container.querySelector('[data-testid="attribute-banner"]')
    expect(banner).toBeTruthy()
    expect(banner?.getAttribute('aria-live')).toBe('polite')
    expect(banner?.textContent).toContain('3')
  })

  it('omits the banner when there are no pending points', () => {
    const base = newGame('alloc-banner-empty')
    const game = { ...base, player: { ...base.player, pendingAttributePoints: 0 } }
    const { container } = render(
      <GameScreen chronicle={[]} game={game} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />,
    )
    expect(container.querySelector('[data-testid="attribute-banner"]')).toBeNull()
  })

  it('disables the train / gather / move / rest quick-actions when pending > 0', () => {
    const base = newGame('alloc-banner-disabled')
    const game = { ...base, player: { ...base.player, pendingAttributePoints: 1 } }
    const { container } = render(
      <GameScreen chronicle={[]} game={game} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />,
    )
    const disabled = Array.from(container.querySelectorAll<HTMLButtonElement>('button[disabled]'))
      .map((b) => b.textContent ?? '')
    expect(disabled.some((t) => t.includes('Tu luyện') || t.includes('Cultivate'))).toBe(true)
    expect(disabled.some((t) => t.includes('Hái thảo') || t.includes('Gather'))).toBe(true)
  })

  it('localizes the banner copy to Vietnamese when locale=vi', () => {
    const base = newGame('alloc-banner-vi')
    const game = { ...base, player: { ...base.player, pendingAttributePoints: 1 } }
    const { container } = render(
      <GameScreen chronicle={[]} game={game} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />,
    )
    const banner = container.querySelector('[data-testid="attribute-banner"]')
    expect(banner?.textContent).toMatch(/Phân bố 1 điểm/)
  })

  it('localizes the banner copy to English when locale=en', () => {
    const base = newGame('alloc-banner-en')
    const game = { ...base, player: { ...base.player, pendingAttributePoints: 1 } }
    const { container } = render(
      <GameScreen chronicle={[]} game={game} locale="en" onAction={() => undefined} onLocaleChange={() => undefined} />,
    )
    const banner = container.querySelector('[data-testid="attribute-banner"]')
    expect(banner?.textContent).toMatch(/Allocate 1 points/)
  })
})