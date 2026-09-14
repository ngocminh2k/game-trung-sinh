import { describe, expect, it } from 'vitest'
import { MINOR_REALM_THRESHOLDS, minorRealmThreshold } from '../src/engine'

describe('cultivation pacing (2026-09 rebalance)', () => {
  it('row 0 is no longer halved — a broken root needs 2–4 sessions per minor realm', () => {
    expect(MINOR_REALM_THRESHOLDS[0]).toEqual([4, 4, 5, 5, 6, 6, 7, 7, 8])
  })

  it('row 1 keeps the original gentler cadence', () => {
    expect(MINOR_REALM_THRESHOLDS[1]).toEqual([3, 3, 4, 4, 4, 5, 5, 6, 6])
  })

  it('rows 2..4 are unchanged', () => {
    expect(MINOR_REALM_THRESHOLDS[2]).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17])
    expect(MINOR_REALM_THRESHOLDS[3]).toEqual([17, 18, 19, 20, 21, 22, 23, 24, 25])
    expect(MINOR_REALM_THRESHOLDS[4]).toEqual([24, 25, 26, 27, 28, 29, 30, 31, 32])
  })

  it('minorRealmThreshold reflects the new row 0 values', () => {
    expect(minorRealmThreshold(0, 1)).toBe(4)
    expect(minorRealmThreshold(0, 9)).toBe(8)
    expect(minorRealmThreshold(1, 1)).toBe(3)
    expect(minorRealmThreshold(1, 9)).toBe(6)
    expect(minorRealmThreshold(2, 9)).toBe(17)
  })
})