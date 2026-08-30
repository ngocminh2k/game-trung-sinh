# Active claim: w1-save-slots

- Owner: claude
- Claimed: 2026-08-30T20:07:48.120Z
- Objective: 5 save slots + autosave
- Scope: src/ui/saveSlots.ts, src/App.tsx, src/i18n, test/save-slots.test.ts, e2e/save-slots.spec.ts
- Acceptance criteria: five validated slots; legacy save migrates to slot 1; active slot persists; day advancement saves the active slot; slot UI is keyboard-operable with inline delete confirmation.
- Verification plan: `npm test -- save-slots`, `npm run typecheck`, `npm run lint`, `npx vitest run`, `npx playwright test e2e/save-slots.spec.ts --workers=1`.
