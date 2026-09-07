// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import { GameScreen } from '../src/ui/GameScreen'

afterEach(() => cleanup())

describe('P0-4: bilingual aria-label cleanup', () => {
  it('legend rows use only the active locale in their aria-label', () => {
    const { rerender } = render(
      <GameScreen chronicle={[]} game={newGame('aria-cleanup-vi')} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />,
    )

    const rowsVi = [...document.querySelectorAll<HTMLElement>('.map-legend-row[role="img"]')]
    expect(rowsVi.length).toBeGreaterThanOrEqual(4)
    for (const row of rowsVi) {
      const label = row.getAttribute('aria-label') ?? ''
      expect(label).not.toContain(' | ')
      // Vietnamese labels start with Người / Sự kiện / Lối ra / Hiểm họa / Vùng mờ.
      expect(label).toMatch(/^(Người|Ngươi|Sự kiện|Lối ra|Hiểm họa|Vùng mờ)/)
    }

    rerender(
      <GameScreen chronicle={[]} game={newGame('aria-cleanup-en')} locale="en" onAction={() => undefined} onLocaleChange={() => undefined} />,
    )

    const rowsEn = [...document.querySelectorAll<HTMLElement>('.map-legend-row[role="img"]')]
    for (const row of rowsEn) {
      const label = row.getAttribute('aria-label') ?? ''
      expect(label).not.toContain(' | ')
      expect(label).toMatch(/^(People|You|Event|Exit|Danger|Misted)/)
    }
  })

  it('currency dingbats are marked aria-hidden', () => {
    render(
      <GameScreen chronicle={[]} game={newGame('aria-cleanup-dingbats')} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />,
    )

    const gold = document.querySelector('[data-testid="currency-gold"]') as HTMLElement
    const silver = document.querySelector('[data-testid="currency-silver"]') as HTMLElement
    const spirit = document.querySelector('[data-testid="currency-spirit-stones"]') as HTMLElement
    expect(gold.querySelector('[aria-hidden="true"]')?.textContent).toBe('◎')
    expect(silver.querySelector('[aria-hidden="true"]')?.textContent).toBe('◉')
    expect(spirit.querySelector('[aria-hidden="true"]')?.textContent).toBe('✦')
  })

  it('keyboard hint <kbd> tags carry aria-hidden', () => {
    render(
      <GameScreen chronicle={[]} game={newGame('aria-cleanup-kbd')} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />,
    )

    const kbds = [...document.querySelectorAll<HTMLElement>('kbd')]
    expect(kbds.length).toBeGreaterThan(0)
    for (const kbd of kbds) {
      expect(kbd.getAttribute('aria-hidden')).toBe('true')
    }
  })
})