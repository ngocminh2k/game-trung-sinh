# Campaign 3 — Round 16 Report

**Tương tác Ngoại Trang × Danh hiệu (E4: 0 chỉ số, đúng chuẩn)**

**Date:** 2026-09-17  
**Status:** `fixed-verified` ✅  
**Source Ticket:** C2 Vòng 14 (p14 Roleplayer, p11 Cosmetic Collector, Rule E4 Anti-Pay-to-Win)  
**Files Modified/Created:**
- `src/content/outfits.ts`
- `src/engine/outfits.ts`
- `src/engine/types.ts`
- `src/engine/schema.ts`
- `src/engine/reducer.ts`
- `src/engine/index.ts`
- `src/ui/OutfitTitleModal.tsx`
- `src/ui/ProtoShell.tsx`
- `test/outfits.test.ts`
- `test/outfits.ui.test.tsx`

---

## Phase 1: Playtest — Persona Probing

### Personas Tested
- **p14 Roleplayer / Immortal Sage**: Desires expressive character customization and identity titles that reflect cultivation accomplishments (Bamboo Scholar, Wind Walker, Herb Master) without turning the game into an artificial stats-grind.
- **p11 Cosmetic Collector / Anti-P2W Purist**: Demands that cosmetic items (outfits, titles, visual auras) strictly adhere to **Rule E4**: **0 combat stats** (`hp: 0, attack: 0, defense: 0, crit: 0`). Expresses strong aversion to pay-to-win or combat creep in cosmetic systems, but enthusiastically welcomes roleplay perks like social charm, market trade bargaining, and travel stamina reduction.

### Key Findings from Playtest
1. **Strict E4 Anti-P2W Guarantee**: Every outfit, title, and synergy buff must mathematically provide zero combat attributes. Any attack, defense, hp, or crit values > 0 violates E4 and breaks player trust.
2. **In-Game Currency Economy Sink**: Outfits must be purchasable exclusively with in-game earned currencies (Silver, Gold, Spirit Stones). Titles should unlock dynamically upon reaching cultivation milestones, achievements, or realm breakthroughs.
3. **Cosmetic Resonance Mechanics**: Equipping matching pairs (e.g. Bamboo Scholar Outfit + Novice Title, Celestial Cloud Robe + Wind Walker Title, Crimson Asura Garb + Fate Defier Title) unlocks thematic cosmetic auras (`ink_drift`, `azure_sky`, `crimson_flame`, `purple_mist`) alongside balanced utility perks (+Charm, -Travel stamina, +Shop discount).

---

## Phase 2: Docs Cross-Reference

### Related Campaign 2 Ticket
| Ticket | Issue | Resolution in C3-16 |
|--------|-------|---------------------|
| C2-14 (p14, p11) | Lack of expressive identity cosmetics and fear of P2W combat inflation | `OutfitTitleModal` + `OUTFITS` + `TITLES` + `OUTFIT_TITLE_SYNERGIES` with strict E4 0-combat-stats invariant |

### Canon Design References
- **E4 Anti-Pay-to-Win Rule**:
  - `combatStats: { hp: 0, attack: 0, defense: 0, crit: 0 }` for all `OutfitDef` and `TitleDef`.
  - `buffs: { combatAttackBonus: 0, combatDefenseBonus: 0, combatHpBonus: 0, combatCritBonus: 0 }` for all `OutfitTitleSynergy`.
  - Validated by runtime test assertions and `isZeroCombatStatsGuaranteed()`.
- **Cosmetic Synergy Resonance**:
  - `synergy_bamboo_novice`: "Trúc Vận Đạo Đồng" (`ink_drift` aura, +10 Charm, 5% Shop Discount, -10% Travel Fatigue).
  - `synergy_celestial_wind`: "Vân Tiêu Tiên Tôn" (`azure_sky` aura, +15 Charm, 10% Shop Discount, -15% Travel Fatigue).
  - `synergy_asura_fate`: "Nghịch Mệnh La Sát" (`crimson_flame` aura, +20 Charm, 12% Shop Discount, -20% Travel Fatigue).
  - `synergy_violet_master`: "Tử Tiêu Tông Sư" (`purple_mist` aura, +25 Charm, 15% Shop Discount, -25% Travel Fatigue).

---

## Phase 3: Spec Formalization

### Acceptance Criteria (from ROADMAP.md C3-16)
- [x] **Data Definitions**: `OutfitDef`, `TitleDef`, `OutfitTitleSynergy` defined with bilingual strings and strict `CombatStatsZero`.
- [x] **Zero Combat Stats Invariant**: Comprehensive assertion suite confirming no combat stat boosts across all outfits, titles, and synergy buffs.
- [x] **Currency Purchasing**: Pure engine functions `canBuyOutfit` and `buyOutfit` deducting Silver, Gold, or Spirit Stones and deduplicating inventory.
- [x] **Title Progression & Unlocking**: `isTitleUnlocked` checking milestones (default novice, herb master achievement, wind walker stage 3, fate defier stage 4, revered master realm breakthrough).
- [x] **Resonance Bonuses**: Pure calculation functions for Charm (`calculateSynergyCharmBonus`), Shop Discounts (`calculateSynergyShopDiscount`), and Travel Fatigue (`calculateSynergyTravelReduction`).
- [x] **State Schema Backward Compatibility**: `activeOutfitId`, `activeTitleId`, `unlockedOutfits`, `unlockedTitles` defaulted safely in `GameStateSchema`.
- [x] **Action Reducer Dispatch**: `buy_outfit`, `equip_outfit`, `equip_title` integrated with events (`OUTFIT_BOUGHT`, `OUTFIT_EQUIPPED`, `TITLE_EQUIPPED`, `OUTFIT_TITLE_SYNERGY`).
- [x] **Accessible UI Modal**: `OutfitTitleModal.tsx` featuring tabbed navigation (Ngoại Trang, Danh Hiệu, Cộng Hưởng), active loadout bar, E4 standard badge, and responsive card lists.
- [x] **ProtoShell Topbar Integration**: Topbar button `👘` (`data-testid="outfits-titles-btn"`), modal toggle, and hotkey integration.
- [x] **Testing**: 18 engine unit tests in `test/outfits.test.ts` + 8 UI component tests in `test/outfits.ui.test.tsx`. 100% green.

---

## Phase 4: Code Implementation & TDD

### Test Results
- `test/outfits.test.ts`: 18/18 tests passed.
- `test/outfits.ui.test.tsx`: 8/8 tests passed.
- Total suite: 26 tests passing in 4.11s.
