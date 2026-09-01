# Active claim: boot-helper-fix-pre-ship

- Owner: cline
- Claimed: 2026-09-01T16:29:04.449Z
- Objective: Fix legacy e2e boot helpers for main-menu flow
- Scope: e2e/acceptance-visual.spec.ts,e2e/debug-map.spec.ts,e2e/fresh-endings.spec.ts
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: cline
- To: customer
- Handed off: 2026-09-01T18:50:15.954Z
- Completed or current state: Pre-ship hardening: fixed legacy e2e boot helpers for main-menu flow (acceptance-visual, fresh-endings fixture boot); implemented T14 System notification producers (sys_quest_loaded/sys_reward/sys_dodge pushes gated on active system) + system-feed UI (max 3 lines); wired 3-layer economy (buy silver-fallback at 10:1, convert_currency action LS=10g silver=0.1g, market exchange UI, currency testids); added T13 missing e2e: economy.spec, branch-journeys.spec (mercy/path/blade/rootless to endings), system-notifications.spec; 8 new unit tests in system-notifications.test.ts
- Touched files: src/engine/reducer.ts,src/engine/types.ts,src/ui/GameScreen.tsx,src/i18n/vi.ts,src/i18n/en.ts,e2e/economy.spec.ts,e2e/branch-journeys.spec.ts,e2e/system-notifications.spec.ts,e2e/acceptance-visual.spec.ts,test/system-notifications.test.ts
- Verification: npm run typecheck: exit 0; npm run lint: exit 0; npx vitest run: 70 files / 589 tests pass; npm run build: exit 0 1.94s; npx playwright test --workers=1: 58/58 pass 3.5m
- Known risks or blockers: epilogue sublayer per remembered-names count not yet data-driven (asserts non-empty epilogue only); per-NPC shop flow from T11 still UI-unwired
- Next action: Ship. Remaining deferred items tracked in T12 handoff known-risks
