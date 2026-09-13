# Active claim: proto-shell-feedback-fixes

- Owner: cline
- Claimed: 2026-09-09T13:50:42.048Z
- Objective: Fix enemy HP bar fill color, move enemy HUD onto combat map area, fix NpcChatModal duplicate bubble text
- Scope: src/ui/screens.css, src/ui/proto-shell.css, src/ui/ProtoShell.tsx, src/ui/NpcChatModal.tsx
- Acceptance criteria:
  1. Combat overlay: thanh máu địch (`.cbar` enemy, `i` fill) hiển thị màu đỏ (var(--danger) scoped cục bộ) — computed backgroundColor không trong suốt, rộng theo HP%.
  2. Combat overlay render BÊN TRONG `.proto-map` (đứng trên map, phía trên `.proto-command` chips row) — không chiếm toàn màn hình.
  3. NpcChatModal: chỉ MỘT speech-bubble hiển thị tại mỗi thời điểm, đúng phía (trái = người chơi, phải = NPC) và đúng nội dung dòng vừa nói.
- Verification plan: `node scripts/capture-user-feedback-screenshots.mjs` (mở chat + trigger combat + đo computed style), screenshot review, `npm run typecheck`, `npm run lint`, `node verify-shell.mjs`.

## Handoff

- From: cline
- To: cline
- Handed off: 2026-09-09T14:23:05.660Z
- Completed or current state: Verified 3 proto-shell UI fixes end-to-end (enemy HP fill, combat overlay placement, chat bubbles); fixes were already applied in worktree by prior session; added scripts/verify-feedback-fixes.mjs regression script (12/12 PASS on :5173); typecheck PASS; lint/unit failures confirmed pre-existing and out of scope
- Touched files: scripts/verify-feedback-fixes.mjs, docs/agent-work/active/proto-shell-feedback-fixes.md, screenshots/feedback-combat.png, screenshots/feedback-chat-npc.png, screenshots/feedback-chat-player.png
- Verification: node scripts/verify-feedback-fixes.mjs: PASS 12/12; npm run typecheck: clean; verify-shell.mjs: 12/14 (2 stale expectations: robe_left, map_bg — features intentionally changed earlier); npm test: 664/694 pass, 30 pre-existing failures none touching NpcChatModal/ProtoShell combat
- Known risks or blockers: repo-wide eslint no-undef in standalone .mjs scripts and 30 pre-existing unit-test failures remain; combat animation screenshots are best-effort timing
- Next action: User visual confirmation of screenshots/feedback-*.png; optionally run npx playwright test e2e/acceptance-visual.spec.ts for the full visual suite

## Post-handoff addendum (same day, cline)

- Verify script hardening: 3 lần chạy đầu bị flake 11/12 vì các mốc `waitForTimeout` cố định rơi trúng cửa sổ fade (opacity transition .25s) hoặc trước khi reply NPC (~520ms sau click) kịp render. Đã thay toàn bộ bằng `page.waitForFunction` chờ điều kiện thật: bubble hiện rõ (opacity ≥ 0.5) VÀ text khớp dòng cuối của chat-log; pha player-turn chờ bubble trái hiện + bubble phải fade-out xong. Guard `lines.length > 0` cho chat-log rỗng (tránh `undefined.querySelector` khi log chưa render).
- Kết quả sau hardening: `node scripts/verify-feedback-fixes.mjs` → **PASS 12/12, 3 lần chạy liên tiếp ổn định** (exit 0).
- Dọn dẹp: dev server :5177 đã dừng; các file tạm tmp-test-out*.txt đã xóa.
