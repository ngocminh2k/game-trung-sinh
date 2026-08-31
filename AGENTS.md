# Doliolid Agent Operating Contract

This repository is maintained by Cline, OpenCode, Claude Code, Codex, and humans. Every agent follows this file; individual tools do not get a different standard.

## Start every task

1. Read `docs/agent-os/KNOWLEDGE.md` and `docs/agent-os/WORKFLOW.md`.
2. Run `npm run agent:check` and inspect `git status --short`. The worktree may be shared and dirty: preserve changes outside your assigned scope.
3. Read `docs/agent-work/active/` and the newest relevant file in `docs/agent-work/handoffs/`. Do not overlap an active scope without an explicit handoff.
4. Claim one small, independently verifiable unit before editing:
   ```powershell
   npm run agent:claim -- --id <kebab-id> --owner <cline|opencode|claude|codex> --objective "..." --scope "src/..."
   ```

## Shared operating rules

- Treat `docs/agent-os/` and the source documents it names as shared knowledge. Update a source document only when the task changes that source of truth.
- Prefer `codebase-memory` MCP for code discovery: index only when no usable index exists, then use `search_graph`, `trace_path`, and `get_code_snippet`. Fall back to text search only for literals, configuration, or an incomplete graph.
- Keep work units narrow. State the acceptance criteria before implementation and verify the affected behavior after it.
- Never discard, reformat wholesale, or overwrite unrelated dirty changes. Do not reset, force-push, commit, push, alter secrets, or change production configuration unless the user explicitly authorizes it.
- Keep deterministic game logic in `src/engine/`, data in `src/content/`, presentation in `src/ui/`, and keep the AI narration boundary in `src/ai/`.
- Run the smallest relevant checks first; before declaring completion run the checks required by `docs/agent-os/WORKFLOW.md` and report exact commands and results.

## Handoff is mandatory when ownership changes

The receiving agent must be able to continue without reconstructing hidden context. Create a handoff only after the current state is runnable or the blocker is explicit:

```powershell
npm run agent:handoff -- --id <kebab-id> --from <agent> --to <agent> --summary "..." --files "path/a, path/b" --verification "command: result" --risks "none" --next "one concrete next action"
```

The command archives the active claim into `docs/agent-work/handoffs/`. The next owner reads it, claims a new unit, and records any changed assumptions in the next handoff.

## Unattended workers

Use `docs/agent-work/queue.json` and `npm run agent:queue` for an unattended worker. Each queue job has a hard timeout and must exit after one bounded unit; an exit code is never acceptance. Read `docs/agent-os/QUEUE.md` before dispatching one.

## Completion report

Report: outcome, files changed, verification run/results, and any remaining risk. A green build does not excuse unmet acceptance criteria.
