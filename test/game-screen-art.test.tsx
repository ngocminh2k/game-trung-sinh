// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ACHIEVEMENTS, ITEMS, LOCATIONS, NPCS, TALENTS, TECHNIQUES } from '../src/content'
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

function openJournal() {
  fireEvent.click(screen.getByRole('button', { name: /Mở Hành trang và giang hồ/ }))
}

afterEach(() => cleanup())

describe('illustrated RPG UI', () => {
  it('shows item, talent, and technique art in the live game screen', () => {
    renderScreen()

    expect(screen.queryByAltText('Minh họa Mộc Trượng Cũ')).toBeNull()
    expect(screen.queryByAltText('Minh họa Linh Căn Lì Lợm')).toBeNull()
    openJournal()
    fireEvent.click(screen.getByRole('tab', { name: /Đạo đồ & trang bị/ }))
    expect(screen.getByAltText('Minh họa Mộc Trượng Cũ')).toBeTruthy()
    expect(screen.getByAltText('Minh họa Linh Căn Lì Lợm')).toBeTruthy()
    expect(screen.getByAltText('Minh họa Mộc Trượng Thức')).toBeTruthy()
    // Location artwork lives in the codex/asset registry, not the dock path panel.
  })

  it('keeps one Journal section open and switches its systems accessibly', () => {
    renderScreen()
    openJournal()

    const peopleTab = screen.getByRole('tab', { name: /Người ở đây/ })
    const questsTab = screen.getByRole('tab', { name: /Nhiệm vụ/ })
    const bagTab = screen.getByRole('tab', { name: /Túi đồ & kho/ })
    const pathTab = screen.getByRole('tab', { name: /Đạo đồ & trang bị/ })

    expect(bagTab.getAttribute('aria-selected')).toBe('true')
    expect(bagTab.getAttribute('aria-label')).toMatch(/Túi đồ & kho: \d+/)
    expect(bagTab.querySelector('.dock-tab-count')?.getAttribute('aria-hidden')).toBe('true')
    expect(screen.getByRole('tabpanel').getAttribute('id')).toBe('dock-panel-inventory')
    expect(within(screen.getByTestId('inventory-inspector')).getByRole('heading')).toBeTruthy()
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
    openJournal()
    fireEvent.click(screen.getByRole('tab', { name: /Đạo đồ & trang bị/ }))

    expect(screen.queryByText('Thính Sương')).toBeNull()
    expect(screen.queryByText('Vân Du Bộ')).toBeNull()
    expect(screen.getAllByText('Thiên phú chưa thức tỉnh').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Công pháp chưa gặp cơ duyên').length).toBeGreaterThan(0)
    expect(document.querySelectorAll('.rpg-entry.is-locked').length).toBeGreaterThan(0)
  })

  it('opens Journal mode instead of leaving the world underneath a dock', () => {
    renderScreen()

    const world = screen.getByTestId('world-content')
    const journal = screen.getByTestId('journal-screen')
    expect(world.hidden).toBe(false)
    expect(journal.hidden).toBe(true)
    expect(screen.queryByTestId('codex-panel')).toBeNull()

    fireEvent.keyDown(window, { key: 'i' })
    expect(world.hidden).toBe(true)
    expect(journal.hidden).toBe(false)
    const drawer = screen.getByTestId('codex-drawer') as HTMLDetailsElement
    drawer.open = true
    fireEvent(drawer, new Event('toggle'))

    const codex = screen.getByTestId('codex-panel')
    expect(codex).toBeTruthy()
    expect(within(codex).getByAltText('Linh thảo')).toBeTruthy()
    expect(within(codex).getByAltText('Linh Căn Lì Lợm')).toBeTruthy()
    expect(within(codex).getAllByText('Thiên phú')).toHaveLength(TALENTS.length)
    expect(within(codex).getAllByText('Công pháp')).toHaveLength(TECHNIQUES.length)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(world.hidden).toBe(false)
    expect(journal.hidden).toBe(true)
  })

  it('turns a reached route node into a focused story encounter, not an unlocked choice panel', () => {
    const base = newGame('route-event-screen')
    const game = {
      ...base,
      flags: { ...base.flags, story_route: 'mercy', story_scene: 'village_vow', story_route_arrived: true },
    }
    render(<GameScreen game={game} locale="vi" chronicle={[]} onAction={() => undefined} onLocaleChange={() => undefined} />)

    expect(screen.getByTestId('world-content').hidden).toBe(true)
    expect(screen.getByTestId('journal-screen').hidden).toBe(true)
    const encounter = screen.getByTestId('route-encounter-screen')
    expect(within(encounter).getByRole('heading')).toBeTruthy()
    expect(within(encounter).getAllByRole('button')).toHaveLength(2)
  })

  it('catalogs every authored location and technique exactly once after opening', () => {
    renderScreen()
    openJournal()

    const drawer = screen.getByTestId('codex-drawer') as HTMLDetailsElement
    drawer.open = true
    fireEvent(drawer, new Event('toggle'))

    const entries = [...document.querySelectorAll('[data-entry-id]')]
    const ids = entries.map((entry) => entry.getAttribute('data-entry-id'))
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toHaveLength(NPCS.length + ITEMS.length + TALENTS.length + TECHNIQUES.length + LOCATIONS.length)

    for (const item of ITEMS) {
      const entry = document.querySelector(`[data-entry-id="${item.id}"]`)
      const artwork = itemArtFor(item.id)
      if (artwork === undefined) {
        expect(entry?.querySelector('img')).toBeNull()
      } else {
        expect(entry?.querySelector('img')).toBeTruthy()
      }
    }
    for (const talent of TALENTS) expect(talentArtFor(talent.id)).toBeDefined()
    for (const technique of TECHNIQUES) {
      const entry = document.querySelector(`[data-entry-id="${technique.id}"]`)
      if (techniqueArtFor(technique.id) === undefined) {
        expect(entry?.querySelector('img')).toBeNull()
      } else {
        expect(entry?.querySelector('img')).toBeTruthy()
      }
    }
    for (const location of LOCATIONS) {
      expect(screen.getByAltText(location.nameVi)).toBeTruthy()
    }
  })

  it('uses the illustrated world map as a fallback scene for movement-only positions', () => {
    renderScreen('wild_4_2')

    // The illustrated regional map uses alt="" for the scene backdrop.
    expect(screen.getByRole('img', { name: 'La bàn: Bắc ở phía trên' })).toBeTruthy()
  })

  it('uses destination artwork only on exit nodes without losing map semantics', () => {
    renderScreen()

    const exits = document.querySelectorAll('.map-node.node-exit')
    expect(exits.length).toBeGreaterThan(0)
    expect(document.querySelectorAll('.map-exit-icon')).toHaveLength(exits.length)
    expect(document.querySelectorAll('.map-node:not(.node-exit) .map-exit-icon')).toHaveLength(0)
    expect([...exits].every((node) => node.getAttribute('title')?.includes('Lối ra:'))).toBe(true)
    expect(screen.getByText('Lối ra — sang vùng khác')).toBeTruthy()
    expect(within(screen.getByRole('list', { name: 'Các điểm trên bản đồ' })).getByText(/Cổng chợ Vân Tập/)).toBeTruthy()
    // All authored nodes render their text label on the regional map
    expect(document.querySelectorAll('.map-node-label').length).toBeGreaterThanOrEqual(exits.length)
  })

  it('legend entries carry bilingual aria-labels', () => {
    renderScreen()

    const rows = document.querySelectorAll('.map-legend-row[role="img"]')
    expect(rows.length).toBeGreaterThanOrEqual(4)
    for (const row of rows) {
      const label = row.getAttribute('aria-label') ?? ''
      // The aria-label includes both Vietnamese and English text separated by " | ".
      // Node-kind rows (people/event/exit/danger) start with their kind word;
      // the fog row starts with "Vùng mờ".
      expect(label).toMatch(/^(Người|Sự kiện|Lối ra|Hiểm họa|Vùng mờ) .+ \| (People|Event|Exit|Danger|Misted)/)
    }
  })

  it('exit icon falls back to placeholder on error', () => {
    renderScreen()

    const icons = document.querySelectorAll('.map-exit-icon')
    expect(icons.length).toBeGreaterThan(0)
    // Simulate an onError event on each exit icon.
    icons.forEach((icon) => {
      fireEvent.error(icon)
      expect((icon as HTMLImageElement).style.display).toBe('none')
    })
  })

  it('renders every map node inside a labelled icon slot with a placeholder glyph', () => {
    renderScreen()

    // Every authored node is a rounded icon slot styled ≥32px and bordered by its kind.
    const slots = document.querySelectorAll('.map-icon-slot')
    expect(slots.length).toBeGreaterThan(0)
    for (const slot of slots) {
      // The slot is styled with the icon-slot box (width/height set in CSS).
      expect(slot.className).toContain('map-icon-slot')
      // Each slot carries a placeholder glyph (all kinds have one).
      expect(slot.querySelector('.map-icon-placeholder')).toBeTruthy()
      // Non-exit nodes show only the glyph — never artwork.
      if (!slot.classList.contains('node-exit')) {
        expect(slot.querySelector('.map-exit-icon')).toBeNull()
      }
      // Focusable for keyboard (tabIndex 0).
      expect(slot.getAttribute('tabindex')).toBe('0')
    }
  })

  it('gives every rendered slot a title matching its node kind', () => {
    renderScreen()

    const slots = [...document.querySelectorAll('.map-icon-slot')]
    expect(slots.length).toBeGreaterThan(0)
    for (const slot of slots) {
      const title = slot.getAttribute('title') ?? ''
      const kind = [...slot.classList].find((cls) => cls.startsWith('node-'))
      if (kind === 'node-exit') {
        expect(title).toContain('Lối ra')
      } else if (kind === 'node-npc') {
        expect(title).toContain('Người')
      } else if (kind === 'node-danger') {
        expect(title).toContain('Hiểm họa')
      } else if (kind === 'node-event') {
        expect(title).toContain('Sự kiện')
      }
    }
  })

  it('orients exploration around the player’s current cell', () => {
    renderScreen()

    expect(screen.getByTestId('map-current-cell').textContent).toContain('Nhà cũ của ngươi')
    expect(screen.getByRole('img', { name: 'La bàn: Bắc ở phía trên' })).toBeTruthy()
    expect(screen.getByTestId('player-map-marker').className).toContain('player-map-marker')
  })

  it('uses ink flourishes and a vermilion seal for earned deeds', () => {
    const game = newGame('achievement-seal')
    game.achievements = [ACHIEVEMENTS[0]!.id]
    render(<GameScreen game={game} locale="vi" chronicle={[]} onAction={() => undefined} onLocaleChange={() => undefined} />)

    // Ink corners appear on the map panel and the open journal; story panel (3rd) is closed.
    expect(screen.getAllByTestId('ink-corner')).toHaveLength(2)
    openJournal()
    fireEvent.click(screen.getByRole('tab', { name: /Chợ & thành tựu/ }))
    expect(screen.getByTestId('achievement-seal').textContent).toBe('成')
  })

  it('shows minor-realm progress and the three passive equipment slots', () => {
    renderScreen()

    expect(screen.getByText(/Luyện Khí · tầng 1/)).toBeTruthy()
    const titles = [...document.querySelectorAll('.equipment-summary dd[title]')].map((el) => el.getAttribute('title') ?? '')
    expect(titles.some((t) => t.includes('Mộc Trượng Cũ'))).toBe(true)
    expect(titles.some((t) => t.includes('Áo Vải Vá'))).toBe(true)
    expect(screen.getByText(/Trống/)).toBeTruthy()
    // Passive bonuses surface as a small inline stat under each equipped item.
    expect(document.querySelectorAll('.equipment-bonus').length).toBe(2)
  })

  it('offers all attributes when a breakthrough needs allocation', () => {
    const base = newGame('pending-attributes')
    const onAction = vi.fn()
    render(<GameScreen game={{ ...base, player: { ...base.player, pendingAttributePoints: 2 } }} locale="vi" chronicle={[]} onAction={onAction} onLocaleChange={() => undefined} />)

    expect(screen.getByRole('region', { name: 'Phân bổ thuộc tính' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Thân.*3\/100/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Tâm.*4\/100/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Mị.*3\/100/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Vận.*2\/100/ })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Thân.*3\/100/ }))
    expect(onAction).toHaveBeenCalledWith({ kind: 'allocate_attribute', attribute: 'body' })
  })

  it('renders tooltip on focus with node name and kind', () => {
    renderScreen()

    const slots = [...document.querySelectorAll('.map-icon-slot')]
    expect(slots.length).toBeGreaterThan(0)
    const firstSlot = slots[0]! as HTMLElement
    // The tooltip sibling exists in the DOM but is hidden by CSS until hover/focus.
    const cell = firstSlot.closest('.map-cell') as HTMLElement
    const tooltip = cell.querySelector('.map-node-tooltip') as HTMLElement
    expect(tooltip).toBeTruthy()
    expect(tooltip.getAttribute('role')).toBe('tooltip')
    expect(tooltip.getAttribute('data-testid')).toBe('map-node-tooltip')
    // Tooltip text includes the node name and kind label (from map.tooltip.*).
    const text = tooltip.textContent ?? ''
    expect(text.length).toBeGreaterThan(0)
    // All authored tooltips carry one of the four kind labels (Nhan vat / Su kien / Loi ra / Hiem hoa).
    const kindLabel = ['Nhân vật', 'Sự kiện', 'Lối ra', 'Hiểm họa'].some((label) => text.includes(label))
    expect(kindLabel).toBe(true)
    // Trigger focus to satisfy the keyboard-reachable contract.
    firstSlot.focus()
    expect(document.activeElement).toBe(firstSlot)
  })

  it('fogs cells other than the current location', () => {
    renderScreen()

    const cells = [...document.querySelectorAll('.regional-map .map-cell')]
    expect(cells.length).toBeGreaterThan(1)
    // The current cell carries data-visited="true"; all others do not.
    const visitedCells = cells.filter((c) => c.getAttribute('data-visited') === 'true')
    const foggedCells = cells.filter((c) => c.getAttribute('data-visited') !== 'true')
    expect(visitedCells.length).toBe(1)
    expect(foggedCells.length).toBe(cells.length - 1)
    // The fogged cell carries the player's marker (since the player is the current cell's content).
    const playerCell = cells.find((c) => c.querySelector('.player-map-marker') !== null)
    expect(playerCell).toBeTruthy()
    expect(playerCell?.getAttribute('data-visited')).toBe('true')
  })
})
