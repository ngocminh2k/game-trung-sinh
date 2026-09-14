import {
  ENDINGS,
  getAchievement,
  getEnemy,
  getItem,
  getLocation,
  getNpc,
  getRecipe,
  getQuest,
  getSkillNode,
  getTalent,
  getTechnique,
  getStoryScene,
  systemById,
} from '../content'
import { describeDeath } from '../content/death-legacy'
import {
  ITEM_HERB,
  LOTTERY_COST,
  LOTTERY_GRAND_GOLD,
  LOTTERY_MAJOR_GOLD,
  LOTTERY_MINOR_GOLD,
  LOTTERY_ROLL_MAX,
} from './constants'
import { GOLD_TO_SILVER } from './economy'
import { TIME_OF_DAY_EN, TIME_OF_DAY_VI } from './time'
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

// Issue 36: a currency exchange used to render as FALLBACK_TEXT — the player
// watched silver vanish and the chronicle said only "something happened".
// Both sides of every trade are recoverable from {from, qty, goldGain} plus the
// fixed 1 stone = 10 gold = 100 silver contract (economy.ts), so no new event
// field is needed. Note `qty` counts the source tier on the stone paths and
// the gold received on the silver path (see doConvertCurrency).
function conversionSides(
  from: 'spiritStone' | 'silver' | 'gold',
  qty: number,
  goldGain: number,
  l: Locale,
): [string, string] {
  const gold = (n: number): string => (l === 'vi' ? `${String(n)} lượng` : `${String(n)} gold`)
  const stones = (n: number): string => (l === 'vi' ? `${String(n)} linh thạch` : `${String(n)} spirit stone(s)`)
  const silver = (n: number): string => (l === 'vi' ? `${String(n)} bạc` : `${String(n)} silver`)
  if (from === 'spiritStone') return [stones(qty), gold(goldGain)]
  if (from === 'gold') return [gold(-goldGain), stones(qty)]
  return [silver(goldGain * GOLD_TO_SILVER), gold(qty)]
}

// Issue 36: the lottery takes 20 lượng a ticket and gives back nothing but a
// tier name, so a losing draw read like a free spin. The odds are exact
// integers over LOTTERY_ROLL_MAX (see lottery.ts rollLottery thresholds) and
// the EV follows from the published prizes alone — constants only, no RNG, so
// the line stays reproducible from the event.
const LOTTERY_HERB_PRICE = getItem(ITEM_HERB)?.sellPrice ?? 0

/** Winning outcomes per tier over LOTTERY_ROLL_MAX rolls, mirroring
 *  rollLottery's thresholds (0 grand / ≤2 major / ≤5 minor / ≤9 herb / rest blank). */
const LOTTERY_COUNTS = { grand: 1, major: 2, minor: 3, herb: 4 } as const
const LOTTERY_BLANKS =
  LOTTERY_ROLL_MAX - LOTTERY_COUNTS.grand - LOTTERY_COUNTS.major - LOTTERY_COUNTS.minor - LOTTERY_COUNTS.herb

/** Expected gold returned per ticket, from the prize table (19.25 today).
 *  Exported so an odds chip in the UI reads the number the chronicle says. */
export const LOTTERY_EXPECTED_VALUE: number =
  (LOTTERY_COUNTS.grand * LOTTERY_GRAND_GOLD +
    LOTTERY_COUNTS.major * LOTTERY_MAJOR_GOLD +
    LOTTERY_COUNTS.minor * LOTTERY_MINOR_GOLD +
    LOTTERY_COUNTS.herb * LOTTERY_HERB_PRICE) /
  LOTTERY_ROLL_MAX

function lotteryOddsLine(l: Locale): string {
  const ev = String(LOTTERY_EXPECTED_VALUE)
  const rolls = String(LOTTERY_ROLL_MAX)
  if (l === 'vi') {
    return (
      `Vé ${String(LOTTERY_COST)} lượng — đặc biệt ${String(LOTTERY_COUNTS.grand)}/${rolls} (+${String(LOTTERY_GRAND_GOLD)}), ` +
      `nhì ${String(LOTTERY_COUNTS.major)}/${rolls} (+${String(LOTTERY_MAJOR_GOLD)}), ` +
      `khuyến khích ${String(LOTTERY_COUNTS.minor)}/${rolls} (+${String(LOTTERY_MINOR_GOLD)}), ` +
      `linh thảo ${String(LOTTERY_COUNTS.herb)}/${rolls}, trắng ${String(LOTTERY_BLANKS)}/${rolls}. ` +
      `Trung bình mỗi vé chỉ lại ${ev} lượng.`
    )
  }
  return (
    `A ${String(LOTTERY_COST)}-gold ticket — grand ${String(LOTTERY_COUNTS.grand)}/${rolls} (+${String(LOTTERY_GRAND_GOLD)}), ` +
    `second ${String(LOTTERY_COUNTS.major)}/${rolls} (+${String(LOTTERY_MAJOR_GOLD)}), ` +
    `consolation ${String(LOTTERY_COUNTS.minor)}/${rolls} (+${String(LOTTERY_MINOR_GOLD)}), ` +
    `herb ${String(LOTTERY_COUNTS.herb)}/${rolls}, blank ${String(LOTTERY_BLANKS)}/${rolls}. ` +
    `Expected value is only ${ev} gold per ticket.`
  )
}

// One naming source for death causes: the classifier that owns them
// (content/death-legacy). qi_deviation has no subject there, so it keeps its
// prose name here; DAMAGED's bare locationId falls through to the location.
function causeName(cause: string, locale: Locale): string {
  if (cause === 'qi_deviation') return locale === 'vi' ? 'tẩu hỏa nhập ma' : 'qi deviation'
  const subject = describeDeath(cause, locale).subject
  if (subject !== '') return subject
  const location = getLocation(cause)
  if (location !== undefined) return localizedName(location, cause, locale)
  return cause
}

const WEATHER_DESC: Record<string, { vi: string; en: string }> = {
  quang: { vi: 'Trời quang đãng, gió mát.', en: 'Clear skies, a cool breeze.' },
  mua: { vi: 'Mưa lất phất làm ẩm đường đất.', en: 'Gentle rain wets the earthen paths.' },
  suong: { vi: 'Sương mù giăng kín lối đi.', en: 'Dense mist veils the mountain trails.' },
  bao: { vi: 'Mây đen cuồn cuộn, sấm chớp rền vang.', en: 'Storm clouds churn; thunder rumbles across the peaks.' },
}

function weatherFlavor(weather: { season: string; kind: string; id: string }, locale: Locale): string {
  const desc = WEATHER_DESC[weather.kind]
  if (desc === undefined) return ''
  return locale === 'vi' ? desc.vi : desc.en
}

// NOT_AT_LOCATION gates a dozen different flows, so a single generic line read
// like a shrug. The event now carries the required place (`at`) and the
// attempted action (`context`); naming both turns the refusal into directions.
const PLACE_ACTION: Record<string, [string, string]> = {
  gather: ['hái linh thảo', 'gather spirit herbs'],
  refine: ['ép vật liệu', 'refine materials'],
  buy: ['mua hàng', 'buy goods'],
  sell: ['bán hàng', 'sell goods'],
  convert_currency: ['đổi tiền', 'exchange currency'],
  store: ['gửi đồ vào kho', 'store goods'],
  withdraw: ['lấy đồ từ kho', 'withdraw goods'],
  draw_lottery: ['quay vé số', 'draw a lottery ticket'],
  accept_quest: ['nhận nhiệm vụ', 'take up that task'],
  turn_in_quest: ['nộp nhiệm vụ', 'hand in that task'],
  complete_quest: ['nộp nhiệm vụ', 'hand in that task'],
  system_accept_quest: ['nhận nhiệm vụ', 'take up that task'],
  system_turn_in_quest: ['nộp nhiệm vụ', 'hand in that task'],
}

function notAtLocationLine(ev: GameEvent, l: Locale): string {
  if (ev.type !== 'ERROR') return ''
  const placeId = ev.at
  const place = placeId === undefined ? undefined : getLocation(placeId)
  if (place === undefined || placeId === undefined) {
    // No place involved — this is a combat-state refusal, not a travel problem.
    if (ev.context === 'start_encounter') {
      return l === 'vi'
        ? 'Nơi này không còn thú nào để giao chiến — thử vùng khác trên bản đồ.'
        : 'Nothing here will fight you — try another region on the map.'
    }
    return l === 'vi' ? 'Ngươi đang không đánh nhau với ai cả.' : 'You are not fighting anyone right now.'
  }
  const verb = ev.context === undefined ? undefined : PLACE_ACTION[ev.context]
  const placeName = localizedName(place, placeId, l)
  if (verb === undefined) {
    return l === 'vi'
      ? `Việc này chỉ làm được ở ${placeName}. Bản đồ có chỉ đường tới đó.`
      : `This can only be done at ${placeName}. The map shows the way.`
  }
  return l === 'vi'
    ? `Muốn ${verb[0]} thì phải đến ${placeName}. Bản đồ có chỉ đường tới đó.`
    : `You must go to ${placeName} to ${verb[1]}. The map shows the way.`
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
    const dayLine = l === 'vi' ? `Trời sang ngày ${String(ev.day)}.` : `Day ${String(ev.day)} dawns.`
    if (ev.weather === undefined) return dayLine
    // Issue 6: the stamped weather voices the season/sky; pure from the event.
    const flavor = weatherFlavor(ev.weather, l)
    return flavor === '' ? dayLine : `${dayLine} ${flavor}`
  },
  TIME_ADVANCED: (ev, l) => {
    if (ev.type !== 'TIME_ADVANCED') return ''
    const name = l === 'vi' ? TIME_OF_DAY_VI[ev.timeOfDay] : TIME_OF_DAY_EN[ev.timeOfDay]
    return l === 'vi' ? `Trời chuyển sang ${name}.` : `The day turns to ${name}.`
  },
  RESTED: (_ev, l) =>
    l === 'vi'
      ? 'Một giấc ngủ sâu, hơi thở đều như tiếng chuông chùa.'
      : 'Deep sleep; breath steady as a temple bell.',
  // Three train flavors rotate by stage so the chronicle never rhymes twice in
  // a row. Stage 0 is the "first circulation" beat (one line), stage 1-2 the
  // "settled into the form" beat (two lines), stage 3+ the "old habit" beat
  // (one line, drier). P1-Narrative #8: inside the sealed cave the breath
  // follows a crack in the stone, so the cave scene overrides the rotation
  // with its own one-line variant.
  TRAINED: (ev, l) => {
    if (ev.type !== 'TRAINED') return ''
    const gain = String(ev.gain)
    if (ev.sceneId === 'cave_witness') {
      return l === 'vi'
        ? `Trong hang, mỗi chu thiên theo một vết nứt khác; tu vi tăng ${gain} điểm.`
        : `Inside the cave each circulation follows a different crack; insight +${gain}.`
    }
    if (l === 'vi') {
      if (ev.stage === 0) return `Khép lại một chu thiên, tu vi tăng ${gain} điểm.`
      if (ev.stage <= 2) return `Hơi thở đã quen đường khí. Một chu thiên nữa khép — tu vi tăng ${gain} điểm.`
      return `Chu thiên thứ ${String(ev.stage + 1)} quen tay. Tu vi tăng ${gain} điểm.`
    }
    if (ev.stage === 0) return `One full circulation complete; insight +${gain}.`
    if (ev.stage <= 2) return `The breath has learned this path. Another circulation closes — insight +${gain}.`
    return `Circulation ${String(ev.stage + 1)}, the form now familiar. Insight +${gain}.`
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
  // Issue 36: the line must carry the whole transaction. `goldPaid` is already
  // the gold-equivalent the reducer charged (any tier), so qty + price together
  // state exactly what the player gave for what they got.
  BOUGHT: (ev, l) => {
    if (ev.type !== 'BOUGHT') return ''
    const qty = String(ev.qty)
    return l === 'vi'
      ? `Ngươi đổi ${String(ev.goldPaid)} lượng lấy ${qty} ${nameOf('item', ev.itemId, l)}.`
      : `Bought ${qty} × ${nameOf('item', ev.itemId, l)} for ${String(ev.goldPaid)} gold.`
  },
  // A sale states proceeds per unit too, so a penalty taken at the counter is
  // visible instead of the player having to diff the gold bar.
  SOLD: (ev, l) => {
    if (ev.type !== 'SOLD') return ''
    const qty = String(ev.qty)
    return l === 'vi'
      ? `Ngươi bán ${qty} ${nameOf('item', ev.itemId, l)}, nhận ${String(ev.goldGain)} lượng.`
      : `Sold ${qty} × ${nameOf('item', ev.itemId, l)} for ${String(ev.goldGain)} gold.`
  },
  CURRENCY_CONVERTED: (ev, l) => {
    if (ev.type !== 'CURRENCY_CONVERTED') return ''
    const [given, got] = conversionSides(ev.from, ev.qty, ev.goldGain, l)
    return l === 'vi'
      ? `Ngươi đổi ${given} lấy ${got} tại quầy tiền.`
      : `You exchange ${given} for ${got} at the money counter.`
  },
  AFFINITY: (ev, l) => {
    if (ev.type !== 'AFFINITY') return ''
    return l === 'vi'
      ? `${nameOf('npc', ev.npcId, l)} đã coi ngươi ra người tử tế — hảo cảm lên bậc ${String(ev.level)}.`
      : `${nameOf('npc', ev.npcId, l)} now treats you as a friend — rapport level ${String(ev.level)}.`
  },
  SYSTEM_CHOSEN: (ev, l) => {
    if (ev.type !== 'SYSTEM_CHOSEN') return ''
    const def = systemById(ev.systemId)
    const name = localizedName(def, ev.systemId, l)
    return l === 'vi'
      ? `Khế ước ký xong — ${name} ở lại với ngươi đến hết kiếp này.`
      : `The pact is sealed — ${name} stays with you for the rest of this life.`
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
  // Issue 36: the ticket costs 20 lượng but every result line used to read like
  // a free spin — a blank ticket said "try again tomorrow" and hid the loss.
  // Each tier now states the prize actually paid (`goldDelta` is the gross
  // winnings, the cost is separate) and the draw closes with the exact odds and
  // expected value, both derived from the published constants.
  DRAW_RESULT: (ev, l) => {
    if (ev.type !== 'DRAW_RESULT') return ''
    const odds = lotteryOddsLine(l)
    switch (ev.tier) {
      case 'grand':
        return l === 'vi'
          ? `Vé số trúng giải đặc biệt! ${String(ev.goldDelta)} lượng rơi vào tay ngươi như từ trên trời xuống! ${odds}`
          : `Grand prize! Heaven drops ${String(ev.goldDelta)} gold into your lap! ${odds}`
      case 'major':
        return l === 'vi'
          ? `Giải nhì! +${String(ev.goldDelta)} lượng. ${odds}`
          : `Second prize! +${String(ev.goldDelta)} gold. ${odds}`
      case 'minor':
        return l === 'vi'
          ? `Giải khuyến khích. +${String(ev.goldDelta)} lượng. ${odds}`
          : `Consolation prize. +${String(ev.goldDelta)} gold. ${odds}`
      case 'herb':
        return l === 'vi'
          ? `Trúng... một bó ${nameOf('item', ev.itemId ?? ITEM_HERB, l)} — bán được ${String(LOTTERY_HERB_PRICE)} lượng. ${odds}`
          : `You win... a fresh bundle of ${nameOf('item', ev.itemId ?? ITEM_HERB, l)}, worth ${String(LOTTERY_HERB_PRICE)} gold at the counter. ${odds}`
      default:
        return l === 'vi'
          ? `Vé số trắng tay — mất ${String(LOTTERY_COST)} lượng. ${odds}`
          : `The ticket wins nothing — ${String(LOTTERY_COST)} gold gone. ${odds}`
    }
  },
  TALKED: (ev, l) => {
    if (ev.type !== 'TALKED') return ''
    return l === 'vi'
      ? `${nameOf('npc', ev.npcId, l)}: “${ev.lineVi ?? getNpc(ev.npcId)?.greetVi ?? '...'}”`
      : `${nameOf('npc', ev.npcId, l)}: “${ev.lineEn ?? getNpc(ev.npcId)?.greetEn ?? '...'}”`
  },
  // Issue #39: the chronicle states the gift's cost to the giver in numbers —
  // swing and running total — then lets the NPC answer in their own voice.
  GIFTED: (ev, l) => {
    if (ev.type !== 'GIFTED') return ''
    return l === 'vi'
      ? `Ngươi tặng ${nameOf('npc', ev.npcId, l)} ${nameOf('item', ev.itemId, l)} — hảo cảm +${String(ev.delta)}, lên ${String(ev.total)}. ${ev.lineVi}`
      : `You gift ${nameOf('item', ev.itemId, l)} to ${nameOf('npc', ev.npcId, l)} — rapport +${String(ev.delta)}, now ${String(ev.total)}. ${ev.lineEn}`
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
  // Issue 5: skill-tree unlocks voice the node's name so the player hears the
  // choice they made (fallback to the raw node id for forward-compat nodes).
  SKILL_UNLOCKED: (ev, l) => {
    if (ev.type !== 'SKILL_UNLOCKED') return ''
    const node = getSkillNode(ev.nodeId)
    const name = l === 'vi' ? (node?.nameVi ?? ev.nodeId) : (node?.nameEn ?? ev.nodeId)
    return l === 'vi'
      ? `Ngươi lĩnh ngộ “${name}” — tốn ${String(ev.skillPointsSpent)} điểm kỹ năng.`
      : `You unlock “${name}” — ${String(ev.skillPointsSpent)} skill point(s) spent.`
  },
  ENCOUNTER_STARTED: (ev, l) => {
    if (ev.type !== 'ENCOUNTER_STARTED') return ''
    return l === 'vi' ? `Có kẻ chặn đường: ${nameOf('enemy', ev.enemyId, l)}.` : `An enemy blocks your path: ${nameOf('enemy', ev.enemyId, l)}.`
  },
  ARENA_CHALLENGED: (ev, l) => {
    if (ev.type !== 'ARENA_CHALLENGED') return ''
    return l === 'vi'
      ? `Ngươi bước lên Lôi Đài — tầng ${String(ev.floor)}, ${nameOf('enemy', ev.enemyId, l)} đã chờ sẵn.`
      : `You step onto the Arena — floor ${String(ev.floor)}: ${nameOf('enemy', ev.enemyId, l)} is waiting.`
  },
  ARENA_FLOOR_CLEARED: (ev, l) => {
    if (ev.type !== 'ARENA_FLOOR_CLEARED') return ''
    // The spoils name the actual items — `itemIds` lists types, not quantities,
    // so a count ("3 linh tài") would misreport a 2-herb + 1-wine haul.
    const spoils = ev.itemIds.map((id) => nameOf('item', id, l)).join(l === 'vi' ? ', ' : ', ')
    const loot = spoils.length === 0
      ? (l === 'vi' ? `thu ${String(ev.gold)} lượng` : `seize ${String(ev.gold)} gold`)
      : l === 'vi'
        ? `thu ${String(ev.gold)} lượng cùng ${spoils}`
        : `seize ${String(ev.gold)} gold and ${spoils}`
    return l === 'vi'
      ? `Tầng ${String(ev.floor)} ngã ngũ: ${nameOf('enemy', ev.enemyId, l)} khuỵu xuống, ngươi ${loot}.`
      : `Floor ${String(ev.floor)} settled: ${nameOf('enemy', ev.enemyId, l)} folds; you ${loot}.`
  },
  ARENA_TOWER_TOPPED: (ev, l) => {
    if (ev.type !== 'ARENA_TOWER_TOPPED') return ''
    return l === 'vi'
      ? `${String(ev.floors)} tầng Lôi Đài đã san bằng — không sư huynh nào dám nhìn thẳng ngươi nữa.`
      : `All ${String(ev.floors)} arena floors leveled — no senior brother meets your eyes now.`
  },
  NPC_COERCED: (ev, l) => {
    if (ev.type !== 'NPC_COERCED') return ''
    if (ev.approach === 'back_off') {
      // The grace is spent after the first time — the copy says so, so a
      // repeat back-off is never narrated as earning goodwill it did not.
      return ev.aff === 0
        ? (l === 'vi'
          ? `Ngươi lại hạ tay với ${nameOf('npc', ev.npcId, l)} — lòng khoan dung đã cho một lần, chẳng còn gì mới.`
          : `You lower your hand at ${nameOf('npc', ev.npcId, l)} again — the mercy was granted once, nothing new is owed.`)
        : (l === 'vi'
          ? `Ngươi hạ tay, bỏ qua cho ${nameOf('npc', ev.npcId, l)}; kẻ ấy nhớ một phần thể diện.`
          : `You lower your hand and let ${nameOf('npc', ev.npcId, l)} off; they remember the mercy.`)
    }
    if (ev.gold === 0 && ev.itemIds.length === 0) {
      return l === 'vi'
        ? `Lần nữa uy hiếp ${nameOf('npc', ev.npcId, l)} — nhưng túi của kẻ ấy đã cạn từ lượt trước.`
        : `You lean on ${nameOf('npc', ev.npcId, l)} again — their purse was emptied last time.`
    }
    return l === 'vi'
      ? `Ngươi dồn ${nameOf('npc', ev.npcId, l)} vào chân tường, cưỡng đoạt ${String(ev.gold)} lượng cùng linh tài; tiếng ác đồn xa.`
      : `You drive ${nameOf('npc', ev.npcId, l)} against the wall and take ${String(ev.gold)} gold in spoils; the ill repute spreads.`
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
  COMBAT_FOCUSED: (ev, l) => {
    if (ev.type !== 'COMBAT_FOCUSED') return ''
    return l === 'vi'
      ? `Ngươi tụ khí ${String(ev.stacks)} tầng (+${String(ev.damage)} sát thương đòn sau), thủ thế giảm ${String(ev.guard)}.`
      : `You focus ${String(ev.stacks)} stack(s) (+${String(ev.damage)} next-strike damage), bracing for ${String(ev.guard)}.`
  },
  COMBAT_WON: (ev, l) => {
    if (ev.type !== 'COMBAT_WON') return ''
    const isArena = getEnemy(ev.enemyId)?.arena !== undefined
    if (isArena) {
      return l === 'vi'
        ? `Thắng trận Lôi Đài trước ${nameOf('enemy', ev.enemyId, l)}.`
        : `Victory on the Arena stage against ${nameOf('enemy', ev.enemyId, l)}.`
    }
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
  BOSS_HEAL: (ev, l) => {
    if (ev.type !== 'BOSS_HEAL') return ''
    return l === 'vi'
      ? `${nameOf('enemy', ev.enemyId, l)} hút toàn bộ linh khí, hồi ${String(ev.hpRestored)} khí huyết!`
      : `${nameOf('enemy', ev.enemyId, l)} drains all surrounding qi, restoring ${String(ev.hpRestored)} HP!`
  },
  POISON_APPLIED: (ev, l) => {
    if (ev.type !== 'POISON_APPLIED') return ''
    return l === 'vi'
      ? `Độc xâm nhập kinh mạch — ${String(ev.amount)} lớp độc tích tụ.`
      : `Poison enters the meridians — ${String(ev.amount)} stack(s) applied.`
  },
  POISON_TICK: (ev, l) => {
    if (ev.type !== 'POISON_TICK') return ''
    return l === 'vi'
      ? `Độc phát tác, gây ${String(ev.amount)} sát thương (còn ${String(ev.stacks)} lớp).`
      : `Poison ticks for ${String(ev.amount)} damage (${String(ev.stacks)} stack(s) remain).`
  },
  QI_REGEN: (ev, l) => {
    if (ev.type !== 'QI_REGEN') return ''
    return l === 'vi'
      ? `Hơi thở ổn định, hồi ${String(ev.amount)} linh khí ở lượt ${String(ev.turn)}.`
      : `Breath steadies, recovered ${String(ev.amount)} qi on turn ${String(ev.turn)}.`
  },
  COMBO_TRIGGERED: (ev, l) => {
    if (ev.type !== 'COMBO_TRIGGERED') return ''
    return l === 'vi'
      ? `Combo ${String(ev.hits)} liên tục — đòn đánh như thác nước!`
      : `Combo ${String(ev.hits)} hits — strikes cascade like a waterfall!`
  },
  COMBAT_CRIT: (ev, l) => {
    if (ev.type !== 'COMBAT_CRIT') return ''
    return l === 'vi'
      ? `ĐỘNH CHÍ MẠNG! ${String(ev.amount)} sát thương chí mạng!`
      : `CRITICAL STRIKE! ${String(ev.amount)} critical damage!`
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
      : `You take ${String(ev.amount)} damage from ${causeName(ev.source, l)}.`
  },
  DEATH: (ev, l) => {
    if (ev.type !== 'DEATH') return ''
    return l === 'vi'
      ? `Trước mắt ngươi tối dần. ${causeName(ev.cause, l)} đã khép lại kiếp này.`
      : `Your vision fades. ${causeName(ev.cause, l)} has closed this life.`
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
    if (ev.code === 'NOT_AT_LOCATION') return notAtLocationLine(ev, l)
    const explanations: Record<string, [string, string]> = {
      TERMINAL: ['Kiếp này đã khép lại; hãy bắt đầu một kiếp mới để lựa chọn khác.', 'This life has closed; begin another to choose differently.'],
      MOVE_BLOCKED: ['Lối đó bị địa hình chặn. Hãy nhìn đường sáng hoặc tìm lối vòng trên bản đồ.', 'That way is blocked by terrain. Follow a lit route or find a way around on the map.'],
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
      // Issue 36: the codes below all rendered the same shrug ("Ý định ấy chưa
      // thể thành lúc này"), which reads as a bug rather than a refusal. Each
      // now names what was missing and what fixes it.
      INSUFFICIENT_SILVER: [
        'Bạc không đủ cho trả giá này — vàng đã dồn hết vào rồi. Đổi linh thạch lấy bạc ở quầy tiền.',
        'Not enough silver to cover the rest of this price — your gold went first. Exchange stones for silver at the money counter.',
      ],
      INSUFFICIENT_SPIRIT_STONES: [
        'Món này chỉ quầy sang bán bằng linh thạch, và túi ngươi không đủ. Đổi vàng lấy linh thạch ở quầy tiền.',
        'This good is priced in spirit stones, which you do not have enough of. Trade gold for stones at the money counter.',
      ],
      INSUFFICIENT_HP: [
        'Thương thế quá nặng để tu luyện — một chu thiên nữa là kiệt. Hãy dùng dược hoặc nghỉ.',
        'You are hurt past training — one more circulation would finish you. Use medicine or rest first.',
      ],
      // ponytail: the 22/24 thresholds are duplicated from spendDay's lock
      // flags (reducer.ts). Ceiling: they drift if the dates move. Upgrade
      // path: stamp the closing day onto the STORAGE_LOCKED / REGION_LOCKED
      // events and read it from there.
      STORAGE_LOCKED: [
        'Nhà kho đã đóng cửa từ ngày 22 — Cụ Mai Hoa không nhận gửi nữa. Đồ phải mang theo người.',
        'The warehouse shut on day 22 — Elder Meihua takes no more deposits. Carry your goods with you.',
      ],
      REGION_LOCKED: [
        'Hang Phong Ấn đã bị niêm phong — từ ngày 24 không vào được nữa. Con đường khác vẫn còn.',
        'The Sealed Cave is shut — from day 24 there is no entering. Other roads remain open.',
      ],
      SYSTEM_LOCKED: [
        'Chiêu này thuộc một Hệ Thống khác; khế ước của ngươi chỉ mở đường ngươi đã chọn.',
        'That technique belongs to another System; your pact unlocks only the road you chose.',
      ],
      ARENA_CLOSED: [
        'Lôi Đài đã cạn người — ngươi quét sạch mọi tầng rồi. Không còn gì để thắng ở đây.',
        'The Arena has no one left — you cleared every floor. There is nothing more to win here.',
      ],
      COERCION_UNAVAILABLE: [
        'Uy hiếp chỉ ăn với kẻ trái tính, và mỗi kẻ chỉ một lần. Người này không chịu hoặc đã bị ngươi dồn rồi.',
        'Coercion only works on an opposite temperament, once per person. This one will not yield, or you already pressed them.',
      ],
      SKILL_UNKNOWN: [
        'Không có mắt xích ấy trong cây công pháp — nhìn bảng kỹ năng để chọn đúng tên.',
        'That node is not in your skill tree — check the skill panel for the real names.',
      ],
      SKILL_ALREADY_UNLOCKED: [
        'Mắt xích này ngươi đã lĩnh ngộ rồi — điểm kỹ năng để dành cho nhánh khác.',
        'You already unlocked that node — save your skill points for another branch.',
      ],
      SKILL_REQUIREMENT_NOT_MET: [
        'Căn cơ chưa tới: cần đúng cảnh giới, công pháp nền, hoặc mắt xích trước trong cùng nhánh.',
        'Not ready yet: it needs the right realm, a prerequisite technique, or the previous node in its branch.',
      ],
      SKILL_CONFLICT: [
        'Hai nhánh này loại nhau — đã chọn đường trước thì không đi ngược lại được.',
        'These two branches exclude each other — having taken one road, you cannot walk the other.',
      ],
      INSUFFICIENT_SKILL_POINTS: [
        'Điểm kỹ năng không đủ. Mỗi lần đột phá tầng nhỏ mới cho thêm điểm.',
        'Not enough skill points. Each minor-realm breakthrough grants more.',
      ],
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
