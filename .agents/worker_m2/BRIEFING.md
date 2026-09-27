# BRIEFING — 2026-09-20T04:56:00+07:00

## Mission
Implement Milestone 2: 2-Tier Pipeline in The System (`src/ai/system.ts`) with Jev System One fast reflex classification and deterministic in-character fallback.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\.agents\worker_m2
- Original parent: c32728b6-eadd-4f93-a876-f4f10e8ff39a
- Milestone: UI Icon Shortfall (Event Pins)
- Archetype: teamwork_preview_worker
- Roles: implementer, qa, specialist
- Working directory: F:\game-trung-sinh\.agents\worker_m2
- Original parent: 5a466b68-3f91-467f-ac59-2dbf53885d36
- Milestone: Milestone 2 (2-Tier Pipeline in The System)

## 🔒 Key Constraints
- Exclusively own and create exactly 23 PNG files in `src/assets/art/pins/event/`:
  1. `bamboo-rampart.png`
  2. `old-house.png`
  3. `village-well.png`
  4. `fortune-wheel.png`
  5. `tea-house.png`
  6. `arena.png`
  7. `treasure-pavilion.png`
  8. `meditation-wall.png`
  9. `herb-terrace.png`
  10. `fog-crossroads.png`
  11. `cloud-nest.png`
  12. `wind-bell.png`
  13. `nameless-stele.png`
  14. `wind-cliff.png`
  15. `herb-garden.png`
  16. `dry-oasis.png`
  17. `ice-mirror.png`
  18. `auction-stall.png`
  19. `caravan-teahouse.png`
  20. `moon-water.png`
  21. `lotus-pond.png`
  22. `broken-stele.png`
  23. `cloud-library.png`
- Each icon must be genuine 128x128 PNG with 8-bit alpha transparency.
- 4 corners alpha = 0, transparent ratio between 15% and 98%, outer border margin transparent.
- Style: Vietnamese ink-wash (*mực tàu giấy bản*) base `#180F09` with Turquoise / Ngọc lam accent `#178771` (oklch(56% 0.10 175)). Centered subject, ~10% padding. No modern gradients, no 3D, no emojis, no borders, no text.
- No dummy/facade implementations.
- Verification must pass with `scripts/verify-ui-icons.mjs`.
- Exclusively own and edit: `src/ai/system.ts` and agent claim via `npm run agent:claim`.
- Do NOT edit other files unless strictly necessary for compilation.
- Implement 2-Tier Pipeline combining Jev System One (~80ms) and LLM (/api/narrate).
- Provide deterministic in-character fallback when offline or error.
- Enforce hallucination defense: reject unauthorized quest IDs to null.
- Scenario Containment: DO NOT import from `../content/(story|npcs|locations|endings-data|chapters|quests)`.
- Verification commands: npm run typecheck, npx vitest run test/ai-jev-system.test.ts, npx vitest run test/ai-system.test.ts, npx vitest run test/system-scenario.test.ts, npx eslint src/ai/system.ts src/ai/jev-schemas.ts src/ai/jev-client.ts, and npm test.

## Current Parent
- Conversation ID: 5a466b68-3f91-467f-ac59-2dbf53885d36
- Updated: 2026-09-20T04:56:00+07:00

## Task Summary
- **What to build**: 2-Tier Pipeline in `src/ai/system.ts` connecting Jev System One fast reflex classification (~80ms) and Frontier LLM generative narration (/api/narrate) with deterministic in-character fallback.
- **Success criteria**:
  - `classifySystemUtterance` integrated as Tier 1.
  - `SystemChatPayload` enriched with fastDecision.
  - `buildDeterministicSystemReply` returns lore-accurate in-character bilingual responses when offline/error.
  - Hallucination defense rejects unpooled quest IDs.
  - All test suites and linting pass with 0 errors.
- **Interface contracts**: `PROJECT.md`, `jev_integration_spec.md`

## Key Decisions Made
- Function overloading on `buildDeterministicSystemReply` so it seamlessly accepts both `(game, message, locale, fastDecision)` and `(game, fastDecision, locale)`.
- Kept `fastDecision` optional in `SystemReply` so that existing strict `.toEqual()` assertions in `test/ai-system.test.ts` pass without regression.
- Both `fastDecision` and `jevDecision` keys set in `SystemChatPayload` to support any downstream consumers.

## Artifact Index
- `src/ai/system.ts` — Updated 2-Tier Pipeline implementation
- `docs/agent-work/active/jev-system-two-tier.md` — Active claim
- `.agents/worker_m2/progress.md` — Progress log
- `.agents/worker_m2/handoff.md` — Handoff report

## Change Tracker
- **Files modified**: `src/ai/system.ts`, `docs/agent-work/active/jev-system-two-tier.md`
- **Build status**: PASS (npm test 150/150 suites passed, 1246/1246 tests passed)
- **Pending issues**: None

## Quality Status
- **Build/test result**: PASS (Typecheck 0 errors, Vitest 150/150 passed)
- **Lint status**: Clean (0 errors, 0 warnings across all in-scope files)
- **Tests added/modified**: Verified against `test/ai-jev-system.test.ts`, `test/ai-system.test.ts`, `test/system-scenario.test.ts`, full regression suite

## Loaded Skills
- None specified
