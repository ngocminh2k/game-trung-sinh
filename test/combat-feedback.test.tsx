// @vitest-environment jsdom
// F9 (T9): combat had no readable feedback. (a) the technique buttons in
// ProtoShell rendered `Xuất <name>` with no qi cost while the basic strike two
// buttons up showed `(4 khí)`; (b) the compact ticker showed only the newest
// chronicle line, which after a kill is a day-limit WARNING (COMBAT_WON is
// emitted first, the clock warnings follow) — so the player's only win signal
// was gold moving. The loot line exists in `chronicle`; it just never reached
// the one line the player reads.
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyAction, narrate, newGame } from '../src/engine'
import type { Action, GameState } from '../src/engine/types'
import { ProtoShell } from '../src/ui/ProtoShell'
import { navTo } from './test-utils'

function inFight(seed: string): GameState {
  let game = navTo(newGame(seed), 'misty_forest')
  game = applyAction(game, { kind: 'start_encounter' }).state
  if (game.encounter === null) throw new Error('fixture lost the encounter')
  return game
}

/** Replay attacks the way App.act accumulates the chronicle + kinds pair. */
function fight(seed: string, action: Action, rounds: number): { game: GameState; chronicle: string[]; kinds: string[] } {
  let game = inFight(seed)
  const chronicle: string[] = []
  const kinds: string[] = []
  for (let i = 0; i < rounds && game.encounter !== null; i++) {
    const result = applyAction(game, action)
    chronicle.push(...narrate(result.events, 'vi'))
    kinds.push(...result.events.map((e) => e.type.toLowerCase()))
    game = result.state
  }
  return { game, chronicle, kinds }
}

function renderShell(game: GameState, chronicle: string[], kinds: string[]) {
  return render(
    <ProtoShell
      game={game}
      chronicle={chronicle}
      chronicleKinds={kinds}
      locale="vi"
      onAction={vi.fn()}
      onLocaleChange={() => undefined}
    />,
  )
}

afterEach(cleanup)

describe('technique buttons show their qi cost', () => {
  it('names the cost for every technique in the combat bar (6 khí for Mộc Trượng Thức)', () => {
    renderShell(inFight('combat-feedback-cost'), [], [])
    const acts = document.querySelector('.proto-combat-overlay .acts')
    expect(acts).not.toBeNull()
    const techniqueButtons = Array.from(acts!.querySelectorAll('button')).filter((b) =>
      (b.textContent ?? '').startsWith('Xuất '),
    )
    expect(techniqueButtons.length).toBeGreaterThan(0)
    for (const button of techniqueButtons) {
      expect(button.textContent).toMatch(/Xuất .+ \(\d+ khí\)/)
    }
    expect(screen.getByRole('button', { name: 'Xuất Mộc Trượng Thức (6 khí)' })).toBeDefined()
  })
})

describe('the combat ticker surfaces damage and the victory/loot line', () => {
  it('shows a per-hit damage line while the fight is live', () => {
    const { game, chronicle, kinds } = fight('combat-feedback-hit', { kind: 'combat_attack' }, 1)
    renderShell(game, chronicle, kinds)
    const ticker = document.querySelector('.proto-ticker .msg')
    expect(ticker?.textContent).toMatch(/\d+ sát thương/)
  })

  it('shows the loot line after a lethal hit instead of the trailing clock WARNING', () => {
    const { game, chronicle, kinds } = fight('combat-feedback-kill', { kind: 'combat_attack' }, 12)
    expect(kinds).toContain('combat_won')
    expect(game.encounter).toBeNull()
    renderShell(game, chronicle, kinds)
    const status = Array.from(document.querySelectorAll('[role="status"]'))
    expect(status.some((el) => /nhận \d+ lượng/.test(el.textContent ?? ''))).toBe(true)
  })

  it('drops the enemy health label once the enemy is dead', () => {
    const { game, chronicle, kinds } = fight('combat-feedback-kill', { kind: 'combat_attack' }, 12)
    renderShell(game, chronicle, kinds)
    expect(screen.queryByLabelText(/Sinh lực địch/)).toBeNull()
  })
})

describe('peacetime controls locked during combat', () => {
  it('disables peacetime chips, command input, and locks NPC pins during encounter', () => {
    const onAction = vi.fn()
    const game = inFight('combat-peacetime-lock')
    expect(game.encounter).not.toBeNull()
    render(
      <ProtoShell
        game={game}
        chronicle={[]}
        chronicleKinds={[]}
        locale="vi"
        onAction={onAction}
        onLocaleChange={() => undefined}
      />,
    )

    // Command input disabled
    const cmdInput = screen.getByLabelText('Nhập mệnh lệnh') as HTMLInputElement
    expect(cmdInput.disabled).toBe(true)

    // Peacetime chips disabled
    const chipKeys = ['rest', 'cultivate', 'gather', 'move', 'gacha']
    for (const key of chipKeys) {
      const btn = document.querySelector<HTMLButtonElement>(`button[data-chip="${key}"]`)
      expect(btn).not.toBeNull()
      expect(btn!.disabled).toBe(true)
      fireEvent.click(btn!)
    }

    // Try submit button disabled
    const tryBtn = document.querySelector<HTMLButtonElement>('button.try')
    expect(tryBtn).not.toBeNull()
    expect(tryBtn!.disabled).toBe(true)
    fireEvent.click(tryBtn!)

    // Submitting command does not dispatch
    fireEvent.submit(document.querySelector('.proto-command')!)
    expect(onAction).not.toHaveBeenCalled()

    // NPC map pins have aria-disabled="true" and clicking does not open NpcChatModal
    const npcPins = document.querySelectorAll<HTMLButtonElement>('.proto-map button.pin.npc')
    expect(npcPins.length).toBeGreaterThan(0)
    for (const pin of npcPins) {
      expect(pin.getAttribute('aria-disabled')).toBe('true')
      fireEvent.click(pin)
    }
    expect(document.querySelector('[data-od-id="chat-modal"]')).toBeNull()
  })
})

