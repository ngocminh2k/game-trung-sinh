# S02 — State + schema + QuestDef fields

> Self-contained. Runs AFTER x20 T12+T13 merged green.

## Objective

Add `systemId` to `GameState` (types + Zod schema, save-compatible) and extend the
quest contract with the System-Layer fields (`requiredSystemId`, `difficulty`,
`giverNpcId` nullable).

## Files you own (exclusive)

- `src/engine/types.ts`  (only: `systemId` on GameState)
- `src/engine/schema.ts` (only: `systemId` + quest schema fields)
- `src/engine/content-types.ts` (only: `QuestDef` fields)
- `test/system-schema.test.ts` (new)

Forbidden: reducer.ts, quests.ts, content/index.ts, items.ts, story.ts, everything else.
NOTE: `types.ts` also carries the `Action` union — someone else (S05) owns that part;
do not edit the `Action`/`GameEvent` unions here.

## Current context (verified)

- `GameState` already has `rememberedNames?`, `companionId?`, `systemQueue?`
  (`types.ts` ~lines 73–80, added by x20 T02). Add `systemId` next to them.
- `GameStateSchema` already defaults those three (`schema.ts`); add `systemId` the same way.
- `QuestDef` (`content-types.ts` ~line 265): `giverNpcId: string` currently. Change to
  `giverNpcId: string | null` and add optional `requiredSystemId?: string`,
  `difficulty?: number` (1–10, default 5).
- `QuestDefSchema` (`schema.ts`): make `giverNpcId` `z.string().nullable()` and add the
  two optional fields (`requiredSystemId: z.string().min(1).optional()`,
  `difficulty: z.number().int().min(1).max(10).optional()`).

## Do this

```ts
// types.ts — GameState:
/** Chosen System id (system-defs). null before boot; locked once set. */
systemId?: string | null

// schema.ts — GameStateSchema:
systemId: z.string().nullable().default(null)
```

- `giverNpcId: z.string().nullable()` — REQUIRED key must be present (explicit null for
  system quests), so existing authored quests still pass unchanged.
- Add `rewardSpiritStones?: number` (non-negative, default 0) on `QuestDef` +
  schema too — the S05 turn-in helper pays it.

## Acceptance criteria

- Old save without `systemId` parses → `null` (add to `test/system-schema.test.ts`,
  reuse the pattern from `test/economy.test.ts` lines ~80–89).
- Authored quests (all existing `giverNpcId` strings) still parse + validate.
- A system-style quest with `giverNpcId: null` + `requiredSystemId` parses.

## Verification

```powershell
npx vitest run test/system-schema.test.ts test/economy.test.ts
npm run typecheck
```

## Handoff

Files touched, commands+results, next action (`S03`).