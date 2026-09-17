// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import { isBreakthroughReady, nextStageThreshold } from '../src/engine/stats'
import { GameScreen } from '../src/ui/GameScreen'
import { ProtoShell } from '../src/ui/ProtoShell'

afterEach(() => {
  cleanup()
})

describe('Breakthrough Pulsing Glow (C3-06 / C2-06)', () => {
  describe('isBreakthroughReady pure logic', () => {
    it('returns true when player progress reaches or exceeds threshold', () => {
      const threshold = nextStageThreshold(0, 1) ?? 100
      expect(isBreakthroughReady(0, 1, threshold)).toBe(true)
      expect(isBreakthroughReady(0, 1, threshold + 25)).toBe(true)
    })

    it('returns false when player progress is below threshold', () => {
      const threshold = nextStageThreshold(0, 1) ?? 100
      expect(isBreakthroughReady(0, 1, 0)).toBe(false)
      expect(isBreakthroughReady(0, 1, threshold - 1)).toBe(false)
    })

    it('returns false when player is at peak realm where threshold is null', () => {
      expect(isBreakthroughReady(99, 99, 5000)).toBe(false)
    })
  })

  describe('GameScreen quick-action cultivate button visual affordance', () => {
    it('displays normal "Tu luyện" button without can-breakthrough class when progress < threshold', () => {
      const base = newGame('normal-cultivate')
      const game = {
        ...base,
        player: {
          ...base.player,
          stage: 0,
          realmLevel: 1,
          progress: 2,
        },
      }

      const { container } = render(
        <GameScreen
          actionNonce={0}
          chronicle={[]}
          game={game}
          locale="vi"
          onAction={() => undefined}
          onLocaleChange={() => undefined}
        />,
      )

      const trainBtn = Array.from(container.querySelectorAll<HTMLButtonElement>('.quick-actions button'))
        .find((btn) => btn.textContent?.includes('Tu luyện'))
      expect(trainBtn).toBeDefined()
      expect(trainBtn?.classList.contains('can-breakthrough')).toBe(false)
    })

    it('displays "⚡ Đột phá" with can-breakthrough class when progress >= threshold', () => {
      const base = newGame('ready-cultivate')
      const threshold = nextStageThreshold(0, 1) ?? 100
      const game = {
        ...base,
        player: {
          ...base.player,
          stage: 0,
          realmLevel: 1,
          progress: threshold,
        },
      }

      const { container } = render(
        <GameScreen
          actionNonce={0}
          chronicle={[]}
          game={game}
          locale="vi"
          onAction={() => undefined}
          onLocaleChange={() => undefined}
        />,
      )

      const breakthroughBtn = Array.from(container.querySelectorAll<HTMLButtonElement>('.quick-actions button'))
        .find((btn) => btn.textContent?.includes('⚡ Đột phá'))
      expect(breakthroughBtn).toBeDefined()
      expect(breakthroughBtn?.classList.contains('can-breakthrough')).toBe(true)
    })

    it('displays "⚡ Breakthrough" in English when locale is "en"', () => {
      const base = newGame('en-breakthrough')
      const threshold = nextStageThreshold(0, 1) ?? 100
      const game = {
        ...base,
        player: {
          ...base.player,
          stage: 0,
          realmLevel: 1,
          progress: threshold + 10,
        },
      }

      const { container } = render(
        <GameScreen
          actionNonce={0}
          chronicle={[]}
          game={game}
          locale="en"
          onAction={() => undefined}
          onLocaleChange={() => undefined}
        />,
      )

      const breakthroughBtn = Array.from(container.querySelectorAll<HTMLButtonElement>('.quick-actions button'))
        .find((btn) => btn.textContent?.includes('⚡ Breakthrough'))
      expect(breakthroughBtn).toBeDefined()
      expect(breakthroughBtn?.classList.contains('can-breakthrough')).toBe(true)
    })
  })

  describe('ProtoShell chip cultivate button affordance', () => {
    it('applies can-breakthrough class and "⚡ Đột phá" label on cultivate chip when ready', () => {
      const base = newGame('proto-breakthrough')
      const threshold = nextStageThreshold(0, 1) ?? 100
      const game = {
        ...base,
        player: {
          ...base.player,
          stage: 0,
          realmLevel: 1,
          progress: threshold,
        },
      }

      const { container } = render(
        <ProtoShell
          chronicle={[]}
          game={game}
          locale="vi"
          onAction={() => undefined}
          onLocaleChange={() => undefined}
        />,
      )

      const chip = container.querySelector('button[data-chip="cultivate"]')
      expect(chip).not.toBeNull()
      expect(chip?.classList.contains('can-breakthrough')).toBe(true)
      expect(chip?.textContent).toContain('⚡ Đột phá')
    })
  })
})
