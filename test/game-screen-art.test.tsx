// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ITEMS, LOCATIONS, NPCS, TALENTS, TECHNIQUES } from '../src/content'
import { newGame } from '../src/engine'
import { GameScreen } from '../src/ui/GameScreen'

function renderScreen(locationId?: string) {
  const game = newGame('game-screen-art')
  return render(
    <GameScreen
      game={locationId === undefined ? game : { ...game, player: { ...game.player, locationId } }}
      locale="vi"
      chronicle={[]}
      onAction={() => undefined}
      onLocaleChange={() => undefined}
    />,
  )
}

afterEach(() => cleanup())

describe('illustrated RPG UI', () => {
  it('shows item, talent, and technique art in the live game screen', () => {
    renderScreen()

    expect(screen.getByAltText('Minh họa Mộc Trượng Cũ')).toBeTruthy()
    expect(screen.getByAltText('Minh họa Linh Căn Lì Lợm')).toBeTruthy()
    expect(screen.getByAltText('Minh họa Mộc Trượng Thức')).toBeTruthy()
    expect(screen.getByAltText('Minh họa Làng Thanh Mộc')).toBeTruthy()
  })

  it('does not mount Codex content until its drawer opens', () => {
    renderScreen()

    const drawer = screen.getByTestId('codex-drawer') as HTMLDetailsElement
    expect(screen.queryByTestId('codex-panel')).toBeNull()

    drawer.open = true
    fireEvent(drawer, new Event('toggle'))

    expect(screen.getByTestId('codex-panel')).toBeTruthy()
    expect(screen.getByAltText('Linh thảo')).toBeTruthy()
    expect(screen.getByAltText('Linh Căn Lì Lợm')).toBeTruthy()
  })

  it('catalogs every authored location and technique exactly once after opening', () => {
    renderScreen()

    const drawer = screen.getByTestId('codex-drawer') as HTMLDetailsElement
    drawer.open = true
    fireEvent(drawer, new Event('toggle'))

    const entries = [...document.querySelectorAll('[data-entry-id]')]
    const ids = entries.map((entry) => entry.getAttribute('data-entry-id'))
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toHaveLength(NPCS.length + ITEMS.length + TALENTS.length + TECHNIQUES.length + LOCATIONS.length)

    for (const technique of TECHNIQUES) {
      expect(screen.getByAltText(technique.nameVi)).toBeTruthy()
    }
    for (const location of LOCATIONS) {
      expect(screen.getByAltText(location.nameVi)).toBeTruthy()
    }
  })

  it('uses the illustrated world map as a fallback scene for movement-only positions', () => {
    renderScreen('wild_4_2')

    expect(screen.getByAltText('Bản đồ khu vực chưa được đặt tên')).toBeTruthy()
  })
})
