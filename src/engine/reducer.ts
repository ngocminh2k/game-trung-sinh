import {
  enemyAt,
  entryPositionFor,
  getEnemy,
  getEquipmentByItem,
  getItem,
  getNpc,
  getRecipe,
  getQuest,
  getTalent,
  getTechnique,
  locationDanger,
} from '../content'
import { newlyQualifiedAchievements } from './achievements'
import {
  HIGH_DANGER_LEVEL,
  ITEM_TALISMAN,
  LOCATION_CAVE,
  LOCATION_MARKET,
  LOCATION_SECT,
  LOTTERY_COST,
  MAX_HP,
  MAX_QI,
  REST_HEAL_HP,
  STORAGE_CAPACITY,
  TRAIN_HP_COST,
  TRAIN_QI_COST,
  hashSeed,
  newGame,
} from './constants'
import { parseFreeText } from './corrections'
import { isEquippedItem, sanitizeRpgState } from './rpg-state'
import { LOW_HP_WARNING, damageRoll, dangerWarning } from './danger'
import { evaluateEndingId } from './endings'
import { checkLottery, drawEventFor, rollLottery } from './lottery'
import { checkMoveFrom } from './map'
import { applyProgress, trainProgressGain } from './stats'
import { canAcceptQuest, canCompleteQuest } from './quests'
import { applyStoryEffects, applyStoryRouteArrival, dialogueForNpc, findStoryChoice, currentStoryScene, resolveStoryEnding, storyRouteEncounter } from './story'
import { storageUnitsUsed } from './storage'
import { nextInt } from './rng'
import { bump, clamp, countOf, flagNum, totalUnits } from './utils'
import type {
  Action,
  ConcreteAction,
  Direction,
  ErrorCode,
  GameEvent,
  GameState,
  TransitionResult,
} from './types'

type ROk = { ok: true; state: GameState; events: GameEvent[] }
type RErr = { ok: false; code: ErrorCode }
type R = ROk | RErr

function err(code: ErrorCode): RErr {
  return { ok: false, code }
}

export function applyAction(state: GameState, action: Action): TransitionResult {
  if (action.kind === 'restart') {
    const fresh = newGame(action.seed)
    return finalize(fresh, [{ type: 'GAME_STARTED', seed: action.seed }])
  }
  const safeState = sanitizeRpgState(state)
  if (safeState.terminal) return { state: safeState, events: [{ type: 'ERROR', code: 'TERMINAL' }] }
  if (action.kind === 'free_text') return applyFreeText(safeState, action.raw)
  const result = execAction(safeState, action)
  if (!result.ok) return { state: safeState, events: [{ type: 'ERROR', code: result.code }] }
  return finalize(result.state, result.events)
}

function applyFreeText(state: GameState, raw: string): TransitionResult {
  const parsed = parseFreeText(raw)
  if (!parsed.ok) {
    // The world ignores unrecognized intent — it never acts on the player's
    // behalf. We only count the attempt so the narrator can vary its reply and
    // so a later valid command still clears the streak. No movement, no shop,
    // no auto-resolve: the player keeps full control of every step.
    const corrections = state.corrections + 1
    return {
      state: { ...state, corrections },
      events: [{ type: 'CORRECTION_REJECTED', count: corrections }],
    }
  }
  const staged: GameState = { ...state, corrections: 0 }
  const result = execAction(staged, parsed.action)
  if (!result.ok) return { state: staged, events: [{ type: 'ERROR', code: result.code }] }
  return finalize(result.state, result.events)
}

function finalize(state: GameState, events: GameEvent[]): TransitionResult {
  let s = state
  const out = [...events]
  const achieved = newlyQualifiedAchievements(s)
  if (achieved.length > 0) {
    s = { ...s, achievements: [...s.achievements, ...achieved] }
    for (const id of achieved) out.push({ type: 'ACHIEVEMENT_UNLOCKED', achievementId: id })
  }
  const endingId = evaluateEndingId(s)
  if (endingId !== null && s.endingId !== endingId) {
    s = { ...s, endingId, terminal: true }
    out.push({ type: 'ENDING', endingId })
  }
  return { state: s, events: out }
}

function execAction(state: GameState, action: ConcreteAction): R {
  // An encounter is a closed deterministic turn loop. Preventing unrelated
  // actions here keeps the player from escaping damage by moving, resting, or
  // swapping gear mid-fight; consumables remain a deliberate one-turn choice.
  if (
    state.encounter !== null &&
    action.kind !== 'combat_attack' &&
    action.kind !== 'combat_defend' &&
    action.kind !== 'use_item'
  ) {
    return err('ITEM_UNAVAILABLE')
  }
  switch (action.kind) {
    case 'move':
      return doMove(state, action.direction)
    case 'rest':
      return doRest(state)
    case 'train':
      return doTrain(state)
    case 'gather':
      return doGather(state)
    case 'refine':
      return doRefine(state, action.recipeId)
    case 'buy':
      return doBuy(state, action.itemId, action.qty ?? 1)
    case 'sell':
      return doSell(state, action.itemId, action.qty ?? 1)
    case 'use_item':
      return doUseItem(state, action.itemId, action.qty ?? 1)
    case 'store':
      return doStore(state, action.itemId, action.qty)
    case 'withdraw':
      return doWithdraw(state, action.itemId, action.qty)
    case 'draw_lottery':
      return doDraw(state)
    case 'talk':
      return doTalk(state, action.npcId)
    case 'accept_quest':
      return doAcceptQuest(state, action.questId)
    case 'complete_quest':
      return doCompleteQuest(state, action.questId)
    case 'choose_talent':
      return doChooseTalent(state, action.talentId)
    case 'learn_technique':
      return doLearnTechnique(state, action.techniqueId)
    case 'equip_item':
      return doEquipItem(state, action.itemId)
    case 'start_encounter':
      return doStartEncounter(state)
    case 'combat_attack':
      return doCombatAttack(state, action.techniqueId)
    case 'combat_defend':
      return doCombatDefend(state)
    case 'resolve_route_event':
      return doResolveRouteEvent(state, action.approach)
    case 'story_choice':
      return doStoryChoice(state, action.choiceId)
    default: {
      const impossible: never = action
      void impossible
      return err('MOVE_BLOCKED')
    }
  }
}

function doMove(state: GameState, direction: Direction): R {
  const check = checkMoveFrom(state.player.locationId, state.player.posX, state.player.posY, direction)
  if (!check.ok || check.cell === undefined) return err('MOVE_BLOCKED')
  const cell = check.cell
  const targetLocId = check.destinationId
  const arrival = targetLocId === undefined ? undefined : entryPositionFor(targetLocId, state.player.locationId)
  let s: GameState = {
    ...state,
    flags: { ...state.flags, movedOnce: true },
    player: {
      ...state.player,
      posX: arrival?.x ?? cell.x,
      posY: arrival?.y ?? cell.y,
      locationId: targetLocId ?? state.player.locationId,
    },
  }
  const events: GameEvent[] = [
    { type: 'MOVED', from: state.player.locationId, to: s.player.locationId },
  ]
  if (cell.node !== undefined) {
    events.push({
      type: 'NODE_REACHED',
      nodeId: cell.node.id,
      nameVi: cell.node.nameVi,
      nameEn: cell.node.nameEn,
      kind: cell.node.kind,
    })
    s = applyStoryRouteArrival(s, cell.node.id)
  }
  const dangerLocationId = targetLocId ?? (cell.node?.kind === 'danger' ? state.player.locationId : undefined)
  if (dangerLocationId !== undefined) {
    if (dangerLocationId === LOCATION_CAVE) s = { ...s, flags: { ...s.flags, seenCave: true } }
    const warning = dangerWarning(dangerLocationId)
    const danger = locationDanger(dangerLocationId)
    if (warning !== null) {
      events.push({
        type: 'WARNING',
        level: warning.level,
        locationId: warning.locationId,
        messageVi: warning.messageVi,
        messageEn: warning.messageEn,
      })
    }
    if (danger > 0) {
      const highDanger = danger >= HIGH_DANGER_LEVEL
      if (highDanger && countOf(s.inventory, ITEM_TALISMAN) > 0) {
        s = {
          ...s,
          inventory: bump(s.inventory, ITEM_TALISMAN, -1),
          flags:
            dangerLocationId === LOCATION_CAVE
              ? { ...s.flags, visitedCaveWarded: true }
              : s.flags,
        }
        events.push({ type: 'WARD_USED', itemId: ITEM_TALISMAN })
      } else {
        const [damage, nextRng] = damageRoll(s.rng, danger)
        s = { ...s, rng: nextRng }
        const newHp = Math.max(0, s.player.hp - damage)
        s = { ...s, player: { ...s.player, hp: newHp } }
        events.push({ type: 'DAMAGED', amount: damage, source: dangerLocationId })
        if (newHp <= 0) {
          s = { ...s, player: { ...s.player, alive: false } }
          events.push({ type: 'DEATH', cause: `danger:${dangerLocationId}` })
          return { ok: true, state: s, events }
        }
        if (newHp <= 25) {
          events.push({
            type: 'WARNING',
            level: 0,
            locationId: dangerLocationId,
            messageVi: LOW_HP_WARNING.vi,
            messageEn: LOW_HP_WARNING.en,
          })
        }
      }
    }
  }
  return { ok: true, state: s, events }
}

function doRest(state: GameState): R {
  const hpHeal = Math.min(REST_HEAL_HP, MAX_HP - state.player.hp)
  const s: GameState = {
    ...state,
    day: state.day + 1,
    player: {
      ...state.player,
      hp: clamp(state.player.hp + REST_HEAL_HP, 0, MAX_HP),
      qi: MAX_QI,
    },
  }
  return {
    ok: true,
    state: s,
    events: [
      { type: 'RESTED', hpHeal },
      { type: 'DAY_PASSED', day: s.day },
    ],
  }
}

function doTrain(state: GameState): R {
  if (state.player.qi < TRAIN_QI_COST) return err('INSUFFICIENT_QI')
  const [hpLossVariance, rngAfter] = nextInt(state.rng, 0, 2)
  const gain = trainProgressGain(state)
  let hp = state.player.hp - TRAIN_HP_COST - hpLossVariance
  const qi = state.player.qi - TRAIN_QI_COST
  const prog = applyProgress({ ...state, player: { ...state.player, progress: state.player.progress } }, gain)
  const events: GameEvent[] = []
  if (hp <= 0) {
    hp = 0
    const dead: GameState = {
      ...state,
      rng: rngAfter,
      player: {
        ...state.player,
        hp: 0,
        qi: Math.max(0, qi),
        stage: prog.stage,
        progress: prog.progress,
        alive: false,
      },
    }
    events.push({ type: 'TRAINED', gain, stage: prog.stage })
    events.push({ type: 'DEATH', cause: 'qi_deviation' })
    return { ok: true, state: dead, events }
  }
  const s: GameState = {
    ...state,
    rng: rngAfter,
    player: { ...state.player, hp, qi, stage: prog.stage, progress: prog.progress },
  }
  events.push({ type: 'TRAINED', gain, stage: prog.stage })
  if (prog.stagesGained > 0) {
    events.push({
      type: 'WARNING',
      level: 0,
      locationId: s.player.locationId,
      messageVi: 'Cảnh giới mới — đan điền ấm ran, nhớ giữ đều nhịp thở.',
      messageEn: 'A new stage — your dantian hums; keep the breath steady.',
    })
  }
  return { ok: true, state: s, events }
}

function doGather(state: GameState): R {
  if (state.player.locationId !== 'herb_field') return err('NOT_AT_LOCATION')
  const [qty, nextRng] = nextInt(state.rng, 1, 2)
  const s: GameState = {
    ...state,
    rng: nextRng,
    inventory: bump(state.inventory, 'spirit_herb', qty),
    flags: { ...state.flags, gatherCount: flagNum(state.flags, 'gatherCount') + qty },
  }
  return { ok: true, state: s, events: [{ type: 'GATHERED', itemId: 'spirit_herb', qty }] }
}

function doRefine(state: GameState, recipeId: string): R {
  const recipe = getRecipe(recipeId)
  if (recipe === undefined) return err('ITEM_UNAVAILABLE')
  if (state.player.locationId !== recipe.locationId) return err('NOT_AT_LOCATION')
  if (Object.entries(recipe.ingredients).some(([itemId, qty]) => countOf(state.inventory, itemId) < qty)) {
    return err('NO_ITEM')
  }

  let inventory = { ...state.inventory }
  for (const [itemId, qty] of Object.entries(recipe.ingredients)) inventory = bump(inventory, itemId, -qty)
  inventory = bump(inventory, recipe.output.itemId, recipe.output.qty)
  return {
    ok: true,
    state: { ...state, inventory, flags: { ...state.flags, refineCount: flagNum(state.flags, 'refineCount') + 1 } },
    events: [{ type: 'REFINED', recipeId, itemId: recipe.output.itemId, qty: recipe.output.qty }],
  }
}

function doBuy(state: GameState, itemId: string, qty: number): R {
  if (state.player.locationId !== LOCATION_MARKET) return err('NOT_AT_LOCATION')
  if (!Number.isInteger(qty) || qty <= 0) return err('INVALID_QTY')
  const def = getItem(itemId)
  const price = def?.buyPrice ?? null
  if (price === null || state.player.stage < (def?.requiredStage ?? 0)) return err('ITEM_UNAVAILABLE')
  const totalCost = price * qty
  if (state.player.gold < totalCost) return err('INSUFFICIENT_GOLD')
  const s: GameState = {
    ...state,
    player: { ...state.player, gold: state.player.gold - totalCost },
    inventory: bump(state.inventory, itemId, qty),
    flags: { ...state.flags, buyCount: flagNum(state.flags, 'buyCount') + qty },
  }
  return {
    ok: true,
    state: s,
    events: [{ type: 'BOUGHT', itemId, qty, goldPaid: totalCost }],
  }
}

function doSell(state: GameState, itemId: string, qty: number): R {
  if (state.player.locationId !== LOCATION_MARKET) return err('NOT_AT_LOCATION')
  if (!Number.isInteger(qty) || qty <= 0) return err('INVALID_QTY')
  if (isEquippedItem(state, itemId)) return err('ITEM_UNAVAILABLE')
  const def = getItem(itemId)
  const price = def?.sellPrice ?? null
  if (price === null) return err('ITEM_UNAVAILABLE')
  if (countOf(state.inventory, itemId) < qty) return err('NO_ITEM')
  const totalGain = price * qty
  const s: GameState = {
    ...state,
    player: { ...state.player, gold: state.player.gold + totalGain },
    inventory: bump(state.inventory, itemId, -qty),
    flags: { ...state.flags, sellCount: flagNum(state.flags, 'sellCount') + qty },
  }
  return {
    ok: true,
    state: s,
    events: [{ type: 'SOLD', itemId, qty, goldGain: totalGain }],
  }
}

function doUseItem(state: GameState, itemId: string, qty: number): R {
  if (!Number.isInteger(qty) || qty <= 0) return err('INVALID_QTY')
  if (state.encounter !== null && qty !== 1) return err('INVALID_QTY')
  const def = getItem(itemId)
  if (def === undefined || !def.usable || def.effects === undefined) return err('ITEM_NOT_USABLE')
  if (countOf(state.inventory, itemId) < qty) return err('NO_ITEM')
  const hpPerUnit = clamp(def.effects.hp ?? 0, -MAX_HP, MAX_HP)
  const qiPerUnit = clamp(def.effects.qi ?? 0, -MAX_QI, MAX_QI)
  const hpDelta = hpPerUnit * qty
  const qiDelta = qiPerUnit * qty
  const s: GameState = {
    ...state,
    player: {
      ...state.player,
      hp: clamp(state.player.hp + hpDelta, 0, MAX_HP),
      qi: clamp(state.player.qi + qiDelta, 0, MAX_QI),
    },
    inventory: bump(state.inventory, itemId, -qty),
  }
  const events: GameEvent[] = [{ type: 'ITEM_USED', itemId, hpDelta, qiDelta }]
  return state.encounter === null ? { ok: true, state: s, events } : resolveEnemyTurn(s, events)
}

function doChooseTalent(state: GameState, talentId: string): R {
  const talent = getTalent(talentId)
  if (
    talent === undefined ||
    !talent.selectable ||
    state.talents.includes(talentId) ||
    state.player.stage < talent.requiredStage ||
    state.talents.some((id) => getTalent(id)?.selectable === true && getTalent(id)?.tier === talent.tier)
  ) {
    return err('ITEM_UNAVAILABLE')
  }
  return {
    ok: true,
    state: { ...state, talents: [...state.talents, talentId] },
    events: [{ type: 'TALENT_CHOSEN', talentId }],
  }
}

function doLearnTechnique(state: GameState, techniqueId: string): R {
  const technique = getTechnique(techniqueId)
  if (
    technique === undefined ||
    state.player.stage < technique.requiredStage ||
    technique.sourceItemId === undefined ||
    countOf(state.inventory, technique.sourceItemId) < 1
  ) {
    return err('ITEM_UNAVAILABLE')
  }
  const currentLevel = state.techniques[techniqueId] ?? 0
  if (currentLevel >= technique.maxLevel) return err('ITEM_UNAVAILABLE')
  const nextLevel = currentLevel + 1
  return {
    ok: true,
    state: {
      ...state,
      inventory: bump(state.inventory, technique.sourceItemId, -1),
      techniques: { ...state.techniques, [techniqueId]: nextLevel },
    },
    events: [{ type: 'TECHNIQUE_LEARNED', techniqueId, level: nextLevel }],
  }
}

function doEquipItem(state: GameState, itemId: string): R {
  const equipment = getEquipmentByItem(itemId)
  const item = getItem(itemId)
  if (
    equipment === undefined ||
    item === undefined ||
    state.player.stage < (item.requiredStage ?? 0) ||
    countOf(state.inventory, itemId) < 1
  ) return err('ITEM_UNAVAILABLE')
  const nextEquipment = { ...state.equipment, [equipment.slot]: itemId }
  const previouslyEquipped = state.equipment[equipment.slot]
  const qiIncrease = equipment.qiBonus - (previouslyEquipped === null ? 0 : getEquipmentByItem(previouslyEquipped)?.qiBonus ?? 0)
  return {
    ok: true,
    state: {
      ...state,
      equipment: nextEquipment,
      player: { ...state.player, qi: clamp(state.player.qi + qiIncrease, 0, MAX_QI) },
    },
    events: [{ type: 'EQUIPPED', itemId, slot: equipment.slot }],
  }
}

function doStartEncounter(state: GameState): R {
  if (state.encounter !== null) return err('ITEM_UNAVAILABLE')
  const enemy = enemyAt(state.player.locationId)
  if (enemy === undefined || state.flags[`defeated_${enemy.id}`] === true) return err('NOT_AT_LOCATION')
  return {
    ok: true,
    state: {
      ...state,
      encounter: { enemyId: enemy.id, hp: enemy.maxHp, maxHp: enemy.maxHp, guard: 0 },
    },
    events: [{ type: 'ENCOUNTER_STARTED', enemyId: enemy.id }],
  }
}

function doCombatAttack(state: GameState, techniqueId: string): R {
  if (state.encounter === null) return err('NOT_AT_LOCATION')
  const enemy = getEnemy(state.encounter.enemyId)
  const technique = getTechnique(techniqueId)
  const level = state.techniques[techniqueId] ?? 0
  if (enemy === undefined || technique === undefined || level <= 0) return err('ITEM_UNAVAILABLE')
  const [variance, rng] = nextInt(state.rng, 0, 2)
  const amount = Math.max(1, 5 + state.player.attrs.body + state.player.stage * 2 + technique.power * level + equippedAttackBonus(state) + talentAttackBonus(state) + variance)
  const hp = Math.max(0, state.encounter.hp - amount)
  const s: GameState = { ...state, rng, encounter: { ...state.encounter, hp, guard: 0 } }
  const events: GameEvent[] = [{ type: 'COMBAT_HIT', actor: 'player', amount, enemyId: enemy.id }]
  if (hp <= 0) {
    let inventory = { ...s.inventory }
    for (const [itemId, qty] of Object.entries(enemy.rewardItems)) inventory = bump(inventory, itemId, qty)
    return {
      ok: true,
      state: {
        ...s,
        encounter: null,
        inventory,
        player: { ...s.player, gold: s.player.gold + enemy.rewardGold },
        flags: { ...s.flags, [`defeated_${enemy.id}`]: true },
      },
      events: [...events, { type: 'COMBAT_WON', enemyId: enemy.id, rewardGold: enemy.rewardGold }],
    }
  }
  return resolveEnemyTurn(s, events)
}

function doCombatDefend(state: GameState): R {
  if (state.encounter === null) return err('NOT_AT_LOCATION')
  const guard = 4 + talentDefenseBonus(state)
  const s: GameState = { ...state, encounter: { ...state.encounter, guard } }
  return resolveEnemyTurn(s, [{ type: 'COMBAT_GUARDED', amount: guard }])
}

function resolveEnemyTurn(state: GameState, events: GameEvent[]): R {
  if (state.encounter === null) return { ok: true, state, events }
  const enemy = getEnemy(state.encounter.enemyId)
  if (enemy === undefined) return err('ITEM_UNAVAILABLE')
  const [variance, rng] = nextInt(state.rng, 0, 2)
  const amount = Math.max(1, enemy.attack + variance - equippedDefenseBonus(state) - talentDefenseBonus(state) - state.encounter.guard)
  const hp = Math.max(0, state.player.hp - amount)
  const s: GameState = {
    ...state,
    rng,
    player: { ...state.player, hp, alive: hp > 0 },
    encounter: { ...state.encounter, guard: 0 },
  }
  const out: GameEvent[] = [...events, { type: 'COMBAT_HIT', actor: 'enemy', amount, enemyId: enemy.id }]
  if (hp <= 0) out.push({ type: 'DEATH', cause: `combat:${enemy.id}` })
  return { ok: true, state: s, events: out }
}

function equippedAttackBonus(state: GameState): number {
  return Object.values(state.equipment).reduce((sum, itemId) => sum + (itemId === null ? 0 : getEquipmentByItem(itemId)?.attackBonus ?? 0), 0)
}

function equippedDefenseBonus(state: GameState): number {
  return Object.values(state.equipment).reduce((sum, itemId) => sum + (itemId === null ? 0 : getEquipmentByItem(itemId)?.defenseBonus ?? 0), 0)
}

function talentAttackBonus(state: GameState): number {
  return state.talents.reduce((sum, id) => sum + (getTalent(id)?.attackBonus ?? 0), 0)
}

function talentDefenseBonus(state: GameState): number {
  return state.talents.reduce((sum, id) => sum + (getTalent(id)?.defenseBonus ?? 0), 0)
}

function doStore(state: GameState, itemId: string, qty: number): R {
  if (state.player.locationId !== LOCATION_SECT) return err('NOT_AT_LOCATION')
  if (!Number.isInteger(qty) || qty <= 0) return err('INVALID_QTY')
  if (isEquippedItem(state, itemId)) return err('ITEM_UNAVAILABLE')
  if (countOf(state.inventory, itemId) < qty) return err('NO_ITEM')
  if (storageUnitsUsed(state) + qty > STORAGE_CAPACITY) return err('STORAGE_FULL')
  const s: GameState = {
    ...state,
    inventory: bump(state.inventory, itemId, -qty),
    storage: bump(state.storage, itemId, qty),
  }
  return { ok: true, state: s, events: [{ type: 'STORED', itemId, qty }] }
}

function doWithdraw(state: GameState, itemId: string, qty: number): R {
  if (state.player.locationId !== LOCATION_SECT) return err('NOT_AT_LOCATION')
  if (!Number.isInteger(qty) || qty <= 0) return err('INVALID_QTY')
  if (countOf(state.storage, itemId) < qty) return err('STORAGE_EMPTY')
  const s: GameState = {
    ...state,
    storage: bump(state.storage, itemId, -qty),
    inventory: bump(state.inventory, itemId, qty),
  }
  return { ok: true, state: s, events: [{ type: 'WITHDRAWN', itemId, qty }] }
}

function doDraw(state: GameState): R {
  const check = checkLottery(state, LOCATION_MARKET)
  if (!check.ok) return err(check.code)
  const outcome = rollLottery(state.rng)
  let s: GameState = {
    ...state,
    rng: outcome.rng,
    lastLotteryDay: state.day,
    player: { ...state.player, gold: state.player.gold - LOTTERY_COST + outcome.goldDelta },
  }
  if (outcome.tier === 'herb' && outcome.itemId !== undefined) {
    s = { ...s, inventory: bump(s.inventory, outcome.itemId, 1) }
  }
  if (outcome.tier === 'grand') {
    s = { ...s, flags: { ...s.flags, grandPrizeWon: true } }
  }
  return { ok: true, state: s, events: [drawEventFor(outcome)] }
}

function doTalk(state: GameState, npcId: string): R {
  const npc = getNpc(npcId)
  if (npc === undefined) return err('NPC_UNKNOWN')
  if (state.player.locationId !== npc.locationId) return err('NPC_NOT_HERE')
  const affKey = `aff_${npcId}`
  const s: GameState = {
    ...state,
    flags: {
      ...state.flags,
      talkCount: flagNum(state.flags, 'talkCount') + 1,
      [affKey]: flagNum(state.flags, affKey) + 1,
    },
  }
  const line = dialogueForNpc(s, npcId)
  return { ok: true, state: s, events: [{ type: 'TALKED', npcId, lineVi: line.vi, lineEn: line.en }] }
}

function doResolveRouteEvent(state: GameState, approach: 'present' | 'withhold'): R {
  const encounter = storyRouteEncounter(state)
  const choice = encounter?.choices.find((entry) => entry.approach === approach)
  if (encounter === undefined || choice === undefined) return err('STORY_CHOICE_UNAVAILABLE')
  const delta = choice.playerDelta
  const progressDelta = delta.progress ?? 0
  const qiDelta = delta.qi ?? 0
  const goldDelta = delta.gold ?? 0
  return {
    ok: true,
    state: {
      ...state,
      flags: {
        ...state.flags,
        story_route_arrived: false,
        story_route_ready: true,
        story_route_proof: encounter.route,
        [`story_proof_${approach}`]: true,
        [`story_${encounter.route}_encountered`]: true,
      },
      player: {
        ...state.player,
        progress: Math.max(0, state.player.progress + progressDelta),
        qi: clamp(state.player.qi + qiDelta, 0, MAX_QI),
        gold: Math.max(0, state.player.gold + goldDelta),
      },
    },
    events: [{
      type: 'ROUTE_EVENT_RESOLVED',
      route: encounter.route,
      approach,
      proofVi: encounter.proofVi,
      proofEn: encounter.proofEn,
      progressDelta,
      qiDelta,
      goldDelta,
    }],
  }
}

function doStoryChoice(state: GameState, choiceId: string): R {
  const scene = currentStoryScene(state)
  const choice = findStoryChoice(state, choiceId)
  if (choice === undefined) return err('STORY_CHOICE_UNAVAILABLE')
  let s = applyStoryEffects(state, choice)
  if (choice.final === true) {
    s = { ...s, flags: { ...s.flags, story_ending: resolveStoryEnding(s, choiceId) } }
  }
  return {
    ok: true,
    state: s,
    events: [{ type: 'STORY_CHOICE', sceneId: scene.id, choiceId, nextSceneId: choice.nextSceneId }],
  }
}

function doAcceptQuest(state: GameState, questId: string): R {
  if (getQuest(questId) === undefined) return err('QUEST_UNKNOWN')
  const check = canAcceptQuest(state, questId)
  if (!check.ok) return err(check.code)
  const s: GameState = {
    ...state,
    quests: { ...state.quests, [questId]: { status: 'active' } },
  }
  return { ok: true, state: s, events: [{ type: 'QUEST_ACCEPTED', questId }] }
}

function doCompleteQuest(state: GameState, questId: string): R {
  const def = getQuest(questId)
  if (def === undefined) return err('QUEST_UNKNOWN')
  const check = canCompleteQuest(state, questId)
  if (!check.ok) return err(check.code)
  let inventory = { ...state.inventory }
  for (const [itemId, qty] of Object.entries(def.requiredItems)) {
    inventory = bump(inventory, itemId, -qty)
  }
  for (const [itemId, qty] of Object.entries(def.rewardItems)) {
    inventory = bump(inventory, itemId, qty)
  }
  const s: GameState = {
    ...state,
    quests: { ...state.quests, [questId]: { status: 'completed' } },
    player: { ...state.player, gold: state.player.gold + def.rewardGold },
    inventory,
  }
  return {
    ok: true,
    state: s,
    events: [{ type: 'QUEST_COMPLETED', questId, rewardGold: def.rewardGold }],
  }
}

export function totalInventoryUnits(state: GameState): number {
  return totalUnits(state.inventory)
}

export function seedFingerprint(seed: string): number {
  return hashSeed(seed) % 9973
}
