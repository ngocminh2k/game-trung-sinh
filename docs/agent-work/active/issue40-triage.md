# Issue #40 — static E2E triage (read-only, no runs)

Baseline: working tree at `292939e`/`806cc7c` + uncommitted #31–#39 rounds. The
fb9f4d3 run was 50 failed / 35 passed / 3 did-not-run. This document triages the
14 specs outside the green list (`issue31-dead-click`, `issue33-skill-tree-journey`,
`issue34-attribute-banner`, `issue35-crit-visual`, `issue37-38-telegraph-and-context`,
`fresh-boot`) — 64 tests.

Method: pure source reading. Every claim below is a quoted selector/accessible name
from the spec plus the current DOM site in `src/` (or an explicit "absent"). No
Playwright was run; nothing in `src/`, `e2e/`, or git state was modified.

**Caveat for rewrite agents:** the `Issue31 residual topbar merge` agent is editing
`src/ui/GameScreen.tsx` and `src/ui/ProtoShell.tsx` right now (it moves journal /
exit / locale controls out of the legacy `header.topbar`). Line numbers in
`GameScreen.tsx` below the ~600 mark may shift. Re-read those two files before
applying a fix; the *classifications* do not change, but a `file:line` might.

---

## 1. Summary counts

| Spec | tests | ALIVE | STALE-DOM | STALE-BEHAVIOR | NEEDS-RUN |
|---|---|---|---|---|---|
| acceptance-visual.spec.ts | 12 | 2 | 10 | 0 | 0 |
| game.spec.ts | 12 | 0 | 5 | 1 | 6 |
| fresh-endings.spec.ts | 8 | 0 | 8 | 0 | 0 |
| branch-journeys.spec.ts | 4 | 0 | 4 | 0 | 0 |
| quick-endings.spec.ts | 4 | 0 | 4 | 0 | 0 |
| save-reload.spec.ts | 5 | 2 | 2 | 0 | 1 |
| save-slots.spec.ts | 5 | 3 | 0 | 0 | 2 |
| npc-on-map.spec.ts | 3 | 1 | 2 | 0 | 0 |
| economy.spec.ts | 2 | 0 | 2 | 0 | 0 |
| system-notifications.spec.ts | 2 | 0 | 2 | 0 | 0 |
| system-pick.spec.ts | 2 | 1 | 1 | 0 | 0 |
| debug-map.spec.ts | 1 | 1 | 0 | 0 | 0 |
| main-menu.spec.ts | 2 | 2 | 0 | 0 | 0 |
| issue17-mobile.spec.ts | 2 | 2 | 0 | 0 | 0 |
| **total** | **64** | **14** | **40** | **1** | **9** |

Counts are per **test**, so `acceptance-visual`'s 6 named tests score 12 (each runs at
both 1280×800 and 1600×900) and `game.spec.ts`'s `story ending:` loop scores 5. These
64 are not the 85 of the fb9f4d3 50/35 run: that baseline also counted the specs since
rewritten green (issue31/33/34/35/37-38) and predates the #31 z-index and ?fresh=1
work, so it is not reconcilable test-for-test.

40 of the 64 tests reduce to four root causes; they are not 40 independent bugs.

---

## 2. Root causes (R1–R4)

### R1 — `.world-content` is force-hidden at every Playwright viewport

`src/ui/screens.css:1982-1984`:

```css
@media (min-width: 921px) {
  .proto-shell-wrap ~ .world-content { display: none !important; }
```

`playwright.config.ts` uses `devices['Desktop Chrome']` (1280×720) and the specs set
1280×800 / 1600×900 — all ≥ 921px. The element **still exists in the DOM** (queries
find it) but every Playwright *visibility* assertion on it and its descendants fails.

Exact hidden region: `GameScreen.tsx:643` (`.world-content` opens) → `888` (closes).
Hidden inside it: `.stage-notices` (644), `.chapter-banner`, `.danger-banner`,
`DeathScreen` (659), `.ending-banner` (669), both encounter banners (680, 700),
`.game-grid` / `.map-panel` (707-708), `location-label` (715), `event-node-*` (746),
`.map-exit-icon` (756), `player-marker` (764), `map-current-cell` (769),
`.map-node-summary` (777), `.map-legend` (785), `.map-context` (794), `.hud-panel`
(818), `system-panel` (819), `system-feed` (821), currency testids (859-861),
`.stats-card` (843), `.quick-actions` (880).

**Genuinely visible siblings — do NOT reclassify these as R1:**
`narration-panel` / `.story-panel` (`890`, `position:fixed !important` + `z-index:20`
per `src/index.css:235`), `route-encounter-screen` (`977`), `journal-screen`
(`1012`, `#journal-screen:not([hidden])` at `screens.css:1066`), `.attribute-banner`
(`562-589`, `z-index:32` at `screens.css:2017`), `header.topbar` (`601`, lifted to
`z-index:31` at `screens.css:1998`), and all of `<ProtoShell/>` (`590-600`).

### R2 — duplicate `data-testid`s across legacy + ProtoShell (strict-mode failure)

`getByTestId(...)` resolving to 2 nodes fails on **any** assertion, visible or not:

| testid | legacy site | proto site |
|---|---|---|
| `map-current-cell` | `GameScreen.tsx:769` | `ProtoShell.tsx:492` |
| `currency-gold` | `GameScreen.tsx:859` | `ProtoShell.tsx:300` |
| `currency-silver` | `GameScreen.tsx:860` | `ProtoShell.tsx:302` |
| `currency-spirit-stones` | `GameScreen.tsx:861` | `ProtoShell.tsx:304` |
| `player-marker` | `GameScreen.tsx:764` | `ProtoShell.tsx:372` (latent — no in-scope spec reads it) |

Dead duplicates that do **not** collide (not imported into `GameScreen.tsx:54`):
`gameScreen/components.tsx:9` `ink-corner`, `:54` `realm-ladder`.

### R3 — surfaces relocated out of the legacy panel

- System queue/feed: legacy `system-panel`+`system-feed` (`GameScreen.tsx:819`, `821`)
  → `LeftRailTabContent.tsx:352` `[data-testid="leftrail-system-panel"]` and
  `:363` `.proto-system-chat-log[role=log]`. There is **no** `system-feed` testid in
  the proto rail; the per-item feed lines collapsed into the chat log.
- Chronicle: legacy `.chronicle` inside the story panel → `ChronicleFeed`
  (`gameScreen/panels.tsx:597-643`) now renders **only** in the Journal dock's
  `chronicle` tab (`GameScreen.tsx:1088-1102`), and `DockPanelContainer`
  (`panels.tsx:91-109`) sets `hidden={activeDock !== panel}`, so `li` nodes exist only
  after `#dock-tab-chronicle` is clicked. Tabs: `#dock-tab-${id}`, `role=tab`
  (`panels.tsx:70-86`).
- Market / inventory dock panels already live inside `journal-screen`; specs that open
  the journal first are fine (economy's failure is R2, not R3).

### R4 — accessible-name drift

| spec expectation | current DOM |
|---|---|
| `getByRole('button', { name: 'Start encounter' })` | legacy EN copy still exists at `GameScreen.tsx:702` (hidden → R1); ProtoShell chip is `⚔ Fight: <name>` / `⚔ Giao chiến: <name>` (`ProtoShell.tsx:581`) |
| `getByLabel('Active encounter')` | `GameScreen.tsx:680` (hidden → R1); proto equivalent is `[data-testid="proto-combat"] .proto-combat-overlay` (`ProtoShell.tsx:501`) with **no** aria-label, enemy HP as an aria-label at `:538` |
| `getByRole('button', { name: '← Back to world' })` | `GameScreen.tsx:1032` renders `← Back to world <kbd>Esc</kbd>` → accessible name is `'← Back to world Esc'` (acceptance-visual already updated; `game.spec.ts:109` has not) |
| `toContainText('Locked')` | legacy `<em>{t(locale,'system.locked')}</em>` = "Locked" (`GameScreen.tsx:833`, `src/i18n/en.ts:154`); **absent** in `LeftRailTabContent.tsx` (only `'Accept quest'` `:374/:450`, `'Turn in'` `:434`) |
| `getByLabel('Chú giải bản đồ')` / `'Map legend'` | `GameScreen.tsx:785` (hidden → R1); proto `.legend` (`ProtoShell.tsx:485`) has **no** aria-label and only You/Event/NPC rows |

---

## 3. Per-spec evidence

### acceptance-visual.spec.ts — 12 tests (6 × 2 viewports: 1280×800, 1600×900)

| test | class | evidence |
|---|---|---|
| UX-03 layout ratios (`:54`) | **STALE-DOM** (R1) | `:57-63` queries `.world-content .game-grid` / `.map-panel` / `.hud-panel` / `.system-panel` / `.stats-card` — all inside `GameScreen.tsx:643-888`. `document.querySelector` still finds them (`display:none` nodes), so the `throw` guard at `:64` does **not** fire; `getBoundingClientRect()` is all-zero → `mapRatio = 0/0 = NaN` → `expect(NaN).toBeGreaterThan(.32)` fails at `:87`. This is the "NaN ratio" symptom in the issue text, not a missing node. `.world-content .story-panel` (`:59`) matches nothing at all — the story panel is `position:fixed` at `GameScreen.tsx:890`, outside `.world-content` — so `storyVisible` (`:75`) is a **vacuous false**, and `panelsOverlap` (`:76`) / `iconsInBounds` (`:78`) are **vacuously true** on zero rects. |
| A-08 journal focus restore (`:97`) | **STALE-DOM** (R1) | `:103` `expect(getByTestId('world-content')).toBeVisible()` after returning from the journal — the kill-switch makes it permanently invisible at ≥921px, so the assertion is unsatisfiable as written. `:99` launcher name and `:102` `'← Back to world Esc'` are current (`GameScreen.tsx:619`, `1032`). |
| A-08 combat (`:113`) | **STALE-DOM** (R1+R4) | `:115` `'Start encounter'` → `GameScreen.tsx:702` hidden; `:116` `getByLabel('Active encounter')` → `:680` hidden. Proto replacement: `ProtoShell.tsx:581` fight chip + `:501` `[data-testid="proto-combat"]`. |
| A-08 ending (`:126`) | **STALE-DOM** (R1) | `:128` `.ending-banner` `toBeVisible` → `GameScreen.tsx:669`. |
| A-08 death (`:132`) | **STALE-DOM** (R1) | `:134` `.death-screen, .ending-banner` → `DeathScreen.tsx:47` / `GameScreen.tsx:659`. |
| A-08 route encounter (`:120`) | **ALIVE** | `:122` `route-encounter-screen` `toBeVisible` on a visible sibling (`GameScreen.tsx:977`; opened at `:643`'s sibling level, `.world-content` closes at `888`). |

Per-test tally at both viewports: UX-03, journal-focus, combat, ending, death = 5 × 2 =
10 **STALE-DOM**; route-encounter = 1 × 2 = 2 **ALIVE**. The `scrollHeight` checks at
`:84`, `:109` are assertions inside tests already counted, not separate tests.

**Caveat:** `openGame` (`:29-42`) seeds the slot via `addInitScript` and clicks the
press-any-key button; `expect(getByTestId('game-screen')).toBeVisible()` (`:39`,
`GameScreen.tsx:555`) is a live assertion. The boot path is healthy and is NOT part of
the drift — only the surfaces it then measure are.

### game.spec.ts — 12 tests (7 named + 5 `story ending:` from the loop at `:153`)

| test | class | evidence |
|---|---|---|
| `starts as exploration, travels without losing a day` (`:48`) | **STALE-BEHAVIOR** | `:55-56` presses `ArrowLeft` twice and expects `location-label` = `Cloudgather Market` at `:57`. Arrow travel is now handled only in `src/App.tsx:441-469`; `GameScreen.tsx:326-328` records that in-component arrow travel was removed on 2026-09-08 in favour of pin clicks. `page.keyboard.press` targets the focused element, and after `:53` clicks the EN locale button focus is on that button — so no move reaches the window handler. Also `:52`/`:58` `.day-chip` is a strict-mode **risk**: `GameScreen.tsx:610` plus the conditional `:613` `.day-chip deadline-chip`, which `reducer.ts:220-229` only sets from chapter ≥ 2 (`constants.ts:190 DEADLINE_DAYS = 21`) — not on this boot, so today it resolves to 1. |
| `opens dialogue for NPC talk and blocks movement until dismissal` (`:64`) | **STALE-DOM** (R2+R1) | `:66`/`:77`/`:82` `getByTestId('map-current-cell')` → 2 matches (`GameScreen.tsx:769` + `ProtoShell.tsx:492`). `:80-82` `expect(locator('.hud-panel')).not.toHaveAttribute('inert','')` passes vacuously (hidden, no visibility requirement) while the `ArrowDown` travel at `:81` is the same stale-keyboard problem. `:70-71` topbar/stage-notices inert assertions are still valid (`:601`, `:644` both registered in `backgroundRegion`; `GameScreen.tsx:274` `toggleAttribute('inert', storyOpen)`). `:44` `openDialogue` correctly scopes Talk to `journal-screen`. |
| `regional map nodes and local exits are visible and usable` (`:85`) | **STALE-DOM** (R1+R2) | `:87`/`:88`/`:91`/`:92` `toBeVisible()` on `event-node-*` → `GameScreen.tsx:746` (hidden). `:89-90` arrow travel again. Proto replacement for the node click path: `map-pin-${x}-${y}` (`ProtoShell.tsx:417`) / pin aria-label `:419`, `:465`. |
| `dialogue contains authored choices and accepts a free-form action` (`:95`) | **STALE-DOM** (R3) | `:101` `expect(page.locator('.chronicle li').last()).toContainText('thought slips free')` — `ChronicleFeed` now renders only in the Journal dock `chronicle` tab (`GameScreen.tsx:1088-1102`, `panels.tsx:597-643`), and `DockPanelContainer` hides every non-active panel (`panels.tsx:91-109`), so `.chronicle li` resolves inside a hidden container or not at all depending on `activeDock`. Needs `#dock-tab-chronicle` (`panels.tsx:70-86`). |
| `Journal is a full mode … explicit return` (`:104`) | **STALE-DOM** (R4+R1) | `:107` `world-content` `toBeHidden` passes for the wrong reason (kill-switch, not the journal), and `:110` `world-content` `toBeVisible` can never pass. `:109` `getByRole('button', { name: 'Back to world' })` does **not** match `'← Back to world Esc'` (`GameScreen.tsx:1032`); acceptance-visual already uses the current name. `:108` `inventory-inspector` (`panels.tsx:195`) is fine — default dock is `inventory` (`GameScreen.tsx:623`). |
| `combat presents deliberate technique and defence controls` (`:113`) | **STALE-DOM** (R1+R4) | `:118` `'Start encounter'` → `GameScreen.tsx:702` (hidden); `:119-120` `getByLabel('Active encounter')` `toBeVisible` → `:680` (hidden). `:121` `'Defend'` exists at `:691`, also hidden. Proto replacements: `ProtoShell.tsx:581` fight chip, `:501` `[data-testid="proto-combat"]`, `:549` `combat-attack`. |
| `route evidence is carried into the next dialogue` (`:125`) | **NEEDS-RUN** | `:130-131` visible sibling (`GameScreen.tsx:977`), `:136` `route-proof` `toContainText('Public')` (`:964-974`), `:137-142` `.story-choices .choice-button` + `narration-panel` (`:890-936`) all target live, visible surfaces. Left as NEEDS-RUN only because `:132` `toHaveCount(2)` on the route-encounter buttons depends on authored scene content rather than DOM drift — static reading cannot settle it. |
| `story ending: *` ×5 (`:154`) | **NEEDS-RUN** ×5 | `:158` `expect(page.locator('.ending-banner')).toContainText(...)` passes **vacuously** today (hidden node still carries the text; `toContainText` has no visibility requirement) and `:159` `narration-panel` `toHaveCount(0)` is legitimate. So all 5 currently pass while proving nothing, and whether the *flow* still reaches each ending after the #35 chronicleKinds and #34 banner changes cannot be decided statically. Once §4 step 2 lands, these become real assertions — re-run, do not rewrite. |

Split: 5 STALE-DOM, 1 STALE-BEHAVIOR, 6 NEEDS-RUN, 0 ALIVE — matches §1.

### fresh-endings.spec.ts — 8 tests, all STALE-DOM (R1)

`waitForEnding` (`:78-81`) is the single choke point: `:79`
`expect(page.locator('.ending-banner')).toBeVisible({ timeout: 10000 })` →
`GameScreen.tsx:669`, inside the hidden subtree. All 8 tests route through it, so one
product move (§4 step 2) or one helper rewrite fixes all 8.
Secondary hits once the first assertion is repaired:
- `:68-70` `startEncounter` clicks `'Start encounter'` → `GameScreen.tsx:702` (hidden);
  proto chip `ProtoShell.tsx:581`.
- `:49-53` `moveDirection` uses arrow keys → `App.tsx:441-469` (focus-dependent).
- `:346-375` death test: `:359` `expect(/bước vào giao chiến|start encounter/i).toBeVisible()`
  → hidden; `:367` `.death-screen` `toBeVisible` → `DeathScreen.tsx:47` rendered from
  `GameScreen.tsx:659` (hidden); `:368` `.death-epitaph` (`DeathScreen.tsx:79`).
- `:119`, `:197` `location-label` `toHaveText` — single match (`GameScreen.tsx:715`)
  and no visibility requirement → passes **vacuously**; a coverage trap, not a failure.

### branch-journeys.spec.ts — 4 tests, all STALE-DOM (R1)

- `:59`, `:74`, `:85`, `:124` `expect(page.locator('.ending-banner')).toBeVisible({ timeout: 10000 })` → hidden (`GameScreen.tsx:669`). `:62` `.ending-epilogue` `toBeVisible` (`:673`) is the same failure behind the earlier one.
- Test 4 (`:89` rootless road) additionally: `:95-96` `system-panel` / `system-feed`
  `toHaveCount(0)` and `:126-127` — these **pass**, but they now pass because the
  legacy panel is hidden-and-text-present rather than because the System is silent;
  `toHaveCount` has no visibility requirement and the leftrail System tab
  (`LeftRailTabContent.tsx:352`) is *not* covered by either selector, so the test no
  longer proves what it claims. `:105` arrow-key travel + `:106` `location-label`
  `toHaveText` are the same two problems as game.spec.

### quick-endings.spec.ts — 4 tests, all STALE-DOM (R1)

`:58`, `:72`, `:86`, `:100` `expect(banner).toBeVisible({ timeout: 10000 })` on
`.ending-banner` → hidden. The trailing `expect(text).toContain(...)` (`:62/:76/:90/:104`)
would still pass vacuously via `textContent()`. This spec also hardcodes
`SHOTS_DIR = 'F:/game-trung-sinh/ending-shots'` (`:5`) and writes screenshots into the
repo — it is a capture driver, not a regression test; consider demoting or deleting it
in the same pass as `debug-map`.

### save-reload.spec.ts — 5 tests: 2 STALE-DOM / 2 ALIVE / 1 NEEDS-RUN

- `:97` `'Start encounter'` click + `:98-99`/`:102` `getByLabel('Active encounter')`
  → **STALE-DOM** (R1: `GameScreen.tsx:702`, `680`; proto `ProtoShell.tsx:581`, `501`).
- `:136` `expect(getByTestId('world-content')).toBeVisible()` → **STALE-DOM** (R1,
  `screens.css:1983`).
- `:162` `expect(page.locator('.ending-banner')).toContainText(/Rootless Star/i)` →
  passes vacuously; the test is counted **NEEDS-RUN** because the reload path it is
  meant to prove (ending survives a reload) cannot be confirmed statically once the
  assertion is made visibility-bearing.
- `:41` `narration-panel` `toBeVisible` and `:130` `inventory-inspector`
  `toBeVisible` target visible surfaces (`GameScreen.tsx:890`, `panels.tsx:195`) →
  **ALIVE ×2** (`:37-42` openStoryPanel helper is current).

### save-slots.spec.ts — 5 tests: 3 ALIVE / 2 NEEDS-RUN

The save-slot screen (`App.tsx:114-149`: `save-slots-screen`, `[data-save-slot]`,
`newgame-confirm`) is outside `GameScreen` and untouched by the kill-switch →
`:35-44`, `:49-51`, and the legacy-migration test `:72-84` assert live DOM.
Classified ALIVE: `shows the slot screen on first boot and a fresh slot is empty`,
`selecting an empty slot starts a new game…`, and one more.
NEEDS-RUN ×2: the test at `:46` depends on `:61` `location-label`
`not.toHaveText(startLabel)` after **arrow-key** travel (`App.tsx:134-135` uses
ArrowUp/Down for slot focus, and travel needs window-level focus), and the migration
test's reload-resumes-the-same-slot step. `:50` `system-tile-sys_battle` and
`:57-61` `location-label` are single-match/`textContent`-style, so no strict-mode risk.

### npc-on-map.spec.ts — 3 tests: 2 STALE-DOM / 1 ALIVE

1. `renders NPC nodes as distinct map pins…` — **STALE-DOM** (R1). `:45`/`:49`
   `event-node-village-elder-porch` / `-home` `toBeVisible` → `GameScreen.tsx:746`.
   `:53-54` `toHaveAttribute('title', 'Người: …')` and `:57-59`
   `getByRole('list', { name: 'Các điểm trên bản đồ' })` (`:777`) and `:62-63`
   `getByLabel('Chú giải bản đồ')` (`:785`) all resolve only inside the hidden subtree
   (`toBeAttached` at `:58-59` would pass; the `toBeVisible` at `:45` fails first).
   Proto replacements: pin testid `map-pin-x-y` (`ProtoShell.tsx:417`), NPC aria-label
   `Talk to …` / `Nói chuyện với …` (`:465`), `.legend` (`:485`) — which has **no**
   accessible name and no NPC-exit row, so the legend assertion has no equivalent and
   must be rewritten or dropped.
2. `updates map context trail notes…` — **STALE-DOM** (R1+R2). `:69`/`:72`
   `getByTestId('map-current-cell')` → 2 matches (R2). `:73-75` `.map-context`
   (`GameScreen.tsx:794`) hidden. `:70` `ArrowLeft` travel (App-level, focus-dependent).
3. `allows talking to local NPCs via Journey journal people tab` — **ALIVE**. Journal
   (`GameScreen.tsx:1012`) is a visible sibling; `:83` tab `/Người ở đây/` and
   `:86` `.npc-portrait-card[data-npc-id="n_elder_meihua"]` (`panels.tsx:576`) and
   `:91` `'Nói chuyện'` (`panels.tsx:586`) and `:92-94` `narration-panel` are current.
   `:82` launcher name `'Mở Hành trang và giang hồ'` matches `GameScreen.tsx:619`.

### economy.spec.ts — 2 tests, STALE-DOM (R2)

Both open the journal and click `#dock-tab-market` (`:41-42`, `:65-66`) — correct, and
`currency-exchange` `toBeVisible` (`:43`, `panels.tsx:290-305`) and
`.market-bag-list` (`:57`, `:331`) are current. What breaks is `readCurrency()`
(`:29-33`) and `:53`/`:69`/`:70`/`:74`:
`page.getByTestId('currency-silver'|'currency-gold'|'currency-spirit-stones')` → 2
matches each (R2 table). Fix is one scoping change in the helper
(`.proto-topbar [data-testid=…]`) plus the two inline `toContainText` calls —
note the proto spans render `<span class="v">{n}</span>` (`ProtoShell.tsx:300-304`) with
**no** unit word, so `toContainText('0')`-style checks still work but "10 silver →
1 gold" assertions must not expect legacy `bạc/vàng` copy.

### system-notifications.spec.ts — 2 tests, STALE-DOM (R1+R3)

1. `:34` `expect(getByTestId('system-panel')).toBeVisible()` → hidden
   (`GameScreen.tsx:819`). `:35` `system-feed` `toHaveCount(0)` then `:38-39`
   `getByTestId('system-feed')` `toBeVisible` → `:821` hidden. Replacement:
   `leftrail-system-panel` (`LeftRailTabContent.tsx:352`) +
   `.proto-system-chat-log[role=log]` (`:363`), fed by `queueDrain(game.systemQueue, 5)`
   (`:87-92`). The `li`-count assertion (`:50`) has no equivalent element.
   The spec's own comment at `:40-45` already reports the `toBeVisible`-first failure
   and the "Main quest loaded" → "Quest loaded" copy change (P3); that copy part is
   **already fixed in the working tree** (`:46` asserts the new copy).
2. `:70` `expect(getByTestId('system-feed')).toContainText(/Insufficient data to answer/)`
   → R3; and because `toContainText` has no visibility requirement, this test can pass
   against a hidden legacy panel — treat it as STALE-DOM with a mandatory re-scope to
   the proto chat log.
   `:65-67` journal → People → `Talk` is the current path.

### system-pick.spec.ts — 2 tests: 1 STALE-DOM / 1 ALIVE

1. `:37` selects Battle System. `:42-47` `narration-panel` assertions are current
   (visible, `GameScreen.tsx:890`). Failure sites: `:48` `toContainText('【Battle System】')`
   on `system-panel` (hidden → passes vacuously), `:51` `'Accept quest'`
   (`getByTestId('system-panel').getByRole('button', …)` — click requires visibility →
   R1), `:52`/`:55` `'Turn in'`, `:56` `toContainText('Locked')` → **no** proto
   equivalent (R4 table). Replacements: `leftrail-system-panel` + `'Accept quest'`
   (`LeftRailTabContent.tsx:374`, `:450`), `'Turn in'` (`:434`); for `Locked` either
   assert the engine state (the `:59-62` localStorage assertions already do) or add the
   missing proto affordance. → STALE-DOM.
2. `:69` rootless boot never renders the System panel: `:71`/`:74` narration-panel
   (`GameScreen.tsx:890`) and `:75` `system-panel` `toHaveCount(0)` — here
   `system_refused !== true` gating (`GameScreen.tsx:819`) genuinely removes the node,
   so `toHaveCount(0)` is a **real** assertion, not a vacuous one. `:76` reads
   `flags.system_refused`. → ALIVE.

### debug-map.spec.ts — 1 test: ALIVE (but worthless)

Single test, **zero `expect()` calls** — `:34` `page.locator('[data-testid^="event-node-"]')`
and `:46` `location-label` feed `console.log` diagnostics only. It cannot fail for DOM
reasons, so it is ALIVE as written, and it asserts nothing. Delete rather than maintain.

### main-menu.spec.ts — 2 tests: ALIVE

`:33-38` was already updated for the hidden legacy panel (the comment at `:33-36`
documents it) and `:40` reads `getByTestId('leftrail-system-panel')` — the current
surface (`LeftRailTabContent.tsx:352`). `:37` `location-label` and `:38`
narration-panel `toHaveCount(0)` are non-visibility assertions on real state.

### issue17-mobile.spec.ts — 2 tests: ALIVE

375×812 viewport is **below** the 921px kill-switch, so the legacy layout it measures
is genuinely on screen; `screens.css:1973-1978` was written against exactly
`e2e/issue17-mobile.spec.ts:37` (`.game-shell > header.topbar { flex-direction: column }`).
No R1-R4 exposure. Keep as a regression guard for the #31 merge agent's changes.

---

## 4. Recommended fix order — cheapest first

**Step 1 — locator/name swaps inside the specs (no product change, ~5 files).**
Cheapest possible: one-line edits, each independently verifiable.

> **VIEWPORT RULE (learned the hard way twice — branch-journeys :44, system-notifications :38/:59):**
> any locator targeting a **proto-only surface** (`dock-tab-*`, `leftrail-system-panel`,
> `.proto-*`, the journal rail drawer, topbar `topbarActions` controls) can ONLY be
> visible at **≥921px**, because `screens.css` retires the proto layer and unmounts the
> merged controls below that. A spec that both (a) sets a ≤920 viewport and (b) clicks a
> proto surface resolves-in-DOM-then-times-out-30s — that is the whole "waiting for
> element to be visible" class. Fix = set desktop viewport (1280×800) OR scope the
> locator to the legacy surface that IS visible ≤920. Conversely `quick-endings` passes
> at 800×800 because its target (`.ending-banner`) is now a `.game-shell` child that
> renders at every width — do NOT "fix" a passing ≤920 test just because it's ≤920.
- `economy.spec.ts:29-33` + the four inline `getByTestId('currency-*')` calls: scope to
  `.proto-topbar` (R2).
- `npc-on-map.spec.ts:69,72` and `game.spec.ts:66,77,82`: scope
  `map-current-cell` to one shell, or switch to `.proto-shell-wrap [data-testid=…]` (R2).
- `game.spec.ts:109` `'Back to world'` → `'← Back to world Esc'` (R4).
- `system-notifications.spec.ts` + `system-pick.spec.ts`: re-point
  `system-panel`/`system-feed` at `leftrail-system-panel` and
  `.proto-system-chat-log` (R3), and drop `toContainText('Locked')`
  (`system-pick.spec.ts:56`) onto the localStorage state the test already reads
  (R4 — no proto "Locked" affordance exists).
- `acceptance-visual.spec.ts:115-116` → ProtoShell fight chip + `[data-testid="proto-combat"]`.

**Step 2 — one product move that unblocks ~20 tests across 4 specs.** ✅ **DONE (2026-09-15, this session).** Landed exactly as written below; verified: `test/issue40-terminal-surface.test.tsx` 3/3 (RED-first), `acceptance-visual` **12/12** (4 fixmes converted to real tests, both viewports), `quick-endings` 4/4, `issue34` 8/8, tsc 0, vitest 119/909. Remaining from its blast radius: fresh-endings (owner fixing lint + dropping ≤800px workaround now, as intended), branch-journeys (:44 now fails on R3 `dock-tab-people` visibility at 800×800 — the banner blocker is GONE, spec owner told to move to desktop viewport), and game.spec.ts:158 vacuity (now a real assertion — needs a run, Step 6).
Lift `.ending-banner` (`GameScreen.tsx:669-676`) and `DeathScreen` (`:659-666`) out of
`.world-content` into `.game-shell`, exactly the way the #34 round-2 fix lifted
`.attribute-banner` (`screens.css:2017`, `position:relative; z-index:32`) above the
proto layer. This single relocation fixes, without touching a line of test code:
`fresh-endings` `:79` (8 tests), `quick-endings` `:58/72/86/100` (4), `branch-journeys`
`:59/74/85/124` (4), `acceptance-visual` `:128/134` (2 ×2 viewports = 4), and makes
`game.spec.ts:158` stop passing vacuously. It is also the honest fix — a terminal
state the user cannot see is a product bug, not a spec bug, so this item is the only
one in this list that should be filed against #40 as *not* pure drift.

**Step 3 — retire the legacy desktop shell (kills R1 + R2 at the source).**
RESIDUAL #31 / `screens.css:1995-1997` `ponytail:` comment: move journal, exit-to-menu
and the VI/EN toggle (`GameScreen.tsx:617-639`) into ProtoShell's own topbar, then
`display:none` (or unmount) the legacy `header.topbar` + `.world-content` at ≥921px.
In-flight as the `Issue31 residual topbar merge` agent. After it lands: duplicate
testids disappear (R2 solved for good, including the latent `player-marker`), and
every remaining "passes but proves nothing" assertion becomes a real one or a loud
failure. Re-run the whole #40 bucket after this step, before writing new specs against
selectors that are about to be deleted.

**Step 4 — rewrite or delete `acceptance-visual` UX-03.** ✅ **DONE (absorbed by the #31 merge wave).** The spec as it stands measures the PROTO layout (`.proto-grid-main`, `.proto-leftrail`, `.proto-center`, `.proto-map`, `.proto-righthud`, `.proto-ticker` — `acceptance-visual.spec.ts:56-62`) with anti-vacuous guards (`gridWidth/leftWidth/centerWidth/hudWidth/pinCount > 0`, :94-98) and real ratio + overlap + bounds assertions. Passing 12/12 (2 viewports) as of the Step-2 verification run.

**Step 5 — delete `debug-map.spec.ts`.** ✅ DONE — file removed 2026-09-15 (zero assertions, console.log-only diagnostic; triage rationale stood after re-reading it).

**Step 6 — run the 11 NEEDS-RUN tests** (game.spec's 5 ending cases + `:125`,
acceptance-visual's 2 scroll-height checks, save-reload's reload-preserves-ending,
save-slots ×2). Do this last, after steps 1-3: several of them are gated on the same
boot/focus assumptions, and running them before the #31 merge just re-measures the old
shell.

**Explicitly not worth doing:** no in-scope spec should be "fixed" by adding
`.first()` to a duplicated testid — that hides R2 and keeps the vacuous-pass class
alive. Fix the duplicate (step 3) or scope to a named container (step 1).

## 4b. CLOSURE RECORD (2026-09-15, round-6 full-suite run)

`npx playwright test --reporter=json` on the working tree after the #31 merge + Step 2 +
round-6 M1/M2: **91 passed / 6 failed / 1 skipped** (baseline triaged here was 50F/35P).
All 6 remaining reds sit in the two owner-locked specs; every other triaged spec is green.

| Step | State | Evidence |
|---|---|---|
| 1 (locator swaps) | ✅ done by owners | economy 2/2 · npc-on-map 3/3 · system-pick 4/4 · acceptance-visual 12/12 |
| 2 (terminal-surface lift) | ✅ done, reviewed | see Step 2 note + reviewer-chain/round-6; `test/issue40-terminal-surface.test.tsx` 3/3 |
| 3 (retire legacy desktop shell) | ✅ landed (residual #31 merge) | R2 duplicate testids gone at ≥921; issue31-dead-click 8/8 both-direction guard |
| 4 (UX-03) | ✅ absorbed by step 3 wave | 12/12 with anti-vacuous metric guards |
| 5 (delete debug-map) | ✅ done | file removed; zero assertions |
| 6 (run NEEDS-RUN) | ✅ run, results routed | game.spec green after rewrite; save-slots 5/5; save-reload 1/5 → owner packet; acceptance scroll checks inside 12/12 |

§5 trap-list items retired by step 3 (legacy surface unmounts ≥921, so hidden-subtree
assertions became real or were re-scoped): the `location-label`, `.ending-banner`,
`system-panel`/`system-feed` `toHaveCount(0)`, `.hud-panel inert`, and both
`acceptance-visual` rect/story items. Still live and owner-assigned: `save-reload.spec.ts:162`
(`.ending-banner` text inside a ≤920-only path) — folded into the spec-savereload packet.

Open tails as of this record: `save-reload.spec.ts` 4 reds (1 = `version` expectation now
2 after M1's GAME_STATE_VERSION bump; 3 = R1/R3 stale selectors) and
`system-notifications.spec.ts` 2 reds (VIEWPORT RULE — spec pins 800×900 then clicks
proto-only surfaces). Both files locked to their owners; evidence packets delivered.

### 4b-continued — round-6 post-MEDIUM sweep (same day, supersedes the tails above)

`npx playwright test --reporter=json` after the terminal-surface focus/banner fixes:
**93 passed / 5 failed / 0 skipped.** Every triaged spec is now green EXCEPT
`save-reload.spec.ts` (×4, still owner-locked). Specifically:

- `system-notifications.spec.ts` **CLOSED — file seized** from its idle owner. Root cause
  of the last red (`:38`) was NOT the VIEWPORT RULE as first filed: the legacy
  `.system-panel` is `display:none` at ≥921 and, at 800×900, is *visible but unclickable* —
  `.proto-grid-main`'s map `.painting` intercepts the hit-test (Playwright: "element is
  visible, enabled and stable … `<div class="painting">` … subtree intercepts pointer
  events", 52 retries → 30 s timeout). Scoping the locator to the panel changes nothing.
  Fixed by driving accept/turn-in through the **journal Quests tab at 1280×900** (the
  player-real route, `system-quest-chain.spec.ts` already uses it) and reading
  `.system-feed` back at 800×900, the only width where it renders. **2/2 green**, eslint 0.
- New product finding, filed here not fixed: the legacy `.system-panel`'s buttons are
  unreachable at EVERY width — desktop by `display:none`, narrow by proto occlusion. The
  panel is read-only-ish except for accept/turn-in/chat, so the journal covers the player
  need; if the narrow-width legacy panel is meant to be usable, that is a `src/` stacking
  fix (`.proto-shell-wrap { pointer-events }` on the map layer), tracked as a follow-up.
- `save-reload.spec.ts` remaining 4, all routed to its owner with per-line evidence:
  `:64` `version).toBe(1)`→`toBe(2)` (orchestrator's GAME_STATE_VERSION bump; keep the v1
  fixture as live migration proof) · combat-reload `Start encounter` + pre-ending `Talk`
  clicks hit the same occlusion/ambiguity class (use the proto `[data-chip="fight"]` and a
  container-scoped exact `Talk`) · journal-open test asserts `world-content`
  **visible** while `GameScreen.tsx:716` sets `hidden={journalOpen || …}` — the assertion
  direction itself is wrong.

### 4c — round 7: save-reload SEIZED, suite 98/0 (2026-09-15)

Owner lane went silent after the packet (same pattern as sysnotify) → orchestrator applied
the packet and found the packet's own diagnosis incomplete:

- **Missed root cause, `savedAt: 1`:** the slot fixture's epoch timestamp made auto-resume
  meditate ~72 in-game hours → +72 progress → **+28 pending attribute points** → the #34
  softlock gate refuses ALL world actions ("Spend your new attribute points before
  continuing" — captured live in the chronicle). This, not occlusion, is why the combat
  test's chip click did nothing even after routing through `[data-chip="fight"]`. Fix:
  `savedAt: Date.now()`, matching system-notifications' openGame. **Lesson for future
  packets: prove action dispatch end-to-end in a debug spec before attributing a dead
  click to the occlusion class.**
- `:64` landed as filed (`toBe(2)`). Combat test routed to `[data-chip="fight"]` +
  `getByTestId('proto-combat')` as filed. `Talk` scoped to `journal-screen` + exact as
  filed. The journal-reload red was a THIRD class, not the filed one: the spec never
  overrode Playwright's 1280 default, so `world-content toBeVisible` could never pass
  (screens.css:1997) — fixed by reading back at 800×900 and asserting
  `inventory-inspector` **toBeHidden** (not count-0: it stays attached under the closed
  journal — visibility is the honest proof the overlay did not persist).
- Verdict: save-reload **5/5**, full suite `--reporter=json` → **98 passed / 0 failed /
  0 flaky / 0 skipped** (e2e-final.json). Zero skips remain; §4b's product finding
  (legacy `.system-panel` unreachable at every width) still open as a `src/` follow-up,
  and the §5 vacuity table still lists pre-fix line numbers for the two seized specs.

### 4c-note — round 7b review fixes + the `.painting` probe (2026-09-15)

r7-reviewer returned REQUEST-CHANGES on the two seized specs; all findings landed (see
round2-queue ROUND 7b). One was a src claim, now settled by measurement:

- Three lanes (spec-saveslots, spec-syspick, spec-sysnotify) asked for `pointer-events:none`
  on `.proto-map .painting` (screens.css:1368), noting its `.veil`(:1376)/`.grid-overlay`(:1383)
  siblings already have it. Applied it, then a throwaway Playwright probe measured
  `document.elementFromPoint` at the legacy `system-panel` "Accept quest" button's centre
  at 800×900: **still resolves to `DIV.proto-map`** and the click times out. The painting
  wash is not the interceptor — the `.proto-map`/`.proto-grid-main` **containers** paint
  over the in-flow `.world-content` at ≤920. A blanket `pointer-events:none` on the
  containers would break the proto map's own pins/controls, so this is a stacking design
  question, not a one-liner. **Reverted the no-op half-fix** (round 7 stays spec-only);
  the §4b product finding is unchanged and remains the follow-up. Re-verified: full suite
  **98/0/0/0** (e2e-r7sweep.json), tsc 0, eslint 0.



These do not appear in the §1 table as failures. They are the reason
"35 passed" cannot be trusted as coverage, and every rewrite agent must clear them:

| where | why it is vacuous |
|---|---|
| `game.spec.ts:57,61`, `fresh-endings.spec.ts:119,197`, `branch-journeys.spec.ts:106`, `main-menu.spec.ts:37`, `save-slots.spec.ts:57,61`, `debug-map.spec.ts:46` — `location-label` `toHaveText`/`textContent()` | single match at `GameScreen.tsx:715`, inside the hidden subtree; no visibility requirement |
| `game.spec.ts:158` `.ending-banner` `toContainText` | hidden node still carries the ending text |
| `save-reload.spec.ts:162` `.ending-banner` `toContainText` | same |
| `branch-journeys.spec.ts:95-96,101,126-127` `system-panel`/`system-feed` `toHaveCount(0)` | counts only the legacy panel; the proto `leftrail-system-panel` is not covered, so "no System" is unproven |
| `system-pick.spec.ts:48,56` `system-panel` `toContainText` | hidden legacy panel still contains `【Battle System】` / `Locked` |
| `system-notifications.spec.ts:70` `system-feed` `toContainText` | same |
| `acceptance-visual.spec.ts:76,78` `panelsOverlap` / `iconsInBounds` | all rects zero → both conditions trivially true |
| `acceptance-visual.spec.ts:75` `storyVisible` | `.world-content .story-panel` never matches (`:59`) — the story panel is `position:fixed` outside `.world-content` (`GameScreen.tsx:890`, `index.css:235`) |
| `game.spec.ts:80` `.hud-panel` `not.toHaveAttribute('inert','')` | hidden legacy HUD; inert state is not the user-visible behaviour under test |
| all of `debug-map.spec.ts` | no `expect()` at all |

### 4d — ISSUE CLOSED (2026-09-15, round 7b gates + product finding split out)

Full e2e **98/0/0/0** (closure run e2e-close.json), vitest **918/0/0**, tsc 0, eslint 0.
All spec-drift reds across rounds 1–7b triaged as DRIFT (spec fixed) or REAL BUG (filed).
The one surviving product finding — the ≤920 `.proto-map` container intercepting legacy
`.system-panel` clicks (probe: elementFromPoint → DIV.proto-map, NOT .painting) — split to
**#42** with root cause + evidence. Closing comment: issuecomment-5673452328. Evidence
index: docs/testing/issue40-e2e-drift.tdd.md. NOTHING committed (user constraint).
