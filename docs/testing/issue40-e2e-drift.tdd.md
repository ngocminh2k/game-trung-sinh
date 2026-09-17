# Issue #40 E2E spec-drift — TDD evidence report

Source: `docs/agent-work/active/issue40-triage.md` (triage intent: each red is
either DRIFT — fix the spec — or a REAL BUG — file it, never fake-green). Journeys
derived from the triage buckets; no external plan file.

## Guarantee table (what the passing suite proves)

| # | What is guaranteed | Test anchor | Type | Result | Evidence |
|---|--------------------|-------------|------|--------|----------|
| 1 | Full e2e suite green, zero skips (98 tests) | `e2e/*.spec.ts` | e2e | PASS | `npx playwright test --reporter=json` → 98/0/0/0 (closure run e2e-close.json, supersedes e2e-r7sweep.json) |
| 2 | Unit suite green after the same wave | `test/*.test.ts(x)` | unit | PASS | `npx vitest run` → 918 passed / 0 failed / 0 pending (vitest-close.json) |
| 3 | Live v1→v2 save migration (end-to-end counterpart to the unit proof) | `e2e/save-slots.spec.ts` W1 | e2e | PASS | asserts loaded slot `version === 2` on the suite's only live v1 seed; unit side `test/migration.test.ts:46` |
| 4 | Epoch-savedAt softlock avoided; resume path actionable | `e2e/save-reload.spec.ts` openGame (`savedAt: Date.now()`) | e2e | PASS | 5/5; root cause + arithmetic in round2-queue ROUND 7 |
| 5 | System quest accept/turn-in announce load + exact rewards via the player-real journal route | `e2e/system-notifications.spec.ts` | e2e | PASS | 2/2; feed cap de-tautologised, real unit test at `test/system.test.ts:108-113` |
| 6 | Quest-chain journeys (10 pools × chained quests, `_done` gating) | `e2e/system-quest-chain.spec.ts` + `test/system-quest-chain.test.ts` | e2e+unit | PASS | full-suite runs |
| 7 | Hidden-viewport assertions eliminated (location-label read where visible) | `e2e/save-reload.spec.ts` viewport rule | e2e | PASS | 800×900 before `toHaveText` |
| 8 | Death surface strictness (no OR with ending banner) | `e2e/acceptance-visual.spec.ts:170` | e2e | PASS | `.death-screen` only |
| 9 | Gates clean | tsc / eslint | static | PASS | exit 0 both (gate-r7.txt; re-run closure wave) |

## Known gaps / filed follow-ups

- **#42** (created 2026-09-15): legacy `.system-panel` buttons unreachable at every
  width — ≤920 the `DIV.proto-map` container hit-tests over `.world-content`
  (measured by throwaway probe; the requested `.painting` pointer-events one-liner
  is a verified no-op), ≥921 the column is `display:none`. Specs route through the
  journal instead. Deliberately NOT fixed inside #40: needs a stacking design call.
- `queueDrain` cap and migration chains remain unit-tested; no e2e duplication
  (tautology removal, r7-review).
- No checkpoint commits: the session operates under an explicit user constraint
  that NOTHING is committed; all work sits in the working tree. RED/GREEN evidence
  lives in this report + the ROUND 7 / 7b journal instead of commit trailers.
