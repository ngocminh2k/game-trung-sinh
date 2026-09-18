# Campaign 3 — Round 15 Report

**Lịch Âm Widget & Dự Báo Thiên Tượng 7 Ngày (Lunar Calendar & Forecast)**

**Date:** 2026-09-17  
**Status:** `fixed-verified` ✅  
**Source Ticket:** C2 Vòng 13 (p16 Wanderer / Herbalist, p13 Cartographer)  
**Files Modified/Created:**
- `src/engine/weather.ts`
- `src/engine/index.ts`
- `src/ui/LunarCalendarModal.tsx`
- `src/ui/ProtoShell.tsx`
- `src/ui/screens.css`
- `test/lunar-calendar.test.ts`
- `test/lunar-calendar.ui.test.tsx`

---

## Phase 1: Playtest — Persona Probing

### Personas Tested
- **p16 Wanderer / Herbalist**: Experiences unpredictable herb yields and price shocks because herbal growth and market prices swing wildly with weather without advance notice.
- **p13 Cartographer / Planner**: Enters dangerous combat and boss encounters on Day 15 unaware that the Blood Moon (+30% realm-wide combat damage) is occurring, leading to unexpected wipes.

### Key Findings from Playtest
1. **Lack of Foresight**: Players could only see today's weather and current lunar phase. They could not prepare ahead for Blood Moons or plan harvesting/trading expeditions around high-yield weather.
2. **Desire for Deep Xianxia Astronomical Lore**: In xianxia literature, cultivators consult the Sexagenary Cycle (60 Hoa Giáp - 10 Thiên Can × 12 Địa Chi) and 28-day lunar months to divine celestial signs (chiêm tinh, thiên cơ).
3. **Need for Accessible UI Widget**: A topbar astronomical button (`🌙`) allowing quick lookup of the 60 Hoa Giáp, 28-day lunar month, Blood Moon warnings, and 7-day lookahead weather forecasts with zero RNG consumption.

---

## Phase 2: Docs Cross-Reference

### Related Campaign 2 Ticket
| Ticket | Issue | Resolution in C3-15 |
|--------|-------|---------------------|
| C2-13 (p16, p13) | Players have no advance warning of Blood Moons or seasonal weather modifiers | `LunarCalendarModal` + `getWeatherForecast(seed, day, 7)` + `getCanChiOfDay` + `getLunarDate` |

### Canon Design References
- **60 Hoa Giáp (Sexagenary Can Chi)**:
  - 10 Heavenly Stems (`THIEN_CAN_VI`: Giáp, Ất, Bính, Đinh, Mậu, Kỷ, Canh, Tân, Nhâm, Quý).
  - 12 Earthly Branches (`DIA_CHI_VI`: Tý, Sửu, Dần, Mão, Thìn, Tị, Ngọ, Mùi, Thân, Dậu, Tuất, Hợi).
  - `(day - 1) % 10` & `(day - 1) % 12`. Day 1 = Giáp Tý (Jia-Zi), Day 60 = Quý Hợi (Gui-Hai), Day 61 = Giáp Tý.
- **28-Day Xianxia Lunar Month**:
  - Exactly 28 days per month (4 weeks aligned with 4 seasons).
  - Day 1 = Sóc (New Moon), Day 15 = Huyết Nguyệt (Blood Moon), Day 28 = Hối (End of Month). Day 29 = Day 1 of Month 2.
- **RNG Determinism**:
  - `getWeatherForecast` uses pure FNV-1a mathematical hashing based on `(seed, targetDay)` without mutating or polling `state.rng`.

---

## Phase 3: Spec Formalization

### Acceptance Criteria (from ROADMAP.md C3-15)
- [x] **Can Chi calculation**: `getCanChiOfDay(day)` returns `{ vi: string, en: string }` cycling through 60 Hoa Giáp.
- [x] **Lunar Date calculation**: `getLunarDate(day)` returns `{ lunarDay: number, lunarMonth: number }` based on 28-day cycle.
- [x] **Lunar Phases**: `getLunarPhase(day)` returns accurate icon and bilingual names across 9 lunar phases.
- [x] **7-Day Weather Forecasting**: `getWeatherForecast(seed, currentDay, 7)` deterministically computes lookahead days with astronomical details, Blood Moon flags, and gameplay modifiers.
- [x] **Accessible UI Modal**: `LunarCalendarModal.tsx` implements WAI-ARIA dialog specifications (`role="dialog"`, `aria-modal="true"`, Escape key, backdrop dismiss, high-contrast cards).
- [x] **ProtoShell Integration**: Mounted with topbar button `🌙` (`data-testid="lunar-calendar-btn"`), tracked in `isDialogModalActive`.
- [x] **Testing**: 20 unit tests in `test/lunar-calendar.test.ts` + 6 UI integration tests in `test/lunar-calendar.ui.test.tsx`. 100% green.

---

## Phase 4: Code Implementation & TDD

### Technical Implementation

#### 1. Core Astronomical Engine (`src/engine/weather.ts`)
```typescript
export const LUNAR_MONTH_DAYS = 28
export const THIEN_CAN_VI = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'] as const
export const THIEN_CAN_EN = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'] as const
export const DIA_CHI_VI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tị', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'] as const
export const DIA_CHI_EN = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'] as const

export function getCanChiOfDay(day: number): { vi: string; en: string } {
  const d = Math.max(1, Math.floor(day))
  const canIndex = (d - 1) % 10
  const chiIndex = (d - 1) % 12
  return {
    vi: `${THIEN_CAN_VI[canIndex]} ${DIA_CHI_VI[chiIndex]}`,
    en: `${THIEN_CAN_EN[canIndex]}-${DIA_CHI_EN[chiIndex]}`,
  }
}

export function getLunarDate(day: number): { lunarDay: number; lunarMonth: number } {
  const d = Math.max(1, Math.floor(day))
  const lunarDay = ((((d - 1) % LUNAR_MONTH_DAYS) + LUNAR_MONTH_DAYS) % LUNAR_MONTH_DAYS) + 1
  const lunarMonth = Math.floor((d - 1) / LUNAR_MONTH_DAYS) + 1
  return { lunarDay, lunarMonth }
}
```

#### 2. Accessible UI Modal (`src/ui/LunarCalendarModal.tsx`)
- Includes Current Day Overview banner with Can Chi, lunar date, weather icon.
- Renders glowing Blood Moon warning banner on Day 15.
- Displays responsive 7-day forecast grid with modifiers for Herb prices, Boss power, and Travel costs.
- Includes Xianxia Astronomical Lore legend explaining Can Chi and celestial mechanics.

#### 3. Verification & Metrics
- Unit Tests: 20/20 passed (`test/lunar-calendar.test.ts`).
- UI Tests: 6/6 passed (`test/lunar-calendar.ui.test.tsx`).
- Full Test Suite: 140 files passed, 1171 tests passed.
- TypeScript: `npx tsc --noEmit` clean with 0 errors.
