import { GAME_STATE_VERSION } from './constants'
import { FLAG_QUEST_DONE } from '../content/flag-keys'
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

// v1 → v2 (reviewer-chain MEDIUM-1): the transient buggy quest-turn-in writer
// stamped `quest_<id>__done` (double underscore) instead of the canonical
// `quest_<id>_done` (FLAG_QUEST_DONE). Saves written by it parse fine but no
// reader ever sees the flag, so quest chains stay deadlocked forever. Rename
// legacy keys on load; on collision, done-wins (a true stamped by the buggy
// build beats a false written alongside it). The legacy suffix is composed
// from FLAG_QUEST_DONE — never the banned `__done` literal (writer tripwire:
// test/system-quest-chain.test.ts).
const LEGACY_DONE_SUFFIX = `_${FLAG_QUEST_DONE}` // '__done'
const isLegacyQuestDone = (key: string): boolean =>
  key.startsWith('quest_') && key.endsWith(LEGACY_DONE_SUFFIX)

const upgradeV1toV2: MigrationStep = (raw) => {
  const flags = raw.flags
  if (flags === null || typeof flags !== 'object' || Array.isArray(flags)) {
    return { ...raw, version: 2 }
  }
  const entries = Object.entries(flags as Record<string, unknown>)
  const renamed: Record<string, unknown> = {}
  for (const [key, value] of entries) {
    if (!isLegacyQuestDone(key)) renamed[key] = value
  }
  for (const [key, value] of entries) {
    if (isLegacyQuestDone(key)) {
      const canonical = `${key.slice(0, -LEGACY_DONE_SUFFIX.length)}${FLAG_QUEST_DONE}`
      renamed[canonical] = renamed[canonical] === true || value === true ? true : value
    }
  }
  // C3-01 / C2-01: reconcile the quest RUNTIME against the now-canonical done
  // flag. A legacy save can carry `quest_<id>_done: true` while
  // `quests[id].status` still reads `'active'`; the flag is the source of
  // truth, so a disagreeing runtime is corrected to 'completed' here.
  // Without this, readers that derive status from the runtime (objective line,
  // journal, story/system gates) resurrect a finished quest forever.
  const quests = raw['quests']
  if (quests === null || typeof quests !== 'object' || Array.isArray(quests)) {
    return { ...raw, flags: renamed, version: 2 }
  }
  const reconciled = { ...(quests as Record<string, unknown>) }
  for (const [key, value] of Object.entries(renamed)) {
    if (value !== true || !key.startsWith('quest_') || !key.endsWith(FLAG_QUEST_DONE)) continue
    const questId = key.slice('quest_'.length, -FLAG_QUEST_DONE.length)
    const rt = reconciled[questId]
    if (rt === null || typeof rt !== 'object' || Array.isArray(rt)) continue
    const runtime = rt as Record<string, unknown>
    if (runtime['status'] === 'completed') continue
    reconciled[questId] = { ...runtime, status: 'completed' }
  }
  return { ...raw, flags: renamed, quests: reconciled, version: 2 }
}

const MIGRATION_CHAIN: ReadonlyArray<MigrationStep> = [upgradeV0toV1, upgradeV1toV2]

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
  // Walk the chain forward from the save's current version: step[i] upgrades
  // i → i+1, so a save at version v resumes at index v. A save already at the
  // current version skips the loop; a v0 save runs every step.
  const startIndex = Math.max(0, version)
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