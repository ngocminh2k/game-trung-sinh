import { create } from 'zustand'
import { applyAction } from './reducer'
import { DEFAULT_SEED, newGame } from './constants'
import type { Action, GameEvent, GameState } from './types'

export interface GameStoreState {
  state: GameState
  lastEvents: GameEvent[]
  dispatch: (action: Action) => void
  reset: (seed?: string) => void
}

export const useGameStore = create<GameStoreState>((set) => ({
  state: newGame(DEFAULT_SEED),
  lastEvents: [],
  dispatch: (action) =>
    set((prev) => {
      const result = applyAction(prev.state, action)
      return { state: result.state, lastEvents: result.events }
    }),
  reset: (seed) =>
    set(() => ({
      state: newGame(seed ?? DEFAULT_SEED),
      lastEvents: [],
    })),
}))
