// @vitest-environment jsdom
// Ticket: no consumable/heal button in the combat bar even though the reducer
// keeps `use_item` legal mid-encounter (src/engine/reducer.ts:400-412 —
// "consumables remain a deliberate one-turn choice; enemy counter-attacks after
// drink"). Both combat bars (.proto-combat-overlay .acts in ProtoShell and
// .encounter-actions in GameScreen) rendered only attack/technique/defend/
// retreat, so the legal move was unreachable by clicking.
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyAction, newGame } from '../src/engine'
import type { GameState } from '../src/engine/types'
import { GameScreen } from '../src/ui/GameScreen'
import { ProtoShell } from '../src/ui/ProtoShell'
import { navTo } from './test-utils'

/**
 * A real fight: sanitizeRpgState (src/engine/rpg-state.ts:48) clears an
 * encounter whose enemy is not at the player's location, so a hand-seeded one
 * cannot reach the reducer. Walk to the boar and start the encounter instead,
 * then wound the player and stock the satchel.
 */
function inFight(
  seed: string,
  inventory: Record<string, number> = { pill_hp: 2, wooden_staff: 1 },
): GameState {
  let game = navTo(newGame(seed), 'misty_forest')
  game = applyAction(game, { kind: 'start_encounter' }).state
  if (game.encounter === null) throw new Error('fixture lost the encounter')
  return { ...game, player: { ...game.player, hp: 20 }, inventory: { ...game.inventory, ...inventory } }
}

function renderShell(game: GameState, onAction: (a: unknown) => void) {
  return render(
    <ProtoShell game={game} chronicle={[]} locale="vi" onAction={onAction} onLocaleChange={() => undefined} />,
  )
}

function renderScreen(game: GameState, onAction: (a: unknown) => void) {
  return render(
    <GameScreen
      chronicle={[]}
      game={game}
      locale="vi"
      onAction={onAction}
      onExitToMenu={() => undefined}
      onLocaleChange={() => undefined}
      onRestart={() => undefined}
    />,
  )
}

afterEach(cleanup)

describe('ProtoShell combat bar offers consumables', () => {
  it('renders a Dùng button for the held restoration pill inside .acts', () => {
    renderShell(inFight('combat-use-item-proto'), vi.fn())
    const buttons = screen.getAllByRole('button', { name: /Dùng Viên hồi nguyên/ })
    expect(buttons.length).toBeGreaterThan(0)
    expect(buttons.some((b) => b.closest('.proto-combat-overlay .acts') !== null)).toBe(true)
  })

  it('shows the stock count in the label', () => {
    renderShell(inFight('combat-use-item-qty'), vi.fn())
    expect(screen.getAllByText(/Dùng Viên hồi nguyên \(2\)/).length).toBeGreaterThan(0)
  })

  it('clicking dispatches use_item with qty 1 (mid-fight the reducer refuses any other qty)', () => {
    const onAction = vi.fn()
    renderShell(inFight('combat-use-item-click-proto'), onAction)
    fireEvent.click(screen.getAllByRole('button', { name: /Dùng Viên hồi nguyên/ })[0]!)
    expect(onAction).toHaveBeenCalledWith({ kind: 'use_item', itemId: 'pill_hp', qty: 1 })
  })

  it('never offers the non-usable staff', () => {
    renderShell(inFight('combat-use-item-staff'), vi.fn())
    expect(screen.queryByRole('button', { name: /Dùng Mộc trượng cũ/ })).toBeNull()
  })

  it('offers nothing once the pills are gone', () => {
    const game = inFight('combat-use-item-drained')
    const rest = Object.fromEntries(Object.entries(game.inventory).filter(([id]) => id !== 'pill_hp'))
    renderShell({ ...game, inventory: rest }, vi.fn())
    expect(screen.queryByRole('button', { name: /Dùng Viên hồi nguyên/ })).toBeNull()
  })
})

describe('GameScreen encounter banner offers consumables', () => {
  it('renders the Dùng button inside .encounter-actions and dispatches use_item', () => {
    const onAction = vi.fn()
    renderScreen(inFight('combat-use-item-legacy'), onAction)
    const found = screen
      .getAllByRole('button', { name: /Dùng Viên hồi nguyên/ })
      .find((b) => b.closest('.encounter-actions') !== null)
    expect(found, 'a Dùng button must sit in .encounter-actions').toBeDefined()
    fireEvent.click(found!)
    expect(onAction).toHaveBeenCalledWith({ kind: 'use_item', itemId: 'pill_hp', qty: 1 })
  })
})

describe('the reducer seam the buttons rely on', () => {
  it('use_item mid-fight heals net of the enemy counter and consumes one pill', () => {
    const start = inFight('combat-use-item-engine')
    const result = applyAction(start, { kind: 'use_item', itemId: 'pill_hp', qty: 1 })
    expect(result.state.player.hp).toBeGreaterThan(start.player.hp)
    expect(result.state.inventory.pill_hp).toBe(1)
    expect(result.state.encounter?.enemyTurns).toBe(1)
    expect(result.events.some((e) => e.type === 'ITEM_USED')).toBe(true)
    expect(result.events.some((e) => e.type === 'COMBAT_HIT')).toBe(true)
  })

  it('qty other than 1 is refused inside an encounter', () => {
    const result = applyAction(inFight('combat-use-item-bulk'), { kind: 'use_item', itemId: 'pill_hp', qty: 2 })
    expect(result.events.some((e) => e.type === 'ERROR')).toBe(true)
    expect(result.state.inventory.pill_hp).toBe(2)
  })
})
