# Active claim: jev-system-two-tier

- Owner: codex
- Claimed: 2026-09-19T21:52:53.367Z
- Objective: Implement 2-Tier Pipeline in src/ai/system.ts with Jev fast reflex and in-character fallback
- Scope: src/ai/system.ts
- Acceptance criteria:
  1. Integrate classifySystemUtterance from src/ai/jev-client.ts as Tier 1 fast classifier into src/ai/system.ts.
  2. Export fastClassifySystem(game, message) as a direct helper.
  3. Enrich SystemChatPayload with optional jevDecision.
  4. Implement buildDeterministicSystemReply(game, fastDecision, locale) providing authentic in-character System responses when /api/narrate is unreachable, times out, or fails.
  5. Preserve existing test invariants: return null when narration is disabled or when LLM hallucinates an unpooled quest ID.
  6. Maintain strict scenario containment: do not import from ../content/(story|npcs|locations|endings-data|chapters|quests).
- Verification plan:
  1. npm run typecheck
  2. npx vitest run test/ai-jev-system.test.ts
  3. npx vitest run test/ai-system.test.ts
  4. npx vitest run test/system-scenario.test.ts
  5. npx eslint src/ai/system.ts src/ai/jev-schemas.ts src/ai/jev-client.ts
  6. npm test


## Handoff

- From: codex
- To: human
- Handed off: 2026-09-19T22:06:19.795Z
- Completed or current state: Integrated Jev System One 2-tier pipeline in src/ai/system.ts with fast reflex classification and deterministic in-character fallback
- Touched files: src/ai/system.ts, test/ai-jev-system.test.ts, test/adversarial-jev-system.test.ts, test/challenger-m2-boundary-concurrency.test.ts
- Verification: npm test: 152/152 passed, typecheck: 0 errors
- Known risks or blockers: none
- Next action: ready for PR review and merge
