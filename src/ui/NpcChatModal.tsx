import { useEffect, useMemo, useState } from 'react'
import type { Action, GameState, Locale } from '../engine'
import { getNpc, getLocation } from '../content'
import { npcPortraitFor } from './npcArt'
import { playerArtFor } from './playerArt'

/* =========================================================================
 *  NPC Chat Modal — 2 nhân vật (player left, NPC right) + dialogue log
 *  Wire thật vào engine: choice → onAction({ kind, ... })
 *  Đồng bộ với prototype phe-can-ky-ui-prototype.html (chat modal).
 * ========================================================================= */

export interface NpcChatModalProps {
  show: boolean
  npcId: string | null
  game: GameState
  locale: Locale
  onClose: () => void
  onAction: (action: Action) => void
}

type Choice = { label: string; next?: string; action?: Action }
type Node = { npc: string; text: string; choices: Choice[]; end?: boolean }
type Script = Record<string, Node>

/* Script cho 3 NPC. Mỗi choice có thể dispatch action thật vào engine. */
const SCRIPTS: Record<string, { name: string; title: string; youName: string; script: Script }> = {
  n_merchant_bao: {
    name: 'Lão Bạch',
    title: 'Thương nhân · Làng Thanh Mộc',
    youName: 'Lâm Phàm',
    script: {
      start: {
        npc: 'Lão Bạch',
        text: 'Ồ, tiểu đạo hữu sáng sớm đã dậy sớm nhỉ. Có muốn xem qua mấy bình Tụ Khí Đan ta mới lấy từ trấn trên không? Hôm nay giảm giá cho người quen, chỉ 8 bạc thôi.',
        choices: [
          { label: 'Mua một bình — đang cần để tu luyện.', next: 'buy', action: { kind: 'buy', itemId: 'pill_qi', qty: 1 } },
          { label: 'Hỏi thăm tin tức kỳ ngộ gần đây.', next: 'rumor' },
          { label: 'Lắc đầu — tạm không cần.', next: 'decline' },
        ],
      },
      buy: {
        npc: 'Lão Bạch',
        text: 'Khôn ngoan đó. Đan này tuy hạ phẩm, nhưng với người mới nhập đạo thì vừa đủ. À, tiện thể ta kể ngươi nghe — sáng nay có thương đội ngoài Bắc đi qua, nghe nói trong đoàn có một bình Hỗn Nguyên Đan trân quý lắm…',
        choices: [
          { label: 'Hỏi thêm về bình Hỗn Nguyên Đan.', next: 'rumor' },
          { label: 'Cảm ơn lão — hẹn ngày sau quay lại.', next: 'bye' },
        ],
      },
      rumor: {
        npc: 'Lão Bạch',
        text: 'Tin tức thì có một — phía bắc khe suối, gần nơi mà Trần Bất Danh hay lui tới, mấy đêm nay yêu khí tăng mạnh. Đạo hữu đi săn bắt cẩn thận, đừng chủ quan.',
        choices: [
          { label: 'Ghi nhận — sẽ đề phòng.', next: 'bye' },
          { label: 'Tạm biệt lão Bạch.', next: 'bye' },
        ],
      },
      decline: {
        npc: 'Lão Bạch',
        text: 'Không sao, không ép. Mua bán là duyên, có duyên sẽ gặp lại. Đạo hữu đi đường cẩn thận, trên sơn đạo vừa có dấu yêu khí mới xuất hiện…',
        choices: [{ label: 'Cảm ơn lão, tạm biệt.', next: 'bye' }],
      },
      bye: { end: true, npc: 'Lão Bạch', text: 'Hẹn gặp lại đạo hữu. Đi đường bình an.', choices: [] },
    },
  },
  n_hermit_coc: {
    name: 'Trần Bất Danh',
    title: 'Tu sĩ lang thang',
    youName: 'Lâm Phàm',
    script: {
      start: {
        npc: 'Trần Bất Danh',
        text: 'Đạo hữu! Ta đang tìm người cùng lên đỉnh Vọng Nguyệt. Đêm qua ta mơ thấy một tia sáng xanh lục từ trên trời rơi xuống — hẳn là dị tượng. Ngươi có muốn đi cùng không?',
        choices: [
          { label: 'Đồng ý — đi cùng ngươi.', next: 'agree', action: { kind: 'move', direction: 'north' } },
          { label: 'Từ chối — ta còn phải tu luyện.', next: 'refuse' },
          { label: 'Hỏi thêm về tia sáng ấy.', next: 'ask' },
        ],
      },
      agree: {
        npc: 'Trần Bất Danh',
        text: 'Tốt! Đi đường nhớ giữ sức, ta sẽ dẫn đường qua mỏm đá phía đông. Đến nơi rồi ta chia nhau tìm kiếm — gặp nguy hiểm thì huýt sáo, ngươi sẽ nghe tiếng ta đáp lại.',
        choices: [{ label: 'Gật đầu — khởi hành thôi.', next: 'bye' }],
      },
      refuse: {
        npc: 'Trần Bất Danh',
        text: 'Tiếc thật. Vậy ta đi một mình. Nếu có tin tức gì từ bí cảnh, ta sẽ báo lại cho ngươi biết. Đừng bỏ lỡ cơ duyên lần sau nhé.',
        choices: [{ label: 'Cảm ơn — hẹn gặp lại.', next: 'bye' }],
      },
      ask: {
        npc: 'Trần Bất Danh',
        text: 'Tia sáng ấy… theo ta đoán, hẳn là một mảnh pháp bảo cổ xưa rơi xuống từ tầng trời. Loại này ba trăm năm mới xuất hiện một lần, nếu nhặt được thì cảnh giới có thể đề thăng hai ba tầng. Nhưng — yêu khí cũng theo đó mà tăng mạnh. Ngươi quyết định đi chứ?',
        choices: [
          { label: 'Đồng ý đi cùng — cơ duyên khó cầu.', next: 'agree', action: { kind: 'move', direction: 'north' } },
          { label: 'Vẫn từ chối — cần chuẩn bị thêm.', next: 'refuse' },
        ],
      },
      bye: { end: true, npc: 'Trần Bất Danh', text: 'Hành trang giữ vững, kiếm khí thuần khiết. Gặp lại sau.', choices: [] },
    },
  },
  n_alchemist_sam: {
    name: 'Bạch Lạc Vi',
    title: 'Luyện đan sư',
    youName: 'Lâm Phàm',
    script: {
      start: {
        npc: 'Bạch Lạc Vi',
        text: 'Ngươi tới rồi. Ta vừa luyện xong một lô Tụ Khí Đan trung phẩm, nếu ngươi cần thì để giá hữu nghị. Mà — trước hết, ngươi có muốn học cách phân biệt dược liệu không?',
        choices: [
          { label: 'Xin học — rất cần kiến thức này.', next: 'learn', action: { kind: 'learn_technique', techniqueId: 'crooked_circulation' } },
          { label: 'Hỏi thăm về đan phương Hỗn Nguyên.', next: 'recipe' },
          { label: 'Tạm thời không — hẹn lần sau.', next: 'decline' },
        ],
      },
      learn: {
        npc: 'Bạch Lạc Vi',
        text: 'Được. Ngươi nhìn ba cây thảo trước mặt: cây thứ nhất gân xanh, lá cong; cây thứ hai thân tím, lá thẳng; cây thứ hai mà có mùi hắc thì là Thanh Liên thật, còn lại là giả. Nhớ kỹ — luyện đan sai một ly là hỏng cả lô.',
        choices: [
          { label: 'Ghi nhớ, cảm ơn sư tỷ.', next: 'bye' },
          { label: 'Hỏi thêm công thức đan.', next: 'recipe' },
        ],
      },
      recipe: {
        npc: 'Bạch Lạc Vi',
        text: 'Hỗn Nguyên Đan cần bảy vị: Thanh Liên, Hỏa Chi Ma, Băng Tâm Hoa, Tụ Khí Thảo, Hắc Thổ, Tinh Hồ, và một giọt Tâm Huyết Đan Sư. Đan phương này chỉ truyền miệng, không có sách. Nếu ngươi tìm đủ bảy vị, quay lại đây — ta sẽ luyện giúp.',
        choices: [
          { label: 'Cảm ơn sư tỷ — ta sẽ tìm.', next: 'bye' },
          { label: 'Hỏi nơi tìm Tinh Hồ.', next: 'learn' },
        ],
      },
      decline: {
        npc: 'Bạch Lạc Vi',
        text: 'Không vội. Đan đạo cần tâm, tâm không yên thì luyện cũng phí. Khi nào ngươi sẵn sàng, cứ quay lại lò đan này.',
        choices: [{ label: 'Gật đầu, tạm biệt sư tỷ.', next: 'bye' }],
      },
      bye: { end: true, npc: 'Bạch Lạc Vi', text: 'Đan khí thuần hư, tâm địa bình an. Hẹn tái ngộ.', choices: [] },
    },
  },
}

interface LogLine { who: string; whoClass: 'npc' | 'you'; text: string }

/* =========================================================================
 *  Hội thoại chung — mọi NPC chưa có script rẽ nhánh vẫn có chuyện để nói.
 *  Mỗi lần mở khung chat chọn ngẫu nhiên 1 trong 6 mạch (seed 1 lần/open).
 *  Lời thoại template theo {name}/{role}/{place}/{greet} nên đọc tự nhiên
 *  với bất kỳ NPC nào. Mỗi mạch 6 node: start → 3 nhánh → deep → bye.
 * ========================================================================= */

type Ctx = { name: string; role: string; place: string; greet: string }
type Thread = { ask: string; npc: string; follow: string }
type Generic = { greet: string; threads: Thread[]; deep: string; bye: string }

const t = (s: string, c: Ctx): string =>
  s.replaceAll('{name}', c.name).replaceAll('{role}', c.role).replaceAll('{place}', c.place).replaceAll('{greet}', c.greet)

const GENERIC_CONVERSATIONS: Generic[] = [
  {
    greet: '{greet} Ngươi tới đúng lúc — ta đang buồn miệng lắm.',
    threads: [
      { ask: 'Ngươi hỏi thăm sức khỏe của ta.', npc: 'Khá. Đêm ngủ được bốn canh, sáng dậy còn thấy đói — với kẻ làm {role} ở {place} thế là sang lắm rồi.', follow: 'Vậy là ta yên tâm. Ngươi cứ giữ cái phúc đó.' },
      { ask: 'Hỏi đường sá ra vào vùng này có còn yên không.', npc: 'Yên thì không hẳn, nhưng chưa đến nỗi. Dạo này người qua {place} đông hơn, ai cũng vội, ai cũng ôm một bí mật.', follow: 'Ta ghi nhớ. Đi đường thì cứ nhìn sắc người mà tránh.' },
      { ask: 'Hỏi xem gần đây có tin đồn gì mới.', npc: 'Có một tin — nghe đâu chỗ cũ có động tĩnh lạ. Tin đồn ở {place} lan nhanh hơn gió, mà cũng bay nhanh hơn gió.', follow: 'Cảm ơn ngươi đã kể. Ta sẽ tự mắt thấy tai nghe rồi hãy tin.' },
    ],
    deep: 'Ngươi biết không, cả {place} này ít ai chịu ngồi nghe ta nói hết câu. Ngươi là một trong số ít. Lần sau rảnh, ghé đây uống chén nước.',
    bye: 'Thôi, đừng bỏ phí thời giờ vì ta nữa. Đi đường bình an nhé.',
  },
  {
    greet: '{greet} Trời hôm nay thế nào, ngươi cảm được không?',
    threads: [
      { ask: 'Hỏi về linh khí trong vùng dạo này.', npc: 'Mỏng hơn trước. Người ta không để ý, nhưng ta làm {role} bao năm ở {place}, ta ngửi ra.', follow: 'Ngươi nói vậy ta mới để ý. Để ta tìm chỗ nào khí còn đọng mà ngồi.' },
      { ask: 'Hỏi chuyện thời tiết và mùa màng.', npc: 'Mưa muộn ba tuần. Ruộng với rừng đều chịu, mà người chịu trước cả cây cỏ.', follow: 'Ở đời là vậy. Cảm ơn ngươi đã thật lòng nói.' },
      { ask: 'Nhờ ngươi xem giúp thời tiết đêm nay.', npc: 'Trời quang, gió nhẹ — hợp đi xa. Nhưng đừng đi một mình qua chỗ vắng, {place} ban đêm có những thứ không cần đèn.', follow: 'Ta sẽ đi cùng vài người. Ngươi cứ về sớm nghỉ.' },
    ],
    deep: 'Người tu hành các ngươi nhìn trời để đoán mệnh. Bọn ta nhìn trời để đoán bữa cơm. Mà đôi khi bữa cơm lại là mệnh.',
    bye: 'Thôi để ngươi đi. Khi nào trời trở, ghé đây ta báo trước cho một tiếng.',
  },
  {
    greet: '{greet} Ngồi xuống đã. Làm {role} ở {place} này, có người để nói chuyện là phúc.',
    threads: [
      { ask: 'Hỏi vì sao ngươi chọn nghề này.', npc: 'Không chọn. Nó chọn ta. Hồi nhỏ ta chỉ muốn đi khỏi làng, cuối cùng lại đi vòng về đúng chỗ cũ.', follow: 'Vậy là ngươi đi một vòng để hiểu chỗ này. Cũng đáng.' },
      { ask: 'Hỏi chuyện những người đã đi qua đây.', npc: 'Nhiều lắm. Kẻ ở lại thì ít, người ra đi thì nhiều. Có người đi rồi gửi thư về, có người đi rồi gửi tên về.', follow: 'Ngươi kể toàn chuyện làm ta suy nghĩ. Ta sẽ nhớ mấy cái tên đó.' },
      { ask: 'Hỏi xem ngươi có nhớ một người nào đặc biệt không.', npc: 'Nhớ chứ. Nhưng nhớ thì giữ trong lòng, đem ra nói hết thì thành người hay than. Ta không muốn thế.', follow: 'Ngươi nói phải. Ta cũng có người chưa dám nhắc tên.' },
    ],
    deep: 'Ngươi mang linh căn phế mà vẫn ngồi đây nghe chuyện đời ta — điều đó nói lên nhiều hơn mấy câu ngươi vừa hỏi.',
    bye: 'Đi đi. Hễ có đường xa lại ngang {place}, ghé ta chén nước.',
  },
  {
    greet: '{greet} Ừ, cái dáng của ngươi là biết vừa đi xa về. Có chuyện gì muốn hỏi?',
    threads: [
      { ask: 'Xin ngươi một lời khuyên cho người mới tu.', npc: 'Đừng chạy. Kẻ chạy nhanh nhất thường về đích sớm nhất trong... nghĩa địa. Đi chậm, giữ hơi, tính kỹ.', follow: 'Ta nhớ lời này. Đi chậm mà đứng vững còn hơn chạy rồi ngã.' },
      { ask: 'Hỏi ngươi thấy gì ở ta.', npc: 'Thấy một người chưa quen bị nhìn thẳng. Linh căn phế không làm ngươi khác — nó chỉ khiến người ta nhìn ngươi lâu hơn một chút.', follow: 'Ngươi nhìn trúng đấy. Nhưng ta sẽ để họ nhìn lâu hơn nữa.' },
      { ask: 'Hỏi thử có cách nào luyện mà đỡ tốn thuốc không.', npc: 'Có: ngủ đủ, ăn đúng bữa, đừng đánh nhau khi đói. Nghe tầm thường, mà mười người thì chín bỏ ngoài tai.', follow: 'Ha, tưởng gì hóa ra là chuyện cơm. Ta sẽ thử.' },
    ],
    deep: 'Này, đường của ngươi cong. Nhưng đường cong thì đi được lâu, vì ít ai đi trước mà cũng ít ai chặn được.',
    bye: 'Thôi, ta không giữ ngươi nữa. {place} còn nhiều việc, mà ngươi cũng vậy.',
  },
  {
    greet: '{greet} Nói nhỏ thôi — chuyện ta sắp kể không hợp với chỗ đông người.',
    threads: [
      { ask: 'Hỏi về chuyện lạ đêm hôm trước.', npc: 'Có tiếng trong gió, không phải gió. Ta thức trắng, sáng ra thấy mấy con vật trong nhà đứng im quay mặt ra ngoài.', follow: 'Ngươi đừng lo, ta sẽ không tới gần chỗ đó lúc nửa đêm.' },
      { ask: 'Hỏi có ai từng gặp chuyện tương tự không.', npc: 'Có. Người đó kể xong thì đi luôn khỏi {place}, không quay lại lấy đồ. Nên ta cũng không kể nhiều đâu.', follow: 'Hiểu rồi. Có những chuyện nên giữ trong bụng.' },
      { ask: 'Xin ngươi một lá bùa hoặc vật giữ vía.', npc: 'Ta không có bùa. Ta có cái này — đồ cũ của người từng đi qua đây. Giữ lấy, không cứu được ai, nhưng làm người ta thấy mình không đi một mình.', follow: 'Ta nhận. Ơn này ta ghi để đó, sau sẽ trả.' },
    ],
    deep: 'Nhớ lấy: ở {place}, thứ đáng sợ không phải bóng tối. Nó là cái gì đó đứng trong bóng tối và biết tên ngươi.',
    bye: 'Đừng kể lại chuyện này với ai. Đi đi, trời sắp tối rồi.',
  },
  {
    greet: '{greet} Ngươi ăn gì chưa? Chưa thì nói thật, ta làm {role} ở {place} này cả ngày chỉ mong có người nói thật.',
    threads: [
      { ask: 'Thừa nhận là chưa ăn gì từ sáng.', npc: 'Lại một kẻ tu tiên quên cái bụng. Người ta bảo một bữa ăn nóng cứu được ba quyết định sai.', follow: 'Ngươi nói làm ta thấy đói thật. Cảm ơn bữa chuyện này.' },
      { ask: 'Hỏi hôm nay ngươi ăn gì.', npc: 'Cháo loãng, muối vừng, và một câu chuyện cũ để nhắm. Đủ vị — đời người cần gì hơn ba vị.', follow: 'Ngươi biết sống đấy. Ta nên học cái này thay vì học thêm công pháp.' },
      { ask: 'Hỏi chỗ nào trong vùng còn bán đồ ăn tử tế.', npc: 'Cuối chợ, cái quán có mái tranh. Chủ quán nhớ mặt khách ruột hơn nhớ mặt con mình. Ngươi gọi món gì cũng được, đừng gọi món lạ.', follow: 'Ta sẽ tìm ra. Lần sau kể lại xem có đúng như ngươi nói không.' },
    ],
    deep: 'Lần sau ghé, đừng mang theo chuyện buồn. Mang bụng đói thôi — nhẹ người hơn nhiều.',
    bye: 'Đi ăn đi. Rồi đi tiếp con đường của ngươi. Hẹn gặp lại ở {place}.',
  },
]

function buildGenericScript(c: Ctx, g: Generic): Script {
  const mk = (text: string, choices: Choice[]): Node => ({ npc: c.name, text: t(text, c), choices })
  const leave: Choice = { label: 'Ta còn phải đi — hẹn gặp lại.', next: 'bye' }
  const bye: Node = { npc: c.name, text: t(g.bye, c), choices: [], end: true }
  const deep: Node = mk(g.deep, [leave])
  const script: Script = { start: mk(g.greet, []), deep, bye }
  g.threads.forEach((th, i) => {
    script[`mid${i}`] = mk(th.npc, [{ label: t(th.follow, c), next: 'deep' }, leave])
  })
  script.start = mk(g.greet, [...g.threads.map((th, i) => ({ label: t(th.ask, c), next: `mid${i}` })), leave])
  return script
}

export function NpcChatModal({ show, npcId, game, onClose, onAction }: NpcChatModalProps) {
  const [key, setKey] = useState<string>('start')
  const [log, setLog] = useState<LogLine[]>([])
  const [bubbleSide, setBubbleSide] = useState<'left' | 'right' | null>(null)
  const [bubbleText, setBubbleText] = useState('')
  const [locked, setLocked] = useState(false)

  const locationId = game.player.locationId
  // Script dùng chung cho cả render lẫn effect: NPC có script rẽ nhánh thì giữ
  // nguyên, không thì dựng một mạch ngẫu nhiên từ pool (đổi mỗi lần mở chat).
  const data = useMemo(() => {
    if (npcId === null) return undefined
    const scripted = SCRIPTS[npcId]
    if (scripted !== undefined) return scripted
    const npc = getNpc(npcId)
    const ctx: Ctx = {
      name: npc?.nameVi ?? npc?.roleVi ?? npcId,
      role: npc?.roleVi ?? 'kẻ qua đường',
      place: getLocation(locationId)?.nameVi ?? 'vùng này',
      greet: npc?.greetVi ?? 'Ừ, ngươi tới đấy à.',
    }
    const pick = GENERIC_CONVERSATIONS[Math.floor(Math.random() * GENERIC_CONVERSATIONS.length)] ?? GENERIC_CONVERSATIONS[0]!
    return { name: ctx.name, youName: 'Lâm Phàm', script: buildGenericScript(ctx, pick) }
  }, [npcId, locationId])

  const node = data !== undefined ? data.script[key] : undefined
  // Log hiển thị đúng 1 câu NPC cuối (state `log` vẫn giữ toàn bộ history cho
  // bubble + logic choice). findLast không có trong lib ES22 → reverse+find.
  const lastNpcLine = [...log].reverse().find((l) => l.whoClass === 'npc')

  // Reset on open / npc change
  useEffect(() => {
    if (!show || npcId === null || data === undefined) return
    setKey('start')
    setLog([])
    setBubbleSide('right')
    setBubbleText('…')
    const greetTimer = window.setTimeout(() => {
      setBubbleSide(null)
      const start = data.script.start
      if (start !== undefined) {
        setLog([{ who: data.name, whoClass: 'npc', text: start.text }])
        setBubbleSide('right')
        setBubbleText(start.text)
        const flash = window.setTimeout(() => setBubbleSide(null), 1800)
        return () => window.clearTimeout(flash)
      }
      return undefined
    }, 380)
    return () => window.clearTimeout(greetTimer)
  }, [show, npcId, data])

  if (!show || npcId === null || data === undefined) return null

  const handleChoice = (choice: Choice) => {
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

  return (
    <div className="proto-modal-backdrop show" role="dialog" aria-modal="true" aria-label="Trò chuyện cùng NPC" onClick={handleBackdrop}>
      <div className="proto-modal chat" data-od-id="chat-modal">
        <button className="x" type="button" onClick={onClose} aria-label="Đóng">✕</button>
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
            <div className="nameplate">{data.name}</div>
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
            {node?.end === true ? (
              <>
                <div className="label">Cuộc trò chuyện đã kết thúc</div>
                <div className="chat-end">— Hãy gặp lại sau —</div>
              </>
            ) : (
              <>
                <div className="label">Đạo hữu đáp lời</div>
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
