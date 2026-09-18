# Campaign 3 — Round 14 Report

**Cơ Chế Ngủ Đông (Hibernate) — Anti-Churn Offline Time Freeze**

**Date:** 2026-09-17  
**Status:** `fixed-verified` ✅  
**Source Ticket:** C2 Vòng 19 (p18 Distracted Parent / Busy Worker)  
**Files Modified:** `src/engine/types.ts`, `src/engine/schema.ts`, `src/engine/constants.ts`, `src/engine/time.ts`, `src/engine/offline.ts`, `src/engine/index.ts`, `src/i18n/vi.ts`, `src/i18n/en.ts`, `test/hibernate.test.ts`

---

## Phase 1: Playtest — Persona Probing

### Persona Tested
- **p18 Distracted Parent / Busy Worker** — Needs to pause or walk away from the game for unpredictable, extended intervals (up to 7 real days) due to emergencies, family obligations, or work sprints without coming back to decayed crops, missed deadlines, or ruined game states.

### Key Findings from Playtest
1. **Fear of Missing Out & Decay Penalty**: Players with irregular play schedules worry about their crops decaying or deadlines passing while away.
2. **Desire for Xianxia "Đông Miên / Bế Quan Phong Ấn"**: Entering a deep hibernation state freezes world time, biological decay, and crop countdowns for up to 7 real days (168 hours).
3. **Graceful Awakening**: When the player returns within 7 days, 100% of their status is preserved. If away longer than 7 days, only the excess time counts toward standard offline meditation progress, ensuring a safe buffer.

---

## Phase 2: Docs Cross-Reference

### Related Campaign 2 Ticket
| Ticket | Issue | Resolution in C3-14 |
|--------|-------|---------------------|
| C2-19 (p18) | Players with fragmented time abandon game due to decay | `Cơ Chế Ngủ Đông (Hibernate)` freezing world time and timers for up to 7 real days (168h) |

### Design References
- **Xianxia hibernation trope**: "Đông Miên / Phong Ấn Tu Vi" — sealing vitality and time flow.
- **Safety Window**: `HIBERNATE_MAX_MS = 7 * 24 * 60 * 60 * 1000` (604,800,000 ms).
- **Zod Backward Compatibility**: `hibernation: z.object({ active: z.boolean(), startedAt: z.number().int().nonnegative() }).nullable().default(null)`.

---

## Phase 3: Spec Formalization

### Acceptance Criteria (from ROADMAP.md C3-14)
- [x] **Data schema**: `HibernationState` interface `{ active: boolean; startedAt: number }` added to `GameState` and validated via Zod schema with `.nullable().default(null)`.
- [x] **Time calculation**: `calculateHibernatedTime(elapsedMs, hibernating)` calculates `frozenMs` (capped at 168h) and `effectiveElapsedMs`.
- [x] **Guards and transitions**: `canHibernate`, `enterHibernation`, `wakeFromHibernation`, `isHibernating` in `src/engine/time.ts`.
- [x] **Offline gains integration**: `calculateOfflineGains` and `applyOfflineGains` handle hibernation freezing, waking upon session load, and recording chronicle entries.
- [x] **Bilingual i18n**: Added parity entries `hibernated` and `hibernatedWithProgress` in both `src/i18n/vi.ts` and `src/i18n/en.ts`.
- [x] **Unit tests**: 15 TDD tests in `test/hibernate.test.ts` covering guards, calculations, chronicle logging, and schema compatibility.

---

## Phase 4: Code Implementation & TDD

### Technical Implementation

#### 1. Data Contract (`src/engine/types.ts` & `src/engine/schema.ts`)
```typescript
export interface HibernationState {
  active: boolean
  startedAt: number
}

// in GameStateSchema:
hibernation: z
  .object({
    active: z.boolean(),
    startedAt: z.number().int().nonnegative(),
  })
  .nullable()
  .default(null)
```

#### 2. Time Engine (`src/engine/time.ts`)
```typescript
export const HIBERNATE_MAX_DAYS = 7
export const HIBERNATE_MAX_HOURS = 7 * 24 // 168
export const HIBERNATE_MAX_MS = HIBERNATE_MAX_DAYS * 24 * 60 * 60 * 1000

export function isHibernating(state: GameState): boolean {
  return state.hibernation?.active === true
}

export function canHibernate(state: GameState): boolean {
  return (
    state.player.alive &&
    !state.terminal &&
    state.encounter === null &&
    !isHibernating(state)
  )
}

export function enterHibernation(state: GameState, now: number): GameState {
  if (!canHibernate(state)) return state
  return {
    ...state,
    hibernation: { active: true, startedAt: now },
  }
}

export function wakeFromHibernation(state: GameState): GameState {
  if (!state.hibernation) return state
  return { ...state, hibernation: null }
}

export function calculateHibernatedTime(
  elapsedMs: number,
  hibernating: boolean,
): { effectiveElapsedMs: number; frozenMs: number } {
  if (!hibernating || elapsedMs <= 0) {
    return { effectiveElapsedMs: Math.max(0, elapsedMs), frozenMs: 0 }
  }
  const frozenMs = Math.min(elapsedMs, HIBERNATE_MAX_MS)
  const effectiveElapsedMs = Math.max(0, elapsedMs - frozenMs)
  return { effectiveElapsedMs, frozenMs }
}
```

#### 3. Offline Progression (`src/engine/offline.ts`)
```typescript
export function calculateOfflineGains(
  lastSavedAt: number,
  now: number,
  hibernating: boolean = false,
): { hoursAway: number; progressGain: number; frozenHours?: number } | null {
  const elapsedMs = Math.max(0, now - lastSavedAt)
  if (elapsedMs <= 0) return null
  const { effectiveElapsedMs, frozenMs } = calculateHibernatedTime(elapsedMs, hibernating)
  const frozenHours = Math.floor(frozenMs / (60 * 60 * 1000))

  if (effectiveElapsedMs < OFFLINE_MIN_MS) {
    return frozenHours > 0 ? { hoursAway: 0, progressGain: 0, frozenHours } : null
  }
  const hoursAway = Math.floor(Math.min(effectiveElapsedMs, OFFLINE_CAP_MS) / (60 * 60 * 1000))
  return {
    hoursAway,
    progressGain: hoursAway * OFFLINE_PROGRESS_PER_HOUR,
    ...(frozenHours > 0 ? { frozenHours } : {}),
  }
}
```

### Verification Results
```bash
npx vitest run test/hibernate.test.ts test/offline.test.ts
# ✓ test/offline.test.ts (10 tests)
# ✓ test/hibernate.test.ts (15 tests)
# Total: 25 passed

npx tsc --noEmit
# 0 errors
```
