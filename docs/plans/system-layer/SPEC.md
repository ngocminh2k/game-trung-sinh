# SPEC — System Layer Architecture (detailed)

## 1. Architectural principles

1. **The System is NOT an NPC** (keeps `expansion-x20/contracts/story-canon.md` §2):
   no id in `npc-registry`, no position on the map, no `talk`. It speaks only through
   its header frame (e.g. `【Hệ Thống Chiến Đấu】` / `【Battle System】`) and a dedicated
   UI panel.
2. **System core is scenario-agnostic**: core files must NOT import authored
   Scenario-I content (`src/content/story.ts`, `npcs.ts`, `locations.ts`,
   `endings-data.ts`, `chapters.ts`, `quests.ts`). Connections to the world happen
   only through **id + state**, never through objects. This is the answer to
   "new story later, keep the system" (enforced by test, §6).
3. **Determinism is preserved**: every gameplay decision (accept / turn-in / reward)
   is pure and made by the reducer. AI only **suggests** from the frozen pool
   (exactly like `src/ai/narration.ts` `Suggestion`) — it never writes state directly.
4. **No story propulsion**: system quests are FORBIDDEN from setting `storySceneNextId`,
   from touching `branch`/`story_*` flags, and from affecting endings. Validation
   enforces this, it is not a soft convention.
5. **Save compatibility**: every new field gets `.default()` in the Zod schema
   (same pattern as x20 T02); old saves parse cleanly.

## 2. Data layer

### 2.1 `src/content/system-defs.ts` (new — pure data)

```ts
export type SystemId =
  | 'sys_battle' | 'sys_alchemy' | 'sys_merchant' | 'sys_lottery' | 'sys_explorer'
  | 'sys_assassin' | 'sys_healer' | 'sys_artisan' | 'sys_scholar' | 'sys_void'

export interface SystemDef {
  id: SystemId
  order: number                          // display order in the pick screen
  nameVi: string; nameEn: string
  headerVi: string; headerEn: string     // '【Hệ Thống Chiến Đấu】' / '【Battle System】'
  personalityVi: string; personalityEn: string  // 1-line persona for LLM + fallback UX
  questPoolId: string                    // pool bucket (two systems may share a pool)
  rewardBudget: {
    minGold: number; maxGold: number
    minSpiritStones: number; maxSpiritStones: number
    itemPool: string[]                   // item ids from contracts/item-ids.md (42 old + 43 new)
  }
}
export const SYSTEMS: SystemDef[]        // exactly 10
export function systemById(id: string): SystemDef | undefined
```

- Each kind is a **data record, not a code module**. Adding kind #11 = adding one object.
- `questPoolId` is a separate bucket so two systems can later share a quest pool.

### 2.2 System quests — frozen pool

- New `src/content/system-quests.ts` exporting `SYSTEM_QUESTS: QuestDef[]` using the
  existing `QuestDef` shape plus one new field `requiredSystemId`. They are merged into
  the shared registry so all existing lookups/validation keep working:
  `QUESTS = [...baseQuests, ...SYSTEM_QUESTS]` (change lives in `content/index.ts`,
  handled by S04 after T12).
- ID scheme: `q_sys_<system>_<nn>`, e.g. `q_sys_battle_01`. One quest:

```ts
{ id: 'q_sys_battle_01', requiredSystemId: 'sys_battle',
  giverNpcId: null,                 // REQUIRED null when requiredSystemId is set
  nameVi: '...', nameEn: '...', descVi: '...', descEn: '...',
  requiredItems: {}, requiredFlags: [],
  difficulty: 8,                    // new field 1–10, shown as "difficulty"
  rewardGold: 60, rewardItems: { beast_fang: 3 },
  deadlineDays: 3, secret: true,
  steps: [ { id: 'kill_wraith', descVi: '...', descEn: '...', isTurnInStep: true } ] }
```

- New fields on `QuestDef` (`src/engine/content-types.ts`) and `QuestDefSchema`
  (`src/engine/schema.ts`):
  - `requiredSystemId?: string`
  - `giverNpcId: string | null`   (currently `string` — becomes nullable)
  - `difficulty?: number`         (1–10, default 5)
- Pool size: **5–8 quests per system** → **50–80 total**. NO "every NPC must be
  covered" rule here (that is the authored-quest rule from x20 T04).

### 2.3 State (`src/engine/types.ts` + `src/engine/schema.ts`)

```ts
// types.ts — GameState, next to systemQueue:
/** Chosen System id (system-defs). null before boot; locked once set. */
systemId?: string | null

// schema.ts — with default() so old saves stay valid:
systemId: z.string().nullable().default(null)
```

### 2.4 i18n (`src/i18n/vi.ts` + `src/i18n/en.ts`)

Add key set under `system.*` — both files, same keys (i18n parity test must stay green):
`panelTitle`, `chatPlaceholder`, `acceptQuest`, `turnIn`, `difficulty`, `noSystem`,
`poolHeader`, `chatFallback`, `chooseOne`, `locked`.