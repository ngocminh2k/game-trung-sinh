# DISPATCH: Milestone 2 — Worker (2-Tier Pipeline in The System)

You are the Worker for Milestone 2 (`teamwork_preview_worker`).
Your working directory is F:\game-trung-sinh\.agents\worker_m2.
Your project workspace is F:\game-trung-sinh.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY INPUT:
Read ORIGINAL_REQUEST.md at: F:\game-trung-sinh\.agents\ORIGINAL_REQUEST.md (specifically ## 2026-09-19T21:36:35Z).
Read Specification at: C:\Users\minhd\.gemini\antigravity-cli\brain\06ca1ff1-f946-40b5-9a50-c714faaa792b\jev_integration_spec.md
Read Operating Contract at: F:\game-trung-sinh\AGENTS.md
Read Scope at: F:\game-trung-sinh\.agents\orchestrator_2\PROJECT.md
Read Explorer 1 Report at: F:\game-trung-sinh\.agents\explorer_m2_1\analysis.md and handoff.md
Read Explorer 2 Report at: F:\game-trung-sinh\.agents\explorer_m2_2\analysis.md and handoff.md
Read Spec Miner 3 Report at: F:\game-trung-sinh\.agents\spec_miner_m2_3\analysis.md and handoff.md

Write Ownership:
You exclusively own and are authorized to edit:
- `src/ai/system.ts`
- You may also claim your scope per AGENTS.md via `npm run agent:claim`.
Do NOT edit other files unless strictly necessary for compilation.

Task Objectives (Milestone 2 - Requirement R2):
1. Register agent claim per AGENTS.md:
   `npm run agent:claim -- --id jev-system-two-tier --owner codex --objective "Implement 2-Tier Pipeline in src/ai/system.ts with Jev fast reflex and in-character fallback" --scope "src/ai/system.ts"`
2. Implement the 2-Tier Pipeline in `src/ai/system.ts`:
   - Import `classifySystemUtterance` from `./jev-client` and `type SystemFastDecision` from `./jev-schemas`.
   - Update `SystemChatPayload` to optionally accept `fastDecision?: SystemFastDecision`.
   - Export `fastClassifySystem(game: GameState, message: string): Promise<SystemFastDecision>` which directly calls `classifySystemUtterance(game, message)`.
   - Update `requestSystemReply(game: GameState, message: string, locale: Locale): Promise<SystemReply | null>`:
     a. If `!narrationWanted()`, return `null` immediately (crucial: do not call fetch, preserving existing test invariants).
     b. Call Tier 1 `const fastDecision = await classifySystemUtterance(game, message)`.
     c. Build payload via `buildSystemPayload(game, message, locale, fastDecision)`. If null or empty message, return null.
     d. In Tier 2 call to `/api/narrate`:
        - If response is OK and valid `SystemReply` JSON is returned, sanitize and validate that offered `questId` is present in `payload.questPool`. Return valid reply.
        - If response fails (HTTP error, network exception, timeout, or invalid format), do NOT simply return null: invoke deterministic in-character fallback `buildDeterministicSystemReply(game, message, locale, fastDecision)` returning an authentic `SystemReply`!
        - Exception: If the LLM specifically returned an invalid `offer_quest` with an unauthorized questId (hallucination), return `null` as required by test invariant in `test/ai-system.test.ts`.
   - Implement `buildDeterministicSystemReply(game, message, locale, fastDecision)`:
     - Derive response based on active system personality and `fastDecision`:
       - If `fastDecision.isHostile` or `fastDecision.intent === 'defiance_mockery'`, respond with an in-character disciplinary reprimand matching the system's voice.
       - If `fastDecision.intent === 'request_quest'` and `fastDecision.questId` is valid and present in active quest pool, return `{ kind: 'offer_quest', questId: fastDecision.questId, textVi: ..., textEn: ... }`. If pool is empty, return in-character chat explaining no quests are available.
       - If `fastDecision.intent === 'chat_general'` or `'inquire_status'`, return in-character comment on player's current cultivation and vitals.
   - Scenario Containment check: Ensure `src/ai/system.ts` DOES NOT import from `../content/(story|npcs|locations|endings-data|chapters|quests)`. All system definitions and quest queries come through `../engine`.
3. Verification:
   - Run `npm run typecheck` (must pass with 0 errors).
   - Run `npx vitest run test/ai-jev-system.test.ts` (all 5 tests must pass).
   - Run `npx vitest run test/ai-system.test.ts` (all 3 tests must pass).
   - Run `npx vitest run test/system-scenario.test.ts` (must pass).
   - Run `npx eslint src/ai/system.ts src/ai/jev-schemas.ts src/ai/jev-client.ts` (must be 0 errors, 0 warnings).
   - Run `npm test` (full regression test suite).
4. Documentation & Handoff:
   - Record claim and changes in docs.
   - Write completion report in F:\game-trung-sinh\.agents\worker_m2\handoff.md.
   - Notify parent with send_message.
