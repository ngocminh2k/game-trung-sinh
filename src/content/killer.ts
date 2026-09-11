import type { CoercionDef } from '../engine/content-types'

/** Cưỡng đoạt (Issue #19) — targets for the Killer player type: NPCs whose
 *  temperament is the player's opposite (the timid trader, the by-the-book
 *  storehouse keeper). The reducer treats these as pure data: the plunder
 *  outcome is fixed, never RNG, and one-shot per NPC per run (guarded by the
 *  `coerced_<npcId>` flag), so the loop cannot be farmed for infinite gold.
 *
 *  Art note (GDD §6.7): reuses the NPC's existing portrait; the coercion beat
 *  itself renders as an authored text panel, so no new still-life is required. */
export const COERCIONS: CoercionDef[] = [
  { npcId: 'n_merchant_bao', stealGold: 90, stealItems: { spirit_herb: 2, plum_qi_wine: 1 }, backOffAff: 2 },
  { npcId: 'n_keeper_anh', stealGold: 45, stealItems: { cold_iron_ore: 1, old_manual: 1 }, backOffAff: 1 },
]

export function coercionFor(npcId: string): CoercionDef | undefined {
  return COERCIONS.find((entry) => entry.npcId === npcId)
}
