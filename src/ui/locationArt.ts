import cloudPeak from '../assets/art/locations/cloud-peak.webp'
import cursedRift from '../assets/art/locations/cursed-rift.webp'
import herbField from '../assets/art/locations/herb-field.webp'
import market from '../assets/art/locations/market.webp'
import mistyForest from '../assets/art/locations/misty-forest.webp'
import sealedCave from '../assets/art/locations/sealed-cave.webp'
import sect from '../assets/art/locations/sect.webp'
import village from '../assets/art/locations/village.webp'
import thousandHerbsValley from '../assets/art/locations/thousand-herbs-valley.webp'
import blackwindDunes from '../assets/art/locations/blackwind-dunes.webp'
import frozenPeak from '../assets/art/locations/frozen-peak.webp'
import wanderingMarket from '../assets/art/locations/wandering-market.webp'
import moonLake from '../assets/art/locations/moon-lake.webp'
import boneAshRuins from '../assets/art/locations/bone-ash-ruins.webp'
import spiritBeastRidge from '../assets/art/locations/spirit-beast-ridge.webp'
import azurePavilion from '../assets/art/locations/azure-pavilion.webp'
import azurePavilionIcon from '../assets/art/location-icons/azure-pavilion.webp'
import blackwindDunesIcon from '../assets/art/location-icons/blackwind-dunes.webp'
import boneAshRuinsIcon from '../assets/art/location-icons/bone-ash-ruins.webp'
import cloudPeakIcon from '../assets/art/location-icons/cloud-peak.webp'
import cursedRiftIcon from '../assets/art/location-icons/cursed-rift.webp'
import frozenPeakIcon from '../assets/art/location-icons/frozen-peak.webp'
import herbFieldIcon from '../assets/art/location-icons/herb-field.webp'
import marketIcon from '../assets/art/location-icons/market.webp'
import mistyForestIcon from '../assets/art/location-icons/misty-forest.webp'
import moonLakeIcon from '../assets/art/location-icons/moon-lake.webp'
import sealedCaveIcon from '../assets/art/location-icons/sealed-cave.webp'
import sectIcon from '../assets/art/location-icons/sect.webp'
import spiritBeastRidgeIcon from '../assets/art/location-icons/spirit-beast-ridge.webp'
import thousandHerbsValleyIcon from '../assets/art/location-icons/thousand-herbs-valley.webp'
import villageIcon from '../assets/art/location-icons/village.webp'
import wanderingMarketIcon from '../assets/art/location-icons/wandering-market.webp'

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
  thousand_herbs_valley: thousandHerbsValley,
  blackwind_dunes: blackwindDunes,
  frozen_peak: frozenPeak,
  wandering_market: wanderingMarket,
  moon_lake: moonLake,
  bone_ash_ruins: boneAshRuins,
  spirit_beast_ridge: spiritBeastRidge,
  azure_pavilion: azurePavilion,
}

const LOCATION_ICONS: Record<ScenarioOneLocationId, string> = {
  village: villageIcon,
  market: marketIcon,
  sect: sectIcon,
  herb_field: herbFieldIcon,
  misty_forest: mistyForestIcon,
  sealed_cave: sealedCaveIcon,
  cursed_rift: cursedRiftIcon,
  cloud_peak: cloudPeakIcon,
  thousand_herbs_valley: thousandHerbsValleyIcon,
  blackwind_dunes: blackwindDunesIcon,
  frozen_peak: frozenPeakIcon,
  wandering_market: wanderingMarketIcon,
  moon_lake: moonLakeIcon,
  bone_ash_ruins: boneAshRuinsIcon,
  spirit_beast_ridge: spiritBeastRidgeIcon,
  azure_pavilion: azurePavilionIcon,
}

export function hasLocationBackdrop(locationId: string): locationId is ScenarioOneLocationId {
  return locationId in LOCATION_BACKDROPS
}

export function hasLocationIcon(locationId: string): locationId is ScenarioOneLocationId {
  return locationId in LOCATION_ICONS
}

export function locationBackdropFor(locationId: string): string | undefined {
  return hasLocationBackdrop(locationId) ? LOCATION_BACKDROPS[locationId] : undefined
}

export function locationIconFor(locationId: string): string | undefined {
  return hasLocationIcon(locationId) ? LOCATION_ICONS[locationId] : undefined
}
