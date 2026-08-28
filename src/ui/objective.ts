import { ENEMIES, getLocation, getRegionMap } from '../content'
import { currentStoryScene, storyRouteTarget, type GameState, type Locale } from '../engine'
import { t } from '../i18n'

function locationName(locationId: string, locale: Locale): string {
  const location = getLocation(locationId)
  return location === undefined ? locationId : locale === 'vi' ? location.nameVi : location.nameEn
}

// The always-visible "next milestone" the GDD mandates in §3 (rule 1) and §6.3.
// Derived purely from save state so it stays deterministic and never spoils
// downstream events. Lower priority means "louder": combat beats exploration
// beats the slow cultivation grind.
export function deriveObjective(game: GameState, locale: Locale): string | null {
  if (game.terminal) return null
  if (game.encounter !== null) {
    return t(locale, 'ui.objective.battle')
  }
  const routeTarget = storyRouteTarget(game)
  if (routeTarget !== undefined) {
    const node = getRegionMap(routeTarget.locationId)?.cells.find((cell) => cell.node?.id === routeTarget.nodeId)?.node
    const targetName = node === undefined ? locationName(routeTarget.locationId, locale) : locale === 'vi' ? node.nameVi : node.nameEn
    return locale === 'vi'
      ? `Đến ${targetName} theo dấu son trên bản đồ. Gặp đầu mối này để mở lựa chọn tiếp theo.`
      : `Reach ${targetName}, marked in vermilion on the map. Meeting this lead opens your next choice.`
  }
  const localEnemy = ENEMIES.find((enemy) => enemy.locationId === game.player.locationId)
  if (localEnemy !== undefined && game.flags[`defeated_${localEnemy.id}`] !== true) {
    return t(locale, 'ui.objective.danger', { enemy: locale === 'vi' ? localEnemy.nameVi : localEnemy.nameEn, location: locationName(game.player.locationId, locale) })
  }
  const storyBeat = currentStoryScene(game).id
  const storyObjective = t(locale, `ui.objective.beats.${storyBeat}`)
  if (storyObjective !== `ui.objective.beats.${storyBeat}`) return storyObjective
  if (game.player.progress < 120) {
    return t(locale, 'ui.objective.progress', { progress: game.player.progress })
  }
  return t(locale, 'ui.objective.breakthrough', { stage: game.player.stage + 1 })
}
