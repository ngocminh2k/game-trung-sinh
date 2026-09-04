// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { GameScreen } from '../src/ui/GameScreen'
import { newGame } from './test-utils'

afterEach(() => cleanup())

describe('P0-3: auto-focus dialog and combat', () => {
  it('focuses the first story choice button when the story panel opens', () => {
    const game = newGame('autofocus-story')
    render(
      <GameScreen
        chronicle={[]}
        game={game}
        locale="vi"
        onAction={() => undefined}
        onLocaleChange={() => undefined}
        storyOpen
      />,
    )

    const choices = document.querySelectorAll('.story-choices .choice-button')
    expect(choices.length).toBeGreaterThan(0)
    const firstChoice = choices[0] as HTMLButtonElement
    expect(document.activeElement).toBe(firstChoice)
  })

  it('does not focus a story choice when the story panel is closed', () => {
    const game = newGame('autofocus-no-story')
    render(
      <GameScreen
        chronicle={[]}
        game={game}
        locale="vi"
        onAction={() => undefined}
        onLocaleChange={() => undefined}
      />,
    )

    const firstChoice = screen.queryByRole('button', { name: /^1\./ })
    expect(firstChoice).toBeNull()
    expect(document.activeElement).not.toBe(firstChoice)
  })

  it('focuses the basic-strike button when an encounter begins', () => {
    const base = newGame('autofocus-encounter')
    const game = { ...base, encounter: { enemyId: 'mist_boar', hp: 10, maxHp: 10, guard: 0, cooldowns: {} } }
    render(<GameScreen chronicle={[]} game={game} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />)

    const strike = screen.getByRole('button', { name: /Đánh thường/ }) as HTMLButtonElement
    expect(document.activeElement).toBe(strike)
  })

  it('exposes an aria-live="assertive" region on the encounter banner', () => {
    const base = newGame('autofocus-aria-live')
    const game = { ...base, encounter: { enemyId: 'mist_boar', hp: 10, maxHp: 10, guard: 0, cooldowns: {} } }
    render(<GameScreen chronicle={[]} game={game} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />)

    const banner = document.querySelector('.encounter-banner')
    expect(banner).toBeTruthy()
    expect(banner?.getAttribute('aria-live')).toBe('assertive')
  })
})