# Master Acceptance Contract — Phế Căn Ký

> **Purpose:** This is the single release gate for Scenario I. It turns the
> GDD into verifiable work. A feature is not complete because it has a screen,
> a flag, a test double, or a commit. It is complete only when its player
> action, state change, visible feedback, downstream consequence, and automated
> evidence all exist.
>
> **Authority:** `docs/GDD.md` defines product intent; this document defines
> the acceptance proof required to claim that intent is delivered. Where a
> ticket and this contract conflict, this contract wins until the GDD is
> explicitly amended.
>
> **Scope:** Scenario I — *Phế linh căn*. Later scenarios may extend this
> contract, never silently weaken it.

## 0. Rules for closing work

Every checkbox below starts **open**. Only a reviewer, not the implementing
worker, may mark one closed. A checkbox needs all of the following evidence:

1. **Player path:** exact steps from a fresh save or specified fixture;
2. **State proof:** named deterministic state, inventory record, reward, or
   ending condition changed by that path;
3. **Visible proof:** the result is readable in the active game surface,
   chronicle, or Journal without developer tools;
4. **Downstream proof:** if the rule promises a later consequence, an authored
   later scene/action/ending reads that state and changes something meaningful;
5. **Automated proof:** reducer test plus component or Playwright test at the
   lowest layer that can catch a player-facing regression; and
6. **Review proof:** typecheck, lint, production build, relevant E2E, and a
   1280×800 screenshot are attached to the ticket.

`UI-only`, `flag-only`, `text-only`, and `test-only` are **not** acceptable
closures for a gameplay requirement. Test fixtures may bypass travel only when
there is a separate browser journey proving the normal path.

### Severity and release rule

| Severity | Meaning | Release treatment |
| --- | --- | --- |
| P0 | Cannot begin, continue, save, or finish a valid run; data/security loss | Release blocker |
| P1 | A promised RPG system or consequence is cosmetic, inaccessible, or untestable | Release blocker |
| P2 | Major clarity, localization, pacing, or polish flaw with a workaround | Must be scheduled before content expansion |
| P3 | Small visual/copy refinement | Batch after P0–P2 |

**Scenario I is not "complete" while any P0/P1 checkbox remains open or the
canonical Playwright suite is red.**

## 1. Release gates — always run

- [ ] **GATE-01 Build integrity (P0):** `npm run typecheck`, `npm run lint`,
  `npm test`, and `npm run build` pass from a clean checkout.
- [ ] **GATE-02 Browser integrity (P0):** `npx playwright test` passes from a
  clean browser context. The suite itself must dismiss the loading/start screen;
  it may not depend on a manual click or pre-existing local storage.
- [ ] **GATE-03 Fresh-save completion (P0):** a fresh seed reaches every
  authored Scenario-I terminal ending and death route without injected flags.
- [ ] **GATE-04 Save safety (P0):** reload during exploration, a route
  encounter, combat, Journal mode, and immediately before an ending preserves
  a schema-valid, playable state.
- [ ] **GATE-05 Visual regression (P1):** desktop screenshots at 1280×800 and
  1600×900 are reviewed for World, Journal, route encounter, combat, death,
  and ending. A baseline is committed or attached for each.

## 2. Boot, session, and one-viewport interaction

**Primary ownership:** `src/App.tsx`, `src/ui/GameScreen.tsx`, `src/index.css`,
`e2e/game.spec.ts`.

- [ ] **UX-01 Start is testable (P0):** loading/start is an explicit,
  keyboard-operable transition. Both UI and Playwright helpers complete it;
  neither falsely assumes gameplay is already mounted.
- [ ] **UX-02 One focused mode (P1):** World, Journal, route encounter, death,
  and ending are mutually exclusive modes. Opening Journal or an encounter
  replaces the World surface; it does not leave competing panels behind.
- [ ] **UX-03 Desktop no outer scroll (P1):** at 1280×800 and 1600×900,
  `document.documentElement.scrollHeight <= window.innerHeight`; only intended
  internal lists may scroll.
- [ ] **UX-04 Layout hierarchy (P1):** Map, story, and HUD use the available
  viewport deliberately: no cramped story/action area beside a large empty
  panel; choices never clip; Journal detail has adequate reading/operation area.
- [ ] **UX-05 Keyboard contract (P1):** arrows/WASD move only in World; 1–3
  selects only visible story choices; `I` opens Journal only in World; `Esc`
  exits Journal; encounter, combat, death, and ending states block unrelated
  world shortcuts. Every blocked key has a browser test.
- [ ] **UX-06 Focus contract (P1):** entering an encounter focuses its first
  legal action; leaving it returns focus to the next story decision. No
  keyboard trap and no hidden focusable controls exist in inactive modes.

## 3. Regional map and exploration

**Primary ownership:** `src/content/locations.ts`, `src/engine/map.ts`,
`src/engine/reducer.ts`, `src/ui/GameScreen.tsx`, `e2e/game.spec.ts`.

- [ ] **MAP-01 Local geography (P1):** every region has a distinct 7×7 local
  map, named entry/exit, passable route, terrain blockers, player marker, and
  meaningful nodes. An overview image may not replace local navigation.
- [ ] **MAP-02 Node contract (P1):** each NPC/event/gather/combat/shop/storage/
  exit node triggers an authored interaction, reward, warning, or transition.
  Arriving at a node cannot merely flip an invisible flag.
- [ ] **MAP-03 Discoverability (P2):** next story lead is visible via an
  accessible map marker and objective, with a non-spoiler location name and
  reachable route. Marker, objective, and target must derive from the same ID.
- [ ] **MAP-04 Risk is legible (P1):** danger appears before HP loss/combat;
  protective items alter a visible rule and are consumed/preserved correctly.
- [ ] **MAP-05 Movement evidence (P1):** E2E traverses each region through its
  real exits, including blocked terrain, a danger node, and recovery from an
  old-save position.

## 4. Story, routes, encounters, and endings

**Primary ownership:** `src/content/story.ts`, `src/engine/story.ts`,
`src/engine/reducer.ts`, `src/engine/narrator.ts`, `src/ui/endingEpilogue.ts`.

### 4.1 Narrative promise

- [ ] **STORY-01 Premise pay-off (P1):** the defective spirit root is useful
  in authored play, not only stated in prose: it enables/changes an encounter
  or choice and carries a cost/trade-off.
- [ ] **STORY-02 Tone (P2):** every chapter contains concrete character voice;
  Scenario I includes warm absurd humour as well as danger and catharsis.
  Vietnamese is authored prose, not English syntax translated word-for-word.
- [ ] **STORY-03 Full arc (P1):** letter → forgotten name → Ha’s testimony →
  Vo/Khoa trial → past-life confession → final choice is playable in order,
  coherent without reading source, and reaches an ending.
- [ ] **STORY-04 Surface agency (P1):** three authored choices plus free text
  exist at each required beat. The correction system redirects impossible input
  in-world after repeated attempts; it never tells the player that a rail or
  forced convergence exists.

### 4.2 Route encounter contract

- [ ] **ROUTE-01 Route divergence (P1):** mercy, wealth, and truth each lead
  to a distinct reachable map node, distinct named NPC, distinct encounter
  text, and at least one different resource/relationship outcome.
- [ ] **ROUTE-02 Real encounter (P1):** arrival enters an exclusive encounter
  mode; World and Journal are unavailable; a focused legal action resolves it;
  only then do route choices unlock. Reducer, component, and E2E prove each
  route.
- [ ] **ROUTE-03 Encounter agency (P1):** each route encounter presents at
  least two mutually exclusive player actions or a meaningful stat/item gate.
  Each result differs in proof, cost/reward, or later dialogue. A single
  mandatory “continue” action does not satisfy this requirement.
- [ ] **ROUTE-04 Proof is a game object (P1):** proof has a stable ID and is
  carried in deterministic state. It appears in the Chronicle and UI, can be
  inspected in Journal, and is not merely inferred from the chosen route.
- [ ] **ROUTE-05 Proof has consequences (P1):** at the Sealed Cave and Sect
  Trial, each proof enables, changes, blocks, or improves at least one authored
  action/line/reward. `story_route_proof` (or equivalent) must be read by
  reducer/story rules; cosmetic copy alone fails.
- [ ] **ROUTE-06 Consequence survives convergence (P1):** routes may converge
  structurally, but their proof/relationship choice changes at least two later
  scenes and one ending epilogue. Test one later effect before the ending and
  one terminal effect for every route.
- [ ] **ROUTE-07 Honest objective copy (P2):** objective and lock copy name
  only the active NPC/lead, never a slash-list of all possible NPCs.

### 4.3 Companions and endings

- [ ] **STORY-05 Companion feedback (P1):** choosing Mai Hoa, Bảo, or Ngô as
  companion changes their later dialogue at a reachable node and produces a
  distinct ending reflection.
- [ ] **STORY-06 Ending differentiation (P1):** all authored endings have a
  unique terminal state, explanation, restart path, and accumulated-choice
  epilogue. Ending selection is not based only on the final button.
- [ ] **STORY-07 No soft lock (P0):** every valid state has a legal path to a
  terminal state; invalid free text cannot trap or corrupt a run.

## 5. RPG systems and meaningful progression

**Primary ownership:** `src/engine/*`, `src/content/{items,rpg,quests}.ts`,
`src/ui/GameScreen.tsx`.

- [ ] **RPG-01 Combat (P1):** attack, defend, legal item use, damage, death,
  drops, and a protective item all work in a browser journey.
- [ ] **RPG-02 Economy (P1):** one material has a meaningful sell-versus-
  exchange choice; shop, storage, capacity, and reload persistence are tested.
- [ ] **RPG-03 Cultivation (P1):** five tiers, progress, talents, manuals,
  techniques, and equipment form at least one complete viable build path from
  fresh run to ending.
- [ ] **RPG-04 Unlock discipline (P2):** unavailable content is hidden or a
  dim non-spoiler silhouette with requirement; the Journal never dumps the full
  future catalogue on a new player.
- [ ] **RPG-05 Items are real (P1):** every shown usable item/equipment/manual
  has an acquisition source, deterministic effect, UI feedback, localization,
  art, and test. Decorative catalog entries do not count.
- [ ] **RPG-06 Core systems journey (P1):** a single Playwright journey proves
  map → interaction → combat/gather → item → shop/exchange → storage →
  talent/technique/equipment → save reload.

## 6. Content, assets, localization, and accessibility

**Primary ownership:** `src/content/**`, `src/assets/**`, `src/i18n/**`,
`src/ui/**`.

- [ ] **CONTENT-01 NPC contract (P1):** exactly 30 named NPCs have distinct
  portrait, localized identity, map location, relationship hook, and a
  meaningful gameplay connection. No placeholder/group portrait counts.
- [ ] **CONTENT-02 Asset truth (P1):** manifest counts only real files; each
  asset is mapped to a stable content ID; a missing file renders a truthful
  fallback and cannot make a pack report “ready.”
- [ ] **CONTENT-03 Illustrated feedback (P2):** region art, NPC art, player
  poses, items, talents, techniques, and equipment use coherent illustrated
  assets. Action motion follows actual reducer events and honours reduced
  motion.
- [ ] **CONTENT-04 VI/EN parity (P1):** every player-facing content record is
  bilingual; language persists across reload; Vietnamese is reviewed for natural
  cultivation voice and English is an adaptation, not literal translation.
- [ ] **CONTENT-05 Accessibility (P1):** all controls are keyboard reachable,
  focus is visible, contrast meets WCAG AA, labels accompany art-only meaning,
  and `prefers-reduced-motion` is honoured.

## 7. AI boundary and expansion safety

**Primary ownership:** `src/ai/**`, engine/content schemas, save migration.

- [ ] **SAFE-01 AI is optional (P0):** Scenario I reaches every ending with
  local AI disabled or unavailable.
- [ ] **SAFE-02 AI cannot mutate rules (P0):** AI prose cannot change state,
  rewards, combat, locked routes, or endings; only the deterministic reducer
  can do so.
- [ ] **SAFE-03 Secret safety (P0):** no API key appears in source, browser
  bundle, tests, screenshots, commits, artifacts, or documentation.
- [ ] **SAFE-04 Expansion data contract (P1):** adding Scenario II is data,
  assets, validation, and migration where necessary; it does not rewrite
  Scenario I rules or invalidate a supported save.

## 8. Required automated acceptance matrix

| ID | Layer | Required proof |
| --- | --- | --- |
| A-01 | Reducer | all route states: target → arrived → encounter result → proof → later choice |
| A-02 | Reducer | every proof read at cave, trial, and terminal epilogue |
| A-03 | Component | exclusive encounter mode, proof UI, locked shortcuts, correct objective copy |
| A-04 | Playwright | normal fresh boot, then each route through physical map movement and encounter action |
| A-05 | Playwright | proof-specific cave/trial outcomes; no fixture may skip the proof action |
| A-06 | Playwright | all endings plus death from legal browser actions |
| A-07 | Playwright | reload in World, Journal, encounter, combat, and after a proof is earned |
| A-08 | Visual | 1280×800 and 1600×900 World/Journal/encounter/combat/death/ending screenshots; no outer scroll |
| A-09 | Quality | typecheck, lint, full Vitest, production build, full Playwright pass |

## 9. Worker handoff template

Every implementation request must use this format:

```text
Acceptance IDs: ROUTE-04, ROUTE-05, A-01, A-02, A-05
Owner files: src/engine/story.ts, src/engine/reducer.ts, src/content/story.ts,
             src/ui/GameScreen.tsx, test/endings.test.ts, e2e/game.spec.ts
Out of scope: unrelated UI restyling, asset generation, new Scenario II content
Player path: [fresh seed → named steps]
State proof: [stable proof ID and the later rules that read it]
Visible proof: [where player sees it]
Commands: npm run typecheck; npm run lint; npm test; npm run build;
          npx playwright test
Close only when: [specific acceptance IDs are evidenced]
```

The worker must not mark its own issue done. A separate reviewer verifies the
actual diff and reruns the specified gate. `artifacts/` and other unrelated WIP
remain out of commits unless explicitly included in the task.

## 10. Current opening remediation queue

These are deliberately open, derived from the latest reviewed branch. They are
not claims that implementation is complete.

| Priority | Acceptance IDs | Required outcome |
| --- | --- | --- |
| P0 | GATE-02, UX-01 | Repair the canonical E2E boot helper so all browser acceptance paths start the game and pass from a clean context. |
| P1 | ROUTE-04, ROUTE-05, A-02, A-05 | Turn route proof into a stable inspectable item/evidence record and make each proof alter cave and trial choices or outcomes. |
| P1 | ROUTE-03 | Give each on-site encounter two meaningful actions or a genuine stat/item gate with divergent proof/cost. |
| P1 | GATE-03, STORY-06, A-06 | Add fresh-run browser paths to every story ending and death; fixtures may supplement but not replace them. |
| P2 | ROUTE-07 | Make objective copy name the active lead only and review VI/EN phrasing. |
| P2 | UX-03, UX-04, A-08 | Capture and review the full desktop mode matrix for outer-scroll, clipping, empty-space, and focus regressions. |

### 10.1 Audit status 2026-08-31 (coordinator-verified commands, merged state)

> Evidence commands run by the coordinator on the merged working tree on
> 2026-08-31: `npx vitest run` → 202/202 pass (37 files); `npm run typecheck`
> → exit 0; `npm run lint` → exit 0; `npx playwright test e2e --workers=1` →
> 32/32 pass. Per-phase detail in `docs/agent-work/handoffs/`. Per §0, these
> rows record implemented-and-verified state, not closed checkboxes — closure
> still requires reviewer sign-off plus build/screenshot review proof.
>
> **Cập nhật 2026-08-31 (đợt mở khóa cổng):** `npm run build` → ✓ built in 1.73s
> exit 0 (GATE-01). `e2e/save-reload.spec.ts` 5/5 (GATE-04): exploration, route
> encounter, combat, Journal, pre-ending reload — all preserve schema-valid state.

| Queue row | Implementation status | Verified by |
| --- | --- | --- |
| GATE-01 Build integrity | `npm run build` → exit 0, ✓ built in 1.73s | coordinator run 2026-08-31 |
| GATE-02, UX-01 (boot helper) | Implemented — 32/32 Playwright pass from clean context | coordinator E2E run |
| GATE-03, STORY-06, A-06 (fresh endings) | Implemented — 8/8 fresh-endings journeys pass incl. tragic_death | coordinator E2E run |
| GATE-04 Save safety (all 5 modes) | Implemented — `e2e/save-reload.spec.ts` 5/5 (exploration, route encounter, combat, Journal, pre-ending) | coordinator E2E run 2026-08-31 |
| ROUTE-04/05 (proof as evidence record) | Implemented earlier (commit e7b102a); `test/route-proof-record.test.ts` 3/3 pass | story handoff + coordinator unit run |
| ROUTE-05 proof consequences (cave/trial) | Implemented — 6 route-proof choices (3 cave, 3 trial); `test/story-consequences.test.ts` pass | story handoff + coordinator unit run |
| ROUTE-03 (encounter agency) | Implemented — combat decision layer; `test/combat-agency.test.ts` 10/10 pass | regression handoff + coordinator unit run |
| ROUTE-07 (objective copy) | Partially implemented (route-focused objective earlier commits); full VI/EN copy review not yet evidenced | — |
| UX-03, UX-04, A-08 (visual matrix) | `e2e/acceptance-visual.spec.ts` 12/12 pass (1280×800, 1600×900, no outer scroll) | docs-audit evidence; full matrix review still open |

Scenario II (Phase 8, `docs/design-review-2026-08.md`) remains gated: requires
all P0/P1 MASTER_ACCEPTANCE checkboxes closed + one round of human playtest.
Phase 6 (juice) and Phase 7 (self-playtest sim) are implemented (design-review
update 2026-08-31 batch 2).

