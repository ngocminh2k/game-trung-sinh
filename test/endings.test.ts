import { describe, expect, it } from 'vitest'
import { MAX_STAGE, applyAction, currentBeat, newGame } from '../src/engine'
import type { GameState } from '../src/engine'
import { navTo } from './test-utils'

const SEED = 'reachability'

function sellAllHerbs(state: GameState): GameState {
  while ((state.inventory['spirit_herb'] ?? 0) > 0 && !state.terminal) {
    const result = applyAction(state, { kind: 'sell', itemId: 'spirit_herb' })
    if (result.events.some((e) => e.type === 'ERROR')) break
    state = result.state
  }
  return state
}

function gatherAndSellCycle(state: GameState): GameState {
  if (state.player.locationId !== 'herb_field') state = navTo(state, 'herb_field')
  for (let i = 0; i < 4; i++) {
    const result = applyAction(state, { kind: 'gather' })
    if (result.events.some((e) => e.type === 'ERROR')) break
    state = result.state
  }
  state = navTo(state, 'market')
  return sellAllHerbs(state)
}

function completeHerbQuest(state: GameState): GameState {
  if ((state.inventory['spirit_herb'] ?? 0) < 3) {
    state = navTo(state, 'herb_field')
    let guard = 0
    while ((state.inventory['spirit_herb'] ?? 0) < 3 && guard < 20 && !state.terminal) {
      state = applyAction(state, { kind: 'gather' }).state
      guard += 1
    }
  }
  state = navTo(state, 'village')
  const accepted = applyAction(state, { kind: 'accept_quest', questId: 'q_herb_delivery' })
  expect(accepted.events.some((e) => e.type === 'QUEST_ACCEPTED')).toBe(true)
  state = accepted.state
  const completed = applyAction(state, { kind: 'complete_quest', questId: 'q_herb_delivery' })
  expect(completed.events.some((e) => e.type === 'QUEST_COMPLETED')).toBe(true)
  return completed.state
}

function obtainManual(state: GameState): GameState {
  state = completeHerbQuest(state)
  state = gatherAndSellCycle(state)
  if (state.player.gold < 40) {
    state = gatherAndSellCycle(state)
  }
  state = navTo(state, 'market')
  const buy = applyAction(state, { kind: 'buy', itemId: 'warding_talisman' })
  expect(buy.events.some((e) => e.type === 'BOUGHT')).toBe(true)
  state = buy.state
  state = navTo(state, 'sealed_cave')
  expect(state.flags['visitedCaveWarded']).toBe(true)
  state = navTo(state, 'sect')
  state = applyAction(state, { kind: 'accept_quest', questId: 'q_sealed_cave' }).state
  const done = applyAction(state, { kind: 'complete_quest', questId: 'q_sealed_cave' })
  expect(done.events.some((e) => e.type === 'QUEST_COMPLETED')).toBe(true)
  return done.state
}

describe('ending reachability', () => {
  it('tragic death ending is reachable via the cursed rift', () => {
    let state = newGame(SEED)
    state = navTo(state, 'cursed_rift')
    let guard = 0
    while (state.player.alive && guard < 25) {
      state = applyAction(state, { kind: 'move', direction: 'west' }).state
      if (!state.player.alive) break
      state = applyAction(state, { kind: 'move', direction: 'east' }).state
      guard += 1
    }
    expect(state.terminal).toBe(true)
    expect(state.endingId).toBe('tragic_death')
  })

  it('ascension ending is reachable through cave quest and training', () => {
    let state = newGame(SEED)
    state = obtainManual(state)
    expect((state.inventory['old_manual'] ?? 0)).toBe(1)
    let guard = 0
    while (!state.terminal && state.player.stage < MAX_STAGE && guard < 600) {
      if (state.player.qi < 10 || state.player.hp <= 12) {
        state = applyAction(state, { kind: 'rest' }).state
      } else {
        state = applyAction(state, { kind: 'train' }).state
      }
      guard += 1
    }
    expect(state.player.stage).toBe(MAX_STAGE)
    expect(state.terminal).toBe(true)
    expect(state.endingId).toBe('ascension')
  })

  it('merchant tycoon ending is reachable by trading', () => {
    let state = newGame(SEED)
    let guard = 0
    while (!state.terminal && state.player.gold < 600 && guard < 400) {
      state = gatherAndSellCycle(state)
      guard += 1
    }
    expect(state.player.gold).toBeGreaterThanOrEqual(600)
    expect(state.terminal).toBe(true)
    expect(state.endingId).toBe('merchant_tycoon')
  })

  it('quiet harmony ending is reachable by resting to day 30 with savings', () => {
    let state = newGame(SEED)
    let gold = 0
    let guard = 0
    while (!state.terminal && guard < 300) {
      if (gold >= 200) break
      state = gatherAndSellCycle(state)
      gold = state.player.gold
      guard += 1
    }
    expect(gold).toBeGreaterThanOrEqual(200)
    guard = 0
    while (!state.terminal && state.day < 30 && guard < 60) {
      state = applyAction(state, { kind: 'rest' }).state
      guard += 1
    }
    expect(state.day).toBeGreaterThanOrEqual(30)
    expect(state.terminal).toBe(true)
    expect(state.endingId).toBe('quiet_harmony')
  })

  it('destined windfall ending is reachable via daily draws', () => {
    let state = newGame(SEED)
    let guard = 0
    while (!state.terminal && state.flags['grandPrizeWon'] !== true && guard < 2000) {
      if (state.player.locationId !== 'market') state = navTo(state, 'market')
      if (state.player.gold < 10) {
        state = gatherAndSellCycle(state)
        continue
      }
      if (state.lastLotteryDay === state.day) {
        state = applyAction(state, { kind: 'rest' }).state
        continue
      }
      state = applyAction(state, { kind: 'draw_lottery' }).state
      guard += 1
    }
    expect(state.flags['grandPrizeWon']).toBe(true)
    expect(state.terminal).toBe(true)
    expect(state.endingId).toBe('destined_windfall')
  })
})

describe('beat progression smoke', () => {
  it('starts at the arrival beat and advances after moving', () => {
    let state = newGame('beats-smoke')
    expect(currentBeat(state).id).toBe('b_arrival')
    state = applyAction(state, { kind: 'move', direction: 'west' }).state
    expect(currentBeat(state).id).toBe('b_first_steps')
  })
})
