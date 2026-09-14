import { useEffect, useMemo, useState } from 'react'
import type { Action, GameState, Locale } from '../engine'
import { getAffection } from '../engine'
import { getItem, getNpc, getLocation } from '../content'
import { giftReactionFor } from '../content/npc-gifts'
import { npcPortraitFor } from './npcArt'
import { playerArtFor } from './playerArt'

/* =========================================================================
 *  NPC Chat Modal — 2 nhân vật (player left, NPC right) + dialogue log
 *  Wire thật vào engine: choice → onAction({ kind, ... })
 *  Đồng bộ với prototype phe-can-ky-ui-prototype.html (chat modal).
 *
 *  Issue #32: mọi string kịch bản là cặp {vi,en} (house pattern: narrator.ts
 *  WEATHER_DESC, ui/endingEpilogue.ts OUTCOME) và resolve theo `locale`.
 *  Text tiếng Việt giữ nguyên từng byte — chỉ thêm bản English.
 * ========================================================================= */

export interface NpcChatModalProps {
  show: boolean
  npcId: string | null
  game: GameState
  locale: Locale
  onClose: () => void
  onAction: (action: Action) => void
}

/** Cặp song ngữ — cùng shape với `{ vi, en }` trong narrator/story/epilogue. */
export type Bi = { vi: string; en: string }

type Choice = { label: Bi; next?: string; action?: Action }
type Node = { npc: Bi; text: Bi; choices: Choice[]; end?: boolean }
type Script = Record<string, Node>

/** Bản đã chốt ngôn ngữ, dùng cho render (component không còn biết tới `Bi`). */
export type ChatChoice = { label: string; next?: string; action?: Action }
export type ChatNode = { npc: string; text: string; choices: ChatChoice[]; end?: boolean }

function word(locale: Locale, s: Bi): string {
  return locale === 'vi' ? s.vi : s.en
}

/** Flat hoá cả cây hội thoại theo locale. Pure — test được không cần DOM. */
export function resolveScript(script: Script, locale: Locale): Record<string, ChatNode> {
  const out: Record<string, ChatNode> = {}
  for (const [key, node] of Object.entries(script)) {
    out[key] = {
      npc: word(locale, node.npc),
      text: word(locale, node.text),
      end: node.end,
      choices: node.choices.map((c) => ({ label: word(locale, c.label), next: c.next, action: c.action })),
    }
  }
  return out
}

const YOU_NAME: Bi = { vi: 'Lâm Phàm', en: 'Lam Pham' }

/* Script cho 3 NPC. Mỗi choice có thể dispatch action thật vào engine.
 * Export để test/npc-chat-bilingual.test.ts đối chiếu shape vi/en. */
export const SCRIPTS: Record<string, { name: Bi; youName: Bi; script: Script }> = {
  n_merchant_bao: {
    name: { vi: 'Lão Bạch', en: 'Old Bach' },
    youName: YOU_NAME,
    script: {
      start: {
        npc: { vi: 'Lão Bạch', en: 'Old Bach' },
        text: { vi: 'Ồ, tiểu đạo hữu sáng sớm đã dậy sớm nhỉ. Có muốn xem qua mấy bình Tụ Khí Đan ta mới lấy từ trấn trên không? Hôm nay giảm giá cho người quen, chỉ 8 bạc thôi.', en: 'Oh, up before the sun, little friend. Care to see the Qi-Gathering Pills I just brought back from town? Regular customers get a discount today — only eight silver.' },
        choices: [
          { label: { vi: 'Mua một bình — đang cần để tu luyện.', en: 'Buy a bottle — I need it for cultivation.' }, next: 'buy', action: { kind: 'buy', itemId: 'pill_qi', qty: 1 } },
          { label: { vi: 'Hỏi thăm tin tức kỳ ngộ gần đây.', en: 'Ask about recent talk of fortuitous encounters.' }, next: 'rumor' },
          { label: { vi: 'Lắc đầu — tạm không cần.', en: 'Shake your head — not for now.' }, next: 'decline' },
        ],
      },
      buy: {
        npc: { vi: 'Lão Bạch', en: 'Old Bach' },
        text: { vi: 'Khôn ngoan đó. Đan này tuy hạ phẩm, nhưng với người mới nhập đạo thì vừa đủ. À, tiện thể ta kể ngươi nghe — sáng nay có thương đội ngoài Bắc đi qua, nghe nói trong đoàn có một bình Hỗn Nguyên Đan trân quý lắm…', en: 'Wise. These are low-grade pills, but enough for someone newly entering the Dao. Oh, since we are talking — a caravan came through from the north this morning, and they say among their loads was a precious Chaos-Origin Pill…' },
        choices: [
          { label: { vi: 'Hỏi thêm về bình Hỗn Nguyên Đan.', en: 'Ask more about that Chaos-Origin Pill.' }, next: 'rumor' },
          { label: { vi: 'Cảm ơn lão — hẹn ngày sau quay lại.', en: 'Thank you, old man — I will come back another day.' }, next: 'bye' },
        ],
      },
      rumor: {
        npc: { vi: 'Lão Bạch', en: 'Old Bach' },
        text: { vi: 'Tin tức thì có một — phía bắc khe suối, gần nơi mà Trần Bất Danh hay lui tới, mấy đêm nay yêu khí tăng mạnh. Đạo hữu đi săn bắt cẩn thận, đừng chủ quan.', en: 'One piece of news — north of the stream, near where Tran the Nameless likes to wander, the demonic qi has been rising these past nights. Be careful out hunting, friend. Do not grow complacent.' },
        choices: [
          { label: { vi: 'Ghi nhận — sẽ đề phòng.', en: 'Noted — I will stay on guard.' }, next: 'bye' },
          { label: { vi: 'Tạm biệt lão Bạch.', en: 'Farewell, Old Bach.' }, next: 'bye' },
        ],
      },
      decline: {
        npc: { vi: 'Lão Bạch', en: 'Old Bach' },
        text: { vi: 'Không sao, không ép. Mua bán là duyên, có duyên sẽ gặp lại. Đạo hữu đi đường cẩn thận, trên sơn đạo vừa có dấu yêu khí mới xuất hiện…', en: 'No matter, no pressure. Trade is fate, and where there is fate we meet again. Mind the road, friend — fresh traces of demonic qi have appeared on the mountain path…' },
        choices: [{ label: { vi: 'Cảm ơn lão, tạm biệt.', en: 'Thank you, old man. Farewell.' }, next: 'bye' }],
      },
      bye: { end: true, npc: { vi: 'Lão Bạch', en: 'Old Bach' }, text: { vi: 'Hẹn gặp lại đạo hữu. Đi đường bình an.', en: 'Until we meet again, friend. Travel in peace.' }, choices: [] },
    },
  },
  n_hermit_coc: {
    name: { vi: 'Trần Bất Danh', en: 'Tran the Nameless' },
    youName: YOU_NAME,
    script: {
      start: {
        npc: { vi: 'Trần Bất Danh', en: 'Tran the Nameless' },
        text: { vi: 'Đạo hữu! Ta đang tìm người cùng lên đỉnh Vọng Nguyệt. Đêm qua ta mơ thấy một tia sáng xanh lục từ trên trời rơi xuống — hẳn là dị tượng. Ngươi có muốn đi cùng không?', en: 'Friend! I have been looking for someone to climb Moon-Viewing Peak with. Last night I dreamed of a green light falling out of the sky — surely an omen. Will you go with me?' },
        choices: [
          { label: { vi: 'Đồng ý — đi cùng ngươi.', en: 'Agree — I will go with you.' }, next: 'agree', action: { kind: 'move', direction: 'north' } },
          { label: { vi: 'Từ chối — ta còn phải tu luyện.', en: 'Refuse — I still have to cultivate.' }, next: 'refuse' },
          { label: { vi: 'Hỏi thêm về tia sáng ấy.', en: 'Ask more about that light.' }, next: 'ask' },
        ],
      },
      agree: {
        npc: { vi: 'Trần Bất Danh', en: 'Tran the Nameless' },
        text: { vi: 'Tốt! Đi đường nhớ giữ sức, ta sẽ dẫn đường qua mỏm đá phía đông. Đến nơi rồi ta chia nhau tìm kiếm — gặp nguy hiểm thì huýt sáo, ngươi sẽ nghe tiếng ta đáp lại.', en: 'Good! Keep your strength on the road, and I will lead us over the eastern crag. Once we arrive we split up to search — if there is danger, whistle, and you will hear me answer.' },
        choices: [{ label: { vi: 'Gật đầu — khởi hành thôi.', en: 'Nod — let us set out.' }, next: 'bye' }],
      },
      refuse: {
        npc: { vi: 'Trần Bất Danh', en: 'Tran the Nameless' },
        text: { vi: 'Tiếc thật. Vậy ta đi một mình. Nếu có tin tức gì từ bí cảnh, ta sẽ báo lại cho ngươi biết. Đừng bỏ lỡ cơ duyên lần sau nhé.', en: 'What a pity. I will go alone, then. If I hear anything from the secret realm, I will bring it to you. Do not miss the next stroke of fortune.' },
        choices: [{ label: { vi: 'Cảm ơn — hẹn gặp lại.', en: 'Thank you — until next time.' }, next: 'bye' }],
      },
      ask: {
        npc: { vi: 'Trần Bất Danh', en: 'Tran the Nameless' },
        text: { vi: 'Tia sáng ấy… theo ta đoán, hẳn là một mảnh pháp bảo cổ xưa rơi xuống từ tầng trời. Loại này ba trăm năm mới xuất hiện một lần, nếu nhặt được thì cảnh giới có thể đề thăng hai ba tầng. Nhưng — yêu khí cũng theo đó mà tăng mạnh. Ngươi quyết định đi chứ?', en: 'That light… by my reckoning it is a shard of an ancient dharma-treasure fallen from the heavens. This kind surfaces once in three hundred years; pick it up and your realm might leap two or three stages. But — demonic qi rises with it too. You will go, will you not?' },
        choices: [
          { label: { vi: 'Đồng ý đi cùng — cơ duyên khó cầu.', en: 'Agree to go — such fortune is hard to meet.' }, next: 'agree', action: { kind: 'move', direction: 'north' } },
          { label: { vi: 'Vẫn từ chối — cần chuẩn bị thêm.', en: 'Still refuse — I need more preparation.' }, next: 'refuse' },
        ],
      },
      bye: { end: true, npc: { vi: 'Trần Bất Danh', en: 'Tran the Nameless' }, text: { vi: 'Hành trang giữ vững, kiếm khí thuần khiết. Gặp lại sau.', en: 'Keep your footing steady, your sword-qi pure. Until later.' }, choices: [] },
    },
  },
  n_alchemist_sam: {
    name: { vi: 'Bạch Lạc Vi', en: 'Bach Lac Vi' },
    youName: YOU_NAME,
    script: {
      start: {
        npc: { vi: 'Bạch Lạc Vi', en: 'Bach Lac Vi' },
        text: { vi: 'Ngươi tới rồi. Ta vừa luyện xong một lô Tụ Khí Đan trung phẩm, nếu ngươi cần thì để giá hữu nghị. Mà — trước hết, ngươi có muốn học cách phân biệt dược liệu không?', en: 'You are here. I just finished a batch of mid-grade Qi-Gathering Pills; if you need them, I will give you a friend’s price. But first — would you like to learn to tell medicinal herbs apart?' },
        choices: [
          { label: { vi: 'Xin học — rất cần kiến thức này.', en: 'Teach me — I badly need this knowledge.' }, next: 'learn', action: { kind: 'learn_technique', techniqueId: 'crooked_circulation' } },
          { label: { vi: 'Hỏi thăm về đan phương Hỗn Nguyên.', en: 'Ask about the Chaos-Origin recipe.' }, next: 'recipe' },
          { label: { vi: 'Tạm thời không — hẹn lần sau.', en: 'Not now — next time, then.' }, next: 'decline' },
        ],
      },
      learn: {
        npc: { vi: 'Bạch Lạc Vi', en: 'Bach Lac Vi' },
        text: { vi: 'Được. Ngươi nhìn ba cây thảo trước mặt: cây thứ nhất gân xanh, lá cong; cây thứ hai thân tím, lá thẳng; cây thứ hai mà có mùi hắc thì là Thanh Liên thật, còn lại là giả. Nhớ kỹ — luyện đan sai một ly là hỏng cả lô.', en: 'Good. Look at the three stalks before you: the first has blue veins and curled leaves; the second a purple stem and straight leaves; if the second one smells acrid, it is the true Azure Lotus and the rest are fakes. Remember this — one line wrong in the recipe ruins the whole batch.' },
        choices: [
          { label: { vi: 'Ghi nhớ, cảm ơn sư tỷ.', en: 'I will remember. Thank you, senior sister.' }, next: 'bye' },
          { label: { vi: 'Hỏi thêm công thức đan.', en: 'Ask about more pill recipes.' }, next: 'recipe' },
        ],
      },
      recipe: {
        npc: { vi: 'Bạch Lạc Vi', en: 'Bach Lac Vi' },
        text: { vi: 'Hỗn Nguyên Đan cần bảy vị: Thanh Liên, Hỏa Chi Ma, Băng Tâm Hoa, Tụ Khí Thảo, Hắc Thổ, Tinh Hồ, và một giọt Tâm Huyết Đan Sư. Đan phương này chỉ truyền miệng, không có sách. Nếu ngươi tìm đủ bảy vị, quay lại đây — ta sẽ luyện giúp.', en: 'The Chaos-Origin Pill needs seven ingredients: Azure Lotus, Fire Hemp, Iceheart Flower, Qi-Gathering Grass, Black Earth, Star Orchid, and one drop of the Pill Master’s heartblood. This recipe passes only by mouth; there is no book. Gather all seven and come back here — I will refine it for you.' },
        choices: [
          { label: { vi: 'Cảm ơn sư tỷ — ta sẽ tìm.', en: 'Thank you, senior sister — I will find them.' }, next: 'bye' },
          { label: { vi: 'Hỏi nơi tìm Tinh Hồ.', en: 'Ask where to find Star Orchid.' }, next: 'learn' },
        ],
      },
      decline: {
        npc: { vi: 'Bạch Lạc Vi', en: 'Bach Lac Vi' },
        text: { vi: 'Không vội. Đan đạo cần tâm, tâm không yên thì luyện cũng phí. Khi nào ngươi sẵn sàng, cứ quay lại lò đan này.', en: 'No hurry. The dao of pills needs a settled heart; an unsettled heart only wastes the furnace. When you are ready, come back to this forge.' },
        choices: [{ label: { vi: 'Gật đầu, tạm biệt sư tỷ.', en: 'Nod — farewell, senior sister.' }, next: 'bye' }],
      },
      bye: { end: true, npc: { vi: 'Bạch Lạc Vi', en: 'Bach Lac Vi' }, text: { vi: 'Đan khí thuần hư, tâm địa bình an. Hẹn tái ngộ.', en: 'Pill-qi pure as emptiness, heart at peace. Until we meet again.' }, choices: [] },
    },
  },
}

interface LogLine { who: string; whoClass: 'npc' | 'you'; text: string }

/* =========================================================================
 *  Hội thoại chung — mọi NPC chưa có script rẽ nhánh vẫn có chuyện để nói.
 *  Chọn 1 trong 6 mạch theo hash cố định của (npcId, locationId) — KHÔNG
 *  Math.random: lật locale không đổi mạch, mở lại cùng nơi đọc lại cùng chuyện.
 *  Lời thoại template theo {name}/{role}/{place}/{greet} nên đọc tự nhiên
 *  với bất kỳ NPC nào. Mỗi mạch 6 node: start → 3 nhánh → deep → bye.
 * ========================================================================= */

/** Ctx cũng là cặp song ngữ: {name}/{role}/{place}/{greet} lắp theo từng ngôn ngữ. */
type Ctx = { name: Bi; role: Bi; place: Bi; greet: Bi }
type Thread = { ask: Bi; npc: Bi; follow: Bi }
type Generic = { greet: Bi; threads: Thread[]; deep: Bi; bye: Bi }

const fill = (s: string, c: { name: string; role: string; place: string; greet: string }): string =>
  s.replaceAll('{name}', c.name).replaceAll('{role}', c.role).replaceAll('{place}', c.place).replaceAll('{greet}', c.greet)

const ctxFor = (c: Ctx, locale: Locale) => ({
  name: word(locale, c.name),
  role: word(locale, c.role),
  place: word(locale, c.place),
  greet: word(locale, c.greet),
})

/** Tên/vai/địa điểm/lời chào của NPC, cả hai ngôn ngữ, có fallback an toàn. */
export function npcCtx(npcId: string, locationId: string): Ctx {
  const npc = getNpc(npcId)
  const place = getLocation(locationId)
  return {
    name: { vi: npc?.nameVi ?? npc?.roleVi ?? npcId, en: npc?.nameEn ?? npc?.roleEn ?? npcId },
    role: { vi: npc?.roleVi ?? 'kẻ qua đường', en: npc?.roleEn ?? 'a passer-by' },
    place: { vi: place?.nameVi ?? 'vùng này', en: place?.nameEn ?? 'these parts' },
    // ponytail: greetVi/greetEn both exist for every NPC in content today; these
    // literals only cover a hand-authored id. Upgrade path: delete them if NpcDef
    // ever widens the fallback.
    greet: { vi: npc?.greetVi ?? 'Ừ, ngươi tới đấy à.', en: npc?.greetEn ?? 'Oh, you came.' },
  }
}

/** 6 mạch hội thoại chung. Export để test dựng cả 6, không phụ thuộc random pick. */
export const GENERIC_CONVERSATIONS: Generic[] = [
  {
    greet: { vi: '{greet} Ngươi tới đúng lúc — ta đang buồn miệng lắm.', en: '{greet} You come at the right moment — I was aching for someone to talk to.' },
    threads: [
      { ask: { vi: 'Ngươi hỏi thăm sức khỏe của ta.', en: 'You ask after my health.' }, npc: { vi: 'Khá. Đêm ngủ được bốn canh, sáng dậy còn thấy đói — với kẻ làm {role} ở {place} thế là sang lắm rồi.', en: 'Not bad. Four watches of sleep last night, and I woke hungry — for a {role} in {place}, that is outright luxury.' }, follow: { vi: 'Vậy là ta yên tâm. Ngươi cứ giữ cái phúc đó.', en: 'Then my mind is at ease. Hold on to that good fortune.' } },
      { ask: { vi: 'Hỏi đường sá ra vào vùng này có còn yên không.', en: 'You ask whether the roads in and out are still safe.' }, npc: { vi: 'Yên thì không hẳn, nhưng chưa đến nỗi. Dạo này người qua {place} đông hơn, ai cũng vội, ai cũng ôm một bí mật.', en: 'Not exactly safe, but not desperate either. Lately more people pass through {place}, every one in a hurry, every one holding a secret.' }, follow: { vi: 'Ta ghi nhớ. Đi đường thì cứ nhìn sắc người mà tránh.', en: 'I will remember. On the road, read people’s faces and steer around them.' } },
      { ask: { vi: 'Hỏi xem gần đây có tin đồn gì mới.', en: 'You ask what new rumors are going around.' }, npc: { vi: 'Có một tin — nghe đâu chỗ cũ có động tĩnh lạ. Tin đồn ở {place} lan nhanh hơn gió, mà cũng bay nhanh hơn gió.', en: 'One — they say something stirs at the old place. Rumors in {place} travel faster than wind, and vanish faster than wind.' }, follow: { vi: 'Cảm ơn ngươi đã kể. Ta sẽ tự mắt thấy tai nghe rồi hãy tin.', en: 'Thank you for telling me. I will believe it once I have seen and heard it myself.' } },
    ],
    deep: { vi: 'Ngươi biết không, cả {place} này ít ai chịu ngồi nghe ta nói hết câu. Ngươi là một trong số ít. Lần sau rảnh, ghé đây uống chén nước.', en: 'You know, in all of {place} few will sit and hear me out. You are one of the few. Next time you are free, come by for a cup of water.' },
    bye: { vi: 'Thôi, đừng bỏ phí thời giờ vì ta nữa. Đi đường bình an nhé.', en: 'Go on, do not waste your hours on me. Travel in peace.' },
  },
  {
    greet: { vi: '{greet} Trời hôm nay thế nào, ngươi cảm được không?', en: '{greet} Can you feel what the sky is doing today?' },
    threads: [
      { ask: { vi: 'Hỏi về linh khí trong vùng dạo này.', en: 'You ask about the region’s qi lately.' }, npc: { vi: 'Mỏng hơn trước. Người ta không để ý, nhưng ta làm {role} bao năm ở {place}, ta ngửi ra.', en: 'Thinner than before. Others do not notice, but I have been a {role} in {place} for years — I can smell it.' }, follow: { vi: 'Ngươi nói vậy ta mới để ý. Để ta tìm chỗ nào khí còn đọng mà ngồi.', en: 'Now that you say it, I notice too. I will find where the qi still pools and sit there.' } },
      { ask: { vi: 'Hỏi chuyện thời tiết và mùa màng.', en: 'You ask about the weather and the harvest.' }, npc: { vi: 'Mưa muộn ba tuần. Ruộng với rừng đều chịu, mà người chịu trước cả cây cỏ.', en: 'Rain three weeks late. Field and forest both suffer, but people suffer before the grass does.' }, follow: { vi: 'Ở đời là vậy. Cảm ơn ngươi đã thật lòng nói.', en: 'Such is life. Thank you for speaking plainly.' } },
      { ask: { vi: 'Nhờ ngươi xem giúp thời tiết đêm nay.', en: 'Ask me to read tonight’s weather for you.' }, npc: { vi: 'Trời quang, gió nhẹ — hợp đi xa. Nhưng đừng đi một mình qua chỗ vắng, {place} ban đêm có những thứ không cần đèn.', en: 'Clear sky, light wind — good for a long road. But do not cross empty places alone; at night {place} holds things that need no lamp.' }, follow: { vi: 'Ta sẽ đi cùng vài người. Ngươi cứ về sớm nghỉ.', en: 'I will take company, then. You go home early and rest.' } },
    ],
    deep: { vi: 'Người tu hành các ngươi nhìn trời để đoán mệnh. Bọn ta nhìn trời để đoán bữa cơm. Mà đôi khi bữa cơm lại là mệnh.', en: 'You cultivators read the sky to guess fate. We read the sky to guess supper. Sometimes supper is the fate.' },
    bye: { vi: 'Thôi để ngươi đi. Khi nào trời trở, ghé đây ta báo trước cho một tiếng.', en: 'Go on, then. When the weather turns, come by and I will warn you first.' },
  },
  {
    greet: { vi: '{greet} Ngồi xuống đã. Làm {role} ở {place} này, có người để nói chuyện là phúc.', en: '{greet} Sit down first. Being a {role} in {place}, having someone to talk to is a blessing.' },
    threads: [
      { ask: { vi: 'Hỏi vì sao ngươi chọn nghề này.', en: 'You ask why I chose this trade.' }, npc: { vi: 'Không chọn. Nó chọn ta. Hồi nhỏ ta chỉ muốn đi khỏi làng, cuối cùng lại đi vòng về đúng chỗ cũ.', en: 'I did not choose it. It chose me. As a boy I only wanted to leave the village, and in the end my road circled back to this exact spot.' }, follow: { vi: 'Vậy là ngươi đi một vòng để hiểu chỗ này. Cũng đáng.', en: 'So you went the whole way round to understand this place. Worth it.' } },
      { ask: { vi: 'Hỏi chuyện những người đã đi qua đây.', en: 'You ask about the people who passed through here.' }, npc: { vi: 'Nhiều lắm. Kẻ ở lại thì ít, người ra đi thì nhiều. Có người đi rồi gửi thư về, có người đi rồi gửi tên về.', en: 'Many. Few stay, most leave. Some who left sent letters back; some who left sent only their names.' }, follow: { vi: 'Ngươi kể toàn chuyện làm ta suy nghĩ. Ta sẽ nhớ mấy cái tên đó.', en: 'Every tale of yours makes me think. I will remember those names.' } },
      { ask: { vi: 'Hỏi xem ngươi có nhớ một người nào đặc biệt không.', en: 'You ask whether I remember anyone in particular.' }, npc: { vi: 'Nhớ chứ. Nhưng nhớ thì giữ trong lòng, đem ra nói hết thì thành người hay than. Ta không muốn thế.', en: 'Of course. But a memory is kept in the heart; tell all of it and you become a complainer. I do not wish to be that.' }, follow: { vi: 'Ngươi nói phải. Ta cũng có người chưa dám nhắc tên.', en: 'You are right. There is someone whose name I have never dared to say either.' } },
    ],
    deep: { vi: 'Ngươi mang linh căn phế mà vẫn ngồi đây nghe chuyện đời ta — điều đó nói lên nhiều hơn mấy câu ngươi vừa hỏi.', en: 'You carry a defective root and still sit here hearing my life — that says more than any question you just asked.' },
    bye: { vi: 'Đi đi. Hễ có đường xa lại ngang {place}, ghé ta chén nước.', en: 'Go. If the long road ever crosses {place} again, come by for a cup.' },
  },
  {
    greet: { vi: '{greet} Ừ, cái dáng của ngươi là biết vừa đi xa về. Có chuyện gì muốn hỏi?', en: '{greet} Mm. Your walk tells me you have come from far away. What is it you want to ask?' },
    threads: [
      { ask: { vi: 'Xin ngươi một lời khuyên cho người mới tu.', en: 'Ask me for one piece of advice for a new cultivator.' }, npc: { vi: 'Đừng chạy. Kẻ chạy nhanh nhất thường về đích sớm nhất trong... nghĩa địa. Đi chậm, giữ hơi, tính kỹ.', en: 'Do not run. The fastest runner is usually first across the finish line… in the graveyard. Walk slowly, keep your breath, count the cost.' }, follow: { vi: 'Ta nhớ lời này. Đi chậm mà đứng vững còn hơn chạy rồi ngã.', en: 'I will keep this. Slow and standing beats running and falling.' } },
      { ask: { vi: 'Hỏi ngươi thấy gì ở ta.', en: 'You ask what I see in you.' }, npc: { vi: 'Thấy một người chưa quen bị nhìn thẳng. Linh căn phế không làm ngươi khác — nó chỉ khiến người ta nhìn ngươi lâu hơn một chút.', en: 'I see someone unused to being looked at straight on. A defective root does not make you strange — it only makes people look a moment longer.' }, follow: { vi: 'Ngươi nhìn trúng đấy. Nhưng ta sẽ để họ nhìn lâu hơn nữa.', en: 'You looked closely. Then I will let them look even longer.' } },
      { ask: { vi: 'Hỏi thử có cách nào luyện mà đỡ tốn thuốc không.', en: 'You ask whether there is a way to train that wastes fewer medicines.' }, npc: { vi: 'Có: ngủ đủ, ăn đúng bữa, đừng đánh nhau khi đói. Nghe tầm thường, mà mười người thì chín bỏ ngoài tai.', en: 'There is: sleep enough, eat on time, do not fight hungry. Sounds ordinary, and nine people in ten stop hearing it.' }, follow: { vi: 'Ha, tưởng gì hóa ra là chuyện cơm. Ta sẽ thử.', en: 'Ha. I wondered — it is only meals after all. I will try.' } },
    ],
    deep: { vi: 'Này, đường của ngươi cong. Nhưng đường cong thì đi được lâu, vì ít ai đi trước mà cũng ít ai chặn được.', en: 'Listen — your road is crooked. But a crooked road is walked for a long time: few run ahead of it, and few can block it.' },
    bye: { vi: 'Thôi, ta không giữ ngươi nữa. {place} còn nhiều việc, mà ngươi cũng vậy.', en: 'I will not hold you. {place} has plenty left to do, and so do you.' },
  },
  {
    greet: { vi: '{greet} Nói nhỏ thôi — chuyện ta sắp kể không hợp với chỗ đông người.', en: '{greet} Keep it low — the story I am about to tell does not suit crowded places.' },
    threads: [
      { ask: { vi: 'Hỏi về chuyện lạ đêm hôm trước.', en: 'You ask about the strange business the other night.' }, npc: { vi: 'Có tiếng trong gió, không phải gió. Ta thức trắng, sáng ra thấy mấy con vật trong nhà đứng im quay mặt ra ngoài.', en: 'There was a sound in the wind, and it was not wind. I stayed awake, and by morning every animal in the house stood motionless, facing outward.' }, follow: { vi: 'Ngươi đừng lo, ta sẽ không tới gần chỗ đó lúc nửa đêm.', en: 'Do not worry — I will not go near that place at midnight.' } },
      { ask: { vi: 'Hỏi có ai từng gặp chuyện tương tự không.', en: 'You ask whether anyone has met the same thing.' }, npc: { vi: 'Có. Người đó kể xong thì đi luôn khỏi {place}, không quay lại lấy đồ. Nên ta cũng không kể nhiều đâu.', en: 'Someone did. He finished telling it and left {place} for good, never came back for his belongings. So I do not tell it often either.' }, follow: { vi: 'Hiểu rồi. Có những chuyện nên giữ trong bụng.', en: 'Understood. Some things are better left unsaid.' } },
      { ask: { vi: 'Xin ngươi một lá bùa hoặc vật giữ vía.', en: 'Ask me for a ward or something to steady your spirit.' }, npc: { vi: 'Ta không có bùa. Ta có cái này — đồ cũ của người từng đi qua đây. Giữ lấy, không cứu được ai, nhưng làm người ta thấy mình không đi một mình.', en: 'I have no wards. I have this — an old belonging of someone who passed through. Keep it. It saves nobody, but it makes you feel you are not walking alone.' }, follow: { vi: 'Ta nhận. Ơn này ta ghi để đó, sau sẽ trả.', en: 'I accept it. I will keep this kindness on the ledger and repay it later.' } },
    ],
    deep: { vi: 'Nhớ lấy: ở {place}, thứ đáng sợ không phải bóng tối. Nó là cái gì đó đứng trong bóng tối và biết tên ngươi.', en: 'Remember: in {place} the frightening thing is not the dark. It is what stands in the dark and knows your name.' },
    bye: { vi: 'Đừng kể lại chuyện này với ai. Đi đi, trời sắp tối rồi.', en: 'Do not repeat this to anyone. Go — it is nearly dark.' },
  },
  {
    greet: { vi: '{greet} Ngươi ăn gì chưa? Chưa thì nói thật, ta làm {role} ở {place} này cả ngày chỉ mong có người nói thật.', en: '{greet} Have you eaten? If not, say so truly — I have been a {role} in {place} all day, hoping only to meet one honest person.' },
    threads: [
      { ask: { vi: 'Thừa nhận là chưa ăn gì từ sáng.', en: 'Admit you have eaten nothing since morning.' }, npc: { vi: 'Lại một kẻ tu tiên quên cái bụng. Người ta bảo một bữa ăn nóng cứu được ba quyết định sai.', en: 'Another immortal who forgot their belly. They say one hot meal prevents three bad decisions.' }, follow: { vi: 'Ngươi nói làm ta thấy đói thật. Cảm ơn bữa chuyện này.', en: 'Now I am truly hungry. Thank you for this meal of talk.' } },
      { ask: { vi: 'Hỏi hôm nay ngươi ăn gì.', en: 'You ask what I ate today.' }, npc: { vi: 'Cháo loãng, muối vừng, và một câu chuyện cũ để nhắm. Đủ vị — đời người cần gì hơn ba vị.', en: 'Thin porridge, sesame salt, and an old story for seasoning. Enough flavor — what does a life need beyond three tastes?' }, follow: { vi: 'Ngươi biết sống đấy. Ta nên học cái này thay vì học thêm công pháp.', en: 'You know how to live. I should study this instead of another technique.' } },
      { ask: { vi: 'Hỏi chỗ nào trong vùng còn bán đồ ăn tử tế.', en: 'You ask where in the region one can still get an honest meal.' }, npc: { vi: 'Cuối chợ, cái quán có mái tranh. Chủ quán nhớ mặt khách ruột hơn nhớ mặt con mình. Ngươi gọi món gì cũng được, đừng gọi món lạ.', en: 'Far end of the market, the stall with the thatch roof. Its owner remembers regulars better than her own children’s faces. Order anything — just nothing unusual.' }, follow: { vi: 'Ta sẽ tìm ra. Lần sau kể lại xem có đúng như ngươi nói không.', en: 'I will find it. Next time I will tell you whether it was as you said.' } },
    ],
    deep: { vi: 'Lần sau ghé, đừng mang theo chuyện buồn. Mang bụng đói thôi — nhẹ người hơn nhiều.', en: 'Next time you visit, do not bring sad stories. Bring an empty belly only — it is far lighter to carry.' },
    bye: { vi: 'Đi ăn đi. Rồi đi tiếp con đường của ngươi. Hẹn gặp lại ở {place}.', en: 'Go and eat. Then go on with your road. We will meet again in {place}.' },
  },
]

const LEAVE_LABEL: Bi = { vi: 'Ta còn phải đi — hẹn gặp lại.', en: 'I still have to go — until next time.' }

/** Issue #39: what can actually be handed over — something owned, with a
 *  market value (junk, manuals and evidence are not gifts, and the engine
 *  refuses them, so the UI never offers them). Pure + exported: the test walks
 *  it without a DOM. */
export function giftableItemsFor(game: GameState): Array<{ itemId: string; qty: number }> {
  return Object.entries(game.inventory)
    .filter(([, qty]) => qty > 0)
    .map(([itemId, qty]) => ({ itemId, qty }))
    .filter((entry) => getItem(entry.itemId)?.sellPrice !== null && getItem(entry.itemId) !== undefined)
}

/**
 * Chọn mạch chung theo (npcId, locationId) — hash FNV-1a gọn, thuần tuý:
 * cùng vào ⇒ cùng index; lật locale không đổi mạch. Không Math.random (không
 * seed được, đổi mỗi lần render).
 */
export function genericPickIndex(npcId: string, locationId: string): number {
  let h = 2166136261
  const s = `${npcId}:${locationId}`
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) % GENERIC_CONVERSATIONS.length
}

export function buildGenericScript(c: Ctx, g: Generic): Script {
  // Lắp {name}/{role}/{place}/{greet} cho cả hai ngôn ngữ ngay lúc dựng script.
  const f = (s: Bi): Bi => ({ vi: fill(s.vi, ctxFor(c, 'vi')), en: fill(s.en, ctxFor(c, 'en')) })
  const mk = (text: Bi, choices: Choice[]): Node => ({ npc: c.name, text: f(text), choices })
  const leave: Choice = { label: f(LEAVE_LABEL), next: 'bye' }
  const bye: Node = { npc: c.name, text: f(g.bye), choices: [], end: true }
  const deep: Node = mk(g.deep, [leave])
  const script: Script = { start: mk(g.greet, []), deep, bye }
  g.threads.forEach((th, i) => {
    script[`mid${i}`] = mk(th.npc, [{ label: f(th.follow), next: 'deep' }, leave])
  })
  script.start = mk(g.greet, [...g.threads.map((th, i) => ({ label: f(th.ask), next: `mid${i}` })), leave])
  return script
}

export function NpcChatModal({ show, npcId, game, locale, onClose, onAction }: NpcChatModalProps) {
  const [key, setKey] = useState<string>('start')
  const [log, setLog] = useState<LogLine[]>([])
  const [bubbleSide, setBubbleSide] = useState<'left' | 'right' | null>(null)
  const [bubbleText, setBubbleText] = useState('')
  const [locked, setLocked] = useState(false)
  // Issue #39: the gift tray. '' = nothing picked yet; the id is a real
  // inventory slot key, so the option list and the engine see the same item.
  const [giftItemId, setGiftItemId] = useState<string>('')

  const locationId = game.player.locationId
  // Tách "chọn mạch nào" khỏi "ngôn ngữ nào". scriptData = mạch + tên chưa resolve,
  // chỉ phụ thuộc (npcId, locationId): lật locale KHÔNG đổi mạch, không restart hội
  // thoại. data = bản resolve theo locale, dẫn xuất từ scriptData.
  const scriptData = useMemo(() => {
    if (npcId === null) return undefined
    const scripted = SCRIPTS[npcId]
    if (scripted !== undefined) {
      return { name: scripted.name, youName: scripted.youName, script: scripted.script }
    }
    const ctx = npcCtx(npcId, locationId)
    const pick = GENERIC_CONVERSATIONS[genericPickIndex(npcId, locationId)] ?? GENERIC_CONVERSATIONS[0]!
    return { name: ctx.name, youName: YOU_NAME, script: buildGenericScript(ctx, pick) }
  }, [npcId, locationId])

  const data = useMemo(() => {
    if (scriptData === undefined) return undefined
    return {
      name: word(locale, scriptData.name),
      youName: word(locale, scriptData.youName),
      script: resolveScript(scriptData.script, locale),
    }
  }, [scriptData, locale])

  const node = data !== undefined ? data.script[key] : undefined
  // Log hiển thị đúng 1 câu NPC cuối (state `log` vẫn giữ toàn bộ history cho
  // bubble + logic choice). findLast không có trong lib ES22 → reverse+find.
  const lastNpcLine = [...log].reverse().find((l) => l.whoClass === 'npc')

  // Reset on open / npc change. Khoá theo scriptData (chưa resolve) — KHÔNG phải
  // data — nên lật locale không xoá log. data/locale đọc qua closure là cố ý:
  // câu chào giữ đúng ngôn ngữ lúc mở, dù sau đó người chơi đổi ngôn ngữ giữa chừng.
  // ponytail: move choices đổi locationId → scriptData đổi → restart với NPC generic;
  // với NPC scripted locationId không được dùng nhưng vẫn nằm trong dep. Pre-existing;
  // tách memo theo nhánh nếu cần hết restart giữa tay.
  useEffect(() => {
    if (!show || npcId === null || data === undefined) return
    setKey('start')
    setLog([])
    setGiftItemId('')
    setBubbleSide('right')
    setBubbleText('…')
    const timers: number[] = []
    timers.push(
      window.setTimeout(() => {
        setBubbleSide(null)
        const start = data.script.start
        if (start !== undefined) {
          setLog([{ who: data.name, whoClass: 'npc', text: start.text }])
          setBubbleSide('right')
          setBubbleText(start.text)
          timers.push(window.setTimeout(() => setBubbleSide(null), 1800))
        }
      }, 380),
    )
    return () => {
      for (const id of timers) window.clearTimeout(id)
    }
  }, [show, npcId, scriptData])

  if (!show || npcId === null || data === undefined) return null

  // Issue #39: what the pack can actually offer. Plain call, not useMemo — the
  // gift list is a handful of inventory keys and recomputing per render is
  // cheaper than the dependency array; the memo here would also have to live
  // above the early return to obey the hooks order.
  const giftable = giftableItemsFor(game)
  const rapport = getAffection(game, npcId)

  const handleChoice = (choice: ChatChoice) => {
    if (locked) return
    setLocked(true)
    // Dispatch action nếu có
    if (choice.action !== undefined) onAction(choice.action)
    // Append player line
    setLog((prev) => [...prev, { who: data.youName, whoClass: 'you', text: choice.label }])
    setBubbleSide('left')
    setBubbleText(choice.label)
    window.setTimeout(() => {
      const target = choice.next !== undefined ? data.script[choice.next] : undefined
      const endNode = target?.end === true ? target : data.script['bye']
      if (target !== undefined && !target.end) {
        setKey(choice.next!)
        setLog((prev) => [...prev, { who: data.name, whoClass: 'npc', text: target.text }])
        setBubbleSide('right')
        setBubbleText(target.text)
        window.setTimeout(() => {
          setBubbleSide(null)
          setLocked(false)
        }, 1800)
      } else if (endNode !== undefined) {
        setKey(choice.next ?? 'bye')
        setLog((prev) => [...prev, { who: data.name, whoClass: 'npc', text: endNode.text }])
        setBubbleSide('right')
        setBubbleText(endNode.text)
        window.setTimeout(() => {
          setBubbleSide(null)
          setLocked(false)
        }, 1800)
      }
    }, 520)
  }

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  // Issue #39: the gift dispatch. The engine owns numbers (affinity, inventory
  // consumption); the modal only speaks the NPC's authored reaction over the
  // chat log — same {item} fill the reducer uses, so bubble and chronicle
  // never disagree.
  const handleGift = () => {
    if (locked || npcId === null || giftItemId === '') return
    const item = getItem(giftItemId)
    if (item === undefined) return
    setLocked(true)
    onAction({ kind: 'gift', npcId, itemId: giftItemId })
    const itemName = locale === 'vi' ? item.nameVi : item.nameEn
    const youLine = locale === 'vi' ? `Ta tặng ${itemName}` : `I gift ${itemName}`
    setLog((prev) => [...prev, { who: data.youName, whoClass: 'you', text: youLine }])
    setBubbleSide('left')
    setBubbleText(youLine)
    setGiftItemId('')
    const reaction = giftReactionFor(npcId)
    // Same {item} fill the reducer applies — bubble and chronicle never disagree.
    const reply = reaction?.[locale].replaceAll('{item}', itemName) ?? ''
    window.setTimeout(() => {
      setBubbleSide('right')
      setBubbleText(reply)
      setLog((prev) => [...prev, { who: data.name, whoClass: 'npc', text: reply }])
      window.setTimeout(() => {
        setBubbleSide(null)
        setLocked(false)
      }, 1800)
    }, 520)
  }

  return (
    <div className="proto-modal-backdrop show" role="dialog" aria-modal="true" aria-label={word(locale, { vi: 'Trò chuyện cùng NPC', en: 'Chat with the villager' })} onClick={handleBackdrop}>
      <div className="proto-modal chat" data-od-id="chat-modal">
        {/* Issue #38 — Escape already closes the chat (ProtoShell key chain), but
            nothing said so. Show the hint like the story/journal panels do. */}
        <button className="x" type="button" onClick={onClose} aria-label={word(locale, { vi: 'Đóng (Esc)', en: 'Close (Esc)' })}>✕ <kbd aria-hidden="true">Esc</kbd></button>
        <div className="chat-stage" aria-hidden="true">
          <div className="mist" />
          <div className="floor" />
          <div className="char left">
            <div className={`speech-bubble left${bubbleSide === 'left' ? ' show' : ''}`}>{bubbleText}</div>
            <div className="body">
              <div
                className="face"
                style={{ backgroundImage: `url(${playerArtFor('idle')}), radial-gradient(circle at 50% 38%, oklch(82% 0.06 70) 0 30%, oklch(34% 0.10 25) 32% 100%)`, backgroundSize: 'cover, auto', backgroundPosition: 'center, center' }}
              />
              <div className="robe" />
            </div>
            <div className="nameplate">{data.youName}</div>
          </div>
          <div className="char right">
            <div className={`speech-bubble right${bubbleSide === 'right' ? ' show' : ''}`}>{bubbleText}</div>
            <div className="body">
              <div
                className="face"
                style={{ backgroundImage: `url(${npcPortraitFor(npcId)}), radial-gradient(circle at 50% 38%, oklch(82% 0.06 70) 0 30%, oklch(34% 0.10 25) 32% 100%)`, backgroundSize: 'cover, auto', backgroundPosition: 'center, center' }}
              />
              <div className="robe" />
            </div>
            <div className="nameplate">
              {data.name}
              {/* Issue #39: the rapport number lives where the gift is handed,
                  not only in the people list — AC1 asks for a visible counter. */}
              <span className="nameplate__aff" data-testid="chat-rapport" aria-label={word(locale, { vi: `Hảo cảm ${String(rapport)}`, en: `Rapport ${String(rapport)}` })}>♥ {String(rapport)}</span>
            </div>
          </div>
        </div>
        <div className="chat-bottom">
          <div className="chat-log" aria-live="polite">
            {lastNpcLine !== undefined && (
              <div className="line">
                <span className={`who ${lastNpcLine.whoClass}`}>{lastNpcLine.who}</span>
                <span className="text">{lastNpcLine.text}</span>
              </div>
            )}
          </div>
          <div className="chat-choices">
            {giftable.length > 0 && (
              <div className="chat-gift" data-testid="gift-tray">
                <label className="label" htmlFor="gift-select">{word(locale, { vi: 'Tặng vật', en: 'Gift' })}</label>
                <select
                  id="gift-select"
                  data-testid="gift-select"
                  value={giftItemId}
                  onChange={(e) => setGiftItemId(e.target.value)}
                >
                  <option value="">{word(locale, { vi: '— chọn món đồ —', en: '— pick an item —' })}</option>
                  {giftable.map((g) => {
                    const item = getItem(g.itemId)
                    const name = item === undefined ? g.itemId : (locale === 'vi' ? item.nameVi : item.nameEn)
                    return <option key={g.itemId} value={g.itemId}>{`${name} ×${g.qty}`}</option>
                  })}
                </select>
                <button type="button" data-testid="gift-send" disabled={locked || giftItemId === ''} onClick={handleGift}>
                  {word(locale, { vi: 'Dâng quà', en: 'Present gift' })}
                </button>
              </div>
            )}
            {node?.end === true ? (
              <>
                <div className="label">{word(locale, { vi: 'Cuộc trò chuyện đã kết thúc', en: 'This conversation has ended' })}</div>
                <div className="chat-end">{word(locale, { vi: '— Hãy gặp lại sau —', en: '— Meet again another day —' })}</div>
              </>
            ) : (
              <>
                <div className="label">{word(locale, { vi: 'Đạo hữu đáp lời', en: 'You reply' })}</div>
                {node?.choices.map((c, i) => (
                  <button key={i} type="button" data-chat-choice={i + 1} disabled={locked} onClick={() => handleChoice(c)}>
                    <span className="k">{i + 1}</span><span className="msg">{c.label}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
