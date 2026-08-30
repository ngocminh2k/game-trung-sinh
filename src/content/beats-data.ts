import type { BeatDef } from '../engine/content-types'

/**
 * Story beats use these stable milestones rather than ad-hoc strings.  The
 * reducer remains the sole owner of the state each milestone reads; this list
 * only makes authored content and the beat evaluator agree at build time.
 */
export const BEAT_PREDICATE_IDS = [
  'freshArrival',
  'movedOnce',
  'gatheredSome',
  'marketSeenOrSold',
  'talismanQuestActive',
  'herbQuestDone',
  'storageUsed',
  'caveSeen',
  'encounterVictory',
  'stageTwoPlus',
  'tradeWinds',
  'equippedAdvanced',
  'knowsCrookedCirculation',
  'lotteryPlayed',
  'stageThreePlus',
  'stageFourPlus',
  'stageFive',
  'always',
] as const

export type BeatPredicateId = (typeof BEAT_PREDICATE_IDS)[number]

export const BEATS: Array<BeatDef & { predicate: BeatPredicateId }> = [
  {
    id: 'b_arrival',
    chapter: 1,
    predicate: 'freshArrival',
    titleVi: 'Trọng sinh ở làng Thanh Mộc',
    titleEn: 'Reborn in Greenwood Village',
    textVi:
      'Ngươi mở mắt trên chiếc giường rơm quen thuộc. Qua một kiếp, linh căn vẫn phế như xưa; chỉ có lòng ngươi không còn chịu cúi đầu. Bên cửa, chiếc giỏ hái thuốc đã được đan xong.',
    textEn:
      'You wake on the familiar straw bed. This life or the last, the spirit root stays crooked. But today, the herb basket is finally woven.',
    suggested: [
      { kind: 'move', direction: 'west' },
      { kind: 'talk', npcId: 'n_elder_meihua' },
      { kind: 'rest' },
    ],
  },
  {
    id: 'b_first_steps',
    chapter: 1,
    predicate: 'movedOnce',
    titleVi: 'Bước chân đầu tiên ra thế giới',
    titleEn: 'First Steps Into the World',
    textVi:
      'Con đường đất còn đẫm sương. Ngươi siết chặt túi tiền lép kẹp, nghe tiếng chuông chợ vọng về từ phía tây.',
    textEn:
      'The road still holds the morning mist. You clutch your coin purse and listen to the market bell to the west.',
    suggested: [
      { kind: 'move', direction: 'south' },
      { kind: 'move', direction: 'west' },
      { kind: 'gather' },
    ],
  },
  {
    id: 'b_flawed_root',
    chapter: 2,
    predicate: 'gatheredSome',
    titleVi: 'Linh căn khuyết lên tiếng',
    titleEn: 'The Flawed Root Speaks Up',
    textVi:
      'Linh khí vận hành lệch một nhịp, rồi lại lệch thêm. Linh căn hỗn tạp chỉ giữ nổi nửa phần công lực, nhưng nửa phần ấy là của chính ngươi.',
    textEn:
      'Your qi skips a beat, then another. The muddled root draws only half the usual power — but that half is honest.',
    suggested: [
      { kind: 'train' },
      { kind: 'use_item', itemId: 'pill_hp' },
      { kind: 'rest' },
    ],
  },
  {
    id: 'b_market_rumors',
    chapter: 2,
    predicate: 'marketSeenOrSold',
    titleVi: 'Tin đồn ở chợ Vân Tập',
    titleEn: 'Rumors at Cloudgather Market',
    textVi:
      'Giữa tiếng rao hàng chen chúc, có người hạ giọng nhắc đến hang phong ấn và một quyển bí kíp chỉ nhận kẻ có linh căn khác thường.',
    textEn:
      'Between hawkers\u2019 cries, someone whispers of a sealed cave and a manual for unconventional roots.',
    suggested: [
      { kind: 'accept_quest', questId: 'q_herb_delivery' },
      { kind: 'move', direction: 'east' },
      { kind: 'talk', npcId: 'n_merchant_bao' },
    ],
  },
  {
    id: 'b_two_paths',
    chapter: 2,
    predicate: 'talismanQuestActive',
    titleVi: 'Hai lối đi của một tấm bùa',
    titleEn: 'Two Roads, One Talisman',
    textVi:
      'Đơn bùa của họ Vân nằm trong tay ngươi. Bán nó cho chợ là tiền ngay; giao cho Bảo là chữ tín. Đạo tu hành, hóa ra cũng bắt đầu từ những lựa chọn nhỏ thế này.',
    textEn:
      'The Yun family order sits in your hand. Sell it at market for coin now; deliver it to Bao for a name that carries. Even the great dao begins this small.',
    suggested: [
      { kind: 'buy', itemId: 'warding_talisman' },
      { kind: 'talk', npcId: 'n_merchant_bao' },
      { kind: 'complete_quest', questId: 'q_talisman_order' },
    ],
  },
  {
    id: 'b_herb_debt',
    chapter: 3,
    predicate: 'herbQuestDone',
    titleVi: 'Lời hứa với cụ Mai Hoa',
    titleEn: 'A Promise to Elder Meihua',
    textVi:
      'Cụ Mai Hoa mỉm cười; nụ cười ít răng mà đầy ấm áp. Ba nhánh linh thảo, một lọ thuốc, và lời cảm ơn nặng hơn cả vàng.',
    textEn:
      'She smiles with few teeth and many eyes. Three herbs, one pill, a thanks heavier than gold.',
    suggested: [
      { kind: 'complete_quest', questId: 'q_herb_delivery' },
      { kind: 'gather' },
      { kind: 'sell', itemId: 'spirit_herb' },
    ],
  },
  {
    id: 'b_stowed_away',
    chapter: 3,
    predicate: 'storageUsed',
    titleVi: 'Một góc kho, một tấm lòng',
    titleEn: 'A Corner of the Storehouse',
    textVi:
      'Đồ gửi trong kho vẫn nằm đó, gọn gàng như lời hứa giữ được. Người tu hành cũng cần một nơi để đặt xuống, mới đủ nhẹ mà đi tiếp.',
    textEn:
      'What you stored still waits in order, like a promise kept. A cultivator needs somewhere to set things down before traveling light again.',
    suggested: [
      { kind: 'withdraw', itemId: 'pill_hp', qty: 1 },
      { kind: 'use_item', itemId: 'pill_hp' },
      { kind: 'gather' },
    ],
  },
  {
    id: 'b_sealed_gate',
    chapter: 3,
    predicate: 'caveSeen',
    titleVi: 'Miệng hang thổi hơi lạnh',
    titleEn: 'Cold Breath From the Cave Mouth',
    textVi:
      'Phù văn cũ trên vách đá rung lên khe khẽ. Ẩn sĩ Cốc nói không sai: vào đây thì mang bùa, nếu không hãy mang theo vận may.',
    textEn:
      'Old sigils shiver on the stone. The hermit was right: bring a talisman, or bring luck.',
    suggested: [
      { kind: 'buy', itemId: 'warding_talisman' },
      { kind: 'move', direction: 'north' },
      { kind: 'move', direction: 'west' },
    ],
  },
  {
    id: 'b_first_hunt',
    chapter: 3,
    predicate: 'encounterVictory',
    titleVi: 'Vết thương đầu tiên của giang hồ',
    titleEn: 'The Jianghu\u2019s First Scar',
    textVi:
      'Ngươi lau sạch vũ khí, tay vẫn run nhưng lòng lạ lùng bình tĩnh. Kiếp trước ngươi chết trong im lặng; kiếp này, ít nhất ngươi đã vùng lên.',
    textEn:
      'You wipe the blade clean. Your hand still trembles; your heart is oddly calm. Last life you died in silence — this one, at least, you fought back.',
    suggested: [
      { kind: 'rest' },
      { kind: 'sell', itemId: 'beast_fang' },
      { kind: 'train' },
    ],
  },
  {
    id: 'b_inner_fire',
    chapter: 4,
    predicate: 'stageTwoPlus',
    titleVi: 'Lửa nhỏ trong đan điền',
    titleEn: 'A Small Fire in the Dantian',
    textVi:
      'Quyển bí kíp kỳ quặc dạy ngươi lách qua những chỗ kinh mạch đứt đoạn. Từ đó, linh khí mới chịu nghe lời mà uốn theo ý ngươi.',
    textEn:
      'The crooked manual teaches you to curve around the break. Your qi begins to bend your way.',
    suggested: [
      { kind: 'train' },
      { kind: 'draw_lottery' },
      { kind: 'use_item', itemId: 'pill_qi' },
    ],
  },
  {
    id: 'b_winds_of_trade',
    chapter: 4,
    predicate: 'tradeWinds',
    titleVi: 'Thương đạo cũng là đạo',
    titleEn: 'Trade Is Also a Path',
    textVi:
      'Tiếng chuông chợ, tiếng bàn tính, tiếng cười của kẻ vừa bán được hàng — hóa ra thương đạo cũng có thể dưỡng tâm.',
    textEn:
      'Bell, abacus, a seller\u2019s laughter — all of it nourishes the heart.',
    suggested: [
      { kind: 'sell', itemId: 'spirit_herb' },
      { kind: 'buy', itemId: 'jade_charm' },
      { kind: 'complete_quest', questId: 'q_talisman_order' },
    ],
  },
  {
    id: 'b_gear_ready',
    chapter: 4,
    predicate: 'equippedAdvanced',
    titleVi: 'Vũ khí mới, người cũ hơn',
    titleEn: 'A New Blade, an Older You',
    textVi:
      'Vật trong tay đổi rồi, nhưng cái làm ngươi mạnh lên không phải lưỡi đao — là bao nhiêu lần ngươi chọn đứng dậy.',
    textEn:
      'The steel is new; what makes you stronger was never the blade — it is every time you chose to stand back up.',
    suggested: [
      { kind: 'train' },
      { kind: 'buy', itemId: 'pill_qi' },
      { kind: 'draw_lottery' },
    ],
  },
  // Phase 3 (design review 2026-08): build-gate beat — Bao reads the technique
  // you actually carry. Crooked Circulation wanders off mid-bargain, so the
  // merchant prices the wander: the manual's 2-gold sale cost, spoken aloud.
  {
    id: 'b_crooked_deal',
    chapter: 4,
    predicate: 'knowsCrookedCirculation',
    titleVi: 'Bảo soi đường khí của ngươi',
    titleEn: 'Bao Reads Your Crooked Qi',
    textVi:
      'Bảo nghiêng đầu ngắm ngươi như ngắm một món hàng. “Chu Thiên Cong Queo? Đường khí ngươi cứ lửng lơ giữa trời và sổ sách — mỗi lần mặc cả, ngươi lại ngắm mây. Cứ hai lượng một kèo, ta tính vào giá, đừng trách.”',
    textEn:
      'Bao tilts his head, appraising you like a piece of merchandise. “Crooked Circulation? Your qi keeps drifting between sky and ledger — every time we haggle, you wander off watching clouds. Two gold a deal, I price it in; do not blame me.”',
    suggested: [
      { kind: 'talk', npcId: 'n_merchant_bao' },
      { kind: 'sell', itemId: 'spirit_herb' },
      { kind: 'train' },
    ],
  },
  {
    id: 'b_fortune_drawn',
    chapter: 4,
    predicate: 'lotteryPlayed',
    titleVi: 'Tấm vé và một nụ cười',
    titleEn: 'The Ticket and the Smile',
    textVi:
      'Người ta bảo kẻ phế căn không nên đánh cược với trời. Ngươi quay tấm vé rồi gấp gọn: cược hay không là quyền của ngươi, thắng hay thắng là chuyện của trời.',
    textEn:
      'They say a broken root should never wager with heaven. You fold the ticket away: betting is your right; paying out is heaven\u2019s problem.',
    suggested: [
      { kind: 'draw_lottery' },
      { kind: 'sell', itemId: 'spirit_herb' },
      { kind: 'rest' },
    ],
  },
  {
    id: 'b_last_mile',
    chapter: 5,
    predicate: 'stageThreePlus',
    titleVi: 'Nửa chặng cuối đếm bằng nhịp thở',
    titleEn: 'The Last Stretch Counted in Breaths',
    textVi:
      'Đường cong queo của ngươi đã đi qua ba cảnh giới mà không gãy. Còn lại là khoảng trời chỉ những kẻ biết kiên trì mới nhìn thấy.',
    textEn:
      'Your crooked road has crossed three realms without snapping. What remains is sky only the patient ever see.',
    suggested: [
      { kind: 'train' },
      { kind: 'use_item', itemId: 'marrow_gather_pill' },
      { kind: 'rest' },
    ],
  },
  {
    id: 'b_final_barrier',
    chapter: 5,
    predicate: 'stageFourPlus',
    titleVi: 'Cửa ải cuối cùng',
    titleEn: 'The Final Barrier',
    textVi:
      'Trên đỉnh mây, linh hạc đã chờ từ lâu. Chỉ còn một bước, nhưng bước ấy phải gom đủ cả tĩnh tâm lẫn quyết ý.',
    textEn:
      'On Cloud Peak a crane waits. One more step — a step needing both stillness and motion.',
    suggested: [
      { kind: 'train' },
      { kind: 'rest' },
      { kind: 'complete_quest', questId: 'q_main_sealed_cave' },
    ],
  },
  {
    id: 'b_ascension_night',
    chapter: 5,
    predicate: 'stageFive',
    titleVi: 'Đêm nay trời mở cửa',
    titleEn: 'Tonight Heaven Opens Its Door',
    textVi:
      'Mưa sao nghiêng qua trời đêm. Ngươi ngồi xuống, không còn cần chứng minh điều gì ngoài việc bước tiếp.',
    textEn:
      'Star-rain falls slantwise. You sit down with nothing left to prove except the next step.',
    suggested: [
      { kind: 'train' },
      { kind: 'rest' },
      { kind: 'draw_lottery' },
    ],
  },
]
