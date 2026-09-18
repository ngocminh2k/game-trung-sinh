// @vitest-environment jsdom
// RESIDUAL #31: TWO topbars coexisted at ≥921px — the legacy header.topbar and
// the ProtoShell band each carried their own row of controls, and the legacy
// journal/exit/locale buttons floated over the HUD band. The fix moves the
// controls into ProtoShell's topbar and hides the legacy one at ≥921px.
// jsdom never applies author stylesheets, so "hidden" is not observable here —
// the real fix therefore UNMOUNTS the duplicated controls (a matchMedia gate in
// GameScreen), and that structural contract is what these tests pin:
//   1. merged (matchMedia ≥921px true): every control renders exactly once and
//      lives inside .proto-topbar, never inside the legacy header's actions;
//   2. narrow (false) and matchMedia-absent: the legacy header keeps them;
//   3. the accessibility contracts survive the move verbatim
//      (aria-controls/aria-label on the launcher, role="group" + aria-label on
//      the language toggle, aria-current, <kbd aria-hidden>), and the ProtoShell
//      locale iconbtn does NOT double up with the moved VI/EN toggle.
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import { GameScreen } from '../src/ui/GameScreen'

function stubMatchMedia(desktop: boolean): void {
  window.matchMedia = ((media: string) => ({
    matches: desktop,
    media,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

function removeMatchMedia(): void {
  delete (window as unknown as { matchMedia?: unknown }).matchMedia
}

function renderGame(): ReturnType<typeof render> {
  return render(
    <GameScreen
      chronicle={[]}
      game={newGame('issue31-merge')}
      locale="en"
      onAction={() => undefined}
      onExitToMenu={() => undefined}
      onLocaleChange={() => undefined}
    />,
  )
}

afterEach(() => {
  cleanup()
  stubMatchMedia(false)
})

describe('issue #31 residual: one topbar owns the controls at ≥921px', () => {
  it('merged: every legacy control renders exactly once and inside the proto topbar', () => {
    stubMatchMedia(true)
    const { container } = renderGame()
    const proto = container.querySelector('.proto-topbar')
    expect(proto).not.toBeNull()
    for (const sel of ['#journal-launcher', '[data-testid="game-exit-menu"]', '.language-toggle', '.day-chip']) {
      const found = container.querySelectorAll(sel)
      expect(found, sel).toHaveLength(1)
      const el = found[0]!
      expect(el.closest('.proto-topbar'), `${sel} must live in the proto band`).not.toBeNull()
      expect(el.closest('header.topbar'), `${sel} must NOT stay in the legacy header`).toBeNull()
    }
    // The legacy header itself stays mounted (storyOpen marks it inert), it
    // just no longer carries an actions row.
    expect(container.querySelector('header.topbar')).not.toBeNull()
    expect(container.querySelector('header.topbar .topbar-actions')).toBeNull()
  })

  it('merged: the language buttons are not duplicated by the proto iconbtn toggle', () => {
    stubMatchMedia(true)
    const { container } = renderGame()
    // ProtoShell's built-in "EN"/"VI" icon button must be suppressed while the
    // real toggle is merged in — otherwise getByRole(name:'EN') is ambiguous.
    const enButtons = [...container.querySelectorAll('button')].filter((b) => b.textContent?.trim() === 'EN')
    expect(enButtons).toHaveLength(1)
    expect(enButtons[0]!.closest('.language-toggle')).not.toBeNull()
  })

  it('merged: accessibility contracts survive the move', () => {
    stubMatchMedia(true)
    const { container } = renderGame()
    const launcher = container.querySelector('#journal-launcher') as HTMLElement
    expect(launcher.getAttribute('aria-controls')).toBe('journal-screen')
    expect(launcher.getAttribute('aria-label')).toBe('Open Journey journal')
    const kbd = launcher.querySelector('kbd') as HTMLElement
    expect(kbd.getAttribute('aria-hidden')).toBe('true')
    const group = container.querySelector('.language-toggle') as HTMLElement
    expect(group.getAttribute('role')).toBe('group')
    expect(group.getAttribute('aria-label')).toBe('Language')
    expect(group.querySelector('button[aria-current="true"]')?.textContent).toBe('EN')
  })

  it('narrow (<921px): the legacy header keeps every control', () => {
    stubMatchMedia(false)
    const { container } = renderGame()
    for (const sel of ['#journal-launcher', '[data-testid="game-exit-menu"]', '.language-toggle', '.day-chip']) {
      const found = container.querySelectorAll(sel)
      expect(found, sel).toHaveLength(1)
      const el = found[0]!
      expect(el.closest('header.topbar'), `${sel} must stay in the legacy header`).not.toBeNull()
      expect(el.closest('.proto-topbar'), `${sel} must not leak into the proto band`).toBeNull()
    }
    expect(container.querySelector('header.topbar .topbar-actions')).not.toBeNull()
  })

  it('matchMedia absent (SSR/jsdom default) renders the legacy layout, not a crash', () => {
    removeMatchMedia()
    const { container } = renderGame()
    expect(container.querySelectorAll('#journal-launcher')).toHaveLength(1)
    expect(container.querySelector('#journal-launcher')?.closest('header.topbar')).not.toBeNull()
  })
})
