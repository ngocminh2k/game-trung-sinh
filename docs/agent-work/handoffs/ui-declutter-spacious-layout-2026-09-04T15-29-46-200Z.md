# Active claim: ui-declutter-spacious-layout

- Owner: codex
- Claimed: 2026-09-04T15:20:23.937Z
- Objective: Eliminate cramped feeling: make stage-surface vertical so map is wide and commanding, command bar is horizontal below, balance rail/hud widths, and give generous breathing room
- Scope: src/ui/**, src/index.css
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: codex
- To: human
- Handed off: 2026-09-04T15:29:46.200Z
- Completed or current state: Resolved cramped layout: made stage-surface flex-column so map stretches wide and panoramic and command bar sits horizontally below, balanced rail/hud widths, cleaned topbar chips
- Touched files: src/ui/screens.css, src/ui/design/tokens.css
- Verification: npm.cmd run typecheck passed, npm.cmd test 683 passed
- Known risks or blockers: none
- Next action: review spacious gameplay UI with user
