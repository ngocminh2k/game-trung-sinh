import type { KeyboardEvent } from 'react'
import { formatSystemMessage } from '../../engine'
import type { Action, GameState, Locale } from '../../engine'
import { getItem } from '../../content'
import type { ItemDef } from '../../engine/content-types'
import type { AssetPackId } from '../assetPacks'
import type { PlayerActionKey } from '../playerArt'
import { NPC_PACK_BY_LOCATION, DOCK_PANELS, type DockPanel } from './constants'

export function word(locale: Locale, vi: string, en: string): string {
  return locale === 'vi' ? vi : en
}

export function localized(locale: Locale, item: { nameVi: string; nameEn: string }): string {
  return locale === 'vi' ? item.nameVi : item.nameEn
}

export function terrainLabel(locale: Locale, terrain: string | undefined): string {
  const labels: Record<string, [string, string]> = {
    plain: ['Đất bằng', 'Open ground'],
    road: ['Đường mòn', 'Trail'],
    water: ['Mặt nước', 'Water'],
    mountain: ['Vách núi', 'Mountain'],
    forest: ['Rừng cây', 'Forest'],
    cave: ['Hang đá', 'Cave'],
    rift: ['Khe nứt', 'Rift'],
  }
  const label = labels[terrain ?? 'plain'] ?? ['Đất bằng', 'Open ground']
  return locale === 'vi' ? label[0] : label[1]
}

export function npcPackId(locationId: string): AssetPackId {
  return NPC_PACK_BY_LOCATION[locationId] ?? 'cloud-peak'
}

export function playerPoseFor(actionKind: Action['kind'] | null, game: GameState, showHurtFeedback: boolean): PlayerActionKey {
  if (game.terminal && !game.player.alive) return 'death'
  if (showHurtFeedback) return 'hurt'

  switch (actionKind) {
    case 'move': return 'move'
    case 'talk': return 'talk'
    case 'gather': return 'gather'
    case 'train': return 'cultivate'
    case 'rest': return 'rest'
    case 'use_item': return 'use-item'
    case 'combat_attack': return 'combat-attack'
    case 'combat_defend': return 'combat-defend'
    default: return 'idle'
  }
}

export function contextualDockFor(locationId: string): DockPanel {
  if (locationId === 'market') return 'market'
  if (locationId === 'sect') return 'inventory'
  if (locationId === 'misty_forest' || locationId === 'sealed_cave' || locationId === 'cursed_rift') return 'path'
  return 'people'
}

export function moveDockFocus(event: KeyboardEvent<HTMLButtonElement>, current: DockPanel, selectPanel: (panel: DockPanel) => void): void {
  const currentIndex = DOCK_PANELS.indexOf(current)
  const nextIndex = event.key === 'ArrowRight' ? (currentIndex + 1) % DOCK_PANELS.length
    : event.key === 'ArrowLeft' ? (currentIndex - 1 + DOCK_PANELS.length) % DOCK_PANELS.length
      : event.key === 'Home' ? 0
        : event.key === 'End' ? DOCK_PANELS.length - 1
          : currentIndex
  if (nextIndex === currentIndex && !['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return

  event.preventDefault()
  const next = DOCK_PANELS[nextIndex]!
  selectPanel(next)
  document.getElementById(`dock-tab-${next}`)?.focus()
}

/** Formats one queued System notification for the active locale (max 3 lines shown). */
export function systemNotificationText(entry: { id: string; vars: Record<string, string | number> }, locale: Locale): string {
  if (entry.id === 'sys_quest_loaded') {
    return formatSystemMessage('sys_quest_loaded', { quest: locale === 'vi' ? String(entry.vars.quest ?? '') : String(entry.vars.questEn ?? ''), days: Number(entry.vars.days ?? 0), objective: locale === 'vi' ? String(entry.vars.objective ?? '') : String(entry.vars.objectiveEn ?? '') }, locale)
  }
  if (entry.id === 'sys_reward') {
    return formatSystemMessage('sys_reward', { reward: locale === 'vi' ? String(entry.vars.reward ?? '') : String(entry.vars.rewardEn ?? '') }, locale)
  }
  return formatSystemMessage(entry.id, entry.vars, locale)
}

/** Glyph shown inside a node icon-slot when no authored artwork exists (placeholder per kind). */
export function mapNodeGlyph(kind: 'npc' | 'event' | 'exit' | 'danger'): string {
  switch (kind) {
    case 'npc': return '人'
    case 'event': return '缘'
    case 'danger': return '凶'
    case 'exit': return '关'
  }
}

// Price tiers double as a rarity read for the collection-minded player:
// common wares stay quiet, rare finds earn a vermilion edge.
export function itemTier(item: ItemDef | undefined): 'common' | 'uncommon' | 'rare' {
  if (item === undefined) return 'common'
  const value = item.buyPrice ?? (item.sellPrice ?? 0) * 2
  if (value >= 160) return 'rare'
  if (value >= 55) return 'uncommon'
  return 'common'
}

export function stageRequirement(locale: Locale, stage: number): string {
  return word(locale, `Yêu cầu cảnh giới ${String(stage)}`, `Requires realm ${String(stage)}`)
}

export function obscuredName(locale: Locale, kind: 'talent' | 'technique' | 'equipment'): string {
  const names = {
    talent: word(locale, 'Thiên phú chưa thức tỉnh', 'Dormant talent'),
    technique: word(locale, 'Công pháp chưa gặp cơ duyên', 'Technique not yet encountered'),
    equipment: word(locale, 'Trang bị chưa sở hữu', 'Equipment not yet acquired'),
  }
  return names[kind]
}

export function itemName(itemId: string, locale: Locale): string {
  const item = getItem(itemId)
  return item === undefined ? itemId : localized(locale, item)
}
