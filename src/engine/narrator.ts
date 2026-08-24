import { getAchievement, getItem, getNpc } from '../content'
import type { GameEvent, Locale } from './types'

type Handler = (ev: GameEvent, locale: Locale) => string

function nameOf(kind: 'item' | 'npc', id: string, locale: Locale): string {
  if (kind === 'item') {
    const def = getItem(id)
    return locale === 'vi' ? (def?.nameVi ?? id) : (def?.nameEn ?? id)
  }
  const def = getNpc(id)
  return locale === 'vi' ? (def?.nameVi ?? id) : (def?.nameEn ?? id)
}

export const FALLBACK_TEXT: Record<Locale, string> = {
  vi: 'Chuyện gì đó đã xảy ra...',
  en: 'Something happened...',
}

const TEMPLATES: Record<string, Handler> = {
  GAME_STARTED: (_ev, l) => (l === 'vi' ? 'Một kiếp mới bắt đầu.' : 'A new life begins.'),
  MOVED: (ev, l) => {
    if (ev.type !== 'MOVED') return ''
    return l === 'vi'
      ? `Ngươi lên đường đến ${ev.to.startsWith('wild_') ? 'bờ hoang phía đó' : ev.to}.`
      : `You travel on toward ${ev.to.startsWith('wild_') ? 'open country' : ev.to}.`
  },
  DAY_PASSED: (ev, l) => {
    if (ev.type !== 'DAY_PASSED') return ''
    return l === 'vi' ? `Trời sang ngày ${String(ev.day)}.` : `Day ${String(ev.day)} dawns.`
  },
  RESTED: (_ev, l) =>
    l === 'vi'
      ? 'Một giấc ngủ sâu, hơi thở đều như tiếng chuông chùa.'
      : 'Deep sleep; breath steady as a temple bell.',
  TRAINED: (ev, l) => {
    if (ev.type !== 'TRAINED') return ''
    return l === 'vi'
      ? `Tu luyện xong một chu thiên, lĩnh ngộ +${String(ev.gain)}.`
      : `One full circulation complete; insight +${String(ev.gain)}.`
  },
  GATHERED: (ev, l) => {
    if (ev.type !== 'GATHERED') return ''
    return l === 'vi'
      ? `Hái được ${String(ev.qty)} ${nameOf('item', ev.itemId, l)}.`
      : `Gathered ${String(ev.qty)} ${nameOf('item', ev.itemId, l)}.`
  },
  ITEM_USED: (ev, l) => {
    if (ev.type !== 'ITEM_USED') return ''
    return l === 'vi'
      ? `Dùng ${nameOf('item', ev.itemId, l)}.`
      : `Used ${nameOf('item', ev.itemId, l)}.`
  },
  BOUGHT: (ev, l) => {
    if (ev.type !== 'BOUGHT') return ''
    return l === 'vi'
      ? `Mua ${nameOf('item', ev.itemId, l)} với ${String(ev.goldPaid)} lượng.`
      : `Bought ${nameOf('item', ev.itemId, l)} for ${String(ev.goldPaid)} gold.`
  },
  SOLD: (ev, l) => {
    if (ev.type !== 'SOLD') return ''
    return l === 'vi'
      ? `Bán ${nameOf('item', ev.itemId, l)}, nhận ${String(ev.goldGain)} lượng.`
      : `Sold ${nameOf('item', ev.itemId, l)} for ${String(ev.goldGain)} gold.`
  },
  STORED: (ev, l) => {
    if (ev.type !== 'STORED') return ''
    return l === 'vi'
      ? `Cất ${String(ev.qty)} ${nameOf('item', ev.itemId, l)} vào kho.`
      : `Stored ${String(ev.qty)} ${nameOf('item', ev.itemId, l)} in the warehouse.`
  },
  WITHDRAWN: (ev, l) => {
    if (ev.type !== 'WITHDRAWN') return ''
    return l === 'vi'
      ? `Lấy ${String(ev.qty)} ${nameOf('item', ev.itemId, l)} ra khỏi kho.`
      : `Withdrew ${String(ev.qty)} ${nameOf('item', ev.itemId, l)} from the warehouse.`
  },
  DRAW_RESULT: (ev, l) => {
    if (ev.type !== 'DRAW_RESULT') return ''
    switch (ev.tier) {
      case 'grand':
        return l === 'vi'
          ? `Vé số nổ giải đặc biệt! Trời sập xuống ${String(ev.goldDelta)} lượng!`
          : `Grand prize! Heaven drops ${String(ev.goldDelta)} gold into your lap!`
      case 'major':
        return l === 'vi'
          ? `Giải nhì! +${String(ev.goldDelta)} lượng.`
          : `Second prize! +${String(ev.goldDelta)} gold.`
      case 'minor':
        return l === 'vi'
          ? `Giải khuyến khích. +${String(ev.goldDelta)} lượng.`
          : `Consolation prize. +${String(ev.goldDelta)} gold.`
      case 'herb':
        return l === 'vi'
          ? 'Trúng... một bó linh thảo tươi.'
          : 'You win... a fresh bundle of spirit herbs.'
      default:
        return l === 'vi'
          ? 'Vé số trắng tay. Mai thử lại.'
          : 'The ticket wins nothing. Try again tomorrow.'
    }
  },
  TALKED: (ev, l) => {
    if (ev.type !== 'TALKED') return ''
    return l === 'vi'
      ? `${nameOf('npc', ev.npcId, l)} gật đầu chào ngươi.`
      : `${nameOf('npc', ev.npcId, l)} nods in greeting.`
  },
  QUEST_ACCEPTED: (ev, l) => {
    if (ev.type !== 'QUEST_ACCEPTED') return ''
    return l === 'vi' ? `Nhận nhiệm vụ: ${ev.questId}.` : `Quest accepted: ${ev.questId}.`
  },
  QUEST_COMPLETED: (ev, l) => {
    if (ev.type !== 'QUEST_COMPLETED') return ''
    return l === 'vi'
      ? `Hoàn thành nhiệm vụ, nhận ${String(ev.rewardGold)} lượng.`
      : `Quest complete; ${String(ev.rewardGold)} gold earned.`
  },
  WARNING: (ev, l) => {
    if (ev.type !== 'WARNING') return ''
    return l === 'vi' ? ev.messageVi : ev.messageEn
  },
  WARD_USED: (ev, l) => {
    if (ev.type !== 'WARD_USED') return ''
    return l === 'vi'
      ? `${nameOf('item', ev.itemId, l)} bốc lên làn khói vàng, hóa tro.`
      : `The ${nameOf('item', ev.itemId, l)} flares gold and crumbles to ash.`
  },
  DAMAGED: (ev, l) => {
    if (ev.type !== 'DAMAGED') return ''
    return l === 'vi'
      ? `Ngươi chịu ${String(ev.amount)} sát thương từ ${ev.source}.`
      : `You take ${String(ev.amount)} damage from the ${ev.source}.`
  },
  DEATH: (ev, l) => {
    if (ev.type !== 'DEATH') return ''
    return l === 'vi'
      ? `Mắt tối dần. Nguyên nhân: ${ev.cause}. Kiếp này dừng ở đây.`
      : `Your vision fades. Cause: ${ev.cause}. This life ends here.`
  },
  ACHIEVEMENT_UNLOCKED: (ev, l) => {
    if (ev.type !== 'ACHIEVEMENT_UNLOCKED') return ''
    const def = getAchievement(ev.achievementId)
    return l === 'vi'
      ? `Thành tựu: ${def?.nameVi ?? ev.achievementId}!`
      : `Achievement: ${def?.nameEn ?? ev.achievementId}!`
  },
  ENDING: (ev, l) => {
    if (ev.type !== 'ENDING') return ''
    return l === 'vi'
      ? `Câu chuyện khép lại — ${ev.endingId}.`
      : `The story closes — ${ev.endingId}.`
  },
  CORRECTION_REJECTED: (ev, l) => {
    if (ev.type !== 'CORRECTION_REJECTED') return ''
    return l === 'vi'
      ? `Ngươi lẩm bẩm điều gì đó vô nghĩa (lần ${String(ev.count)}).`
      : `You mutter something unintelligible (time ${String(ev.count)}).`
  },
  FORCED_CONVERGENCE: (_ev, l) =>
    l === 'vi'
      ? 'Một lực dịu dàng xoay ý nghĩ của ngươi về việc nên làm.'
      : 'A gentle force turns your mind back to what must be done.',
  ERROR: (ev, l) => {
    if (ev.type !== 'ERROR') return ''
    return l === 'vi'
      ? `Ý ngươi chưa thành (mã ${String(ev.code)}).`
      : `That intent fails (code ${String(ev.code)}).`
  },
}

export function narrateLine(event: GameEvent, locale: Locale): string {
  const template = TEMPLATES[event.type]
  if (template === undefined) return FALLBACK_TEXT[locale]
  const line = template(event, locale)
  return line.length > 0 ? line : FALLBACK_TEXT[locale]
}

export function narrate(events: readonly GameEvent[], locale: Locale): string[] {
  return events.map((e) => narrateLine(e, locale))
}
