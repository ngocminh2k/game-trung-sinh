import { getItem, getNpc, getQuest, locationDanger } from '../content'
import { newlyQualifiedAchievements } from './achievements'
import { currentBeat } from './beats'
import {
  CORRECTION_LIMIT,
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
import { LOW_HP_WARNING, damageRoll, dangerWarning } from './danger'
import { evaluateEndingId } from './endings'
import { checkLottery, drawEventFor, rollLottery } from './lottery'
import { checkMoveFrom } from './map'
import { applyProgress, trainProgressGain } from './stats'
import { canAcceptQuest, canCompleteQuest } from './quests'
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
  if (state.terminal) return { state, events: [{ type: 'ERROR', code: 'TERMINAL' }] }
  if (action.kind === 'free_text') return applyFreeText(state, action.raw)
  const result = execAction(state, action)
  if (!result.ok) return { state, events: [{ type: 'ERROR', code: result.code }] }
  return finalize(result.state, result.events)
}

const REST_ACTION: ConcreteAction = { kind: 'rest' }

function applyFreeText(state: GameState, raw: string): TransitionResult {
  const parsed = parseFreeText(raw)
  if (!parsed.ok) {
    const count = state.corrections + 1
    if (count >= CORRECTION_LIMIT) {
      const beat = currentBeat(state)
      const staged: GameState = {
        ...state,
        corrections: 0,
        convergenceCount: state.convergenceCount + 1,
      }
      const preEvents: GameEvent[] = [
        { type: 'CORRECTION_REJECTED', count },
      ]
      // Canonical fallback: try each lore-consistent suggestion against the
      // staged state; `rest` has no failure precondition, so one of them
      // always applies (no-softlock guarantee). Whichever applies, the result
      // flows through the normal finalize pipeline so achievements and
      // endings are evaluated on the very same transition.
      //
      // Ending guarantee: after a bounded number of fruitless convergences,
      // escalate from beat nudges to the canonical cultivation plan — train,
      // else rest. That plan is always executable (rest refills qi, heals,
      // and every train makes progress ≥ 1), so the seeded stream provably
      // reaches an ending (ascension, or death through qi deviation) instead
      // of idling forever.
      const CONVERGENCE_ESCALATION_BOUND = CORRECTION_LIMIT * 4
      const escalated = state.convergenceCount >= CONVERGENCE_ESCALATION_BOUND
      const candidates: ConcreteAction[] = escalated
        ? [
            { kind: 'train' },
            { kind: 'rest' },
          ]
        : beat.suggested
      let chosen: ConcreteAction | undefined
      let applied: { state: GameState; events: GameEvent[] } | undefined
      for (const sug of candidates) {
        const probe = execAction(staged, sug)
        if (probe.ok) {
          chosen = sug
          applied = probe
          break
        }
      }
      if (applied === undefined || chosen === undefined) {
        chosen = REST_ACTION
        const probe = execAction(staged, REST_ACTION)
        applied = probe.ok ? probe : { state: staged, events: [] }
      }
      return finalize(applied.state, [
        ...preEvents,
        { type: 'FORCED_CONVERGENCE', action: chosen },
        ...applied.events,
      ])
    }
    return {
      state: { ...state, corrections: count },
      events: [{ type: 'CORRECTION_REJECTED', count }],
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
  switch (action.kind) {
    case 'move':
      return doMove(state, action.direction)
    case 'rest':
      return doRest(state)
    case 'train':
      return doTrain(state)
    case 'gather':
      return doGather(state)
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
    default: {
      const impossible: never = action
      void impossible
      return err('MOVE_BLOCKED')
    }
  }
}

function doMove(state: GameState, direction: Direction): R {
  const check = checkMoveFrom(state.player.posX, state.player.posY, direction)
  if (!check.ok || check.cell === undefined) return err('MOVE_BLOCKED')
  const cell = check.cell
  let s: GameState = {
    ...state,
    flags: { ...state.flags, movedOnce: true },
    player: {
      ...state.player,
      posX: cell.x,
      posY: cell.y,
      locationId: cell.locationId ?? `wild_${cell.x}_${cell.y}`,
    },
  }
  const events: GameEvent[] = [
    { type: 'MOVED', from: state.player.locationId, to: s.player.locationId },
  ]
  const targetLocId = cell.locationId
  if (targetLocId !== undefined) {
    if (targetLocId === LOCATION_CAVE) s = { ...s, flags: { ...s.flags, seenCave: true } }
    const warning = dangerWarning(targetLocId)
    const danger = locationDanger(targetLocId)
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
            targetLocId === LOCATION_CAVE
              ? { ...s.flags, visitedCaveWarded: true }
              : s.flags,
        }
        events.push({ type: 'WARD_USED', itemId: ITEM_TALISMAN })
      } else {
        const [damage, nextRng] = damageRoll(s.rng, danger)
        s = { ...s, rng: nextRng }
        const newHp = Math.max(0, s.player.hp - damage)
        s = { ...s, player: { ...s.player, hp: newHp } }
        events.push({ type: 'DAMAGED', amount: damage, source: targetLocId })
        if (newHp <= 0) {
          s = { ...s, player: { ...s.player, alive: false } }
          events.push({ type: 'DEATH', cause: `danger:${targetLocId}` })
          return { ok: true, state: s, events }
        }
        if (newHp <= 25) {
          events.push({
            type: 'WARNING',
            level: 0,
            locationId: targetLocId,
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

function doBuy(state: GameState, itemId: string, qty: number): R {
  if (state.player.locationId !== LOCATION_MARKET) return err('NOT_AT_LOCATION')
  if (!Number.isInteger(qty) || qty <= 0) return err('INVALID_QTY')
  const def = getItem(itemId)
  const price = def?.buyPrice ?? null
  if (price === null) return err('ITEM_UNAVAILABLE')
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
  return { ok: true, state: s, events: [{ type: 'ITEM_USED', itemId, hpDelta, qiDelta }] }
}

function doStore(state: GameState, itemId: string, qty: number): R {
  if (state.player.locationId !== LOCATION_SECT) return err('NOT_AT_LOCATION')
  if (!Number.isInteger(qty) || qty <= 0) return err('INVALID_QTY')
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
  return { ok: true, state: s, events: [{ type: 'TALKED', npcId }] }
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
