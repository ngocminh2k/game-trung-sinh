# Round-2 queue — status live (refreshed round 5, 2026-09-15)
## CLOSED (all verified with tests + evidence comments on the issues)
- [x] #31 topbar dead-click. Root cause was NOT pointer-events: `screens.css .proto-shell-wrap ~ .world-content { display:none }` let the static `header.topbar` grid item stretch over main, buttons landing under `.proto-grid-main`. Fix = z-index 31 + container click-through + controls re-enabled. Evidence: `docs/playtest-ai/shots/issue31-*.png`, `e2e/issue31-dead-click.spec.ts` (8 pass, anti-vacuous guard).
- [x] #32 EN localization (2 implement→review→fix rounds; node graph vi/en same shape; `test/npc-chat-bilingual.test.ts`).
- [x] #33 skill-tree / tu luyện UI (`src/ui/gameScreen/skillTree/`, `test/issue33-skill-tree-ui.test.tsx`, `e2e/issue33-skill-tree-journey.spec.ts`).
- [x] #34 encounter∩gate softlock (`state.encounter === null` guard in the gate) + silent-discard narration (dropUnspendablePoints returns count → finalize emits WARNING). RED-against-old-code proven: `test/issue34-attribute-gate.test.tsx`, `e2e/issue34-attribute-banner.spec.ts`.
- [x] #35 crit visual (`test/issue35-crit-visual.test.tsx`, `e2e/issue35-crit-visual.spec.ts`).
- [x] #36 narration consequences / show price+EV+refusal reason (`test/issue36-narration-consequences.test.ts`).
- [x] #37 danger telegraph. `travelCostMod` was dead data — now applied in doMove; `src/engine/telegraph.ts` (read-only, rng-free) mirrors the exact formula incl. once/day/zone throttle + talisman ward; surfaced in ProtoShell pin aria-label + pin-tip (`data-testid="pin-risk-x-y"`) and GameScreen title; out-of-tier `doStartEncounter` emits WARNING (VI+EN). `test/issue37-telegraph.test.ts` 24 tests (bracket property 4 seeds × 4 days), e2e in issue37-38 spec.
- [x] #38 modal escape affordance + avatar double-read + resume context. `resumeContextLine` appended at BOTH resume points in App.tsx (`withResumeContext`, idempotent, chronicleKinds-aligned); people/path-tab avatars `aria-hidden`; path tab shows authored TECHNIQUES names not raw ids; chat ✕ shows `Esc` kbd. `test/issue38-resume.test.ts` 5 tests, e2e 3 tests.
- [x] #39 gift loop (`test/issue39-gift.test.ts`, `test/issue39-gift-ui.test.tsx`, `src/content/npc-gifts.ts`).

## CURRENT VERIFICATION BASELINE (round 5)
- `npx tsc --noEmit` → 0 errors.
- `npx vitest run` → **112 files / 848 tests pass**.
- New specs green: `e2e/issue37-38-telegraph-and-context.spec.ts` 5/5 (+ the #31–#36 specs from earlier rounds).
- Full-run e2e drift tracked as **#40** (open): ~30 failures are stale pre-existing specs (journal modal, duplicate testids, ending banners), NOT regressions from #31–#39.

## ROUND 5 — external review (reviewer-3436) outcomes
- [x] **#35 HIGH (regression inside an already-closed issue), FIXED + reclosed.** `freshSession` seeded the wake-up line into `chronicle` with no matching `chronicleKinds` entry; `act`'s `?? []` then materialized a one-short kinds array → EVERY line got the previous line's kind (crit rendered plain; the line above it got `is-crit`). Fix = `chronicleKinds: ['game_started']` at the single seed (App.tsx `freshSession`, covers menu-new-game + restart). New regression test drives the REAL boot→act()→localStorage path (the old tests hand-fed aligned arrays and provably could not catch this) — RED-against-old-code proven by temporary revert. Evidence comment + reopen→reclose on GitHub #35.
- [x] **#34 MEDIUM 1 (dead anchor), FIXED.** `#attribute-banner-link` targets `#attribute-allocation` inside `.world-content`, which screens.css hides ≥921px → the jump always dead-ended on desktop. Link now `display:none` inside that same media query (the +1 buttons remain). e2e updated (it had pinned the dead link as "hittable" — encoded the bug); 8/8 green.
- [x] **#34 MEDIUM 2 (clickable lie mid-encounter), FIXED.** Banner offers +1 while reducer.ts refuses `allocate_attribute` in-combat with a generic error. Banner now hides while `game.encounter` is set (combat_retreat keeps the escape hatch legal, so no new stranding). New unit test RED-against-old-code proven.
- [x] Legacy-save nuance: saves written before the #35 fix keep an off-by-one kinds array (miscolour only, cosmetic, self-heals next new game) — documented in the GitHub comment, not migrated.

## ROUND 5 — second reviewer (background agent, #37/#38 change set, verdict BLOCK) outcomes
- [x] **#37 CRITICAL (float associativity), FIXED + reclosed.** Telegraph pre-factored `diff*time*weather` into one scale; the reducer multiplies left-to-right (`rolled * diff * time * weather`). IEEE multiplication is not associative at .5 boundaries: hard+Sáng+Sương at danger 1 → reducer rolls 14, old telegraph promised 13 (41 vs 40 at danger 3) — an UNDER-promise of the minimum hit, the exact bug class #37 exists to kill. Fix: telegraph.ts multiplies in reducer's operand order. Anchor test "hard + Sáng + an amplifying weather promise an EXACT min" finds a real sương day via `weatherFor` scan, asserts reducer-chain equality AND inequality vs the factored form (anti-rot tripwire). RED-proof: temp-revert to factored form fails exactly that one test. The test's own `expectedBounds` was switched to the same chain — it had mirrored the factored flaw, so both-sides-wrong would have stayed green.
- [x] **HIGH (vacuous harness), FIXED.** `walkTo` overwrote `events = result.events` per step and the bracket assertions sat behind `if (hits.length > 0)`. Now accumulates across steps; `expect(hits.length).toBeGreaterThan(0)` fails loud.
- [x] **MEDIUM (self-satisfying e2e loop), FIXED.** Path-tab spec looped `.proto-npc__name` for a `^(.)\1` stutter — impossible: the avatar initial is a SEPARATE div, the "TThương nhân" stutter is row-level concatenation. Now asserts `.proto-npc` row text + keeps the aria-hidden check.
- [x] **LOW ×2.** Dead `exitCellRisk` deleted (function + `src/engine/index.ts` re-export; grep-verified zero remaining refs). `ponytail:` comment at travelRisk's `enteringRegion` records the authored self-loop invariant assumption.
- Evidence comment + reopen→reclose on GitHub #37 (2026-09-15).

## CURRENT VERIFICATION BASELINE (round 5, final)
- `npx tsc --noEmit` → 0 errors.
- `npx vitest run` → **112 files / 852 tests pass** (+4 tests this round: 2 alignment, 1 banner-visibility, 1 float-drift anchor).
- Targeted e2e this round: issue34 spec **8/8**, issue35 spec **6/6**, issue37-38 spec **5/5**.

## STILL OPEN
- [ ] #40 e2e spec drift — rewrites/stales the old specs against the current DOM.
- [ ] RESIDUAL #31 (still true): TWO topbars coexist at ≥921px; legacy journal/exit/locale buttons float over the HUD band. Real fix = move them into ProtoShell's topbar, hide legacy at ≥921px. Touches ProtoShell.tsx + GameScreen.tsx.
- [ ] E2E BASELINE boot path: App.tsx boots straight into `loading` when an active slot exists, so menu-reaching specs stall 30s. Specs now use localStorage slot-injection instead; a deterministic `?fresh=1` boot flag would make this moot.

## FILE LOCK TABLE
Round 3/4 multi-agent fan-out is DONE — all listed agents (af2dea…, a4889…, a43fe…) have landed and released their files. No locks currently held; single-session work from here.
