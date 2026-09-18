# Campaign 3 — Round 17 Report

**Trợ Lý Hệ Thống (bước tiếp theo theo ngữ cảnh) + Session Recap**

**Date:** 2026-09-17  
**Status:** `fixed-verified` ✅  
**Source Ticket:** C2 Vòng 19 (p12 Fatigued Player / Returning Cultivator, p10 Story Completionist, ROADMAP.md C3-17)  
**Files Modified/Created:**
- `src/engine/sessionRecap.ts` (Created: pure domain logic for contextual advice and session recap generation)
- `src/engine/index.ts` (Modified: exported functions and types)
- `src/ui/SessionRecapModal.tsx` (Created: accessible modal dialog with away duration, primary advice, vitals, active quests, and suggested actions)
- `src/ui/ProtoShell.tsx` (Modified: added `💡` topbar button `system-assistant-btn`, objective line assistant trigger `objective-assistant-btn`, Escape key handling, and modal rendering)
- `test/session-recap.test.ts` (Created: 7 unit tests)
- `test/session-recap.ui.test.tsx` (Created: 6 UI tests)

---

## Phase 1: Playtest — Persona Probing

### Personas Tested
- **p12 Fatigued Player / Returning Cultivator**: When returning to the game after hours or days away, frequently loses track of what they were doing, why their HP was low, or what realm milestone they were pursuing. Needs a clear, welcoming "Session Recap" summarizing elapsed time, offline meditation gains, and an immediate orienting "Next Step" suggestion without information overload.
- **p10 Story Completionist / Strategy Optimizer**: Wants unambiguous contextual direction when stuck—whether attribute points need allocation, a breakthrough is ready, a dangerous enemy is lurking in the current zone, or a specific quest step needs completion. Values having an on-demand "System Assistant" (`💡`) that evaluates priorities deterministically.

### Key Findings from Playtest
1. **Clear Precedence Hierarchy**: The system assistant advice must prioritize critical life-or-death or blocker conditions first:
   - **Critical**: Pending attribute points (`pendingAttributePoints > 0`). Players cannot progress or move effectively while points remain unspent.
   - **Urgent**: Critical Health (`HP < 30%`). Prevents accidental player death upon entering danger zones.
   - **Urgent**: Active Combat (`encounter !== null`). Clarifies turn-by-turn battle focus.
   - **Recommended**: Breakthrough Ready (`isBreakthroughReady` or `progress >= threshold`). Avoids wasted cultivation progress past thresholds.
   - **Recommended**: Active Quest progression (`status === 'active'`). Guides story advancement.
   - **Guidance**: Local undefeated threat / General cultivation grind.
2. **Accessible, Dual-Trigger Experience**:
   - Available via topbar button `💡` (`data-testid="system-assistant-btn"`).
   - Directly accessible from the Objective box (`data-testid="objective-assistant-btn"`).
   - Dismissible with Escape key, backdrop click, or Continue button.

---

## Phase 2: Docs Cross-Reference

### Related Campaign 2 Ticket
| Ticket | Issue | Resolution in C3-17 |
|--------|-------|---------------------|
| C2-19 (p12, p10) | Returning players lost after hiatus; players unsure of optimal next step | Pure `deriveSystemAdvice` + `generateSessionRecap` + `SessionRecapModal` with dual triggers (`system-assistant-btn`, `objective-assistant-btn`) |

### Canon Design References
- **ROADMAP.md (C3-17)**:
  - "Nút ? / 💡 gợi ý bước kế; thẻ tóm tắt khi quay lại"
  - `src/ui/objective.ts, useGameSlice.ts, ProtoShell.tsx`
- **Offline Cultivation Mechanics**:
  - `calculateOfflineGains` in `src/engine/offline.ts` integrated to display accrued offline progress.
- **WAI-ARIA Dialog Standards**:
  - `role="dialog"`, `aria-modal="true"`, `aria-label`, Escape key listener, backdrop dismissal.

---

## Phase 3: Spec Formalization

### Acceptance Criteria
- [x] **Pure Domain Engine (`sessionRecap.ts`)**:
  - `formatAwayDuration`: Accurately formats durations in both Vietnamese and English (`<1m`, `<1h`, `<24h`, `>=24h`).
  - `deriveSystemAdvice`: Evaluates game state with strict priority ordering (Attribute Points > Low HP > Combat > Breakthrough > Quest > Local Threat > Grind).
  - `generateSessionRecap`: Compiles comprehensive recap (elapsed away time, offline gains, location, HP/Qi/Realm/Wealth vitals, active quests, and suggested action checklist).
- [x] **Accessible UI Modal (`SessionRecapModal.tsx`)**:
  - Semantic dialog attributes (`role="dialog"`, `aria-modal="true"`).
  - Away duration banner with offline meditation indicator.
  - Colored priority badge and actionable advice card.
  - Vitals grid (Location, HP, Qi, Stage, Wealth).
  - Active quests list with current step description.
  - Suggested action checklist.
- [x] **ProtoShell Integration**:
  - Topbar icon button `💡` (`data-testid="system-assistant-btn"`).
  - Objective section quick-trigger button (`data-testid="objective-assistant-btn"`).
  - Wired into `isDialogModalActive` focus trap, Escape key listener, and modal render tree.
- [x] **Automated TDD Test Suite**:
  - 7 unit tests in `test/session-recap.test.ts`.
  - 6 component tests in `test/session-recap.ui.test.tsx`.
  - 100% green with zero regressions.

---

## Phase 4: Code Implementation & TDD

### Test Results
- `test/session-recap.test.ts`: 7/7 tests passed.
- `test/session-recap.ui.test.tsx`: 6/6 tests passed.
- Total C3-17 suite: 13/13 tests passing.
- Full regression verification: 45 tests passing across C3-15, C3-16, C3-17.
