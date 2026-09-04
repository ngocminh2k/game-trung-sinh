import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { GameScreen } from '../src/ui/GameScreen'
import { newGame } from './test-utils'

function bootScreen(): void {
  const game = newGame('skip-links')
  const chronicle: string[] = []
  const onAction = () => undefined
  render(
    <GameScreen
      game={game}
      locale="en"
      chronicle={chronicle}
      onAction={onAction}
      onLocaleChange={() => undefined}
    />,
  )
}

describe('skip-to-content links', () => {
  afterEach(() => cleanup())

  it('renders a Skip to map link pointing at #world-map', () => {
    bootScreen()
    const link = screen.getByRole('link', { name: 'Skip to map' })
    expect(link).toBeTruthy()
    expect(link.getAttribute('href')).toBe('#world-map')
    expect(link.className).toContain('skip-link')
  })

  it('renders a Skip to inventory link pointing at #dock-panel-inventory', () => {
    bootScreen()
    const link = screen.getByRole('link', { name: 'Skip to inventory' })
    expect(link).toBeTruthy()
    expect(link.getAttribute('href')).toBe('#dock-panel-inventory')
    expect(link.className).toContain('skip-link')
  })

  it('places both skip links as the first focusable elements inside <main>', () => {
    bootScreen()
    const main = screen.getByTestId('game-screen')
    const skipLinks = main.querySelectorAll('a.skip-link')
    expect(skipLinks).toHaveLength(2)
    const mapLink = skipLinks[0] as HTMLAnchorElement
    const inventoryLink = skipLinks[1] as HTMLAnchorElement
    expect(mapLink.getAttribute('href')).toBe('#world-map')
    expect(inventoryLink.getAttribute('href')).toBe('#dock-panel-inventory')
  })

  it('sets document.documentElement.lang to the active locale', () => {
    bootScreen()
    expect(document.documentElement.lang).toBe('en')
  })

  it('the Skip to map link\'s href hash matches a real element id in the document', () => {
    bootScreen()
    const link = screen.getByRole('link', { name: 'Skip to map' }) as HTMLAnchorElement
    const hash = link.getAttribute('href')?.replace('#', '')
    expect(hash).toBe('world-map')
    expect(document.getElementById(hash!)).not.toBeNull()
  })
})
