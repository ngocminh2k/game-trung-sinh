# S07 — UI + i18n (System panel + chat + boot pick)

> Self-contained. Runs AFTER S05 (actions/events) and S06 (chat). Edits the shared UI.

## Objective

1. Render the System pick prompt at boot (when `systemId === null` && not refused).
2. Show a System panel + quest list + Accept/Turn-in buttons when a System is active.
3. Add the chat box wired to `requestSystemReply`.
4. i18n keys for all of the above (vi+en, parity).

## Files you own (exclusive)

- `src/ui/GameScreen.tsx`
- `src/i18n/vi.ts`, `src/i18n/en.ts`
- `test/system-ui.test.tsx` (new)

Forbidden: reducer, engine logic, authored content, existing UI tests that assert the
current System-less layout.

## Current context (verified)

- `GameScreen.tsx` receives `{ game, locale, chronicle, onAction, onLocaleChange }`.
  It renders the map, HUD, quest log, and story scenes. Story choices render via
  `story_choice` actions — the boot scene uses the same path.
- `word(locale, vi, en)` is the localization helper; `t('...')` used for keys.
- i18n parity test: `test/i18n.test.ts` asserts both dicts have identical key sets —
  adding keys to ONE file fails it. Always add to BOTH.

## Do this

1. **i18n** — add identical `system.*` keys to both dicts: `panelTitle`,
   `chatPlaceholder`, `acceptQuest`, `turnIn`, `difficulty`, `noSystem`, `poolHeader`,
   `chatFallback`, `chooseOne`, `locked`, `refused`.
2. **Boot pick** — when `game.systemId == null` and `!game.flags.systemRefused`, show the
   authored `scene_system_selection` choices (they flow through existing story rendering —
   just ensure the scene is reachable from `scene_transmigration`, done in S05).
3. **System HUD/panel** — when `game.systemId` is set (and not refused): show header
   + `systemQuestsFor(game)` list. Each row: name, difficulty badge, Accept (if
   `available`) / Turn-in (if ready) buttons dispatching the S05 actions.
4. **Chat** — input + "talk" button; on submit call `requestSystemReply`, render returned
   text; if `questId` present, show an Accept button that dispatches.
5. **Quest log** — tag `q_sys_*` entries with the system header + difficulty.
6. **Rootless** — when `systemRefused`, show NO system UI at all.

## Acceptance

- Renders the pick scene, picking dispatches the right choice; after pick, panel appears.
- Rootless shows no System UI.
- Both vi/en render the system keys correctly.

## Verification

```powershell
npx vitest run test/system-ui.test.tsx test/i18n.test.ts
npm run build
```

## Handoff

Files touched, commands+results, next action (`S08`).