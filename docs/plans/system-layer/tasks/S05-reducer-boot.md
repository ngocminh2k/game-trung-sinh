# S05 — Reducer + runtime + boot scene

> Self-contained. Runs AFTER S02 (fields) and S04 (quest gates). Creates the engine
> runtime helpers and wires the boot choice + accept/turn-in actions.

## Objective

1. New file `src/engine/system-runtime.ts` (pure helpers).
2. Two new `Action`s (`system_accept_quest`, `system_turn_in_quest`) + one
   `GameEvent` (`SYSTEM_CHOSEN`).
3. `doStoryChoice` hard-lock sets `state.systemId` once.
4. New boot scene `scene_system_selection` in `src/content/story.ts` + rewire
   `scene_transmigration`'s `accept_*` choices into it.

## Files you own (exclusive)

- `src/engine/system-runtime.ts` (new)
- `src/engine/reducer.ts` (accept/turn-in/doStoryChoice — AFTER x20 T12)
- `src/engine/types.ts` (Action + GameEvent unions ONLY)
- `src/engine/index.ts` (export the new helpers if needed)
- `src/content/story.ts` (boot scenes)
- `test/system-boot.test.ts` (new)

Forbidden: changing `newGame`/`constants.ts` defaults, `schema.ts`/save shape,
story scene ids used elsewhere (keep `letter_at_dawn`, keep the 4 existing
`accept_*`/`refuse_system` ids).

## Do this

### 1. `src/engine/system-runtime.ts` (pure)

```ts
export function activeSystem(state: GameState): SystemDef | null           // systemById(state.systemId)
export function canChooseSystem(state: GameState, systemId: string): boolean  // only when state.systemId == null
export function systemQuestsFor(state: GameState): QuestDef[]              // merged registry, requiredSystemId === active, includes active-in-quests{ }
export function isSystemQuest(def: QuestDef): boolean                      // def.requiredSystemId !== undefined
export function budgetOk(def: QuestDef, system: SystemDef): boolean
```
No rng, no Date, no `Math.random`. Import `SYSTEMS/systemById` from content/system-defs
(that module is NOT authored content — allowed).

### 2. `src/engine/types.ts` (unions)

```ts
// Action
| { kind: 'system_accept_quest'; questId: string }
| { kind: 'system_turn_in_quest'; questId: string }
// GameEvent
| { type: 'SYSTEM_CHOSEN'; systemId: string }
```

### 3. `src/engine/reducer.ts`

- Refactor `doAcceptQuest`/`doCompleteQuest` (lines ~960/979) into shared cores that the
  existing paths AND the new ones call. Keep their current events.
- New cases: `system_accept_quest` → call the accept core (through widened
  `canAcceptQuest`); `system_turn_in_quest` → call the complete core via a
  `canCompleteQuest`-like check for system quests + pay `rewardSpiritStones`.
- `doStoryChoice`: after `applyStoryEffects`, if `choice.effects?.systemId` is a string →
  **hard-lock**: `if (state.systemId != null) return err('STORY_CHOICE_UNAVAILABLE')`,
  else set `systemId` and push `SYSTEM_CHOSEN`.

### 4. `src/content/story.ts` — boot

- Add `scene_system_selection` (chapter 0): intro + **10 choices** (one per System,
  `effects: { systemId: 'sys_<id>' }`, `nextSceneId: 'letter_at_dawn'`) + `refuse_all`
  choice (`effects: { system_refused: true }`, `nextSceneId: 'letter_at_dawn'`).
- In `scene_transmigration` (existing): change the 4 `accept_*` choices'
  `nextSceneId` → `scene_system_selection`; leave `refuse_system` → `letter_at_dawn`.
- Keep the same vi/en fields; follow existing story-scene style.

## Acceptance

- Choosing a System sets `systemId` once; a second System choice → `STORY_CHOICE_UNAVAILABLE`.
- Refusing (rootless) keeps `systemId` null forever; no `SYSTEM_CHOSEN`.
- System quest accept/turn-in works without being at any NPC/location; rewards include
  `rewardSpiritStones` when authored.

## Verification

```powershell
npx vitest run test/system-boot.test.ts
npm run typecheck
npm run lint
```

## Handoff

Files touched, commands+results, next action (`S06`).