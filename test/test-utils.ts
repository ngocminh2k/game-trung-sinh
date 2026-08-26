import { applyAction, findPath, newGame, playerPosition } from '../src/engine'
import type { Action, GameEvent, GameState } from '../src/engine'

export function runScript(
  seed: string,
  actions: Action[],
): { states: GameState[]; events: GameEvent[] } {
  let state = newGame(seed)
  const states: GameState[] = [state]
  const allEvents: GameEvent[] = []
  for (const action of actions) {
    const result = applyAction(state, action)
    state = result.state
    states.push(state)
    allEvents.push(...result.events)
  }
  return { states, events: allEvents }
}

export function navTo(state: GameState, locationId: string): GameState {
  if (state.player.locationId === locationId) return state
  const path = findPath(state.player.posX, state.player.posY, locationId, state.player.locationId)
  if (path === null) throw new Error(`no path to ${locationId}`)
  for (const dir of path) {
    const result = applyAction(state, { kind: 'move', direction: dir })
    if (result.state.terminal) return result.state
    state = result.state
  }
  return state
}

export function moveTo(state: GameState, locationId: string): GameState {
  const start = playerPosition(state.player.locationId)
  void start
  return navTo(state, locationId)
}

export function lastEvent(events: readonly GameEvent[], type: string): GameEvent | undefined {
  return [...events].reverse().find((e) => e.type === type)
}

export function hasError(events: readonly GameEvent[], code: string): boolean {
  return events.some((e) => e.type === 'ERROR' && e.code === code)
}
