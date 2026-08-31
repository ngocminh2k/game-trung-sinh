# S04 — Quest engine gates + registry merge + validation

> Self-contained. Runs AFTER S01–S03 land. Touches the shared registry — one owner at a time.

## Objective

1. Merge `SYSTEM_QUESTS` into the shared quest registry so existing `getQuest`/validation
   see them.
2. Open 3 quest-gate functions for System quests (no location/NPC requirement).
3. Add content-validation rules from SPEC §7.

## Files you own (exclusive)

- `src/engine/quests.ts` (only `isQuestUnlocked`, `canAcceptQuest`, `canCompleteQuest`)
- `src/content/index.ts` (registry merge + validation gates + exports)
- `test/system-engine.test.ts` (new)

Forbidden: reducer.ts, system-runtime creation (that's still S05's exports; you only need
`state.systemId` which already exists), story.ts, other content modules.

## Current context (verified)

- `src/engine/quests.ts`:
  - `isQuestUnlocked(state, id)` — currently returns `!def.secret || requiredFlags.every(...)`.
  - `canAcceptQuest(state, id)` — checks `giver` exists, `questStatus`, `isQuestUnlocked`,
    `requiredFlags`, then `state.player.locationId !== giver.locationId → NOT_AT_LOCATION`.
  - `canCompleteQuest(state, id)` — checks active, expiry (`quest_<id>_expires_day`),
    `locationId !== giver.locationId → NOT_AT_LOCATION`, `isTurnInReady`.
- `src/content/index.ts`: `export { getQuest, QUESTS } from './quests'`, plus
  `validateAllContent()` with `check(z.array(QuestDefSchema).min(1), QUESTS, 'QUESTS')`
  and cross-refs (giver exists, item ids exist). NOTE: many `QuestDef` refer to
  `giverNpcId` — the giver-exists check must skip when `requiredSystemId` is set.

## Do this

### 1. `src/engine/quests.ts`

- `isQuestUnlocked`: if `def.requiredSystemId` is set → require
  `state.systemId === def.requiredSystemId` (unless already active) **plus** existing
  secret/requiredFlags logic.
- `canAcceptQuest`: if `def.requiredSystemId` set → do NOT require `getNpc(giver)`/location;
  require the systemId match + requiredFlags. Keep everything else identical.
- `canCompleteQuest`: same — skip the location gate when `requiredSystemId` set; keep
  expiry + `isTurnInReady` checks.

### 2. `src/content/index.ts`

- Merge: `import { SYSTEM_QUESTS } from './system-quests'`; export
  `export const QUESTS = [...baseQuests, ...SYSTEM_QUESTS]` (keep the original
  `getQuest` working against the merged list — simplest: `const base = ...`, then
  build `QUESTS`, and re-export a `getQuest` that searches `QUESTS`).
- Continue re-exporting existing helpers (`getQuest` replaced by merged version).
- Add to `validateAllContent()` per SPEC §7:
  - `SYSTEMS.length === 10`, unique ids, order ascending.
  - For each quest with `requiredSystemId`: `giverNpcId === null`, no `storySceneNextId`,
    `difficulty` 1–10, `rewardGold` within owning system `[minGold,maxGold]`,
    `rewardItems` ids inside `itemPool` (or `rewardSpiritStones` within bounds).
  - Skip the "giver exists" cross-check for system quests.

## Acceptance

- Authored quests (25→150 after x20) still accept/complete at their NPC with no location
  change; System quests accept/complete with NO location requirement when `systemId` matches.
- Registry merge keeps `getQuest` working; validation gates pass for the merged array.

## Verification

```powershell
npx vitest run test/system-engine.test.ts test/content.test.ts test/quest-related.test.ts
npm run typecheck
npm run lint
```

## Handoff

Files touched, commands+results (post x20 numbers), next action (`S05`).