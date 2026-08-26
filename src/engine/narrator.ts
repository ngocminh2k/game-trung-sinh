import {
  ENDINGS,
  getAchievement,
  getEnemy,
  getItem,
  getLocation,
  getNpc,
  getQuest,
  getTalent,
  getTechnique,
} from '../content'
import type { GameEvent, Locale } from './types'

type Handler = (ev: GameEvent, locale: Locale) => string
type NamedContent = { nameVi: string; nameEn: string }

function localizedName(def: NamedContent | undefined, fallback: string, locale: Locale): string {
  return locale === 'vi' ? (def?.nameVi ?? fallback) : (def?.nameEn ?? fallback)
}

function nameOf(kind: 'item' | 'npc' | 'quest' | 'talent' | 'technique' | 'enemy' | 'location' | 'ending', id: string, locale: Locale): string {
  if (kind === 'item') return localizedName(getItem(id), id, locale)
  if (kind === 'npc') return localizedName(getNpc(id), id, locale)
  if (kind === 'quest') return localizedName(getQuest(id), id, locale)
  if (kind === 'talent') return localizedName(getTalent(id), id, locale)
  if (kind === 'technique') return localizedName(getTechnique(id), id, locale)
  if (kind === 'enemy') return localizedName(getEnemy(id), id, locale)
  if (kind === 'location') return localizedName(getLocation(id), id, locale)
  return localizedName(ENDINGS.find((ending) => ending.id === id), id, locale)
}

function causeName(cause: string, locale: Locale): string {
  const location = getLocation(cause.replace(/^danger:/, ''))
  if (location !== undefined) return localizedName(location, cause, locale)
  if (cause === 'qi_deviation') return locale === 'vi' ? 'tẩu hỏa nhập ma' : 'qi deviation'
  return cause
}

export const FALLBACK_TEXT: Record<Locale, string> = {
  vi: 'Chuyện gì đó đã xảy ra...',
  en: 'Something happened...',
}

const TEMPLATES: Record<string, Handler> = {
  GAME_STARTED: (_ev, l) => (l === 'vi' ? 'Một kiếp mới bắt đầu.' : 'A new life begins.'),
  MOVED: (ev, l) => {
    if (ev.type !== 'MOVED') return ''
    if (ev.from === ev.to) return l === 'vi' ? 'Ngươi men theo lối nhỏ trong khu vực.' : 'You follow a smaller path through the area.'
    return l === 'vi'
      ? `Ngươi lên đường đến ${ev.to.startsWith('wild_') ? 'miền hoang dã phía trước' : nameOf('location', ev.to, l)}.`
      : `You travel on toward ${ev.to.startsWith('wild_') ? 'open country' : ev.to}.`
  },
  NODE_REACHED: (ev, l) => {
    if (ev.type !== 'NODE_REACHED') return ''
    return l === 'vi' ? `Ngươi đến ${ev.nameVi}.` : `You reach ${ev.nameEn}.`
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
      ? `Khép lại một chu thiên, tu vi tăng ${String(ev.gain)} điểm.`
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
      ? `Ngươi dùng ${nameOf('item', ev.itemId, l)}.`
      : `Used ${nameOf('item', ev.itemId, l)}.`
  },
  BOUGHT: (ev, l) => {
    if (ev.type !== 'BOUGHT') return ''
    return l === 'vi'
      ? `Ngươi đổi ${String(ev.goldPaid)} lượng lấy ${nameOf('item', ev.itemId, l)}.`
      : `Bought ${nameOf('item', ev.itemId, l)} for ${String(ev.goldPaid)} gold.`
  },
  SOLD: (ev, l) => {
    if (ev.type !== 'SOLD') return ''
    return l === 'vi'
      ? `Ngươi bán ${nameOf('item', ev.itemId, l)}, nhận ${String(ev.goldGain)} lượng.`
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
          ? `Vé số trúng giải đặc biệt! ${String(ev.goldDelta)} lượng rơi vào tay ngươi như từ trên trời xuống!`
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
    return l === 'vi' ? `Ngươi nhận nhiệm vụ: ${nameOf('quest', ev.questId, l)}.` : `Quest accepted: ${nameOf('quest', ev.questId, l)}.`
  },
  QUEST_COMPLETED: (ev, l) => {
    if (ev.type !== 'QUEST_COMPLETED') return ''
    return l === 'vi'
      ? `Ngươi hoàn thành ${nameOf('quest', ev.questId, l)}, nhận ${String(ev.rewardGold)} lượng.`
      : `Quest complete: ${nameOf('quest', ev.questId, l)}; ${String(ev.rewardGold)} gold earned.`
  },
  TALENT_CHOSEN: (ev, l) => {
    if (ev.type !== 'TALENT_CHOSEN') return ''
    return l === 'vi' ? `Thiên phú thức tỉnh: ${nameOf('talent', ev.talentId, l)}.` : `Talent awakened: ${nameOf('talent', ev.talentId, l)}.`
  },
  TECHNIQUE_LEARNED: (ev, l) => {
    if (ev.type !== 'TECHNIQUE_LEARNED') return ''
    return l === 'vi'
      ? `Ngươi lĩnh ngộ ${nameOf('technique', ev.techniqueId, l)} — tầng ${String(ev.level)}.`
      : `Learned ${nameOf('technique', ev.techniqueId, l)}, rank ${String(ev.level)}.`
  },
  EQUIPPED: (ev, l) => {
    if (ev.type !== 'EQUIPPED') return ''
    return l === 'vi' ? `Trang bị ${nameOf('item', ev.itemId, l)}.` : `Equipped ${nameOf('item', ev.itemId, l)}.`
  },
  ENCOUNTER_STARTED: (ev, l) => {
    if (ev.type !== 'ENCOUNTER_STARTED') return ''
    return l === 'vi' ? `Có kẻ chặn đường: ${nameOf('enemy', ev.enemyId, l)}.` : `An enemy blocks your path: ${nameOf('enemy', ev.enemyId, l)}.`
  },
  COMBAT_HIT: (ev, l) => {
    if (ev.type !== 'COMBAT_HIT') return ''
    return l === 'vi'
      ? `${ev.actor === 'player' ? 'Ngươi' : nameOf('enemy', ev.enemyId, l)} gây ${String(ev.amount)} sát thương.`
      : `${ev.actor === 'player' ? 'You' : nameOf('enemy', ev.enemyId, l)} deal ${String(ev.amount)} damage.`
  },
  COMBAT_GUARDED: (ev, l) => {
    if (ev.type !== 'COMBAT_GUARDED') return ''
    return l === 'vi' ? `Thủ thế, giảm ${String(ev.amount)} sát thương.` : `You brace, reducing ${String(ev.amount)} damage.`
  },
  COMBAT_WON: (ev, l) => {
    if (ev.type !== 'COMBAT_WON') return ''
    return l === 'vi'
      ? `Hạ ${nameOf('enemy', ev.enemyId, l)}, nhận ${String(ev.rewardGold)} lượng.`
      : `Defeated ${nameOf('enemy', ev.enemyId, l)}; gained ${String(ev.rewardGold)} gold.`
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
      ? `Ngươi chịu ${String(ev.amount)} sát thương từ ${causeName(ev.source, l)}.`
      : `You take ${String(ev.amount)} damage from the ${ev.source}.`
  },
  DEATH: (ev, l) => {
    if (ev.type !== 'DEATH') return ''
    return l === 'vi'
      ? `Trước mắt ngươi tối dần. ${causeName(ev.cause, l)} đã khép lại kiếp này.`
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
      ? `Câu chuyện khép lại — ${nameOf('ending', ev.endingId, l)}.`
      : `The story closes — ${nameOf('ending', ev.endingId, l)}.`
  },
  CORRECTION_REJECTED: (ev, l) => {
    if (ev.type !== 'CORRECTION_REJECTED') return ''
    return l === 'vi'
      ? 'Ý niệm của ngươi trôi khỏi thực tại trong chốc lát.'
      : `You mutter something unintelligible (time ${String(ev.count)}).`
  },
  FORCED_CONVERGENCE: (_ev, l) =>
    l === 'vi'
      ? 'Cảnh vật quanh ngươi dần rõ nét trở lại; một lối đi hợp lý hiện ra trước mắt.'
      : 'A gentle force turns your mind back to what must be done.',
  ERROR: (ev, l) => {
    if (ev.type !== 'ERROR') return ''
    return l === 'vi'
      ? 'Ý định ấy chưa thể thành lúc này.'
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
