import { ENEMIES, getLocation, getQuest } from '../content'
import { calculateOfflineGains } from './offline'
import { questStatus, currentStepIndex } from './quests'
import { isBreakthroughReady, playerMaxHp } from './stats'
import type { GameState, Locale } from './types'

export type AdvicePriority = 'critical' | 'urgent' | 'recommended' | 'guidance'
export type AdviceTag = 'attribute' | 'breakthrough' | 'health' | 'quest' | 'danger' | 'cultivation' | 'general'
export type AdviceActionSuggestion =
  | 'allocate_attribute'
  | 'train'
  | 'rest'
  | 'turn_in_quest'
  | 'accept_quest'
  | 'explore'
  | 'combat'

export interface SystemAdvice {
  priority: AdvicePriority
  tag: AdviceTag
  headlineVi: string
  headlineEn: string
  detailVi: string
  detailEn: string
  actionSuggestion?: AdviceActionSuggestion
}

export interface ActiveQuestRecap {
  id: string
  nameVi: string
  nameEn: string
  stepDescVi: string
  stepDescEn: string
}

export interface SessionRecap {
  awayDurationMs: number
  awayFormattedVi: string
  awayFormattedEn: string
  locationNameVi: string
  locationNameEn: string
  statusSummary: {
    hp: number
    maxHp: number
    hpPercent: number
    qi: number
    maxQi: number
    stage: number
    realmLevel: number
    silver: number
    gold: number
    spiritStones: number
  }
  offlineProgressGained: number
  activeQuests: ActiveQuestRecap[]
  primaryAdvice: SystemAdvice
  suggestedActionsVi: string[]
  suggestedActionsEn: string[]
}

/**
 * Formats duration in milliseconds into a concise, human-friendly string.
 */
export function formatAwayDuration(durationMs: number, locale: Locale): string {
  if (durationMs < 60 * 1000) {
    return locale === 'vi' ? 'Vừa mới đây' : 'Just now'
  }

  const mins = Math.floor(durationMs / (60 * 1000))
  if (mins < 60) {
    return locale === 'vi' ? `${mins} phút` : `${mins} mins`
  }

  const hours = Math.floor(durationMs / (60 * 60 * 1000))
  const remMins = Math.floor((durationMs % (60 * 60 * 1000)) / (60 * 1000))

  if (hours < 24) {
    if (remMins === 0) {
      return locale === 'vi' ? `${hours} giờ` : `${hours} hours`
    }
    return locale === 'vi'
      ? `${hours} giờ ${remMins} phút`
      : `${hours} hours ${remMins} mins`
  }

  const days = Math.floor(durationMs / (24 * 60 * 60 * 1000))
  const remHours = Math.floor((durationMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))

  if (remHours === 0) {
    return locale === 'vi' ? `${days} ngày` : `${days} days`
  }
  return locale === 'vi'
    ? `${days} ngày ${remHours} giờ`
    : `${days} days ${remHours} hours`
}

/**
 * Derives the highest-priority contextual advice for the cultivator based on current state.
 */
export function deriveSystemAdvice(game: GameState, _locale: Locale): SystemAdvice {
  // 1. Critical: Unspent attribute points
  const pending = game.player.pendingAttributePoints ?? 0
  if (pending > 0) {
    return {
      priority: 'critical',
      tag: 'attribute',
      headlineVi: 'Phân bổ điểm tiềm năng!',
      headlineEn: 'Attribute Points Pending!',
      detailVi: `Ngươi có ${pending} điểm tiềm năng chưa phân bổ. Hãy vào thẻ Nhân Vật để nâng Thể Phách/Thân Pháp/Ngộ Tính!`,
      detailEn: `You have ${pending} unallocated attribute points. Allocate them in the Cultivator panel!`,
      actionSuggestion: 'allocate_attribute',
    }
  }

  // 2. Urgent: Low Health (< 30% Max HP)
  const maxHp = playerMaxHp(game)
  const hpPercent = game.player.hp / Math.max(1, maxHp)
  if (hpPercent < 0.3) {
    return {
      priority: 'urgent',
      tag: 'health',
      headlineVi: 'Khí huyết suy kiệt — Cần trị thương!',
      headlineEn: 'Critical Health — Rest Needed!',
      detailVi: `Sinh mệnh chỉ còn ${game.player.hp}/${maxHp} HP. Cực kỳ nguy hiểm nếu gặp địch nhân! Hãy mau chóng nghỉ ngơi hoặc dùng đan dược trị thương.`,
      detailEn: `Health is at ${game.player.hp}/${maxHp} HP. High danger! Rest or use healing medicine before proceeding.`,
      actionSuggestion: 'rest',
    }
  }

  // 3. Urgent: Active Combat
  if (game.encounter !== null) {
    return {
      priority: 'urgent',
      tag: 'danger',
      headlineVi: 'Đang trong giao chiến!',
      headlineEn: 'Combat in Progress!',
      detailVi: 'Ngươi đang đối đầu với địch thủ! Hãy tập trung công thủ hoặc lui binh bảo toàn tính mạng.',
      detailEn: 'You are engaged in battle! Focus your actions or retreat to safety.',
      actionSuggestion: 'combat',
    }
  }

  // 4. Recommended: Breakthrough Ready
  if (
    isBreakthroughReady(game.player.stage, game.player.realmLevel, game.player.progress) ||
    game.player.progress >= 120
  ) {
    return {
      priority: 'recommended',
      tag: 'breakthrough',
      headlineVi: 'Chân khí viên mãn — Hãy Đột Phá!',
      headlineEn: 'Qi Overflowing — Breakthrough Ready!',
      detailVi: 'Tu vi đã đạt đỉnh phong cảnh giới hiện tại. Hãy tiến hành đột phá xung phá bình cảnh.',
      detailEn: 'Your cultivation progress is full. Advance through the bottleneck to break through!',
      actionSuggestion: 'train',
    }
  }

  // 5. Recommended: Active Quest in progress
  for (const [questId, rt] of Object.entries(game.quests)) {
    if (rt?.status === 'active' && questStatus(game, questId) === 'active') {
      const quest = getQuest(questId)
      if (quest !== undefined && quest.steps.length > 0) {
        const stepIdx = currentStepIndex(game, questId)
        const step = quest.steps[stepIdx]
        if (step !== undefined) {
          return {
            priority: 'recommended',
            tag: 'quest',
            headlineVi: `Nhiệm vụ: ${quest.nameVi}`,
            headlineEn: `Active Quest: ${quest.nameEn}`,
            detailVi: step.descVi,
            detailEn: step.descEn,
            actionSuggestion: 'explore',
          }
        }
      }
    }
  }

  // 6. Guidance: Undefeated local enemy in wild
  const localEnemy = ENEMIES.find((e) => e.locationId === game.player.locationId && e.arena === undefined)
  if (localEnemy !== undefined && game.flags[`defeated_${localEnemy.id}`] !== true) {
    return {
      priority: 'guidance',
      tag: 'danger',
      headlineVi: `Cẩn trọng hiểm họa: ${localEnemy.nameVi}`,
      headlineEn: `Nearby Threat: ${localEnemy.nameEn}`,
      detailVi: `Có địch nhân ${localEnemy.nameVi} đang lảng vãng tại khu vực này. Cần chuẩn bị trang bị và phù hộ thân.`,
      detailEn: `${localEnemy.nameEn} lurks in this area. Equip talismans and prepare carefully.`,
      actionSuggestion: 'combat',
    }
  }

  // 7. Guidance: Cultivation progress accumulation
  return {
    priority: 'guidance',
    tag: 'cultivation',
    headlineVi: 'Tích lũy chân khí tu vi',
    headlineEn: 'Cultivate Inner Qi',
    detailVi: `Tu vi hiện tại: ${game.player.progress}. Hãy tu luyện hoặc khám phá các vùng đất mới để nâng cao cảnh giới.`,
    detailEn: `Current cultivation progress: ${game.player.progress}. Train or explore new regions to advance.`,
    actionSuggestion: 'train',
  }
}

/**
 * Compiles a structured, comprehensive Session Recap for returning or fatigued cultivators.
 */
export function generateSessionRecap(
  game: GameState,
  locale: Locale,
  lastSavedAt?: number,
  now: number = Date.now(),
): SessionRecap {
  const awayDurationMs = Math.max(0, now - (lastSavedAt ?? now))
  const awayFormattedVi = formatAwayDuration(awayDurationMs, 'vi')
  const awayFormattedEn = formatAwayDuration(awayDurationMs, 'en')

  const location = getLocation(game.player.locationId)
  const locationNameVi = location?.nameVi ?? game.player.locationId
  const locationNameEn = location?.nameEn ?? game.player.locationId

  const maxHp = playerMaxHp(game)
  const hp = game.player.hp
  const hpPercent = Math.round((hp / Math.max(1, maxHp)) * 100)

  let offlineProgressGained = 0
  if (lastSavedAt !== undefined && lastSavedAt > 0) {
    const gains = calculateOfflineGains(lastSavedAt, now, Boolean(game.hibernation?.active))
    if (gains && gains.progressGain > 0) {
      offlineProgressGained = gains.progressGain
    }
  }

  const activeQuests: ActiveQuestRecap[] = []
  for (const [questId, rt] of Object.entries(game.quests)) {
    if (rt?.status === 'active' && questStatus(game, questId) === 'active') {
      const quest = getQuest(questId)
      if (quest !== undefined && quest.steps.length > 0) {
        const stepIdx = currentStepIndex(game, questId)
        const step = quest.steps[stepIdx]
        if (step !== undefined) {
          activeQuests.push({
            id: questId,
            nameVi: quest.nameVi,
            nameEn: quest.nameEn,
            stepDescVi: step.descVi,
            stepDescEn: step.descEn,
          })
        }
      }
    }
  }

  const primaryAdvice = deriveSystemAdvice(game, locale)

  const suggestedActionsVi: string[] = []
  const suggestedActionsEn: string[] = []

  if ((game.player.pendingAttributePoints ?? 0) > 0) {
    suggestedActionsVi.push('Phân bổ điểm tiềm năng trong thẻ Nhân Vật.')
    suggestedActionsEn.push('Allocate pending attribute points in Cultivator panel.')
  }

  if (hpPercent < 30) {
    suggestedActionsVi.push('Nghỉ ngơi hoặc dùng Kim Sang Dược để phục hồi sinh mệnh.')
    suggestedActionsEn.push('Rest or consume healing medicine to recover health.')
  }

  if (
    isBreakthroughReady(game.player.stage, game.player.realmLevel, game.player.progress) ||
    game.player.progress >= 120
  ) {
    suggestedActionsVi.push('Đột phá cảnh giới tiếp theo trong thẻ Tu Luyện.')
    suggestedActionsEn.push('Break through to the next realm in Cultivation panel.')
  }

  if (activeQuests.length > 0 && activeQuests[0] !== undefined) {
    suggestedActionsVi.push(`Tiếp tục nhiệm vụ: ${activeQuests[0].nameVi}`)
    suggestedActionsEn.push(`Continue quest: ${activeQuests[0].nameEn}`)
  } else {
    suggestedActionsVi.push('Khám phá các ô địa đồ xung quanh và thu thập tài nguyên.')
    suggestedActionsEn.push('Explore surrounding map nodes and gather resources.')
  }

  return {
    awayDurationMs,
    awayFormattedVi,
    awayFormattedEn,
    locationNameVi,
    locationNameEn,
    statusSummary: {
      hp,
      maxHp,
      hpPercent,
      qi: game.player.qi,
      maxQi: 100,
      stage: game.player.stage,
      realmLevel: game.player.realmLevel,
      silver: game.player.silver ?? 0,
      gold: game.player.gold,
      spiritStones: game.player.spiritStones ?? 0,
    },
    offlineProgressGained,
    activeQuests,
    primaryAdvice,
    suggestedActionsVi,
    suggestedActionsEn,
  }
}
