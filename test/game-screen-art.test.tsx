// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ITEMS, LOCATIONS, NPCS, TALENTS, TECHNIQUES } from '../src/content'
import { newGame } from '../src/engine'
import { GameScreen } from '../src/ui/GameScreen'
import { itemArtFor, talentArtFor, techniqueArtFor } from '../src/ui/rpgArt'

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

    expect(screen.queryByAltText('Minh họa Mộc Trượng Cũ')).toBeNull()
    expect(screen.queryByAltText('Minh họa Linh Căn Lì Lợm')).toBeNull()
    fireEvent.click(screen.getByRole('tab', { name: /Đạo đồ & trang bị/ }))
    expect(screen.getByAltText('Minh họa Mộc Trượng Cũ')).toBeTruthy()
    expect(screen.getByAltText('Minh họa Linh Căn Lì Lợm')).toBeTruthy()
    expect(screen.getByAltText('Minh họa Mộc Trượng Thức')).toBeTruthy()
    expect(screen.getByAltText('Minh họa Làng Thanh Mộc')).toBeTruthy()
  })

  it('keeps one contextual dock panel open and switches secondary systems accessibly', () => {
    renderScreen()

    const peopleTab = screen.getByRole('tab', { name: /Người ở đây/ })
    const questsTab = screen.getByRole('tab', { name: /Nhiệm vụ/ })
    const bagTab = screen.getByRole('tab', { name: /Túi đồ & kho/ })
    const pathTab = screen.getByRole('tab', { name: /Đạo đồ & trang bị/ })

    expect(peopleTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel').getAttribute('id')).toBe('dock-panel-people')
    expect(screen.queryByRole('heading', { name: 'Nhiệm vụ' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Đạo đồ & trang bị' })).toBeNull()

    fireEvent.click(questsTab)
    expect(questsTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel').getAttribute('id')).toBe('dock-panel-quests')
    expect(screen.getByRole('heading', { name: 'Nhiệm vụ' })).toBeTruthy()

    fireEvent.click(bagTab)
    expect(bagTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByAltText('Bộ sưu tập vật phẩm tu tiên')).toBeTruthy()

    fireEvent.click(pathTab)
    expect(pathTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('heading', { name: 'Đạo đồ & trang bị' })).toBeTruthy()

    fireEvent.keyDown(pathTab, { key: 'Home' })
    expect(peopleTab.getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(peopleTab)
  })

  it('dims unreached progression without exposing its names or full effects', () => {
    renderScreen()
    fireEvent.click(screen.getByRole('tab', { name: /Đạo đồ & trang bị/ }))

    expect(screen.queryByText('Thính Sương')).toBeNull()
    expect(screen.queryByText('Vân Du Bộ')).toBeNull()
    expect(screen.getAllByText('Thiên phú chưa thức tỉnh').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Công pháp chưa gặp cơ duyên').length).toBeGreaterThan(0)
    expect(document.querySelectorAll('.rpg-entry.is-locked').length).toBeGreaterThan(0)
  })

  it('keeps the wide systems dock outside the compact HUD until its Codex drawer opens', () => {
    renderScreen()

    const dock = screen.getByTestId('system-dock')
    const drawer = screen.getByTestId('codex-drawer') as HTMLDetailsElement
    expect(dock.closest('aside.hud-panel')).toBeNull()
    expect(dock.previousElementSibling?.classList.contains('game-grid')).toBe(true)
    expect(dock.contains(drawer)).toBe(true)
    expect(screen.queryByTestId('codex-panel')).toBeNull()

    drawer.open = true
    fireEvent(drawer, new Event('toggle'))

    const codex = screen.getByTestId('codex-panel')
    expect(codex).toBeTruthy()
    expect(within(codex).getByAltText('Linh thảo')).toBeTruthy()
    expect(within(codex).getByAltText('Linh Căn Lì Lợm')).toBeTruthy()
    expect(within(codex).getAllByText('Thiên phú')).toHaveLength(TALENTS.length)
    expect(within(codex).getAllByText('Công pháp')).toHaveLength(TECHNIQUES.length)
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

    for (const item of ITEMS) {
      const artwork = itemArtFor(item.id)
      if (artwork === undefined) {
        expect(screen.queryByAltText(item.nameVi)).toBeNull()
      } else {
        expect(screen.getByAltText(item.nameVi)).toBeTruthy()
      }
    }
    for (const talent of TALENTS) expect(talentArtFor(talent.id)).toBeDefined()
    for (const technique of TECHNIQUES) {
      if (techniqueArtFor(technique.id) === undefined) {
        expect(screen.queryByAltText(technique.nameVi)).toBeNull()
      } else {
        expect(screen.getByAltText(technique.nameVi)).toBeTruthy()
      }
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
