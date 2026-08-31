import {
  ENDINGS,
  getAchievement,
  getEnemy,
  getItem,
  getLocation,
  getNpc,
  getRecipe,
  getQuest,
  getTalent,
  getTechnique,
  getStoryScene,
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

// Unrecognized free-text never acts for the player. The reply varies by how
// many times they have reached for the void, and each one points at concrete
// things the world actually answers — so the player always keeps the wheel.
const REJECTION_POOL_VI = [
  'Ý niệm của ngươi trôi khỏi thực tại — nơi này chỉ đáp lời việc có thật. Thử: “đi về hướng bắc”, “hái thảo dược”, hay “nói chuyện với cụ Mai Hoa”.',
  'Linh khí không đọng lại theo ý tưởng ấy. Ngươi có thể: “tu luyện”, “nghỉ ngơi một đêm”, hoặc “đi đến chợ”.',
  'Cảnh vật chưa thay đổi. Những lời thường có hiệu lực: “tấn công”, “phòng thủ”, “mua viên tụ khí”, “bán thảo dược”.',
  'Ta không thể hiện hình ý đó. Muốn thử: “dùng viên hồi nguyên”, “xoay vòng quay vận mệnh”, hay “nhận nhiệm vụ”?',
]

const REJECTION_POOL_EN = [
  'Your thought slips free of reality — this place answers only what is real. Try: "go north", "gather herbs", or "talk to Elder Mei Hua".',
  'The qi will not settle around that idea. You could: "cultivate", "rest for the night", or "head to the market".',
  'The scene does not shift. Words that usually work: "attack", "defend", "buy a qi pill", "sell herbs".',
  'I cannot give shape to that intent. Perhaps: "use a healing pill", "turn the wheel of fate", or "take up a quest"?',
]

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
  MINOR_REALM_ADVANCED: (ev, l) => {
    if (ev.type !== 'MINOR_REALM_ADVANCED') return ''
    return l === 'vi'
      ? `Đột phá tầng ${String(ev.realmLevel)}; nhận ${String(ev.pointsGranted)} điểm thuộc tính để tự phân.`
      : `Breakthrough to rank ${String(ev.realmLevel)}; gain ${String(ev.pointsGranted)} attribute points to assign.`
  },
  ATTRIBUTE_ALLOCATED: (ev, l) => {
    if (ev.type !== 'ATTRIBUTE_ALLOCATED') return ''
    return l === 'vi'
      ? `Phân một điểm vào ${ev.attribute}; còn ${String(ev.pointsRemaining)} điểm.`
      : `Assigned one point to ${ev.attribute}; ${String(ev.pointsRemaining)} remain.`
  },
  GATHERED: (ev, l) => {
    if (ev.type !== 'GATHERED') return ''
    return l === 'vi'
      ? `Hái được ${String(ev.qty)} ${nameOf('item', ev.itemId, l)}.`
      : `Gathered ${String(ev.qty)} ${nameOf('item', ev.itemId, l)}.`
  },
  REFINED: (ev, l) => {
    if (ev.type !== 'REFINED') return ''
    const recipe = getRecipe(ev.recipeId)
    const name = localizedName(recipe, ev.recipeId, l)
    return l === 'vi'
      ? `Ngươi đổi linh tài thành ${name}, nhận ${String(ev.qty)} ${nameOf('item', ev.itemId, l)}.`
      : `You exchange materials through ${name} and receive ${String(ev.qty)} ${nameOf('item', ev.itemId, l)}.`
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
      ? `${nameOf('npc', ev.npcId, l)}: “${ev.lineVi ?? getNpc(ev.npcId)?.greetVi ?? '...'}”`
      : `${nameOf('npc', ev.npcId, l)}: “${ev.lineEn ?? getNpc(ev.npcId)?.greetEn ?? '...'}”`
  },
  ROUTE_EVENT_RESOLVED: (ev, l) => {
    if (ev.type !== 'ROUTE_EVENT_RESOLVED') return ''
    const proof = l === 'vi' ? ev.proofVi : ev.proofEn
    const method = ev.approach === 'present'
      ? (l === 'vi' ? 'đã công khai' : 'is now public')
      : (l === 'vi' ? 'đã được giấu kín' : 'is now concealed')
    return l === 'vi'
      ? `Đầu mối không còn là dấu trên bản đồ. ${proof} ${method}; ngươi mang nó vào Hang Phong Ấn.`
      : `The lead is no longer a mark on the map. ${proof} ${method}; you carry it into the Sealed Cave.`
  },
  STORY_CHOICE: (ev, l) => {
    if (ev.type !== 'STORY_CHOICE') return ''
    const scene = getStoryScene(ev.sceneId)
    const choice = scene?.choices.find((entry) => entry.id === ev.choiceId)
    if (choice === undefined) return ''
    return l === 'vi' ? choice.consequenceVi : choice.consequenceEn
  },
  ROMANCE_NODE: (ev, l) => {
    if (ev.type !== 'ROMANCE_NODE') return ''
    return l === 'vi'
      ? `${nameOf('npc', ev.npcId, l)} · ${ev.titleVi}`
      : `${nameOf('npc', ev.npcId, l)} · ${ev.titleEn}`
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
  COMBAT_RETREATED: (ev, l) => {
    if (ev.type !== 'COMBAT_RETREATED') return ''
    return l === 'vi'
      ? `Ngươi lánh mình rút khỏi ${nameOf('enemy', ev.enemyId, l)} — mất ${String(ev.hpCost)} khí huyết và bỏ lại ít thành quả.`
      : `You slip away from the ${nameOf('enemy', ev.enemyId, l)} — ${String(ev.hpCost)} blood-qi spent, some gains left behind.`
  },
  QI_SPENT: (ev, l) => {
    if (ev.type !== 'QI_SPENT') return ''
    return l === 'vi' ? `Vận ${String(ev.amount)} linh khí.` : `Channel ${String(ev.amount)} qi.`
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
    const pool = l === 'vi' ? REJECTION_POOL_VI : REJECTION_POOL_EN
    const idx = ((ev.count - 1) % pool.length + pool.length) % pool.length
    return pool[idx] ?? ''
  },
  ERROR: (ev, l) => {
    if (ev.type !== 'ERROR') return ''
    const explanations: Record<string, [string, string]> = {
      TERMINAL: ['Kiếp này đã khép lại; hãy bắt đầu một kiếp mới để lựa chọn khác.', 'This life has closed; begin another to choose differently.'],
      MOVE_BLOCKED: ['Lối đó bị địa hình chặn. Hãy nhìn đường sáng hoặc tìm lối vòng trên bản đồ.', 'That way is blocked by terrain. Follow a lit route or find a way around on the map.'],
      NOT_AT_LOCATION: ['Việc này chỉ có thể làm tại đúng địa điểm. Bản đồ sẽ cho biết nơi cần đến.', 'This can only happen at the right place. The map tells you where to go.'],
      INSUFFICIENT_GOLD: ['Ngươi chưa đủ tiền cho việc này. Bán đồ, hoàn thành việc, hoặc kiếm phần thưởng trước.', 'You do not have enough gold. Sell goods, finish work, or earn a reward first.'],
      INSUFFICIENT_QI: ['Khí lực chưa đủ để tu luyện. Nghỉ một đêm sẽ hồi đầy linh khí.', 'Your qi is too low to train. Resting for a night restores it.'],
      NO_ITEM: ['Trong túi ngươi không có vật đó.', 'That item is not in your bag.'],
      ITEM_NOT_USABLE: ['Vật này không thể dùng theo cách ấy.', 'That item cannot be used that way.'],
      ITEM_UNAVAILABLE: ['Trong giao chiến, ngươi chỉ có thể xuất chiêu, thủ thế hoặc dùng vật phẩm.', 'In combat you may only attack, defend, or use an item.'],
      INVALID_QTY: ['Số lượng đó không hợp lệ.', 'That quantity is not valid.'],
      STORAGE_FULL: ['Kho đã đầy; hãy lấy bớt đồ ra trước.', 'The warehouse is full; take something out first.'],
      STORAGE_EMPTY: ['Kho không có đủ vật phẩm đó.', 'The warehouse does not hold enough of that item.'],
      LOTTERY_ALREADY_DRAWN: ['Bà Liên chỉ cho quay một lần mỗi ngày. Nghỉ ngơi rồi trở lại ngày mai.', 'Lien allows one draw per day. Rest and return tomorrow.'],
      LOTTERY_NEED_GOLD: ['Ngươi cần tiền mua vé số.', 'You need gold for a ticket.'],
      QUEST_UNKNOWN: ['Nhiệm vụ này chưa tồn tại trong hành trình của ngươi.', 'That quest is not part of your journey yet.'],
      QUEST_WRONG_STATE: ['Nhiệm vụ chưa ở đúng trạng thái: hãy gặp người giao việc, nhận việc, hoặc mang đủ vật cần trả.', 'That quest is not ready: meet its giver, accept it, or bring the required items.'],
      NPC_UNKNOWN: ['Ngươi chưa biết người này là ai.', 'You do not know that person.'],
      NPC_NOT_HERE: ['Người đó không ở đây. Hãy kiểm tra mục Người quen để biết nơi gặp.', 'That person is not here. Check Acquaintances for where to meet them.'],
      STORY_CHOICE_UNAVAILABLE: ['Bước ngoặt đó đã qua hoặc không thuộc cảnh hiện tại. Hãy chọn một trong ba lựa chọn đang hiện.', 'That turning point has passed or does not belong to this scene. Choose one of the three visible options.'],
      ATTRIBUTE_ALLOCATION_REQUIRED: ['Hãy phân hết điểm thuộc tính vừa nhận trước khi tiếp tục.', 'Spend your new attribute points before continuing.'],
      NO_ATTRIBUTE_POINTS: ['Không còn điểm thuộc tính để phân.', 'No attribute points remain to spend.'],
      ATTRIBUTE_MAXED: ['Thuộc tính này đã đạt mức tối đa.', 'That attribute is already at its maximum.'],
    }
    const message = explanations[ev.code]
    return message === undefined ? (l === 'vi' ? 'Ý định ấy chưa thể thành lúc này.' : 'That intent cannot happen right now.') : message[l === 'vi' ? 0 : 1]
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
