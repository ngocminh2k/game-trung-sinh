# Campaign 3 — Round 10 Report

**Quest Categorization & 1-Click Batch Accept/Claim**

**Date:** 2026-09-17  
**Status:** `fixed-verified` ✅  
**Source Ticket:** C2 Vòng 07, 11 (p05 Completionist, p07 Quest Junkie)  
**Files Modified:** `src/engine/quests.ts`, `src/engine/index.ts`, `src/engine/reducer.ts`, `src/engine/types.ts`, `src/ui/gameScreen/panels.tsx`, `test/quest-categorization-batch.test.ts`

---

## Phase 1: Playtest — Persona Probing

### Personas Tested
- **p05 Completionist** — Wants clear quest organization; overwhelmed by flat list mixing main/side/sect/secret
- **p07 Quest Junkie** — Accepts 10+ quests daily; tedious to click "Nhận" one-by-one at each NPC

### Key Findings from Playtest
1. **Quest clutter**: All quests appeared in a single undifferentiated list in DockPanelQuests
2. **No batch operations**: Player must click "Nhận" / "Hoàn thành" individually for each quest
3. **Category confusion**: No visual distinction between Chính Tuyến (main), Phụ Tuyến (side), Tông Môn (sect), Nhiệm Vụ Ẩn (secret)

---

## Phase 2: Docs Cross-Reference

### Related Campaign 2 Tickets
| Ticket | Issue | Resolution in C3-10 |
|--------|-------|---------------------|
| C2-07 (p05) | Quest marker confusion after completion | Category tabs + done-flag canonical status |
| C2-11 (p07) | Tedious 1-by-1 acceptance | `accept_all_quests` / `claim_all_quests` actions |

### Design References
- **Quest archetypes**: 4-tier categorization per xianxia convention (Chính/Phụ/Tông/Ẩn)
- **Bilingual labels**: VI/EN for all categories (accessibility + localization)
- **Batch engine pattern**: Iterate unlocked/active quests, filter by `canAcceptQuest`/`canCompleteQuest`, apply atomically

---

## Phase 3: Spec Formalization

### Acceptance Criteria (from ROADMAP.md C3-10)
- [x] **Category detection**: ID prefixes (`q_main_*`, `q_sys_*`, `q_sec_*`, `q_secret_*`) + flags (`storySceneNextId`, `requiredSystemId`, `secret`)
- [x] **Bilingual labels**: VI/EN for all 4 categories
- [x] **Batch accept**: `accept_all_quests` action accepts all available unlocked quests at current location
- [x] **Batch claim**: `claim_all_quests` action completes all turn-in ready quests, awards items/gold
- [x] **Subset acceptance**: Optional `questIds` array to accept specific quests
- [x] **UI integration**: Category filter tabs, badges, batch buttons in DockPanelQuests
- [x] **Tests**: 9 TDD tests covering categorization + batch actions (RED→GREEN)

### Technical Spec

#### Engine Layer (`src/engine/quests.ts`)
```typescript
export type QuestCategory = 'main' | 'side' | 'sect' | 'secret'

export function getQuestCategory(quest: QuestDef): QuestCategory {
  if (quest.requiredSystemId !== undefined || quest.id.startsWith('q_sys_') || quest.id.startsWith('q_sec_')) return 'sect'
  if (quest.secret || quest.id.startsWith('q_secret_')) return 'secret'
  if (quest.id.startsWith('q_main_') || quest.storySceneNextId !== undefined) return 'main'
  return 'side'
}

export function questCategoryLabel(category: QuestCategory, locale: Locale): string
```

#### Action Types (`src/engine/types.ts`)
```typescript
| { kind: 'accept_all_quests'; questIds?: string[] }
| { kind: 'claim_all_quests' }
| { kind: 'complete_all_quests' }  // reserved for future
```

#### Reducer Handlers (`src/engine/reducer.ts`)
- `doAcceptAllQuests(state, questIds?)` — filters available+unlocked+canAccept, applies `doAcceptQuest` atomically
- `doClaimAllQuests(state)` — filters active+turnInReady+canComplete, applies `doCompleteQuest` atomically

#### UI Layer (`src/ui/gameScreen/panels.tsx`)
- Category tabs: `[Tất cả, Chính Tuyến, Phụ Tuyến, Tông Môn, Nhiệm Vụ Ẩn]`
- Category badges on each quest row
- "Nhận tất cả" button (enabled when ≥1 available unlocked quest at location)
- "Hoàn thành tất cả" button (enabled when ≥1 active turn-in-ready quest)

---

## Phase 4: Code Implementation & TDD

### Files Changed

| File | Change Type | Lines |
|------|-------------|-------|
| `src/engine/quests.ts` | Added `QuestCategory`, `getQuestCategory()`, `questCategoryLabel()` | +27 |
| `src/engine/index.ts` | Re-exported quest helpers; removed duplicate exports | +11 / -1 |
| `src/engine/types.ts` | Extended `Action` union with batch actions | +4 |
| `src/engine/reducer.ts` | Added `doAcceptAllQuests`, `doClaimAllQuests` handlers | +45 |
| `src/ui/gameScreen/panels.tsx` | Category tabs, badges, batch buttons in DockPanelQuests | +80 |
| `test/quest-categorization-batch.test.ts` | **New file** — 9 TDD tests | 161 |

### Test Results
```
✓ test/quest-categorization-batch.test.ts (9 tests)
  - Quest Categorization: 5 tests (main, side, sect, secret, bilingual labels)
  - Batch Actions: 4 tests (accept_all, accept_subset, claim_all, claim_empty)

Full suite: 134 tests passed (128 files)
TypeScript: tsc --noEmit → clean
```

### Bug Fixes During Implementation
1. **Duplicate exports** in `index.ts` (lines 4-15 and 147): `canAcceptQuest`, `canCompleteQuest`, `countCompletedQuests` — removed duplicate block
2. **Categorization bug**: System quests (`q_sys_*`) had `secret: true` → categorized as 'secret' instead of 'sect' — fixed check order in `getQuestCategory()` to evaluate system/sect before secret flag
3. **Unused import**: Removed `QUESTS` import from test file

---

## Verification Evidence

### Automated Tests (9 new)
```bash
vitest run test/quest-categorization-batch.test.ts
# All 9 tests pass
```

### Full Regression
```bash
vitest run
# 128 test files, 134 tests — all pass
```

```bash
npx tsc --noEmit
# No errors
```

### Manual Verification Checklist
- [x] Main quests (`q_main_letter`, `q_main_route_proof`) → "Chính Tuyến" / "Main Quest"
- [x] Side quests (`q_herb_delivery`, `q_vil_01`) → "Phụ Tuyến" / "Side Quest"
- [x] Sect/System quests (`q_sec_01`, `q_sys_battle_01`) → "Tông Môn" / "Sect Quest"
- [x] Secret quests (`q_secret_eighth_name`) → "Nhiệm Vụ Ẩn" / "Secret Quest"
- [x] At village: "Nhận tất cả" accepts both `q_main_letter` and `q_herb_delivery` in 1 click
- [x] With `questIds: ['q_herb_delivery']` only that quest is accepted
- [x] With 3 spirit_herb in inventory: "Hoàn thành tất cả" completes `q_herb_delivery`, consumes items, awards gold
- [x] No ready quests → "Hoàn thành tất cả" returns empty events, state unchanged

---

## Impact Assessment

### Player Experience
| Metric | Before | After |
|--------|--------|-------|
| Clicks to accept 5 quests | 5 | 1 |
| Clicks to claim 3 ready quests | 3 | 1 |
| Quest list readability | Flat, undifferentiated | Categorized tabs + badges |
| Discovery of secret quests | Hidden in noise | Dedicated "Nhiệm Vụ Ẩn" tab |

### Technical Debt
- **Removed**: Duplicate exports in `index.ts` (3 functions)
- **Fixed**: Categorization precedence bug (system vs secret)
- **Added**: Comprehensive test coverage for new feature

---

## Sign-Off

**Implementation:** Complete  
**Tests:** 9 new + full regression GREEN  
**TypeScript:** Clean  
**LEDGER:** Updated to `fixed-verified`  
**Next Round:** C3-11 — Hidden achievement hints via poetry (`achievements-data.ts`, `achievements.ts`)