// @vitest-environment jsdom
// Issue #35 acceptance: a combat_crit chronicle line must carry its own visual
// signal (is-crit class) and a localized non-colour marker (aria-label prefix),
// in BOTH locales — mirroring how a hit line is tagged is-combat.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from '../src/App'
import type { RefObject } from 'react'
import { ChronicleFeed } from '../src/ui/gameScreen/panels'
import type { Locale } from '../src/engine'

const NULL_REF = { current: null } as unknown as RefObject<HTMLDivElement>
const NULL_LI_REF = { current: null } as unknown as RefObject<HTMLLIElement>

function chronicleMarkup(locale: Locale): string {
  return renderToStaticMarkup(
    <ChronicleFeed
      chronicle={['Súc vật bị thương, 8 sát thương.', 'ĐỘNH CHÍ MẠNG! 42 sát thương chí mạng!']}
      chronicleKinds={['combat_hit', 'combat_crit']}
      chronicleEndRef={NULL_LI_REF}
      chronicleNewAt={-1}
      chronicleRef={NULL_REF}
      locale={locale}
    />,
  )
}

function liFor(markup: string, kind: string): string | null {
  return markup.match(new RegExp(`<li[^>]*data-kind="${kind}"[^>]*>`))?.[0] ?? null
}

describe('chronicle crit visual signal (issue #35)', () => {
  it('tags the combat_crit line with is-crit in both locales', () => {
    for (const locale of ['vi', 'en'] as const) {
      const crit = liFor(chronicleMarkup(locale), 'combat_crit')
      const hit = liFor(chronicleMarkup(locale), 'combat_hit')
      expect(crit, `${locale}: crit li present`).not.toBeNull()
      expect(hit, `${locale}: hit li present`).not.toBeNull()
      expect(crit, locale).toContain('is-crit')
      expect(crit, locale).not.toContain('is-combat')
      expect(hit, locale).toContain('is-combat')
      expect(hit, locale).not.toContain('is-crit')
    }
  })

  it('pairs the crit with a localized text marker, not colour alone (aria-label prefix)', () => {
    expect(liFor(chronicleMarkup('vi'), 'combat_crit')).toContain('aria-label="Chí mạng:')
    expect(liFor(chronicleMarkup('en'), 'combat_crit')).toContain('aria-label="Critical:')
  })
})

// The unit tests above hand ChronicleFeed two pre-aligned arrays, so they can
// never catch the failure mode a reviewer found in the real session: the
// wake-up line seeded by `freshSession` had no entry in `chronicleKinds`, and
// `act`'s `previous.chronicleKinds ?? []` then materialized a one-short array
// — so every chronicle line from then on was styled with the PREVIOUS line's
// kind (a crit rendered plain, the hit above it rendered as the crit).
// This drives the actual boot → act() → persist path and asserts the pairing
// invariant the renderer relies on. RED against the pre-fix freshSession.
describe('chronicle/kinds alignment through the real new-game path (issue #35)', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => cleanup())

  function savedSession(): { chronicle: unknown[]; chronicleKinds: unknown[] | undefined } {
    const slots = JSON.parse(window.localStorage.getItem('phe-can-ky:slots') ?? '{}') as Record<
      string,
      { session?: { chronicle?: unknown[]; chronicleKinds?: unknown[] } }
    >
    const session = Object.values(slots).find((slot) => slot.session !== undefined)?.session
    if (session === undefined) throw new Error('no persisted session — the run never saved')
    return { chronicle: session.chronicle ?? [], chronicleKinds: session.chronicleKinds }
  }

  it('seeds the wake-up line with a kind and keeps both arrays index-aligned', async () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('menu-new-game'))
    fireEvent.click(screen.getByTestId('system-tile-sys_battle'))
    fireEvent.click(screen.getByTestId('newgame-confirm'))
    fireEvent.click(screen.getByRole('button', { name: /nhấn|press/i }))
    expect(screen.getByTestId('game-screen')).toBeTruthy()

    // Every action goes through act(), which appends to both arrays.
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    fireEvent.keyDown(window, { key: 'ArrowUp' })

    await waitFor(() => {
      const { chronicle, chronicleKinds } = savedSession()
      expect(chronicle.length).toBeGreaterThan(1)
      expect(chronicleKinds?.length).toBe(chronicle.length)
    })
    const { chronicleKinds } = savedSession()
    // Index 0 is the seeded line: it must carry its own kind, not the kind of
    // whatever the first action emitted (that shift is the whole bug).
    expect(chronicleKinds?.[0]).toBe('game_started')
  })

  it('renders the seeded line with game_started, not the next line kind', () => {
    const markup = renderToStaticMarkup(
      <ChronicleFeed
        chronicle={['Ngươi tỉnh dậy tại làng Thanh Mộc.', 'ĐỘNH CHÍ MẠNG! 42 sát thương chí mạng!']}
        chronicleKinds={['game_started', 'combat_crit']}
        chronicleEndRef={NULL_LI_REF}
        chronicleNewAt={-1}
        chronicleRef={NULL_REF}
        locale="vi"
      />,
    )
    const lines = [...markup.matchAll(/<li[^>]*>/g)].map((m) => m[0])
    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain('data-kind="game_started"')
    expect(lines[0]).not.toContain('is-crit')
    expect(lines[1]).toContain('is-crit')
  })
})
