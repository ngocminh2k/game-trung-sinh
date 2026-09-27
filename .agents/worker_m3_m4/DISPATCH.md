# DISPATCH: Milestone 3 & 4 — Worker (Test Suite Finalization, AGENTS.md Handoffs, Git Branch & PR)

You are the Worker for Milestone 3 & 4 (`teamwork_preview_worker`).
Your working directory is F:\game-trung-sinh\.agents\worker_m3_m4.
Your project workspace is F:\game-trung-sinh.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY INPUT:
Read ORIGINAL_REQUEST.md at: F:\game-trung-sinh\.agents\ORIGINAL_REQUEST.md (specifically ## 2026-09-19T21:36:35Z).
Read Specification at: C:\Users\minhd\.gemini\antigravity-cli\brain\06ca1ff1-f946-40b5-9a50-c714faaa792b\jev_integration_spec.md
Read Operating Contract at: F:\game-trung-sinh\AGENTS.md
Read Scope at: F:\game-trung-sinh\.agents\orchestrator_2\PROJECT.md

Tasks:

1. Test Suite Enhancement in `test/ai-jev-system.test.ts`:
   - Keep existing TC-01 through TC-05.
   - Add TC-06: End-to-end 2-tier pipeline test with `requestSystemReply` and `fastClassifySystem`, verifying fast reflex intent classification followed by in-character system response.
   - Add TC-07: Graceful degradation test when `/api/narrate` fails or times out, verifying `requestSystemReply` returns an authentic deterministic `SystemReply` with active system voice and non-null text.
   - Run `npx vitest run test/ai-jev-system.test.ts` and ensure all tests pass.

2. AGENTS.md Handoff & Contract Compliance:
   - Archive the active claims `jev-system-one-classifier` and `jev-system-two-tier` using the project script:
     ```powershell
     npm run agent:handoff -- --id jev-system-one-classifier --from codex --to human --summary "Implemented Jev System One client and Zod schemas with bounded choice quest pool and hallucination defense" --files "src/ai/jev-schemas.ts, src/ai/jev-client.ts, test/ai-jev-system.test.ts" --verification "npx vitest run test/ai-jev-system.test.ts: 5/5 pass" --risks "none" --next "integrated into The System via 2-tier pipeline"
     ```
     ```powershell
     npm run agent:handoff -- --id jev-system-two-tier --from codex --to human --summary "Integrated Jev System One 2-tier pipeline in src/ai/system.ts with fast reflex classification and deterministic in-character fallback" --files "src/ai/system.ts, test/ai-jev-system.test.ts, test/adversarial-jev-system.test.ts, test/challenger-m2-boundary-concurrency.test.ts" --verification "npm test: 152/152 passed, typecheck: 0 errors" --risks "none" --next "ready for PR review and merge"
     ```
   - Verify that `docs/agent-work/active/` no longer holds lingering claims for these IDs, and handoff markdown files are created in `docs/agent-work/handoffs/`.

3. Verification Gates:
   - `npm run typecheck` (must exit 0 with 0 errors).
   - `npm test` (full regression test suite, must pass 100%).
   - `npx eslint src/ai/jev-schemas.ts src/ai/jev-client.ts src/ai/system.ts test/ai-jev-system.test.ts test/adversarial-jev-system.test.ts test/challenger-m2-boundary-concurrency.test.ts` (0 errors, 0 warnings).
   - `npm run agent:check` (must exit 0).

4. Git Branch & Pull Request Management (Requirement R4):
   - Create feature branch: `git checkout -b feat/jev-system-one` (if already created, ensure you are on it).
   - Inspect `git status --short`.
   - Stage ONLY the in-scope files:
     - `src/ai/jev-schemas.ts`
     - `src/ai/jev-client.ts`
     - `src/ai/system.ts`
     - `test/ai-jev-system.test.ts`
     - `test/adversarial-jev-system.test.ts`
     - `test/challenger-m2-boundary-concurrency.test.ts`
     - `docs/agent-work/handoffs/*`
     (DO NOT stage `.agents/`, `service.conf.lock`, `system.conf.lock`, or `.sentry-native/`).
   - Commit with message:
     ```
     feat(ai): integrate Jev System One 2-tier pipeline into The System

     - Implement Jev System One client and Zod schemas with bounded choice quest pool
     - Integrate 2-Tier AI Pipeline in src/ai/system.ts with fast reflex (~80ms) and LLM narration
     - Provide deterministic in-character bilingual fallback for offline and timeout scenarios
     - Comprehensive automated test suite in test/ai-jev-system.test.ts and adversarial stress tests
     ```
   - Push branch and create Pull Request:
     `git push -u origin feat/jev-system-one`
     `gh pr create --title "feat(ai): integrate Jev System One 2-tier pipeline into The System" --body "..."`
     (If git push requires credentials or is rejected in environment, create a PR patch file / script and document the PR description and patch command).

5. Report results in `F:\game-trung-sinh\.agents\worker_m3_m4\handoff.md`.
When done, notify parent with send_message.

## 2026-09-19T22:04:35Z
You are the Worker for Milestone 3 & 4 (teamwork_preview_worker).
Your working directory is F:\game-trung-sinh\.agents\worker_m3_m4.
Your project workspace is F:\game-trung-sinh.

Execute all tasks in DISPATCH.md:
1. Enhance test/ai-jev-system.test.ts with TC-06 and TC-07 testing the 2-tier pipeline and fallback.
2. Complete AGENTS.md handoffs via npm run agent:handoff for jev-system-one-classifier and jev-system-two-tier.
3. Verify all gates: npm run typecheck, npm test, npx eslint, npm run agent:check.
4. Create branch feat/jev-system-one, stage in-scope files cleanly, commit with conventional commit, and open PR via gh pr create (or create patch).
5. Document all commands, commit hash, PR link/details in F:\game-trung-sinh\.agents\worker_m3_m4\handoff.md.
When done, notify parent with send_message.
