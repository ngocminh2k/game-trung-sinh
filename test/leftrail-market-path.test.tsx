// Rail Chợ & Đạo đồ tabs: the two rail tabs used to paint passive headers only
// (currency read-outs and learned-technique rows), so a player looking at the
// rail could read the market but never trade in it. These tests pin the fix:
// every listed row carries a real affordance that dispatches the action the
// engine already implements — and stays disabled when the engine would refuse.
// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyAction, newGame, type GameState } from '../src/engine'
import { LeftRailTabContent } from '../src/ui/LeftRailTabContent'
import { navTo } from './test-utils'

afterEach(cleanup)

function richMarketGame(): GameState {
  const atMarket = navTo(newGame('leftrail-market'), 'market')
  return { ...atMarket, player: { ...atMarket.player, gold: 9999, silver: 9999, spiritStones: 9, stage: 3 } }
}

function enabledButtons(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('button')).filter((b) => !b.disabled)
}

describe('rail market tab', () => {
  it('lists wares as rows, not as a wall of prices', () => {
    const { container } = render(
      <LeftRailTabContent tab="market" game={richMarketGame()} locale="vi" onAction={vi.fn()} />,
    )
    expect(container.querySelectorAll('.proto-market-row').length).toBeGreaterThan(0)
  })

  it('clicking a Mua button dispatches a buy for that item', () => {
    const onAction = vi.fn()
    const { container } = render(
      <LeftRailTabContent tab="market" game={richMarketGame()} locale="vi" onAction={onAction} />,
    )
    const buy = enabledButtons(container).filter((b) => b.textContent === 'Mua')
    expect(buy.length, 'the market tab must expose at least one enabled Mua button').toBeGreaterThan(0)
    fireEvent.click(buy[0]!)
    expect(onAction).toHaveBeenCalledTimes(1)
    expect(onAction.mock.calls[0]![0]).toMatchObject({ kind: 'buy' })
    expect(typeof (onAction.mock.calls[0]![0] as { itemId?: unknown }).itemId).toBe('string')
  })

  it('offers the two currency conversions', () => {
    const onAction = vi.fn()
    const { container } = render(
      <LeftRailTabContent tab="market" game={richMarketGame()} locale="vi" onAction={onAction} />,
    )
    const converts = enabledButtons(container).filter(
      (b) => b.textContent !== null && b.textContent.includes('Đổi'),
    )
    expect(converts.length, 'spirit stone and silver exchange must both be offered').toBeGreaterThan(1)
    fireEvent.click(converts[0]!)
    expect(onAction.mock.calls[0]![0]).toMatchObject({ kind: 'convert_currency' })
  })

  it('away from the market the listing stays readable but nothing is clickable', () => {
    const onAction = vi.fn()
    const away = applyAction(newGame('leftrail-away'), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
    const { container } = render(
      <LeftRailTabContent tab="market" game={away} locale="vi" onAction={onAction} />,
    )
    expect(container.querySelectorAll('.proto-market-row').length).toBeGreaterThan(0)
    expect(enabledButtons(container)).toHaveLength(0)
  })

  // T1: a dead button is not an explanation. Away from the market the tab used
  // to be a shelf of silently disabled rows, so the player had to guess that
  // location was the gate.
  it('away from the market the tab names the gate in text', () => {
    const away = applyAction(newGame('leftrail-gate'), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
    const { container } = render(
      <LeftRailTabContent tab="market" game={away} locale="vi" onAction={vi.fn()} />,
    )
    const notice = container.querySelector('[data-testid="rail-market-lock"]')
    expect(notice, 'the Chợ tab must print a lock notice, not only disabled buttons').not.toBeNull()
    expect(notice?.textContent ?? '').toContain('Chợ Vân Tập')
    expect(notice?.textContent ?? '').toContain('Hãy di chuyển tới Chợ để giao thương')
  })

  it('at the market the notice is gone', () => {
    const { container } = render(
      <LeftRailTabContent tab="market" game={richMarketGame()} locale="vi" onAction={vi.fn()} />,
    )
    expect(container.querySelector('[data-testid="rail-market-lock"]')).toBeNull()
  })

  it('in combat the notice names the fight, not the map', () => {
    const base = richMarketGame()
    const game: GameState = {
      ...base,
      encounter: { enemyId: 'mist_boar', hp: 10, maxHp: 10, guard: 0 },
    }
    const { container } = render(
      <LeftRailTabContent tab="market" game={game} locale="vi" onAction={vi.fn()} />,
    )
    const notice = container.querySelector('[data-testid="rail-market-lock"]')
    expect(notice?.textContent ?? '').toContain('Đang giao chiến')
  })

  it('all buy buttons expose accessible names containing item name (T-BUY)', () => {
    const { container } = render(
      <LeftRailTabContent tab="market" game={richMarketGame()} locale="vi" onAction={vi.fn()} />,
    )
    const rows = container.querySelectorAll('.proto-market-row')
    expect(rows.length).toBeGreaterThan(0)
    rows.forEach((row) => {
      const name = row.querySelector('.proto-npc__name')?.textContent ?? ''
      const button = row.querySelector('button')
      expect(button).not.toBeNull()
      expect(button?.getAttribute('aria-label')).toBe(`Mua ${name}`)
    })
  })

  it('all buy buttons expose accessible names in English (T-BUY)', () => {
    const { container } = render(
      <LeftRailTabContent tab="market" game={richMarketGame()} locale="en" onAction={vi.fn()} />,
    )
    const rows = container.querySelectorAll('.proto-market-row')
    expect(rows.length).toBeGreaterThan(0)
    rows.forEach((row) => {
      const name = row.querySelector('.proto-npc__name')?.textContent ?? ''
      const button = row.querySelector('button')
      expect(button).not.toBeNull()
      expect(button?.getAttribute('aria-label')).toBe(`Buy ${name}`)
    })
  })
})

describe('rail path tab', () => {
  // jade_charm: buyable gear that starts unequipped (equipment.accessory is
  // null) — the honest "Trang bị" case. wooden_staff is already worn at start.
  function gearGame(seed: string): GameState {
    const base = newGame(seed)
    return { ...base, inventory: { ...base.inventory, jade_charm: 1 }, techniques: { basic_staff_form: 1 } }
  }

  it('keeps the learned rows and adds a Trang bị button for held equipment', () => {
    const onAction = vi.fn()
    const { container } = render(
      <LeftRailTabContent tab="path" game={gearGame('leftrail-path')} locale="vi" onAction={onAction} />,
    )
    // Issue #38 contract: the rail keeps its .proto-npc rows and the avatar
    // glyph stays decorative.
    expect(container.querySelectorAll('.proto-npc').length).toBeGreaterThan(0)
    expect(container.querySelector('.proto-npc__avatar')?.getAttribute('aria-hidden')).toBe('true')

    const equip = enabledButtons(container).filter((b) => b.textContent === 'Trang bị')
    expect(equip.length, 'held gear must be equippable straight from the rail').toBeGreaterThan(0)
    fireEvent.click(equip[0]!)
    expect(onAction).toHaveBeenCalledTimes(1)
    expect(onAction.mock.calls[0]![0]).toMatchObject({ kind: 'equip_item', itemId: 'jade_charm' })
  })

  it('a held manual turns into a Lĩnh ngộ button that dispatches learn_technique', () => {
    const onAction = vi.fn()
    const base = gearGame('leftrail-learn')
    const game: GameState = { ...base, inventory: { ...base.inventory, old_manual: 1 } }
    const { container } = render(
      <LeftRailTabContent tab="path" game={game} locale="vi" onAction={onAction} />,
    )
    const learn = enabledButtons(container).filter((b) => b.textContent === 'Lĩnh ngộ')
    expect(learn.length, 'the crooked manual in the bag must be learnable from the rail').toBeGreaterThan(0)
    fireEvent.click(learn[0]!)
    expect(onAction).toHaveBeenCalledTimes(1)
    expect(onAction.mock.calls[0]![0]).toMatchObject({ kind: 'learn_technique', techniqueId: 'crooked_circulation' })
  })

  it('mid-encounter the rail stops offering to act', () => {
    const base = gearGame('leftrail-fight')
    const game: GameState = {
      ...base,
      inventory: { ...base.inventory, old_manual: 1 },
      encounter: { enemyId: 'mist_boar', hp: 10, maxHp: 10, guard: 0 },
    }
    const { container } = render(
      <LeftRailTabContent tab="path" game={game} locale="vi" onAction={vi.fn()} />,
    )
    expect(enabledButtons(container)).toHaveLength(0)
  })

  // T1: same silence on Đạo đồ — the rows stay, the buttons die, and nothing
  // on screen said the fight was the reason.
  it('mid-encounter the Đạo đồ tab says why the buttons are dead', () => {
    const base = gearGame('leftrail-fight-note')
    const game: GameState = {
      ...base,
      inventory: { ...base.inventory, old_manual: 1 },
      encounter: { enemyId: 'mist_boar', hp: 10, maxHp: 10, guard: 0 },
    }
    const { container } = render(
      <LeftRailTabContent tab="path" game={game} locale="vi" onAction={vi.fn()} />,
    )
    const notice = container.querySelector('[data-testid="rail-path-lock"]')
    expect(notice, 'the Đạo đồ tab must print a lock notice, not only disabled buttons').not.toBeNull()
    expect(notice?.textContent ?? '').toContain('Đang giao chiến')
  })

  it('out of combat the Đạo đồ notice is gone', () => {
    const { container } = render(
      <LeftRailTabContent tab="path" game={gearGame('leftrail-path-clear')} locale="vi" onAction={vi.fn()} />,
    )
    expect(container.querySelector('[data-testid="rail-path-lock"]')).toBeNull()
  })

  // T1: at the starter village the bag holds no manual and no spare gear, so
  // every row on the tab is passive (the starting staff/robe are already worn).
  // The tab listed "Chưa học công pháp" and stopped there — a dead end with no
  // gate named and no direction. It must say where a technique or a piece of
  // gear comes from instead.
  it('with nothing to learn or equip the tab says where to find one', () => {
    const starter = newGame('leftrail-path-starter')
    const { container } = render(
      <LeftRailTabContent tab="path" game={starter} locale="vi" onAction={vi.fn()} />,
    )
    const notice = container.querySelector('[data-testid="rail-path-lock"]')
    expect(notice, 'an empty Đạo đồ tab must explain itself, not end at a dash').not.toBeNull()
    expect(notice?.textContent ?? '').toContain('khám phá')
  })

  // The same guidance must not fire while a real affordance is on screen.
  it('a Lĩnh ngộ row suppresses the empty-tab guidance', () => {
    const base = newGame('leftrail-path-starter-manual')
    const game: GameState = { ...base, inventory: { ...base.inventory, old_manual: 1 } }
    const { container } = render(
      <LeftRailTabContent tab="path" game={game} locale="vi" onAction={vi.fn()} />,
    )
    expect(container.querySelector('[data-testid="rail-path-lock"]')).toBeNull()
  })
})
