// @vitest-environment jsdom
// T7 (gộp #8, #11): the village map promised a chat pin for every local NPC,
// but `NPCS.filter(...).slice(0, 4)` (ProtoShell.tsx:487) silently dropped the
// last three — Tiểu Bảo, Nông phu Tư, Cụ ông Thìn had no way to start a
// conversation from the map at all, while the four survivors' aria-labels
// still read "Nói chuyện với X". npcs.ts declares 7 NPCs with
// locationId 'village', so the map must render one pin per local NPC.
//
// jsdom applies no author stylesheets, so the layout half is pinned as the
// inline percentage contract: a pin must stay inside its 0–100% box — which is
// exactly what the old `18 + i * 18` step broke at the 7th NPC (126%).
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NPCS } from '../src/content'
import { ProtoShell } from '../src/ui/ProtoShell'
import { newGame } from './test-utils'

const villageNpcs = NPCS.filter((n) => n.locationId === 'village')

function renderAtVillage(): ReturnType<typeof render> {
  const game = newGame('npc-map-pins')
  return render(
    <ProtoShell
      game={{ ...game, player: { ...game.player, locationId: 'village' } }}
      chronicle={[]}
      chronicleKinds={[]}
      locale="vi"
      onAction={vi.fn()}
      onLocaleChange={() => undefined}
    />,
  )
}

function chatPins(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('.proto-map button.pin[data-npc]'))
}

afterEach(cleanup)

describe('T7: every local NPC gets a map chat pin', () => {
  it('the village fixture is larger than the old cap of 4', () => {
    expect(villageNpcs.length).toBeGreaterThan(4)
  })

  it('renders one pin per village NPC, in npcs.ts order', () => {
    const { container } = renderAtVillage()
    expect(chatPins(container).map((p) => p.getAttribute('data-npc'))).toEqual(
      villageNpcs.map((n) => n.id),
    )
  })

  it('names each pin after its own NPC', () => {
    const { container } = renderAtVillage()
    for (const npc of villageNpcs) {
      const pin = container.querySelector(`.proto-map button.pin[data-npc="${npc.id}"]`)
      expect(pin, `${npc.id} must have a chat pin`).not.toBeNull()
      expect(pin!.getAttribute('aria-label')).toBe(`Nói chuyện với ${npc.nameVi}`)
    }
  })

  it('keeps every pin inside the map box', () => {
    const { container } = renderAtVillage()
    const pins = chatPins(container)
    expect(pins.length).toBeGreaterThan(0)
    for (const pin of pins) {
      const id = pin.getAttribute('data-npc') ?? ''
      const left = Number.parseFloat(pin.style.left)
      const top = Number.parseFloat(pin.style.top)
      expect(left, `${id} left`).toBeGreaterThanOrEqual(0)
      expect(left, `${id} left`).toBeLessThanOrEqual(100)
      expect(top, `${id} top`).toBeGreaterThanOrEqual(0)
      expect(top, `${id} top`).toBeLessThanOrEqual(100)
    }
  })
})
