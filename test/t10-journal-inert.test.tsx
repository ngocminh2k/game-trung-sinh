// @vitest-environment jsdom
// T10: the journal drawer ("Sổ tay hành tẩu") never marked the world behind it
// inert. The single writer at GameScreen.tsx toggled on `storyOpen || deathDialog`
// only, and the proto shell (world-map pins, quick actions, NPC rail, merged
// topbar) was not registered as a background region at all — so with the drawer
// open every control behind the backdrop stayed in the accessibility tree and
// clickable, and the drawer's own backdrop was the only thing standing between
// the player and a stray click on "Tu luyện".
// jsdom implements no `inert` BEHAVIOUR (no a11y tree, no pointer blocking), so
// what is pinned here is the attribute contract the browser then honours: the
// world regions carry it, and the open drawer must NOT (it is the live surface).
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import { GameScreen } from '../src/ui/GameScreen'

function renderGame(storyOpen = false) {
  return render(
    <GameScreen
      chronicle={[]}
      game={newGame('t10-journal-inert')}
      locale="en"
      onAction={() => undefined}
      onLocaleChange={() => undefined}
      storyOpen={storyOpen}
    />,
  )
}

// The world regions registered through the `backgroundRegion` callback ref.
const WORLD_REGIONS = ['.proto-shell-wrap', '.topbar', '.stage-notices', '.hud-panel'] as const

function inertRegions(container: HTMLElement): string[] {
  return WORLD_REGIONS.filter((selector) => container.querySelector(selector)?.hasAttribute('inert') === true)
}

afterEach(cleanup)

describe('T10: opening the journal marks the world behind it inert', () => {
  it('leaves every world region live while the journal is closed', () => {
    const { container } = renderGame()
    expect(inertRegions(container), 'a closed journal must not inert the world').toEqual([])
  })

  it('inerts the proto shell — map pins, quick actions, NPC rail, merged topbar', () => {
    const { container } = renderGame()
    fireEvent.click(screen.getByRole('button', { name: 'Open Journey journal' }))
    expect(container.querySelector('.proto-shell-wrap')?.hasAttribute('inert')).toBe(true)
    // The rest of the world travels with it (same writer, one attribute).
    expect(inertRegions(container).sort()).toEqual([...WORLD_REGIONS].sort())
  })

  it('puts a real background control inside an inert subtree', () => {
    const { container } = renderGame()
    fireEvent.click(screen.getByRole('button', { name: 'Open Journey journal' }))
    // Queried from the DOM, not by role: `.world-content` is `hidden` while the
    // drawer is open, so RTL's role queries cannot see these at all — which is
    // the symptom, not the fix. The world must be inert whether or not the
    // browser also hides it.
    const cultivate = [...container.querySelectorAll('.quick-actions button')]
      .find((button) => button.textContent === 'Cultivate')
    expect(cultivate, 'the HUD quick actions must render').toBeDefined()
    expect(cultivate!.closest('[inert]'), 'Cultivate must be unreachable while the journal is open').not.toBeNull()
    const pin = container.querySelector('.proto-shell-wrap [data-pin-id]')
    expect(pin, 'the world map must render at least one pin').not.toBeNull()
    expect(pin!.closest('[inert]'), 'map pins must be unreachable while the journal is open').not.toBeNull()
  })

  it('does not inert the open drawer itself', () => {
    const { container } = renderGame()
    fireEvent.click(screen.getByRole('button', { name: 'Open Journey journal' }))
    const drawer = container.querySelector('#journal-screen')
    expect(drawer, 'the journal drawer must render').not.toBeNull()
    // The drawer is registered as a background region too (it has to go inert
    // behind the story panel / death screen), so the journalOpen pass must skip it.
    expect(drawer!.hasAttribute('inert'), 'the open journal must stay usable').toBe(false)
    expect(screen.getByRole('button', { name: /Back to world/ }).closest('[inert]')).toBeNull()
  })

  it('hands the world back when the journal closes', () => {
    const { container } = renderGame()
    fireEvent.click(screen.getByRole('button', { name: 'Open Journey journal' }))
    fireEvent.click(screen.getByRole('button', { name: /Back to world/ }))
    expect(inertRegions(container), 'closing the journal must lift inert').toEqual([])
  })

  it('still inerts the world for the story panel (regression: one writer)', () => {
    const { container } = renderGame(true)
    expect(container.querySelector('.proto-shell-wrap')?.hasAttribute('inert')).toBe(true)
  })
})
