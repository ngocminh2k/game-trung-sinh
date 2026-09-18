# Campaign 3 — Round 19 Report

**Bộ Vật Phẩm Thời Tiết (Áo mưa, Ngọc tránh nắng, Bùa xua sương) (`src/content/items.ts`, `src/content/rpg.ts`, `src/engine/weather.ts`, `src/engine/telegraph.ts`, `src/engine/reducer.ts`)**

**Date:** 2026-09-17  
**Status:** `fixed-verified` ✅  
**Source Ticket:** C2 Vòng 13 (p19 Survivalist / Tactical Planner, ROADMAP.md C3-19)  
**Files Modified/Created:**
- `src/content/items.ts` (Modified: registered `raincoat`, `sun_gem`, `fog_talisman` with pricing, descriptions, and equipment slots)
- `src/content/rpg.ts` (Modified: registered equipment stat defs for `raincoat` [def 2, qi 5], `sun_gem` [def 1, qi 8], `fog_talisman` [atk 1, def 1, qi 6])
- `src/engine/weather.ts` (Modified: dual-availability check `hasWeatherCounterItem`, effective modifiers `getEffectiveWeatherEffects`, `getEffectiveElementModifier`, and `getEffectiveWeatherDodgeBonus`)
- `src/engine/telegraph.ts` (Modified: dynamically forecast mitigated travel damage and suppress `weatherAmplified: false` when holding counter gear)
- `src/engine/reducer.ts` (Modified: wired effective weather mitigation into `doMove` damage, `doCombatAttack` elemental multiplier and dodge calculation, and resolved dynamic `playerMaxHp` in `doArenaChallenge`)
- `src/engine/index.ts` (Modified: exported weather item constants and mitigation utilities)
- `test/weather-items.test.ts` (Created: 15 unit and integration tests covering item catalog, equipment stats, dual-availability, combat, evasion, and risk telegraphing)
- `test/killer-arena-coercion.test.ts` (Modified: verified dynamic max HP survival across 5 arena floors)

---

## Phase 1: Playtest — Persona Probing

### Persona Tested
- **p19 Survivalist / Tactical Planner**:
  - Context: Methodical player who monitors weather forecasts, plans travel routes, and seeks counters to adverse environmental hazards.
  - Frustration: Harsh weather debuffs (rain/storm travel damage taxes up to 1.5×, mist boss power surges +30%, enemy evasion +15% in mist, elemental combat damage reductions down to 0.8×) felt like unavoidable rng punishments with no tactical preparation options.
  - Expectation: Dedicated wearable gear or carried talismans that nullify adverse weather penalties, strip enemy environmental bonuses, and reward strategic inventory preparation.

### Key Findings from Playtest
1. **Dual-Availability Ergonomics**:
   - Forcing players to sacrifice their primary combat robes or accessories solely for travel weather protection felt overly punishing.
   - Enabling a dual-availability model (`hasWeatherCounterItem`) where benefits trigger either when equipped or carried in inventory allows tactical flexibility while exploring.
2. **Combat & Elemental Balance**:
   - Items must selectively lift penalties (e.g. Fire in rain 0.8 → 1.0) without stripping legitimate elemental buffs (Water in rain remains 1.25×).
   - `fog_talisman` stripping enemy environmental evasion (0.15 → 0) while letting the player retain their dodge bonus creates a high-satisfaction tactical reward.
3. **Risk Forecast Transparency**:
   - `travelRisk` in `src/engine/telegraph.ts` must accurately reflect mitigated travel cost and suppress warning flags (`weatherAmplified: false`) when the player holds appropriate gear, keeping UI indicators trustworthy.

---

## Phase 2: Docs Cross-Reference

### Related Campaign 2 Ticket
| Ticket | Issue | Resolution in C3-19 |
|--------|-------|---------------------|
| C2-13 (p19) | Weather debuffs lack mitigation items; travel damage and elemental penalties feel unavoidable | Added `raincoat`, `sun_gem`, `fog_talisman` with dual-availability and comprehensive combat/travel nullification |

### Canon Design References
- **ROADMAP.md (C3-19)**:
  - "Bộ vật phẩm thời tiết (Áo mưa, Ngọc tránh nắng, Bùa xua sương) | C2 Vòng 13 | `src/content/items.ts`, `weather.ts` | Vật phẩm chống chịu hiệu ứng thời tiết; test"
- **Jesse Schell (The Art of Game Design)**:
  - *Lens of Meaningful Choice & Preparation*: Giving players tools to prepare for environmental challenges transforms environmental obstacles from random penalties into rewarding tactical gameplay.

---

## Phase 3: Spec Formalization

### Acceptance Criteria
- [x] **Item Catalog & Equipment Data (`src/content/items.ts`, `src/content/rpg.ts`)**:
  - `raincoat` (Áo tơi đồng): Robe slot, buy 45, sell 22, def +2, qi +5.
  - `sun_gem` (Ngọc tránh nắng): Accessory slot, buy 50, sell 25, def +1, qi +8.
  - `fog_talisman` (Bùa xua sương): Accessory slot, buy 40, sell 20, atk +1, def +1, qi +6.
- [x] **Dual-Availability Model (`src/engine/weather.ts`)**:
  - `hasWeatherCounterItem(state, itemId)` returns true if item is equipped in `robe`, `accessory`, or `weapon`, OR present in `inventory[itemId] > 0`.
- [x] **Effective Weather Modifiers Engine (`src/engine/weather.ts`)**:
  - `getEffectiveWeatherEffects`:
    - `raincoat`: Clamps `travelCostMod` to 1.0 under rain (`mua`) and storm (`bao`).
    - `fog_talisman`: Clamps `travelCostMod` and `bossPowerMod` to 1.0 under mist (`suong`).
  - `getEffectiveElementModifier`:
    - `raincoat`: Fire penalty in rain (0.8 -> 1.0) and Wood penalty in storm (0.9 -> 1.0) nullified.
    - `sun_gem`: Water penalty in clear sky (0.9 -> 1.0) nullified.
    - `fog_talisman`: Fire penalty in mist (0.9 -> 1.0) nullified.
  - `getEffectiveWeatherDodgeBonus`:
    - `fog_talisman`: Strips enemy dodge bonus (0.15 -> 0) in mist; player dodge remains 0.15.
- [x] **Telegraph Risk Integration (`src/engine/telegraph.ts`)**:
  - Predicts mitigated damage ranges using `getEffectiveWeatherEffects`.
  - Sets `weatherAmplified: false` when mitigating gear holds `travelCostMod <= 1.0`.
- [x] **Reducer & Combat Integration (`src/engine/reducer.ts`)**:
  - Movement hazard damage accounts for mitigated `travelCostMod`.
  - Combat elemental scaling and evasion calculation leverage effective modifiers.
  - Arena rest heal correctly calculates using `playerMaxHp(state)` without clamping player HP to 100.
- [x] **Verification**:
  - `test/weather-items.test.ts` (15/15 passed).
  - `test/killer-arena-coercion.test.ts` (17/17 passed).
  - `npx tsc --noEmit` clean (0 errors).

---

## Phase 4: Implementation & Test Verification

### Automated Test Runs
1. **Weather Items Suite (`test/weather-items.test.ts`)**:
   - `Weather Counter Items Catalog & Equipment (C3-19)` (2 tests): PASS
   - `Dual-Availability Possession Model (C3-19)` (3 tests): PASS
   - `Effective Weather Effects Mitigation (C3-19)` (2 tests): PASS
   - `Element Combat Penalty Nullification (C3-19)` (3 tests): PASS
   - `Environmental Evasion Stripping (C3-19)` (1 test): PASS
   - `Telegraph Travel Risk Mitigation (C3-19)` (1 test): PASS
   - `Reducer End-to-End Integration (C3-19)` (3 tests): PASS
   - *Total*: 15 passed in 16ms.

2. **Arena Coercion Suite (`test/killer-arena-coercion.test.ts`)**:
   - *Total*: 17 passed in 43ms.

3. **Type Checking**:
   - `npx tsc --noEmit`: 0 errors across entire workspace.
