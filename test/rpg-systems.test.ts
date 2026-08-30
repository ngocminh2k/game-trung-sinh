import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CodexPanel } from '../src/ui/CodexPanel'
import { ASSET_PACK_MANIFEST } from '../src/ui/assetPacks'
import {
  ENEMIES,
  EQUIPMENT,
  TALENTS,
  TECHNIQUES,
  applyAction,
  currentBeat,
  newGame,
  parseFreeText,
  validateGameState,
} from '../src/engine'
import type { GameState } from '../src/engine'

const PRE_RPG_V1_SAVE = {
  version: 1,
  seed: 'before-rpg',
  rng: 424242,
  day: 4,
  player: {
    hp: 81,
    qi: 43,
    gold: 77,
    attrs: { body: 3, mind: 4, charm: 3, luck: 2 },
    stage: 0,
    progress: 6,
    posX: 3,
    posY: 3,
    locationId: 'village',
    alive: true,
  },
  spiritRoot: { kind: 'defective' as const, elementVi: 'Mộc hỗn tạp', elementEn: 'Muddled Wood', efficiency: 0.5 },
  inventory: { spirit_herb: 1, pill_hp: 1 },
  storage: {},
  flags: {},
  quests: {},
  achievements: [],
  lastLotteryDay: null,
  corrections: 0,
  terminal: false,
  endingId: null,
}

function at(state: GameState, locationId: string): GameState {
  return { ...state, player: { ...state.player, locationId } }
}

describe('deterministic RPG systems', () => {
  it('ships a valid starter build and migrates a true pre-RPG v1 save without free equipment', () => {
    const fresh = newGame('rpg-starter')
    expect(fresh.talents).toContain('tenacious_root')
    expect(fresh.techniques.basic_staff_form).toBe(1)
    expect(fresh.equipment.weapon).toBe('wooden_staff')

    const restored = validateGameState(PRE_RPG_V1_SAVE)
    expect(restored.talents).toEqual([])
    expect(restored.techniques).toEqual({ basic_staff_form: 1 })
    expect(restored.equipment).toEqual({ weapon: null, robe: null, accessory: null })
    expect(restored.inventory.wooden_staff ?? 0).toBe(0)
    expect(restored.encounter).toBeNull()
  })

  it('resets stale encounter save data and never leaves runtime state combat-locked', () => {
    const stale = {
      ...PRE_RPG_V1_SAVE,
      encounter: { enemyId: 'deleted_enemy', hp: 1, maxHp: 1, guard: 0 },
    }
    expect(validateGameState(stale).encounter).toBeNull()

    const wrongLocation = {
      ...PRE_RPG_V1_SAVE,
      encounter: { enemyId: 'mist_boar', hp: 10, maxHp: 32, guard: 0 },
    }
    expect(validateGameState(wrongLocation).encounter).toBeNull()

    const unsafeRuntime = {
      ...at(newGame('unsafe-runtime'), 'village'),
      encounter: { enemyId: 'deleted_enemy', hp: 1, maxHp: 1, guard: 0 },
    }
    const recovered = applyAction(unsafeRuntime, { kind: 'rest' })
    expect(recovered.events.some((event) => event.type === 'RESTED')).toBe(true)
    expect(recovered.state.encounter).toBeNull()
  })

  it('has bilingual data for every talent, technique, equipment piece, and enemy', () => {
    for (const def of [...TALENTS, ...TECHNIQUES, ...EQUIPMENT, ...ENEMIES]) {
      expect(def.nameVi.length).toBeGreaterThan(0)
      expect(def.nameEn.length).toBeGreaterThan(0)
      expect(def.descVi.length).toBeGreaterThan(0)
      expect(def.descEn.length).toBeGreaterThan(0)
    }
  })

  it('learns a technique from a scroll, selects one stage talent, and equips owned gear', () => {
    let state = newGame('rpg-build')
    state = {
      ...state,
      player: { ...state.player, stage: 1 },
      inventory: { ...state.inventory, old_manual: 1, jade_charm: 1 },
    }
    state = applyAction(state, { kind: 'learn_technique', techniqueId: 'crooked_circulation' }).state
    expect(state.techniques.crooked_circulation).toBe(1)
    expect(state.inventory.old_manual ?? 0).toBe(0)

    state = applyAction(state, { kind: 'choose_talent', talentId: 'iron_bones' }).state
    expect(state.talents).toContain('iron_bones')

    state = applyAction(state, { kind: 'equip_item', itemId: 'jade_charm' }).state
    expect(state.equipment.accessory).toBe('jade_charm')

    state = {
      ...state,
      player: { ...state.player, stage: 2 },
      inventory: { ...state.inventory, rift_step_scroll: 1 },
    }
    state = applyAction(state, { kind: 'learn_technique', techniqueId: 'rift_step' }).state
    expect(state.techniques.rift_step).toBe(1)
    expect(state.inventory.rift_step_scroll ?? 0).toBe(0)
    expect(TECHNIQUES.every((technique) => technique.maxLevel === 1)).toBe(true)
  })

  it('fires the build-gate beat only once Crooked Circulation is learned', () => {
    // Before: a full market run still shows no technique beat.
    const untouched = at(newGame('build-gate-prior'), 'market')
    expect(currentBeat(untouched).id).not.toBe('b_crooked_deal')
    expect(currentBeat(untouched).textEn).not.toContain('Crooked Circulation')

    // Learn the flagship trade-off technique from its source manual.
    let state = newGame('build-gate')
    state = { ...state, player: { ...state.player, stage: 1 }, inventory: { ...state.inventory, old_manual: 1 } }
    state = applyAction(state, { kind: 'learn_technique', techniqueId: 'crooked_circulation' }).state
    expect(state.techniques.crooked_circulation).toBe(1)

    // The beat is deterministic and bilingual, and deepens story progression.
    const beat = currentBeat(state)
    expect(beat.id).toBe('b_crooked_deal')
    expect(beat.predicate).toBe('knowsCrookedCirculation')
    expect(beat.textVi).toContain('Chu Thiên Cong Queo')
    expect(beat.textEn).toContain('Crooked Circulation')
    expect(beat.chapter).toBe(4)
    expect(beat.suggested.some((action) => action.kind === 'talk' && action.npcId === 'n_merchant_bao')).toBe(true)
  })

  it('supports an earned multi-tier build while keeping market progression gated by realm', () => {
    let state = at(newGame('tiered-build'), 'market')
    const lockedPurchase = applyAction(state, { kind: 'buy', itemId: 'ironwood_saber' })
    expect(lockedPurchase.events).toEqual([{ type: 'ERROR', code: 'ITEM_UNAVAILABLE' }])
    expect(lockedPurchase.state.inventory.ironwood_saber ?? 0).toBe(0)
    const lockedEquip = applyAction(
      { ...state, inventory: { ...state.inventory, ironwood_saber: 1 } },
      { kind: 'equip_item', itemId: 'ironwood_saber' },
    )
    expect(lockedEquip.events).toEqual([{ type: 'ERROR', code: 'ITEM_UNAVAILABLE' }])

    state = {
      ...state,
      player: { ...state.player, stage: 1, gold: 400 },
    }
    state = applyAction(state, { kind: 'buy', itemId: 'ironwood_saber' }).state
    state = applyAction(state, { kind: 'buy', itemId: 'herbal_breath_manual' }).state
    state = applyAction(state, { kind: 'equip_item', itemId: 'ironwood_saber' }).state
    state = applyAction(state, { kind: 'learn_technique', techniqueId: 'herbal_breath' }).state
    state = applyAction(state, { kind: 'choose_talent', talentId: 'wild_herbalist' }).state
    expect(state.equipment.weapon).toBe('ironwood_saber')
    expect(state.techniques.herbal_breath).toBe(1)
    expect(state.talents).toContain('wild_herbalist')

    state = { ...state, player: { ...state.player, stage: 2 } }
    state = applyAction(state, { kind: 'choose_talent', talentId: 'mist_listener' }).state
    expect(state.talents).toContain('mist_listener')
    const secondTierOne = applyAction(state, { kind: 'choose_talent', talentId: 'iron_bones' })
    expect(secondTierOne.events).toEqual([{ type: 'ERROR', code: 'ITEM_UNAVAILABLE' }])
  })

  it('applies crooked circulation’s training benefit and sale cost, then exposes both to the player', () => {
    const base = newGame('technique-trade-off')
    const crooked = {
      ...base,
      techniques: { ...base.techniques, crooked_circulation: 1 },
    }
    expect(applyAction(base, { kind: 'train' }).events).toContainEqual({ type: 'TRAINED', gain: 2, stage: 0 })
    expect(applyAction(crooked, { kind: 'train' }).events).toContainEqual({ type: 'TRAINED', gain: 3, stage: 0 })

    const sale = applyAction(
      at({ ...crooked, inventory: { ...crooked.inventory, spirit_herb: 1 } }, 'market'),
      { kind: 'sell', itemId: 'spirit_herb' },
    )
    expect(sale.events).toContainEqual({ type: 'SOLD', itemId: 'spirit_herb', qty: 1, goldGain: 10 })

    const technique = TECHNIQUES.find(({ id }) => id === 'crooked_circulation')
    if (technique === undefined) throw new Error('Crooked Circulation must remain defined.')
    const markup = renderToStaticMarkup(createElement(CodexPanel, {
      entries: [{
        id: technique.id,
        kind: 'technique',
        nameVi: technique.nameVi,
        nameEn: technique.nameEn,
        descriptionVi: technique.descVi,
        descriptionEn: technique.descEn,
        assetPackId: 'talents-and-effects',
        assetStatus: 'ready',
      }],
      locale: 'en',
      packs: ASSET_PACK_MANIFEST,
    }))
    expect(markup).toContain('Cultivation moves one beat faster.')
    expect(markup).toContain('every sale earns 2 gold less.')

    const oneSided = renderToStaticMarkup(createElement(CodexPanel, {
      entries: [{
        id: 'basic_staff_form',
        kind: 'technique',
        nameVi: 'Mộc Trượng Thức',
        nameEn: 'Wooden Staff Form',
        descriptionVi: 'Ba thế đơn giản.',
        descriptionEn: 'Three plain forms.',
        assetPackId: 'talents-and-effects',
        assetStatus: 'ready',
      }],
      locale: 'en',
      packs: ASSET_PACK_MANIFEST,
    }))
    expect(oneSided).toContain('Reliable, and it asks for nothing.')
  })

  it('pairs every technique cost string with its enforced numeric value and its other locale', () => {
    for (const technique of TECHNIQUES) {
      const numeric = technique.sellPenalty ?? technique.gatherQiDrain
      if (technique.costVi === undefined || technique.costEn === undefined) {
        expect(numeric, `${technique.id} cost copy without an enforced value`).toBeUndefined()
        expect(technique.costVi, technique.id).toBeUndefined()
        expect(technique.costEn, technique.id).toBeUndefined()
        continue
      }
      expect(numeric, `${technique.id} enforced value without cost copy`).toBeDefined()
      expect(technique.costVi).toContain(String(numeric))
      expect(technique.costEn).toContain(String(numeric))
      if (technique.benefitVi !== undefined) expect(technique.benefitEn, technique.id).toBeDefined()
    }
  })

  it('runs a deterministic combat loop with consumable turn cost, rewards, and victory cleanup', () => {
    let a = at(newGame('rpg-combat'), 'misty_forest')
    let b = at(newGame('rpg-combat'), 'misty_forest')
    const script = [{ kind: 'start_encounter' as const }, { kind: 'use_item' as const, itemId: 'pill_hp' }]
    const eventsA = [] as string[]
    const eventsB = [] as string[]
    for (const action of script) {
      const ra = applyAction(a, action)
      const rb = applyAction(b, action)
      a = ra.state
      b = rb.state
      eventsA.push(...ra.events.map((event) => event.type))
      eventsB.push(...rb.events.map((event) => event.type))
      if (a.terminal) break
    }
    const goldBefore = a.player.gold
    const herbBefore = a.inventory.spirit_herb ?? 0
    let guard = 0
    while (a.encounter !== null && guard < 10) {
      const ra = applyAction(a, { kind: 'combat_attack', techniqueId: 'basic_staff_form' })
      const rb = applyAction(b, { kind: 'combat_attack', techniqueId: 'basic_staff_form' })
      a = ra.state
      b = rb.state
      eventsA.push(...ra.events.map((event) => event.type))
      eventsB.push(...rb.events.map((event) => event.type))
      guard += 1
    }
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
    expect(eventsA).toEqual(eventsB)
    expect(eventsA).toContain('ENCOUNTER_STARTED')
    expect(eventsA).toContain('COMBAT_HIT')
    expect(eventsA).toContain('COMBAT_WON')
    expect(a.encounter).toBeNull()
    expect(a.flags.defeated_mist_boar).toBe(true)
    expect(a.player.gold).toBeGreaterThan(goldBefore)
    expect(a.inventory.spirit_herb ?? 0).toBeGreaterThan(herbBefore)
    expect(a.inventory.pill_hp ?? 0).toBe(0)
  })

  it('locks an encounter to combat turns and one consumable per turn', () => {
    let state = at(newGame('rpg-locked-loop'), 'misty_forest')
    state = applyAction(state, { kind: 'start_encounter' }).state
    const snapshot = JSON.stringify(state)
    const blocked = applyAction(state, { kind: 'rest' })
    expect(blocked.events).toEqual([{ type: 'ERROR', code: 'ITEM_UNAVAILABLE' }])
    expect(JSON.stringify(blocked.state)).toBe(snapshot)

    const bundled = {
      ...state,
      inventory: { ...state.inventory, pill_hp: 2 },
    }
    const tooMany = applyAction(bundled, { kind: 'use_item', itemId: 'pill_hp', qty: 2 })
    expect(tooMany.events).toEqual([{ type: 'ERROR', code: 'INVALID_QTY' }])
    expect(JSON.stringify(tooMany.state)).toBe(JSON.stringify(bundled))
  })

  it('rejects selling or storing worn gear so equipment bonuses cannot outlive ownership', () => {
    const starter = newGame('equipment-invariant')
    const sell = applyAction(at(starter, 'market'), { kind: 'sell', itemId: 'wooden_staff' })
    expect(sell.events).toEqual([{ type: 'ERROR', code: 'ITEM_UNAVAILABLE' }])
    expect(sell.state.equipment.weapon).toBe('wooden_staff')
    expect(sell.state.inventory.wooden_staff).toBe(1)

    const store = applyAction(at(starter, 'sect'), { kind: 'store', itemId: 'tattered_robe', qty: 1 })
    expect(store.events).toEqual([{ type: 'ERROR', code: 'ITEM_UNAVAILABLE' }])
    expect(store.state.equipment.robe).toBe('tattered_robe')
    expect(store.state.inventory.tattered_robe).toBe(1)
  })

  it('free-text nonsense in combat never acts for the player, and losing combat stays terminal', () => {
    let state = at(newGame('combat-convergence'), 'misty_forest')
    state = applyAction(state, { kind: 'start_encounter' }).state
    const beforeHp = state.encounter?.hp
    state = applyAction(state, { kind: 'free_text', raw: 'nonsense' }).state
    state = applyAction(state, { kind: 'free_text', raw: 'nonsense' }).state
    const ignored = applyAction(state, { kind: 'free_text', raw: 'nonsense' })
    expect(ignored.events.some((event) => event.type === 'CORRECTION_REJECTED')).toBe(true)
    expect(ignored.state.encounter?.hp).toBe(beforeHp)

    let doomed = at(newGame('combat-death'), 'cursed_rift')
    doomed = { ...doomed, player: { ...doomed.player, hp: 1 } }
    doomed = applyAction(doomed, { kind: 'start_encounter' }).state
    const death = applyAction(doomed, { kind: 'combat_defend' })
    expect(death.events.some((event) => event.type === 'DEATH')).toBe(true)
    expect(death.state.terminal).toBe(true)
    expect(death.state.endingId).toBe('tragic_death')
  })

  it('accepts the RPG loop from bilingual free text as well as UI actions', () => {
    expect(parseFreeText('engage enemy')).toEqual({ ok: true, action: { kind: 'start_encounter' } })
    expect(parseFreeText('tấn công')).toEqual({
      ok: true,
      // No technique named — the cheap basic strike (Phase 1, design review 2026-08).
      action: { kind: 'combat_attack', techniqueId: undefined },
    })
    expect(parseFreeText('phòng thủ')).toEqual({ ok: true, action: { kind: 'combat_defend' } })
    expect(parseFreeText('equip jade charm')).toEqual({
      ok: true,
      action: { kind: 'equip_item', itemId: 'jade_charm' },
    })
  })
})
