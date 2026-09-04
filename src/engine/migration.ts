import { GAME_STATE_VERSION } from './constants'
import { GameStateSchema } from './schema'
import type { GameState } from './types'

/** Single-step migration. Each entry upgrades a save from version N to N+1.
 *  The chain is walked in order; the final result is returned to the loader
 *  for schema validation. To add a new version: append a step, then bump
 *  `GAME_STATE_VERSION`. */
type MigrationStep = (raw: Record<string, unknown>) => Record<string, unknown>

// v0 → v1: pre-RPG saves had no `version` field at all. Bumping the stamp is
// the entire upgrade; missing player-RPG fields receive schema defaults on parse.
const upgradeV0toV1: MigrationStep = (raw) => ({ ...raw, version: 1 })

const MIGRATION_CHAIN: ReadonlyArray<MigrationStep> = [upgradeV0toV1]

/** Game-state save migration. Older saves are upgraded step-by-step; the
 *  loader calls `migrate(raw)` before validation, so a fresh save today can
 *  become the older shape tomorrow without a forced wipe. */
export function migrate(raw: unknown): Record<string, unknown> {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('migrate: save data must be an object')
  }
  let record = raw as Record<string, unknown>
  const version = typeof record.version === 'number' ? record.version : 0
  if (version > GAME_STATE_VERSION) {
    throw new Error(
      `migrate: save version ${String(version)} is newer than supported (${String(GAME_STATE_VERSION)})`,
    )
  }
  // Walk the chain forward from the save's current version. A save at the
  // current version skips the loop; a v0 save runs every step.
  const startIndex = Math.max(0, version - 0)
  for (let index = startIndex; index < MIGRATION_CHAIN.length; index += 1) {
    record = MIGRATION_CHAIN[index]!(record)
  }
  if ((record.version as number | undefined) !== GAME_STATE_VERSION) {
    record = { ...record, version: GAME_STATE_VERSION }
  }
  return record
}

export function migrateGameState(raw: unknown): GameState {
  // Parse through the schema after migration so callers always receive a fully
  // validated GameState (with defaults applied), not an unsafe cast. The
  // `satisfies` clause here is the compile-time contract: if the schema
  // drifts from the GameState type, this line breaks the build instead of
  // silently widening at runtime.
  return GameStateSchema.parse(migrate(raw)) satisfies GameState
}