// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { GameScreen } from '../src/ui/GameScreen'
import { newGame } from './test-utils'

const INDEX_CSS_PATH = resolve(process.cwd(), 'src/index.css')
const HARNESS_PATH = resolve(process.cwd(), 'scripts/browser-use-server.mjs')

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
  afterEach(() => {
    cleanup()
    document.head.querySelectorAll('style[data-test="index-css"]').forEach((el) => el.remove())
  })

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

  // T8 (WCAG 2.4.1 Bypass Blocks): The old stylesheet rule parked the unfocused link at
  // `top: -40px`. Negative viewport coordinates cause Playwright actionability checks to
  // fail and stall 20s. The link must use WCAG-standard clipping (clip-path, top: 0,
  // pointer-events: none when unfocused) and restore them on focus.
  it('uses WCAG standard clipping without negative viewport coordinates in src/index.css', () => {
    const css = readFileSync(INDEX_CSS_PATH, 'utf8')
    const skipLinkMatch = css.match(/\.skip-link\s*\{([^}]+)\}/)
    expect(skipLinkMatch, '.skip-link rule must exist in src/index.css').not.toBeNull()
    const skipLinkBody = skipLinkMatch![1]!

    // Must not have negative top (e.g. top: -40px)
    expect(skipLinkBody).not.toMatch(/top\s*:\s*-\d+/)
    // Must use top: 0
    expect(skipLinkBody).toMatch(/top\s*:\s*0/)
    // Must use clip-path: inset(50%) or clip-path
    expect(skipLinkBody).toMatch(/clip-path\s*:\s*inset\(50%\)/)
    // Must set pointer-events: none when unfocused
    expect(skipLinkBody).toMatch(/pointer-events\s*:\s*none/)

    // On focus, must unclip and restore pointer events
    const focusMatch = css.match(/\.skip-link:focus\s*\{([^}]+)\}/)
    expect(focusMatch, '.skip-link:focus rule must exist in src/index.css').not.toBeNull()
    const focusBody = focusMatch![1]!
    expect(focusBody).toMatch(/clip-path\s*:\s*none/)
    expect(focusBody).toMatch(/pointer-events\s*:\s*auto/)
  })

  it('computes top: 0px and pointer-events: none on unfocused skip link with index.css', () => {
    const css = readFileSync(INDEX_CSS_PATH, 'utf8')
    const styleEl = document.createElement('style')
    styleEl.setAttribute('data-test', 'index-css')
    styleEl.textContent = css
    document.head.appendChild(styleEl)

    bootScreen()
    const link = screen.getByRole('link', { name: 'Skip to inventory' })
    const computed = window.getComputedStyle(link)
    expect(computed.top).toBe('0px')
    expect(computed.pointerEvents).toBe('none')
  })

  // T8: the harness digest must never offer a control the player cannot click.
  // An unfocused skip link is pointer-inert (CSS above), so `visible()` has to
  // reject it — a listed-stale control is what sent bots into the 20s timeout.
  // Furthermore, collectDigest and nthActionable unconditionally drop a.skip-link
  // unless the caller explicitly asks for everything with ?all=1.
  // (Asserted as source text: importing the module boots its HTTP server.)
  it('teaches the harness visible() to drop pointer-inert controls and drops a.skip-link unless ?all=1', () => {
    const source = readFileSync(HARNESS_PATH, 'utf8')
    const visibleFn = source.match(/const visible = \(node\) => \{[\s\S]*?\n\s{2}\}/)
    expect(visibleFn, 'visible() must exist in scripts/browser-use-server.mjs').not.toBeNull()
    expect(visibleFn![0]).toMatch(/pointerEvents === 'none'/)
    // ...and reject anything outside the viewport, the other half of the stall.
    expect(visibleFn![0]).toMatch(/rect\.top >= 0/)
    expect(visibleFn![0]).toMatch(/rect\.bottom <= window\.innerHeight/)

    const digest = source.slice(source.indexOf('export function collectDigest'), source.indexOf('function renderDigest'))
    expect(digest, 'collectDigest must exist in scripts/browser-use-server.mjs').toContain('skip-link')
    expect(digest).toMatch(/if \(!all &&[^\n]*skip-link[^\n]*\) return/)

    const nth = source.slice(source.indexOf('function nthActionable'), source.indexOf('async function nthHandle'))
    expect(nth, 'nthActionable must exist in scripts/browser-use-server.mjs').toContain('skip-link')
    expect(nth).toMatch(/if \(!all &&[^\n]*skip-link[^\n]*\) return false/)
  })

  // T8 / #4 #7 #9 (WCAG 2.4.1 Bypass Blocks): #dock-panel-inventory lives inside
  // the journal drawer, which is hidden by default. A browser hash-jump into a
  // hidden subtree lands keyboard focus nowhere — the "skip" skips into a wall.
  // Activating it must open the drawer and put focus in the panel it names.
  it('opens the journal and focuses the inventory panel when the skip link is activated', async () => {
    bootScreen()
    expect(screen.getByTestId('journal-screen').hidden).toBe(true)

    fireEvent.click(screen.getByRole('link', { name: 'Skip to inventory' }))

    const journal = screen.getByTestId('journal-screen')
    expect(journal.hidden).toBe(false)
    const panel = document.getElementById('dock-panel-inventory')!
    expect(panel.hidden).toBe(false)
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true))
  })

  // Keyboard activation is the whole point of a skip link — Enter on the focused
  // anchor must take the same path as a mouse click.
  it('takes the same drawer-opening path on keyboard activation', async () => {
    bootScreen()
    const link = screen.getByRole('link', { name: 'Skip to inventory' }) as HTMLAnchorElement
    link.focus()
    fireEvent.keyDown(link, { key: 'Enter' })
    fireEvent.click(link)

    const panel = document.getElementById('dock-panel-inventory')!
    expect(screen.getByTestId('journal-screen').hidden).toBe(false)
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true))
  })
})

