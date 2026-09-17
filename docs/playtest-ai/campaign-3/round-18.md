# Campaign 3 — Round 18 Report

**Chế Độ Tóm Tắt (Concise Mode) cho người chơi mệt mỏi (`src/i18n/vi.ts`, `src/ui/` toggle)**

**Date:** 2026-09-17  
**Status:** `fixed-verified` ✅  
**Source Ticket:** C2 Vòng 19 (p20 Fatigued / Low Cognitive Budget Player, ROADMAP.md C3-18)  
**Files Modified/Created:**
- `src/engine/concise.ts` (Created: domain logic for sentence condensation, scene override lookup, and curated concise summaries)
- `src/engine/index.ts` (Modified: exported concise mode utilities and types)
- `src/ui/session.ts` (Modified: added `conciseMode` boolean to `PlayerSettings` and persisted under `phe-can-ky:settings:v1`)
- `src/ui/MainMenu.tsx` (Modified: accessible toggle switch in Settings screen with `role="switch"` and `aria-checked`)
- `src/ui/ProtoShell.tsx` (Modified: quick topbar toggle `concise-mode-btn` and ticker message condensation)
- `src/ui/GameScreen.tsx` (Modified: in-dialog toggle `story-concise-toggle-btn`, active badge `story-concise-badge`, and condensed story beat rendering)
- `src/App.tsx` (Modified: wired `conciseMode` state and `toggleConciseMode` callback through `GameScreen`)
- `src/ui/screens.css` (Modified: styled concise buttons, switches, and badges)
- `test/concise-mode.test.ts` (Created: 10 unit tests for domain condensation and settings persistence)
- `test/concise-mode.ui.test.tsx` (Created: 3 component integration tests)

---

## Phase 1: Playtest — Persona Probing

### Persona Tested
- **p20 Fatigued / Low Cognitive Budget Player**:
  - Context: Plays late at night or during short breaks after a tiring workday.
  - Frustration: Lengthy narrative prose blocks (150–250 words per beat) cause cognitive fatigue. Skimming causes players to miss critical choices or mechanical consequences.
  - Expectation: An accessible, low-friction toggle that condenses narrative prose into 1–2 punchy sentences focusing strictly on concrete actions, stakes, and decisions without altering underlying mechanics.

### Key Findings from Playtest
1. **Multi-Touchpoint Ergonomics**:
   - Fatigued players should not have to leave their current story dialogue to enable concise mode. An in-dialog toggle button (`story-concise-toggle-btn`) is essential.
   - A global switch in the Settings screen ensures the preference persists across sessions.
   - A quick-toggle button in the ProtoShell topbar (`concise-mode-btn`) allows instant mid-run toggling when reading fatigue sets in.
2. **Graceful Fallback Condensation**:
   - Curated punchy summaries for canonical story beats (e.g. `letter_at_dawn`, `sect_intro`, `encounter_warning`).
   - Scene-level author overrides (`conciseVi`, `conciseEn`).
   - Regex-based sentence extraction fallback (`toConciseText`) ensuring arbitrary custom or procedural text is capped at 2 concise sentences.
3. **Compact Chronicle Ticker**:
   - Long event lines in the compact topbar ticker (`proto-ticker-1`) overflow and obscure UI. Condensing ticker lines when concise mode is enabled significantly improves glanceability.

---

## Phase 2: Docs Cross-Reference

### Related Campaign 2 Ticket
| Ticket | Issue | Resolution in C3-18 |
|--------|-------|---------------------|
| C2-19 (p20) | Fatigued players overwhelmed by long text walls | Pure `getSceneText`, `toConciseText`, multi-touchpoint UI controls, settings persistence |

### Canon Design References
- **ROADMAP.md (C3-18)**:
  - "Chế Độ Tóm Tắt (Concise Mode) cho người chơi mệt mỏi | C2 Vòng 19 | `src/i18n/vi.ts`, `src/ui/` | Toggle rút gọn mô tả sự kiện 1–2 câu; test"
- **WAI-ARIA Switch Specification**:
  - `role="switch"`, `aria-checked="true|false"` in Settings.
  - `aria-pressed="true|false"` on quick-toggle buttons.

---

## Phase 3: Spec Formalization

### Acceptance Criteria
- [x] **Pure Domain Condensation Engine (`src/engine/concise.ts`)**:
  - `toConciseText(text, locale)`: returns short text unchanged (≤ 100 chars); condenses multi-sentence prose to 2 punchy sentences.
  - `getSceneText(scene, locale, conciseMode)`: returns full text when `conciseMode` is false; when true, checks `scene.conciseVi/En`, falls back to `SCENE_CONCISE_TEXTS`, and finally falls back to `toConciseText`.
- [x] **Settings & Persistence (`src/ui/session.ts`)**:
  - Extended `PlayerSettings` with `conciseMode: boolean` defaulting to `false`.
  - Storage serialization and corruption fallback verified.
- [x] **UI Touchpoints**:
  - `SettingsScreen`: `data-testid="concise-mode-switch"` with bilingual status labels (`Tóm tắt: đang bật` / `Tóm tắt: tắt`).
  - `ProtoShell`: `data-testid="concise-mode-btn"` with `⚡` indicator and ticker line condensation.
  - `GameScreen`: `data-testid="story-concise-toggle-btn"` with in-dialog switching and active badge `data-testid="story-concise-badge"`.
- [x] **TDD & Automated Verification**:
  - `test/concise-mode.test.ts` (10 tests) all green.
  - `test/concise-mode.ui.test.tsx` (3 tests) all green.
  - `npx tsc --noEmit` 0 errors.

---

## Phase 4: Implementation & Test Verification

### Test Results
- `test/concise-mode.test.ts`: 10 passed
- `test/concise-mode.ui.test.tsx`: 3 passed
- Total suite: 100% green, 0 regressions.
