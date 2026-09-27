# Survey 3 Analysis: Repository Environment, AGENTS.md Contract, Baseline Health, and Git Conventions

**Surveyor:** Surveyor 3 (`teamwork_preview_explorer`)  
**Workspace:** `F:\game-trung-sinh`  
**Date:** 2026-09-20 (UTC: 2026-09-19)  
**Task Focus:** Baseline environment inspection, contract enforcement, baseline test/typecheck/lint health, active claims, and branch/PR workflow for JEV System One integration.

---

## 1. Git Status, Worktree, and Branch Topology

### 1.1 Current Branch and Commit
- **Current Branch:** `main` tracking `origin/main`.
- **Latest Commit on `main`:** `fcc0ec6` (*Merge pull request #43 from ngocminh2k/feat/campaign-3-implementation* by `ngocminh2k`, 2026-09-18).
- **Branch Topology:**
  - Local branches: `main` (active), `feat/campaign-3-implementation`, `ngocminh2k/port-godot` (linked worktree), `pr23`, `pr25-review`, `pr3`.
  - Linked worktrees (`git worktree list`):
    1. `F:/game-trung-sinh` (`fcc0ec6 [main]`) — Active primary repository.
    2. `C:/Users/minhd/orca/workspaces/game-trung-sinh/port-godot` (`fcc0ec6 [ngocminh2k/port-godot]`) — Separate linked Godot port worktree.
  - Remote: `origin` -> `https://github.com/ngocminh2k/game-trung-sinh.git` (fetch & push).
  - Target branch `feat/jev-system-one` does **not yet exist**; must be branched off `main`.

### 1.2 Status of the Worktree
Running `git status --short -b` reveals:
- **Tracked Modifications:**
  - `M .agents/ORIGINAL_REQUEST.md` (appended 2026-09-19 request)
  - `M .agents/sentinel/BRIEFING.md` (sentinel state update)
  - `M ORIGINAL_REQUEST.md` (appended 2026-09-19 request)
- **Untracked Files:**
  - Source & Test files:
    - `src/ai/jev-schemas.ts` (Zod schemas for Jev System One)
    - `src/ai/jev-client.ts` (Jev client with deterministic fallback)
    - `test/ai-jev-system.test.ts` (5 automated test cases)
  - Agent OS metadata:
    - `docs/agent-work/active/jev-system-one-classifier.md`
    - `.agents/explorer_survey_2/`, `.agents/explorer_survey_3/`, `.agents/orchestrator_2/`, `.agents/spec_miner_survey_1/`
  - Scratch / Local Noise (Must NOT be committed):
    - `service.conf.lock` (0 bytes)
    - `system.conf.lock` (0 bytes)
    - `.sentry-native/` (local native crash logging)

---

## 2. Agent OS & Contract Inspection (`AGENTS.md`, `docs/agent-os/`, `docs/agent-work/`)

### 2.1 AGENTS.md Operating Contract Rules
The contract mandates strict engineering and multi-agent coordination standards:
1. **Start Every Task:**
   - Read `docs/agent-os/KNOWLEDGE.md` and `docs/agent-os/WORKFLOW.md`.
   - Run `npm run agent:check` and inspect `git status --short`.
   - Read `docs/agent-work/active/` and latest handoff in `docs/agent-work/handoffs/`.
   - Claim one narrow, independently verifiable unit before editing via `npm run agent:claim`.
2. **Architecture Boundaries (`docs/agent-os/KNOWLEDGE.md`):**
   - `src/content/`: declarative game data and validation.
   - `src/engine/`: deterministic state transitions and domain rules.
   - `src/ui/`: rendering, input, and UI-only derivations.
   - `src/ai/`: optional narration/suggestion integration; **must NOT become the source of game truth**.
   - `src/App.tsx`: application composition.
3. **Safety & Invariance:**
   - Never discard, reformat wholesale, or overwrite unrelated dirty changes.
   - Do not reset, force-push, commit, push, alter secrets, or change production configuration unless explicitly authorized.
   - `.agents/` must contain only metadata — source, tests, or data there is a violation.
4. **Mandatory Handoff:**
   - Active claim must be archived via `npm run agent:handoff` before ownership changes.
   - Handoff requires: completed behavior, touched files, verification output/result, known risks/blockers, and next concrete action.

### 2.2 Active Claim Status (`docs/agent-work/active/`)
Currently present:
- `docs/agent-work/active/jev-system-one-classifier.md`:
  - **Owner:** `codex`
  - **Claimed:** `2026-09-19T21:34:38.710Z`
  - **Objective:** Integrate Jev System One AI classifier for The System intent detection with fallback
  - **Scope:** `src/ai/jev-schemas.ts, src/ai/jev-client.ts, test/ai-jev-system.test.ts`
  - **Status:** The files in scope are present and passing typecheck and vitest!
- **Note on Scope & R2:**
  - The current active claim covers R1 (`jev-schemas.ts`, `jev-client.ts`) and R3 (`test/ai-jev-system.test.ts`).
  - R2 (integrating 2-Tier Pipeline into `src/ai/system.ts`) is currently outside this active claim scope.
  - To comply with AGENTS.md, after handing off `jev-system-one-classifier`, a second claim (e.g. `jev-system-2tier-pipeline` with scope `src/ai/system.ts`) should be created, or the claim can be handed off with the next action explicitly targeted at `src/ai/system.ts`.

### 2.3 Agent OS Scripts Verification (`scripts/agent-os.mjs`)
- **`npm run agent:check`:**
  - Validates `AGENTS.md`, `CLAUDE.md`, `.clinerules/00-agent-os.md`, `.mcp.json`, MCP registry & adapters, `docs/agent-os/*`, `docs/agent-work/queue.json`, `opencode.json`.
  - Execution Result: **PASSED (Exit 0)** — `agent-os: OK - shared rules, MCP registry, and tool bridges are present.`
- **`npm run agent:claim`:**
  - Syntax: `npm run agent:claim -- --id <kebab-id> --owner <cline|opencode|claude|codex> --objective "..." --scope "src/..."`
  - Validates kebab-case id regex `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` and ensures target does not already exist.
- **`npm run agent:handoff`:**
  - Syntax: `npm run agent:handoff -- --id <kebab-id> --from <agent> --to <agent> --summary "..." --files "path/a, path/b" --verification "command: result" --risks "none" --next "one concrete next action"`
  - Validates that active claim exists and that `--from <owner>` matches `- Owner: <owner>` in the claim file. Moves file from `docs/agent-work/active/<id>.md` to `docs/agent-work/handoffs/<id>-<timestamp>.md`.

---

## 3. Baseline Project Health & Non-Destructive Verification Gates

| Gate Check | Command | Result / Output | Notes |
|---|---|---|---|
| **Agent OS Check** | `npm run agent:check` | ✅ **PASSED (Exit 0)** | All rule bridges, registry configs, and workflows verified. |
| **TypeScript Typecheck** | `npm run typecheck` (`tsc --noEmit`) | ✅ **PASSED (Exit 0)** | Zero type errors across all files (including new `src/ai/jev-*.ts`). |
| **Vitest Regression Suite** | `npm test` (`vitest run`) | ✅ **PASSED (Exit 0)** | **150/150 test files passed**, **1,246/1,246 tests passed** (0 failures, duration 60.00s). |
| **JEV Test Suite** | `npx vitest run test/ai-jev-system.test.ts` | ✅ **PASSED (Exit 0)** | **5/5 tests passed** (TC-01 bounded choice, TC-02 hallucination defense, TC-03 defiance/hostility, TC-04 network fallback, TC-05 offline fallback). |
| **System AI Test Suite** | `npx vitest run test/ai-system.test.ts` | ✅ **PASSED (Exit 0)** | **3/3 tests passed** (existing boundary tests for System AI). |
| **Production Build** | `npm run build` (`tsc && vite build`) | ✅ **PASSED (Exit 0)** | Vite production bundle built in 3.13s without errors. |
| **ESLint on JEV & System** | `npx eslint src/ai/jev-schemas.ts src/ai/jev-client.ts test/ai-jev-system.test.ts src/ai/system.ts` | ✅ **PASSED (Exit 0)** | 0 errors, 0 warnings. Perfectly clean. |
| **Global ESLint** | `npm run lint` (`eslint .`) | ⚠️ **FAIL (Exit 1, 560 problems)** | Pre-existing repository lint debt primarily in standalone root `.mjs` and `scripts/*.mjs` scripts lacking node/browser eslint globals, plus minor unused vars in `concise.ts` and `sessionRecap.ts`. New JEV code is completely clean. |

---

## 4. Git Branch, Commit, and PR Requirements for `feat/jev-system-one`

### 4.1 Branch Creation
1. Verify clean separation of untracked scratch files:
   - Untracked lock files `service.conf.lock` and `system.conf.lock` must remain uncommitted or ignored.
   - Local `.sentry-native/` folder must remain uncommitted.
2. Create feature branch from current `main` (`fcc0ec6`):
   ```powershell
   git checkout -b feat/jev-system-one
   ```

### 4.2 Commit Scope & Discipline
In accordance with AGENTS.md:
- **Included Files for JEV System One Integration:**
  - `src/ai/jev-schemas.ts`
  - `src/ai/jev-client.ts`
  - `src/ai/system.ts`
  - `test/ai-jev-system.test.ts`
  - `docs/agent-work/handoffs/jev-system-one-classifier-<timestamp>.md` (created by `agent:handoff`)
- **Commit Message Format (Conventional Commits):**
  - Feature commit: `feat(ai): integrate Jev System One 2-tier pipeline into The System`
  - Test commit (if separate): `test(ai): verify Jev bounded choices, hallucination defense, and fallbacks`
- **Author Identity:**
  - Commit authoring in project history uses `Claude Code <noreply@anthropic.com>` or `ngocminh2k <ngocminh2k@users.noreply.github.com>`.

### 4.3 Pull Request & Patch Preparation
- **GitHub CLI Status:**
  - `gh` CLI version 2.98.0 is installed and fully authenticated as account `ngocminh2k` with `repo` and `workflow` scopes.
- **Pull Request Creation Command:**
  ```powershell
  gh pr create --base main --head feat/jev-system-one --title "feat(ai): integrate Jev System One 2-tier pipeline into The System" --body-file pr_description.md
  ```
- **Patch Alternative (if requested or for offline review):**
  ```powershell
  git format-patch main..feat/jev-system-one --stdout > jev-system-one.patch
  ```
- **PR Description Architecture Requirements:**
  - 2-Tier Sequence Diagram (`Player -> UI -> Jev Tier 1 (~80ms) -> Instant UI Quest Feedback -> Tier 2 LLM Async Narration`).
  - Fallback specification (deterministic rule-based fallback if offline, missing key, or >600ms latency).
  - Test verification results table (Vitest 150/150 files, 1246 tests, `tsc --noEmit` 0 errors).

---

## 5. Architectural Gap Analysis: Next Step to R2

While R1 (`src/ai/jev-schemas.ts`, `src/ai/jev-client.ts`) and R3 (`test/ai-jev-system.test.ts`) are implemented and passing tests:
- **Current `src/ai/system.ts`** still makes a direct synchronous call to `/api/narrate` without utilizing Jev `classifySystemUtterance`.
- **Next Implementer Task:**
  1. Complete R2 by wiring `classifySystemUtterance` into `src/ai/system.ts`.
  2. Implement the 2-tier flow:
     - Step 1: Call `classifySystemUtterance(game, message)` with 600ms timeout/fallback.
     - Step 2: If `decision.questId` is returned, bind it immediately into `SystemReply.questId`.
     - Step 3: Forward the classified decision context to `/api/narrate` for persona-consistent narration.
     - Step 4: If offline or `/api/narrate` fails, generate immediate deterministic fallback text based on `decision.intent` so gameplay is never blocked.
