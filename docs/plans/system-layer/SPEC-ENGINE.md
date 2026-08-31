# SPEC (engines part) — Engine layer

## 3. Engine layer

### 3.1 `src/engine/system-runtime.ts` (new — pure functions, no rng, no Date)

```ts
import { SYSTEMS, systemById } from '../content/system-defs'
import type { QuestDef } from './content-types'
import type { GameState } from './types'

export function activeSystem(state: { systemId?: string | null }): SystemDef | null
export function canChooseSystem(state: GameState, systemId: string): boolean
export function systemQuestsFor(state: GameState): QuestDef[]
export function isSystemQuest(def: QuestDef): boolean
export function budgetOk(def: QuestDef, system: SystemDef): boolean
```

- `systemQuestsFor(state)` filters the combined registry (`getAllQuests()` =
  base + SYSTEM_QUESTS) to entries whose `requiredSystemId` matches
  `activeSystem(state)?.id`, and also returns quests already `active` in
  `state.quests{}` so the UI shows progress.

### 3.2 Quest engine (`src/engine/quests.ts`) — small additive changes; old quests untouched

- `isQuestUnlocked(state, id)`: if `def.requiredSystemId` is set, the quest unlocks
  only when `state.systemId === def.requiredSystemId` (unless already active).
- `canAcceptQuest(state, id)`: if `def.requiredSystemId` is set, skip the NPC/location
  check (`NOT_AT_LOCATION`); require only the system match + `requiredFlags`.
- `canCompleteQuest(state, id)`: if `def.requiredSystemId` is set, skip the location
  gate (turn-in happens from the System panel). Keep the existing deadline-expiry check.
- `tickQuestSteps` / `advanceIfReady` / `questStatus`: **unchanged**.

### 3.3 Reducer (`src/engine/reducer.ts`) — runs AFTER x20 T12

Two new actions in the `Action` union (`src/engine/types.ts`) + one new event:

- `{ kind: 'system_accept_quest'; questId }` — reuses the existing accept logic
  (deadline flags + `quests{}` entry) through the widened `canAcceptQuest`;
  emits existing `QUEST_ACCEPTED`.
- `{ kind: 'system_turn_in_quest'; questId }` — reuses the existing complete logic
  (consume final-step items, grant gold/items) plus optional `rewardSpiritStones`
  (new optional field on QuestDef). `storySceneNextId` forbidden.
- New event `{ type: 'SYSTEM_CHOSEN'; systemId }` (from `doStoryChoice`).

`doStoryChoice` addition (after T12):

```ts
const chosen = choice.effects?.systemId
if (typeof chosen === 'string') {
  if (state.systemId != null) return err('STORY_CHOICE_UNAVAILABLE') // hard-lock
  s = { ...s, systemId: chosen }
  events.push({ type: 'SYSTEM_CHOSEN', systemId: chosen })
}
```

### 3.4 Boot — the system pick screen

- New scene `scene_system_selection` (chapter 0) in `src/content/story.ts`:
  intro text + **10 choices** (one per system) + `refuse_all` (chooses no System).
  Each system choice: `effects: { systemId: 'sys_battle' }`,
  `nextSceneId: 'letter_at_dawn'`.
- Scene `scene_transmigration` (existing, from x20 T09): change the 4 `accept_*`
  choices' `nextSceneId` from `letter_at_dawn` → `scene_system_selection`;
  keep `refuse_system` → `letter_at_dawn` (rootless / no System).
- UI renders this scene only when `state.systemId === null` and `!state.flags.systemRefused`.