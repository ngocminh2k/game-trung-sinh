import { describe, expect, it } from 'vitest'
import {
  ACHIEVEMENTS,
  BEATS,
  CHAPTERS,
  ENDINGS,
  ITEMS,
  LOCATIONS,
  MAP_HEIGHT,
  MAP_WIDTH,
  NPCS,
  QUESTS,
  SHOP_STOCK,
  STORY_SCENES,
  npcsAt,
  validateAllContent,
} from '../src/content'
import { newGame, validateGameState } from '../src/engine'

describe('content integrity', () => {
  it('has exactly 60 NPCs with unique ids and bilingual fields', () => {
    expect(NPCS).toHaveLength(60)
    const ids = new Set(NPCS.map((n) => n.id))
    expect(ids.size).toBe(60)
    for (const npc of NPCS) {
      expect(npc.nameVi.length).toBeGreaterThan(0)
      expect(npc.nameEn.length).toBeGreaterThan(0)
      expect(npc.greetVi.length).toBeGreaterThan(0)
      expect(npc.greetEn.length).toBeGreaterThan(0)
      expect(npc.roleVi.length).toBeGreaterThan(0)
      expect(npc.roleEn.length).toBeGreaterThan(0)
    }
  })

  it('every NPC stands on a known location', () => {
    const locationIds = new Set(LOCATIONS.map((l) => l.id))
    for (const npc of NPCS) {
      expect(locationIds.has(npc.locationId)).toBe(true)
    }
  })

  it('npcsAt filters correctly', () => {
    const village = npcsAt('village')
    expect(village.length).toBeGreaterThanOrEqual(1)
    for (const npc of village) expect(npc.locationId).toBe('village')
  })

  it('has eight chapters with sequential bilingual names', () => {
    expect(CHAPTERS).toHaveLength(8)
    expect(CHAPTERS.map((c) => c.index)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    for (const c of CHAPTERS) {
      expect(c.nameVi.length).toBeGreaterThan(0)
      expect(c.nameEn.length).toBeGreaterThan(0)
      expect(c.nameVi).not.toBe(c.nameEn)
    }
  })

  it('has narrative endings plus a separate death failure', () => {
    // P1-1 system divergence adds 10 system_<id>_end endings on top of the
    // 11 narrative endings + tragic_death, so the total is 22.
    expect(ENDINGS).toHaveLength(22)
    expect(new Set(ENDINGS.map((e) => e.id)).size).toBe(22)
    expect(ENDINGS.filter((e) => e.id === 'tragic_death')).toHaveLength(1)
    expect(ENDINGS.filter((e) => e.id !== 'tragic_death').length).toBeGreaterThanOrEqual(11)
    for (const e of ENDINGS) {
      expect(e.epitaphVi.length).toBeGreaterThan(0)
      expect(e.epitaphEn.length).toBeGreaterThan(0)
    }
  })

  it('shop stock matches buyable items and prices are fixed', () => {
    const expected = ITEMS.filter((i) => i.buyPrice !== null).map((i) => i.id)
    expect(SHOP_STOCK.sort()).toEqual(expected.sort())
    for (const item of ITEMS) {
      if (item.sellPrice !== null) {
        expect(item.sellPrice).toBeLessThanOrEqual(item.buyPrice ?? item.sellPrice + 1000)
      }
    }
    const herb = ITEMS.find((i) => i.id === 'spirit_herb')
    expect(herb?.sellPrice).toBe(12)
    const pill = ITEMS.find((i) => i.id === 'pill_hp')
    expect(pill?.buyPrice).toBe(35)
  })

  it('quest givers exist among NPCs (System quests are giver-less by design)', () => {
    for (const quest of QUESTS) {
      if (quest.giverNpcId === null) continue
      expect(NPCS.some((n) => n.id === quest.giverNpcId)).toBe(true)
    }
  })

  it('achievement ids are unique', () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length)
  })

  it('zod validation passes across all content tables', () => {
    const report = validateAllContent()
    expect(report.errors).toEqual([])
    expect(report.ok).toBe(true)
  })
})

describe('beats', () => {
  it('has route-exclusive story scenes with three consequential choices each', () => {
    // 15 authored scenes + 1 System-layer boot scene (scene_system_selection) = 16
    expect(STORY_SCENES.length).toBeGreaterThanOrEqual(15)
    for (const scene of STORY_SCENES) {
      expect(scene.choices.length).toBeGreaterThanOrEqual(3)
      for (const choice of scene.choices) {
        expect(choice.labelVi.length).toBeGreaterThan(0)
        expect(choice.consequenceVi.length).toBeGreaterThan(0)
      }
    }
  })
  it('every story beat suggests exactly three actions', () => {
    for (const beat of BEATS) {
      expect(beat.suggested).toHaveLength(3)
    }
  })

  it('beat action parameters reference real content', () => {
    const itemIds = new Set(ITEMS.map((i) => i.id))
    const npcIds = new Set(NPCS.map((n) => n.id))
    const questIds = new Set(QUESTS.map((q) => q.id))
    for (const beat of BEATS) {
      for (const action of beat.suggested) {
        if (action.kind === 'buy' || action.kind === 'sell' || action.kind === 'use_item') {
          expect(itemIds.has(action.itemId)).toBe(true)
        }
        if (action.kind === 'talk') {
          expect(npcIds.has(action.npcId)).toBe(true)
        }
        if (action.kind === 'accept_quest' || action.kind === 'complete_quest') {
          expect(questIds.has(action.questId)).toBe(true)
        }
      }
    }
  })

  it('beats cover all five chapters', () => {
    const chapters = new Set(BEATS.map((b) => b.chapter))
    expect(chapters).toEqual(new Set([1, 2, 3, 4, 5]))
  })
})

describe('state schema', () => {
  it('fresh game state passes the zod GameState schema', () => {
    const state = validateGameState(JSON.parse(JSON.stringify(newGame('schema-check'))))
    expect(state.version).toBe(1)
    expect(state.player.alive).toBe(true)
  })

  it('player position bounds derive from the shared map dimensions', () => {
    const base = validateGameState(JSON.parse(JSON.stringify(newGame('schema-bounds'))))
    const outOfBounds = {
      ...base,
      player: { ...base.player, posX: MAP_WIDTH, posY: MAP_HEIGHT },
    }
    expect(() => validateGameState(outOfBounds)).toThrow()
    // Schema allows any passable cell; entry is always walkable.
    const entry = base.player
    const parsed = validateGameState({
      ...base,
      player: { ...entry, posX: entry.posX, posY: entry.posY },
    })
    expect(parsed.player.posX).toBe(entry.posX)
    expect(parsed.player.posY).toBe(entry.posY)
  })
})
