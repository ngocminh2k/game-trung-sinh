import { shallow } from 'zustand/shallow'
import type { GameState } from './types'
import { useGameStore } from './store'

/** Game-domain slice used by the main GameScreen subscription. */
export interface GameSlice {
  player: GameState['player']
  flags: GameState['flags']
  encounter: GameState['encounter']
}

/**
 * Subscribe to the gameplay slice the screen renders on every frame.
 * `shallow` keeps re-renders scoped to fields that actually change,
 * so unrelated store churn (e.g. lastEvents) won't repaint the world.
 * Locale stays a prop — it lives in the React tree, not the store.
 */
export function useGameSlice(): GameSlice {
  return useGameStore(
    (s) => ({ player: s.state.player, flags: s.state.flags, encounter: s.state.encounter }),
    shallow,
  )
}
