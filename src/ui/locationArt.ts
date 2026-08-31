import cloudPeak from '../assets/art/locations/cloud-peak.png'
import cursedRift from '../assets/art/locations/cursed-rift.png'
import herbField from '../assets/art/locations/herb-field.png'
import market from '../assets/art/locations/market.png'
import mistyForest from '../assets/art/locations/misty-forest.png'
import sealedCave from '../assets/art/locations/sealed-cave.png'
import sect from '../assets/art/locations/sect.png'
import village from '../assets/art/locations/village.png'

/**
 * Scenario I's authored locations.  New scenario packs can own their own
 * location-id union and registry without coupling visuals to game saves.
 */
export const SCENARIO_ONE_LOCATION_IDS = [
  'village',
  'market',
  'sect',
  'herb_field',
  'misty_forest',
  'sealed_cave',
  'cursed_rift',
  'cloud_peak',
  'thousand_herbs_valley',
  'blackwind_dunes',
  'frozen_peak',
  'wandering_market',
  'moon_lake',
  'bone_ash_ruins',
  'spirit_beast_ridge',
  'azure_pavilion',
] as const

export type ScenarioOneLocationId = (typeof SCENARIO_ONE_LOCATION_IDS)[number]

const LOCATION_BACKDROPS: Record<ScenarioOneLocationId, string> = {
  village,
  market,
  sect,
  herb_field: herbField,
  misty_forest: mistyForest,
  sealed_cave: sealedCave,
  cursed_rift: cursedRift,
  cloud_peak: cloudPeak,
  thousand_herbs_valley: herbField,
  blackwind_dunes: cursedRift,
  frozen_peak: cloudPeak,
  wandering_market: market,
  moon_lake: herbField,
  bone_ash_ruins: sealedCave,
  spirit_beast_ridge: mistyForest,
  azure_pavilion: sect,
}

export function hasLocationBackdrop(locationId: string): locationId is ScenarioOneLocationId {
  return locationId in LOCATION_BACKDROPS
}

export function locationBackdropFor(locationId: string): string | undefined {
  return hasLocationBackdrop(locationId) ? LOCATION_BACKDROPS[locationId] : undefined
}
