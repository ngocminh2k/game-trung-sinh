# Active claim: positive-failure-deathscreen

- Owner: claude
- Claimed: 2026-09-10T00:56:38.392Z
- Objective: Implement Positive Failure: DeathScreen shows death cause + tactical hint, and next run inherits a small legacy trait
- Scope: src/ui, src/engine, src/content
- Acceptance criteria:
  - A death stamps its cause code (`combat:<enemy>` / `danger:<location>` /
    `qi_deviation`) on the dying state's `death_cause` flag, at every death
    site, via one `die()` helper so the DEATH event and the flag never drift.
  - DeathScreen shows what killed the life (localized subject), one epitaph,
    and one tactical hint — localized, no raw cause code in any narration.
  - The next run inherits exactly one attribute point from a recorded death
    (none from a clean boot), gated behind `ATTRIBUTE_ALLOCATION_REQUIRED`.
  - The cause survives save→reload (flag, not event) and is cleared on restart.
- Verification plan: `npm run typecheck`; `npx vitest run test/death.test.ts
  test/narrator.test.ts test/flag-keys.test.ts`; `npm run build`; manual: die
  in combat, reopen the save, confirm DeathScreen names the beast and restart
  gifts one point.
