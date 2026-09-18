// @vitest-environment jsdom
// T4 (finding 4): once `state.terminal` is set the engine refuses every
// non-`new_game` action with `{ type:'ERROR', code:'TERMINAL' }`
// (reducer.ts:149) — but the >=921px ProtoShell kept its world controls
// looking live: the chips, the map pins, the NPC chat pins and the command
// bar all still read as clickable. GameScreen's legacy surface already pins
// this parity with `disabled={game.terminal || ...}` on its quick actions;
// this is the same contract at the ProtoShell surface.
//
// jsdom applies no author stylesheets, so what is pinned here is the
// *attribute* contract, not the visual dimming. Two locked fixtures are used
// on purpose:
//   - terminal + dead  → every chip must advertise the lock.
//   - terminal + alive (a non-death ending) → the map still has walkable
//     cells, so pins render enabled unless the terminal is guarded
//     explicitly. This is the fixture that gives the pin assertion teeth.
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { GameState } from '../src/engine/types'
import { ProtoShell } from '../src/ui/ProtoShell'
import { newGame } from './test-utils'

function renderShell(game: GameState): ReturnType<typeof render> {
  return render(
    <ProtoShell
      game={game}
      chronicle={[]}
      chronicleKinds={[]}
      locale="vi"
      onAction={vi.fn()}
      onLocaleChange={() => undefined}
    />,
  )
}

/** A control advertises the lock if it is really `disabled` or marks itself
 *  `aria-disabled` — the map pins use the latter deliberately so their hover
 *  tooltip (which explains *why* they are dead) keeps working
 *  (proto-shell.css:27-37). Either counts. */
function locked(el: Element): boolean {
  return el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true'
}

const live = newGame('terminal-lock')
const dead = {
  ...live,
  endingId: 'tragic_death',
  terminal: true,
  player: { ...live.player, alive: false, hp: 0 },
} as GameState
const ended = { ...live, endingId: 'blank_page', terminal: true } as GameState

const WORLD_CHIPS = ['rest', 'cultivate', 'gather', 'move', 'gacha']

afterEach(cleanup)

describe('T4: a terminal run locks the ProtoShell world', () => {
  it('locks every world chip when the run is terminal and the player is dead', () => {
    const { container } = renderShell(dead)
    const chips = Array.from(container.querySelectorAll('[data-chip]'))
    expect(chips.map((c) => c.getAttribute('data-chip'))).toEqual(
      expect.arrayContaining(WORLD_CHIPS),
    )
    for (const chip of chips) {
      expect(locked(chip), `chip ${chip.getAttribute('data-chip') ?? ''} must be locked`).toBe(true)
    }
  })

  it('locks every map pin even while the map still holds a walkable path', () => {
    const { container } = renderShell(ended)
    const pins = Array.from(container.querySelectorAll('.proto-map button.pin'))
    expect(pins.length, 'fixture must render map pins').toBeGreaterThan(0)
    for (const pin of pins) {
      expect(locked(pin), `pin ${pin.getAttribute('data-pin-id') ?? pin.getAttribute('data-npc') ?? ''} must be locked`).toBe(true)
    }
  })

  it('locks the command bar so the world read stays closed', () => {
    const { container } = renderShell(ended)
    const input = container.querySelector('.proto-command input')
    const submit = container.querySelector('.proto-command .try')
    expect(input).not.toBeNull()
    expect(submit).not.toBeNull()
    expect(locked(input!), 'command input must be locked').toBe(true)
    expect(locked(submit!), 'command submit must be locked').toBe(true)
  })
})

describe('T4: a live run leaves the ProtoShell world open', () => {
  it('renders the chips unlocked', () => {
    const { container } = renderShell(live)
    const chips = Array.from(container.querySelectorAll('[data-chip]'))
    expect(chips.map((c) => c.getAttribute('data-chip'))).toEqual(
      expect.arrayContaining(WORLD_CHIPS),
    )
    for (const chip of chips) {
      expect(locked(chip), `chip ${chip.getAttribute('data-chip') ?? ''} must stay live`).toBe(false)
    }
  })

  it('leaves the reachable pins and the command bar unlocked', () => {
    const { container } = renderShell(live)
    const walkable = Array.from(container.querySelectorAll('.proto-map .pin[data-pin-walkable]'))
    expect(walkable.length, 'fixture must have at least one walkable cell').toBeGreaterThan(0)
    for (const pin of walkable) {
      expect(locked(pin), `walkable pin ${pin.getAttribute('data-pin-id') ?? ''} must stay live`).toBe(false)
    }
    expect(locked(container.querySelector('.proto-command input')!)).toBe(false)
    expect(locked(container.querySelector('.proto-command .try')!)).toBe(false)
  })
})
