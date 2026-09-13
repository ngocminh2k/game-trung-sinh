import { create } from 'zustand'
import { applyAction } from './reducer'
import { DEFAULT_SEED, newGame } from './constants'
import type { Action, GameEvent, GameState } from './types'

export interface GameStoreState {
  state: GameState
  lastEvents: GameEvent[]
  dispatch: (action: Action) => void
  /** Starts a fresh life. `legacyCause` mirrors the restart action's Positive
   *  Failure inheritance — omit it and the run inherits nothing, so resetting
   *  straight from a dead state does NOT silently gift the fallen life's point. */
  reset: (seed?: string, legacyCause?: string | null) => void
}

export const useGameStore = create<GameStoreState>((set) => ({
  state: newGame(DEFAULT_SEED),
  lastEvents: [],
  dispatch: (action) =>
    set((prev) => {
      const result = applyAction(prev.state, action)
      return { state: result.state, lastEvents: result.events }
    }),
  reset: (seed, legacyCause) =>
    set(() => ({
      state: newGame(seed ?? DEFAULT_SEED, { legacyCause }),
      lastEvents: [],
    })),
}))
