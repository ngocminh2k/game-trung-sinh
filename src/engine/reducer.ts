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
  BASIC_STRIKE_QI_COST,
  DEADLINE_DAYS,
  HIGH_DANGER_LEVEL,
  ITEM_TALISMAN,
  LOCATION_CAVE,
  LOCATION_MARKET,
  LOCATION_SECT,
  LOTTERY_COST,
  MAX_HP,
  MAX_QI,
  REST_HEAL_HP,
  RETREAT_HP_COST,
  RETREAT_PROGRESS_COST,
  STORAGE_CAPACITY,
  TRAIN_HP_COST,
  TRAIN_QI_COST,
  hashSeed,
  newGame,
  techniqueGuard,
  techniqueQiCost,
} from './constants'
import { parseFreeText } from './corrections'
import { isEquippedItem, sanitizeRpgState } from './rpg-state'
import { LOW_HP_WARNING, damageRoll, dangerWarning } from './danger'
import { evaluateEndingId } from './endings'
import { checkLottery, drawEventFor, rollLottery } from './lottery'
import { checkMoveFrom } from './map'
import { currentBeat } from './beats'
import { applyProgress, trainProgressGain } from './stats'
import { canAcceptQuest, canCompleteQuest, tickQuestSteps } from './quests'
import { applyStoryEffects, applyStoryRouteArrival, dialogueForNpc, findStoryChoice, currentStoryScene, resolveStoryEnding, storyRouteEncounter } from './story'
import { applyRomanceChoice, findRomanceChoice, hasOtherCommitment } from './romance'
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

// Phase 2 (design review 2026-08): time is a resource. Every "outing" action
// costs a day; only rest has its own accounting. Turn-level combat choices
// (strike/defend/retreat/consume mid-fight) are exempt — an encounter is one
// day-trip whose price is paid at start_encounter.
function spendDay(state: GameState, events: GameEvent[]): GameState {
  const day = state.day + 1
  events.push({ type: 'DAY_PASSED', day })
  return { ...state, day }
}

// Phase 2: the story talks about "the twelfth night"; now the calendar enforces
// it. Entering Hồi II starts a visible countdown (flags.night_deadline).
// Overshooting marks flags.night_forgotten — a content consequence that opens
// branches, never a game over.
function applyNightDeadline(state: GameState, out: GameEvent[]): GameState {
  if (state.flags['night_deadline'] === undefined && currentBeat(state).chapter >= 2) {
    out.push({
      type: 'WARNING',
      level: 1,
      locationId: state.player.locationId,
      messageVi: `Đêm thứ mười hai đã được định: còn ${DEADLINE_DAYS} ngày, làng chỉ nhớ được đến đó.`,
      messageEn: `The twelfth night is set: ${DEADLINE_DAYS} days remain — that is how long the village remembers.`,
    })
    return { ...state, flags: { ...state.flags, night_deadline: state.day + DEADLINE_DAYS } }
  }
  return state
}

// Reaching Hồi III (the sealed gate, the herb debt, or the first hunt) resolves
// the clock: the village remembers. Cleared in time is recorded as a survived
// stake; overshooting is handled by the expiry pass below.
function applyNightDeadlineResolution(state: GameState, out: GameEvent[]): GameState {
  const deadline = state.flags['night_deadline']
  if (typeof deadline !== 'number' || state.flags['night_deadline_cleared'] !== undefined) return state
  if (currentBeat(state).chapter < 3) return state
  const cleared = state.day <= deadline
  if (cleared) {
    out.push({
      type: 'WARNING',
      level: 0,
      locationId: state.player.locationId,
      messageVi: 'Ngươi về kịp trước đêm thứ mười hai — làng vẫn còn nhớ tên ngươi.',
      messageEn: 'You made it back before the twelfth night — the village still remembers your name.',
    })
  }
  return { ...state, flags: { ...state.flags, night_deadline_cleared: cleared } }
}

function applyNightDeadlineExpiry(state: GameState, out: GameEvent[]): GameState {
  const deadline = state.flags['night_deadline']
  if (typeof deadline === 'number' && state.day > deadline && state.flags['night_forgotten'] !== true) {
    out.push({
      type: 'WARNING',
      level: 2,
      locationId: state.player.locationId,
      messageVi: 'Đêm thứ mười hai đã qua — làng quên một người. Con đường của ngươi vẫn còn, nhưng không còn ai đợi ở nhà.',
      messageEn: 'The twelfth night has passed — the village forgot a name. Your road remains, but no one waits at home.',
    })
    // Phase 4 (design review 2026-08): WHO the village forgets depends on the
    // player's Hồi I choice — the failure is content, not a blank penalty.
    const forgottenName = forgottenNameFor(state)
    return { ...state, flags: { ...state.flags, night_forgotten: true, night_forgotten_name: forgottenName } }
  }
  return state
}

// Hồi I choices decide the face of the loss: betraying Meihua's trust makes her
// the one erased; selling the pin to Bao puts the debt on him; learning the
// name from Ngo costs Ngo his place in the village's memory.
function forgottenNameFor(state: GameState): string {
  if (state.flags['story_meihua_betrayed'] === true) return 'meihua'
  if (state.flags['story_bao_paid'] === true || state.flags['story_bao_has_map'] === true) return 'bao'
  if (state.flags['story_name_known'] === true) return 'ngo'
  return 'village'
}

function finalize(state: GameState, events: GameEvent[]): TransitionResult {
  let s = state
  const out = [...events]
  // W7 (Quest Engine): tick multi-step quest progress after every action.
  s = tickQuestSteps(s)
  const achieved = newlyQualifiedAchievements(s)
  if (achieved.length > 0) {
    s = { ...s, achievements: [...s.achievements, ...achieved] }
    for (const id of achieved) out.push({ type: 'ACHIEVEMENT_UNLOCKED', achievementId: id })
  }
  s = applyNightDeadline(s, out)
  s = applyNightDeadlineResolution(s, out)
  s = applyNightDeadlineExpiry(s, out)
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
    action.kind !== 'combat_retreat' &&
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
    case 'turn_in_quest':
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
    case 'combat_retreat':
      return doCombatRetreat(state)
    case 'resolve_route_event':
      return doResolveRouteEvent(state, action.approach)
    case 'story_choice':
      return doStoryChoice(state, action.choiceId)
    case 'advance_romance':
      return doAdvanceRomance(state, action.trackId, action.choiceId)
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
  const events: GameEvent[] = []
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
  events.push({
    type: 'MOVED',
    from: state.player.locationId,
    to: s.player.locationId,
  })
  if (cell.node !== undefined) {
    events.push({
      type: 'NODE_REACHED',
      nodeId: cell.node.id,
      nameVi: cell.node.nameVi,
      nameEn: cell.node.nameEn,
      kind: cell.node.kind,
    })
    const arrived = applyStoryRouteArrival(s, cell.node.id)
    s = { ...arrived, flags: { ...arrived.flags, [`reached_${cell.node.id}`]: true } }
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
  const events: GameEvent[] = []
  state = spendDay(state, events)
  const [hpLossVariance, rngAfter] = nextInt(state.rng, 0, 2)
  const gain = trainProgressGain(state)
  let hp = state.player.hp - TRAIN_HP_COST - hpLossVariance
  const qi = state.player.qi - TRAIN_QI_COST
  const prog = applyProgress({ ...state, player: { ...state.player, progress: state.player.progress } }, gain)
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
  const events: GameEvent[] = []
  state = spendDay(state, events)
  const [qty, nextRng] = nextInt(state.rng, 1, 2)
  // Phase 3 (design review 2026-08): aggressive footwork has two faces — the
  // same techniques that hit harder drain qi while gathering. Clamped at 0 so
  // gathering never kills; the drain is a pace tax, not a death sentence.
  const qiDrain = Math.min(state.player.qi, techniqueGatherDrain(state))
  const s: GameState = {
    ...state,
    rng: nextRng,
    player: qiDrain > 0 ? { ...state.player, qi: state.player.qi - qiDrain } : state.player,
    inventory: bump(state.inventory, 'spirit_herb', qty),
    flags: { ...state.flags, gatherCount: flagNum(state.flags, 'gatherCount') + qty },
  }
  return {
    ok: true,
    state: s,
    events: [...events, { type: 'GATHERED', itemId: 'spirit_herb', qty, qiDrain }],
  }
}

function doRefine(state: GameState, recipeId: string): R {
  const recipe = getRecipe(recipeId)
  if (recipe === undefined) return err('ITEM_UNAVAILABLE')
  if (state.player.locationId !== recipe.locationId) return err('NOT_AT_LOCATION')
  if (Object.entries(recipe.ingredients).some(([itemId, qty]) => countOf(state.inventory, itemId) < qty)) {
    return err('NO_ITEM')
  }
  const events: GameEvent[] = []
  state = spendDay(state, events)

  let inventory = { ...state.inventory }
  for (const [itemId, qty] of Object.entries(recipe.ingredients)) inventory = bump(inventory, itemId, -qty)
  inventory = bump(inventory, recipe.output.itemId, recipe.output.qty)
  return {
    ok: true,
    state: { ...state, inventory, flags: { ...state.flags, refineCount: flagNum(state.flags, 'refineCount') + 1 } },
    events: [...events, { type: 'REFINED', recipeId, itemId: recipe.output.itemId, qty: recipe.output.qty }],
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
  const events: GameEvent[] = []
  state = spendDay(state, events)
  const s: GameState = {
    ...state,
    player: { ...state.player, gold: state.player.gold - totalCost },
    inventory: bump(state.inventory, itemId, qty),
    flags: { ...state.flags, buyCount: flagNum(state.flags, 'buyCount') + qty },
  }
  return {
    ok: true,
    state: s,
    events: [...events, { type: 'BOUGHT', itemId, qty, goldPaid: totalCost }],
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
  // Phase 3 (design review 2026-08): scholarly techniques earn more progress
  // but haggle badly; Bao's favour (Hồi I choice `sell_pin`) pays it back.
  const sellPenalty = techniqueSellPenalty(state)
  const baoFavour = state.flags['story_bao_paid'] === true ? 2 : 0
  const totalGain = Math.max(0, price * qty - Math.max(0, sellPenalty - baoFavour))
  const events: GameEvent[] = []
  state = spendDay(state, events)
  const s: GameState = {
    ...state,
    player: { ...state.player, gold: state.player.gold + totalGain },
    inventory: bump(state.inventory, itemId, -qty),
    flags: { ...state.flags, sellCount: flagNum(state.flags, 'sellCount') + qty },
  }
  return {
    ok: true,
    state: s,
    events: [...events, { type: 'SOLD', itemId, qty, goldGain: totalGain }],
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
  // Out of combat, consuming an item is a day's outing; mid-fight it is just
  // a turn of the encounter loop (the trip's day was paid at start_encounter).
  const events: GameEvent[] = []
  if (state.encounter === null) state = spendDay(state, events)
  const s: GameState = {
    ...state,
    player: {
      ...state.player,
      hp: clamp(state.player.hp + hpDelta, 0, MAX_HP),
      qi: clamp(state.player.qi + qiDelta, 0, MAX_QI),
    },
    inventory: bump(state.inventory, itemId, -qty),
  }
  events.push({ type: 'ITEM_USED', itemId, hpDelta, qiDelta })
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
  const events: GameEvent[] = []
  state = spendDay(state, events)
  return {
    ok: true,
    state: {
      ...state,
      encounter: { enemyId: enemy.id, hp: enemy.maxHp, maxHp: enemy.maxHp, guard: 0 },
    },
    events: [...events, { type: 'ENCOUNTER_STARTED', enemyId: enemy.id }],
  }
}

// The encounter decision layer (design review 2026-08, Phase 1): every swing
// carries an explicit qi price, and the choice is risk allocation. A basic
// strike (no technique) is the cheap default; a named technique hits harder
// and adds guard that softens the enemy's reply, scaling with power × level.
function doCombatAttack(state: GameState, techniqueId?: string): R {
  if (state.encounter === null) return err('NOT_AT_LOCATION')
  const enemy = getEnemy(state.encounter.enemyId)
  if (enemy === undefined) return err('ITEM_UNAVAILABLE')
  let technique: ReturnType<typeof getTechnique>
  let level = 0
  if (techniqueId !== undefined) {
    technique = getTechnique(techniqueId)
    level = state.techniques[techniqueId] ?? 0
    if (technique === undefined || level <= 0) return err('ITEM_UNAVAILABLE')
  }
  const qiCost = technique === undefined ? BASIC_STRIKE_QI_COST : techniqueQiCost(technique.power, level)
  if (state.player.qi < qiCost) return err('INSUFFICIENT_QI')
  const guard = technique === undefined ? 0 : techniqueGuard(technique.power, level)
  const powerTerm = technique === undefined ? 0 : technique.power * level
  const [variance, rng] = nextInt(state.rng, 0, 2)
  const amount = Math.max(1, 5 + state.player.attrs.body + state.player.stage * 2 + powerTerm + equippedAttackBonus(state) + talentAttackBonus(state) + variance)
  const hp = Math.max(0, state.encounter.hp - amount)
  const s: GameState = {
    ...state,
    rng,
    player: { ...state.player, qi: state.player.qi - qiCost },
    encounter: { ...state.encounter, hp, guard },
  }
  const events: GameEvent[] = [
    { type: 'QI_SPENT', amount: qiCost },
    { type: 'COMBAT_HIT', actor: 'player', amount, enemyId: enemy.id },
  ]
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

// Retreating always works — it is the pressure valve that keeps the encounter
// loop softlock-free when qi and consumables run dry. It is never free: it
// costs HP (clamped so it can never kill) and sacrifices gathered progress,
// so walking away is a real trade-off rather than a free retry button.
function doCombatRetreat(state: GameState): R {
  if (state.encounter === null) return err('NOT_AT_LOCATION')
  const enemy = getEnemy(state.encounter.enemyId)
  if (enemy === undefined) return err('ITEM_UNAVAILABLE')
  const hpCost = Math.min(RETREAT_HP_COST, Math.max(0, state.player.hp - 1))
  const progressCost = Math.min(RETREAT_PROGRESS_COST, state.player.progress)
  const s: GameState = {
    ...state,
    encounter: null,
    player: {
      ...state.player,
      hp: state.player.hp - hpCost,
      progress: state.player.progress - progressCost,
    },
    flags: { ...state.flags, [`retreated_${enemy.id}`]: true },
  }
  return {
    ok: true,
    state: s,
    events: [{ type: 'COMBAT_RETREATED', enemyId: enemy.id, hpCost, progressCost }],
  }
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

// Phase 3 (design review 2026-08): technique trade-offs. A technique only
// taxes the player while it is actually known (level > 0).
function techniqueGatherDrain(state: GameState): number {
  return Object.entries(state.techniques).reduce(
    (sum, [id, level]) => sum + (level > 0 ? getTechnique(id)?.gatherQiDrain ?? 0 : 0),
    0,
  )
}

function techniqueSellPenalty(state: GameState): number {
  return Object.entries(state.techniques).reduce(
    (sum, [id, level]) => sum + (level > 0 ? getTechnique(id)?.sellPenalty ?? 0 : 0),
    0,
  )
}

function doStore(state: GameState, itemId: string, qty: number): R {
  if (state.player.locationId !== LOCATION_SECT) return err('NOT_AT_LOCATION')
  if (!Number.isInteger(qty) || qty <= 0) return err('INVALID_QTY')
  if (isEquippedItem(state, itemId)) return err('ITEM_UNAVAILABLE')
  if (countOf(state.inventory, itemId) < qty) return err('NO_ITEM')
  if (storageUnitsUsed(state) + qty > STORAGE_CAPACITY) return err('STORAGE_FULL')
  const events: GameEvent[] = []
  state = spendDay(state, events)
  const s: GameState = {
    ...state,
    inventory: bump(state.inventory, itemId, -qty),
    storage: bump(state.storage, itemId, qty),
  }
  return { ok: true, state: s, events: [...events, { type: 'STORED', itemId, qty }] }
}

function doWithdraw(state: GameState, itemId: string, qty: number): R {
  if (state.player.locationId !== LOCATION_SECT) return err('NOT_AT_LOCATION')
  if (!Number.isInteger(qty) || qty <= 0) return err('INVALID_QTY')
  if (countOf(state.storage, itemId) < qty) return err('STORAGE_EMPTY')
  const events: GameEvent[] = []
  state = spendDay(state, events)
  const s: GameState = {
    ...state,
    storage: bump(state.storage, itemId, -qty),
    inventory: bump(state.inventory, itemId, qty),
  }
  return { ok: true, state: s, events: [...events, { type: 'WITHDRAWN', itemId, qty }] }
}

function doDraw(state: GameState): R {
  const check = checkLottery(state, LOCATION_MARKET)
  if (!check.ok) return err(check.code)
  const events: GameEvent[] = []
  state = spendDay(state, events)
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
  events.push(drawEventFor(outcome))
  return { ok: true, state: s, events }
}

function doTalk(state: GameState, npcId: string): R {
  const npc = getNpc(npcId)
  if (npc === undefined) return err('NPC_UNKNOWN')
  if (state.player.locationId !== npc.locationId) return err('NPC_NOT_HERE')
  const affKey = `aff_${npcId}`
  const talkKey = `talk_${npcId}`
  const before = flagNum(state.flags, affKey)
  const s: GameState = {
    ...state,
    flags: {
      ...state.flags,
      talkCount: flagNum(state.flags, 'talkCount') + 1,
      lastTalkNpc: npcId,
      lastTalkRepeated: state.flags.lastTalkNpc === npcId,
      [affKey]: before + 1,
      [talkKey]: flagNum(state.flags, talkKey) + 1,
    },
  }
  const events: GameEvent[] = []
  // Affinity milestones surface as their own event so the UI can mark the
  // moment a relationship deepens, not just the words spoken.
  for (const level of [3, 6, 9]) {
    if (before < level && before + 1 >= level) events.push({ type: 'AFFINITY', npcId, level })
  }
  const line = dialogueForNpc(s, npcId)
  return { ok: true, state: s, events: [...events, { type: 'TALKED', npcId, lineVi: line.vi, lineEn: line.en }] }
}

function doResolveRouteEvent(state: GameState, approach: 'present' | 'withhold'): R {
  const encounter = storyRouteEncounter(state)
  const choice = encounter?.choices.find((entry) => entry.approach === approach)
  if (encounter === undefined || choice === undefined) return err('STORY_CHOICE_UNAVAILABLE')
  const events: GameEvent[] = []
  state = spendDay(state, events)
  const delta = choice.playerDelta
  const progressDelta = delta.progress ?? 0
  const qiDelta = delta.qi ?? 0
  const goldDelta = delta.gold ?? 0
  return {
    ok: true,
    state: {
      ...state,
      inventory: bump(state.inventory, `evidence_route_${encounter.route}`, 1),
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
    events: [...events, {
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
  const events: GameEvent[] = []
  state = spendDay(state, events)
  let s = applyStoryEffects(state, choice)
  if (choice.final === true) {
    s = { ...s, flags: { ...s.flags, story_ending: resolveStoryEnding(s, choiceId) } }
  }
  return {
    ok: true,
    state: s,
    events: [...events, { type: 'STORY_CHOICE', sceneId: scene.id, choiceId, nextSceneId: choice.nextSceneId }],
  }
}

function doAdvanceRomance(state: GameState, npcId: string, choiceId: string): R {
  const found = findRomanceChoice(state, npcId, choiceId)
  if (found === undefined) return err('STORY_CHOICE_UNAVAILABLE')
  if (found.choice.effect.flag?.endsWith('_commitment') === true && hasOtherCommitment(state, npcId)) {
    return err('STORY_CHOICE_UNAVAILABLE')
  }
  return {
    ok: true,
    state: applyRomanceChoice(state, npcId, found.node, found.choice),
    events: [{
      type: 'ROMANCE_NODE',
      npcId,
      nodeId: found.node.id,
      choiceId,
      titleVi: found.node.titleVi,
      titleEn: found.node.titleEn,
    }],
  }
}

function doAcceptQuest(state: GameState, questId: string): R {
  if (getQuest(questId) === undefined) return err('QUEST_UNKNOWN')
  const check = canAcceptQuest(state, questId)
  if (!check.ok) return err(check.code)
  const def = getQuest(questId)!
  // World quest: record the start day so we can expire after deadlineDays.
  const flags = { ...state.flags }
  if (def.deadlineDays !== undefined && def.deadlineDays > 0) {
    flags[`quest_${questId}_started_day`] = state.day
    flags[`quest_${questId}_expires_day`] = state.day + def.deadlineDays
  }
  const s: GameState = {
    ...state,
    flags,
    quests: { ...state.quests, [questId]: { status: 'active', step: 0 } },
  }
  return { ok: true, state: s, events: [{ type: 'QUEST_ACCEPTED', questId }] }
}

function doCompleteQuest(state: GameState, questId: string): R {
  const def = getQuest(questId)
  if (def === undefined) return err('QUEST_UNKNOWN')
  const check = canCompleteQuest(state, questId)
  if (!check.ok) return err(check.code)
  // For multi-step quests, consume the items required by the FINAL step
  // (the turn-in step) before rewarding.
  let inventory = { ...state.inventory }
  const stepIdx = state.quests[questId]?.step ?? 0
  const step = def.steps[stepIdx]
  if (step?.completeItems !== undefined) {
    for (const [itemId, qty] of Object.entries(step.completeItems)) {
      inventory = bump(inventory, itemId, -qty)
    }
  }
  // Legacy compatibility: drain the top-level requiredItems (flat quests).
  for (const [itemId, qty] of Object.entries(def.requiredItems)) {
    inventory = bump(inventory, itemId, -qty)
  }
  for (const [itemId, qty] of Object.entries(def.rewardItems)) {
    inventory = bump(inventory, itemId, qty)
  }
  const flags = { ...state.flags, [`quest_${questId}_done`]: true }
  if (def.storySceneNextId !== undefined) flags.story_scene = def.storySceneNextId
  // World completion is an inspectable regional outcome; callers can map this
  // flag to danger/content without mutating the location definition.
  if (def.deadlineDays !== undefined) flags[`world_${questId}_cleared`] = true
  const s: GameState = {
    ...state,
    quests: { ...state.quests, [questId]: { status: 'completed', step: stepIdx } },
    flags,
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
