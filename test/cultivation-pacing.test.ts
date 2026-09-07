import { describe, expect, it } from 'vitest'
import { MINOR_REALM_THRESHOLDS, minorRealmThreshold } from '../src/engine'

describe('cultivation pacing (P1-3)', () => {
  it('row 0 thresholds are halved — every minor realm takes 2', () => {
    expect(MINOR_REALM_THRESHOLDS[0]).toEqual([2, 2, 2, 2, 2, 2, 2, 2, 2])
  })

  it('row 1 thresholds are roughly halved with rounding up', () => {
    expect(MINOR_REALM_THRESHOLDS[1]).toEqual([3, 3, 4, 4, 4, 5, 5, 6, 6])
  })

  it('rows 2..4 are unchanged', () => {
    expect(MINOR_REALM_THRESHOLDS[2]).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17])
    expect(MINOR_REALM_THRESHOLDS[3]).toEqual([17, 18, 19, 20, 21, 22, 23, 24, 25])
    expect(MINOR_REALM_THRESHOLDS[4]).toEqual([24, 25, 26, 27, 28, 29, 30, 31, 32])
  })

  it('minorRealmThreshold reflects the new row 0/1 values', () => {
    expect(minorRealmThreshold(0, 1)).toBe(2)
    expect(minorRealmThreshold(0, 9)).toBe(2)
    expect(minorRealmThreshold(1, 1)).toBe(3)
    expect(minorRealmThreshold(1, 9)).toBe(6)
    expect(minorRealmThreshold(2, 9)).toBe(17)
  })
})