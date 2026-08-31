# S08 — Scenario gate + E2E + full verification

> Self-contained. Final task. Two new test files + full 5-command gate.

## Objective

1. Enforce the **scenario-agnostic** guarantee with a source-read containment test.
2. Prove the player-visible journey with a Playwright spec.
3. Run the full verification gate and post real outputs.

## Files you own (exclusive)

- `test/system-scenario.test.ts` (new)
- `e2e/system-pick.spec.ts` (new)

Forbidden: modifying production `src/` to make tests pass (registered failures go back to
the owning S-task), skipping tests, weakening assertions.

## 1. Containment test (`test/system-scenario.test.ts`)

Read the raw source (use `node:fs`/`import.meta.url` like other tests) of these core files:

- `src/content/system-defs.ts`
- `src/content/system-quests.ts`
- `src/engine/system-runtime.ts`
- `src/ai/system.ts`
- (also `src/content/system-messages.ts`, `src/engine/system.ts`)

Assert NONE imports from `../content/story`, `../content/npcs`, `../content/locations`,
`../content/endings-data`, `../content/chapters`, `../content/quests` (regex on
`from '...'` lines; allow type-only `import type` from `../engine/content-types` and
plain data modules `system-defs`/`system-quests`).

## 2. Playwright (`e2e/system-pick.spec.ts`)

Follow `e2e/fresh-endings.spec.ts` helpers (openGame via addInitScript + clickChoice).
Journey: fresh save → boot `scene_transmigration` → choose `accept_system_battle` →
`scene_system_selection` → pick `sys_battle` → accept a `sys_battle_01`-style quest →
complete its step → turn in via panel → assert gold/reward within budget and no
`storySceneNextId` side effect (map scene unchanged). Also: a second pick attempt is
impossible (no scene shown again) and rootless shows no System panel.

## 3. Full gate — run ALL and paste real output

```powershell
npm run typecheck
npm run lint
npx vitest run
npm run build
npx playwright test e2e/system-pick.spec.ts
```

## Acceptance (whole System Layer)

- Containment test passes (no authored imports in core).
- E2E journey completes with reward within budget; rootless hides System UI.
- All 5 gates green.

## Handoff

Files touched, each command + result, remaining risks, next action (review by human /
queue runner).