// ponytail: enum-style list of game flag keys for refactors and exhaustiveness checks.
// Upgrade path: derive from schema/zod once a flag schema exists.
// Template helpers for per-NPC / per-enemy / per-node flag keys.
// ponytail: these are derived, not stored in FLAG_KEYS; FLAG_KEYS stays the
// canonical list for refactors / exhaustiveness checks.
export const FLAG_AFF = (npcId: string): string => `aff_${npcId}`
export const FLAG_TALK = (npcId: string): string => `talk_${npcId}`
export const FLAG_AFF_GATE = (npcId: string): string => `aff_gate_${npcId}`
export const FLAG_TALK_WARN = (npcId: string): string => `talk_warn_${npcId}`
export const FLAG_DEFEATED = (enemyId: string): string => `defeated_${enemyId}`
export const FLAG_RETREATED = (enemyId: string): string => `retreated_${enemyId}`
export const FLAG_REACHED = (nodeId: string): string => `reached_${nodeId}`
// Lôi Đài + Cưỡng đoạt (Issue #19). Both record through flags so old saves keep
// validating (GameStateSchema.flags is an open union record — no schema migration).
/** Tower-climb arena progress: number of floors cleared (starts at 0). */
export const FLAG_ARENA_FLOOR = 'arena_floor'
/** Set once the arena tower is fully cleared, so the win can be announced once. */
export const FLAG_ARENA_CLEARED = 'arena_cleared'
/** One-shot guard for a NPC plunder, so a Killer cannot farm the same victim. */
export const FLAG_COERCED = (npcId: string): string => `coerced_${npcId}`
/** One-shot guard for the restraint branch: backing off once mends the
 *  relationship, backing off again buys nothing (so affection cannot be farmed). */
export const FLAG_COERCED_BACKOFF = (npcId: string): string => `backoff_${npcId}`
/** Infamy counter — number of NPCs the player has coerced/plundered. */
export const FLAG_INFAMY = 'infamy'

export const FLAG_KEYS = [
  'movedOnce',
  'story_scene',
  'night_deadline',
  'night_deadline_cleared',
  'night_forgotten',
  'village_silent',
  'storage_locked',
  'region_locked',
  'seen_cave',
  'story_bao_paid',
  'story_meihua_betrayed',
  'story_ha_bound',
  'crooked_circulation',
  'system_refused',
  'system_dodge',
  '_done',
  'defeated',
  'retreated',
  'reached',
  'arena_floor',
  'arena_cleared',
  'infamy',
  'death_cause',
] as const

export type FlagKey = (typeof FLAG_KEYS)[number]

// Named handles for the plain (non-template) keys, typed `FlagKey` so a rename
// or removal in FLAG_KEYS above fails the compile instead of drifting.
// Consumers must import these instead of destructuring FLAG_KEYS by position —
// a positional destructure silently rebinds on any insert/reorder, which is how
// the quest-completion suffix once became `visited` and deadlocked every chain.
/** Set on a node the player has already walked through. */
export const FLAG_MOVED_ONCE: FlagKey = 'movedOnce'
/** Day the current night deadline was struck. */
export const FLAG_NIGHT_DEADLINE: FlagKey = 'night_deadline'
/** Set once the night deadline has been survived or paid off. */
export const FLAG_NIGHT_DEADLINE_CLEARED: FlagKey = 'night_deadline_cleared'
/** Set when the player lets a forgotten night pass unmarked. */
export const FLAG_NIGHT_FORGOTTEN: FlagKey = 'night_forgotten'
/** Village stayed quiet — no warning raised. */
export const FLAG_VILLAGE_SILENT: FlagKey = 'village_silent'
/** Player's own storage seized. */
export const FLAG_STORAGE_LOCKED: FlagKey = 'storage_locked'
/** A region closed off to the player. */
export const FLAG_REGION_LOCKED: FlagKey = 'region_locked'
/** Cave discovered on the map. */
export const FLAG_SEEN_CAVE: FlagKey = 'seen_cave'
/** Bao's debt settled. */
export const FLAG_STORY_BAO_PAID: FlagKey = 'story_bao_paid'
/** Meihua's betrayal has happened. */
export const FLAG_STORY_MEIHUA_BETRAYED: FlagKey = 'story_meihua_betrayed'
/** The player turned the System down. */
export const FLAG_SYSTEM_REFUSED: FlagKey = 'system_refused'
/** Suffix on `quest_<questId>` — stamped by the reducer when a quest is turned in. */
export const FLAG_QUEST_DONE: FlagKey = '_done'
