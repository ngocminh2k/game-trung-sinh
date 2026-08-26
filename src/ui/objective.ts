import { ENEMIES, getLocation } from '../content'
import type { GameState, Locale } from '../engine'

function word(locale: Locale, vi: string, en: string): string {
  return locale === 'vi' ? vi : en
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
    return word(locale, 'Giao chiến: xuất chiêu hoặc thủ thế', 'In battle: strike or defend')
  }
  const localEnemy = ENEMIES.find((enemy) => enemy.locationId === game.player.locationId)
  if (localEnemy !== undefined && game.flags[`defeated_${localEnemy.id}`] !== true) {
    return word(
      locale,
      `Hiểm họa cận kề: đối mặt ${localEnemy.nameVi} tại ${locationName(game.player.locationId, locale)}`,
      `Local danger: face ${localEnemy.nameEn} in ${locationName(game.player.locationId, locale)}`,
    )
  }
  if (game.player.progress < 120) {
    return word(
      locale,
      `Mục tiêu: tu luyện tích lũy tiến độ cảnh giới (${game.player.progress}/120)`,
      `Objective: cultivate to build realm progress (${game.player.progress}/120)`,
    )
  }
  return word(
    locale,
    `Tiến độ đã đủ — tìm cơ duyên đột phá lên Cảnh ${game.player.stage + 1}`,
    `Progress is full — seek a breakthrough to Tier ${game.player.stage + 1}`,
  )
}
