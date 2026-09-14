# Active claim: playtest-backlog-build

- Owner: claude
- Claimed: 2026-09-14T05:13:51.062Z
- Objective: Sửa + review loop cho 9 issue playtest-derived (#31-#39) theo team-builder
- Scope: src/ui/, src/engine/, src/i18n, docs/playtest-ai/
- Acceptance criteria:
  - Mỗi issue: implement → review (react/typescript/a11y/code-reviewer) → fix → `npx tsc --noEmit` + `npx vitest run` xanh + e2e spec liên quan xanh → comment bằng chứng + close.
  - Vòng lặp 5 round: implement → review → fix, không dừng hỏi lại.
- Verification plan: typecheck; vitest full; targeted playwright per spec (baseline drift riêng trong #40).

## TIẾN ĐỘ (cập nhật round 5, 2026-09-15)
- **Đã đóng đủ #31–#39** — mỗi cái có comment bằng chứng (root cause, file:line, test names, counts) + `--reason completed` trên GitHub. Chi tiết kỹ thuật nằm trong comment từng issue và `docs/agent-work/active/round2-queue.md`.
- **Round 5 = vòng review bên ngoài, và nó tìm ra bug THẬT trong cái đã đóng:** reviewer-3436 báo #35 HIGH (chệch index chronicle/chronicleKinds từ `freshSession` — crit hiện plain, dòng trên bị gán is-crit). Đã sửa 1 dòng + test mới drive đúng đường boot→act()→localStorage (test cũ tự feed 2 mảng thẳng hàng nên KHÔNG thể bắt lỗi này) + chứng minh RED-when-revert. #35 đã reopen → reclose kèm comment bằng chứng.
- Hai MEDIUM #34 cũng đã sửa: link `#attribute-allocation` chết ở ≥921px (ẩn link trong đúng media query đó) và banner +1 hiện giữa lúc combat trong khi engine từ chối `allocate_attribute` (ẩn banner khi `game.encounter`). Mỗi cái có test mới, đều RED-against-old-code.
- #40 (e2e spec drift, không thuộc batch này) đang MỞ — ~30 fail cũ từ trước, 100% spec stale, không phải regression.
- Baseline hiện tại: tsc 0 lỗi · vitest **112 files / 852 tests pass** · e2e targeted: issue34 8/8, issue35 6/6, issue37-38 5/5.
- Rounds đã chạy: 1 (#31–#34) · 2 (#32 EN round-2 + #33–#36) · 3 (#39 + e2e re-baseline → #40) · 4 (#37 + #38, review tự bắt bug comment-into-JSX) · 5 (final review pass của round 4 + review bên ngoài → #35 HIGH, #34 MEDIUM×2, và #37 CRITICAL float-associativity từ reviewer nền: telegraph hứa 13 trong khi reducer ra đòn rẻ nhất 14 — đã sửa + anchor test RED-proven + reopen/reclose #37).
- **Chưa commit/push gì** — toàn bộ thay đổi nằm ở working tree, chờ user authorize.
