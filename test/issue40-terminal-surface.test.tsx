// @vitest-environment jsdom
// issue #40 Step 2 (product fix): the terminal states were unreachable on
// desktop. `.ending-banner` and `DeathScreen` mounted inside
// `.world-content > .stage-notices` (GameScreen), and screens.css hides
// `.proto-shell-wrap ~ .world-content` with `display:none !important` at
// ≥921px — so the ending you just earned, and the death screen with its
// restart button, could not be seen or clicked at any Playwright/desktop
// width. jsdom applies no author stylesheets (display:none is invisible to
// it), so what this test pins is the structural contract that makes the CSS
// hide irrelevant: BOTH surfaces are direct children of the `main.game-shell`
// root, exactly like `.attribute-banner` was lifted in the #34 round-2 fix.
// If anyone re-nests them under .world-content, `closest('.world-content')`
// lights up again — that is the regression this guards.
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import type { GameState } from '../src/engine/types'
import { GameScreen } from '../src/ui/GameScreen'

function terminalGame(patch: Partial<GameState>): GameState {
  const base = newGame('issue40-terminal')
  return { ...base, ...patch, player: { ...base.player, ...(patch.player ?? {}) } } as GameState
}

function renderGame(game: GameState) {
  return render(
    <GameScreen
      chronicle={[]}
      game={game}
      locale="en"
      onAction={() => undefined}
      onExitToMenu={() => undefined}
      onLocaleChange={() => undefined}
      onRestart={() => undefined}
    />,
  )
}

afterEach(cleanup)

describe('issue #40 step 2: terminal surfaces live outside .world-content', () => {
  it('a non-death ending renders .ending-banner as a direct child of main.game-shell', () => {
    const { container } = renderGame(terminalGame({ terminal: true, endingId: 'blank_page' }))
    const banner = container.querySelector('.ending-banner')
    expect(banner, '.ending-banner must render for a terminal ending').not.toBeNull()
    expect(banner!.closest('.world-content'), '.ending-banner must NOT sit under the desktop-hidden .world-content').toBeNull()
    expect(banner!.parentElement?.classList.contains('game-shell')).toBe(true)
  })

  it('death renders DeathScreen as a direct child of main.game-shell', () => {
    const { container } = renderGame(
      terminalGame({ terminal: true, endingId: 'tragic_death', player: { alive: false } as GameState['player'] }),
    )
    const death = container.querySelector('.death-screen')
    expect(death, '.death-screen must render on death').not.toBeNull()
    expect(death!.closest('.world-content'), '.death-screen must NOT sit under the desktop-hidden .world-content').toBeNull()
    expect(death!.parentElement?.classList.contains('game-shell')).toBe(true)
  })

  it('the ending banner still shows the ending text (move must not gut content)', () => {
    const { container } = renderGame(terminalGame({ terminal: true, endingId: 'blank_page' }))
    const banner = container.querySelector('.ending-banner')
    expect(banner?.textContent).toContain('Your ending')
  })
})

// Round-6 reviewer (issue #40 step 2) MEDIUM-2: lifting the terminal surfaces
// out of the world column made them VISIBLE, but nothing ever moved focus to
// them. `DeathScreen` is `role="dialog" aria-modal="true"` yet React auto-focuses
// no element, the inert wiring at GameScreen.tsx:296-298 fired only for
// `storyOpen`, and a `role="status"` live region inserted already CONTAINING its
// text is not reliably announced. Net effect for a keyboard/screen-reader player
// finishing a run: the game was over and the caret was still in the world behind
// it. These pin the transition, not the markup.
describe('issue #40 step 2 review: focus lands on the terminal surface', () => {
  it('death moves focus into the DeathScreen dialog', () => {
    const { container } = renderGame(
      terminalGame({ terminal: true, endingId: 'tragic_death', player: { alive: false } as GameState['player'] }),
    )
    const death = container.querySelector('.death-screen')
    expect(death).not.toBeNull()
    expect(death!.contains(document.activeElement), `focus stayed on ${document.activeElement?.nodeName}`).toBe(true)
  })

  it('death makes the world behind the dialog inert', () => {
    const { container } = renderGame(
      terminalGame({ terminal: true, endingId: 'tragic_death', player: { alive: false } as GameState['player'] }),
    )
    // backgroundRefs (GameScreen.tsx:326) only ever holds elements marked by the
    // callback ref, so querying the same classes is querying exactly that set.
    for (const selector of ['.topbar', '.stage-notices', '.hud-panel']) {
      const element = container.querySelector(selector)
      if (element === null) continue // legacy HUD is conditional; check what rendered
      expect(element.hasAttribute('inert'), `${selector} must be inert while DeathScreen is up`).toBe(true)
    }
  })

  it('dismissing the death screen hands the background back and stops stealing focus', () => {
    const { container } = renderGame(
      terminalGame({ terminal: true, endingId: 'tragic_death', player: { alive: false } as GameState['player'] }),
    )
    const dismiss = container.querySelector('.death-dismiss')
    expect(dismiss).not.toBeNull()
    fireEvent.click(dismiss!)
    const topbar = container.querySelector('.topbar')
    expect(topbar!.hasAttribute('inert'), 'inert must be lifted once the dialog closes').toBe(false)
    // The banner replaces the dialog on the same tick; focus follows it.
    expect(document.activeElement?.classList.contains('ending-banner')).toBe(true)
  })

  it('a non-death ending focuses the banner so it gets announced', () => {
    renderGame(terminalGame({ terminal: true, endingId: 'blank_page' }))
    expect(document.activeElement?.classList.contains('ending-banner')).toBe(true)
  })

  it('an in-progress game leaves focus alone', () => {
    const { container } = renderGame(terminalGame({}))
    expect(container.querySelector('.ending-banner')).toBeNull()
    expect(document.activeElement?.nodeName).not.toBe('SECTION')
    for (const selector of ['.topbar', '.hud-panel', '.world-content']) {
      expect(container.querySelector(selector)?.hasAttribute('inert') ?? false, `${selector} must stay live`).toBe(false)
    }
  })
})

// Round-6 reviewer MEDIUM-1: `.game-shell > .ending-banner` sits at z-index 32
// and its margin box overlaps the 52px proto-topbar band, so it swallows clicks
// on the lower strip of the merged topbar controls (journal launcher, exit,
// locale). Playwright centre-clicks cannot see this. The fix is
// `pointer-events: none` on the banner, which is only safe while the banner holds
// no interactive content — jsdom applies no author CSS, so the click-through
// itself is pinned by e2e/acceptance-visual.spec.ts; THIS test pins the
// precondition, so the day someone adds a button to the banner the CSS fix
// cannot silently break it.
describe('issue #40 step 2 review: the ending banner stays click-through-safe', () => {
  it('contains no focusable or clickable descendants', () => {
    const { container } = renderGame(terminalGame({ terminal: true, endingId: 'blank_page' }))
    const banner = container.querySelector('.ending-banner')!
    expect(banner.querySelector('a, button, input, select, textarea, summary, [tabindex]')).toBeNull()
  })
})
