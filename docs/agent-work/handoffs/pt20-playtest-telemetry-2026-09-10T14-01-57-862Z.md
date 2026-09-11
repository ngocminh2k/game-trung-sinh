# Active claim: pt20-playtest-telemetry

- Owner: claude
- Claimed: 2026-09-10T13:56:46.238Z
- Objective: Issue #20: human playtest protocol, client telemetry, post-ending survey
- Scope: docs/testing/playtest-protocol.md, src/ui/playtest.ts, src/ui/PlaytestSurveyCard.tsx, src/App.tsx, src/i18n, src/ui/screens.css, test/playtest-*
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: claude
- To: reviewer
- Handed off: 2026-09-10T14:01:57.862Z
- Completed or current state: Issue #20 done: playtest protocol doc, localStorage telemetry (path+derived deliberation time), post-ending survey card
- Touched files: docs/testing/playtest-protocol.md, src/ui/playtest.ts, src/ui/PlaytestSurveyCard.tsx, src/App.tsx, src/i18n/vi.ts, src/i18n/en.ts, src/ui/screens.css, test/playtest-telemetry.test.ts, test/playtest-survey.ui.test.tsx
- Verification: typecheck: clean; vitest playtest tests: 9/9; full npm test: 691/696 (5 pre-existing at fb9f4d3); lint: only pre-existing cocos-*.mjs errors; build: OK
- Known risks or blockers: fresh-endings e2e red on clean HEAD too (baseline, see memory e2e-baseline-broken-fb9f4d3)
- Next action: Review PR, then run one moderated human playtest session per protocol
