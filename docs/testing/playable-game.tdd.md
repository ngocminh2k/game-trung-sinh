# Playable game TDD evidence

Source: user journeys derived in this implementation run; no external plan file was supplied.

## Journeys

1. A player can resume a valid saved run without corrupted browser data changing game state.
2. A player can see a Vietnamese/English RPG screen, choose one of three story actions, use free text, and move on the map with the keyboard.
3. A player can only receive optional AI prose through a read-only boundary; AI cannot receive a secret or mutate game state.

## RED / GREEN record

| Behavior | RED evidence | GREEN evidence | Guarantee |
|---|---|---|---|
| Browser save session | `npm test -- --run test/session.test.ts` failed because `src/ui/session` did not exist. | Same command: 2 tests passed. | Valid saved game and locale round-trip; malformed JSON returns `null`. |
| Playable screen contract | `npm test -- --run test/game-screen.test.tsx` failed because `src/ui/GameScreen` did not exist. | Same command: 1 test passed; `npm run typecheck` and `npm run lint` passed. | Map, title, exactly-three-choice area, and command field render. |
| AI boundary | `npm test -- --run test/ai-narration.test.ts` failed because `src/ai/narration` did not exist. | Same command: 1 test passed. | Payload is canonical/read-only and excludes seed and inventory. |

## Validation

| # | What is guaranteed | Test or command | Type | Result |
|---|---|---|---|---|
| 1 | Keyboard left movement reaches Cloudgather Market and survives reload. | `e2e/game.spec.ts` | E2E | PASS — 2 Playwright tests |
| 2 | A player can select a suggested story action. | `e2e/game.spec.ts` | E2E | PASS — 2 Playwright tests |
| 3 | React UI handles keyboard movement, language switching, persistence, and free-text reducer input. | `test/app.ui.test.tsx` | UI integration | PASS — 2 tests |
| 4 | Save/load rejects malformed saved data. | `test/session.test.ts` | unit | PASS — 2 tests |
| 5 | Shop, storage, and Zustand bridge respect engine rules. | `test/support-helpers.test.ts` | integration | PASS — 2 tests |
| 6 | Narrative payload has no seed or inventory and is read-only. | `test/ai-narration.test.ts` | unit | PASS — 1 test |
| 7 | Existing deterministic engine, content, ending, correction, death, lottery, and i18n guarantees remain valid. | `npm test` | unit/integration | PASS — 93 tests in 19 files |

## Coverage and known gaps

`npm run test:coverage` passed with 93 tests. Global coverage was **94.92% statements**, **81.68% branches**, **80.47% functions**, and **94.92% lines**.

The optional AI call itself uses an unavailable-by-default local service and is deliberately not exercised against a real key. Playwright covers the browser’s critical interactions without enabling AI narration. The visual language was also inspected in Chromium with a generated local screenshot.
