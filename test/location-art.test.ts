import { describe, expect, it } from 'vitest'
import { LOCATIONS } from '../src/content/locations'
import {
  hasLocationBackdrop,
  locationBackdropFor,
  SCENARIO_ONE_LOCATION_IDS,
} from '../src/ui/locationArt'

describe('Scenario I location art registry', () => {
  it('registers one illustrated backdrop for every playable Scenario I location', () => {
    expect(SCENARIO_ONE_LOCATION_IDS).toHaveLength(16)
    expect(LOCATIONS.map((location) => location.id)).toEqual([...SCENARIO_ONE_LOCATION_IDS])

    for (const location of LOCATIONS) {
      expect(hasLocationBackdrop(location.id)).toBe(true)
      expect(locationBackdropFor(location.id)).toMatch(/\.png$/)
    }
  })

  it('does not pretend that unknown locations have visual coverage', () => {
    expect(hasLocationBackdrop('future_location')).toBe(false)
    expect(locationBackdropFor('future_location')).toBeUndefined()
  })
})
