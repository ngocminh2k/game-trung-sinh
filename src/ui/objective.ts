import { ENEMIES, getLocation, getRegionMap } from '../content'
import { currentStoryScene, storyRouteEncounter, storyRouteTarget, type GameState, type Locale } from '../engine'
import { t } from '../i18n'

// Phase 2 of the 2026-08 design review: the "twelfth night" deadline is a real
// countdown while it runs. `null` means no deadline has been set, it already
// expired (night_forgotten), or the story no longer has an active clock.
export function nightDeadlineRemaining(game: GameState): number | null {
  if (game.terminal) return null
  if (game.flags['night_forgotten'] === true) return null
  if (game.flags['night_deadline_cleared'] !== undefined) return null
  const deadline = game.flags['night_deadline']
  if (typeof deadline !== 'number') return null
  return Math.max(0, deadline - game.day)
}

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
  // When the night deadline is close, it becomes the objective: the countdown
  // IS the next milestone (Flow theory — clear goal with a visible clock).
  const remaining = nightDeadlineRemaining(game)
  if (remaining !== null && remaining <= 3) {
    return locale === 'vi'
      ? `Còn ${String(remaining)} ngày trước đêm thứ mười hai — làng sẽ quên một người. Đi nhanh, chọn gọn.`
      : `${String(remaining)} days remain before the twelfth night, when the village forgets a name. Move fast, choose well.`
  }
  const routeEncounter = storyRouteEncounter(game)
  if (routeEncounter !== undefined) {
    return locale === 'vi'
      ? `${routeEncounter.contactVi} đang chờ câu trả lời của ngươi. Hoàn tất sự kiện tại chỗ trước khi quay lại lựa chọn.`
      : `${routeEncounter.contactEn} is waiting for your answer. Resolve the on-site event before returning to the choice.`
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
