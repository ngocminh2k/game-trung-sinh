import type { KeyboardEvent } from 'react'
import { formatSystemMessage, MAX_STAGE, TECHNIQUES } from '../../engine'
import type { Action, GameState, Locale } from '../../engine'
import { EQUIPMENT, ITEMS, SHOP_STOCK, getItem, getLocation } from '../../content'
import { ACHIEVEMENTS } from '../../content/achievements-data'
import { FLAG_ARENA_CLEARED, FLAG_INFAMY } from '../../content/flag-keys'
import { flagNum } from '../../engine/utils'
import type { EquipmentDef, ItemDef, TechniqueDef } from '../../engine/content-types'
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
    case 'event': return '變'
    case 'danger': return '凶'
    case 'exit': return '關'
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

/** Held items that restore HP or qi. The reducer keeps `use_item` legal inside an
 * encounter (reducer.ts:400-412) as the deliberate one-turn consumable, so both
 * combat bars offer these — anything else (a staff, a manual) is refused there. */
export function combatConsumables(game: GameState): ItemDef[] {
  return ITEMS.filter((item) => item.usable === true &&
    ((item.effects?.hp ?? 0) > 0 || (item.effects?.qi ?? 0) > 0) &&
    (game.inventory[item.id] ?? 0) > 0)
}

/** Label for one mid-fight pill button; the count tells the player what a
 * mis-click costs. */
export function combatConsumableLabel(item: ItemDef, locale: Locale, qty: number): string {
  return `${word(locale, 'Dùng', 'Use')} ${localized(locale, item)} (${String(qty)})`
}

/* --- Market / path row gating -------------------------------------------------
 * Shared by the journal dock panels and the proto left-rail tabs. The rule each
 * one encodes is the reducer's own (reducer.ts doBuy / doLearnTechnique /
 * doEquipItem), so a rail button can never light up for an action the engine
 * would refuse — and the two surfaces cannot drift apart. */

/** Nothing can be traded or learned while the run is over or a fight is on. */
export function actionsBlocked(game: GameState): boolean {
  return game.terminal || game.encounter !== null
}

export interface MarketRow {
  itemId: string
  price: number
  /** Sealed until the player's realm reaches the ware's required stage. */
  stageLocked: boolean
  enabled: boolean
}

/** One shelf row: the dock and the rail list the same wares, at the same gate.
 * Sourced from SHOP_STOCK so the stall's exclusion of hidden manuals
 * (items.ts:1020) is not restated here. */
export function marketRows(game: GameState): MarketRow[] {
  const atMarket = game.player.locationId === 'market'
  const blocked = actionsBlocked(game)
  const rows: MarketRow[] = []
  for (const id of SHOP_STOCK) {
    const item = getItem(id)
    if (item === undefined || item.buyPrice === null) continue
    const stageLocked = game.player.stage < (item.requiredStage ?? 0)
    rows.push({ itemId: id, price: item.buyPrice, stageLocked, enabled: !blocked && !stageLocked && atMarket })
  }
  return rows
}

/** Spirit stones → gold, and silver → gold. Both need coin in hand and the market. */
export function currencyExchangeRows(game: GameState): { from: 'spiritStone' | 'silver'; enabled: boolean }[] {
  const ready = !actionsBlocked(game) && game.player.locationId === 'market'
  return [
    { from: 'spiritStone' as const, enabled: ready && (game.player.spiritStones ?? 0) >= 1 },
    { from: 'silver' as const, enabled: ready && (game.player.silver ?? 0) >= 10 },
  ]
}

/** Why the rail's Chợ tab cannot trade, or null when it can. A shelf of dead
 * buttons never said which gate was shut, so the rail prints this line instead.
 * Same predicate as marketRows()/currencyExchangeRows(), so the notice and the
 * buttons can never disagree. */
export function marketLockReason(game: GameState, locale: Locale): string | null {
  if (game.terminal) return word(locale, 'Ván này đã khép lại — không thể giao thương.', 'This run is over — no trading.')
  if (game.encounter !== null) return word(locale, 'Đang giao chiến — không thể giao thương.', 'In combat — no trading.')
  if (game.player.locationId === 'market') return null
  const market = getLocation('market')
  const name = market === undefined ? word(locale, 'Chợ', 'the market') : localized(locale, market)
  return word(
    locale,
    `Ngươi chưa tới ${name}. Hãy di chuyển tới Chợ để giao thương.`,
    `You have not reached ${name}. Travel to the market to trade.`,
  )
}

/** Same notice for the rail's Đạo đồ tab. Two silences to break: Lĩnh ngộ and
 * Trang bị die on actionsBlocked (reducer.ts doLearnTechnique / doEquipItem)
 * and the rail used to leave the reason unstated; and at the starter village the
 * bag holds no manual and no spare gear, so every row is passive (the starting
 * staff and robe are already worn) and the tab ended at a bare dash. */
export function pathLockReason(game: GameState, locale: Locale): string | null {
  if (game.terminal) return word(locale, 'Ván này đã khép lại — không thể tu luyện hay trang bị.', 'This run is over — no learning or equipping.')
  if (game.encounter !== null) return word(locale, 'Đang giao chiến — không thể tu luyện hay trang bị.', 'In combat — no learning or equipping.')
  // The same predicates the tab renders buttons from, so the notice appears
  // exactly when no Lĩnh ngộ / Trang bị affordance is on screen. An equipped
  // row is passive text ("Đang dùng"), so it is not an affordance.
  const actionable = techniqueRows(game).some((row) => row.learnable) ||
    equipmentRows(game).some((row) => !row.equipped && row.enabled)
  if (actionable) return null
  return word(
    locale,
    'Trong túi chưa có bí kíp hay trang bị nào để luyện. Hãy khám phá hoặc hoàn thành nhiệm vụ để tìm cơ duyên.',
    'Nothing in your bag can be learned or equipped yet. Explore or finish a quest to find your next one.',
  )
}

export interface TechniqueRow {
  technique: TechniqueDef
  level: number
  /** Out of reach: the dock labels it sealed, the rail leaves it off entirely. */
  locked: boolean
  /** A Lĩnh ngộ button may exist at all. */
  learnable: boolean
}

/** The dock drives three states off these fields; the rail lists only the rows
 * it can actually act on. Both read the same numbers, including the engine's
 * own System gate (reducer.ts:982) that the dock forgot — a signature technique
 * of another System is not learnable, only the player's is. */
export function techniqueRows(game: GameState): TechniqueRow[] {
  return TECHNIQUES.map((technique) => {
    const level = game.techniques[technique.id] ?? 0
    const sourceHeld = technique.sourceItemId !== undefined && (game.inventory[technique.sourceItemId] ?? 0) > 0
    const stageLocked = game.player.stage < technique.requiredStage
    const systemLocked = technique.requiredSystem !== undefined && game.systemId !== technique.requiredSystem
    return {
      technique,
      level,
      locked: level === 0 && (stageLocked || !sourceHeld || systemLocked),
      learnable: !actionsBlocked(game) && sourceHeld && level < technique.maxLevel && !stageLocked && !systemLocked,
    }
  })
}

export interface EquipmentRow {
  equipment: EquipmentDef
  equipped: boolean
  locked: boolean
  enabled: boolean
}

/** Equipping is legal mid-fight nowhere — the reducer keeps it out of the
 * encounter's one-turn consumable allowance. */
export function equipmentRows(game: GameState): EquipmentRow[] {
  const blocked = actionsBlocked(game)
  return EQUIPMENT.map((equipment) => {
    const equipped = game.equipment[equipment.slot] === equipment.itemId
    const owned = (game.inventory[equipment.itemId] ?? 0) > 0
    const stageLocked = game.player.stage < (getItem(equipment.itemId)?.requiredStage ?? 0)
    const locked = !equipped && (!owned || stageLocked)
    return { equipment, equipped, locked, enabled: !blocked && !locked }
  })
}

export interface AchievementProgress {
  current: number
  target: number
  progressText: string
  percent: number
  hintVi?: string
  hintEn?: string
}

export function getAchievementProgress(
  game: GameState,
  achievementId: string,
  locale: Locale,
  unlocked: boolean,
): AchievementProgress {
  const flags = game.flags ?? {}
  const quests = game.quests ?? {}
  const stage = game.player?.stage ?? 0
  const gold = game.player?.gold ?? 0

  let target = 1
  let current = 0
  let unitVi = ''
  let unitEn = ''

  switch (achievementId) {
    case 'first_step': {
      target = 3
      current = unlocked ? 3 : Math.min(3, flagNum(flags, 'moveCount'))
      unitVi = 'chặng đường'
      unitEn = 'journeys'
      break
    }
    case 'green_thumb': {
      target = 10
      current = unlocked ? 10 : Math.min(10, flagNum(flags, 'gatherCount'))
      unitVi = 'thảo dược'
      unitEn = 'herbs'
      break
    }
    case 'socialite': {
      target = 5
      const count = Object.entries(flags).filter(
        ([k, v]) => k.startsWith('aff_') && typeof v === 'number' && v >= 1,
      ).length
      current = unlocked ? 5 : Math.min(5, count)
      unitVi = 'nhân vật'
      unitEn = 'people'
      break
    }
    case 'first_purchase': {
      target = 5
      current = unlocked ? 5 : Math.min(5, flagNum(flags, 'buyCount'))
      unitVi = 'món mua'
      unitEn = 'purchases'
      break
    }
    case 'first_sale': {
      target = 5
      current = unlocked ? 5 : Math.min(5, flagNum(flags, 'sellCount'))
      unitVi = 'món bán'
      unitEn = 'sales'
      break
    }
    case 'lucky_star': {
      target = 1
      current = (unlocked || flags['grandPrizeWon'] === true) ? 1 : 0
      unitVi = 'giải đặc biệt'
      unitEn = 'grand prize'
      break
    }
    case 'cave_brave': {
      target = 1
      current = (unlocked || flags['visitedCaveWarded'] === true) ? 1 : 0
      unitVi = 'khu vực'
      unitEn = 'area'
      break
    }
    case 'quest_done': {
      target = 1
      const completed = Object.values(quests).some((q) => q.status === 'completed')
      current = (unlocked || completed) ? 1 : 0
      unitVi = 'nhiệm vụ'
      unitEn = 'quests'
      break
    }
    case 'halfway_there': {
      target = 2
      current = unlocked ? 2 : Math.min(2, Math.max(0, stage))
      unitVi = 'cảnh giới'
      unitEn = 'stages'
      break
    }
    case 'wealthy': {
      target = 400
      current = unlocked ? 400 : Math.min(400, Math.max(0, gold))
      unitVi = 'lượng vàng'
      unitEn = 'gold'
      break
    }
    case 'immortal_road_end': {
      target = MAX_STAGE
      current = unlocked ? MAX_STAGE : Math.min(MAX_STAGE, Math.max(0, stage))
      unitVi = 'cảnh giới'
      unitEn = 'stages'
      break
    }
    case 'arena_champion': {
      target = 1
      current = (unlocked || flags[FLAG_ARENA_CLEARED] === true) ? 1 : 0
      unitVi = 'Lôi Đài'
      unitEn = 'tower'
      break
    }
    case 'notorious': {
      target = 2
      current = unlocked ? 2 : Math.min(2, flagNum(flags, FLAG_INFAMY))
      unitVi = 'mục tiêu'
      unitEn = 'targets'
      break
    }
    default: {
      target = 1
      current = unlocked ? 1 : 0
      break
    }
  }

  const unit = word(locale, unitVi, unitEn)
  const progressText = unit ? `${current}/${target} ${unit}` : `${current}/${target}`
  const percent = target > 0 ? Math.min(100, Math.max(0, Math.round((current / target) * 100))) : 0

  // Show poetic hint at 50%+ progress but not yet unlocked
  let hintVi: string | undefined
  let hintEn: string | undefined
  if (!unlocked && percent >= 50) {
    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId)
    if (achievement) {
      hintVi = achievement.hintVi
      hintEn = achievement.hintEn
    }
  }

  return { current, target, progressText, percent, hintVi, hintEn }
}
