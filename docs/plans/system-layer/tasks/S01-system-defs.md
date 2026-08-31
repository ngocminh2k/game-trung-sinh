# S01 — System definitions (data)

> Self-contained. Runs AFTER x20 T12+T13 merged green. This file and
> `../S01-reference-data.md` are all the context you need.

## Objective

Create the 10 System definitions (`SystemDef` data records) — the single source of
truth for the System Layer. No gameplay logic here, no state.

## Files you own (exclusive)

- `src/content/system-defs.ts` (new)
- `test/system-defs.test.ts` (new)

Forbidden: every other file. In particular `src/content/index.ts` (owned by S04),
`src/engine/*` (S02/S04/S05), `src/content/system-messages.ts` (existing, keep as-is).

## Do this

1. Create `src/content/system-defs.ts` with:

```ts
export type SystemId =
  | 'sys_battle' | 'sys_alchemy' | 'sys_merchant' | 'sys_lottery' | 'sys_explorer'
  | 'sys_assassin' | 'sys_healer' | 'sys_artisan' | 'sys_scholar' | 'sys_void'

export interface SystemDef {
  id: SystemId
  order: number                          // 1..10, strictly ascending
  nameVi: string; nameEn: string
  headerVi: string; headerEn: string     // '【Hệ Thống Chiến Đấu】' / '【Battle System】'
  personalityVi: string; personalityEn: string
  questPoolId: string
  rewardBudget: {
    minGold: number; maxGold: number
    minSpiritStones: number; maxSpiritStones: number
    itemPool: string[]                   // real ids from src/content/items.ts
  }
}
export const SYSTEMS: SystemDef[]        // EXACTLY 10
export function systemById(id: string): SystemDef | undefined
```

2. Copy the 10 concrete records from `../S01-reference-data.md`. Keep ids/order/budget
   exactly; wording may be polished as long as vi/en pair is present.

3. **Important constraint**: `system-defs.ts` must NOT import any authored module
   (`src/content/story|npcs|locations|endings-data|chapters|quests`) — type-only imports
   from `src/engine/content-types` are fine. `itemPool` ids are plain strings; the test
   validates them against `ITEMS` at test time (import `ITEMS` inside the test only).

## Acceptance criteria

- `SYSTEMS.length === 10`; ids unique; `order` is exactly 1..10.
- Every `itemPool` id exists in `src/content/items.ts` (import `ITEMS` in the test).
- Every record has non-empty vi/en for name, header, personality.

## Verification (paste real output into handoff)

```powershell
npx vitest run test/system-defs.test.ts
npm run typecheck
```

## Handoff

State: files touched, commands+results, one next action (`T12 reviewed → run S02`).