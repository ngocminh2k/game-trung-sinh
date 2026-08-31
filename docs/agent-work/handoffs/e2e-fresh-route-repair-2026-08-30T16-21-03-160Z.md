# Active claim: e2e-fresh-route-repair

- Owner: claude-e2e
- Claimed: 2026-08-30T14:09:09.833Z
- Objective: Close Phase 0 browser integrity and fresh-run route proof without weakening assertions.
- Scope: e2e/fresh-endings.spec.ts, e2e/debug-map.spec.ts, browser helper/config only
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: claude-e2e
- To: codex-root
- Handed off: 2026-08-30T16:21:03.161Z
- Completed or current state: Stopped after exceeding the one-hour budget while blocked reproducing fresh-ending map visibility failures; no verified fix or handoff was produced.
- Touched files: e2e/fresh-endings.spec.ts, e2e/debug-map.spec.ts
- Verification: Baseline had at least Mercy village-elder and Truth market-teahouse visibility failures; no green rerun recorded.
- Known risks or blockers: Do not weaken assertions or inject state; inspect working-tree diff before reassigning.
- Next action: Run one bounded 15-minute root-cause task that captures map position/visibility state and proposes the minimal correct route/helper fix.
