// @vitest-environment jsdom
// T10: the journal drawer's only dismiss control rendered as "← Về thế giới Esc"
// with no explicit accessible name. A player (or automation) looking for the
// standard modal close affordance — "Đóng", "Close", "✕", "Quay lại" — could not
// find one anywhere in the open drawer; the `Esc` hint is aria-hidden and
// contributes nothing to the name.
// The fix is an explicit aria-label that still CONTAINS the visible label, so the
// existing /Back to world/ and /← Về thế giới/ locators (e2e + t10-journal-inert)
// keep resolving and WCAG 2.5.3 label-in-name holds.
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import { GameScreen } from '../src/ui/GameScreen'

// The vocabulary the ticket names: close / đóng / quay lại / ✕.
const CLOSE_NAME = /đóng|close|quay lại|✕/i

function renderGame(locale: 'en' | 'vi') {
  return render(
    <GameScreen
      chronicle={[]}
      game={newGame(`t10-journal-close-${locale}`)}
      locale={locale}
      onAction={() => undefined}
      onLocaleChange={() => undefined}
    />,
  )
}

function openJournal(locale: 'en' | 'vi'): HTMLElement {
  fireEvent.click(screen.getByRole('button', { name: locale === 'en' ? 'Open Journey journal' : 'Mở Hành trang và giang hồ' }))
  return screen.getByTestId('journal-screen')
}

// Scoped to the drawer: the world map pins' own text ("walk close to trigger")
// matches the vocabulary too, and they are not close controls.
function drawerCloseButton(): HTMLElement {
  return within(screen.getByTestId('journal-screen')).getByRole('button', { name: CLOSE_NAME })
}

afterEach(cleanup)

describe('T10: the journal drawer exposes a discoverable close control', () => {
  it('names the dismiss control as a close action', () => {
    const { container } = renderGame('en')
    openJournal('en')

    const close = drawerCloseButton()
    expect(close.className).toContain('journal-return')
    // One dismiss control in the drawer, not a name that happens to match two.
    expect(container.querySelectorAll('#journal-screen .journal-return')).toHaveLength(1)
  })

  it('keeps the visible label inside the accessible name (WCAG 2.5.3)', () => {
    renderGame('en')
    openJournal('en')
    expect(drawerCloseButton().getAttribute('aria-label') ?? '').toContain('Back to world')
  })

  it('localizes the close name for the Vietnamese UI', () => {
    renderGame('vi')
    openJournal('vi')
    expect(drawerCloseButton().getAttribute('aria-label') ?? '').toContain('Về thế giới')
  })

  it('closes the drawer and hands focus back to the launcher', async () => {
    renderGame('en')
    const journal = openJournal('en')
    expect(journal.hidden).toBe(false)

    fireEvent.click(drawerCloseButton())

    expect(journal.hidden).toBe(true)
    expect(screen.getByTestId('world-content').hidden).toBe(false)
    // The launcher unmounts while the drawer is open, so match the re-mounted
    // node by id rather than by the (detached) element captured before.
    await waitFor(() => expect(document.activeElement?.id).toBe('journal-launcher'))
  })
})
