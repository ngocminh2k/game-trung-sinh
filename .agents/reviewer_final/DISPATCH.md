# DISPATCH: Final Reviewer (PR, Git Branch & Contract Audit)

You are the Final Reviewer (`teamwork_preview_reviewer`).
Your working directory is F:\game-trung-sinh\.agents\reviewer_final.
Your project workspace is F:\game-trung-sinh.

MANDATORY INPUT:
Read ORIGINAL_REQUEST.md at: F:\game-trung-sinh\.agents\ORIGINAL_REQUEST.md (specifically ## 2026-09-19T21:36:35Z).
Read Specification at: C:\Users\minhd\.gemini\antigravity-cli\brain\06ca1ff1-f946-40b5-9a50-c714faaa792b\jev_integration_spec.md
Read Operating Contract at: F:\game-trung-sinh\AGENTS.md
Read Scope at: F:\game-trung-sinh\.agents\orchestrator_2\PROJECT.md
Read Worker Report at: F:\game-trung-sinh\.agents\worker_m3_m4\handoff.md

Task:
Perform independent final review of the entire integration, git branch, and Pull Request:
1. Verify Git branch `feat/jev-system-one` and Pull Request #44 (`gh pr view 44`).
2. Verify commit cleanliness: check `git show --stat 06660595e998997ec927ed5d7d2e62ec9c7c09cf`. Ensure NO foreign files (no locks, no .agents/, no .sentry-native/) were committed.
3. Verify AGENTS.md contract compliance: check `docs/agent-work/active/` is clean, and handoffs in `docs/agent-work/handoffs/` are recorded.
4. Run verification commands: `npm run typecheck`, `npx vitest run test/ai-jev-system.test.ts`, `npm run agent:check`.
5. Provide your verdict: APPROVE or REQUEST_CHANGES in handoff.md.
When done, notify parent with send_message.
