import {
  ARENA_FLOOR_COUNT,
  arenaEnemyForFloor,
  BEASTS,
  coercionFor,
  enemyAt,
  entryPositionFor,
  getEnemy,
  getEquipmentByItem,
  getItem,
  getNpc,
  getRecipe,
  getQuest,
  getSkillNode,
  getTalent,
  getTechnique,
  locationDanger,
  newEncounter,
} from '../content'
import { weatherFor, WEATHER_EFFECTS } from './weather'
import { companionBuff } from './companion'
import { marketPriceFor } from './shopStock'
import { newlyQualifiedAchievements } from './achievements'
import {
  ATTRIBUTE_MAX,
  ATTRIBUTE_POINTS_PER_BREAKTHROUGH,
  BASIC_STRIKE_QI_COST,
  CULTIVATION_TAX,
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
  SKILL_POINTS_PER_BREAKTHROUGH,
  STORAGE_CAPACITY,
  TRAIN_HP_COST,
  TRAIN_QI_COST,
  damageMultiplier,
  hashSeed,
  newGame,
  techniqueGuard,
  techniqueQiCost,
} from './constants'
import {
  skillAttackBonus,
  skillCritBonus,
  skillDefenseBonus,
  skillGuardBonus,
  skillDodgeChance,
  skillOnHitHeal,
  skillOnKillHeal,
  skillUnlockGate,
} from './skills'
import { parseFreeText } from './corrections'
import { isEquippedItem, sanitizeRpgState } from './rpg-state'
import { LOW_HP_WARNING, damageRoll, dangerWarning } from './danger'
import { evaluateEndingId } from './endings'
import { checkLottery, drawEventFor, rollLottery } from './lottery'
import { checkMoveFrom } from './map'
import { currentBeat } from './beats'
import {
  applyProgress,
  attributeCombatBonus,
  charmPriceDiscount,
  luckGatherBonus,
  trainProgressGain,
} from './stats'
import { canAcceptQuest, canCompleteQuest, tickQuestSteps } from './quests'
import { queuePush } from './system'
import { applyStoryEffects, applyStoryRouteArrival, dialogueForNpc, findStoryChoice, currentStoryScene, resolveStoryEnding, storyRouteEncounter } from './story'
import { applyRomanceChoice, findRomanceChoice, hasOtherCommitment } from './romance'
import { storageUnitsUsed } from './storage'
import { nextInt } from './rng'
import { bump, clamp, countOf, flagNum, totalUnits } from './utils'
import { FLAG_AFF, FLAG_AFF_GATE, FLAG_ARENA_CLEARED, FLAG_ARENA_FLOOR, FLAG_COERCED, FLAG_COERCED_BACKOFF, FLAG_DEFEATED, FLAG_INFAMY, FLAG_KEYS, FLAG_REACHED, FLAG_RETREATED, FLAG_TALK, FLAG_TALK_WARN } from '../content/flag-keys'
import type {
  Action,
  ConcreteAction,
  Direction,
  AttributeName,
  ErrorCode,
  GameEvent,
  GameState,
  TransitionResult,
} from './types'

type ROk = { ok: true; state: GameState; events: GameEvent[] }
type RErr = { ok: false; code: ErrorCode }
type R = ROk | RErr

// Named handles for flag keys referenced as literals below; FLAG_KEYS stays the
// canonical list for refactors / exhaustiveness checks. Template helpers
// (FLAG_AFF, FLAG_DEFEATED, FLAG_RETREATED, FLAG_REACHED) live in flag-keys.ts.
const [
  FLAG_MOVED_ONCE,
  ,
  FLAG_NIGHT_DEADLINE,
  FLAG_NIGHT_DEADLINE_CLEARED,
  FLAG_NIGHT_FORGOTTEN,
  FLAG_VILLAGE_SILENT,
  FLAG_STORAGE_LOCKED,
  FLAG_REGION_LOCKED,
  FLAG_SEEN_CAVE,
  FLAG_STORY_BAO_PAID,
  FLAG_STORY_MEIHUA_BETRAYED,
  ,
  ,
  FLAG_SYSTEM_REFUSED,
  ,
  FLAG_QUEST_DONE,
] = FLAG_KEYS

function err(code: ErrorCode): RErr {
  return { ok: false, code }
}

// Positive Failure: the cause of death is stamped on the dying state, not just
// pushed onto the event stream. The DeathScreen reads it after a save/reload —
// the event list is not persisted with the run. The flags record is untyped, so
// readDeathCause narrows it back to a cause code (or null) once and for all.
// One cause template per death site: die() stamps the flag and mints the DEATH
// event together, so the two can never drift apart.
function die(state: GameState, cause: string): { state: GameState; event: GameEvent } {
  return {
    state: { ...state, flags: { ...state.flags, death_cause: cause } },
    event: { type: 'DEATH', cause },
  }
}

export function readDeathCause(state: GameState): string | null {
  const cause = state.flags.death_cause
  return typeof cause === 'string' && cause !== '' ? cause : null
}

export function applyAction(state: GameState, action: Action): TransitionResult {
  if (action.kind === 'restart') {
    // Positive Failure: a reborn run inherits one attribute point keyed to how
    // the last life fell, so death teaches instead of erasing. A restart from a
    // living state carries no cause and inherits nothing.
    const fresh = newGame(action.seed, { legacyCause: readDeathCause(state) })
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
  // Issue 11: late-game gold sink — a cultivation tax that scales with major
  // realm stage, so every outing has a maintenance cost once the player is
  // strong. Older realms (stage 0–1) are exempt so early game stays free.
  const tax = CULTIVATION_TAX[state.player.stage] ?? 0
  const gold = Math.max(0, state.player.gold - tax)
  // Issue 6: every day has deterministic weather (a pure function of seed+day)
  // so the narrator can voice the season/sky; it never touches state.rng.
  const weather = weatherFor(state.seed, day)
  events.push({ type: 'DAY_PASSED', day, weather })
  const s: GameState = { ...state, day, player: { ...state.player, gold } }
  return s
}

// Phase 2: the story talks about "the twelfth night"; now the calendar enforces
// it. Entering Hồi II starts a visible countdown (flags.night_deadline).
// Overshooting marks flags.night_forgotten — a content consequence that opens
// branches, never a game over.
function applyNightDeadline(state: GameState, out: GameEvent[]): GameState {
  if (state.flags[FLAG_NIGHT_DEADLINE] === undefined && currentBeat(state).chapter >= 2) {
    out.push({
      type: 'WARNING',
      level: 1,
      locationId: state.player.locationId,
      messageVi: `Đêm thứ mười hai đã được định: còn ${DEADLINE_DAYS} ngày, làng chỉ nhớ được đến đó.`,
      messageEn: `The twelfth night is set: ${DEADLINE_DAYS} days remain — that is how long the village remembers.`,
    })
    return { ...state, flags: { ...state.flags, [FLAG_NIGHT_DEADLINE]: state.day + DEADLINE_DAYS } }
  }
  return state
}

// Reaching Hồi III (the sealed gate, the herb debt, or the first hunt) resolves
// the clock: the village remembers. Cleared in time is recorded as a survived
// stake; overshooting is handled by the expiry pass below.
function applyNightDeadlineResolution(state: GameState, out: GameEvent[]): GameState {
  const deadline = state.flags[FLAG_NIGHT_DEADLINE]
  if (typeof deadline !== 'number' || state.flags[FLAG_NIGHT_DEADLINE_CLEARED] !== undefined) return state
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
  return { ...state, flags: { ...state.flags, [FLAG_NIGHT_DEADLINE_CLEARED]: cleared } }
}

function applyNightDeadlineExpiry(state: GameState, out: GameEvent[]): GameState {
  const deadline = state.flags[FLAG_NIGHT_DEADLINE]
  if (typeof deadline === 'number' && state.day > deadline && state.flags[FLAG_NIGHT_FORGOTTEN] !== true) {
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
    return { ...state, flags: { ...state.flags, [FLAG_NIGHT_FORGOTTEN]: true, night_forgotten_name: forgottenName } }
  }
  return state
}

// P1-2: late-game teeth. As the calendar runs long, world affordances fall off
// — first the village goes silent (Meihua's blessings stop), then the sect
// warehouse closes, finally the sealed cave is no longer navigable. Each gate
// fires once and survives across saves.
function applyDeadlineConsequences(state: GameState, out: GameEvent[]): GameState {
  const flags = state.flags
  if (state.day >= 18 && flags[FLAG_VILLAGE_SILENT] !== true) {
    out.push({
      type: 'WARNING',
      level: 1,
      locationId: state.player.locationId,
      messageVi: 'Làng đã câm — không còn ai đứng ở cổng chờ ngươi trở về.',
      messageEn: 'The village has gone silent — no one waits at the gate any longer.',
    })
    return { ...state, flags: { ...flags, [FLAG_VILLAGE_SILENT]: true } }
  }
  if (state.day >= 22 && flags[FLAG_STORAGE_LOCKED] !== true) {
    out.push({
      type: 'WARNING',
      level: 2,
      locationId: state.player.locationId,
      messageVi: 'Nhà kho đã đóng — Cụ Mai Hoa không còn nhận gửi đồ.',
      messageEn: 'The warehouse is closed — Elder Meihua no longer accepts deposits.',
    })
    return { ...state, flags: { ...flags, [FLAG_STORAGE_LOCKED]: true } }
  }
  if (state.day >= 24 && flags[FLAG_REGION_LOCKED] !== true) {
    out.push({
      type: 'WARNING',
      level: 2,
      locationId: state.player.locationId,
      messageVi: 'Hang Phong Ấn đã bị niêm phong — đường vào không mở nữa.',
      messageEn: 'The Sealed Cave has been sealed — the entrance no longer opens.',
    })
    return { ...state, flags: { ...flags, [FLAG_REGION_LOCKED]: true } }
  }
  return state
}

// Hồi I choices decide the face of the loss: betraying Meihua's trust makes her
// the one erased; selling the pin to Bao puts the debt on him; learning the
// name from Ngo costs Ngo his place in the village's memory.
function forgottenNameFor(state: GameState): string {
  if (state.flags[FLAG_STORY_MEIHUA_BETRAYED] === true) return 'meihua'
  if (state.flags[FLAG_STORY_BAO_PAID] === true || state.flags['story_bao_has_map'] === true) return 'bao'
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
  s = applyDeadlineConsequences(s, out)
  const endingId = evaluateEndingId(s)
  if (endingId !== null && s.endingId !== endingId) {
    s = { ...s, endingId, terminal: true }
    out.push({ type: 'ENDING', endingId })
  }
  return { state: s, events: out }
}

function execAction(state: GameState, action: ConcreteAction): R {
  if (state.player.pendingAttributePoints > 0 && action.kind !== 'allocate_attribute') {
    return err('ATTRIBUTE_ALLOCATION_REQUIRED')
  }
  // An encounter is a closed deterministic turn loop. Preventing unrelated
  // actions here keeps the player from escaping damage by moving, resting, or
  // swapping gear mid-fight; consumables remain a deliberate one-turn choice.
  if (
    state.encounter !== null &&
    action.kind !== 'combat_attack' &&
    action.kind !== 'combat_defend' &&
    action.kind !== 'combat_retreat' &&
    action.kind !== 'combat_focus' &&
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
    case 'allocate_attribute':
      return doAllocateAttribute(state, action.attribute)
    case 'gather':
      return doGather(state)
    case 'refine':
      return doRefine(state, action.recipeId)
    case 'buy':
      return doBuy(state, action.itemId, action.qty ?? 1)
    case 'sell':
      return doSell(state, action.itemId, action.qty ?? 1)
    case 'convert_currency':
      return doConvertCurrency(state, action.from, action.qty)
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
    // System Layer: panel accept/turn-in go through the same cores — the
    // widened canAccept/canComplete gates already skip NPC/location checks.
    case 'system_accept_quest':
      return doAcceptQuest(state, action.questId)
    case 'system_turn_in_quest':
      return doCompleteQuest(state, action.questId)
    case 'choose_talent':
      return doChooseTalent(state, action.talentId)
    case 'learn_technique':
      return doLearnTechnique(state, action.techniqueId)
    case 'equip_item':
      return doEquipItem(state, action.itemId)
    case 'start_encounter':
      return doStartEncounter(state)
    case 'arena_challenge':
      return doArenaChallenge(state)
    case 'coerce_npc':
      return doCoerceNpc(state, action.npcId, action.approach)
    case 'combat_attack':
      return doCombatAttack(state, action.techniqueId)
    case 'combat_defend':
      return doCombatDefend(state)
    case 'combat_retreat':
      return doCombatRetreat(state)
    case 'combat_focus':
      return doCombatFocus(state)
    case 'unlock_skill':
      return doUnlockSkill(state, action.nodeId)
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
  // P1-2: day 24+ seals the rift region. Moving into a sealed_cave cell is
  // refused with REGION_LOCKED so the player keeps their day-trip cost but
  // does not teleport into a closed area.
  const check = checkMoveFrom(state.player.locationId, state.player.posX, state.player.posY, direction)
  if (!check.ok || check.cell === undefined) return err('MOVE_BLOCKED')
  if (
    state.flags['region_locked'] === true &&
    (check.cell.exitTo === 'sealed_cave' || check.destinationId === 'sealed_cave')
  ) {
    return err('REGION_LOCKED')
  }
  const events: GameEvent[] = []
  const cell = check.cell
  const targetLocId = check.destinationId
  const arrival = targetLocId === undefined ? undefined : entryPositionFor(targetLocId, state.player.locationId)
  let s: GameState = {
    ...state,
    flags: {
      ...state.flags,
      [FLAG_MOVED_ONCE]: true,
      moveCount: flagNum(state.flags, 'moveCount') + 1,
    },
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
    s = { ...arrived, flags: { ...arrived.flags, [FLAG_REACHED(cell.node.id)]: true } }
  }
  const dangerLocationId = targetLocId ?? (cell.node?.kind === 'danger' ? state.player.locationId : undefined)
  if (dangerLocationId !== undefined) {
    if (dangerLocationId === LOCATION_CAVE) s = { ...s, flags: { ...s.flags, [FLAG_SEEN_CAVE]: true } }
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
        const [rolled, nextRng] = damageRoll(s.rng, danger)
        const damage = Math.max(1, Math.round(rolled * damageMultiplier(s.difficulty ?? 'balanced')))
        s = { ...s, rng: nextRng }
        const newHp = Math.max(0, s.player.hp - damage)
        s = { ...s, player: { ...s.player, hp: newHp } }
        events.push({ type: 'DAMAGED', amount: damage, source: dangerLocationId })
        if (newHp <= 0) {
          const fallen = die({ ...s, player: { ...s.player, alive: false } }, `danger:${dangerLocationId}`)
          events.push(fallen.event)
          return { ok: true, state: fallen.state, events }
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
  const day = state.day + 1
  const s: GameState = {
    ...state,
    day,
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
      { type: 'DAY_PASSED', day, weather: weatherFor(state.seed, day) },
    ],
  }
}

function doTrain(state: GameState): R {
  if (state.player.qi < TRAIN_QI_COST) return err('INSUFFICIENT_QI')
  // P0-6: training can kill (TRAIN_HP_COST + 0..2 variance). The death gate
  // rejects the action when HP is too low to survive even the WORST variance
  // (nextInt(rng, 0, 2) can return 2), so the player never dies on a turn they
  // reasonably expected to survive.
  if (state.player.hp <= TRAIN_HP_COST + 2) return err('INSUFFICIENT_HP')
  const events: GameEvent[] = []
  state = spendDay(state, events)
  const [hpLossVariance, rngAfter] = nextInt(state.rng, 0, 2)
  const gain = trainProgressGain(state)
  const hp = state.player.hp - TRAIN_HP_COST - hpLossVariance
  const qi = state.player.qi - TRAIN_QI_COST
  const progress = applyProgress(state, gain)
  // P1-Narrative #8: the trainer narrates with scene-aware flavor — the
  // narrator branches on sceneId, so we stamp it on the event when the
  // player is in the cave witness scene.
  const sceneId = currentStoryScene(state).id

  if (hp <= 0) {
    const fallen = die(
      {
        ...state,
        rng: rngAfter,
        player: {
          ...state.player,
          hp: 0,
          qi: Math.max(0, qi),
          stage: progress.stage,
          realmLevel: progress.realmLevel,
          progress: progress.progress,
          pendingAttributePoints: 0,
          alive: false,
        },
      },
      'qi_deviation',
    )
    events.push({ type: 'TRAINED', gain, stage: progress.stage, sceneId })
    events.push(fallen.event)
    return { ok: true, state: fallen.state, events }
  }

  const pointsGranted = progress.breakthroughs * ATTRIBUTE_POINTS_PER_BREAKTHROUGH
  // Issue 5: each breakthrough also grants skill points for the skill tree.
  const skillPointsGranted = progress.breakthroughs * SKILL_POINTS_PER_BREAKTHROUGH
  const s: GameState = {
    ...state,
    rng: rngAfter,
    player: {
      ...state.player,
      hp,
      qi,
      stage: progress.stage,
      realmLevel: progress.realmLevel,
      progress: progress.progress,
      pendingAttributePoints: state.player.pendingAttributePoints + pointsGranted,
      skillPoints: (state.player.skillPoints ?? 0) + skillPointsGranted,
    },
    unlockedSkills: state.unlockedSkills ?? [],
  }
  events.push({ type: 'TRAINED', gain, stage: progress.stage, sceneId })
  if (progress.breakthroughs > 0) {
    events.push({
      type: 'MINOR_REALM_ADVANCED',
      stage: progress.stage,
      realmLevel: progress.realmLevel,
      pointsGranted,
      skillPointsGranted,
    })
  }
  return { ok: true, state: s, events }
}

function doAllocateAttribute(state: GameState, attribute: AttributeName): R {
  if (state.player.pendingAttributePoints <= 0) return err('NO_ATTRIBUTE_POINTS')
  const value = state.player.attrs[attribute]
  if (value >= ATTRIBUTE_MAX) return err('ATTRIBUTE_MAXED')
  const pointsRemaining = state.player.pendingAttributePoints - 1
  return {
    ok: true,
    state: {
      ...state,
      player: {
        ...state.player,
        attrs: { ...state.player.attrs, [attribute]: value + 1 },
        pendingAttributePoints: pointsRemaining,
      },
    },
    events: [{ type: 'ATTRIBUTE_ALLOCATED', attribute, value: value + 1, pointsRemaining }],
  }
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
    inventory: bump(state.inventory, 'spirit_herb', qty + luckGatherBonus(state.player.attrs.luck)),
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
  if (def === undefined || state.player.stage < (def.requiredStage ?? 0)) return err('ITEM_UNAVAILABLE')
  // Issue 7: pay the price the NPC stalls actually list (shopStock.ts), not the
  // stale static item.buyPrice. A good may appear at several stalls in
  // different tiers (gold / silver / Linh Thạch); we take the cheapest
  // gold-normalised offer. Goods with no shop entry AND no static buyPrice
  // (e.g. quest-only items like old_manual) are unstocked.
  const shop = marketPriceFor(itemId, WEATHER_EFFECTS[weatherFor(state.seed, state.day).id]?.herbPriceMod ?? 1)
  if (shop === null && def.buyPrice == null) return err('ITEM_UNAVAILABLE')
  const tier: 'gold' | 'silver' | 'ls' = shop?.tier ?? 'gold'
  const unit = shop !== null ? shop.price : (def.buyPrice ?? 0)
  const charmDiscount = charmPriceDiscount(state.player.attrs.charm)
  const total = Math.max(0, unit - charmDiscount) * qty
  const events: GameEvent[] = []
  let { gold, silver, spiritStones } = state.player
  silver ??= 0
  spiritStones ??= 0
  if (tier === 'gold') {
    // Gold first; any shortfall is covered from silver at the 10:1 rate (T02).
    if (gold >= total) {
      gold -= total
    } else if (silver >= (total - gold) * 10) {
      silver -= (total - gold) * 10
      gold = 0
    } else {
      // With gold in hand the fallback tier (silver) is what actually ran
      // short; a player broke on both is fundamentally out of gold.
      return err(gold > 0 ? 'INSUFFICIENT_SILVER' : 'INSUFFICIENT_GOLD')
    }
  } else if (tier === 'silver') {
    if (silver < total) return err('INSUFFICIENT_SILVER')
    silver -= total
  } else {
    if (spiritStones < total) return err('INSUFFICIENT_SPIRIT_STONES')
    spiritStones -= total
  }
  state = spendDay(state, events)
  const s: GameState = {
    ...state,
    player: { ...state.player, gold, silver, spiritStones },
    inventory: bump(state.inventory, itemId, qty),
    flags: { ...state.flags, buyCount: flagNum(state.flags, 'buyCount') + qty },
  }
  // goldPaid reports the gold-equivalent cost for UI parity across tiers.
  const goldPaid = tier === 'ls' ? total * 10 : tier === 'silver' ? Math.floor(total / 10) : total
  return {
    ok: true,
    state: s,
    events: [...events, { type: 'BOUGHT', itemId, qty, goldPaid }],
  }
}

/** The System produces notifications only while a protocol is active (canon §3: refusal silences it). */
function systemIsActive(state: GameState): boolean {
  return state.systemId != null && state.flags[FLAG_SYSTEM_REFUSED] !== true
}

/**
 * Currency exchange at the market (T02 economy, 3 layers).
 * Authored rates: 1 spirit stone = 10 gold = 100 silver. Issue 7 made the
 * counter two-way in every direction: gold buys LS back (the true late-game
 * sink) and gold buys silver for stall goods priced in Bạc.
 */
function doConvertCurrency(state: GameState, from: 'spiritStone' | 'silver' | 'gold', qty: number): R {
  if (state.player.locationId !== LOCATION_MARKET) return err('NOT_AT_LOCATION')
  if (!Number.isInteger(qty) || qty <= 0) return err('INVALID_QTY')
  if (from === 'spiritStone') {
    const have = state.player.spiritStones ?? 0
    if (have < qty) return err('INSUFFICIENT_SPIRIT_STONES')
    const goldGain = qty * 10
    return {
      ok: true,
      state: {
        ...state,
        player: { ...state.player, spiritStones: have - qty, gold: state.player.gold + goldGain },
      },
      events: [{ type: 'CURRENCY_CONVERTED', from, qty, goldGain }],
    }
  }
  if (from === 'gold') {
    // Reverse exchange (issue 7): `qty` spirit stones cost `qty * 10` gold.
    // The stone path is the true late-game sink — it burns gold for a tier
    // that only rare stalls accept.
    const have = state.player.gold
    const cost = qty * 10
    if (have < cost) return err('INSUFFICIENT_GOLD')
    return {
      ok: true,
      state: {
        ...state,
        player: {
          ...state.player,
          gold: have - cost,
          spiritStones: (state.player.spiritStones ?? 0) + qty,
        },
      },
      events: [{ type: 'CURRENCY_CONVERTED', from, qty, goldGain: -cost }],
    }
  }
  const have = state.player.silver ?? 0
  const cost = qty * 10
  if (have < cost) return err('INSUFFICIENT_SILVER')
  return {
    ok: true,
    state: {
      ...state,
      player: { ...state.player, silver: have - cost, gold: state.player.gold + qty },
    },
    events: [{ type: 'CURRENCY_CONVERTED', from, qty, goldGain: qty }],
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
  // Issue 6 note: only the BUY side moves with the day's weather (doBuy).
  // Sell prices stay at the authored base so a gather-and-flip round trip
  // never turns a profit; the market mod is a shopping cost, not an income
  // exploit.
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
    technique.sourceItemId === undefined
  ) {
    return err('ITEM_UNAVAILABLE')
  }
  // P1-1 system divergence: each System has a signature technique whose id
  // carries the system shortname. Only the matching system may learn it.
  if (techniqueId.startsWith('system_')) {
    if (technique.requiredSystem !== undefined && state.systemId !== technique.requiredSystem) {
      return err('SYSTEM_LOCKED')
    }
  }
  if (countOf(state.inventory, technique.sourceItemId) < 1) return err('NO_ITEM')
  const currentLevel = state.techniques[techniqueId] ?? 0
  if (currentLevel >= technique.maxLevel) return err('ITEM_UNAVAILABLE')
  const nextLevel = currentLevel + 1
  // P1-1: signature techniques also stamp a `system_<id>_signature` flag so
  // authored content (NPC lines, etc.) can gate on the player's pick.
  const signatureFlag = techniqueId.startsWith('system_') ? { [techniqueId]: true } : {}
  return {
    ok: true,
    state: {
      ...state,
      inventory: bump(state.inventory, technique.sourceItemId, -1),
      techniques: { ...state.techniques, [techniqueId]: nextLevel },
      flags: { ...state.flags, ...signatureFlag },
    },
    events: [{ type: 'TECHNIQUE_LEARNED', techniqueId, level: nextLevel }],
  }
}

// Issue 5: unlock a skill-tree node by spending skillPoints (+ optional gold
// and a consumed item). Gates live in skills.ts (skillUnlockGate); this is the
// single write path that records the node and deducts every cost.
function doUnlockSkill(state: GameState, nodeId: string): R {
  const gate = skillUnlockGate(state, nodeId)
  if (gate !== null) return err(gate)
  const node = getSkillNode(nodeId)
  if (node === undefined) return err('SKILL_UNKNOWN')
  const player = { ...state.player, skillPoints: (state.player.skillPoints ?? 0) - node.cost.skillPoints }
  if (node.cost.gold !== undefined) player.gold = Math.max(0, player.gold - node.cost.gold)
  return {
    ok: true,
    state: {
      ...state,
      player,
      inventory: node.cost.item === undefined ? state.inventory : bump(state.inventory, node.cost.item, -1),
      unlockedSkills: [...(state.unlockedSkills ?? []), nodeId],
    },
    events: [{ type: 'SKILL_UNLOCKED', nodeId, skillPointsSpent: node.cost.skillPoints }],
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
  if (enemy === undefined || state.flags[FLAG_DEFEATED(enemy.id)] === true) return err('NOT_AT_LOCATION')
  const events: GameEvent[] = []
  state = spendDay(state, events)
  return {
    ok: true,
    state: { ...state, encounter: newEncounter(enemy) },
    events: [...events, { type: 'ENCOUNTER_STARTED', enemyId: enemy.id }],
  }
}

// Lôi Đài (Issue #19): the tower-climb arena. The next opponent is chosen by
// the cleared-floor pointer, not by `enemyAt`, so the ladder advances in order
// regardless of how many disciples roam the sect. It is a normal encounter —
// strike/defend/retreat/consume all work — but winning moves the pointer and
// seizes the floor's stores (the resource-plunder payoff). Retreating is safe:
// the pointer does not move, so the floor can be retried with no dead-end.
function doArenaChallenge(state: GameState): R {
  if (state.encounter !== null) return err('ITEM_UNAVAILABLE')
  if (state.player.locationId !== LOCATION_SECT) return err('NOT_AT_LOCATION')
  const cleared = flagNum(state.flags, FLAG_ARENA_FLOOR)
  if (cleared >= ARENA_FLOOR_COUNT) return err('ARENA_CLOSED')
  const enemy = arenaEnemyForFloor(cleared)
  if (enemy === undefined) return err('ARENA_CLOSED')
  const events: GameEvent[] = []
  state = spendDay(state, events)
  const floor = enemy.arena ?? cleared + 1
  // Each challenge already costs a day; the sect tends your wounds and you
  // meditate back to full qi between rounds — a fresh morning per bout.
  // Without it the tower is one gaunt HP/qi pool (the handoff flagged floors
  // 4–5 as seed-critical): climbers reached the summit at qi 0 and had to
  // defend-bank 5 qi per strike until the Senior Brother finished them.
  const hpHeal = Math.min(REST_HEAL_HP, MAX_HP - state.player.hp)
  state = { ...state, player: { ...state.player, hp: state.player.hp + hpHeal, qi: MAX_QI } }
  events.push({ type: 'RESTED', hpHeal })
  return {
    ok: true,
    state: { ...state, encounter: newEncounter(enemy) },
    events: [...events, { type: 'ENCOUNTER_STARTED', enemyId: enemy.id }, { type: 'ARENA_CHALLENGED', floor, enemyId: enemy.id }],
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
  // P0-5: crit roll. critChance(luck) caps at 0.25; when the roll wins, the
  // strike doubles its base (no variance band) and the focus stacks add to it.
  // critBonus=0 never crits; critBonus=100 always doubles once the roll wins.
  const luck = state.player.attrs.luck
  const critChance = Math.min(0.25, Math.max(0, luck / 100))
  // P0-5: luck controls crit chance (capped at 25%). When the roll wins the
  // strike doubles its base and drops the variance band, so a crit strictly
  // out-hits a non-crit strike. The skill-tree also grants critBonus which
  // adds a flat +critChance, raising the effective cap.
  const critBonus = typeof state.flags['critBonus'] === 'number' ? state.flags['critBonus'] : 0
  // Issue 5: skill-tree crit nodes add a flat +critChance on top of luck/critBonus.
  const effectiveCritChance = Math.min(1.0, critChance + critBonus / 100 + skillCritBonus(state) / 100)
  const [critRoll, rngAfter] = nextInt(rng, 0, 99)
  const critFires = critRoll < effectiveCritChance * 100
  // Focus stacks (combat_focus) consume on the next strike — +FOCUS_STACK_DAMAGE
  // per stack and reset. The base hit includes variance; a crit drops it and doubles.
  const focus = (state.encounter.focusDamage ?? 0)
  // Issue 5: unlocked attack nodes add a flat bonus to every strike (crit and non-crit).
  const skillAtk = skillAttackBonus(state)
  // Issue 6: an attack companion adds its flat bonus to every strike.
  const companion = companionBuff(state.companionId, BEASTS)
  const companionAtk = companion?.kind === 'attack' ? companion.value : 0
  const baseHit = Math.max(1, 5 + attributeCombatBonus(state.player.attrs.body) + state.player.stage * 2 + powerTerm + equippedAttackBonus(state) + talentAttackBonus(state) + skillAtk + companionAtk + variance)
  const critHit = Math.max(1, (5 + attributeCombatBonus(state.player.attrs.body) + state.player.stage * 2 + powerTerm + equippedAttackBonus(state) + talentAttackBonus(state) + skillAtk + companionAtk) * 2)
  const rawAmount = critFires ? critHit : baseHit
  const amount = rawAmount + focus
  // Combat 9+: behavior hooks evaluated on the player turn BEFORE the strike
  // resolves. The reducer keeps the change next-turn (phase2) or one-shot
  // (boss heal) at the encounter level so resolveEnemyTurn picks them up.
  let behaviorBonus = state.encounter.behaviorBonus ?? 0
  // Issue 9: the heal itself no longer pre-arms here — it fires only after the
  // telegraph turn. behaviorHealFlag now just carries an already-fired heal.
  const behaviorHealFlag = state.encounter.behaviorHealUsed ?? false
  if (enemy.behavior === 'phase2' && state.encounter.hp / enemy.maxHp <= 0.5) behaviorBonus += 2
  const hp = Math.max(0, state.encounter.hp - amount)
  // Combo counter: consecutive player hits without an enemy reply. Fires
  // COMBO_TRIGGERED on odd counts (3, 5, 7, 9, …) for a more frequent payoff
  // so the audio layer's bell-tree accent lands often enough to feel earned.
  const playerHits = (state.encounter.playerHits ?? 0) + 1
  const comboFires = playerHits >= 3 && playerHits % 2 === 1
  // Issue 9: 1-turn telegraph. When the boss first drops to ≤33% HP the heal
  // does NOT fire yet — the boss announces it (WARNING) and the player keeps
  // this turn to react; the full heal lands on the NEXT strike (or when the
  // telegraph flag is already set). Rage (×1.5 in resolveEnemyTurn) follows
  // the heal automatically via behaviorHealUsed.
  const lowHp = state.encounter.hp / enemy.maxHp <= 0.33
  const healArmed = enemy.behavior === 'boss' && lowHp && !(state.encounter.behaviorHealUsed ?? false)
  const willHeal = healArmed && state.encounter.telegraphedHeal === true
  const willTelegraph = healArmed && state.encounter.telegraphedHeal !== true
  // Issue 5: onHit heal nodes restore HP on every landing strike (capped at MAX_HP).
  const onHitHeal = Math.min(MAX_HP - state.player.hp, skillOnHitHeal(state))
  const s: GameState = {
    ...state,
    rng: rngAfter,
    player: {
      ...state.player,
      qi: state.player.qi - qiCost,
      hp: Math.min(MAX_HP, state.player.hp + onHitHeal),
    },
    encounter: { ...state.encounter, hp, guard, focusStacks: 0, focusDamage: 0, behaviorBonus, behaviorHealUsed: behaviorHealFlag || willHeal, telegraphedHeal: willTelegraph ? true : state.encounter.telegraphedHeal, playerHits },
  }
  const events: GameEvent[] = [
    { type: 'QI_SPENT', amount: qiCost },
    { type: 'COMBAT_HIT', actor: 'player', amount, enemyId: enemy.id },
  ]
  if (critFires) events.push({ type: 'COMBAT_CRIT', amount, enemyId: enemy.id })
  if (comboFires) events.push({ type: 'COMBO_TRIGGERED', hits: playerHits })
  // Combat 9+ boss heal: fires only the turn AFTER the telegraph. If this
  // strike would kill the boss after the telegraph, the heal resolves first
  // and the boss lives at maxHp.
  let liveHp = hp
  let sAfterStrike = s
  if (willHeal) {
    liveHp = state.encounter.maxHp
    sAfterStrike = { ...s, encounter: { ...state.encounter, hp: liveHp, behaviorHealUsed: true, telegraphedHeal: true, enemyTurns: state.encounter.enemyTurns ?? 0, statusEffects: state.encounter.statusEffects ?? [], playerHits } }
    events.push({ type: 'BOSS_HEAL', enemyId: enemy.id, hpRestored: liveHp })
  } else if (willTelegraph) {
    events.push({ type: 'WARNING', level: 2, locationId: state.player.locationId, messageVi: `Yêu khí quanh ${enemy.nameVi ?? enemy.id} cuộn lên — nó sắp hồi toàn bộ khí huyết ở lượt sau!`, messageEn: `Malice coils around ${enemy.nameEn ?? enemy.id} — it will restore all HP next turn!` })
  }
  if (liveHp <= 0) {
    let inventory = { ...s.inventory }
    for (const [itemId, qty] of Object.entries(enemy.rewardItems)) inventory = bump(inventory, itemId, qty)
    // Combat 9+ poison behavior: on defeat the enemy seeds 2 poison stacks
    // (next 2 enemy-reply turns each deal -3 — applied via player.poison).
    let playerState = { ...s.player, gold: s.player.gold + enemy.rewardGold }
    if (enemy.behavior === 'poison') {
      playerState = applyPoison(playerState, 2)
      events.push({ type: 'POISON_APPLIED', amount: 2 })
    }
// Issue 5: onKill heal nodes restore HP when a strike kills the enemy.
    const onKillHeal = Math.min(MAX_HP - playerState.hp, skillOnKillHeal(state))
    playerState = { ...playerState, hp: Math.min(MAX_HP, playerState.hp + onKillHeal) }
    // Lôi Đài (Issue #19): clearing a tower floor advances the ladder pointer
    // and announces the seizure of that disciple's stores. The floor index
    // only ever moves forward (Math.max) so a rematch cannot rewind it.
    const flags: Record<string, number | boolean | string> = { ...s.flags, [FLAG_DEFEATED(enemy.id)]: true }
    if (enemy.arena !== undefined) {
      flags[FLAG_ARENA_FLOOR] = Math.max(flagNum(s.flags, FLAG_ARENA_FLOOR), enemy.arena)
      events.push({
        type: 'ARENA_FLOOR_CLEARED',
        floor: enemy.arena,
        enemyId: enemy.id,
        gold: enemy.rewardGold,
        itemIds: Object.keys(enemy.rewardItems),
      })
      if (enemy.arena >= ARENA_FLOOR_COUNT && flags[FLAG_ARENA_CLEARED] !== true) {
        flags[FLAG_ARENA_CLEARED] = true
        events.push({ type: 'ARENA_TOWER_TOPPED', floors: ARENA_FLOOR_COUNT })
      }
    }
    return {
      ok: true,
      state: {
        ...s,
        encounter: null,
        inventory,
        player: playerState,
        flags,
      },
      events: [...events, { type: 'COMBAT_WON', enemyId: enemy.id, rewardGold: enemy.rewardGold }],
    }
  }
  return resolveEnemyTurn(sAfterStrike, events)
}

function doCombatDefend(state: GameState): R {
  if (state.encounter === null) return err('NOT_AT_LOCATION')
  // Issue 5: skillGuardBonus adds to the guard amount when defending.
  const guard = 4 + talentDefenseBonus(state) + skillGuardBonus(state)
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
  // P0-5: retreating twice from the same enemy in one outing doubles both
  // costs — the first retreat is the panic button, the second is the cost
  // of forcing the encounter to re-open. spendDay resets the repeat flag.
  const repeat = state.flags[FLAG_RETREATED(enemy.id)] === true
  const multiplier = repeat ? 2 : 1
  const hpCost = Math.min(RETREAT_HP_COST * multiplier, Math.max(0, state.player.hp - 1))
  const progressCost = Math.min(RETREAT_PROGRESS_COST * multiplier, state.player.progress)
  const s: GameState = {
    ...state,
    encounter: null,
    player: {
      ...state.player,
      hp: state.player.hp - hpCost,
      progress: state.player.progress - progressCost,
    },
    flags: { ...state.flags, [FLAG_RETREATED(enemy.id)]: true },
  }
  return {
    ok: true,
    state: s,
    events: [{ type: 'COMBAT_RETREATED', enemyId: enemy.id, hpCost, progressCost }],
  }
}

// Combat 9+ focus: a 0-qi turn that grants +5 guard and stacks +2 damage on
// the next strike. Stacks accumulate; the next attack consumes them.
const FOCUS_GUARD = 5
const FOCUS_STACK_DAMAGE = 2
function doCombatFocus(state: GameState): R {
  if (state.encounter === null) return err('NOT_AT_LOCATION')
  const guardAmount = FOCUS_GUARD
  const nextStacks = (state.encounter.focusStacks ?? 0) + 1
  const s: GameState = {
    ...state,
    encounter: {
      ...state.encounter,
      guard: state.encounter.guard + guardAmount,
      // Phase-2 (Combat 9+): focus stacks store damage bonus, not a flat +1.
      focusDamage: (state.encounter.focusDamage ?? 0) + FOCUS_STACK_DAMAGE,
      focusStacks: nextStacks,
    },
  }
  // Issue 12: focus reports its stacking damage (stacks + per-stack bonus),
  // not just the guard it grants, so the UI can show the growing threat and
  // the narrator can voice it.
  return { ok: true, state: s, events: [{ type: 'COMBAT_FOCUSED', guard: guardAmount, damage: FOCUS_STACK_DAMAGE * nextStacks, stacks: nextStacks }] }
}

// Combat 9+ qi regen: every 3rd enemy reply inside the same encounter, the
// player draws +5 (capped at MAX_QI). The counter is per-encounter, so it
// resets when a new encounter starts.
const ENCOUNTER_QI_REGEN_TURN = 3
const ENCOUNTER_QI_REGEN_AMOUNT = 5
function resolveEnemyTurn(state: GameState, events: GameEvent[]): R {
  if (state.encounter === null) return { ok: true, state, events }
  const enemy = getEnemy(state.encounter.enemyId)
  if (enemy === undefined) return err('ITEM_UNAVAILABLE')
  // Issue 6: companion buffs for this day's encounter.
  const companion = companionBuff(state.companionId, BEASTS)
  const companionDodge = companion?.kind === 'dodge' ? companion.value / 100 : 0
  const companionDef = companion?.kind === 'defense' ? companion.value : 0
  const companionHeal = companion?.kind === 'heal' ? companion.value : 0
  const companionQi = companion?.kind === 'qi' ? companion.value : 0
  const [variance, rng] = nextInt(state.rng, 0, 2)
  // Issue 5: shadow-branch dodge nodes grant evasion. A dodge draw consumes
  // no RNG when the chance is 0, keeping pre-skill save RNG streams identical.
  // Issue 6: a dodge companion stacks its evasion on top of the skill dodge.
  const dodgeChance = Math.min(0.9, skillDodgeChance(state) + companionDodge)
  const [dodgeRoll, rngAfterDodge] = dodgeChance > 0 ? nextInt(rng, 0, 99) : [100, rng]
  if (dodgeRoll < dodgeChance * 100) {
    const turn = (state.encounter.enemyTurns ?? 0) + 1
    const qiRegen = turn % ENCOUNTER_QI_REGEN_TURN === 0
      ? Math.min(ENCOUNTER_QI_REGEN_AMOUNT, MAX_QI - state.player.qi)
      : 0
    // Issue 6: dodge avoids the blow, but a qi/heal companion still buffs this
    // turn — keep the reply consistent with the non-dodge path.
    const s: GameState = {
      ...state,
      rng: rngAfterDodge,
      player: { ...state.player, qi: Math.min(MAX_QI, state.player.qi + qiRegen + companionQi), hp: Math.min(MAX_HP, state.player.hp + companionHeal) },
      encounter: { ...state.encounter, guard: 0, behaviorBonus: 0, enemyTurns: turn, playerHits: 0 },
    }
    const out: GameEvent[] = [...events, { type: 'COMBAT_HIT', actor: 'enemy', amount: 0, enemyId: enemy.id }]
    if (qiRegen > 0) out.push({ type: 'QI_REGEN', amount: qiRegen, turn })
    if (companionQi > 0) out.push({ type: 'QI_REGEN', amount: companionQi, turn })
    return { ok: true, state: s, events: out }
  }
  // Combat 9+ behavior hooks on the enemy reply: phase2 adds a stored +2 to
  // attack, boss adds +50% damage when its one-shot heal already fired.
  const behaviorAtk = state.encounter.behaviorBonus ?? 0
  const bossRage = enemy.behavior === 'boss' && state.encounter.behaviorHealUsed === true ? 1.5 : 1
  // Issue 6: the day's weather strengthens the boss (mist +30%, storm +50%).
  // Gated to `behavior:'boss'` — the field name is bossPowerMod, and Lôi Đài's
  // arena disciples are ordinary foes: applying it to every enemy made floor 3+
  // lethal in a storm and broke the tower climb. Pure from (seed, day), so it
  // never disturbs the rng stream.
  const bossMod = enemy.behavior === 'boss' ? WEATHER_EFFECTS[weatherFor(state.seed, state.day).id]?.bossPowerMod ?? 1 : 1
  // Issue 6: a defense companion soaks part of every incoming blow.
  // Difficulty scales only what the enemy deals, after defences — one central
  // knob (damageMultiplier) for the whole combat path.
  // Issue 5: skill-tree defense nodes subtract from incoming damage.
  const raw = (enemy.attack + variance + behaviorAtk - equippedDefenseBonus(state) - talentDefenseBonus(state) - skillDefenseBonus(state) - companionDef - state.encounter.guard) * damageMultiplier(state.difficulty ?? 'balanced') * bossRage * bossMod
  const amount = Math.max(1, Math.round(raw))
  const hp = Math.max(0, state.player.hp - amount)
  // Combat 9+ poison stacks: each stack drains 3 HP on the player's next reply.
  // The stack counter decrements here so the post-tick block can read it before
  // it resets on encounter end.
  const nextStacks = Math.max(0, (state.player.poison ?? 0) - 1)
  const poisonDrain = state.player.poison && state.player.poison > 0 ? 3 : 0
  const hpAfterPoison = Math.max(0, hp - poisonDrain)
  // Per-encounter qi regen on every NTH reply.
  const turn = (state.encounter.enemyTurns ?? 0) + 1
  const qiRegen = turn % ENCOUNTER_QI_REGEN_TURN === 0
    ? Math.min(ENCOUNTER_QI_REGEN_AMOUNT, MAX_QI - state.player.qi)
    : 0
  const s: GameState = {
    ...state,
    rng: rngAfterDodge,
    player: {
      ...state.player,
      hp: Math.min(MAX_HP, hpAfterPoison + companionHeal),
      alive: hpAfterPoison > 0,
      poison: nextStacks,
      qi: Math.min(MAX_QI, state.player.qi + qiRegen + companionQi),
    },
    encounter: { ...state.encounter, guard: 0, behaviorBonus: 0, enemyTurns: turn, playerHits: 0 },
  }
  const out: GameEvent[] = [...events, { type: 'COMBAT_HIT', actor: 'enemy', amount, enemyId: enemy.id }]
  if (poisonDrain > 0) out.push({ type: 'POISON_TICK', amount: poisonDrain, stacks: nextStacks })
  if (qiRegen > 0) out.push({ type: 'QI_REGEN', amount: qiRegen, turn })
if (companionQi > 0) out.push({ type: 'QI_REGEN', amount: companionQi, turn })
  if (hpAfterPoison <= 0) {
    const fallen = die(s, `combat:${enemy.id}`)
    out.push(fallen.event)
    return { ok: true, state: fallen.state, events: out }
  }
  return { ok: true, state: s, events: out }
}

// Combat 9+: stack N poison ticks on the player. Each tick drains 3 HP on the
// enemy's next reply turn, up to MAX_POISON_STACKS (so a long poison chain
// can't lock them into permanent -HP-per-turn).
const MAX_POISON_STACKS = 5
function applyPoison(player: GameState['player'], stacks: number): GameState['player'] {
  const current = player.poison ?? 0
  return { ...player, poison: Math.min(MAX_POISON_STACKS, current + stacks) }
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
  // P1-2: day 22+ the sect warehouse closes — store/withdraw are refused.
  if (state.flags['storage_locked'] === true) return err('STORAGE_LOCKED')
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
  // P1-2: day 22+ the sect warehouse closes — store/withdraw are refused.
  if (state.flags['storage_locked'] === true) return err('STORAGE_LOCKED')
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
  const affKey = FLAG_AFF(npcId)
  const talkKey = FLAG_TALK(npcId)
  const before = flagNum(state.flags, affKey)
  const after = before + 1
  const npcTalkWarns = FLAG_TALK_WARN(npcId)
  const flags: Record<string, boolean | number | string> = {
    ...state.flags,
    talkCount: flagNum(state.flags, 'talkCount') + 1,
    lastTalkNpc: npcId,
    lastTalkRepeated: state.flags.lastTalkNpc === npcId,
    [affKey]: after,
    [talkKey]: flagNum(state.flags, talkKey) + 1,
  }
  // P1-4: also maintain the per-NPC affection map. The legacy aff_<id> flag
  // remains authoritative for affinity gates; the map is the structured twin
  // UI/export code reads from.
  const affection = { ...(state.affection ?? {}) }
  affection[npcId] = (affection[npcId] ?? 0) + 1
  // Affinity gates: reaching 3/6/9 unlocks the corresponding gate flag so
  // quest requiredFlags can reference it without duplicating the threshold.
  for (const gateLevel of [3, 6, 9]) {
    if (before < gateLevel && after >= gateLevel) {
      flags[FLAG_AFF_GATE(npcId)] = true
    }
  }
  // Narrative diminishing returns: once affection crosses 9 with no romance or
  // quest progress, surface a soft warning that the player has been heard but
  // nothing new is happening. Fires once per NPC per life — checked against
  // the local `flags` we are building (not the stale `state.flags`) so the
  // decision stays consistent with the flag we are about to commit.
  const fireWarn = after >= 9 && flags[npcTalkWarns] === undefined
  if (fireWarn) {
    flags[npcTalkWarns] = true
  }
  const s: GameState = {
    ...state,
    flags,
    affection,
  }
  const events: GameEvent[] = []
  if (fireWarn) {
    events.push({
      type: 'WARNING',
      level: 0,
      locationId: npc.locationId,
      messageVi: `Ngươi đã đến với ${npc.nameVi} nhiều lần, nhưng vẫn chưa nói được điều gì mới — họ lặp lại chính câu cũ.`,
      messageEn: `You have visited ${npc.nameEn} many times, yet said nothing new — they repeat the same words.`,
    })
  }
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

// Cưỡng đoạt (Issue #19): the Killer's non-combat pressure channel. Intimidating
// a personality-opposite NPC takes their stores outright. Plunder is one-shot
// per victim (guarded by the coerced flag) — the loop cannot be farmed, and the
// loot is fixed data rather than RNG so the whole path stays deterministic.
// The cost is social, not numeric: the victim's goodwill empties and the sect
// remembers the infamy. back_off is the restraint branch, spending the day but
// mending the relationship instead.
function doCoerceNpc(state: GameState, npcId: string, approach: 'plunder' | 'back_off'): R {
  const npc = getNpc(npcId)
  if (npc === undefined) return err('NPC_UNKNOWN')
  const def = coercionFor(npcId)
  if (def === undefined) return err('COERCION_UNAVAILABLE')
  if (state.player.locationId !== npc.locationId) return err('NPC_NOT_HERE')
  if (state.encounter !== null) return err('ITEM_UNAVAILABLE')
  const affKey = FLAG_AFF(npcId)
  const already = state.flags[FLAG_COERCED(npcId)] === true
  const events: GameEvent[] = []
  state = spendDay(state, events)
  if (approach === 'back_off') {
    // One-shot like plunder: the first restraint mends the relationship, but a
    // threat followed by repeated "restraint" cannot farm affection — the
    // second back-off spends its day for nothing.
    const backedOff = state.flags[FLAG_COERCED_BACKOFF(npcId)] === true
    const aff = backedOff ? 0 : def.backOffAff
    const affection = { ...(state.affection ?? {}) }
    affection[npcId] = (affection[npcId] ?? 0) + aff
    return {
      ok: true,
      state: {
        ...state,
        affection,
        flags: {
          ...state.flags,
          [FLAG_COERCED_BACKOFF(npcId)]: true,
          ...(backedOff ? {} : { [affKey]: flagNum(state.flags, affKey) + def.backOffAff }),
        },
      },
      events: [...events, { type: 'NPC_COERCED', npcId, approach, gold: 0, itemIds: [], aff, infamy: flagNum(state.flags, FLAG_INFAMY) }],
    }
  }
  if (already) {
    // The stores are bare — the victim was squeezed already. No loot, no extra
    // infamy, but the day is still spent.
    return {
      ok: true,
      state,
      events: [...events, { type: 'NPC_COERCED', npcId, approach, gold: 0, itemIds: [], aff: 0, infamy: flagNum(state.flags, FLAG_INFAMY) }],
    }
  }
  let inventory = state.inventory
  for (const [itemId, qty] of Object.entries(def.stealItems)) inventory = bump(inventory, itemId, qty)
  const infamy = flagNum(state.flags, FLAG_INFAMY) + 1
  const affection = { ...(state.affection ?? {}), [npcId]: 0 }
  return {
    ok: true,
    state: {
      ...state,
      inventory,
      affection,
      player: { ...state.player, gold: state.player.gold + def.stealGold },
      flags: { ...state.flags, [FLAG_COERCED(npcId)]: true, [FLAG_INFAMY]: infamy, [affKey]: 0 },
    },
    events: [...events, { type: 'NPC_COERCED', npcId, approach, gold: def.stealGold, itemIds: Object.keys(def.stealItems), aff: -flagNum(state.flags, affKey), infamy }],
  }
}

function doStoryChoice(state: GameState, choiceId: string): R {
  const scene = currentStoryScene(state)
  const choice = findStoryChoice(state, choiceId)
  if (choice === undefined) return err('STORY_CHOICE_UNAVAILABLE')
  // System Layer hard-lock: the System pick is a one-time boot decision.
  if (typeof choice.effects?.systemId === 'string' && state.systemId != null) {
    return err('STORY_CHOICE_UNAVAILABLE')
  }
  const events: GameEvent[] = []
  state = spendDay(state, events)
  let s = applyStoryEffects(state, choice)
  const chosen = choice.effects?.systemId
  if (typeof chosen === 'string') {
    s = { ...s, systemId: chosen }
    events.push({ type: 'SYSTEM_CHOSEN', systemId: chosen })
  }
  if (choice.final === true) {
    s = { ...s, flags: { ...s.flags, story_ending: resolveStoryEnding(s, choiceId) } }
  }
  // T09 (canon §4, beat C6): pressing on the System's origin gets the authored dodge.
  if (choiceId === 'ask_system_origin' && systemIsActive(state)) {
    s = { ...s, systemQueue: queuePush(s.systemQueue ?? [], 'sys_dodge') }
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
  // T14/canon §3: the System announces every loaded quest while it is active,
  // telling the host the first step's objective — the announcement must be
  // actionable, not just a title and deadline.
  const step0 = def.steps[0]
  const systemQueue = systemIsActive(state)
    ? queuePush(state.systemQueue ?? [], 'sys_quest_loaded', {
        quest: def.nameVi,
        questEn: def.nameEn,
        days: def.deadlineDays ?? 0,
        objective: step0?.descVi ?? '',
        objectiveEn: step0?.descEn ?? '',
      })
    : state.systemQueue
  return { ok: true, state: { ...s, systemQueue }, events: [{ type: 'QUEST_ACCEPTED', questId }] }
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
  const flags = { ...state.flags, [`quest_${questId}_${FLAG_QUEST_DONE}`]: true }
  if (def.storySceneNextId !== undefined) flags.story_scene = def.storySceneNextId
  // World completion is an inspectable regional outcome; callers can map this
  // flag to danger/content without mutating the location definition.
  if (def.deadlineDays !== undefined) flags[`world_${questId}_cleared`] = true
  const s: GameState = {
    ...state,
    quests: { ...state.quests, [questId]: { status: 'completed', step: stepIdx } },
    flags,
    player: {
      ...state.player,
      gold: state.player.gold + def.rewardGold,
      // System Layer: system quests may pay spirit stones (authored quests
      // never set the field, so this is a no-op for them).
      spiritStones: (state.player.spiritStones ?? 0) + (def.rewardSpiritStones ?? 0),
    },
    inventory,
  }
  // T14/canon §3: reward reports never misstate the amount (canon §8).
  const rewardPartsVi: string[] = []
  const rewardPartsEn: string[] = []
  if (def.rewardGold > 0) {
    rewardPartsVi.push(`${def.rewardGold} vàng`)
    rewardPartsEn.push(`${def.rewardGold} gold`)
  }
  for (const [itemId, qty] of Object.entries(def.rewardItems)) {
    const item = getItem(itemId)
    rewardPartsVi.push(`${item?.nameVi ?? itemId} ×${qty}`)
    rewardPartsEn.push(`${item?.nameEn ?? itemId} ×${qty}`)
  }
  if ((def.rewardSpiritStones ?? 0) > 0) {
    rewardPartsVi.push(`${def.rewardSpiritStones} linh thạch`)
    rewardPartsEn.push(`${def.rewardSpiritStones} spirit stones`)
  }
  const systemQueue = systemIsActive(state)
    ? queuePush(state.systemQueue ?? [], 'sys_reward', { reward: rewardPartsVi.join(', '), rewardEn: rewardPartsEn.join(', ') })
    : state.systemQueue
  return {
    ok: true,
    state: { ...s, systemQueue },
    events: [{ type: 'QUEST_COMPLETED', questId, rewardGold: def.rewardGold }],
  }
}

export function totalInventoryUnits(state: GameState): number {
  return totalUnits(state.inventory)
}

export function seedFingerprint(seed: string): number {
  return hashSeed(seed) % 9973
}
