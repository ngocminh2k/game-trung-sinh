// Memory of Names: pure helpers over state.rememberedNames (task T10).
// The 200 erased names are the origin of the System — story canon §3.
// No DOM, no network, no RNG: deterministic engine helpers only.

export const MEMORY_TOTAL = 200
export const MEMORY_GATE = 50 // passing 50 remembered names opens the hidden ending layer

/** Minimal state slice the helpers operate on (GameState.rememberedNames, T02). */
export interface MemoryState {
  rememberedNames: string[]
}

/** Number of names currently remembered. */
export function rememberedCount(state: { rememberedNames: string[] }): number {
  return state.rememberedNames.length
}

/** Pure merge of remembered ids with new ids — deduped, order-stable, no mutation. */
export function rememberNames(state: { rememberedNames: string[] }, ids: string[]): string[] {
  return [...new Set([...state.rememberedNames, ...ids])]
}

/** Milestone tier: 0 < 50, 1 >= 50, 2 >= 100, 3 == all 200. */
export function memoryMilestone(count: number): 0 | 1 | 2 | 3 {
  if (count >= MEMORY_TOTAL) return 3
  if (count >= 100) return 2
  if (count >= MEMORY_GATE) return 1
  return 0
}
