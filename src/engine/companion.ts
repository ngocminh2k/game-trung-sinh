/**
 * Companion beast helpers (T06). Pure deterministic functions — no Math.random,
 * no Date.now, no console. Companion state is stored in GameState.companionId.
 */

import type { BeastDef } from '../content/beasts'
import type { GameState } from './types'

/** Extra action slot granted per tamed companion. Applied in combat. */
export const COMPANION_EXTRA_ACTION = 1

/**
 * Whether the player can tame a given beast:
 * 1. Luck attribute meets minLuck threshold.
 * 2. The required bait item is in the inventory.
 */
export function canTame(state: GameState, beast: BeastDef): boolean {
  const luck = state.player.attrs.luck
  if (luck < beast.minLuck) return false
  const baitQty = state.inventory[beast.requiredBait] ?? 0
  return baitQty >= 1
}

/**
 * Look up the active companion's buff, or null if none is active.
 * Returns the buff shape: { kind, value }.
 */
export function companionBuff(
  companionId: string | null | undefined,
  beasts: ReadonlyArray<BeastDef>,
): { kind: string; value: number } | null {
  if (!companionId) return null
  const beast = beasts.find((b) => b.id === companionId)
  return beast ? { kind: beast.buff.kind, value: beast.buff.value } : null
}