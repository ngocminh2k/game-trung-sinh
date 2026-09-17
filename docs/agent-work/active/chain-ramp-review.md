# Adversarial review — system-quest-chain-ramp (U1/U2)

Scope: `docs/agent-work/active/system-quest-chain-ramp.md` design + current working tree.
READ-ONLY review; no code changed. Two agents mid-edit.

## Tree state at review time

- **U1 (content) LANDED**: `src/content/system-quests.ts` — 60 quests, every `deadlineDays` removed (0 hits in defs), `requiredFlags: ['quest_q_sys_<pool>_<NN>_done']` on all non-heads, `nextQuestId` forward-links. Structural chain-walk confirms all 10 pools = 1 head + 5 flag-gated, reachable, difficulty non-decreasing. **No silent-deadlock in the authored data.**
- **U2 (engine) NOT LANDED**: `src/engine/system-runtime.ts:28-39` `systemQuestsFor` still returns the full unfiltered pool. `test/system-quest-chain.test.ts` exists and is RED purely on the missing filter (returns 6, wants 1) — expected, not a design flaw.
- **Chain validator LANDED**: `src/content/index.ts:104-132` `validateSystemQuestChains`, wired into `validateAllContent` at `index.ts:251`. Flag regex `^quest_q_sys_([a-z]+)_(\d\d)_done$` (`index.ts:95`) matches what the reducer actually writes. `test/content-validation.test.ts` = 20 green.

## Flag-name correctness (hunt #1) — VERIFIED CORRECT

`doCompleteQuest` writes `` `quest_${questId}_${FLAG_QUEST_DONE}` `` (`reducer.ts:1851`); `FLAG_QUEST_DONE` destructures positionally to `'_done'` (slot 15 of `FLAG_KEYS`, `flag-keys.ts:43` — counted, correct). `questId` carries the `q_` prefix → real key `quest_q_sys_battle_01_done`. Matches content, validator, and `isQuestUnlocked` (`quests.ts:37`). End-to-end consistent. (Fragility note under LOW.)

---

## Findings (severity-ordered)

### [CRITICAL] Legacy-save expiry deadlock — removing `deadlineDays` does NOT clear already-written expiry flags
- **TRUE NOW (already broken in tree once U1 landed) + gets worse after U2.**
- `canCompleteQuest` reads the *state* flag unconditionally, with no `def.deadlineDays` guard: `quests.ts:114-115`
  ```
  const expiry = state.flags[`quest_${questId}_expires_day`]
  if (typeof expiry === 'number' && state.day > expiry) return { ok: false, code: 'QUEST_WRONG_STATE' }
  ```
  The expiry flag is written *at accept time* (`reducer.ts:1804-1806`) only when `def.deadlineDays` existed — i.e. every pre-change system-quest accept already baked a `quest_q_sys_*_expires_day` number into `state.flags`.
- Pre-change, an expired system quest was already un-turn-in-able, but that did **not** block its siblings (no gating). Post-U1, an expired head `_01` means `_01` never writes `quest_q_sys_battle_01_done`, so `_02…_06` are gated shut forever. There is **no abandon/reset path** (grep confirms: nothing sets a `state.quests[id]` back to available / clears quest flags).
- This directly refutes the doc's "world flag / deadlineDays has no consumers outside flow" framing: the *expiry flag* IS a live consumer of the removal, and legacy saves hit it. Any save that accepted a system quest and crossed its deadline before the patch is a hard chain-lock.
- **Minimal fix**: gate the expiry read on the def — in `quests.ts:114` wrap the check in `if (def.deadlineDays !== undefined) { … }` so a deadline-less def ignores any stale expiry flag. (Alternative/cleaner: a v1→v1 migration step in `migration.ts` deleting `quest_q_sys_*_expires_day`/`_started_day` keys — but the def-guard is one line and also protects future def edits.)

### [HIGH] `test/system-notifications.test.ts:35` is RED now and is NOT in the doc's P1/P2 break list
- **TRUE NOW.**
- U1 removed `deadlineDays`, so `doAcceptQuest`'s `days: def.deadlineDays ?? 0` (`reducer.ts:1821`) now enqueues `vars.days = 0`, but the test asserts `.toBe(2)`.
  Vitest run confirms: `queues the quest-loaded announcement … expected +0 to be 2`.
- The doc's Verification only enumerates `ai-system.test.ts:22` (P1) and `system-quests.test.ts:33` (P2). AC2 ("all listed tests green") will fail until this line is also updated — the design's blast-radius list is incomplete.
- **Minimal fix**: update `test/system-notifications.test.ts:35` to expect `days` `0` (or drop the `days` assertion) alongside the P1/P2 edits, and add it to the doc's affected-tests list.

### [MEDIUM] Accept-vs-display desync window: AI offers gated on `questPool` only, not on unlock (self-heals on U2)
- **TRUE NOW (transitional), resolves once U2 lands.**
- `requestSystemReply` rejects an offer only if `!payload.questPool.some(q => q.id === reply.questId)` (`ai/system.ts:82`), and `questPool` is `systemQuestsFor(game)` (`ai/system.ts:55`). Pre-U2 that pool contains all 6, so the model can offer `_03`; `GameScreen.tsx:840` renders a live Accept button for it; clicking → `doAcceptQuest` → `canAcceptQuest` → `isQuestUnlocked` fails on the unset flag → `QUEST_WRONG_STATE` no-op with a button that looked actionable.
- The U2 pool filter is exactly what closes this (locked quests leave the pool, offers get rejected server-boundary side). Design is correct; flag is to make sure U2's filter uses the **same** predicate as `canAcceptQuest`, not a weaker one.
- Note the predicate asymmetry to preserve: U2's proposed `state.quests[def.id] !== undefined || requiredFlags.every(...)` keeps **completed** defs listed (status `completed`), whereas `isQuestUnlocked` additionally requires `state.systemId === def.requiredSystemId`. For the single-system, flag-persists-per-run model they agree; do not "simplify" the U2 predicate down to `isQuestUnlocked` (the doc's P4 deliberately avoids that import) but be aware completed-heads stay visible and are labeled `system.locked` ("Đã khóa") at `GameScreen.tsx:833` — cosmetic, see LOW.
- **Minimal fix**: land U2 filter verbatim so `questPool` ⊆ acceptable set; no other change needed.

### [LOW] `secret: true` is dead metadata — head discovery is safe (hunt #4 negative result)
- `def.secret` is declared (`content-types.ts:306`, `schema.ts:293`) and asserted (`system-quests.test.ts:32`) but **never read** by engine/UI (grep: only type/schema/comment hits; SkillTreePanel/NpcChatModal `secret` hits are unrelated domains). So the `sys_deadline_near`/quest-board path does not depend on it.
- Discovery is by `systemQuestsFor` including the head (`requiredFlags: []` → `.every()` true) and the panel rendering Accept. **Pool can never be empty on a fresh pick** (heads always pass) and the chain validator + `system-quest-chain.test.ts` guarantee exactly one head per pool. No "only visible head hidden" case. Safe — no fix.

### [LOW] `nextQuestId` has no UI/consumer risk (hunt #3 negative result)
- Only readers: generic `index.ts:175` "nextQuest not found" and the new chain validator. `grep nextQuestId src/ui` → none. Completion counter `panels.tsx:505` iterates the **full** `QUESTS` array (all 60 counted regardless of pool filtering), achievement `quest_done` (`achievements.ts:31-32`) is a `some(completed)` — none enumerate the 6 per pool or key off `nextQuestId`. Hiding `_02…_06` from the panel cannot skew completion-% or any unlock flag. Safe.

### [LOW] `world_<id>_cleared` never written for system quests after removal — dead but harmless (confirms doc P2)
- Sole writer `reducer.ts:1855`, guarded on `def.deadlineDays !== undefined`; grep shows no consumer. Authored world quests (`q_world_*`, still have `deadlineDays`) keep writing it. System quests simply never do. Correct-as-intended; just note the reviewer's grep found the same empty consumer set.

### [LOW] `sys_deadline_near` message id is defined but has no emitter
- `system-messages.ts:52` declares `sys_deadline_near` ("còn {days} ngày"); grep for any `queuePush(... 'sys_deadline_near')` → none. Pre-existing dead template, adjacent to the `days`/deadline code being touched here — worth deleting in the P3 pass rather than leaving orphaned, but not introduced by this change.
- **DISPOSITION (2026-09-15): KEPT.** Planned T14 content (`docs/plans/expansion-x20/tasks/T14-system-interface.md` lists it among the intended ids; world quests `q_world_*` still carry `deadlineDays`, so the emitter is future work, not removed work). P3 lane landed without touching it. Revisit if T14 closes without an emitter.

### [LOW] Positional `FLAG_KEYS` destructuring binds `FLAG_QUEST_DONE` (fragile)
- `reducer.ts:104-121` maps `FLAG_QUEST_DONE` to array slot 15 = `'_done'` (verified correct now). Any insert/reorder in `flag-keys.ts` silently rebinds it and deadlocks every chain. `test/system-quest-chain.test.ts:15` re-declares its own `FLAG_QUEST_DONE='_done'` literal instead of importing, masking this in tests. Out of U1/U2 scope, but note it: prefer a named `export const FLAG_QUEST_DONE` in `flag-keys.ts` when next touching this.
- **DONE 2026-09-15 (flagexport agent):** 12 named `FlagKey`-typed exports added to flag-keys.ts (additive; FLAG_KEYS order untouched), reducer's positional destructure deleted, test mirror replaced with real import. Swap-experiment proved the old pattern silently rebound `_done`→`defeated` while the named export survives. Follow-up discovered: the pre-fix `__done` writer had ALSO deadlocked the main-story chain (`src/content/quests.ts` — 10 `requiredFlags: ['quest_q_main_*_done']`) and the `erase_system` ending gate (`story.ts:133`) — one reducer line, every chain in the game; now fixed and compile-locked.

### [LOW, disproven] `isQuestUnlocked` hides an ACTIVE chain quest whose predecessor flag is unset (journey-agent note, e2e lane)
- Claim: `quests.ts:37` checks `requiredFlags` even when `status === 'active'`, so AC5 ("never lose an in-flight quest") could fail on the journal Quests tab (`panels.tsx:508`).
- **Unreachable via play**: an active `_02` exists only if `canAcceptQuest` → `isQuestUnlocked` passed at accept time, which required `quest_q_sys_battle_01_done` — and nothing in the engine clears quest flags (no abandon/reset path, grep-confirmed). Hand-seeded states can fake the divergence; saves cannot.
- **DISPOSITION: no code change.** The panel (systemQuestsFor, `state.quests[id] !== undefined` short-circuit) already honors AC5 unconditionally, which is why `e2e/system-quest-chain.spec.ts:145` passes on the panel surface.

### [FIXED] `.proto-map .veil` / `.grid-overlay` swallowed legacy-HUD clicks
- Decorative `position:absolute; inset:0` overlays with no `pointer-events: none` intercepted Accept-quest clicks at ≤800px (Playwright: "grid-overlay … intercepts pointer events"; the same cause under system-pick:34/:51 baseline-red). Fix: two `pointer-events: none` lines in `screens.css:1369-1381`. Unblocked the 4th chain journey test (was `test.fixme`; now 4/4 green, 11.1s).

### Determinism / save roundtrip (hunt #7) — PASS
- `systemQuestsFor` filter is a pure read of `state.quests` + `state.flags`; `pool` order is the frozen `SYSTEM_QUESTS` order; `activeExtras` iterates `Object.keys(state.quests)` exactly as the current code already does. No new rng/Date, no new state field, no iteration-order change. No save/schema impact (`GameStateSchema.flags` is an open record). AC6 (no new `requiredStage`/schema field) satisfied by the landed content.

---

## Verdict

Design is sound and the *authored* chain has no silent deadlock. The one blocking defect is the **CRITICAL legacy-save expiry deadlock** — the doc's P2 fix (remove `deadlineDays`) prevents *new* expiries but does nothing for expiry flags already in saves, and `canCompleteQuest` keeps honoring them. Ship must include the `def.deadlineDays` guard in `quests.ts:114` (or a migration) or any player who accepted-then-let-expire a system quest is permanently chain-locked. **HIGH** (`system-notifications.test.ts`) is already-red and just missing from the doc's break list. Remaining items are LOW/negative-results or resolve when U2 lands.
