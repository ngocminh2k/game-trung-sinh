# Campaign 3 — Round 13 Report

**Buried Relic (Chôn Giấu Di Vật) Across Reincarnations**

**Date:** 2026-09-17  
**Status:** `fixed-verified` ✅  
**Source Ticket:** C2 Vòng 17 (p08 Cultivation Collector)  
**Files Modified:** `src/engine/globalProfile.ts`, `src/engine/relics.ts`, `src/engine/map.ts`, `src/engine/index.ts`, `test/buried-relic.test.ts`

---

## Phase 1: Playtest — Persona Probing

### Persona Tested
- **p08 Cultivation Collector** — Laments losing cherished high-tier items upon death; wants a deliberate mechanism to hide a precious heirloom in the world to be rediscovered in a future incarnation.

### Key Findings from Playtest
1. **Lack of spatial legacy**: The player had no agency over where their legacy was placed; only an automated top-power relic was passively inherited.
2. **Desire for treasure hunting across lives**: Xianxia trope of "động phủ tiền bối / di trạch tiền nhân" (ancestor's hidden cave/cache) gives deep satisfaction when a player in life N+1 visits old coordinates to recover an item buried in life N.
3. **Exploration incentive**: Encourages exploring dangerous or remote map cells specifically to unearth hidden relics.

---

## Phase 2: Docs Cross-Reference

### Related Campaign 2 Ticket
| Ticket | Issue | Resolution in C3-13 |
|--------|-------|---------------------|
| C2-17 (p08) | Lost precious forged weapons/items on death | `Chôn Giấu Di Vật (Buried Relic)` at secret map coordinates `(locationId, posX, posY)` |

### Design References
- **Xianxia cache metaphor**: "Chôn Giấu Di Vật" — burying a weapon, pill, or talisman at secret coordinates for future reincarnations.
- **GlobalProfile persistence**: `buriedRelic: BuriedRelic | null` persists across runs, deaths, and save slots.
- **Spatial detection**: `hasBuriedRelicAt` and `getBuriedRelicHint` in `map.ts` calculate Manhattan distance and region match.

---

## Phase 3: Spec Formalization

### Acceptance Criteria (from ROADMAP.md C3-13)
- [x] **Data schema**: `BuriedRelic` interface with `itemId`, `locationId`, `x`, `y` in `globalProfile.ts`
- [x] **GlobalProfile persistence**: `DEFAULT_GLOBAL_PROFILE.buriedRelic = null`, Zod validation schema, preserved in `recordTerminal()`
- [x] **Bury mechanics**: `canBuryRelic` and `buryRelic` in `relics.ts` deduct item from inventory and set coordinates in profile
- [x] **Unearth mechanics**: `canUnearthRelic` and `unearthRelic` in `relics.ts` verify exact coordinate match, grant item, and clear profile slot
- [x] **Map spatial helpers**: `hasBuriedRelicAt` and `getBuriedRelicHint` in `map.ts` for UI and navigation radar
- [x] **Tests**: 11 TDD tests covering schema, persistence, bury, unearth, and map hints (RED→GREEN)

### Technical Spec

#### Global Profile Layer (`src/engine/globalProfile.ts`)
```typescript
export interface BuriedRelic {
  itemId: string
  locationId: string
  x: number
  y: number
}
```

#### Relics Engine Layer (`src/engine/relics.ts`)
- `canBuryRelic(state: GameState, itemId: string): boolean`
- `buryRelic(state: GameState, profile: GlobalProfile, itemId: string): { state: GameState; profile: GlobalProfile; buried: BuriedRelic } | null`
- `canUnearthRelic(state: GameState, profile: GlobalProfile): boolean`
- `unearthRelic(state: GameState, profile: GlobalProfile): { state: GameState; profile: GlobalProfile; unearthedItemId: string } | null`

#### Map Spatial Layer (`src/engine/map.ts`)
- `hasBuriedRelicAt(profile: GlobalProfile | null | undefined, locationId: string, x: number, y: number): boolean`
- `getBuriedRelicHint(profile: GlobalProfile | null | undefined, currentLocationId: string, currentX: number, currentY: number): BuriedRelicHint | null`

---

## Phase 4: Code Implementation & TDD

### Files Changed

| File | Change Type | Lines |
|------|-------------|-------|
| `src/engine/globalProfile.ts` | Added `BuriedRelic` interface, schema, parser, and profile field | +25 |
| `src/engine/relics.ts` | Added `canBuryRelic`, `buryRelic`, `canUnearthRelic`, `unearthRelic` | +65 |
| `src/engine/map.ts` | Added `hasBuriedRelicAt`, `getBuriedRelicHint`, `BuriedRelicHint` | +40 |
| `src/engine/index.ts` | Exported new relic and map functions & types | +5 |
| `src/i18n/en.ts` | Added missing `gallery` keys to match `vi.ts` | +1 |
| `test/buried-relic.test.ts` | **New file** — 11 TDD tests | 196 |

### Test Results
```
✓ test/buried-relic.test.ts (11 tests)
  - GlobalProfile BuriedRelic schema & persistence: 3 tests
  - buryRelic mechanics (relics.ts): 3 tests
  - unearthRelic mechanics (relics.ts & map.ts): 3 tests
  - map spatial detection & hints (map.ts): 2 tests

Full suite: 136 test files passed
TypeScript: tsc --noEmit → 0 errors
```

---

## Impact Assessment

### Player Experience
| Metric | Before | After |
|--------|--------|-------|
| Cross-life legacy agency | Passive automatic relic only | Intentional coordinate burial of any owned item |
| Map exploration motivation | Static nodes only | Personal treasure hunt targeting past life coordinates |
| Loss aversion relief | 100% unequipped gear wiped | Option to preserve favorite heirloom at secret spot |

---

## Sign-Off

**Implementation:** Complete  
**Tests:** 11 new tests GREEN, full regression clean  
**TypeScript:** Clean (0 errors)  
**LEDGER:** Updated to `fixed-verified`  
**Next Round:** C3-14 — Hibernate Mechanism (Cơ chế Ngủ Đông) (`src/engine/offline.ts`, `time.ts`)
