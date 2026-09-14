// Issue #39 (UI half): the ♥ number is real text in the people list, and the
// chat modal carries a gift tray built from genuinely giftable inventory.
// jsdom is only for JSX compilation — assertions read the static markup, the
// house pattern (see game-screen.test.tsx).
// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import type { GameState } from '../src/engine/types'
import { LeftRailTabContent } from '../src/ui/LeftRailTabContent'
import { NpcChatModal, giftableItemsFor } from '../src/ui/NpcChatModal'

const noop = (): undefined => undefined

function villageWith(items: Record<string, number>): GameState {
  const s = newGame('i39-ui')
  return { ...s, inventory: { ...s.inventory, ...items } }
}

describe('issue 39 UI: the rapport number is visible', () => {
  it('people tab renders a numeric heart for each villager', () => {
    //aff_ starts at 0, a talk-counted elder at 2 — the list must show both.
    const game: GameState = {
      ...villageWith({}),
      flags: { ...newGame('i39-ui').flags, aff_n_elder_meihua: 2 },
    }
    const markup = renderToStaticMarkup(
      <LeftRailTabContent tab="people" game={game} locale="vi" onAction={noop} />,
    )
    expect(markup).toContain('♥ 2') // the elder carries a real number
    expect(markup).toContain('♥ 0') // a fresh villager shows zero, not a dash
    expect(markup).toContain('Hảo cảm')
  })

  it('the chat modal shows rapport and a gift tray in both locales', () => {
    const game = villageWith({ cloudwalk_manual: 1, evidence_route_mercy: 1 })
    const vi = renderToStaticMarkup(
      <NpcChatModal show npcId="n_elder_meihua" game={game} locale="vi" onClose={noop} onAction={noop} />,
    )
    expect(vi).toContain('data-testid="gift-tray"')
    expect(vi).toContain('data-testid="gift-select"')
    expect(vi).toContain('data-testid="chat-rapport"')
    expect(vi).toContain('♥ 0')
    expect(vi).toContain('Vân Du Giản') // the giftable manual is an option
    expect(vi).not.toContain('Cuộn điểm danh bảy nhà') // unsellable evidence is not
    const en = renderToStaticMarkup(
      <NpcChatModal show npcId="n_elder_meihua" game={game} locale="en" onClose={noop} onAction={noop} />,
    )
    expect(en).toContain('Cloudwalk')
    expect(en).toContain('Present gift')
    expect(en).not.toContain('Roll call of seven homes')
  })
})

describe('issue 39 UI: giftableItemsFor is the single source of truth', () => {
  it('keeps owned sellable items, drops unsellable and empty slots', () => {
    const entries = giftableItemsFor(villageWith({ cloudwalk_manual: 1, evidence_route_mercy: 3, pill_qi: 0 }))
    const ids = entries.map((e) => e.itemId)
    expect(ids).toContain('cloudwalk_manual')
    expect(ids).toContain('pill_hp') // starter inventory counts too
    expect(ids).not.toContain('evidence_route_mercy') // sellPrice null
    expect(ids).not.toContain('pill_qi') // qty 0
  })
})
