// @vitest-environment jsdom
// Issue #34 — the ATTRIBUTE_ALLOCATION_REQUIRED gate refused EVERY action, so a
// run that could not reach the allocation panel (issue #31 stacking) had zero
// legal moves and died there (AI playtest p04, p12). These tests pin the fix:
//   1. invariant — while points are pending, something other than
//      allocate_attribute is still legal (self-preservation: pills, gear);
//   2. allocate_attribute consumes exactly one point and pays it to one attr;
//   3. points that can never be spent (all four attrs at ATTRIBUTE_MAX) are
//      cleared, so the gate cannot outlive them;
//   4. the allocation control is rendered outside the inert HUD column.
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyAction, ATTRIBUTE_MAX, newGame } from '../src/engine'
import { GameScreen } from '../src/ui/GameScreen'
import type { GameEvent, GameState } from '../src/engine'
import { navTo } from './test-utils'

const ALL_ACTIONS_EXCEPT_ALLOCATE = [
  { kind: 'rest' },
  { kind: 'train' },
  { kind: 'gather' },
  { kind: 'move', direction: 'north' },
  { kind: 'draw_lottery' },
  { kind: 'talk', npcId: 'n_elder_meihua' },
] as const

function gated(seed: string): GameState {
  const base = newGame(seed)
  return { ...base, player: { ...base.player, pendingAttributePoints: 2 } }
}

// Same entry as test/retreat-penalty.test.ts: walk to the forest, start the fight.
function startEncounter(): GameState {
  const at = navTo(newGame('i34-encounter'), 'misty_forest')
  return applyAction(at, { kind: 'start_encounter' }).state
}

const allAttributesCapped = (state: GameState): boolean =>
  Object.values(state.player.attrs).every((v) => v >= ATTRIBUTE_MAX)

const errored = (r: { events: readonly GameEvent[] }, code?: string): boolean =>
  r.events.some((e) => e.type === 'ERROR' && (code === undefined || e.code === code))

describe('issue #34: allocation gate cannot softlock a run', () => {
  afterEach(() => cleanup())

  it('leaves a non-allocate action legal in every gated state (invariant)', () => {
    let state = gated('i34-invariant')
    for (let day = 0; day < 40 && !state.terminal; day += 1) {
      if (state.encounter !== null) state = applyAction(state, { kind: 'combat_retreat' }).state
      if (state.terminal) break
      state = { ...state, player: { ...state.player, pendingAttributePoints: 2 } }
      const nonAllocate = [
        ...ALL_ACTIONS_EXCEPT_ALLOCATE.map((a) => applyAction(state, a)),
        // The starter kit always holds one of each of these.
        applyAction(state, { kind: 'use_item', itemId: 'pill_hp' }),
        applyAction(state, { kind: 'equip_item', itemId: 'tattered_robe' }),
        applyAction(state, { kind: 'free_text', raw: 'use pill hp' }),
      ]
      expect(
        nonAllocate.some((r) => !errored(r)),
        `day ${String(state.day)} near ${state.player.locationId}: every non-allocate action refused`,
      ).toBe(true)
      state = applyAction(state, { kind: 'allocate_attribute', attribute: 'body' }).state
    }
  })

  it('never strands a gated player inside an encounter (round-2 invariant)', () => {
    // The round-1 loop retreated FIRST and only then re-injected the points, so
    // the one state where both gates stack — gated AND in-combat — was never
    // probed. Reachable for real: quit mid-fight, come back >=4h later, and
    // offline.ts adds breakthrough points straight onto the saved encounter.
    const fighting = startEncounter()
    const state: GameState = {
      ...fighting,
      inventory: {},
      player: { ...fighting.player, pendingAttributePoints: 2 },
    }
    expect(state.encounter).not.toBeNull()
    expect(allAttributesCapped(state)).toBe(false) // points are spendable, just not right now

    const attempts = [
      { kind: 'combat_retreat' },
      { kind: 'combat_defend' },
      { kind: 'combat_focus' },
      { kind: 'allocate_attribute', attribute: 'body' },
      { kind: 'equip_item', itemId: 'tattered_robe' },
      { kind: 'use_item', itemId: 'pill_hp' },
    ] as const
    const legal = attempts.filter((a) => !errored(applyAction(state, a)))
    expect(
      legal.length > 0,
      `gated + in-encounter + pill-free: all ${String(attempts.length)} attempts refused`,
    ).toBe(true)

    // Retreating must clear the fight AND leave the gate armed for afterwards.
    const out = applyAction(state, { kind: 'combat_retreat' })
    expect(errored(out)).toBe(false)
    expect(out.state.encounter).toBeNull()
    expect(errored(applyAction(out.state, { kind: 'rest' }), 'ATTRIBUTE_ALLOCATION_REQUIRED')).toBe(true)
  })

  it('healing and gear stay reachable while progression is deferred', () => {
    const hurt = gated('i34-escape')
    const state: GameState = { ...hurt, player: { ...hurt.player, hp: 40 } }
    const pill = applyAction(state, { kind: 'use_item', itemId: 'pill_hp' })
    expect(errored(pill)).toBe(false)
    expect(pill.state.player.hp).toBeGreaterThan(state.player.hp)
    expect(pill.state.player.pendingAttributePoints).toBe(2) // still gated afterwards
    const gear = applyAction(state, { kind: 'equip_item', itemId: 'tattered_robe' })
    expect(errored(gear)).toBe(false)
    // The free-text path re-checks the parsed kind, so typing works too.
    expect(errored(applyAction(state, { kind: 'free_text', raw: 'use pill hp' }))).toBe(false)
    // ...while the deferred progression still refuses, exactly as before.
    expect(errored(applyAction(state, { kind: 'rest' }), 'ATTRIBUTE_ALLOCATION_REQUIRED')).toBe(true)
    expect(errored(applyAction(state, { kind: 'move', direction: 'north' }), 'ATTRIBUTE_ALLOCATION_REQUIRED')).toBe(true)
    expect(errored(applyAction(state, { kind: 'train' }), 'ATTRIBUTE_ALLOCATION_REQUIRED')).toBe(true)
  })

  it('one allocation spends exactly one point and buys exactly one attribute', () => {
    const state = gated('i34-spend')
    const result = applyAction(state, { kind: 'allocate_attribute', attribute: 'mind' })
    expect(errored(result)).toBe(false)
    expect(result.state.player.pendingAttributePoints).toBe(1)
    expect(result.state.player.attrs.mind).toBe(state.player.attrs.mind + 1)
    expect(result.state.player.attrs.body).toBe(state.player.attrs.body)
    expect(result.events).toContainEqual({ type: 'ATTRIBUTE_ALLOCATED', attribute: 'mind', value: state.player.attrs.mind + 1, pointsRemaining: 1 })
    // The last point opens the run back up.
    const last = applyAction(result.state, { kind: 'allocate_attribute', attribute: 'mind' })
    expect(last.state.player.pendingAttributePoints).toBe(0)
    expect(errored(applyAction(last.state, { kind: 'rest' }))).toBe(false)
    expect(applyAction(last.state, { kind: 'allocate_attribute', attribute: 'mind' }).events).toContainEqual({ type: 'ERROR', code: 'NO_ATTRIBUTE_POINTS' })
  })

  it('drops points that no attribute can absorb (all four at cap)', () => {
    const maxed: GameState = {
      ...gated('i34-capped'),
      player: {
        ...gated('i34-capped').player,
        attrs: { body: ATTRIBUTE_MAX, mind: ATTRIBUTE_MAX, charm: ATTRIBUTE_MAX, luck: ATTRIBUTE_MAX },
        pendingAttributePoints: 3,
      },
    }
    // Nothing can absorb them, so the gate has let go before the action runs.
    const alloc = applyAction(maxed, { kind: 'allocate_attribute', attribute: 'body' })
    expect(errored(alloc, 'NO_ATTRIBUTE_POINTS')).toBe(true)
    expect(alloc.state.player.pendingAttributePoints).toBe(0)
    // So the gate has to let go of them instead of stranding the run.
    const rested = applyAction(maxed, { kind: 'rest' })
    expect(errored(rested)).toBe(false)
    expect(rested.state.player.pendingAttributePoints).toBe(0)
    // Round 2: the release is narrated, not silent — the banner vanishing with
    // no chronicle line read as a bug to playtesters.
    expect(rested.events).toContainEqual(
      expect.objectContaining({
        type: 'WARNING',
        messageEn: expect.stringContaining('3 allocation points'),
      }),
    )
    // Points earned later on a capped body are cleared on the way in, too.
    const reloaded: GameState = { ...rested.state, player: { ...rested.state.player, pendingAttributePoints: 1 } }
    const trained = applyAction(reloaded, { kind: 'train' })
    expect(trained.state.player.pendingAttributePoints).toBe(0)
    // English agreement — "1 allocation point", never "1 allocation points".
    const line = trained.events.find((e) => e.type === 'WARNING')
    if (line?.type !== 'WARNING') throw new Error('expected a WARNING for the discarded point')
    expect(line.messageEn).toContain('1 allocation point dissolved')
    expect(line.messageEn).not.toContain('points dissolved')
  })

  it('stays pure and deterministic — the gate never touches the caller state', () => {
    const state = gated('i34-pure')
    const snapshot = JSON.stringify(state)
    const once = applyAction(state, { kind: 'use_item', itemId: 'pill_hp' })
    const twice = applyAction(state, { kind: 'use_item', itemId: 'pill_hp' })
    expect(JSON.stringify(state)).toBe(snapshot)
    expect(JSON.stringify(twice.state)).toBe(JSON.stringify(once.state))
    expect(JSON.stringify(twice.events)).toBe(JSON.stringify(once.events))
  })

  it('renders the allocation control in the banner, outside the inert HUD column', () => {
    const onAction = vi.fn()
    const { container } = render(
      <GameScreen chronicle={[]} game={gated('i34-dom')} locale="vi" onAction={onAction} onLocaleChange={() => undefined} storyOpen />,
    )
    const main = container.querySelector('main') as HTMLElement
    const banner = main.querySelector<HTMLElement>('[data-testid="attribute-banner"]')
    expect(banner).not.toBeNull()
    // A direct child of <main>: not in a scroll container, not a closable tab.
    expect(banner?.parentElement).toBe(main)
    expect(banner?.closest('[inert]')).toBeNull()
    for (const attr of ['body', 'mind', 'charm', 'luck']) {
      expect(banner?.querySelector(`[data-testid="attribute-banner-${attr}"]`), `missing ${attr}`).not.toBeNull()
    }
    fireEvent.click(banner?.querySelector('[data-testid="attribute-banner-body"]') as HTMLButtonElement)
    expect(onAction).toHaveBeenCalledWith({ kind: 'allocate_attribute', attribute: 'body' })
    // Visible keyboard/SR escape route to the full panel, which exists as an
    // anchor target; deliberately NOT class="skip-link" (only two of those).
    const link = banner?.querySelector('a.attribute-banner-link') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('#attribute-allocation')
    expect(document.getElementById('attribute-allocation')).not.toBeNull()
    expect(container.querySelectorAll('a.skip-link')).toHaveLength(2)
  })

  // Round 5 (reviewer MEDIUM): the engine refuses allocate_attribute mid-
  // encounter, so a banner offering +1 there was a clickable lie. Retreat
  // remains reachable (combat_retreat is legal in-combat), so hiding the whole
  // banner strands nothing — the gate cannot softlock again.
  it('hides the banner while an encounter is open (no clickable lie)', () => {
    const fighting: GameState = {
      ...startEncounter(),
      player: { ...startEncounter().player, pendingAttributePoints: 2 },
    }
    expect(fighting.encounter).not.toBeNull()
    const { container, rerender } = render(
      <GameScreen chronicle={[]} game={fighting} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />,
    )
    expect(container.querySelector('[data-testid="attribute-banner"]')).toBeNull()
    // Out of combat it comes right back — the gate still has its escape hatch.
    const free = applyAction(fighting, { kind: 'combat_retreat' }).state
    expect(free.encounter).toBeNull()
    rerender(
      <GameScreen chronicle={[]} game={free} locale="vi" onAction={() => undefined} onLocaleChange={() => undefined} />,
    )
    expect(container.querySelector('[data-testid="attribute-banner"]')).not.toBeNull()
  })
})
