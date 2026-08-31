# S03 — System quest pool (authored data)

> Self-contained. Runs AFTER S01+S02 land (they give you `SystemId` and the
> `QuestDef` fields). Uses only data-shape context, no engine internals.

## Objective

Author the frozen quest pool **`q_sys_*`** — 5–8 quests per System, 50+ total.
Hard, high-reward, deadline-driven, `secret`, and **never** story-propelling.

## Files you own (exclusive)

- `src/content/system-quests.ts` (new)
- `test/system-quests.test.ts` (new)

Forbidden: `quests.ts` (authored pool), `content/index.ts` (S04 merges),
`items.ts`, `story.ts`, reducer, UI.

## Quest shape (S02 gives you the fields)

```ts
import type { QuestDef } from '../engine/content-types'

export const SYSTEM_QUESTS: QuestDef[] = [
  {
    id: 'q_sys_battle_01', requiredSystemId: 'sys_battle',
    giverNpcId: null,                 // REQUIRED null, else validation fails (S04)
    nameVi: '…', nameEn: '…',
    descVi: '…', descEn: '…',
    requiredItems: {},
    requiredFlags: [],
    difficulty: 8,                    // 1–10
    rewardGold: 60,                   // must be inside sys_battle rewardBudget
    rewardItems: { beast_fang: 3 },   // item id inside that budget itemPool
    rewardSpiritStones: 0,
    deadlineDays: 3,
    secret: true,
    steps: [
      { id: 'step_1', descVi: '…', descEn: '…', isTurnInStep: true },
    ],
  },
  // …
]
```

## Rules (validation in S04 will hard-enforce these)

- id prefix `q_sys_<system>_<nn>`, system ∈ the 10 `SystemId`s.
- `giverNpcId: null`, **NO** `storySceneNextId` (never push the main plot),
  no `effects` on flags `branch`/`story_*`.
- `rewardGold` within that system's `[minGold,maxGold]`; every `rewardItems` id inside
  that system's `itemPool`; `rewardSpiritStones` within `[min,max]`.
- `deadlineDays` 1–3; `secret: true`; `requiredItems: {}` declared.
- ≥ 5 quests per system → ≥ 50 total (cap 8/system).

## Reference

Pool ideas + reward ids per system: `../S01-reference-data.md` (battle/alchemy/merchant/
lottery/explorer/assassin/healer/artisan/scholar/void). `itemPool` ids there are real.

## Do this

Author `SYSTEM_QUESTS` (50+ records). Write the test to assert:
counts per system ≥5; total ≥50; id prefix+unique; `giverNpcId === null`; no
`storySceneNextId`; rewards within budget (import `SYSTEMS` from `./system-defs` and
`ITEMS` from `../content/items` inside the TEST only).

## Verification

```powershell
npx vitest run test/system-quests.test.ts
npm run typecheck
```

## Handoff

Files touched, commands+results, next action (`S04`).